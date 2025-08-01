import { BaseRenderer, DataPoints, drawDataPointsRes, XAxisPointsType } from "./base";
import { ChartOptions } from "../types";
import { GlobalConfig } from "../types/config";
import { MountExtra } from "../types/extra";
import { Series } from "../types/series";
import { ChartsUtil } from "../utils";
import { Animation } from '../animation';
import { CanvasGradient } from "../../interface/canvas.type";
import { EventListener } from "../event";

/**
 * 山峰图渲染器
 */
export class MountChartRenderer extends BaseRenderer {
  constructor(opts: Partial<ChartOptions>, events: Record<string, EventListener[]> = {}) {
    super(opts, events);
    this.render();
  }

  protected render(): void {
    let series = this.opts.series;
    let categories: string[] = [];
    series = this.fixPieSeries(series);
    for (let j = 0; j < series.length; j++) {
      if(series[j].show !== false) categories.push(series[j].name!)
    }
    this.opts.categories = categories;
    series = ChartsUtil.fillSeries(series, this.opts);
    const duration = this.opts.animation! ? this.opts.duration! : 0;
    this.animation && this.animation.stop();
    let seriesMA = series;
    /* 过滤掉show=false的series */
    this.opts._series_ = series = ChartsUtil.filterSeries(series);
    //重新计算图表区域
    this.opts.area = new Array(4);
    //复位绘图区域
    for (let j = 0; j < 4; j++) {
      this.opts.area[j] = this.opts.padding![j] * this.opts.pixelRatio!;
    }
    //通过计算三大区域：图例、X轴、Y轴的大小，确定绘图区域
    const calLegendData = this.calculateLegendData(seriesMA, this.opts.chartData);
    const legendHeight = calLegendData.area.wholeHeight;
    const legendWidth = calLegendData.area.wholeWidth;

    switch (this.opts.legend!.position) {
      case 'top':
        this.opts.area[0] += legendHeight;
        break;
      case 'bottom':
        this.opts.area[2] += legendHeight;
        break;
      case 'left':
        this.opts.area[3] += legendWidth;
        break;
      case 'right':
        this.opts.area[1] += legendWidth;
        break;
    }

    const calYAxisData = this.calculateYAxisData(series);
    const yAxisWidth = calYAxisData.yAxisWidth;

    //如果显示Y轴标题
    if (this.opts.yAxis.showTitle) {
      let maxTitleHeight = 0;
      for (let i = 0; i < this.opts.yAxis.data!.length; i++) {
        maxTitleHeight = Math.max(maxTitleHeight, this.opts.yAxis.data![i].titleFontSize ? (this.opts.yAxis.data![i].titleFontSize! * this.opts.pixelRatio!) : this.opts.fontSize!)
      }
      this.opts.area[0] += maxTitleHeight;
    }

    let rightIndex = 0;
    let leftIndex = 0;
    //计算主绘图区域左右位置
    for (let i = 0; i < yAxisWidth.length; i++) {
      if (yAxisWidth[i].position == 'left') {
        if (leftIndex > 0) {
          this.opts.area[3] += yAxisWidth[i].width + this.opts.yAxis.padding! * this.opts.pixelRatio!;
        } else {
          this.opts.area[3] += yAxisWidth[i].width;
        }
        leftIndex += 1;
      } else if (yAxisWidth[i].position == 'right') {
        if (rightIndex > 0) {
          this.opts.area[1] += yAxisWidth[i].width + this.opts.yAxis.padding! * this.opts.pixelRatio!;
        } else {
          this.opts.area[1] += yAxisWidth[i].width;
        }
        rightIndex += 1;
      }
    }

    this.opts.chartData.yAxisData = calYAxisData;
    if (this.opts.categories && this.opts.categories.length) {
      this.opts.chartData.xAxisData = this.getXAxisPoints(this.opts.categories as string[]);
      let calCategoriesData = this.calculateCategoriesData(this.opts.categories as string[]);
      let xAxisHeight = calCategoriesData.xAxisHeight
      let angle = calCategoriesData.angle;

      GlobalConfig.xAxisHeight = xAxisHeight;
      this.opts._xAxisTextAngle_ = angle;
      this.opts.area[2] += xAxisHeight;
      this.opts.chartData.categoriesData = calCategoriesData;
    } else {
      this.opts.chartData.xAxisData = {
        xAxisPoints: []
      };
    }

    //计算右对齐偏移距离
    if (this.opts.enableScroll && this.opts.xAxis.scrollAlign == 'right' && this.opts._scrollDistance_ === undefined) {
      let offsetLeft = 0
      let xAxisPoints: number[] = this.opts.chartData.xAxisData.xAxisPoints
      let startX: number = this.opts.chartData.xAxisData.startX
      let endX: number = this.opts.chartData.xAxisData.endX
      let eachSpacing: number = this.opts.chartData.xAxisData.eachSpacing
      let totalWidth = eachSpacing * (xAxisPoints.length - 1);
      let screenWidth = endX - startX;
      offsetLeft = screenWidth - totalWidth;
      this.scrollOption["currentOffset"] = offsetLeft;
      this.scrollOption["startTouchX"] = offsetLeft;
      this.scrollOption["distance"] = 0;
      this.scrollOption["lastMoveTime"] = 0;
      this.opts._scrollDistance_ = offsetLeft;
    }

    this.animation = new Animation({
      timing: this.opts.timing!,
      duration: duration,
      onProcess: (process: number) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.opts.rotate) {
          this.contextRotate();
        }
        this.drawYAxisGrid(this.opts.categories as string[]);
        this.drawXAxis(this.opts.categories as string[]);
        let _drawMountDataPoints = this.drawMountDataPoints(series, process),
          xAxisPoints = _drawMountDataPoints.xAxisPoints,
          calPoints = _drawMountDataPoints.calPoints,
          eachSpacing = _drawMountDataPoints.eachSpacing;
        this.opts.chartData.xAxisPoints = xAxisPoints;
        this.opts.chartData.calPoints = calPoints;
        this.opts.chartData.eachSpacing = eachSpacing;
        this.drawYAxis();
        if (this.opts.enableMarkLine !== false && process === 1) {
          this.drawMarkLine();
        }
        this.drawLegend(this.opts.chartData);
        this.drawToolTipBridge(process);
        this.drawCanvas();
      },
      onFinish: () => {
        this.event.emit('renderComplete', this.opts);
      }
    });

  }

  private drawMountDataPoints(series: Series[], process: number = 1) {
    let xAxisData: XAxisPointsType = this.opts.chartData.xAxisData
    let xAxisPoints = xAxisData.xAxisPoints;
    let eachSpacing = xAxisData.eachSpacing;
    let mountOption = ChartsUtil.objectAssign({} as MountExtra, {
      type: 'mount',
      widthRatio: 1,
      borderWidth: 1,
      barBorderCircle: false,
      barBorderRadius: [],
      linearType: 'none',
      linearOpacity: 1,
      customColor: [],
      colorStop: 0,
    }, this.opts.extra.mount!);
    mountOption.widthRatio = mountOption.widthRatio <= 0 ? 0 : mountOption.widthRatio;
    mountOption.widthRatio = mountOption.widthRatio >= 2 ? 2 : mountOption.widthRatio;
    let calPoints = [];
    this.context.save();
    let leftNum = -2;
    let rightNum = xAxisPoints.length + 2;
    if (this.opts._scrollDistance_ && this.opts._scrollDistance_ !== 0 && this.opts.enableScroll === true) {
      this.context.translate(this.opts._scrollDistance_, 0);
      leftNum = Math.floor(-(this.opts._scrollDistance_ as number) / eachSpacing) - 2;
      rightNum = leftNum + this.opts.xAxis.itemCount! + 4;
    }
    mountOption.customColor = ChartsUtil.fillCustomColor(mountOption.linearType, mountOption.customColor, series);
    let ranges: number[], minRange: number, maxRange: number;
    ranges = [].concat(this.opts.chartData.yAxisData.ranges[0]);
    minRange = ranges.pop()!;
    maxRange = ranges.shift()!;

    // 计算0轴坐标
    let spacingValid = this.opts.height - this.opts.area[0] - this.opts.area[2];
    let zeroHeight = spacingValid * (0 - minRange) / (maxRange - minRange);
    let zeroPoints = this.opts.height - Math.round(zeroHeight) - this.opts.area[2];

    let points: Array<DataPoints | null> = this.getMountDataPoints(series, minRange, maxRange, xAxisPoints, eachSpacing, mountOption, process);

    switch (mountOption.type) {
      case 'mount':
        for (let i = 0; i < points.length; i++) {
          let item = points[i];
          if (item !== null && i > leftNum && i < rightNum) {
            let startX = item.x - eachSpacing*mountOption.widthRatio/2;
            let height = this.opts.height - item.y - this.opts.area[2];
            this.context.beginPath();
            let fillColor: CanvasGradient|string = item.color || series[i].color!
            let strokeColor = item.color || series[i].color!
            if (mountOption.linearType !== 'none') {
              let grd = this.context.createLinearGradient(startX, item.y, startX, zeroPoints);
              //透明渐变
              if (mountOption.linearType == 'opacity') {
                grd.addColorStop(0, ChartsUtil.hexToRgb(fillColor, mountOption.linearOpacity));
                grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
              } else {
                grd.addColorStop(0, ChartsUtil.hexToRgb(mountOption.customColor[series[i].linearIndex!], mountOption.linearOpacity));
                grd.addColorStop(mountOption.colorStop, ChartsUtil.hexToRgb(mountOption.customColor[series[i].linearIndex!],mountOption.linearOpacity));
                grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
              }
              fillColor = grd
            }
            this.context.moveTo(startX, zeroPoints);
            this.context.bezierCurveTo(item.x - (item.width!)/4, zeroPoints, item.x - (item.width!)/4, item.y, item.x, item.y);
            this.context.bezierCurveTo(item.x + (item.width!)/4, item.y, item.x + (item.width!)/4, zeroPoints, startX + (item.width!), zeroPoints);
            this.setStrokeStyle(strokeColor);
            this.setFillStyle(fillColor);
            if(mountOption.borderWidth > 0){
              this.setLineWidth(mountOption.borderWidth * this.opts.pixelRatio!);
              this.context.stroke();
            }
            this.context.fill();
          }
        };
        break;
      case 'sharp':
        for (let i = 0; i < points.length; i++) {
          let item = points[i];
          if (item !== null && i > leftNum && i < rightNum) {
            let startX = item.x - eachSpacing*mountOption.widthRatio/2;
            let height = this.opts.height - item.y - this.opts.area[2];
            this.context.beginPath();
            let fillColor: CanvasGradient|string = item.color || series[i].color!
            let strokeColor = item.color || series[i].color!
            if (mountOption.linearType !== 'none') {
              let grd = this.context.createLinearGradient(startX, item.y, startX, zeroPoints);
              //透明渐变
              if (mountOption.linearType == 'opacity') {
                grd.addColorStop(0, ChartsUtil.hexToRgb(fillColor, mountOption.linearOpacity));
                grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
              } else {
                grd.addColorStop(0, ChartsUtil.hexToRgb(mountOption.customColor[series[i].linearIndex!], mountOption.linearOpacity));
                grd.addColorStop(mountOption.colorStop, ChartsUtil.hexToRgb(mountOption.customColor[series[i].linearIndex!],mountOption.linearOpacity));
                grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
              }
              fillColor = grd
            }
            this.context.moveTo(startX, zeroPoints);
            this.context.quadraticCurveTo(item.x - 0, zeroPoints - height/4, item.x, item.y);
            this.context.quadraticCurveTo(item.x + 0, zeroPoints - height/4, startX + item.width!, zeroPoints)
            this.setStrokeStyle(strokeColor);
            this.setFillStyle(fillColor);
            if(mountOption.borderWidth > 0){
              this.setLineWidth(mountOption.borderWidth * this.opts.pixelRatio!);
              this.context.stroke();
            }
            this.context.fill();
          }
        };
        break;
      case 'bar':
        for (let i = 0; i < points.length; i++) {
          let item = points[i];
          if (item !== null && i > leftNum && i < rightNum) {
            let startX = item.x - eachSpacing*mountOption.widthRatio/2;
            let height = this.opts.height - item.y - this.opts.area[2];
            this.context.beginPath();
            let fillColor: CanvasGradient|string = item.color || series[i].color!
            let strokeColor = item.color || series[i].color!
            if (mountOption.linearType !== 'none') {
              let grd = this.context.createLinearGradient(startX, item.y, startX, zeroPoints);
              //透明渐变
              if (mountOption.linearType == 'opacity') {
                grd.addColorStop(0, ChartsUtil.hexToRgb(fillColor, mountOption.linearOpacity));
                grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
              } else {
                grd.addColorStop(0, ChartsUtil.hexToRgb(mountOption.customColor[series[i].linearIndex!], mountOption.linearOpacity));
                grd.addColorStop(mountOption.colorStop, ChartsUtil.hexToRgb(mountOption.customColor[series[i].linearIndex!],mountOption.linearOpacity));
                grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
              }
              fillColor = grd
            }
            // 圆角边框
            if ((mountOption.barBorderRadius && mountOption.barBorderRadius.length === 4) || mountOption.barBorderCircle === true) {
              const left = startX;
              const top = item.y > zeroPoints ? zeroPoints : item.y;
              const width = item.width!;
              const height = Math.abs(zeroPoints - item.y);
              if (mountOption.barBorderCircle) {
                mountOption.barBorderRadius = [width / 2, width / 2, 0, 0];
              }
              if(item.y > zeroPoints){
                mountOption.barBorderRadius = [0, 0,width / 2, width / 2];
              }
              let r0 = mountOption.barBorderRadius[0];
              let r1 = mountOption.barBorderRadius[1];
              let r2 = mountOption.barBorderRadius[2];
              let r3 = mountOption.barBorderRadius[3];
              let minRadius = Math.min(width/2,height/2);
              r0 = r0 > minRadius ? minRadius : r0;
              r1 = r1 > minRadius ? minRadius : r1;
              r2 = r2 > minRadius ? minRadius : r2;
              r3 = r3 > minRadius ? minRadius : r3;
              r0 = r0 < 0 ? 0 : r0;
              r1 = r1 < 0 ? 0 : r1;
              r2 = r2 < 0 ? 0 : r2;
              r3 = r3 < 0 ? 0 : r3;
              this.context.arc(left + r0, top + r0, r0, -Math.PI, -Math.PI / 2);
              this.context.arc(left + width - r1, top + r1, r1, -Math.PI / 2, 0);
              this.context.arc(left + width - r2, top + height - r2, r2, 0, Math.PI / 2);
              this.context.arc(left + r3, top + height - r3, r3, Math.PI / 2, Math.PI);
            } else {
              this.context.moveTo(startX, item.y);
              this.context.lineTo(startX + item.width!, item.y);
              this.context.lineTo(startX + item.width!, zeroPoints);
              this.context.lineTo(startX, zeroPoints);
              this.context.lineTo(startX, item.y);
            }
            this.setStrokeStyle(strokeColor);
            this.setFillStyle(fillColor);
            if(mountOption.borderWidth > 0){
              this.setLineWidth(mountOption.borderWidth * this.opts.pixelRatio!);
              this.context.closePath();
              this.context.stroke();
            }
            this.context.fill();
          }
        };
        break;
      case 'triangle':
        for (let i = 0; i < points.length; i++) {
          let item = points[i];
          if (item !== null && i > leftNum && i < rightNum) {
            let startX = item.x - eachSpacing * mountOption.widthRatio / 2;
            let height = this.opts.height - item.y - this.opts.area[2];
            this.context.beginPath();
            let fillColor: CanvasGradient|string = item.color || series[i].color!
            let strokeColor = item.color || series[i].color!
            if (mountOption.linearType !== 'none') {
              let grd = this.context.createLinearGradient(startX, item.y, startX, zeroPoints);
              //透明渐变
              if (mountOption.linearType == 'opacity') {
                grd.addColorStop(0, ChartsUtil.hexToRgb(fillColor, mountOption.linearOpacity));
                grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
              } else {
                grd.addColorStop(0, ChartsUtil.hexToRgb(mountOption.customColor[series[i].linearIndex!], mountOption.linearOpacity));
                grd.addColorStop(mountOption.colorStop, ChartsUtil.hexToRgb(mountOption.customColor[series[i].linearIndex!],mountOption.linearOpacity));
                grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
              }
              fillColor = grd
            }
            this.context.moveTo(startX, zeroPoints);
            this.context.lineTo(item.x, item.y);
            this.context.lineTo(startX + item.width!, zeroPoints);
            this.setStrokeStyle(strokeColor);
            this.setFillStyle(fillColor);
            if(mountOption.borderWidth > 0){
              this.setLineWidth(mountOption.borderWidth * this.opts.pixelRatio!);
              this.context.stroke();
            }
            this.context.fill();
          }
        };
        break;
    }

    if (this.opts.dataLabel !== false && process === 1) {
      let ranges: number[], minRange: number, maxRange: number;
      ranges = [].concat(this.opts.chartData.yAxisData.ranges[0]);
      minRange = ranges.pop()!;
      maxRange = ranges.shift()!;
      points = this.getMountDataPoints(series, minRange, maxRange, xAxisPoints, eachSpacing, mountOption, process);
      this.drawMountPointText(points, series, zeroPoints);
    }
    this.context.restore();

    return {
      xAxisPoints: xAxisPoints,
      calPoints: points,
      eachSpacing: eachSpacing
    } as drawDataPointsRes;
  }

  private getMountDataPoints(series: Series[], minRange: number, maxRange: number, xAxisPoints: number[], eachSpacing: number, mountOption: MountExtra, process: number) {
    let points: Array<DataPoints|null> = [];
    let validHeight = this.opts.height - this.opts.area[0] - this.opts.area[2];
    let validWidth = this.opts.width - this.opts.area[1] - this.opts.area[3];
    let mountWidth = eachSpacing * mountOption.widthRatio;
    series.forEach((item: Series, index) => {
      if (item === null) {
        points.push(null);
      } else {
        let point: DataPoints = {
          color: item.color!,
          x: xAxisPoints[index] + (eachSpacing / 2),
          y: 0
        };
        let value: number = item.data;
        let height = validHeight * (value * process - minRange) / (maxRange - minRange);
        point.y = this.opts.height - height - this.opts.area[2];
        point.value = value;
        point.width = mountWidth;
        points.push(point);
      }
    });
    return points;
  }

  private drawMountPointText(points: Array<DataPoints|null>, series: Series[], zeroPoints: number) {
    // 绘制数据文案
    //let data = series.data;
    let textOffset = 0;
    let Position = this.opts.extra.mount!.labelPosition!;
    points.forEach((item, index) => {
      if (item !== null) {
        this.context.beginPath();
        let fontSize = series[index].textSize ? series[index].textSize! * this.opts.pixelRatio! : this.opts.fontSize!;
        this.setFontSize(fontSize);
        this.setFillStyle(series[index].textColor || this.opts.fontColor!);
        let value = item.value!
        let formatVal = series[index].formatter ? series[index].formatter!(value,index,series[index],this.opts) : value;
        this.setTextAlign('center');
        let startY = item.y - 4 * (this.opts.pixelRatio!) + textOffset * this.opts.pixelRatio!;
        if(item.y > zeroPoints){
          startY = item.y + textOffset * (this.opts.pixelRatio!) + fontSize;
        }
        this.context.fillText(String(formatVal), item.x, startY);
        this.context.closePath();
        this.context.stroke();
        this.setTextAlign('left');
      }
    });
  }

}
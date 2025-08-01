import { ChartOptions } from "../types";
import { GlobalConfig } from "../types/config";
import { ChartsUtil } from "../utils";
import { BaseRenderer, DataPoints, drawDataPointsRes } from "./base";
import { Animation } from '../animation';
import { Series } from "../types/series";
import { MixAreaExtra, MixColumnExtra, MixLineExtra } from "../types/extra";
import { CanvasGradient } from "../../interface";
import { EventListener } from "../event";

/**
 * 混合图渲染器
 */
export class MixChartRenderer extends BaseRenderer {
  constructor(opts: Partial<ChartOptions>, events: Record<string, EventListener[]> = {}) {
    super(opts, events);
    this.render();
  }

  protected render(): void {
    let series = ChartsUtil.fillSeries(this.opts.series, this.opts);
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
    if (1/*this.opts.categories && this.opts.categories.length*/) {
      this.opts.chartData.xAxisData = this.getXAxisPoints(this.opts.categories as string[]);
      let calCategoriesData = this.calculateCategoriesData(this.opts.categories as string[]);
      let xAxisHeight = calCategoriesData.xAxisHeight
      let angle = calCategoriesData.angle;

      GlobalConfig.xAxisHeight = xAxisHeight;
      this.opts._xAxisTextAngle_ = angle;
      this.opts.area[2] += xAxisHeight;
      this.opts.chartData.categoriesData = calCategoriesData;
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
      onProcess: (process) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.opts.rotate) {
          this.contextRotate();
        }
        this.drawYAxisGrid(this.opts.categories as string[]);
        this.drawXAxis(this.opts.categories as string[]);
        let _drawMixDataPoints = this.drawMixDataPoints(series, process),
          xAxisPoints = _drawMixDataPoints.xAxisPoints,
          calPoints = _drawMixDataPoints.calPoints,
          eachSpacing = _drawMixDataPoints.eachSpacing;
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

  private drawMixDataPoints(series: Series[], process: number = 1) {
    let xAxisData = this.opts.chartData.xAxisData,
      xAxisPoints = xAxisData.xAxisPoints,
      eachSpacing = xAxisData.eachSpacing;
    let columnOption = ChartsUtil.objectAssign({} as MixColumnExtra, {
      width: eachSpacing / 2,
      barBorderCircle: false,
      barBorderRadius: [0,0,0,0],
      seriesGap: 2,
      linearType: 'none',
      linearOpacity: 1,
      customColor: [],
      colorStop: 0,
    }, this.opts.extra.mix?.column);
    let areaOption = ChartsUtil.objectAssign({} as MixAreaExtra, {
      opacity: 0.2,
      gradient: false
    }, this.opts.extra.mix?.area);
    let lineOption = ChartsUtil.objectAssign({} as MixLineExtra, {
      width: 2
    }, this.opts.extra.mix?.line);
    let endY = this.opts.height - this.opts.area[2];
    let calPoints: Array<Array<DataPoints|null>> = [];
    let columnIndex = 0;
    let columnLength = 0;
    series.forEach((eachSeries, seriesIndex) => {
      if (eachSeries.type == 'column') {
        columnLength += 1;
      }
    });
    this.context.save();
    let leftNum = -2;
    let rightNum = xAxisPoints.length + 2;
    let leftSpace = 0;
    let rightSpace = this.opts.width + eachSpacing;
    if (this.opts._scrollDistance_ && this.opts._scrollDistance_ !== 0 && this.opts.enableScroll === true) {
      this.context.translate(this.opts._scrollDistance_, 0);
      leftNum = Math.floor(-this.opts._scrollDistance_ / eachSpacing) - 2;
      rightNum = leftNum + (this.opts.xAxis.itemCount!) + 4;
      leftSpace = -this.opts._scrollDistance_ - eachSpacing * 2 + this.opts.area[3];
      rightSpace = leftSpace + ((this.opts.xAxis.itemCount!) + 4) * eachSpacing;
    }
    columnOption.customColor = ChartsUtil.fillCustomColor(columnOption.linearType, columnOption.customColor, series);
    series.forEach((eachSeries, seriesIndex) => {
      let ranges: number[], minRange: number, maxRange: number;
      ranges = [].concat(this.opts.chartData.yAxisData.ranges[eachSeries.index]);
      minRange = ranges.pop()!;
      maxRange = ranges.shift()!;
      let data = eachSeries.data;
      let points = this.getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, process);
      calPoints.push(points);
      // 绘制柱状数据图
      if (eachSeries.type == 'column') {
        points = this.fixColumnData(points, eachSpacing, columnLength, columnIndex);
        for (let i = 0; i < points.length; i++) {
          let item = points[i];
          if (item !== null && i > leftNum && i < rightNum) {
            let startX = item.x - (item.width!) / 2;
            let height = this.opts.height - item.y - this.opts.area[2];
            this.context.beginPath();
            let fillColor: string|CanvasGradient = item.color || eachSeries.color!
            let strokeColor = item.color || eachSeries.color!
            if (columnOption.linearType !== 'none') {
              let grd = this.context.createLinearGradient(startX, item.y, startX, this.opts.height! - this.opts.area[2]);
              //透明渐变
              if (columnOption.linearType == 'opacity') {
                grd.addColorStop(0, ChartsUtil.hexToRgb(fillColor, columnOption.linearOpacity));
                grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
              } else {
                grd.addColorStop(0, ChartsUtil.hexToRgb(columnOption.customColor[eachSeries.linearIndex!], columnOption.linearOpacity));
                grd.addColorStop(columnOption.colorStop, ChartsUtil.hexToRgb(columnOption.customColor[eachSeries.linearIndex!], columnOption.linearOpacity));
                grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
              }
              fillColor = grd
            }
            // 圆角边框
            if ((columnOption.barBorderRadius && columnOption.barBorderRadius.length === 4) || columnOption.barBorderCircle) {
              const left = startX;
              const top = item.y;
              const width = item.width!;
              const height = this.opts.height - this.opts.area[2] - item.y;
              if (columnOption.barBorderCircle) {
                columnOption.barBorderRadius = [width / 2, width / 2, 0, 0];
              }
              let r0 = columnOption.barBorderRadius[0];
              let r1 = columnOption.barBorderRadius[1];
              let r2 = columnOption.barBorderRadius[2];
              let r3 = columnOption.barBorderRadius[3];

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
              this.context.lineTo(startX + (item.width!), item.y);
              this.context.lineTo(startX + (item.width!), this.opts.height - this.opts.area[2]);
              this.context.lineTo(startX, this.opts.height - this.opts.area[2]);
              this.context.lineTo(startX, item.y);
              this.setLineWidth(1)
              this.setStrokeStyle(strokeColor);
            }
            this.setFillStyle(fillColor);
            this.context.closePath();
            this.context.fill();
          }
        }
        columnIndex += 1;
      }
      //绘制区域图数据
      if (eachSeries.type == 'area') {
        let splitPointList = this.splitPoints(points,eachSeries);
        for (let i = 0; i < splitPointList.length; i++) {
          let points = splitPointList[i];
          // 绘制区域数据
          this.context.beginPath();
          this.setStrokeStyle(eachSeries.color!);
          this.setStrokeStyle(ChartsUtil.hexToRgb(eachSeries.color!, areaOption.opacity));
          if (areaOption.gradient) {
            let gradient = this.context.createLinearGradient(0, this.opts.area[0], 0, this.opts.height - this.opts.area[2]);
            gradient.addColorStop(0, ChartsUtil.hexToRgb(eachSeries.color!, areaOption.opacity));
            gradient.addColorStop(1.0, ChartsUtil.hexToRgb("#FFFFFF", 0.1));
            this.setFillStyle(gradient);
          } else {
            this.setFillStyle(ChartsUtil.hexToRgb(eachSeries.color!, areaOption.opacity));
          }
          this.setLineWidth(2 * this.opts.pixelRatio!);
          if (points.length > 1) {
            let firstPoint = points[0];
            let lastPoint = points[points.length - 1];
            this.context.moveTo(firstPoint.x, firstPoint.y);
            let startPoint = 0;
            if (eachSeries.style === 'curve') {
              for (let j = 0; j < points.length; j++) {
                let item = points[j];
                if (startPoint == 0 && item.x > leftSpace) {
                  this.context.moveTo(item.x, item.y);
                  startPoint = 1;
                }
                if (j > 0 && item.x > leftSpace && item.x < rightSpace) {
                  let ctrlPoint = this.createCurveControlPoints(points, j - 1);
                  this.context.bezierCurveTo(ctrlPoint.ctrA.x, ctrlPoint.ctrA.y, ctrlPoint.ctrB.x, ctrlPoint.ctrB.y, item.x, item.y);
                }
              };
            } else {
              for (let j = 0; j < points.length; j++) {
                let item = points[j];
                if (startPoint == 0 && item.x > leftSpace) {
                  this.context.moveTo(item.x, item.y);
                  startPoint = 1;
                }
                if (j > 0 && item.x > leftSpace && item.x < rightSpace) {
                  this.context.lineTo(item.x, item.y);
                }
              };
            }
            this.context.lineTo(lastPoint.x, endY);
            this.context.lineTo(firstPoint.x, endY);
            this.context.lineTo(firstPoint.x, firstPoint.y);
          } else {
            let item = points[0];
            this.context.moveTo(item.x - eachSpacing / 2, item.y);
            // context.lineTo(item.x + eachSpacing / 2, item.y);
            // context.lineTo(item.x + eachSpacing / 2, endY);
            // context.lineTo(item.x - eachSpacing / 2, endY);
            // context.moveTo(item.x - eachSpacing / 2, item.y);
          }
          this.context.closePath();
          this.context.fill();
        }
      }
      // 绘制折线数据图
      if (eachSeries.type == 'line') {
        let splitPointList = this.splitPoints(points,eachSeries);
        splitPointList.forEach((points, index) => {
          if (eachSeries.lineType == 'dash') {
            let dashLength = eachSeries.dashLength ? eachSeries.dashLength : 8;
            dashLength *= this.opts.pixelRatio!;
            this.setLineDash([dashLength, dashLength]);
          }
          this.context.beginPath();
          this.setStrokeStyle(eachSeries.color!);
          this.setLineWidth(lineOption.width * this.opts.pixelRatio!);
          if (points.length === 1) {
            this.context.moveTo(points[0].x, points[0].y);
            // context.arc(points[0].x, points[0].y, 1, 0, 2 * Math.PI);
          } else {
            this.context.moveTo(points[0].x, points[0].y);
            let startPoint = 0;
            if (eachSeries.style == 'curve') {
              for (let j = 0; j < points.length; j++) {
                let item = points[j];
                if (startPoint == 0 && item.x > leftSpace) {
                  this.context.moveTo(item.x, item.y);
                  startPoint = 1;
                }
                if (j > 0 && item.x > leftSpace && item.x < rightSpace) {
                  let ctrlPoint = this.createCurveControlPoints(points, j - 1);
                  this.context.bezierCurveTo(ctrlPoint.ctrA.x, ctrlPoint.ctrA.y, ctrlPoint.ctrB.x, ctrlPoint.ctrB.y,
                    item.x, item.y);
                }
              }
            } else {
              for (let j = 0; j < points.length; j++) {
                let item = points[j];
                if (startPoint == 0 && item.x > leftSpace) {
                  this.context.moveTo(item.x, item.y);
                  startPoint = 1;
                }
                if (j > 0 && item.x > leftSpace && item.x < rightSpace) {
                  this.context.lineTo(item.x, item.y);
                }
              }
            }
            this.context.moveTo(points[0].x, points[0].y);
          }
          this.context.stroke();
          this.setLineDash([]);
        });
      }
      // 绘制点数据图
      if (eachSeries.type == 'point') {
        eachSeries.addPoint = true;
      }
      if (eachSeries.addPoint == true && eachSeries.type !== 'column') {
        this.drawPointShape(points, eachSeries.color!, eachSeries.pointShape!);
      }
    });
    if (this.opts.dataLabel !== false && process === 1) {
      let columnIndex = 0;
      series.forEach((eachSeries, seriesIndex) => {
        let ranges: number[], minRange: number, maxRange: number;
        ranges = [].concat(this.opts.chartData.yAxisData.ranges[eachSeries.index]);
        minRange = ranges.pop()!;
        maxRange = ranges.shift()!;
        let data = eachSeries.data;
        let points = this.getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, process);
        if (eachSeries.type !== 'column') {
          this.drawPointText(points, eachSeries);
        } else {
          points = this.fixColumnData(points, eachSpacing, columnLength, columnIndex);
          this.drawPointText(points, eachSeries);
          columnIndex += 1;
        }
      });
    }
    this.context.restore();
    return {
      xAxisPoints: xAxisPoints,
      calPoints: calPoints,
      eachSpacing: eachSpacing,
    } as drawDataPointsRes;
  }
}
import { BaseRenderer, XAxisPointsType, drawDataPointsRes, DataPoints } from "./base";
import { ChartOptions } from "../types";
import { SeriesDataItem, Series, ValueAndColorData } from '../types/series';
import { ChartsUtil } from '../utils';
import { GlobalConfig } from "../types/config";
import { Animation } from '../animation';
import { ColumnExtra } from "../types/extra";
import { CanvasGradient } from "../../interface/canvas.type";
import { EventListener } from "../event";

/**
 * 柱状图渲染器
 */
export class ColumnChartRenderer extends BaseRenderer {
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
      onProcess: (process) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.opts.rotate) {
          this.contextRotate();
        }
        this.drawYAxisGrid(this.opts.categories as string[]);
        this.drawXAxis(this.opts.categories as string[]);
        let _drawColumnDataPoints = this.drawColumnDataPoints(series, process),
          xAxisPoints = _drawColumnDataPoints.xAxisPoints,
          calPoints = _drawColumnDataPoints.calPoints,
          eachSpacing = _drawColumnDataPoints.eachSpacing;
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

  private drawToolTipSplitArea(offsetX: number, columnOption: ColumnExtra, eachSpacing: number) {
    let activeWidth = eachSpacing;
    let startY: number = this.opts.area[0];
    let endY: number = this.opts.height - this.opts.area[2];
    this.context.beginPath();
    this.setFillStyle(ChartsUtil.hexToRgb(columnOption.activeBgColor, columnOption.activeBgOpacity));
    this.context.rect(offsetX - activeWidth / 2, startY, activeWidth, endY - startY);
    this.context.closePath();
    this.context.fill();
    this.setFillStyle("#FFFFFF");
  }

  private getColumnDataPoints(data: SeriesDataItem[], minRange: number, maxRange: number, xAxisPoints: number[], eachSpacing: number, process: number = 1) {
    let points: Array<DataPoints|null> = [];
    let validHeight = this.opts.height - this.opts.area[0] - this.opts.area[2];
    let validWidth = this.opts.width - this.opts.area[1] - this.opts.area[3];
    data.forEach((item, index) => {
      if (item === null) {
        points.push(null);
      } else {
        let point: DataPoints = {
          color: "",  // item.color ???
          x: xAxisPoints[index],
          y: 0
        };
        let value: number | number[] | ValueAndColorData | Record<string, number> = item;
        if (typeof item === 'object' && item !== null) {
          if (item.constructor.toString().indexOf('Array') > -1) {
            let xranges: number[], xminRange: number, xmaxRange: number;
            xranges = [].concat(this.opts.chartData.xAxisData.ranges);
            xminRange = xranges.shift()!;
            xmaxRange = xranges.pop()!;
            value = (item as number[])[1];
            point.x = this.opts.area[3] + validWidth * ((item as number[])[0] - xminRange) / (xmaxRange - xminRange);
          } else {
            value = (item as ValueAndColorData).value;
            point.color = (item as ValueAndColorData).color
          }
        }
        point.x += eachSpacing / 2;
        let height = validHeight * (Number(value) * process - minRange) / (maxRange - minRange);
        point.y = this.opts.height - height - this.opts.area[2];
        points.push(point);
      }
    });
    return points;
  }

  private getStackDataPoints(data: SeriesDataItem[], minRange: number, maxRange: number, xAxisPoints: number[], eachSpacing: number, seriesIndex: number, stackSeries: Series[], process: number = 1) {
    let points: Array<DataPoints|null> = [];
    let validHeight = this.opts.height - this.opts.area[0] - this.opts.area[2];
    data.forEach((item, index) => {
      if (item === null) {
        points.push(null);
      } else {
        let point: DataPoints = {
          color: "",  // item.color ???
          x: xAxisPoints[index] + Math.round(eachSpacing / 2),
          y: 0
        };
        let height = 0
        let height0 = 0
        if (seriesIndex > 0) {
          let value = 0;
          for (let i = 0; i <= seriesIndex; i++) {
            const data = stackSeries[i].data as SeriesDataItem[]
            value += data[index] as number;
          }
          let value0 = value - (item as number);
          height = validHeight * (value - minRange) / (maxRange - minRange);
          height0 = validHeight * (value0 - minRange) / (maxRange - minRange);
        } else {
          let value = item;
          if (typeof item === 'object' && item !== null) {
            value = (item as ValueAndColorData).value;
            point.color = (item as ValueAndColorData).color
          }
          height = validHeight * (Number(value) - minRange) / (maxRange - minRange);
          height0 = 0;
        }
        let heightc = height0;
        height *= process;
        heightc *= process;
        point.y = this.opts.height - Math.round(height) - this.opts.area[2];
        point.y0 = this.opts.height - Math.round(heightc) - this.opts.area[2];
        points.push(point);
      }
    });
    return points;
  }

  private fixColumnStackData(points: Array<DataPoints|null>, eachSpacing: number) {
    let categoryGap = this.opts.extra.column!.categoryGap ? (this.opts.extra.column!.categoryGap * this.opts.pixelRatio!) : 0;
    return points.map((item, index) => {
      if (item === null) {
        return null;
      }
      item.width = Math.ceil(eachSpacing - 2 * categoryGap);
      if (this.opts.extra.column && this.opts.extra.column.width && +this.opts.extra.column.width > 0) {
        item.width = Math.min(item.width, +this.opts.extra.column.width * this.opts.pixelRatio!);
      }
      if (item.width <= 0) {
        item.width = 1;
      }
      return item;
    });
  }

  private fixColumnMeterData(points: Array<DataPoints|null>, eachSpacing: number, seriesIndex: number, border: number) {
    let categoryGap = this.opts.extra.column?.categoryGap ? (this.opts.extra.column.categoryGap! * this.opts.pixelRatio!) : 0;
    return points.map((item) => {
      if (item === null) {
        return null;
      }
      item.width = eachSpacing - 2 * categoryGap;
      if (this.opts.extra.column && this.opts.extra.column.width && +this.opts.extra.column.width > 0) {
        item.width = Math.min(item.width, +this.opts.extra.column.width * this.opts.pixelRatio!);
      }
      if (seriesIndex > 0) {
        item.width -= border;
      }
      return item;
    });
  }

  private drawColumnPointText(points: Array<DataPoints|null>, series: Series) {
    // 绘制数据文案
    let data = series.data as SeriesDataItem[];
    let textOffset = series.textOffset ? series.textOffset : 0;
    let Position = this.opts.extra.column?.labelPosition ?? 'outside';
    points.forEach((item, index) => {
      if (item !== null) {
        this.context.beginPath();
        let fontSize = series.textSize ? (series.textSize * this.opts.pixelRatio!) : this.opts.fontSize!;
        this.setFontSize(fontSize);
        this.setFillStyle(series.textColor || this.opts.fontColor!);
        let value = data[index]
        if (typeof data[index] === 'object' && data[index] !== null) {
          if (data[index]!.constructor.toString().indexOf('Array') > -1) {
            const _tmp = data[index] as number[]
            value = _tmp[1];
          } else {
            const _tmp = data[index] as ValueAndColorData
            value = _tmp.value
          }
        }
        let formatVal = series.formatter ? series.formatter(Number(value),index,series,this.opts) : value;
        this.setTextAlign('center');
        let startY = item.y - 4 * this.opts.pixelRatio! + textOffset * this.opts.pixelRatio!;
        if(item.y > series.zeroPoints){
          startY = item.y + textOffset * this.opts.pixelRatio! + fontSize;
        }
        if(Position == 'insideTop'){
          startY = item.y + fontSize + textOffset * this.opts.pixelRatio!;
          if(item.y > series.zeroPoints){
            startY = item.y - textOffset * this.opts.pixelRatio! - 4 * this.opts.pixelRatio!;
          }
        }
        if(Position == 'center'){
          startY = item.y + textOffset * this.opts.pixelRatio! + (this.opts.height - this.opts.area[2] - item.y + fontSize)/2;
          if(series.zeroPoints < this.opts.height - this.opts.area[2]){
            startY = item.y + textOffset * this.opts.pixelRatio! + (series.zeroPoints - item.y + fontSize)/2;
          }
          if(item.y > series.zeroPoints){
            startY = item.y - textOffset * this.opts.pixelRatio! - (item.y - series.zeroPoints - fontSize)/2;
          }
          if(this.opts.extra.column!.type == 'stack'){
            startY = item.y + textOffset * this.opts.pixelRatio! + (item.y0! - item.y + fontSize)/2;
          }
        }
        if(Position == 'bottom'){
          startY = this.opts.height - this.opts.area[2] + textOffset * this.opts.pixelRatio! - 4 * this.opts.pixelRatio!;
          if(series.zeroPoints < this.opts.height - this.opts.area[2]){
            startY = series.zeroPoints + textOffset * this.opts.pixelRatio! - 4 * this.opts.pixelRatio!;
          }
          if(item.y > series.zeroPoints){
            startY = series.zeroPoints - textOffset * this.opts.pixelRatio! + fontSize + 2 * this.opts.pixelRatio!;
          }
          if(this.opts.extra.column!.type == 'stack'){
            startY = item.y0! + textOffset * this.opts.pixelRatio! - 4 * this.opts.pixelRatio!;
          }
        }
        this.context.fillText(String(formatVal), item.x, startY);
        this.context.closePath();
        this.context.stroke();
        this.setTextAlign('left');
      }
    });
  }

  private drawColumnDataPoints(series: Series[], process: number = 1) {
    let xAxisData: XAxisPointsType = this.opts.chartData.xAxisData;
    let xAxisPoints = xAxisData.xAxisPoints;
    let eachSpacing = xAxisData.eachSpacing;
    const DefaultColumnExtra: ColumnExtra = {
      type: 'group',
      width: eachSpacing / 2,
      seriesGap: 2,
      categoryGap: 0,
      barBorderCircle: false,
      barBorderRadius: [0,0,0,0],
      linearType: 'none',
      linearOpacity: 1,
      customColor: [],
      colorStop: 0,
      meterBorder: 1,
      meterFillColor: '#FFFFFF',
      activeBgColor: "#000000",
      activeBgOpacity: 0.08,
      labelPosition: 'outside'
    }
    let columnOption = ChartsUtil.objectAssign({} as ColumnExtra, DefaultColumnExtra, this.opts.extra.column!);
    let calPoints: Array<Array<DataPoints|null>> = [];
    this.context.save();
    let leftNum = -2;
    let rightNum = xAxisPoints.length + 2;
    if (this.opts._scrollDistance_ && this.opts._scrollDistance_ !== 0 && this.opts.enableScroll === true) {
      this.context.translate(this.opts._scrollDistance_, 0);
      leftNum = Math.floor(-(this.opts._scrollDistance_ as number) / eachSpacing) - 2;
      rightNum = leftNum + this.opts.xAxis.itemCount! + 4;
    }
    if (this.opts.tooltip && this.opts.tooltip.textList && this.opts.tooltip.textList.length && process === 1) {
      this.drawToolTipSplitArea(this.opts.tooltip.offset.x, columnOption, eachSpacing);
    }
    columnOption.customColor = ChartsUtil.fillCustomColor(columnOption.linearType, columnOption.customColor, series);
    series.forEach((eachSeries: Series, seriesIndex: number) => {
      let ranges: Array<number>, minRange: number, maxRange: number;
      ranges = [].concat(this.opts.chartData.yAxisData.ranges[eachSeries.index]);
      minRange = ranges.pop()!;
      maxRange = ranges.shift()!;

      // 计算0轴坐标
      let spacingValid = this.opts.height - this.opts.area[0] - this.opts.area[2];
      let zeroHeight = spacingValid * (0 - minRange) / (maxRange - minRange);
      let zeroPoints = this.opts.height - Math.round(zeroHeight) - this.opts.area[2];
      eachSeries.zeroPoints = zeroPoints;
      let data: SeriesDataItem[] = eachSeries.data;

      let points: Array<DataPoints|null> = []
      switch (columnOption.type) {
        case 'group':
          points = this.getColumnDataPoints(data as SeriesDataItem[], minRange, maxRange, xAxisPoints, eachSpacing, process);
          let tooltipPoints = this.getStackDataPoints(data as SeriesDataItem[], minRange, maxRange, xAxisPoints, eachSpacing, seriesIndex, series, process);
          calPoints.push(tooltipPoints);
          points = this.fixColumnData(points, eachSpacing, series.length, seriesIndex);
          for (let i = 0; i < points.length; i++) {
            let item = points[i];
            if (item !== null && i > leftNum && i < rightNum) {
              let startX = item.x - (item.width!) / 2;
              let height = this.opts.height - item.y - this.opts.area[2];
              this.context.beginPath();
              let fillColor: string|CanvasGradient = item.color || eachSeries.color!
              let strokeColor = item.color || eachSeries.color!
              if (columnOption.linearType !== 'none') {
                let grd = this.context.createLinearGradient(startX, item.y, startX, zeroPoints);
                //透明渐变
                if (columnOption.linearType == 'opacity') {
                  grd.addColorStop(0, ChartsUtil.hexToRgb(fillColor as string, columnOption.linearOpacity));
                  grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor as string, 1));
                } else {
                  grd.addColorStop(0, ChartsUtil.hexToRgb(columnOption.customColor[eachSeries.linearIndex!], columnOption.linearOpacity));
                  grd.addColorStop(columnOption.colorStop, ChartsUtil.hexToRgb(columnOption.customColor[eachSeries.linearIndex!],columnOption.linearOpacity));
                  grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor as string, 1));
                }
                fillColor = grd
              }
              // 圆角边框
              if ((columnOption.barBorderRadius && columnOption.barBorderRadius.length === 4) || columnOption.barBorderCircle === true) {
                const left = startX;
                const top = item.y > zeroPoints ? zeroPoints : item.y;
                const width = item.width!;
                const height = Math.abs(zeroPoints - item.y);
                if (columnOption.barBorderCircle) {
                  columnOption.barBorderRadius = [width / 2, width / 2, 0, 0];
                }
                if(item.y > zeroPoints){
                  columnOption.barBorderRadius = [0, 0,width / 2, width / 2];
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
                this.context.lineTo(startX + item.width!, item.y);
                this.context.lineTo(startX + item.width!, zeroPoints);
                this.context.lineTo(startX, zeroPoints);
                this.context.lineTo(startX, item.y);
                this.setLineWidth(1)
                this.setStrokeStyle(strokeColor);
              }
              this.setFillStyle(fillColor);
              this.context.closePath();
              //context.stroke();
              this.context.fill();
            }
          };
          break;
        case 'stack':
          // 绘制堆叠数据图
          points = this.getStackDataPoints(data as SeriesDataItem[], minRange, maxRange, xAxisPoints, eachSpacing, seriesIndex, series, process);
          calPoints.push(points);
          points = this.fixColumnStackData(points, eachSpacing);
          for (let i = 0; i < points.length; i++) {
            let item = points[i];
            if (item !== null && i > leftNum && i < rightNum) {
              this.context.beginPath();
              let fillColor = item.color || eachSeries.color;
              let startX = item.x - (item.width!) / 2 + 1;
              let height = this.opts.height! - item.y - this.opts.area[2];
              let height0 = this.opts.height! - item.y0! - this.opts.area[2];
              if (seriesIndex > 0) {
                height -= height0;
              }
              this.setFillStyle(String(fillColor));
              this.context.moveTo(startX, item.y);
              this.context.fillRect(startX, item.y, item.width!, height);
              this.context.closePath();
              this.context.fill();
            }
          };
          break;
        case 'meter':
          // 绘制温度计数据图
          points = this.getDataPoints(data as SeriesDataItem[], minRange, maxRange, xAxisPoints, eachSpacing, process);
          calPoints.push(points);
          points = this.fixColumnMeterData(points, eachSpacing, seriesIndex, columnOption.meterBorder);
          for (let i = 0; i < points.length; i++) {
            let item = points[i];
            if (item !== null && i > leftNum && i < rightNum) {
              //画背景颜色
              this.context.beginPath();
              if (seriesIndex == 0 && columnOption.meterBorder > 0) {
                this.setStrokeStyle(eachSeries.color as string);
                this.setLineWidth(columnOption.meterBorder * this.opts.pixelRatio!);
              }
              if(seriesIndex == 0){
                this.setFillStyle(columnOption.meterFillColor);
              }else{
                this.setFillStyle(item.color || eachSeries.color as string);
              }
              let startX = item.x - (item.width!) / 2;
              let height = this.opts.height - item.y - this.opts.area[2];
              if ((columnOption.barBorderRadius && columnOption.barBorderRadius.length === 4) || columnOption.barBorderCircle === true) {
                const left = startX;
                const top = item.y;
                const width = item.width!;
                const height = zeroPoints - item.y;
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
                this.context.fill();
              }else{
                this.context.moveTo(startX, item.y);
                this.context.lineTo(startX + item.width!, item.y);
                this.context.lineTo(startX + item.width!, zeroPoints);
                this.context.lineTo(startX, zeroPoints);
                this.context.lineTo(startX, item.y);
                this.context.fill();
              }
              if (seriesIndex == 0 && columnOption.meterBorder > 0) {
                this.context.closePath();
                this.context.stroke();
              }
            }
          }
          break;
      }
    });

    if (this.opts.dataLabel !== false && process === 1) {
      series.forEach((eachSeries, seriesIndex) => {
        let ranges: number[], minRange: number, maxRange: number;
        ranges = [].concat(this.opts.chartData.yAxisData.ranges[eachSeries.index]);
        minRange = ranges.pop()!;
        maxRange = ranges.shift()!;
        let data: SeriesDataItem[] = eachSeries.data;
        let points: Array<DataPoints|null> = []
        switch (columnOption.type) {
          case 'group':
            points = this.getColumnDataPoints(data as SeriesDataItem[], minRange, maxRange, xAxisPoints, eachSpacing, process);
            points = this.fixColumnData(points, eachSpacing, series.length, seriesIndex);
            this.drawColumnPointText(points, eachSeries);
            break;
          case 'stack':
            points = this.getStackDataPoints(data as SeriesDataItem[], minRange, maxRange, xAxisPoints, eachSpacing, seriesIndex, series, process);
            this.drawColumnPointText(points, eachSeries);
            break;
          case 'meter':
            points = this.getDataPoints(data as SeriesDataItem[], minRange, maxRange, xAxisPoints, eachSpacing, process);
            this.drawColumnPointText(points, eachSeries);
            break;
        }
      });
    }
    this.context.restore();
    return {
      xAxisPoints: xAxisPoints,
      calPoints: calPoints,
      eachSpacing: eachSpacing
    } as drawDataPointsRes;
  }

}
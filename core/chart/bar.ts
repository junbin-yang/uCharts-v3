import { BaseRenderer, DataPoints, drawDataPointsRes } from "./base";
import { ChartOptions } from "../types";
import { GlobalConfig } from "../types/config";
import { ChartsUtil } from "../utils";
import { Animation } from '../animation';
import { Series } from "../types/series";
import { BarExtra } from "../types/extra";
import { CanvasGradient } from "../../interface/canvas.type";
import { EventListener } from "../event";

/**
 * 条状图渲染器
 */
export class BarChartRenderer extends BaseRenderer {
  constructor(opts: Partial<ChartOptions>, events: Record<string, EventListener[]> = {}) {
    super(opts, events);
    this.render();
  }

  protected render(): void {
    let series = this.opts.series;
    let categories: string[] = this.opts.categories as string[];
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

    this.opts.chartData.xAxisData = this.calculateXAxisData(series);
    categories = this.opts.chartData.xAxisData.rangesFormat;
    let _calCategoriesData = this.calculateCategoriesData(categories),
      xAxisHeight = _calCategoriesData.xAxisHeight,
      angle = _calCategoriesData.angle;
    GlobalConfig.xAxisHeight = xAxisHeight;
    this.opts._xAxisTextAngle_ = angle;
    this.opts.area[2] += xAxisHeight;
    this.opts.chartData.categoriesData = _calCategoriesData;

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
        this.drawXAxis(categories);
        let _drawBarDataPoints = this.drawBarDataPoints(series, process),
          yAxisPoints = _drawBarDataPoints.yAxisPoints,
          calPoints = _drawBarDataPoints.calPoints,
          eachSpacing = _drawBarDataPoints.eachSpacing;
        this.opts.chartData.yAxisPoints = yAxisPoints;
        this.opts.chartData.xAxisPoints = this.opts.chartData.xAxisData.xAxisPoints;
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

  private drawBarDataPoints(series: Series[], process: number = 1) {
    let yAxisPoints: number[] = [];
    let eachSpacing = (this.opts.height - this.opts.area[0] - this.opts.area[2]) / this.opts.categories.length;
    for (let i = 0; i < this.opts.categories.length; i++) {
      yAxisPoints.push(this.opts.area[0] + eachSpacing / 2 + eachSpacing * i);
    }
    let columnOption = ChartsUtil.objectAssign({} as BarExtra, {
      type: 'group',
      width: eachSpacing / 2,
      meterBorder: 4,
      meterFillColor: '#FFFFFF',
      barBorderCircle: false,
      barBorderRadius: [],
      seriesGap: 2,
      linearType: 'none',
      linearOpacity: 1,
      customColor: [],
      colorStop: 0,
    }, this.opts.extra.bar!);
    let calPoints: Array<Array<DataPoints|null>> = [];
    this.context.save();
    let leftNum = -2;
    let rightNum = yAxisPoints.length + 2;
    if (this.opts.tooltip && this.opts.tooltip.textList && this.opts.tooltip.textList.length && process === 1) {
      this.drawBarToolTipSplitArea(this.opts.tooltip.offset.y, eachSpacing);
    }
    columnOption.customColor = ChartsUtil.fillCustomColor(columnOption.linearType, columnOption.customColor, series);
    series.forEach((eachSeries, seriesIndex) => {
      let ranges: number[], minRange: number, maxRange: number;
      ranges = [].concat(this.opts.chartData.xAxisData.ranges);
      maxRange = ranges.pop()!;
      minRange = ranges.shift()!;
      let data: number[] = eachSeries.data;

      let points: (DataPoints | null)[] = []
      switch (columnOption.type) {
        case 'group':
          points = this.getBarDataPoints(data, minRange, maxRange, yAxisPoints, eachSpacing, process);
          let tooltipPoints = this.getBarStackDataPoints(data, minRange, maxRange, yAxisPoints, eachSpacing, seriesIndex, series, process);
          calPoints.push(tooltipPoints);
          points = this.fixBarData(points, eachSpacing, series.length, seriesIndex);
          for (let i = 0; i < points.length; i++) {
            let item = points[i];
            if (item !== null && i > leftNum && i < rightNum) {
              //let startX = item.x - item.width / 2;
              let startX: number = this.opts.area[3];
              let startY: number = item.y - (item.width!) / 2;
              let height = item.height;
              this.context.beginPath();
              let fillColor: CanvasGradient|string = item.color || eachSeries.color!
              let strokeColor = item.color || eachSeries.color
              if (columnOption.linearType !== 'none') {
                let grd = this.context.createLinearGradient(startX, item.y, item.x, item.y);
                //透明渐变
                if (columnOption.linearType == 'opacity') {
                  grd.addColorStop(0, ChartsUtil.hexToRgb(fillColor, columnOption.linearOpacity));
                  grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
                } else {
                  grd.addColorStop(0, ChartsUtil.hexToRgb(columnOption.customColor[eachSeries.linearIndex!], columnOption.linearOpacity));
                  grd.addColorStop(columnOption.colorStop, ChartsUtil.hexToRgb(columnOption.customColor[eachSeries.linearIndex!],columnOption.linearOpacity));
                  grd.addColorStop(1, ChartsUtil.hexToRgb(fillColor, 1));
                }
                fillColor = grd
              }
              // 圆角边框
              if ((columnOption.barBorderRadius && columnOption.barBorderRadius.length === 4) || columnOption.barBorderCircle === true) {
                const left = startX;
                const width = item.width!;
                const top = item.y - (item.width!) / 2;
                const height = item.height!;
                if (columnOption.barBorderCircle) {
                  columnOption.barBorderRadius = [width / 2, width / 2, 0, 0];
                }
                let r0 = columnOption.barBorderRadius[0];
                let r1 = columnOption.barBorderRadius[1];
                let r2 = columnOption.barBorderRadius[2];
                let r3 = columnOption.barBorderRadius[3];
                let minRadius = Math.min(width/2, height/2);
                r0 = r0 > minRadius ? minRadius : r0;
                r1 = r1 > minRadius ? minRadius : r1;
                r2 = r2 > minRadius ? minRadius : r2;
                r3 = r3 > minRadius ? minRadius : r3;
                r0 = r0 < 0 ? 0 : r0;
                r1 = r1 < 0 ? 0 : r1;
                r2 = r2 < 0 ? 0 : r2;
                r3 = r3 < 0 ? 0 : r3;

                this.context.arc(left + r3, top + r3, r3, -Math.PI, -Math.PI / 2);
                this.context.arc(item.x - r0, top + r0, r0, -Math.PI / 2, 0);
                this.context.arc(item.x - r1, top + width - r1, r1, 0, Math.PI / 2);
                this.context.arc(left + r2, top + width - r2, r2, Math.PI / 2, Math.PI);
              } else {
                this.context.moveTo(startX, startY);
                this.context.lineTo(item.x, startY);
                this.context.lineTo(item.x, startY + item.width!);
                this.context.lineTo(startX, startY + item.width!);
                this.context.lineTo(startX, startY);
                this.setLineWidth(1)
                this.setStrokeStyle(strokeColor!);
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
          points = this.getBarStackDataPoints(data, minRange, maxRange, yAxisPoints, eachSpacing, seriesIndex, series, process);
          calPoints.push(points);
          points = this.fixBarStackData(points, eachSpacing);
          for (let i = 0; i < points.length; i++) {
            let item = points[i];
            if (item !== null && i > leftNum && i < rightNum) {
              this.context.beginPath();
              let fillColor = item.color || eachSeries.color;
              let startX: number = item.x0!;
              this.setFillStyle(fillColor!);
              this.context.moveTo(startX, item.y - (item.width!)/2);
              this.context.fillRect(startX, item.y - (item.width!)/2, item.height! , item.width!);
              this.context.closePath();
              this.context.fill();
            }
          };
          break;
      }
    });

    if (this.opts.dataLabel !== false && process === 1) {
      series.forEach((eachSeries, seriesIndex) => {
        let ranges: number[], minRange: number, maxRange: number;
        ranges = [].concat(this.opts.chartData.xAxisData.ranges);
        maxRange = ranges.pop()!;
        minRange = ranges.shift()!;
        let data: number[] = eachSeries.data;
        let points: (DataPoints | null)[] = []
        switch (columnOption.type) {
          case 'group':
            points = this.getBarDataPoints(data, minRange, maxRange, yAxisPoints, eachSpacing, process);
            points = this.fixBarData(points, eachSpacing, series.length, seriesIndex);
            this.drawBarPointText(points, eachSeries);
            break;
          case 'stack':
            points = this.getBarStackDataPoints(data, minRange, maxRange, yAxisPoints, eachSpacing, seriesIndex, series, process);
            this.drawBarPointText(points, eachSeries);
            break;
        }
      });
    }

    return {
      yAxisPoints: yAxisPoints,
      calPoints: calPoints,
      eachSpacing: eachSpacing
    } as drawDataPointsRes;
  }

  private drawBarToolTipSplitArea(offsetX: number, eachSpacing: number) {
    let toolTipOption = ChartsUtil.objectAssign({}, {
      activeBgColor: '#000000',
      activeBgOpacity: 0.08
    }, this.opts.extra.bar!);
    let startX: number = this.opts.area[3];
    let endX = this.opts.width - this.opts.area[1];
    this.context.beginPath();
    this.setFillStyle(ChartsUtil.hexToRgb(toolTipOption.activeBgColor!, toolTipOption.activeBgOpacity!));
    this.context.rect( startX ,offsetX - eachSpacing / 2 ,  endX - startX,eachSpacing);
    this.context.closePath();
    this.context.fill();
    this.setFillStyle("#FFFFFF");
  }

  private getBarDataPoints(data: number[], minRange: number, maxRange: number, yAxisPoints: number[], eachSpacing: number, process: number = 1) {
    let points: Array<DataPoints|null> = [];
    //let validHeight = this.opts.height - this.opts.area[0] - this.opts.area[2];
    let validWidth = this.opts.width - this.opts.area[1] - this.opts.area[3];
    data.forEach((item, index) => {
      if (item === null) {
        points.push(null);
      } else {
        let point: DataPoints = {
          color: "",
          x: 0,
          y: 0
        };
        point.y = yAxisPoints[index];
        let value = item;
        let height = validWidth * (value - minRange) / (maxRange - minRange);
        height *= process;
        point.height = height;
        point.value = value;
        point.x = height + this.opts.area[3];
        points.push(point);
      }
    });
    return points;
  }

  private getBarStackDataPoints(data: number[], minRange: number, maxRange: number, yAxisPoints: number[], eachSpacing: number, seriesIndex: number, stackSeries: Series[], process: number = 1) {
    let points: Array<DataPoints|null> = [];
    let validHeight = this.opts.width - this.opts.area[1] - this.opts.area[3];
    data.forEach((item, index) => {
      if (item === null) {
        points.push(null);
      } else {
        let point: DataPoints = {
          color: "",  // item.color ???
          x: 0,
          y: 0
        };
        point.y = yAxisPoints[index];
        let height = 0;
        let height0 = 0;
        if (seriesIndex > 0) {
          let value = 0;
          for (let i = 0; i <= seriesIndex; i++) {
            value += stackSeries[i].data[index];
          }
          let value0 = value - item;
          height = validHeight * (value - minRange) / (maxRange - minRange);
          height0 = validHeight * (value0 - minRange) / (maxRange - minRange);
        } else {
          let value = item;
          height = validHeight * (value - minRange) / (maxRange - minRange);
          height0 = 0;
        }
        let heightc = height0;
        height *= process;
        heightc *= process;
        point.height = height - heightc;
        point.x = this.opts.area[3] + height;
        point.x0 = this.opts.area[3] + heightc;
        points.push(point);
      }
    });
    return points;
  }

  private fixBarData(points: (DataPoints | null)[], eachSpacing: number, columnLen: number, index: number) {
    return points.map((item) => {
      if (item === null) {
        return null;
      }
      let seriesGap = 0;
      let categoryGap = 0;
      seriesGap = this.opts.extra.bar?.seriesGap ? this.opts.extra.bar?.seriesGap * this.opts.pixelRatio! : 0;
      categoryGap = this.opts.extra.bar?.categoryGap ? this.opts.extra.bar?.categoryGap * this.opts.pixelRatio! : 0;
      seriesGap =  Math.min(seriesGap, eachSpacing / columnLen)
      categoryGap =  Math.min(categoryGap, eachSpacing / columnLen)
      item.width = Math.ceil((eachSpacing - 2 * categoryGap - seriesGap * (columnLen - 1)) / columnLen);
      if (this.opts.extra.bar && this.opts.extra.bar.width && +this.opts.extra.bar.width > 0) {
        item.width = Math.min(item.width, +this.opts.extra.bar.width * this.opts.pixelRatio!);
      }
      if (item.width <= 0) {
        item.width = 1;
      }
      item.y += (index + 0.5 - columnLen / 2) * (item.width + seriesGap);
      return item;
    });
  }

  private fixBarStackData(points: (DataPoints | null)[], eachSpacing: number) {
    let categoryGap = this.opts.extra.bar?.categoryGap ? this.opts.extra.bar?.categoryGap * this.opts.pixelRatio! : 0;
    return points.map((item, index) => {
      if (item === null) {
        return null;
      }
      item.width = Math.ceil(eachSpacing - 2 * categoryGap);
      if (this.opts.extra.bar && this.opts.extra.bar.width && +this.opts.extra.bar.width > 0) {
        item.width = Math.min(item.width, +this.opts.extra.bar.width * this.opts.pixelRatio!);
      }
      if (item.width <= 0) {
        item.width = 1;
      }
      return item;
    });
  }

  private drawBarPointText(points: (DataPoints | null)[], series: Series) {
    // 绘制数据文案
    let data: number[] = series.data;
    let textOffset = series.textOffset ? series.textOffset : 0;
    points.forEach((item, index) => {
      if (item !== null) {
        this.context.beginPath();
        let fontSize = series.textSize ? series.textSize * this.opts.pixelRatio! : this.opts.fontSize!;
        this.setFontSize(fontSize);
        this.setFillStyle(series.textColor || this.opts.fontColor!);
        let value = data[index]
        let formatVal = series.formatter ? series.formatter(value,index,series,this.opts) : value;
        this.setTextAlign('left');
        this.context.fillText(String(formatVal), item.x + 4 * this.opts.pixelRatio! , item.y + fontSize / 2 - 3 );
        this.context.closePath();
        this.context.stroke();
      }
    });
  }
}
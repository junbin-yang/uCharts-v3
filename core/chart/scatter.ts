import { ChartOptions } from "../types";
import { GlobalConfig } from "../types/config";
import { Series } from "../types/series";
import { Animation } from '../animation';
import { ChartsUtil } from "../utils";
import { BaseRenderer, DataPoints, drawDataPointsRes } from "./base";


/**
 * 散点图渲染器
 */
export class ScatterChartRenderer extends BaseRenderer {
  constructor(opts: Partial<ChartOptions>) {
    super(opts);
    this.render();
  }

  protected render(): void {
    let series = ChartsUtil.fillSeries(this.opts.series, this.opts);
    let categories: string[] = this.opts.categories as string[];
    const duration = this.opts.animation ? this.opts.duration : 0;
    this.animation && this.animation.stop();
    let seriesMA = series;
    /* 过滤掉show=false的series */
    this.opts._series_ = series = ChartsUtil.filterSeries(series);
    //重新计算图表区域
    this.opts.area = new Array(4);
    //复位绘图区域
    for (let j = 0; j < 4; j++) {
      this.opts.area[j] = this.opts.padding[j] * this.opts.pixelRatio;
    }
    //通过计算三大区域：图例、X轴、Y轴的大小，确定绘图区域
    const calLegendData = this.calculateLegendData(seriesMA, this.opts.chartData);
    const legendHeight = calLegendData.area.wholeHeight;
    const legendWidth = calLegendData.area.wholeWidth;

    switch (this.opts.legend.position) {
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
        maxTitleHeight = Math.max(maxTitleHeight, this.opts.yAxis.data![i].titleFontSize ? (this.opts.yAxis.data![i].titleFontSize! * this.opts.pixelRatio) : this.opts.fontSize)
      }
      this.opts.area[0] += maxTitleHeight;
    }

    let rightIndex = 0;
    let leftIndex = 0;
    //计算主绘图区域左右位置
    for (let i = 0; i < yAxisWidth.length; i++) {
      if (yAxisWidth[i].position == 'left') {
        if (leftIndex > 0) {
          this.opts.area[3] += yAxisWidth[i].width + this.opts.yAxis.padding! * this.opts.pixelRatio;
        } else {
          this.opts.area[3] += yAxisWidth[i].width;
        }
        leftIndex += 1;
      } else if (yAxisWidth[i].position == 'right') {
        if (rightIndex > 0) {
          this.opts.area[1] += yAxisWidth[i].width + this.opts.yAxis.padding! * this.opts.pixelRatio;
        } else {
          this.opts.area[1] += yAxisWidth[i].width;
        }
        rightIndex += 1;
      }
    }

    this.opts.chartData.yAxisData = calYAxisData;

    if (this.opts.categories && this.opts.categories.length) {
      this.opts.chartData.xAxisData = this.getXAxisPoints(this.opts.categories as string[]);
    } else {
      this.opts.chartData.xAxisData = this.calculateXAxisData(series);
      categories = this.opts.chartData.xAxisData.rangesFormat;
    }
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
      timing: this.opts.timing,
      duration: duration,
      onProcess: (process: number) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.opts.rotate) {
          this.contextRotate();
        }
        this.drawYAxisGrid(categories);
        this.drawXAxis(categories);
        let _drawScatterDataPoints = this.drawScatterDataPoints(series, process),
          xAxisPoints = _drawScatterDataPoints.xAxisPoints,
          calPoints = _drawScatterDataPoints.calPoints,
          eachSpacing = _drawScatterDataPoints.eachSpacing;
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
        this.event.emit('renderComplete');
      }
    });
  }

  private drawScatterDataPoints(series: Series[], process: number = 1) {
    let xAxisData = this.opts.chartData.xAxisData,
      xAxisPoints = xAxisData.xAxisPoints,
      eachSpacing = xAxisData.eachSpacing;
    let calPoints: Array<Array<DataPoints|null>> = [];
    this.context.save();
    let leftSpace = 0;
    let rightSpace = this.opts.width + eachSpacing;
    if (this.opts._scrollDistance_ && this.opts._scrollDistance_ !== 0 && this.opts.enableScroll === true) {
      this.context.translate(this.opts._scrollDistance_, 0);
      leftSpace = -this.opts._scrollDistance_ - eachSpacing * 2 + this.opts.area[3];
      rightSpace = leftSpace + (this.opts.xAxis.itemCount! + 4) * eachSpacing;
    }
    series.forEach((eachSeries, seriesIndex) => {
      let ranges: number[], minRange: number, maxRange: number;
      ranges = [].concat(this.opts.chartData.yAxisData.ranges[eachSeries.index]);
      minRange = ranges.pop()!;
      maxRange = ranges.shift()!;
      let data = eachSeries.data;
      let points = this.getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, process);
      this.context.beginPath();
      this.setStrokeStyle(eachSeries.color!);
      this.setFillStyle(eachSeries.color!);
      this.setLineWidth(1 * this.opts.pixelRatio);
      let shape = eachSeries.pointShape;
      if (shape === 'diamond') {
        points.forEach((item, index) => {
          if (item !== null) {
            this.context.moveTo(item.x, item.y - 4.5);
            this.context.lineTo(item.x - 4.5, item.y);
            this.context.lineTo(item.x, item.y + 4.5);
            this.context.lineTo(item.x + 4.5, item.y);
            this.context.lineTo(item.x, item.y - 4.5);
          }
        });
      } else if (shape === 'circle') {
        points.forEach((item, index) => {
          if (item !== null) {
            this.context.moveTo(item.x + 2.5 * this.opts.pixelRatio, item.y);
            this.context.arc(item.x, item.y, 3 * this.opts.pixelRatio, 0, 2 * Math.PI, false);
          }
        });
      } else if (shape === 'square') {
        points.forEach((item, index) => {
          if (item !== null) {
            this.context.moveTo(item.x - 3.5, item.y - 3.5);
            this.context.rect(item.x - 3.5, item.y - 3.5, 7, 7);
          }
        });
      } else if (shape === 'triangle') {
        points.forEach((item, index) => {
          if (item !== null) {
            this.context.moveTo(item.x, item.y - 4.5);
            this.context.lineTo(item.x - 4.5, item.y + 4.5);
            this.context.lineTo(item.x + 4.5, item.y + 4.5);
            this.context.lineTo(item.x, item.y - 4.5);
          }
        });
      } else {
        return;
      }
      this.context.closePath();
      this.context.fill();
      this.context.stroke();
    });
    if (this.opts.dataLabel !== false && process === 1) {
      series.forEach((eachSeries, seriesIndex) => {
        let ranges: number[], minRange: number, maxRange: number;
        ranges = [].concat(this.opts.chartData.yAxisData.ranges[eachSeries.index]);
        minRange = ranges.pop()!;
        maxRange = ranges.shift()!;
        let data = eachSeries.data;
        let points = this.getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, process);
        this.drawPointText(points, eachSeries);
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
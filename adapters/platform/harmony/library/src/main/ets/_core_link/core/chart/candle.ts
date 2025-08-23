import { BaseRenderer, XAxisPointsType, drawDataPointsRes, DataPoints } from "./base";
import { ChartOptions, Point } from "../types";
import { Series } from '../types/series';
import { ChartsUtil } from '../utils';
import { GlobalConfig } from "../types/config";
import { Animation } from '../animation';
import { CandleExtra, CandleExtraAverage, CandleExtraColor } from "../types/extra";
import { EventListener } from "../event";

/**
 * K线图渲染器
 */
export class CandleChartRenderer extends BaseRenderer {
  constructor(opts: Partial<ChartOptions>, events: Record<string, EventListener[]> = {}) {
    super(opts, events);
    this.render();
  }

  protected render(): void {
    let series = ChartsUtil.fillSeries(this.opts.series, this.opts);
    const duration = this.opts.animation! ? this.opts.duration! : 0;
    this.animation && this.animation.stop();
    let seriesMA = series;
    let average = ChartsUtil.objectAssign({ show: true } as CandleExtraAverage, this.opts.extra.candle!.average!);
    if (average.show) {
      seriesMA = this.calCandleMA(average.day, average.name, average.color, series[0].data);
      seriesMA = ChartsUtil.fillSeries(seriesMA, this.opts);
      this.opts.seriesMA = seriesMA;
    }
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
    if (this.opts.yAxis!.showTitle) {
      let maxTitleHeight = 0;
      for (let i = 0; i < this.opts.yAxis!.data!.length; i++) {
        maxTitleHeight = Math.max(maxTitleHeight, this.opts.yAxis!.data![i].titleFontSize ? (this.opts.yAxis!.data![i].titleFontSize! * this.opts.pixelRatio!) : this.opts.fontSize!)
      }
      this.opts.area[0] += maxTitleHeight;
    }

    let rightIndex = 0;
    let leftIndex = 0;
    //计算主绘图区域左右位置
    for (let i = 0; i < yAxisWidth.length; i++) {
      if (yAxisWidth[i].position == 'left') {
        if (leftIndex > 0) {
          this.opts.area[3] += yAxisWidth[i].width + this.opts.yAxis!.padding! * this.opts.pixelRatio!;
        } else {
          this.opts.area[3] += yAxisWidth[i].width;
        }
        leftIndex += 1;
      } else if (yAxisWidth[i].position == 'right') {
        if (rightIndex > 0) {
          this.opts.area[1] += yAxisWidth[i].width + this.opts.yAxis!.padding! * this.opts.pixelRatio!;
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
    if (this.opts.enableScroll && this.opts.xAxis!.scrollAlign == 'right' && this.opts._scrollDistance_ === undefined) {
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
        let _drawCandleDataPoints = this.drawCandleDataPoints(series, seriesMA, process),
          xAxisPoints = _drawCandleDataPoints.xAxisPoints,
          calPoints = _drawCandleDataPoints.calPoints,
          eachSpacing = _drawCandleDataPoints.eachSpacing;
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

  private calCandleMA(dayArr: number[], nameArr: string[], colorArr: string[], kdata: Array<number[]>) {
    let seriesTemp: CandleSeriesItem[] = [];
    for (let k = 0; k < dayArr.length; k++) {
      let seriesItem: CandleSeriesItem = {
        data: [],
        name: nameArr[k],
        color: colorArr[k]
      };
      for (let i = 0, len = kdata.length; i < len; i++) {
        if (i < dayArr[k]) {
          seriesItem.data.push(null);
          continue;
        }
        let sum = 0;
        for (let j = 0; j < dayArr[k]; j++) {
          sum += kdata[i - j][1];
        }
        seriesItem.data.push(+(sum / dayArr[k]).toFixed(3));
      }
      seriesTemp.push(seriesItem);
    }
    return seriesTemp;
  }

  private drawCandleDataPoints(series: Series[], seriesMA: Series[], process: number = 1) {
    let candleOption: CandleExtra = ChartsUtil.objectAssign({} as CandleExtra, {
      color: {} as CandleExtraColor,
      average: {} as CandleExtraAverage
    }, this.opts.extra.candle!);
    candleOption.color =  ChartsUtil.objectAssign({} as CandleExtraColor, {
      upLine: '#f04864',
      upFill: '#f04864',
      downLine: '#2fc25b',
      downFill: '#2fc25b'
    }, candleOption.color!);
    candleOption.average = ChartsUtil.objectAssign({} as CandleExtraAverage, {
      show: true,
      name: [],
      day: [],
      color: this.opts.color!
    }, candleOption.average!);
    this.opts.extra.candle = candleOption;
    let xAxisData: XAxisPointsType = this.opts.chartData.xAxisData,
      xAxisPoints = xAxisData.xAxisPoints,
      eachSpacing = xAxisData.eachSpacing;
    let calPoints: (Point[] | null)[][] = [];
    this.context.save();
    let leftNum = -2;
    let rightNum = xAxisPoints.length + 2;
    let leftSpace = 0;
    let rightSpace = this.opts.width + eachSpacing;
    if (this.opts._scrollDistance_ && this.opts._scrollDistance_ !== 0 && this.opts.enableScroll === true) {
      this.context.translate(this.opts._scrollDistance_, 0);
      leftNum = Math.floor(-this.opts._scrollDistance_ / eachSpacing) - 2;
      rightNum = leftNum + (this.opts.xAxis!.itemCount!) + 4;
      leftSpace = -this.opts._scrollDistance_ - eachSpacing * 2 + this.opts.area[3];
      rightSpace = leftSpace + ((this.opts.xAxis!.itemCount!) + 4) * eachSpacing;
    }
    //画均线
    if (candleOption.average.show || seriesMA) {
      seriesMA.forEach((eachSeries, seriesIndex) => {
        let ranges: number[], minRange: number, maxRange: number;
        ranges = [].concat(this.opts.chartData.yAxisData.ranges[eachSeries.index]);
        minRange = ranges.pop()!;
        maxRange = ranges.shift()!;
        let data = eachSeries.data;
        let points = this.getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, process);
        let splitPointList = this.splitPoints(points,eachSeries);
        for (let i = 0; i < splitPointList.length; i++) {
          let points = splitPointList[i];
          this.context.beginPath();
          this.setStrokeStyle(eachSeries.color!);
          this.setLineWidth(1);
          if (points.length === 1) {
            this.context.moveTo(points[0].x, points[0].y);
            this.context.arc(points[0].x, points[0].y, 1, 0, 2 * Math.PI);
          } else {
            this.context.moveTo(points[0].x, points[0].y);
            let startPoint = 0;
            for (let j = 0; j < points.length; j++) {
              let item = points[j];
              if (startPoint == 0 && item.x > leftSpace) {
                this.context.moveTo(item.x, item.y);
                startPoint = 1;
              }
              if (j > 0 && item.x > leftSpace && item.x < rightSpace) {
                let ctrlPoint = this.createCurveControlPoints(points, j - 1);
                this.context.bezierCurveTo(ctrlPoint.ctrA.x, ctrlPoint.ctrA.y, ctrlPoint.ctrB.x, ctrlPoint.ctrB.y, item.x,
                  item.y);
              }
            }
            this.context.moveTo(points[0].x, points[0].y);
          }
          this.context.closePath();
          this.context.stroke();
        }
      });
    }
    //画K线
    series.forEach((eachSeries, seriesIndex) => {
      let ranges: number[], minRange: number, maxRange: number;
      ranges = [].concat(this.opts.chartData.yAxisData.ranges[eachSeries.index]);
      minRange = ranges.pop()!;
      maxRange = ranges.shift()!;
      let data: Array<number[]> = eachSeries.data;
      let points = this.getCandleDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, process);
      calPoints.push(points);
      let splitPointList = this.splitCandlePoints(points, eachSeries);
      for (let i = 0; i < splitPointList[0].length; i++) {
        if (i > leftNum && i < rightNum) {
          let item = splitPointList[0][i];
          this.context.beginPath();
          //如果上涨
          if (data[i][1] - data[i][0] > 0) {
            this.setStrokeStyle(candleOption.color.upLine!);
            this.setFillStyle(candleOption.color.upFill!);
            this.setLineWidth(1 * this.opts.pixelRatio!);
            this.context.moveTo(item[3].x, item[3].y); //顶点
            this.context.lineTo(item[1].x, item[1].y); //收盘中间点
            this.context.lineTo(item[1].x - eachSpacing / 4, item[1].y); //收盘左侧点
            this.context.lineTo(item[0].x - eachSpacing / 4, item[0].y); //开盘左侧点
            this.context.lineTo(item[0].x, item[0].y); //开盘中间点
            this.context.lineTo(item[2].x, item[2].y); //底点
            this.context.lineTo(item[0].x, item[0].y); //开盘中间点
            this.context.lineTo(item[0].x + eachSpacing / 4, item[0].y); //开盘右侧点
            this.context.lineTo(item[1].x + eachSpacing / 4, item[1].y); //收盘右侧点
            this.context.lineTo(item[1].x, item[1].y); //收盘中间点
            this.context.moveTo(item[3].x, item[3].y); //顶点
          } else {
            this.setStrokeStyle(candleOption.color.downLine!);
            this.setFillStyle(candleOption.color.downFill!);
            this.setLineWidth(1 * this.opts.pixelRatio!);
            this.context.moveTo(item[3].x, item[3].y); //顶点
            this.context.lineTo(item[0].x, item[0].y); //开盘中间点
            this.context.lineTo(item[0].x - eachSpacing / 4, item[0].y); //开盘左侧点
            this.context.lineTo(item[1].x - eachSpacing / 4, item[1].y); //收盘左侧点
            this.context.lineTo(item[1].x, item[1].y); //收盘中间点
            this.context.lineTo(item[2].x, item[2].y); //底点
            this.context.lineTo(item[1].x, item[1].y); //收盘中间点
            this.context.lineTo(item[1].x + eachSpacing / 4, item[1].y); //收盘右侧点
            this.context.lineTo(item[0].x + eachSpacing / 4, item[0].y); //开盘右侧点
            this.context.lineTo(item[0].x, item[0].y); //开盘中间点
            this.context.moveTo(item[3].x, item[3].y); //顶点
          }
          this.context.closePath();
          this.context.fill();
          this.context.stroke();
        }
      }
    });
    this.context.restore();
    return {
      xAxisPoints: xAxisPoints,
      calPoints: calPoints,
      eachSpacing: eachSpacing
    } as drawDataPointsRes;
  }

  private getCandleDataPoints(data: Array<number[]>, minRange: number, maxRange: number, xAxisPoints: number[], eachSpacing: number, process: number = 1) {
    let points: Array<Point[]|null> = [];
    let validHeight = this.opts.height - this.opts.area[0] - this.opts.area[2];
    data.forEach((item, index) => {
      if (item === null) {
        points.push(null);
      } else {
        let cPoints: Point[] = [];
        item.forEach((items, indexs) => {
          let point: Point = {x: 0, y: 0};
          point.x = xAxisPoints[index] + Math.round(eachSpacing / 2);
          let value = items//.value || items;
          let height = validHeight * (value - minRange) / (maxRange - minRange);
          height *= process;
          point.y = this.opts.height - Math.round(height) - this.opts.area[2];
          cPoints.push(point);
        });
        points.push(cPoints);
      }
    });
    return points;
  }

  private splitCandlePoints(points: (Point[] | null)[], eachSeries: Series) {
    let newPoints: Array<Point[][]> = [];
    let items: Point[][] = [];
    points.forEach((item, index) => {
      if(eachSeries.connectNulls){
        if (item !== null) {
          items.push(item);
        }
      }else{
        if (item !== null) {
          items.push(item);
        } else {
          if (items.length) {
            newPoints.push(items);
          }
          items = [];
        }
      }
    });
    if (items.length) {
      newPoints.push(items);
    }
    return newPoints;
  }
}

interface CandleSeriesItem {
  data: Array<number|null>,
  name: string,
  color: string,
}
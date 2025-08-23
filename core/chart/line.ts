import { BaseRenderer, DataPoints, drawDataPointsRes, XAxisPointsType } from "./base";
import { ChartOptions } from "../types";
import { GlobalConfig } from "../types/config";
import { ChartsUtil } from "../utils";
import { Animation } from '../animation';
import { LineExtra } from "../types/extra";
import { LineSeries, Series } from "../types/series";
import { CanvasGradient } from "../../interface/canvas.type";
import { EventListener } from "../event";

/**
 * 折线图渲染器
 */
export class LineChartRenderer extends BaseRenderer {
  constructor(opts: Partial<ChartOptions>, events: Record<string, EventListener[]> = {}) {
    super(opts, events);
    this.render();
  }

  protected render(): void {
    let series = ChartsUtil.fillSeries(this.opts.series, this.opts);
    let categories: string[] = this.opts.categories as string[];
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
      onProcess: (process: number) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.opts.rotate) {
          this.contextRotate();
        }
        this.drawYAxisGrid(categories);
        this.drawXAxis(categories);
        let _drawLineDataPoints = this.drawLineDataPoints(series, process),
          xAxisPoints = _drawLineDataPoints.xAxisPoints,
          calPoints = _drawLineDataPoints.calPoints,
          eachSpacing = _drawLineDataPoints.eachSpacing;
        this.opts.chartData.xAxisPoints = xAxisPoints;
        this.opts.chartData.calPoints = calPoints;
        this.opts.chartData.eachSpacing = eachSpacing;
        this.drawYAxis();
        if (this.opts.enableMarkLine !== false && process === 1) {
          this.drawMarkLine();
        }
        this.drawLegend(this.opts.chartData!);
        this.drawToolTipBridge(process);
        this.drawCanvas();
      },
      onFinish: () => {
        this.event.emit('renderComplete', this.opts);
      }
    });

  }

  private drawLineDataPoints(series: Series[], process: number = 1) {
    let lineOption: LineExtra = ChartsUtil.objectAssign({} as LineExtra, {
      type: 'straight',
      width: 2,
      activeType: 'none',
      linearType: 'none',
      onShadow: false,
      animation: 'vertical',
    }, this.opts.extra.line!);
    lineOption.width *= this.opts.pixelRatio!;
    let xAxisData: XAxisPointsType = this.opts.chartData.xAxisData,
      xAxisPoints = xAxisData.xAxisPoints,
      eachSpacing = xAxisData.eachSpacing;
    let calPoints: Array<Array<DataPoints|null>> = [];
    this.context.save();
    let leftSpace = 0;
    let rightSpace: number = this.opts.width + eachSpacing;
    if (this.opts._scrollDistance_ && this.opts._scrollDistance_ !== 0 && this.opts.enableScroll === true) {
      this.context.translate(this.opts._scrollDistance_, 0);
      leftSpace = -(this.opts._scrollDistance_ as number) - eachSpacing * 2 + this.opts.area[3];
      rightSpace = leftSpace + (this.opts.xAxis!.itemCount! + 4) * eachSpacing;
    }
    series.forEach((eachSeries, seriesIndex) => {
      // 这段很神奇的代码用于解决ios16的setStrokeStyle失效的bug
      this.context.beginPath();
      this.setStrokeStyle(eachSeries.color!);
      this.context.moveTo(-10000, -10000);
      this.context.lineTo(-10001, -10001);
      this.context.stroke();
      let ranges: number[], minRange: number, maxRange: number;
      ranges = [].concat(this.opts.chartData.yAxisData.ranges[(eachSeries as LineSeries).index]);
      minRange = ranges.pop()!;
      maxRange = ranges.shift()!;
      let data = (eachSeries as LineSeries).data;
      let points = this.getLineDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, lineOption, process);
      calPoints.push(points);
      let splitPointList = this.splitPoints(points, eachSeries);
      if ((eachSeries as LineSeries).lineType == 'dash') {
        let dashLength = (eachSeries as LineSeries).dashLength ? (eachSeries as LineSeries).dashLength! : 8;
        dashLength *= this.opts.pixelRatio!;
        this.setLineDash([dashLength, dashLength]);
      }
      this.context.beginPath();
      let strokeColor: CanvasGradient|string = eachSeries.color!;
      if (lineOption.linearType !== 'none' && (eachSeries as LineSeries).linearColor && (eachSeries as LineSeries).linearColor!.length > 0) {
        let grd = this.context.createLinearGradient(this.opts.chartData.xAxisData.startX, this.opts.height/2, this.opts.chartData.xAxisData.endX, this.opts.height/2);
        for (let i = 0; i < (eachSeries as LineSeries).linearColor!.length; i++) {
          grd.addColorStop((eachSeries as LineSeries).linearColor![i][0], ChartsUtil.hexToRgb((eachSeries as LineSeries).linearColor![i][1], 1));
        }
        strokeColor = grd
      }
      this.setStrokeStyle(strokeColor);
      if (lineOption.onShadow == true && (eachSeries as LineSeries).setShadow && (eachSeries as LineSeries).setShadow!.length > 0) {
        this.setShadow((eachSeries as LineSeries).setShadow![0], (eachSeries as LineSeries).setShadow![1], (eachSeries as LineSeries).setShadow![2], (eachSeries as LineSeries).setShadow![3]);
      }else{
        this.setShadow(0, 0, 0, 'rgba(0,0,0,0)');
      }
      this.setLineWidth(lineOption.width);
      splitPointList.forEach((points, index) => {
        if (points.length === 1) {
          this.context.moveTo(points[0].x, points[0].y);
          // context.arc(points[0].x, points[0].y, 1, 0, 2 * Math.PI);
        } else {
          this.context.moveTo(points[0].x, points[0].y);
          let startPoint = 0;
          if (lineOption.type === 'curve') {
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
          }
          if (lineOption.type === 'straight') {
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
          if (lineOption.type === 'step') {
            for (let j = 0; j < points.length; j++) {
              let item = points[j];
              if (startPoint == 0 && item.x > leftSpace) {
                this.context.moveTo(item.x, item.y);
                startPoint = 1;
              }
              if (j > 0 && item.x > leftSpace && item.x < rightSpace) {
                this.context.lineTo(item.x, points[j - 1].y);
                this.context.lineTo(item.x, item.y);
              }
            };
          }
          this.context.moveTo(points[0].x, points[0].y);
        }
      });
      this.context.stroke();
      this.setLineDash([]);
      if (this.opts.dataPointShape !== false) {
        this.drawPointShape(points, eachSeries.color!, eachSeries.pointShape!);
      }
      this.drawActivePoint(points, eachSeries.color!, eachSeries.pointShape!, lineOption, seriesIndex);
    });
    if ( this.opts.dataLabel !== false && process === 1) {
      series.forEach((eachSeries, seriesIndex) => {
        let ranges: number[], minRange: number, maxRange: number;
        ranges = [].concat(this.opts.chartData.yAxisData.ranges[eachSeries.index]);
        minRange = ranges.pop()!;
        maxRange = ranges.shift()!;
        let data = (eachSeries as LineSeries).data;
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

  private getLineDataPoints(data: Array<number | null> | Array<[number,number]>, minRange: number, maxRange: number, xAxisPoints: number[], eachSpacing: number, lineOption: LineExtra, process: number) {
    let boundaryGap = this.opts.xAxis!.boundaryGap;
    let points: Array<DataPoints|null> = [];
    let validHeight = this.opts.height - this.opts.area[0] - this.opts.area[2];
    let validWidth = this.opts.width - this.opts.area[1] - this.opts.area[3];
    data.forEach((item: number | null | [number,number], index: number) => {
      if (item === null) {
        points.push(null);
      } else {
        let point: DataPoints = {
          color: "",
          x: 0,
          y: 0
        };
        if(lineOption.animation == 'vertical'){
          point.x = xAxisPoints[index];
          let value = item;
          if (typeof item ==='object' && item !== null) {
            if (Array.isArray(item)) {
              let xranges: number[], xminRange: number, xmaxRange: number;
              xranges = [].concat(this.opts.chartData.xAxisData.ranges);
              xminRange = xranges.shift()!;
              xmaxRange = xranges.pop()!;
              value = item[1];
              point.x = this.opts.area[3] + validWidth * (item[0] - xminRange) / (xmaxRange - xminRange);
            }
          }
          if (boundaryGap == 'center') {
            point.x += eachSpacing / 2;
          }
          let height = validHeight * ((value as number) - minRange) / (maxRange - minRange);
          height *= process;
          point.y = this.opts.height - height - this.opts.area[2];
          points.push(point);
        }else{
          point.x = xAxisPoints[0] + eachSpacing * index * process;
          let value = item;
          if (boundaryGap == 'center') {
            point.x += eachSpacing / 2;
          }
          let height = validHeight * ((value as number) - minRange) / (maxRange - minRange);
          point.y = this.opts.height - height - this.opts.area[2];
          points.push(point);
        }
      }
    });
    return points;
  }

}
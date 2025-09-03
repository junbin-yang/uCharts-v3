import { ChartOptions, Point } from "../types";
import { ChartsUtil } from "../utils";
import { Animation } from '../animation';
import { BasePieRenderer, pieDataPointsRes } from "./pie";
import { Series } from "../types/series";
import { RoseExtra } from "../types/extra";
import { GlobalConfig } from '../types/config';
import { CanvasGradient } from "../../interface";
import { EventListener } from "../event";

/**
 * 玫瑰图渲染器
 */
export class RoseChartRenderer extends BasePieRenderer {
  constructor(opts: Partial<ChartOptions>, events: Record<string, EventListener[]> = {}) {
    super(opts, events);
    this.render();
  }

  protected render(): void {
    let series = this.opts.series;
    series = this.fixPieSeries(series);
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

    this.opts.chartData.yAxisData = {};
    this.opts.chartData.xAxisData = {};

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

    this.opts._pieTextMaxLength_ = this.opts.dataLabel === false ? 0 : this.getPieTextMaxLength(seriesMA);

    this.animation = new Animation({
      timing: this.opts.timing!,
      duration: duration,
      onProcess: (process: number) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.opts.rotate) {
          this.contextRotate();
        }
        this.opts.chartData.pieData = this.drawRoseDataPoints(series, process);
        this.drawLegend(this.opts.chartData);
        this.drawToolTipBridge(process);
        this.drawCanvas();
      },
      onFinish: () => {
        this.event.emit('renderComplete', this.opts);
      }
    });
  }

  private drawRoseDataPoints(series: Series[], process: number = 1) {
    let roseOption = ChartsUtil.objectAssign({} as RoseExtra, {
      type: 'area',
      activeOpacity: 0.5,
      activeRadius: 10,
      offsetAngle: 0,
      labelWidth: 15,
      border: false,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      linearType: 'none',
      customColor: [],
      reverse: false
    }, this.opts.extra.rose!);
    if (GlobalConfig.pieChartLinePadding == 0) {
      GlobalConfig.pieChartLinePadding = roseOption.activeRadius * this.opts.pixelRatio!;
    }
    let centerPosition: Point = {
      x: this.opts.area[3] + ((this.opts.width!) - this.opts.area[1] - this.opts.area[3]) / 2,
      y: this.opts.area[0] + ((this.opts.height!) - this.opts.area[0] - this.opts.area[2]) / 2
    };
    let radius = Math.min((this.opts.width - this.opts.area[1] - this.opts.area[3]) / 2 - GlobalConfig.pieChartLinePadding - GlobalConfig.pieChartTextPadding - this.opts._pieTextMaxLength_, (this.opts.height - this.opts.area[0] - this.opts.area[2]) / 2 - GlobalConfig.pieChartLinePadding - GlobalConfig.pieChartTextPadding);
    radius = radius < 10 ? 10 : radius;
    let minRadius = roseOption.minRadius || radius * 0.5;
    if(radius < minRadius){
      radius = minRadius + 10;
    }
    if(roseOption.reverse) series = ChartsUtil.clockwiseToCounterclockwise(series);
    series = this.getRoseDataPoints(series, roseOption.type, minRadius, radius, process);
    let activeRadius = roseOption.activeRadius * this.opts.pixelRatio!;
    roseOption.customColor = ChartsUtil.fillCustomColor(roseOption.linearType, roseOption.customColor, series);
    series = series.map((eachSeries) => {
      eachSeries._start_ += (roseOption.offsetAngle || 0) * Math.PI / 180;
      return eachSeries;
    });
    series.forEach((eachSeries, seriesIndex) => {
      if (this.opts.tooltip) {
        if (this.opts.tooltip.index == seriesIndex) {
          this.context.beginPath();
          this.setFillStyle(ChartsUtil.hexToRgb(eachSeries.color!, roseOption.activeOpacity || 0.5));
          this.context.moveTo(centerPosition.x, centerPosition.y);
          this.context.arc(centerPosition.x, centerPosition.y, activeRadius + eachSeries._radius_, eachSeries._start_, eachSeries._start_ + 2 * eachSeries._rose_proportion_ * Math.PI);
          this.context.closePath();
          this.context.fill();
        }
      }
      this.context.beginPath();
      this.setLineWidth(roseOption.borderWidth * this.opts.pixelRatio!);
      this.context.lineJoin = "round";
      this.setStrokeStyle(roseOption.borderColor);
      let fillcolor: CanvasGradient|string = eachSeries.color!;
      if (roseOption.linearType == 'custom') {
        let grd: CanvasGradient;
        if(this.context.createCircularGradient){
          grd = this.context.createCircularGradient(centerPosition.x, centerPosition.y, eachSeries._radius_)
        }else{
          grd = this.context.createRadialGradient(centerPosition.x, centerPosition.y, 0,centerPosition.x, centerPosition.y, eachSeries._radius_)
        }
        grd.addColorStop(0, ChartsUtil.hexToRgb(roseOption.customColor[eachSeries.linearIndex!], 1))
        grd.addColorStop(1, ChartsUtil.hexToRgb(eachSeries.color!, 1))
        fillcolor = grd
      }
      this.setFillStyle(fillcolor);
      this.context.moveTo(centerPosition.x, centerPosition.y);
      this.context.arc(centerPosition.x, centerPosition.y, eachSeries._radius_, eachSeries._start_, eachSeries._start_ + 2 * eachSeries._rose_proportion_ * Math.PI);
      this.context.closePath();
      this.context.fill();
      if (roseOption.border == true) {
        this.context.stroke();
      }
    });

    if (this.opts.dataLabel !== false && process === 1) {
      this.drawPieText(series, radius, centerPosition);
    }
    return {
      center: centerPosition,
      radius: radius,
      series: series
    } as pieDataPointsRes;
  }
}
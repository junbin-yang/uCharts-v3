import { ChartOptions, Point } from "../types";
import { ChartsUtil } from "../utils";
import { Animation } from '../animation';
import { Series, ArcBarSeries } from '../types/series';
import { ArcBarExtra } from "../types/extra";
import { CanvasGradient } from "../../interface";
import { BasePieRenderer, pieDataPointsRes } from "./pie";
import { EventListener } from "../event";

/**
 * 进度条渲染器
 */
export class ArcBarChartRenderer extends BasePieRenderer {
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

    this.animation = new Animation({
      timing: this.opts.timing!,
      duration: duration,
      onProcess: (process: number) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.opts.rotate) {
          this.contextRotate();
        }
        this.opts.chartData.arcbarData = this.drawArcBarDataPoints(series, process);
        this.drawCanvas();
      },
      onFinish: () => {
        this.event.emit('renderComplete', this.opts);
      }
    });
  }

  private drawArcBarDataPoints(series: Series[], process: number = 1) {
    let arcbarOption = ChartsUtil.objectAssign({} as ArcBarExtra, {
      startAngle: 0.75,
      endAngle: 0.25,
      type: 'default',
      direction: 'cw',
      lineCap: 'round',
      width: 12 ,
      gap: 2 ,
      linearType: 'none',
      customColor: [],
      backgroundColor: '#E9E9E9'
    }, this.opts.extra.arcbar!);
    series = this.getArcBarDataPoints(series, arcbarOption, process);
    let centerPosition: Point = {
      x: this.opts.width / 2,
      y: this.opts.height / 2
    };
    if (arcbarOption.centerX || arcbarOption.centerY) {
      centerPosition = {
        x: arcbarOption.centerX ? arcbarOption.centerX : this.opts.width / 2,
        y: arcbarOption.centerY ? arcbarOption.centerY : this.opts.height / 2
      };
    }
    let radius: number = 0;
    if (arcbarOption.radius) {
      radius = arcbarOption.radius;
    } else {
      radius = Math.min(centerPosition.x, centerPosition.y);
      radius -= 5 * this.opts.pixelRatio!;
      radius -= arcbarOption.width / 2;
    }
    radius = radius < 10 ? 10 : radius;
    arcbarOption.customColor = ChartsUtil.fillCustomColor(arcbarOption.linearType, arcbarOption.customColor, series);

    for (let i = 0; i < series.length; i++) {
      let eachSeries = series[i] as ArcBarSeries;
      //背景颜色
      this.setLineWidth(arcbarOption.width * this.opts.pixelRatio!);
      this.setStrokeStyle(arcbarOption.backgroundColor);
      this.setLineCap(arcbarOption.lineCap);
      this.context.beginPath();
      if (arcbarOption.type == 'default') {
        this.context.arc(centerPosition.x, centerPosition.y, radius - (arcbarOption.width * (this.opts.pixelRatio!) + arcbarOption.gap * (this.opts.pixelRatio!)) * i, arcbarOption.startAngle * Math.PI, arcbarOption.endAngle * Math.PI, arcbarOption.direction == 'ccw');
      } else {
        this.context.arc(centerPosition.x, centerPosition.y, radius - (arcbarOption.width * (this.opts.pixelRatio!) + arcbarOption.gap * (this.opts.pixelRatio!)) * i, 0, 2 * Math.PI, arcbarOption.direction == 'ccw');
      }
      this.context.stroke();
      //进度条
      let fillColor: string|CanvasGradient = eachSeries.color!
      if(arcbarOption.linearType == 'custom'){
        let grd = this.context.createLinearGradient(centerPosition.x - radius, centerPosition.y, centerPosition.x + radius, centerPosition.y);
        grd.addColorStop(1, ChartsUtil.hexToRgb(arcbarOption.customColor[eachSeries.linearIndex!], 1))
        grd.addColorStop(0, ChartsUtil.hexToRgb(eachSeries.color!, 1))
        fillColor = grd;
      }
      this.setLineWidth(arcbarOption.width * this.opts.pixelRatio!);
      this.setStrokeStyle(fillColor);
      this.setLineCap(arcbarOption.lineCap);
      this.context.beginPath();
      this.context.arc(centerPosition.x, centerPosition.y, radius - (arcbarOption.width * (this.opts.pixelRatio!) + arcbarOption.gap * (this.opts.pixelRatio!)) * i, arcbarOption.startAngle * Math.PI, eachSeries._proportion_ * Math.PI, arcbarOption.direction == 'ccw');
      this.context.stroke();
    }
    this.drawRingTitle(centerPosition);
    return {
      center: centerPosition,
      radius: radius,
      series: series
    } as pieDataPointsRes;
  }

  private getArcBarDataPoints(series: Series[], arcbarOption: ArcBarExtra, process: number = 1) {
    if (process == 1) {
      process = 0.999999;
    }
    for (let i = 0; i < series.length; i++) {
      let item = series[i];
      item.data = item.data === null ? 0 : item.data;
      let totalAngle = 0;
      if (arcbarOption.type == 'circle') {
        totalAngle = 2;
      } else {
        if(arcbarOption.direction == 'ccw'){
          if (arcbarOption.startAngle < arcbarOption.endAngle) {
            totalAngle = 2 + arcbarOption.startAngle - arcbarOption.endAngle;
          } else {
            totalAngle = arcbarOption.startAngle - arcbarOption.endAngle;
          }
        }else{
          if (arcbarOption.endAngle < arcbarOption.startAngle) {
            totalAngle = 2 + arcbarOption.endAngle - arcbarOption.startAngle;
          } else {
            totalAngle = arcbarOption.startAngle - arcbarOption.endAngle;
          }
        }
      }
      item._proportion_ = totalAngle * item.data * process + arcbarOption.startAngle;
      if(arcbarOption.direction == 'ccw'){
        item._proportion_ = arcbarOption.startAngle - totalAngle * item.data * process;
      }
      if (item._proportion_ >= 2) {
        item._proportion_ = item._proportion_ % 2;
      }
    }
    return series;
  }

}
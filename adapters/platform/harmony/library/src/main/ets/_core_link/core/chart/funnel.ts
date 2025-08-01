import { ChartOptions, Point } from "../types";
import { ChartsUtil } from "../utils";
import { Animation } from '../animation';
import { pieDataPointsRes } from "./pie";
import { Series } from "../types/series";
import { FunnelExtra } from "../types/extra";
import { CanvasGradient } from "../../interface";
import { BaseRenderer } from "./base";
import { EventListener } from "../event";

/**
 * 漏斗图渲染器
 */
export class FunnelChartRenderer extends BaseRenderer {
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
        this.opts.chartData.funnelData = this.drawFunnelDataPoints(series, process);
        this.drawLegend(this.opts.chartData);
        this.drawToolTipBridge(process);
        this.drawCanvas();
      },
      onFinish: () => {
        this.event.emit('renderComplete', this.opts);
      }
    });
  }

  private drawFunnelDataPoints(series: Series[], process: number = 1) {
    let funnelOption = ChartsUtil.objectAssign({} as FunnelExtra, {
      type:'funnel',
      activeWidth: 10,
      activeOpacity: 0.3,
      border: false,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      fillOpacity: 1,
      minSize: 0,
      labelAlign: 'right',
      linearType: 'none',
      customColor: [],
    }, this.opts.extra.funnel!);
    let eachSpacing = (this.opts.height - this.opts.area[0] - this.opts.area[2]) / series.length;
    let centerPosition: Point = {
      x: this.opts.area[3] + (this.opts.width - this.opts.area[1] - this.opts.area[3]) / 2,
      y: this.opts.height - this.opts.area[2]
    };
    let activeWidth = funnelOption.activeWidth * this.opts.pixelRatio!;
    let radius = Math.min((this.opts.width - this.opts.area[1] - this.opts.area[3]) / 2 - activeWidth, (this.opts.height - this.opts.area[0] - this.opts.area[2]) / 2 - activeWidth);
    let seriesNew = this.getFunnelDataPoints(series, radius, funnelOption, eachSpacing, process);
    this.context.save();
    this.context.translate(centerPosition.x, centerPosition.y);
    funnelOption.customColor = ChartsUtil.fillCustomColor(funnelOption.linearType, funnelOption.customColor, series);
    if(funnelOption.type == 'pyramid'){
      for (let i = 0; i < seriesNew.length; i++) {
        if (i == seriesNew.length -1) {
          if (this.opts.tooltip) {
            if (this.opts.tooltip.index == i) {
              this.context.beginPath();
              this.setFillStyle(ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.activeOpacity));
              this.context.moveTo(-activeWidth, -eachSpacing);
              this.context.lineTo(-seriesNew[i].radius - activeWidth, 0);
              this.context.lineTo(seriesNew[i].radius + activeWidth, 0);
              this.context.lineTo(activeWidth, -eachSpacing);
              this.context.lineTo(-activeWidth, -eachSpacing);
              this.context.closePath();
              this.context.fill();
            }
          }
          seriesNew[i].funnelArea = [centerPosition.x - seriesNew[i].radius, centerPosition.y - eachSpacing * (i + 1), centerPosition.x + seriesNew[i].radius, centerPosition.y - eachSpacing * i];
          this.context.beginPath();
          this.setLineWidth(funnelOption.borderWidth * this.opts.pixelRatio!);
          this.setStrokeStyle(funnelOption.borderColor);
          let fillColor: CanvasGradient|string = ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity);
          if (funnelOption.linearType == 'custom') {
            let grd = this.context.createLinearGradient(seriesNew[i].radius, -eachSpacing, -seriesNew[i].radius, -eachSpacing);
            grd.addColorStop(0, ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity));
            grd.addColorStop(0.5, ChartsUtil.hexToRgb(funnelOption.customColor[seriesNew[i].linearIndex!], funnelOption.fillOpacity));
            grd.addColorStop(1, ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity));
            fillColor = grd
          }
          this.setFillStyle(fillColor);
          this.context.moveTo(0, -eachSpacing);
          this.context.lineTo(-seriesNew[i].radius, 0);
          this.context.lineTo(seriesNew[i].radius, 0);
          this.context.lineTo(0, -eachSpacing);
          this.context.closePath();
          this.context.fill();
          if (funnelOption.border == true) {
            this.context.stroke();
          }
        } else {
          if (this.opts.tooltip) {
            if (this.opts.tooltip.index == i) {
              this.context.beginPath();
              this.setFillStyle(ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.activeOpacity));
              this.context.moveTo(0, 0);
              this.context.lineTo(-seriesNew[i].radius - activeWidth, 0);
              this.context.lineTo(-seriesNew[i + 1].radius - activeWidth, -eachSpacing);
              this.context.lineTo(seriesNew[i + 1].radius + activeWidth, -eachSpacing);
              this.context.lineTo(seriesNew[i].radius + activeWidth, 0);
              this.context.lineTo(0, 0);
              this.context.closePath();
              this.context.fill();
            }
          }
          seriesNew[i].funnelArea = [centerPosition.x - seriesNew[i].radius, centerPosition.y - eachSpacing * (i + 1), centerPosition.x + seriesNew[i].radius, centerPosition.y - eachSpacing * i];
          this.context.beginPath();
          this.setLineWidth(funnelOption.borderWidth * this.opts.pixelRatio!);
          this.setStrokeStyle(funnelOption.borderColor);
          let fillColor: CanvasGradient|string = ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity);
          if (funnelOption.linearType == 'custom') {
            let grd = this.context.createLinearGradient(seriesNew[i].radius, -eachSpacing, -seriesNew[i].radius, -eachSpacing);
            grd.addColorStop(0, ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity));
            grd.addColorStop(0.5, ChartsUtil.hexToRgb(funnelOption.customColor[seriesNew[i].linearIndex!], funnelOption.fillOpacity));
            grd.addColorStop(1, ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity));
            fillColor = grd
          }
          this.setFillStyle(fillColor);
          this.context.moveTo(0, 0);
          this.context.lineTo(-seriesNew[i].radius, 0);
          this.context.lineTo(-seriesNew[i + 1].radius, -eachSpacing);
          this.context.lineTo(seriesNew[i + 1].radius, -eachSpacing);
          this.context.lineTo(seriesNew[i].radius, 0);
          this.context.lineTo(0, 0);
          this.context.closePath();
          this.context.fill();
          if (funnelOption.border == true) {
            this.context.stroke();
          }
        }
        this.context.translate(0, -eachSpacing)
      }
    }else{
      this.context.translate(0, - (seriesNew.length - 1) * eachSpacing);
      for (let i = 0; i < seriesNew.length; i++) {
        if (i == seriesNew.length - 1) {
          if (this.opts.tooltip) {
            if (this.opts.tooltip.index == i) {
              this.context.beginPath();
              this.setFillStyle(ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.activeOpacity));
              this.context.moveTo(-activeWidth - funnelOption.minSize/2, 0);
              this.context.lineTo(-seriesNew[i].radius - activeWidth, -eachSpacing);
              this.context.lineTo(seriesNew[i].radius + activeWidth, -eachSpacing);
              this.context.lineTo(activeWidth + funnelOption.minSize/2, 0);
              this.context.lineTo(-activeWidth - funnelOption.minSize/2, 0);
              this.context.closePath();
              this.context.fill();
            }
          }
          seriesNew[i].funnelArea = [centerPosition.x - seriesNew[i].radius, centerPosition.y - eachSpacing, centerPosition.x + seriesNew[i].radius, centerPosition.y ];
          this.context.beginPath();
          this.setLineWidth(funnelOption.borderWidth * this.opts.pixelRatio!);
          this.setStrokeStyle(funnelOption.borderColor);
          let fillColor: CanvasGradient|string = ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity);
          if (funnelOption.linearType == 'custom') {
            let grd = this.context.createLinearGradient(seriesNew[i].radius, -eachSpacing, -seriesNew[i].radius, -eachSpacing);
            grd.addColorStop(0, ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity));
            grd.addColorStop(0.5, ChartsUtil.hexToRgb(funnelOption.customColor[seriesNew[i].linearIndex!], funnelOption.fillOpacity));
            grd.addColorStop(1, ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity));
            fillColor = grd
          }
          this.setFillStyle(fillColor);
          this.context.moveTo(0, 0);
          this.context.lineTo(-funnelOption.minSize/2, 0);
          this.context.lineTo(-seriesNew[i].radius, -eachSpacing);
          this.context.lineTo(seriesNew[i].radius, -eachSpacing);
          this.context.lineTo(funnelOption.minSize/2, 0);
          this.context.lineTo(0, 0);
          this.context.closePath();
          this.context.fill();
          if (funnelOption.border == true) {
            this.context.stroke();
          }
        } else {
          if (this.opts.tooltip) {
            if (this.opts.tooltip.index == i) {
              this.context.beginPath();
              this.setFillStyle(ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.activeOpacity));
              this.context.moveTo(0, 0);
              this.context.lineTo(-seriesNew[i + 1].radius - activeWidth, 0);
              this.context.lineTo(-seriesNew[i].radius - activeWidth, -eachSpacing);
              this.context.lineTo(seriesNew[i].radius + activeWidth, -eachSpacing);
              this.context.lineTo(seriesNew[i + 1].radius + activeWidth, 0);
              this.context.lineTo(0, 0);
              this.context.closePath();
              this.context.fill();
            }
          }
          seriesNew[i].funnelArea = [centerPosition.x - seriesNew[i].radius, centerPosition.y - eachSpacing * (seriesNew.length - i), centerPosition.x + seriesNew[i].radius, centerPosition.y - eachSpacing * (seriesNew.length - i - 1)];
          this.context.beginPath();
          this.setLineWidth(funnelOption.borderWidth * this.opts.pixelRatio!);
          this.setStrokeStyle(funnelOption.borderColor);
          let fillColor: CanvasGradient|string = ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity);
          if (funnelOption.linearType == 'custom') {
            let grd = this.context.createLinearGradient(seriesNew[i].radius, -eachSpacing, -seriesNew[i].radius, -eachSpacing);
            grd.addColorStop(0, ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity));
            grd.addColorStop(0.5, ChartsUtil.hexToRgb(funnelOption.customColor[seriesNew[i].linearIndex!], funnelOption.fillOpacity));
            grd.addColorStop(1, ChartsUtil.hexToRgb(seriesNew[i].color!, funnelOption.fillOpacity));
            fillColor = grd
          }
          this.setFillStyle(fillColor);
          this.context.moveTo(0, 0);
          this.context.lineTo(-seriesNew[i + 1].radius, 0);
          this.context.lineTo(-seriesNew[i].radius, -eachSpacing);
          this.context.lineTo(seriesNew[i].radius, -eachSpacing);
          this.context.lineTo(seriesNew[i + 1].radius, 0);
          this.context.lineTo(0, 0);
          this.context.closePath();
          this.context.fill();
          if (funnelOption.border == true) {
            this.context.stroke();
          }
        }
        this.context.translate(0, eachSpacing)
      }
    }

    this.context.restore();
    if (this.opts.dataLabel !== false && process === 1) {
      this.drawFunnelText(seriesNew, eachSpacing, funnelOption.labelAlign, activeWidth, centerPosition);
    }
    if (process === 1) {
      this.drawFunnelCenterText(seriesNew, eachSpacing, funnelOption.labelAlign, activeWidth, centerPosition);
    }
    return {
      center: centerPosition,
      radius: radius,
      series: seriesNew
    } as pieDataPointsRes;
  }

  private getFunnelDataPoints(series: Series[], radius: number, option: FunnelExtra, eachSpacing: number, process: number = 1) {
    for (let i = 0; i < series.length; i++) {
      if(option.type == 'funnel'){
        series[i].radius = series[i].data / series[0].data * radius * process;
      }else{
        series[i].radius =  (eachSpacing * (series.length - i)) / (eachSpacing * series.length) * radius * process;
      }
      series[i]._proportion_ = series[i].data / series[0].data;
    }
    // if(option.type !== 'pyramid'){
    //   series.reverse();
    // }
    return series;
  }

  private drawFunnelText(series: Series[], eachSpacing: number, labelAlign: string, activeWidth: number, centerPosition: Point) {
    for (let i = 0; i < series.length; i++) {
      let item = series[i];
      if(item.labelShow === false){
        continue;
      }
      let startX, endX, startY, fontSize;
      let text = item.formatter ? item.formatter(String(item.data), i, series, this.opts) : ChartsUtil.toFixed(item._proportion_ * 100) + '%';
      text = item.labelText ? item.labelText : text;
      if (labelAlign == 'right') {
        if (i == series.length -1) {
          startX = (item.funnelArea[2] + centerPosition.x) / 2;
        } else {
          startX = (item.funnelArea[2] + series[i + 1].funnelArea[2]) / 2;
        }
        endX = startX + activeWidth * 2;
        startY = item.funnelArea[1] + eachSpacing / 2;
        fontSize = item.textSize ? item.textSize * this.opts.pixelRatio! : this.opts.fontSize! * this.opts.pixelRatio!;
        this.setLineWidth(1 * this.opts.pixelRatio!);
        this.setStrokeStyle(item.color!);
        this.setFillStyle(item.color!);
        this.context.beginPath();
        this.context.moveTo(startX, startY);
        this.context.lineTo(endX, startY);
        this.context.stroke();
        this.context.closePath();
        this.context.beginPath();
        this.context.moveTo(endX, startY);
        this.context.arc(endX, startY, 2 * this.opts.pixelRatio!, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.fill();
        this.context.beginPath();
        this.setFontSize(fontSize);
        this.setFillStyle(item.textColor || this.opts.fontColor!);
        this.context.fillText(text, endX + 5, startY + fontSize / 2 - 2);
        this.context.closePath();
        this.context.stroke();
        this.context.closePath();
      }
      if (labelAlign == 'left') {
        if (i == series.length -1) {
          startX = (item.funnelArea[0] + centerPosition.x) / 2;
        } else {
          startX = (item.funnelArea[0] + series[i + 1].funnelArea[0]) / 2;
        }
        endX = startX - activeWidth * 2;
        startY = item.funnelArea[1] + eachSpacing / 2;
        fontSize = item.textSize ? item.textSize * this.opts.pixelRatio! : this.opts.fontSize! * this.opts.pixelRatio!;
        this.setLineWidth(1 * this.opts.pixelRatio!);
        this.setStrokeStyle(item.color!);
        this.setFillStyle(item.color!);
        this.context.beginPath();
        this.context.moveTo(startX, startY);
        this.context.lineTo(endX, startY);
        this.context.stroke();
        this.context.closePath();
        this.context.beginPath();
        this.context.moveTo(endX, startY);
        this.context.arc(endX, startY, 2, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.fill();
        this.context.beginPath();
        this.setFontSize(fontSize);
        this.setFillStyle(item.textColor || this.opts.fontColor!);
        this.context.fillText(text, endX - 5 - this.measureText(text, fontSize), startY + fontSize / 2 - 2);
        this.context.closePath();
        this.context.stroke();
        this.context.closePath();
      }
    }
  }

  private drawFunnelCenterText(series: Series[], eachSpacing: number, labelAlign: string, activeWidth: number, centerPosition: Point) {
    for (let i = 0; i < series.length; i++) {
      let item = series[i];
      let startY, fontSize;
      if (item.centerText) {
        startY = item.funnelArea[1] + eachSpacing / 2;
        fontSize = item.centerTextSize * this.opts.pixelRatio! || this.opts.fontSize! * this.opts.pixelRatio!;
        this.context.beginPath();
        this.setFontSize(fontSize);
        this.setFillStyle(item.centerTextColor || "#FFFFFF");
        this.context.fillText(item.centerText, centerPosition.x - this.measureText(item.centerText, fontSize) / 2, startY + fontSize / 2 - 2);
        this.context.closePath();
        this.context.stroke();
        this.context.closePath();
      }
    }
  }

}
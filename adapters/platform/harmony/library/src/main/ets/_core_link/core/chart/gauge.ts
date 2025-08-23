import { ChartOptions, Point } from "../types";
import { ChartsUtil } from "../utils";
import { Animation } from '../animation';
import { Series, GaugeSeries, ValueAndColorData } from '../types/series';
import { GaugeExtra } from "../types/extra";
import { CanvasGradient } from "../../interface";
import { BasePieRenderer, pieDataPointsRes } from "./pie";
import { EventListener } from "../event";

/**
 * 仪表盘渲染器
 */
export class GaugeChartRenderer extends BasePieRenderer {
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
        this.opts.chartData.gaugeData = this.drawGaugeDataPoints(this.opts.categories as Array<Partial<ValueAndColorData>>, series, process);
        this.drawCanvas();
      },
      onFinish: () => {
        this.event.emit('renderComplete', this.opts);
      }
    });
  }

  private drawGaugeDataPoints(categories: Array<Partial<ValueAndColorData>>, series: Series[], process: number = 1) {
    let gaugeOption = ChartsUtil.objectAssign({} as GaugeExtra, {
      type: 'default',
      startAngle: 0.75,
      endAngle: 0.25,
      width: 15,
      labelOffset:13,
      splitLine: {
        fixRadius: 0,
        splitNumber: 10,
        width: 15,
        color: '#FFFFFF',
        childNumber: 5,
        childWidth: 5
      },
      pointer: {
        width: 15,
        color: 'auto'
      },
      labelColor: this.opts.fontColor!
    }, this.opts.extra.gauge!);
    if (gaugeOption.oldAngle == undefined) {
      gaugeOption.oldAngle = gaugeOption.startAngle;
    }
    if (gaugeOption.oldData == undefined) {
      gaugeOption.oldData = 0;
    }
    categories = this.getGaugeAxisPoints(categories, gaugeOption.startAngle, gaugeOption.endAngle);
    let centerPosition: Point = {
      x: this.opts.width / 2,
      y: this.opts.height / 2
    };
    let radius = Math.min(centerPosition.x, centerPosition.y);
    radius -= 5 * this.opts.pixelRatio!;
    radius -= gaugeOption.width / 2;
    radius = radius < 10 ? 10 : radius;
    let innerRadius = radius - gaugeOption.width;
    let totalAngle = 0;
    //判断仪表盘的样式：default百度样式，progress新样式
    if (gaugeOption.type == 'progress') {
      //## 第一步画中心圆形背景和进度条背景
      //中心圆形背景
      let pieRadius = radius - gaugeOption.width * 3;
      this.context.beginPath();
      let gradient = this.context.createLinearGradient(centerPosition.x, centerPosition.y - pieRadius, centerPosition.x, centerPosition.y + pieRadius);
      //配置渐变填充（起点：中心点向上减半径；结束点中心点向下加半径）
      gradient.addColorStop(0, ChartsUtil.hexToRgb(series[0].color!, 0.3));
      gradient.addColorStop(1.0, ChartsUtil.hexToRgb("#FFFFFF", 0.1));
      this.setFillStyle(gradient);
      this.context.arc(centerPosition.x, centerPosition.y, pieRadius, 0, 2 * Math.PI, false);
      this.context.fill();
      //画进度条背景
      this.setLineWidth(gaugeOption.width);
      this.setStrokeStyle(ChartsUtil.hexToRgb(series[0].color!, 0.3));
      this.setLineCap('round');
      this.context.beginPath();
      this.context.arc(centerPosition.x, centerPosition.y, innerRadius, gaugeOption.startAngle * Math.PI, gaugeOption.endAngle * Math.PI, false);
      this.context.stroke();
      //## 第二步画刻度线
      if (gaugeOption.endAngle < gaugeOption.startAngle) {
        totalAngle = 2 + gaugeOption.endAngle - gaugeOption.startAngle;
      } else {
        totalAngle = gaugeOption.startAngle - gaugeOption.endAngle;
      }
      let splitAngle = totalAngle / gaugeOption.splitLine.splitNumber!;
      let childAngle = totalAngle / (gaugeOption.splitLine.splitNumber!) / (gaugeOption.splitLine.childNumber!);
      let startX = -radius - gaugeOption.width * 0.5 - (gaugeOption.splitLine.fixRadius!);
      let endX = -radius - gaugeOption.width - (gaugeOption.splitLine.fixRadius!) + (gaugeOption.splitLine.width!);
      this.context.save();
      this.context.translate(centerPosition.x, centerPosition.y);
      this.context.rotate((gaugeOption.startAngle - 1) * Math.PI);
      let len = (gaugeOption.splitLine.splitNumber!) * (gaugeOption.splitLine.childNumber!) + 1;
      let proc = series[0].data * process;
      for (let i = 0; i < len; i++) {
        this.context.beginPath();
        //刻度线随进度变色
        if (proc > (i / len)) {
          this.setStrokeStyle(ChartsUtil.hexToRgb(series[0].color!, 1));
        } else {
          this.setStrokeStyle(ChartsUtil.hexToRgb(series[0].color!, 0.3));
        }
        this.setLineWidth(3 * this.opts.pixelRatio!);
        this.context.moveTo(startX, 0);
        this.context.lineTo(endX, 0);
        this.context.stroke();
        this.context.rotate(childAngle * Math.PI);
      }
      this.context.restore();
      //## 第三步画进度条
      series = this.getGaugeArcBarDataPoints(series, gaugeOption, process);
      this.setLineWidth(gaugeOption.width);
      this.setStrokeStyle(series[0].color!);
      this.setLineCap('round');
      this.context.beginPath();
      this.context.arc(centerPosition.x, centerPosition.y, innerRadius, gaugeOption.startAngle * Math.PI, series[0]._proportion_ * Math.PI, false);
      this.context.stroke();
      //## 第四步画指针
      let pointerRadius = radius - gaugeOption.width * 2.5;
      this.context.save();
      this.context.translate(centerPosition.x, centerPosition.y);
      this.context.rotate((series[0]._proportion_ - 1) * Math.PI);
      this.context.beginPath();
      this.setLineWidth(gaugeOption.width / 3);
      let gradient3 = this.context.createLinearGradient(0, -pointerRadius * 0.6, 0, pointerRadius * 0.6);
      gradient3.addColorStop(0, ChartsUtil.hexToRgb('#FFFFFF', 0));
      gradient3.addColorStop(0.5, ChartsUtil.hexToRgb(series[0].color!, 1));
      gradient3.addColorStop(1.0, ChartsUtil.hexToRgb('#FFFFFF', 0));
      this.setStrokeStyle(gradient3);
      this.context.arc(0, 0, pointerRadius, 0.85 * Math.PI, 1.15 * Math.PI, false);
      this.context.stroke();
      this.context.beginPath();
      this.setLineWidth(1);
      this.setStrokeStyle(series[0].color!);
      this.setFillStyle(series[0].color!);
      this.context.moveTo(-pointerRadius - gaugeOption.width / 3 / 2, -4);
      this.context.lineTo(-pointerRadius - gaugeOption.width / 3 / 2 - 4, 0);
      this.context.lineTo(-pointerRadius - gaugeOption.width / 3 / 2, 4);
      this.context.lineTo(-pointerRadius - gaugeOption.width / 3 / 2, -4);
      this.context.stroke();
      this.context.fill();
      this.context.restore();
      //default百度样式
    } else {
      //画背景
      this.setLineWidth(gaugeOption.width);
      this.setLineCap('butt');
      for (let i = 0; i < categories.length; i++) {
        let eachCategories = categories[i];
        this.context.beginPath();
        this.setStrokeStyle(eachCategories.color!);
        this.context.arc(centerPosition.x, centerPosition.y, radius, eachCategories._startAngle_ * Math.PI, eachCategories._endAngle_ * Math.PI, false);
        this.context.stroke();
      }
      this.context.save();
      //画刻度线
      if (gaugeOption.endAngle < gaugeOption.startAngle) {
        totalAngle = 2 + gaugeOption.endAngle - gaugeOption.startAngle;
      } else {
        totalAngle = gaugeOption.startAngle - gaugeOption.endAngle;
      }
      let splitAngle = totalAngle / gaugeOption.splitLine.splitNumber!;
      let childAngle = totalAngle / (gaugeOption.splitLine.splitNumber!) / (gaugeOption.splitLine.childNumber!);
      let startX = -radius - gaugeOption.width * 0.5 - (gaugeOption.splitLine.fixRadius!);
      let endX = -radius - gaugeOption.width * 0.5 - (gaugeOption.splitLine.fixRadius!) + (gaugeOption.splitLine.width!);
      let childendX = -radius - gaugeOption.width * 0.5 - (gaugeOption.splitLine.fixRadius!) + (gaugeOption.splitLine.childWidth!);
      this.context.translate(centerPosition.x, centerPosition.y);
      this.context.rotate((gaugeOption.startAngle - 1) * Math.PI);
      for (let i = 0; i < (gaugeOption.splitLine.splitNumber!) + 1; i++) {
        this.context.beginPath();
        this.setStrokeStyle(gaugeOption.splitLine.color!);
        this.setLineWidth(2 * this.opts.pixelRatio!);
        this.context.moveTo(startX, 0);
        this.context.lineTo(endX, 0);
        this.context.stroke();
        this.context.rotate(splitAngle * Math.PI);
      }
      this.context.restore();
      this.context.save();
      this.context.translate(centerPosition.x, centerPosition.y);
      this.context.rotate((gaugeOption.startAngle - 1) * Math.PI);
      for (let i = 0; i < (gaugeOption.splitLine.splitNumber!) * (gaugeOption.splitLine.childNumber!) + 1; i++) {
        this.context.beginPath();
        this.setStrokeStyle(gaugeOption.splitLine.color!);
        this.setLineWidth(1 * this.opts.pixelRatio!);
        this.context.moveTo(startX, 0);
        this.context.lineTo(childendX, 0);
        this.context.stroke();
        this.context.rotate(childAngle * Math.PI);
      }
      this.context.restore();
      //画指针
      series = this.getGaugeDataPoints(series, categories, gaugeOption, process);
      for (let i = 0; i < series.length; i++) {
        let eachSeries = series[i];
        this.context.save();
        this.context.translate(centerPosition.x, centerPosition.y);
        this.context.rotate((eachSeries._proportion_ - 1) * Math.PI);
        this.context.beginPath();
        this.setFillStyle(eachSeries.color!);
        this.context.moveTo(gaugeOption.pointer.width!, 0);
        this.context.lineTo(0, -(gaugeOption.pointer.width!) / 2);
        this.context.lineTo(-innerRadius, 0);
        this.context.lineTo(0, (gaugeOption.pointer.width!) / 2);
        this.context.lineTo(gaugeOption.pointer.width!, 0);
        this.context.closePath();
        this.context.fill();
        this.context.beginPath();
        this.setFillStyle('#FFFFFF');
        this.context.arc(0, 0, (gaugeOption.pointer.width!) / 6, 0, 2 * Math.PI, false);
        this.context.fill();
        this.context.restore();
      }
      if (this.opts.dataLabel !== false) {
        this.drawGaugeLabel(gaugeOption, radius, centerPosition);
      }
    }
    //画仪表盘标题，副标题
    this.drawRingTitle(centerPosition);
    if (process === 1 && this.opts.type === 'gauge') {
      this.opts.extra.gauge!.oldAngle = series[0]._proportion_;
      this.opts.extra.gauge!.oldData = series[0].data;
    }
    return {
      center: centerPosition,
      radius: radius,
      innerRadius: innerRadius,
      categories: categories,
      totalAngle: totalAngle
    };
  }

  private getGaugeAxisPoints(categories: Array<Partial<ValueAndColorData>>, startAngle: number, endAngle: number) {
    let totalAngle = startAngle - endAngle;
    if (endAngle < startAngle) {
      totalAngle = 2 + endAngle - startAngle;
    }
    let tempStartAngle = startAngle;
    for (let i = 0; i < categories.length; i++) {
      categories[i].value = (categories[i].value == undefined || categories[i].value == null) ? 0 : categories[i].value;
      categories[i]._startAngle_ = tempStartAngle;
      categories[i]._endAngle_ = totalAngle * (categories[i].value!) + startAngle;
      if (categories[i]._endAngle_ >= 2) {
        categories[i]._endAngle_ = categories[i]._endAngle_ % 2;
      }
      tempStartAngle = categories[i]._endAngle_;
    }
    return categories;
  }

  //??
  private getGaugeArcBarDataPoints(series: Series[], arcbarOption: GaugeExtra, process: number = 1) {
    if (process == 1) {
      process = 0.999999;
    }
    for (let i = 0; i < series.length; i++) {
      let item = series[i];
      item.data = item.data === null ? 0 : item.data;
      let totalAngle;
      if (0/*arcbarOption.type == 'circle'*/) {
        totalAngle = 2;
      } else {
        if (arcbarOption.endAngle < arcbarOption.startAngle) {
          totalAngle = 2 + arcbarOption.endAngle - arcbarOption.startAngle;
        } else {
          totalAngle = arcbarOption.startAngle - arcbarOption.endAngle;
        }
      }
      item._proportion_ = totalAngle * item.data * process + arcbarOption.startAngle;
      if (item._proportion_ >= 2) {
        item._proportion_ = item._proportion_ % 2;
      }
    }
    return series;
  }

  private getGaugeDataPoints(series: Series[], categories: Array<Partial<ValueAndColorData>>, gaugeOption: GaugeExtra, process: number = 1) {
    for (let i = 0; i < series.length; i++) {
      let item = series[i];
      item.data = item.data === null ? 0 : item.data;
      if (gaugeOption.pointer.color == 'auto') {
        for (let i = 0; i < categories.length; i++) {
          if (item.data <= categories[i].value!) {
            if(categories[i].color) item.color = categories[i].color!;
            break;
          }
        }
      } else {
        item.color = gaugeOption.pointer.color!;
      }
      let totalAngle;
      if (gaugeOption.endAngle < gaugeOption.startAngle) {
        totalAngle = 2 + gaugeOption.endAngle - gaugeOption.startAngle;
      } else {
        totalAngle = gaugeOption.startAngle - gaugeOption.endAngle;
      }
      item._endAngle_ = totalAngle * item.data + gaugeOption.startAngle;
      item._oldAngle_ = gaugeOption.oldAngle;
      if (gaugeOption.oldAngle < gaugeOption.endAngle) {
        item._oldAngle_ += 2;
      }
      if (item.data >= gaugeOption.oldData) {
        item._proportion_ = (item._endAngle_ - item._oldAngle_) * process + gaugeOption.oldAngle;
      } else {
        item._proportion_ = item._oldAngle_ - (item._oldAngle_ - item._endAngle_) * process;
      }
      if (item._proportion_ >= 2) {
        item._proportion_ = item._proportion_ % 2;
      }
    }
    return series;
  }

  private drawGaugeLabel(gaugeOption: GaugeExtra, radius: number, centerPosition: Point) {
    radius -= gaugeOption.width / 2 + gaugeOption.labelOffset * this.opts.pixelRatio!;
    radius = radius < 10 ? 10 : radius;
    let totalAngle = gaugeOption.startAngle - gaugeOption.endAngle;
    if (gaugeOption.endAngle < gaugeOption.startAngle) {
      totalAngle = 2 + gaugeOption.endAngle - gaugeOption.startAngle;
    }
    let splitAngle = totalAngle / (gaugeOption.splitLine.splitNumber!);
    let totalNumber = gaugeOption.endNumber - gaugeOption.startNumber;
    let splitNumber = totalNumber / (gaugeOption.splitLine.splitNumber!);
    let nowAngle = gaugeOption.startAngle;
    let nowNumber = gaugeOption.startNumber;
    for (let i = 0; i < (gaugeOption.splitLine.splitNumber!) + 1; i++) {
      let pos: Point = {
        x: radius * Math.cos(nowAngle * Math.PI),
        y: radius * Math.sin(nowAngle * Math.PI)
      };
      let labelText = gaugeOption.formatter ? gaugeOption.formatter(nowNumber, i, this.opts) : nowNumber;
      pos.x += centerPosition.x - this.measureText(String(labelText), this.opts.fontSize!) / 2;
      pos.y += centerPosition.y;
      let startX = pos.x;
      let startY = pos.y;
      this.context.beginPath();
      this.setFontSize(this.opts.fontSize!);
      this.setFillStyle(gaugeOption.labelColor);
      this.context.fillText(String(labelText), startX, startY + (this.opts.fontSize!) / 2);
      this.context.closePath();
      this.context.stroke();
      nowAngle += splitAngle;
      if (nowAngle >= 2) {
        nowAngle = nowAngle % 2;
      }
      nowNumber += splitNumber;
    }
  }

}
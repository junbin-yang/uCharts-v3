import { ChartOptions, Point } from "../types";
import { ChartsUtil } from "../utils";
import { BaseRenderer } from "./base";
import { Animation } from '../animation';
import { Series } from '../types/series';
import { PieExtra, RingExtra } from '../types/extra';
import { GlobalConfig } from '../types/config';
import { CanvasGradient } from "../../interface";

/**
 * 抽象饼状图、环形图和玫瑰图通用的部分
 */
export abstract class BasePieRenderer extends BaseRenderer {
  protected drawPieOrRingDataPoints(series: Series[], process: number = 1) {
    let pieOption = ChartsUtil.objectAssign({} as PieExtra & RingExtra, {
      activeOpacity: 0.5,
      activeRadius: 10,
      offsetAngle: 0,
      labelWidth: 15,
      ringWidth: 30,
      customRadius: 0,
      border: false,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      centerColor: '#FFFFFF',
      linearType: 'none',
      customColor: [],
    }, this.opts.type == "pie" ? this.opts.extra.pie! : this.opts.extra.ring!);
    let centerPosition: Point = {
      x: this.opts.area[3] + (this.opts.width - this.opts.area[1] - this.opts.area[3]) / 2,
      y: this.opts.area[0] + (this.opts.height - this.opts.area[0] - this.opts.area[2]) / 2
    };
    if (GlobalConfig.pieChartLinePadding == 0) {
      GlobalConfig.pieChartLinePadding = pieOption.activeRadius * this.opts.pixelRatio;
    }

    let radius = Math.min((this.opts.width - this.opts.area[1] - this.opts.area[3]) / 2 - GlobalConfig.pieChartLinePadding - GlobalConfig.pieChartTextPadding - this.opts._pieTextMaxLength_, (this.opts.height - this.opts.area[0] - this.opts.area[2]) / 2 - GlobalConfig.pieChartLinePadding - GlobalConfig.pieChartTextPadding);
    radius = radius < 10 ? 10 : radius;
    if (pieOption.customRadius > 0) {
      radius = pieOption.customRadius * this.opts.pixelRatio;
    }
    series = this.getPieDataPoints(series, radius, process);
    let activeRadius = pieOption.activeRadius *  this.opts.pixelRatio;
    pieOption.customColor = ChartsUtil.fillCustomColor(pieOption.linearType, pieOption.customColor, series);
    series = series.map((eachSeries) => {
      eachSeries._start_ += (pieOption.offsetAngle) * Math.PI / 180;
      return eachSeries;
    });
    series.forEach((eachSeries, seriesIndex) => {
      if (this.opts.tooltip) {
        if (this.opts.tooltip.index == seriesIndex) {
          this.context.beginPath();
          this.setFillStyle(ChartsUtil.hexToRgb(eachSeries.color!, pieOption.activeOpacity || 0.5));
          this.context.moveTo(centerPosition.x, centerPosition.y);
          this.context.arc(centerPosition.x, centerPosition.y, eachSeries._radius_ + activeRadius, eachSeries._start_, eachSeries._start_ + 2 * eachSeries._proportion_ * Math.PI);
          this.context.closePath();
          this.context.fill();
        }
      }
      this.context.beginPath();
      this.setLineWidth(pieOption.borderWidth * this.opts.pixelRatio);
      this.context.lineJoin = "round";
      this.setStrokeStyle(pieOption.borderColor);
      let fillcolor: CanvasGradient|string = eachSeries.color!;
      if (pieOption.linearType == 'custom') {
        let grd: CanvasGradient;
        if(this.context.createCircularGradient){
          grd = this.context.createCircularGradient(centerPosition.x, centerPosition.y, eachSeries._radius_)
        }else{
          grd = this.context.createRadialGradient(centerPosition.x, centerPosition.y, 0,centerPosition.x, centerPosition.y, eachSeries._radius_)
        }
        grd.addColorStop(0, ChartsUtil.hexToRgb(pieOption.customColor[eachSeries.linearIndex!], 1))
        grd.addColorStop(1, ChartsUtil.hexToRgb(eachSeries.color!, 1))
        fillcolor = grd
      }
      this.setFillStyle(fillcolor);
      this.context.moveTo(centerPosition.x, centerPosition.y);
      this.context.arc(centerPosition.x, centerPosition.y, eachSeries._radius_, eachSeries._start_, eachSeries._start_ + 2 * eachSeries._proportion_ * Math.PI);
      this.context.closePath();
      this.context.fill();
      if (pieOption.border == true) {
        this.context.stroke();
      }
    });
    if (this.opts.type === 'ring') {
      let innerPieWidth = radius * 0.6;
      if (typeof pieOption.ringWidth === 'number' && pieOption.ringWidth > 0) {
        innerPieWidth = Math.max(0, radius - pieOption.ringWidth * this.opts.pixelRatio);
      }
      this.context.beginPath();
      this.setFillStyle(pieOption.centerColor);
      this.context.moveTo(centerPosition.x, centerPosition.y);
      this.context.arc(centerPosition.x, centerPosition.y, innerPieWidth, 0, 2 * Math.PI);
      this.context.closePath();
      this.context.fill();
    }
    if (this.opts.dataLabel !== false && process === 1) {
      this.drawPieText(series, radius, centerPosition);
    }
    if (process === 1 && this.opts.type === 'ring') {
      this.drawRingTitle(centerPosition);
    }
    return {
      center: centerPosition,
      radius: radius,
      series: series
    } as pieDataPointsRes;
  }

  protected drawPieText(series: Series[], radius: number, center: Point) {
    let lineRadius = GlobalConfig.pieChartLinePadding;
    let textObjectCollection: textObjectType[] = [];
    let lastTextObject: textObjectType = {
      start: {x: 0, y: 0},
      end: {x: 0, y: 0},
      width: 0, height: 0
    };
    let seriesConvert = series.map((item,index) => {
      let text = item.formatter ? item.formatter(item.value,index,item,this.opts) : ChartsUtil.toFixed(item._proportion_.toFixed(4) * 100) + '%';
      text = item.labelText ? item.labelText : text;
      let arc = 2 * Math.PI - (item._start_ + 2 * Math.PI * item._proportion_ / 2);
      if (item._rose_proportion_) {
        arc = 2 * Math.PI - (item._start_ + 2 * Math.PI * item._rose_proportion_ / 2);
      }
      let color = item.color;
      let radius = item._radius_;
      return {
        arc: arc,
        text: text,
        color: color,
        radius: radius,
        textColor: item.textColor,
        textSize: item.textSize,
        labelShow: item.labelShow
      };
    });
    for (let i = 0; i < seriesConvert.length; i++) {
      let item = seriesConvert[i];
      // line end
      let orginX1 = Math.cos(item.arc) * (item.radius + lineRadius);
      let orginY1 = Math.sin(item.arc) * (item.radius + lineRadius);
      // line start
      let orginX2 = Math.cos(item.arc) * item.radius;
      let orginY2 = Math.sin(item.arc) * item.radius;
      // text start
      let orginX3 = orginX1 >= 0 ? orginX1 + GlobalConfig.pieChartTextPadding : orginX1 - GlobalConfig.pieChartTextPadding;
      let orginY3 = orginY1;
      let textWidth = this.measureText(item.text, item.textSize! * this.opts.pixelRatio || this.opts.fontSize);
      let startY = orginY3;
      if (lastTextObject && ChartsUtil.isSameXCoordinateArea(lastTextObject.start, { x: orginX3, y: 0 })) {
        if (orginX3 > 0) {
          startY = Math.min(orginY3, lastTextObject.start.y);
        } else if (orginX1 < 0) {
          startY = Math.max(orginY3, lastTextObject.start.y);
        } else {
          if (orginY3 > 0) {
            startY = Math.max(orginY3, lastTextObject.start.y);
          } else {
            startY = Math.min(orginY3, lastTextObject.start.y);
          }
        }
      }
      if (orginX3 < 0) {
        orginX3 -= textWidth;
      }

      let textObject: textObjectType = {
        lineStart: {
          x: orginX2,
          y: orginY2
        },
        lineEnd: {
          x: orginX1,
          y: orginY1
        },
        start: {
          x: orginX3,
          y: startY
        },
        end: {
          x: 0,
          y: 0
        },
        width: textWidth,
        height: this.opts.fontSize,
        text: item.text,
        color: item.color,
        textColor: item.textColor,
        textSize: item.textSize
      };
      lastTextObject = this.avoidCollision(textObject, lastTextObject);
      textObjectCollection.push(lastTextObject);
    }
    for (let i = 0; i < textObjectCollection.length; i++) {
      if(seriesConvert[i].labelShow === false){
        continue;
      }
      let item = textObjectCollection[i];
      let lineStartPoistion = ChartsUtil.convertCoordinateOrigin(item.lineStart!.x, item.lineStart!.y, center);
      let lineEndPoistion = ChartsUtil.convertCoordinateOrigin(item.lineEnd!.x, item.lineEnd!.y, center);
      let textPosition = ChartsUtil.convertCoordinateOrigin(item.start!.x, item.start!.y, center);
      this.setLineWidth(1 * this.opts.pixelRatio);
      this.setFontSize(item.textSize! * this.opts.pixelRatio || this.opts.fontSize);
      this.context.beginPath();
      this.setStrokeStyle(item.color!);
      this.setFillStyle(item.color!);
      this.context.moveTo(lineStartPoistion.x, lineStartPoistion.y);
      let curveStartX = item.start.x < 0 ? textPosition.x + item.width : textPosition.x;
      let textStartX = item.start.x < 0 ? textPosition.x - 5 : textPosition.x + 5;
      this.context.quadraticCurveTo(lineEndPoistion.x, lineEndPoistion.y, curveStartX, textPosition.y);
      this.context.moveTo(lineStartPoistion.x, lineStartPoistion.y);
      this.context.stroke();
      this.context.closePath();
      this.context.beginPath();
      this.context.moveTo(textPosition.x + item.width, textPosition.y);
      this.context.arc(curveStartX, textPosition.y, 2 * this.opts.pixelRatio, 0, 2 * Math.PI);
      this.context.closePath();
      this.context.fill();
      this.context.beginPath();
      this.setFontSize(item.textSize! * this.opts.pixelRatio || this.opts.fontSize);
      this.setFillStyle(item.textColor || this.opts.fontColor);
      this.context.fillText(item.text!, textStartX, textPosition.y + 3);
      this.context.closePath();
      this.context.stroke();
      this.context.closePath();
    }
  }

  private avoidCollision(obj: textObjectType, target: textObjectType) {
    if (!target ) {
      return obj;
    }
    // 设置最大尝试次数，防止死循环
    const maxAttempts = 1000;
    let attempts = 0;

    // 计算目标中心点
    const targetCenter = {
      x: target.start.x + target.width / 2,
      y: target.start.y - target.height / 2
    };

    // 计算当前对象中心点
    const objCenter = {
      x: obj.start.x + obj.width / 2,
      y: obj.start.y - obj.height / 2
    };

    // 判断移动方向（基于相对位置）
    const moveDirection = {
      x: objCenter.x > targetCenter.x ? 1 : -1,
      y: objCenter.y > targetCenter.y ? 1 : -1
    };

    // 碰撞检测与避免
    while (ChartsUtil.isCollision(obj, target) && attempts < maxAttempts) {
      // 向远离目标的方向移动
      obj.start.x += moveDirection.x * 1;
      obj.start.y += moveDirection.y * 1;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.warn("####达到最大尝试次数，可能无法完全避免碰撞");
    }

    return obj;
  }

  protected drawRingTitle(center: Point) {
    let titlefontSize = this.opts.title.fontSize || GlobalConfig.titleFontSize;
    let subtitlefontSize = this.opts.subtitle.fontSize || GlobalConfig.subtitleFontSize;
    let title = this.opts.title.value || '';
    let subtitle = this.opts.subtitle.value || '';
    let titleFontColor = this.opts.title.color || this.opts.fontColor;
    let subtitleFontColor = this.opts.subtitle.color || this.opts.fontColor;
    let titleHeight = title ? titlefontSize : 0;
    let subtitleHeight = subtitle ? subtitlefontSize : 0;
    let margin = 5;
    if (subtitle) {
      let textWidth = this.measureText(subtitle, subtitlefontSize * this.opts.pixelRatio);
      let startX = center.x - textWidth / 2 + (this.opts.subtitle.offsetX|| 0) * this.opts.pixelRatio;
      let startY = center.y + subtitlefontSize * this.opts.pixelRatio / 2 + (this.opts.subtitle.offsetY || 0) * this.opts.pixelRatio;
      if (title) {
        startY += (titleHeight * this.opts.pixelRatio + margin) / 2;
      }
      this.context.beginPath();
      this.setFontSize(subtitlefontSize * this.opts.pixelRatio);
      this.setFillStyle(subtitleFontColor);
      this.context.fillText(subtitle, startX, startY);
      this.context.closePath();
      this.context.stroke();
    }
    if (title) {
      let _textWidth = this.measureText(title, titlefontSize * this.opts.pixelRatio);
      let _startX = center.x - _textWidth / 2 + (this.opts.title.offsetX || 0);
      let _startY = center.y + titlefontSize * this.opts.pixelRatio / 2 + (this.opts.title.offsetY || 0) * this.opts.pixelRatio;
      if (subtitle) {
        _startY -= (subtitleHeight * this.opts.pixelRatio + margin) / 2;
      }
      this.context.beginPath();
      this.setFontSize(titlefontSize * this.opts.pixelRatio);
      this.setFillStyle(titleFontColor);
      this.context.fillText(title, _startX, _startY);
      this.context.closePath();
      this.context.stroke();
    }
  }

  protected getPieTextMaxLength(series: Series[]) {
    series = this.getPieDataPoints(series);
    let maxLength = 0;
    for (let i = 0; i < series.length; i++) {
      let item: Series = series[i];
      let text = item.formatter ? item.formatter(+item._proportion_.toFixed(2), i, item) : ChartsUtil.toFixed(item._proportion_ * 100) + '%';
      maxLength = Math.max(maxLength, this.measureText(text, item.textSize! * this.opts.pixelRatio || this.opts.fontSize));
    }
    return maxLength;
  }
}
/**
 * 饼状图渲染器
 */
export class PieChartRenderer extends BasePieRenderer {
  constructor(opts: Partial<ChartOptions>) {
    super(opts);
    this.render();
  }

  protected render(): void {
    let series = this.opts.series;
    series = this.fixPieSeries(series);
    series = ChartsUtil.fillSeries(series, this.opts);
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

    this.opts._pieTextMaxLength_ = this.opts.dataLabel === false ? 0 : this.getPieTextMaxLength(seriesMA);

    this.animation = new Animation({
      timing: this.opts.timing,
      duration: duration,
      onProcess: (process: number) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.opts.rotate) {
          this.contextRotate();
        }
        this.opts.chartData.pieData = this.drawPieOrRingDataPoints(series, process);
        this.drawLegend(this.opts.chartData);
        this.drawToolTipBridge(process);
        this.drawCanvas();
      },
      onFinish: () => {
        this.event.emit('renderComplete');
      }
    });
  }
}

export interface pieDataPointsRes {
  center: Point,
  radius: number,
  series: Series[]
}

export interface textObjectType {
  start: Point,
  end: Point,
  width: number,
  height: number,
  lineStart?: Point,
  lineEnd?: Point
  text?: string,
  color?: string,
  textColor?: string,
  textSize?: number
}
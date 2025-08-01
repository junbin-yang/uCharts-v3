import { ChartOptions, Point } from "../types";
import { ChartsUtil } from "../utils";
import { Animation } from '../animation';
import { BaseSeries, Series } from "../types/series";
import { RadarExtra } from "../types/extra";
import { GlobalConfig } from '../types/config';
import { CanvasGradient } from "../../interface";
import { BaseRenderer } from "./base";
import { EventListener } from "../event";

/**
 * 雷达图渲染器
 */
export class RadarChartRenderer extends BaseRenderer {
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
        this.opts.chartData.radarData = this.drawRadarDataPoints(series, process);
        this.drawLegend(this.opts.chartData);
        this.drawToolTipBridge(process);
        this.drawCanvas();
      },
      onFinish: () => {
        this.event.emit('renderComplete', this.opts);
      }
    });
  }

  private drawRadarDataPoints(series: Series[], process: number = 1) {
    let radarOption = ChartsUtil.objectAssign({} as RadarExtra, {
      gridColor: '#cccccc',
      gridType: 'radar',
      gridEval: 1,
      axisLabel: false,
      axisLabelTofix: 0,
      labelShow: true,
      labelColor: '#666666',
      labelPointShow: false,
      labelPointRadius: 3,
      labelPointColor: '#cccccc',
      opacity: 0.2,
      gridCount: 3,
      border: false,
      borderWidth: 2,
      linearType: 'none',
      customColor: [],
    }, this.opts.extra.radar!);
    let coordinateAngle = this.getRadarCoordinateSeries(this.opts.categories.length);
    let centerPosition: Point = {
      x: this.opts.area[3] + ((this.opts.width!) - this.opts.area[1] - this.opts.area[3]) / 2,
      y: this.opts.area[0] + ((this.opts.height!) - this.opts.area[0] - this.opts.area[2]) / 2
    };
    let xr = ((this.opts.width!) - this.opts.area[1] - this.opts.area[3]) / 2
    let yr = ((this.opts.height!) - this.opts.area[0] - this.opts.area[2]) / 2
    let radius = Math.min(xr - (this.getMaxTextListLength(this.opts.categories as string[], this.opts.fontSize!) + GlobalConfig.radarLabelTextMargin), yr - GlobalConfig.radarLabelTextMargin);
    radius -= GlobalConfig.radarLabelTextMargin * this.opts.pixelRatio!;
    radius = radius < 10 ? 10 : radius;
    radius = radarOption.radius ? radarOption.radius : radius;
    // 画分割线
    this.context.beginPath();
    this.setLineWidth(1 * this.opts.pixelRatio!);
    this.setStrokeStyle(radarOption.gridColor);
    coordinateAngle.forEach((angle, index) => {
      let pos = ChartsUtil.convertCoordinateOrigin(radius * Math.cos(angle), radius * Math.sin(angle), centerPosition);
      this.context.moveTo(centerPosition.x, centerPosition.y);
      if (index % radarOption.gridEval == 0) {
        this.context.lineTo(pos.x, pos.y);
      }
    });
    this.context.stroke();
    this.context.closePath();

    // 画背景网格
    const _loop = (i: number) => {
      let startPos: Point = { x: 0, y: 0 };
      this.context.beginPath();
      this.setLineWidth(1 * this.opts.pixelRatio!);
      this.setStrokeStyle(radarOption.gridColor);
      if (radarOption.gridType == 'radar') {
        coordinateAngle.forEach((angle, index) => {
          let pos = ChartsUtil.convertCoordinateOrigin(radius / radarOption.gridCount * i * Math.cos(angle), radius /
          radarOption.gridCount * i * Math.sin(angle), centerPosition);
          if (index === 0) {
            startPos = pos;
            this.context.moveTo(pos.x, pos.y);
          } else {
            this.context.lineTo(pos.x, pos.y);
          }
        });
        this.context.lineTo(startPos.x, startPos.y);
      } else {
        let pos = ChartsUtil.convertCoordinateOrigin(radius / radarOption.gridCount * i * Math.cos(1.5), radius / radarOption.gridCount * i * Math.sin(1.5), centerPosition);
        this.context.arc(centerPosition.x, centerPosition.y, centerPosition.y - pos.y, 0, 2 * Math.PI, false);
      }
      this.context.stroke();
      this.context.closePath();
    };
    for (let i = 1; i <= radarOption.gridCount; i++) {
      _loop(i);
    }
    radarOption.customColor = ChartsUtil.fillCustomColor(radarOption.linearType, radarOption.customColor, series);
    let radarDataPoints = this.getRadarDataPoints(coordinateAngle, centerPosition, radius, series, process);
    radarDataPoints.forEach((eachSeries, seriesIndex) => {
      // 绘制区域数据
      this.context.beginPath();
      this.setLineWidth(radarOption.borderWidth * this.opts.pixelRatio!);
      this.setStrokeStyle(eachSeries.color!);

      let fillcolor: CanvasGradient|string = ChartsUtil.hexToRgb(eachSeries.color!, radarOption.opacity);
      if (radarOption.linearType == 'custom') {
        let grd: CanvasGradient;
        if(this.context.createCircularGradient){
          grd = this.context.createCircularGradient(centerPosition.x, centerPosition.y, radius)
        }else{
          grd = this.context.createRadialGradient(centerPosition.x, centerPosition.y, 0,centerPosition.x, centerPosition.y, radius)
        }
        grd.addColorStop(0, ChartsUtil.hexToRgb(radarOption.customColor[series[seriesIndex].linearIndex!], radarOption.opacity))
        grd.addColorStop(1, ChartsUtil.hexToRgb(eachSeries.color!, radarOption.opacity))
        fillcolor = grd
      }

      this.setFillStyle(fillcolor);
      eachSeries.data.forEach((item, index) => {
        if (index === 0) {
          this.context.moveTo(item.position.x, item.position.y);
        } else {
          this.context.lineTo(item.position.x, item.position.y);
        }
      });
      this.context.closePath();
      this.context.fill();
      if(radarOption.border === true){
        this.context.stroke();
      }
      this.context.closePath();
      if ( this.opts.dataPointShape !== false) {
        let points = eachSeries.data.map((item) => {
          return item.position;
        });
        this.drawPointShape(points, eachSeries.color!, eachSeries.pointShape!);
      }
    });
    // 画刻度值
    if(radarOption.axisLabel === true) {
      const maxData = Math.max(radarOption.max, Math.max(...ChartsUtil.dataCombine(series)));
      const stepLength = radius / radarOption.gridCount;
      const fontSize = this.opts.fontSize! * this.opts.pixelRatio!;
      this.setFontSize(fontSize);
      this.setFillStyle(this.opts.fontColor!);
      this.setTextAlign('left');
      for (let i = 0; i < radarOption.gridCount + 1; i++) {
        let label: number|string = i * maxData / radarOption.gridCount;
        label = label.toFixed(radarOption.axisLabelTofix);
        this.context.fillText(String(label), centerPosition.x + 3 * this.opts.pixelRatio!, centerPosition.y - i * stepLength + fontSize / 2);
      }
    }

    // draw label text
    this.drawRadarLabel(coordinateAngle, radius, centerPosition);

    // draw dataLabel
    if (this.opts.dataLabel !== false && process === 1) {
      radarDataPoints.forEach((eachSeries, seriesIndex) => {
        this.context.beginPath();
        let fontSize = eachSeries.textSize ? eachSeries.textSize * this.opts.pixelRatio! : this.opts.fontSize!;
        this.setFontSize(fontSize);
        this.setFillStyle(eachSeries.textColor || this.opts.fontColor!);
        eachSeries.data.forEach((item, index) => {
          //如果是中心点垂直的上下点位
          if(Math.abs(item.position.x - centerPosition.x) < 2) {
            //如果在上面
            if(item.position.y < centerPosition.y){
              this.setTextAlign('center');
              this.context.fillText(String(item.value), item.position.x, item.position.y - 4);
            }else{
              this.setTextAlign('center');
              this.context.fillText(String(item.value), item.position.x, item.position.y + fontSize + 2);
            }
          }else{
            //如果在左侧
            if(item.position.x < centerPosition.x){
              this.setTextAlign('right');
              this.context.fillText(String(item.value), item.position.x - 4, item.position.y + fontSize / 2 - 2);
            }else{
              this.setTextAlign('left');
              this.context.fillText(String(item.value), item.position.x + 4, item.position.y + fontSize / 2 - 2);
            }
          }
        });
        this.context.closePath();
        this.context.stroke();
      });
      this.setTextAlign('left');
    }

    return {
      center: centerPosition,
      radius: radius,
      angleList: coordinateAngle
    } as radarDataPointsRes;
  }

  private getRadarCoordinateSeries(length: number) {
    let eachAngle = 2 * Math.PI / length;
    let CoordinateSeries = [];
    for (let i = 0; i < length; i++) {
      CoordinateSeries.push(eachAngle * i);
    }
    return CoordinateSeries.map((item) => {
      return -1 * item + Math.PI / 2;
    });
  }

  private getMaxTextListLength(list: string[], fontSize: number) {
    let lengthList = list.map((item) => {
      return this.measureText(item, fontSize);
    });
    return Math.max(...lengthList);
  }

  private getRadarDataPoints(angleList: number[], center: Point, radius: number, series: Series[], process: number = 1) {
    let radarOption = this.opts.extra.radar || {};
    radarOption.max = radarOption.max || 0;
    let maxData = Math.max(radarOption.max, Math.max(...ChartsUtil.dataCombine(series)));
    let data: radarDataPointsSeries[] = [];
    for (let i = 0; i < series.length; i++) {
      let each = series[i];
      let listItem: radarDataPointsSeries = {
        color: each.color,
        legendShape: each.legendShape,
        pointShape: each.pointShape,
        data: []
      };
      each.data.forEach((item: number, index: number) => {
        let tmp: radarDataPoints = {
          angle: angleList[index],
          proportion: item / maxData,
          value: item,
          position: { x: 0, y: 0 }
        };
        tmp.position = ChartsUtil.convertCoordinateOrigin(radius * tmp.proportion * process * Math.cos(tmp.angle), radius * tmp.proportion * process * Math.sin(tmp.angle), center);
        listItem.data.push(tmp);
      });
      data.push(listItem);
    }
    return data;
  }

  private drawRadarLabel(angleList: number[], radius: number, centerPosition: Point) {
    let radarOption = this.opts.extra.radar || {};
    angleList.forEach((angle, index) => {
      if(radarOption.labelPointShow === true && this.opts.categories[index] !== ''){
        let posPoint: Point = {
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle)
        };
        let posPointAxis = ChartsUtil.convertCoordinateOrigin(posPoint.x, posPoint.y, centerPosition);
        this.setFillStyle(radarOption.labelPointColor!);
        this.context.beginPath();
        this.context.arc(posPointAxis.x, posPointAxis.y, (radarOption.labelPointRadius!) * this.opts.pixelRatio!, 0, 2 * Math.PI, false);
        this.context.closePath();
        this.context.fill();
      }
      if(radarOption.labelShow === true) {
        let pos: Point = {
          x: (radius + GlobalConfig.radarLabelTextMargin * this.opts.pixelRatio!) * Math.cos(angle),
          y: (radius + GlobalConfig.radarLabelTextMargin * this.opts.pixelRatio!) * Math.sin(angle)
        };
        let posRelativeCanvas = ChartsUtil.convertCoordinateOrigin(pos.x, pos.y, centerPosition);
        let startX = posRelativeCanvas.x;
        let startY = posRelativeCanvas.y;
        const categories = this.opts.categories as string[]
        if (ChartsUtil.approximatelyEqual(pos.x, 0)) {
          startX -= this.measureText(categories[index] || '', this.opts.fontSize!) / 2;
        } else if (pos.x < 0) {
          startX -= this.measureText(categories[index] || '', this.opts.fontSize!);
        }
        this.context.beginPath();
        this.setFontSize(this.opts.fontSize!);
        this.setFillStyle(radarOption.labelColor || this.opts.fontColor!);
        this.context.fillText(categories[index] || '', startX, startY + (this.opts.fontSize!) / 2);
        this.context.closePath();
        this.context.stroke();
      }
    });
  }

}

export interface radarDataPointsRes {
  center: Point,
  radius: number,
  angleList: number[]
}

export interface radarDataPointsSeries extends BaseSeries {
  data: radarDataPoints[]
}

export interface radarDataPoints {
  angle: number
  proportion: number
  value: number
  position: Point
}
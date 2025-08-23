import { BaseRenderer } from "./base";
import { BoundBoxType, ChartOptions, MapDataRes } from "../types";
import { MapSeries, Series } from '../types/series';
import { ChartsUtil } from '../utils';
import { GlobalConfig } from "../types/config";
import { Animation } from '../animation';
import { MapExtra } from "../types/extra";
import { Position } from "../../interface";
import { EventListener } from "../event";

/**
 * 地图渲染器
 */
export class MapChartRenderer extends BaseRenderer {
  constructor(opts: Partial<ChartOptions>, events: Record<string, EventListener[]> = {}) {
    super(opts, events);
    this.render();
  }

  protected render(): void {
    let series = this.opts.series;
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

    /*
    this.animation = new Animation({
      timing: this.opts.timing!,
      duration: duration,
      onProcess: (process: number) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.opts.rotate) {
          this.contextRotate();
        }
        this.drawMapDataPoints(series, process);
      },
      onFinish: () => {
        this.event.emit('renderComplete', this.opts);
      }
    });
    */
    this.context.clearRect(0, 0, this.opts.width, this.opts.height);
    if (this.opts.rotate) {
      this.contextRotate();
    }
    this.drawMapDataPoints(series, 1);
    setTimeout(()=>{
      this.event.emit('renderComplete', this.opts);
    }, 50)
  }

  private drawMapDataPoints(series: Series, process: number) {
    let mapOption = ChartsUtil.objectAssign({} as MapExtra, {
      border: true,
      mercator: false,
      borderWidth: 1,
      active:true,
      borderColor: '#666666',
      fillOpacity: 0.6,
      activeBorderColor: '#f04864',
      activeFillColor: '#facc14',
      activeFillOpacity: 1,
      color: ["#E0F7FF", "#81D4FA", "#29B6F6", "#EF5350", "#B71C1C"]
    }, this.opts.extra.map!);
    let coords, point;
    let data: MapSeries = series as MapSeries;
    let bounds = this.getBoundingBox(data);
    if (mapOption.mercator) {
      let max = this.lonlat2mercator(bounds.xMax, bounds.yMax)
      let min = this.lonlat2mercator(bounds.xMin, bounds.yMin)
      bounds.xMax = max[0]
      bounds.yMax = max[1]
      bounds.xMin = min[0]
      bounds.yMin = min[1]
    }
    let xScale = this.opts.width / Math.abs(bounds.xMax - bounds.xMin);
    let yScale = this.opts.height / Math.abs(bounds.yMax - bounds.yMin);
    let scale = xScale < yScale ? xScale : yScale;
    let xoffset = this.opts.width / 2 - Math.abs(bounds.xMax - bounds.xMin) / 2 * scale;
    let yoffset = this.opts.height / 2 - Math.abs(bounds.yMax - bounds.yMin) / 2 * scale;
    let values: number[] = [];
    for (let i = 0; i < data.length; i++) {
      let value: number = data[i].value || 0
      values.push(value)
    }
    let areColors = this.getValueColors(values, mapOption.color);
    for (let i = 0; i < data.length; i++) {
      this.context.beginPath();
      this.setLineWidth(mapOption.borderWidth * this.opts.pixelRatio!);
      this.setStrokeStyle(mapOption.borderColor);
      this.setFillStyle(ChartsUtil.hexToRgb(series[i].color||areColors[i], series[i].fillOpacity||mapOption.fillOpacity));
      if (mapOption.active == true && this.opts.tooltip) {
        if (this.opts.tooltip.index == i) {
          this.setStrokeStyle(mapOption.activeBorderColor);
          this.setFillStyle(ChartsUtil.hexToRgb(mapOption.activeFillColor, mapOption.activeFillOpacity));
        }
      }
      let coorda = data[i].geometry.coordinates as Position[][][];
      for (let k = 0; k < coorda.length; k++) {
        coords = coorda[k];
        if (Array.isArray(coords) && coords.length == 1) {
          coords = coords[0]
        }
        for (let j = 0; j < coords.length; j++) {
          let gaosi = Array(2);
          if (mapOption.mercator) {
            gaosi = this.lonlat2mercator(coords[j][0] as number, coords[j][1] as number)
          } else {
            gaosi = coords[j]
          }
          point = this.coordinateToPoint(gaosi[1], gaosi[0], bounds, scale, xoffset, yoffset)
          if (j === 0) {
            this.context.beginPath();
            this.context.moveTo(point.x, point.y);
          } else {
            this.context.lineTo(point.x, point.y);
          }
        }
        this.context.fill();
        if (mapOption.border == true) {
          this.context.stroke();
        }
      }
    }
    if (this.opts.dataLabel == true) {
      for (let i = 0; i < data.length; i++) {
        let centerPoint = data[i].properties?.centroid||data[i].properties!.center;
        if (centerPoint) {
          if (mapOption.mercator) {
            if(data[i].properties?.centroid) {
              centerPoint = this.lonlat2mercator(data[i].properties!.centroid[0], data[i].properties!.centroid[1])
            } else {
              centerPoint = this.lonlat2mercator(data[i].properties!.center[0], data[i].properties!.center[1])
            }
          }
          point = this.coordinateToPoint(centerPoint[1], centerPoint[0], bounds, scale, xoffset, yoffset);
          let fontSize = data[i].textSize * this.opts.pixelRatio! || this.opts.fontSize!;
          let fontColor = data[i].textColor || this.opts.fontColor!;
          if(mapOption.active && mapOption.activeTextColor && this.opts.tooltip && this.opts.tooltip.index == i){
            fontColor = mapOption.activeTextColor;
          }
          let text = data[i].properties?.name||'';
          this.context.beginPath();
          this.setFontSize(fontSize)
          this.setFillStyle(fontColor)
          this.context.fillText(text, point.x - this.measureText(text, fontSize) / 2, point.y + fontSize / 2);
          this.context.closePath();
          this.context.stroke();
        }
      }
    }
    this.opts.chartData.mapData = {
      bounds: bounds,
      scale: scale,
      xoffset: xoffset,
      yoffset: yoffset,
      mercator: mapOption.mercator
    } as MapDataRes
    this.drawToolTipBridge(process);
  }

  private getBoundingBox(data: MapSeries) {
    let bounds: BoundBoxType = { xMin: 180, xMax: 0, yMin: 90, yMax: 0 };
    let coords: Position[] = [];
    for (let i = 0; i < data.length; i++) {
      let coord = data[i].geometry.coordinates as Position[][][];
      for (let k = 0; k < coord.length; k++) {
        let currentCoords: Position[][] = coord[k];
        // 处理单环情况：简化为二维数组
        if (currentCoords.length === 1) {
          coords = currentCoords[0]; // 此时coords为Position[]
        }

        for (let j = 0; j < (coords).length; j++) {
          let longitude: number = coords[j][0];
          let latitude: number = coords[j][1];
          let point = {
            x: longitude,
            y: latitude
          }
          bounds.xMin = bounds.xMin < point.x ? bounds.xMin : point.x;
          bounds.xMax = bounds.xMax > point.x ? bounds.xMax : point.x;
          bounds.yMin = bounds.yMin < point.y ? bounds.yMin : point.y;
          bounds.yMax = bounds.yMax > point.y ? bounds.yMax : point.y;
        }
      }
    }
    return bounds;
  }

  private getValueColors(values: number[], colors: string[]): string[] {
    /**
     * 将十六进制颜色字符串解析为RGB数组
     * @param hex 十六进制颜色（支持#RRGGBB或#RRGGBBAA格式）
     * @returns RGB值数组 [r, g, b]（0-255）
     */
    const hexToRgb = (hex: string): [number, number, number] => {
      // 移除#号并处理可能的透明度（取前6位）
      const cleanHex = hex.replace('#', '').slice(0, 6);
      // 解析RGB分量
      const r = parseInt(cleanHex.slice(0, 2), 16);
      const g = parseInt(cleanHex.slice(2, 4), 16);
      const b = parseInt(cleanHex.slice(4, 6), 16);
      return [r, g, b];
    }
    /**
     * 将RGB数组转换为十六进制颜色字符串
     * @param rgb RGB值数组 [r, g, b]（0-255）
     * @returns 十六进制颜色字符串（#RRGGBB）
     */
    const rgbToHex = (rgb: [number, number, number]): string => {
      return `#${rgb.map(component =>
      Math.round(component).toString(16).padStart(2, '0')
      ).join('')}`;
    }

    /**
     * 线性插值计算
     * @param a 起始值
     * @param b 结束值
     * @param t 插值比例（0-1）
     * @returns 插值结果
     */
    const lerp = (a: number, b: number, t: number): number => {
      return a + (b - a) * t;
    }

    if (values.length === 0) return [];
    if (colors.length === 1) return values.map(() => colors[0]);

    // 计算values的最大值和最小值
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    // 解析颜色为RGB数组
    const rgbColors = colors.map(hexToRgb);

    return values.map(value => {
      // 计算当前值在范围内的比例（0-1）
      const t = valueRange === 0 ? 0 : (value - minValue) / valueRange;

      // 计算对应的颜色索引
      const colorIndex = t * (rgbColors.length - 1);
      const floorIndex = Math.floor(colorIndex);
      const ceilIndex = Math.ceil(colorIndex);
      const colorT = colorIndex - floorIndex;

      // 取对应区间的两个颜色进行插值
      const [r1, g1, b1] = rgbColors[floorIndex];
      const [r2, g2, b2] = rgbColors[ceilIndex] || rgbColors[floorIndex];

      // 计算插值后的RGB值
      const r = lerp(r1, r2, colorT);
      const g = lerp(g1, g2, colorT);
      const b = lerp(b1, b2, colorT);

      return rgbToHex([r, g, b]);
    });
  }
}
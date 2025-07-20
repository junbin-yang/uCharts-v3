import { CanvasContext, CanvasGradient, CanvasLineCap, CanvasPattern, CanvasTextAlign,
  CanvasTextBaseline } from '../../interface/canvas.type';
import { Animation } from '../animation';
import { EventEmitter, EventType, EventListener } from '../event';
import { AnyType, ChartOptions, Point, ToolTipOptions, YAxisOptionsData } from "../types";
import { GlobalConfig } from "../types/config";
import {
  AreaExtra,
  BarExtra, ColumnExtra, LineExtra, MarkLineData, MarkLineOptions, TooltipOptions } from '../types/extra';
import { SeriesDataItem, NameAndValueData, Series, ValueAndColorData } from '../types/series';
import { ChartsUtil } from "../utils";
import { pieDataPointsRes } from './pie';
import { radarDataPointsRes } from './radar';

export abstract class BaseRenderer {
  protected opts: ChartOptions;
  protected context: CanvasContext;
  protected event: EventEmitter;
  protected scrollOption: Record<string, number|string>;
  protected animation: Animation|undefined;

  constructor(opts: Partial<ChartOptions>) {
    this.context = opts.context!
    if(!this.context) throw new Error('未获取到context')

    const DefaultOptions: ChartOptions = {
      type: "column",
      context: undefined,
      pixelRatio: 1,
      fontSize: GlobalConfig.fontSize,
      fontColor: GlobalConfig.fontColor,
      background: GlobalConfig.background,
      title: {
        value: undefined,
        fontSize: GlobalConfig.titleFontSize,
        color: GlobalConfig.fontColor,
        offsetX: 0,
        offsetY: 0
      },
      subtitle: {
        value: undefined,
        fontSize: GlobalConfig.subtitleFontSize,
        color: "#7cb5ec",
        offsetX: 0,
        offsetY: 0
      },
      animation: true,
      timing: "easeOut",
      duration: GlobalConfig.duration,
      enableScroll: false,
      scrollPosition: "current",
      yAxis: {
        disabled: false,
        disableGrid: false,
        splitNumber: 5,
        gridType: "solid",
        dashLength: 8,
        gridColor: "#CCCCCC",
        padding: 10,
        showTitle: false,
        data: []
      },
      xAxis: {
        disabled: false,
        axisLine: true,
        axisLineColor: "#CCCCCC",
        calibration: false,
        fontColor: GlobalConfig.fontColor,
        fontSize: GlobalConfig.fontSize,
        lineHeight: 20,
        marginTop: 0,
        rotateLabel: false,
        rotateAngle: 45,
        labelCount: 0,
        itemCount: 5,
        boundaryGap: 'center',
        disableGrid: true,
        splitNumber: 5,
        gridColor: "#CCCCCC",
        gridType: 'solid',
        dashLength: 4,
        gridEval: 1,
        scrollShow: false,
        scrollAlign: 'left',
        scrollColor: "#A6A6A6",
        scrollBackgroundColor: "#EFEBEF",
        min: undefined,          // 默认数据中的最小值
        max: undefined,          // 默认数据中的最大值
        title: undefined,
        titleFontSize: GlobalConfig.fontSize,
        titleOffsetY: 0,
        titleOffsetX: 0,
        titleFontColor: GlobalConfig.fontColor
      },
      rotate: false,
      rotateLock: false,
      padding: GlobalConfig.padding,
      categories: [],
      series: [],
      legend: {
        show: true,
        position: 'bottom',
        float: 'center',
        padding: 5,
        margin: 0,
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: "rgba(0,0,0,0)",
        borderWidth: 0,
        fontSize: GlobalConfig.fontSize,
        fontColor: GlobalConfig.fontColor,
        lineHeight: 11,
        hiddenColor: "#CECECE",
        itemGap: 10
      },
      extra: {},
      touchMoveLimit: 60,
      dataLabel: true,
      dataPointShape: true,
      dataPointShapeType: 'solid',
      enableMarkLine: false
    }

    this.opts = ChartsUtil.objectAssign({} as ChartOptions, DefaultOptions, opts)

    if (this.opts.background == "" || this.opts.background == "none") this.opts.background = "#FFFFFF";

    // 添加一些内部使用的扩展字段
    this.opts.xAxis.scrollPosition = this.opts.xAxis.scrollAlign;

    this.opts.width = this.context.width;
    this.opts.height = this.context.height;

    if (this.opts.rotate) {
      const tempWidth: number = this.opts.width;
      const tempHeight: number = this.opts.height;
      this.opts.width = tempHeight;
      this.opts.height = tempWidth;
    }

    // 适配像素比
    if(this.opts.pixelRatio > 1) {
      GlobalConfig.yAxisWidth *= this.opts.pixelRatio;
      this.opts.fontSize *= this.opts.pixelRatio;
      this.opts.title.fontSize! *= this.opts.pixelRatio;
      this.opts.subtitle.fontSize! *= this.opts.pixelRatio;
    }

    this.animation = undefined;
    this.event = new EventEmitter();
    this.scrollOption = {
      "currentOffset": 0,
      "startTouchX": 0,
      "distance": 0,
      "lastMoveTime": 0
    };

    this.opts.chartData = {}
    if(this.opts.extra.markLine && this.opts.enableMarkLine == false) this.opts.enableMarkLine = true
  }

  /**
   * 抽象方法：渲染图表
   */
  protected abstract render(): void;

  /**
   * 更新数据
   */
  public updateData(data: Partial<ChartOptions>) {
    this.opts = ChartsUtil.objectAssign({} as ChartOptions, this.opts, data);
    this.opts.updateData = true;
    let scrollPosition = data.scrollPosition || 'current';
    switch (scrollPosition) {
      case 'current':
        this.opts._scrollDistance_ = this.scrollOption.currentOffset;
        break;
      case 'left':
        this.opts._scrollDistance_ = 0;
        this.scrollOption = {
          "currentOffset": 0,
          "startTouchX": 0,
          "distance": 0,
          "lastMoveTime": 0
        };
        break;
      case 'right':
        let calYAxisData = this.calculateYAxisData(this.opts.series);
        let yAxisWidth = calYAxisData.yAxisWidth;
        GlobalConfig.yAxisWidth = yAxisWidth[0].width;
        let offsetLeft = 0;
        let _getXAxisPoints0 = this.getXAxisPoints(this.opts.categories), xAxisPoints = _getXAxisPoints0.xAxisPoints,
          startX = _getXAxisPoints0.startX,
          endX = _getXAxisPoints0.endX,
          eachSpacing = _getXAxisPoints0.eachSpacing;
        let totalWidth = eachSpacing * (xAxisPoints.length - 1);
        let screenWidth = endX - startX;
        offsetLeft = screenWidth - totalWidth;
        this.scrollOption = {
          "currentOffset": offsetLeft,
          "startTouchX": offsetLeft,
          "distance": 0,
          "lastMoveTime": 0
        };
        this.opts._scrollDistance_ = offsetLeft;
        break;
    }
    this.render()
  }

  /**
   * 事件监听
   */
  public on(type: EventType, listener: EventListener) {
    this.event.on(type, listener)
  }

  private getTouches(touches: Point) {
    let res: Point = {x: 0, y: 0}
    if (this.opts.rotate) {
      res.y = this.opts.height - touches.x * this.opts.pixelRatio;
      res.x = touches.y * this.opts.pixelRatio;
    } else {
      res.x = touches.x * this.opts.pixelRatio;
      res.y = touches.y * this.opts.pixelRatio;
    }
    return res
  }
  private findLegendIndex(currentPoints: Point, legendData: legendDataType) {
    const isInExactLegendArea = (currentPoints: Point, area: legendDataAreaType) => {
      return currentPoints.x > area.start.x && currentPoints.x < area.end.x && currentPoints.y > area.start.y && currentPoints.y < area.end.y;
    }
    let currentIndex = -1;
    let gap = 0;
    if (isInExactLegendArea(currentPoints, legendData.area)) {
      let points = legendData.points;
      let index = -1;
      for (let i = 0, len = points.length; i < len; i++) {
        let item = points[i];
        for (let j = 0; j < item.length; j++) {
          index += 1;
          let area: number[] = item[j]['area'];
          if (area && currentPoints.x > area[0] - gap && currentPoints.x < area[2] + gap && currentPoints.y > area[1] - gap && currentPoints.y < area[3] + gap) {
            currentIndex = index;
            break;
          }
        }
      }
      return currentIndex;
    }
    return currentIndex;
  }
  private isInExactChartArea(currentPoints: Point) {
    return currentPoints.x <= this.opts.width - this.opts.area[1] + 10 && currentPoints.x >= this.opts.area[3] - 10 && currentPoints.y >= this.opts.area[0] && currentPoints.y <= this.opts.height - this.opts.area[2];
  }
  private isInExactPieChartArea(currentPoints: Point, center: Point, radius: number) {
    return Math.pow(currentPoints.x - center.x, 2) + Math.pow(currentPoints.y - center.y, 2) <= Math.pow(radius, 2);
  }
  private isInAngleRange(angle: number, startAngle: number, endAngle: number) {
    const adjust = (angle: number) => {
      while (angle < 0) {
        angle += 2 * Math.PI;
      }
      while (angle > 2 * Math.PI) {
        angle -= 2 * Math.PI;
      }
      return angle;
    }
    angle = adjust(angle);
    startAngle = adjust(startAngle);
    endAngle = adjust(endAngle);
    if (startAngle > endAngle) {
      endAngle += 2 * Math.PI;
      if (angle < startAngle) {
        angle += 2 * Math.PI;
      }
    }
    return angle >= startAngle && angle <= endAngle;
  }

  private getSeriesDataItem(series: Series[], index: number|number[], group: number[]) {
    let data: Series[] = [];
    let newSeries: Series[] = [];
    let indexIsArr = index.constructor.toString().indexOf('Array') > -1;
    if(indexIsArr){
      let tempSeries = ChartsUtil.filterSeries(series);
      for (let i = 0; i < group.length; i++) {
        newSeries.push(tempSeries[group[i]]);
      }
    }else{
      newSeries = series;
    };
    for (let i = 0; i < newSeries.length; i++) {
      let item = newSeries[i];
      let tmpindex = -1;
      if(indexIsArr){
        tmpindex = (index as number[])[i];
      }else{
        tmpindex = index as number;
      }
      if (item.data[tmpindex] !== null && typeof item.data[tmpindex] !== 'undefined' && item.show) {
        let seriesItem: AnyType = {};
        seriesItem.color = item.color;
        seriesItem.type = item.type;
        seriesItem.style = item.style;
        seriesItem.pointShape = item.pointShape;
        seriesItem.disableLegend = item.disableLegend;
        seriesItem.legendShape = item.legendShape;
        seriesItem.name = item.name;
        seriesItem.show = item.show;
        seriesItem.data = item.formatter ? item.formatter(String(item.data[tmpindex]),tmpindex,item) : item.data[tmpindex];
        data.push(seriesItem as Series);
      }
    }
    return data;
  }
  private getToolTipData(seriesData: Series[], index: number|number[], group: number[], categories: string[], option?: Partial<ToolTipOptions>) {
    let calPoints: Array<AnyType> = this.opts.chartData.calPoints ? this.opts.chartData.calPoints : [];
    let points: AnyType = {};
    if(group.length > 0){
      let filterPoints: Array<AnyType> = [];
      for (let i = 0; i < group.length; i++) {
        filterPoints.push(calPoints[group[i]])
      }
      points = filterPoints[0][(index as number[])[0]];
    }else{
      for (let i = 0; i < calPoints.length; i++) {
        if(calPoints[i][index as number]){
          points = calPoints[i][index as number];
          break;
        }
      }
    };
    let textList = seriesData.map((item) => {
      let titleText: string = "";
      if (this.opts.categories && this.opts.categories.length>0) {
        titleText = categories[index as number];
      };
      return {
        text: option?.formatter ? option.formatter(item, titleText, index as number, this.opts) : item.name + ': ' + item.data,
        color: item.color,
        legendShape: this.opts.extra.tooltip?.legendShape == 'auto'? item.legendShape : this.opts.extra.tooltip?.legendShape
      } as tooltipTextList;
    });
    let offset: Point = {
      x: Math.round(points.x),
      y: Math.round(points.y)
    };
    return {
      textList: textList,
      offset: offset
    } as getToolTipDataRes;
  }
  private getMixToolTipData(seriesData: Series[], index: number, categories: string[], option?: Partial<ToolTipOptions>) {
    let points = this.opts.chartData.xAxisPoints[index] + this.opts.chartData.eachSpacing / 2;
    let textList = seriesData.map((item) => {
      return {
        text: option?.formatter ? option.formatter(item, categories[index], index, this.opts) : item.name + ': ' + item.data,
        color: item.color,
        disableLegend: item.disableLegend ? true : false,
        legendShape: this.opts.extra.tooltip?.legendShape == 'auto'? item.legendShape : this.opts.extra.tooltip?.legendShape
      } as tooltipTextList;
    });
    textList = textList.filter((item) => {
      if (item.disableLegend !== true) {
        return item;
      }
    });
    let offset = {
      x: Math.round(points),
      y: 0
    };
    return {
      textList: textList,
      offset: offset
    } as getToolTipDataRes;
  }

  /**
   * 获取图例点击索引
   */
  public getLegendDataIndex(touches: Point): number {
    let _touches = this.getTouches(touches);
    return this.findLegendIndex(_touches, this.opts.chartData.legendData);
  };

  /**
   * 获取图表点击索引
   */
  public getCurrentDataIndex(touches: Point): CurrentDataIndexRes {
    const findCurrentIndex = (currentPoints: Point, calPoints: AnyType[], offset: number = 0) => {
      let current: CurrentDataIndexRes = { index:-1, group:[] };
      let spacing = this.opts.chartData.eachSpacing / 2;
      let xAxisPoints: number[] = [];
      if (calPoints && calPoints.length > 0) {
        if (!this.opts.categories) {
          spacing = 0;
        }else{
          for (let i = 1; i < this.opts.chartData.xAxisPoints.length; i++) {
            xAxisPoints.push(this.opts.chartData.xAxisPoints[i] - spacing);
          }
          if ((this.opts.type == 'line' || this.opts.type == 'area') && this.opts.xAxis.boundaryGap == 'justify') {
            xAxisPoints = this.opts.chartData.xAxisPoints;
          }
        }
        if (this.isInExactChartArea(currentPoints)) {
          if (!this.opts.categories || this.opts.categories.length == 0) {
            let timePoints: Array<number[]> = Array(calPoints.length);
            for (let i = 0; i < calPoints.length; i++) {
              timePoints[i] = Array(calPoints[i].length)
              for (let j = 0; j < calPoints[i].length; j++) {
                timePoints[i][j] = (Math.abs(calPoints[i][j].x - currentPoints.x));
              }
            };
            let pointValue: number[] = Array(timePoints.length);
            let pointIndex: number[] = Array(timePoints.length);
            for (let i = 0; i < timePoints.length; i++) {
              pointValue[i] = Math.min(...timePoints[i]);
              pointIndex[i] = timePoints[i].indexOf(pointValue[i]);
            }
            let minValue = Math.min(...pointValue);
            current.index = [];
            for (let i = 0; i < pointValue.length; i++) {
              if(pointValue[i] == minValue){
                current.group.push(i);
                current.index.push(pointIndex[i]);
              }
            };
          }else{
            xAxisPoints.forEach((item, index) => {
              if (currentPoints.x + offset + spacing > item) {
                current.index = index;
              }
            });
          }
        }
      }
      return current;
    }
    const findBarChartCurrentIndex = (currentPoints: Point, calPoints: AnyType[], offset: number = 0) => {
      let current: CurrentDataIndexRes = { index:-1, group:[] };
      let spacing = this.opts.chartData.eachSpacing / 2;
      let yAxisPoints: number[] = this.opts.chartData.yAxisPoints;
      if (calPoints && calPoints.length > 0) {
        if (this.isInExactChartArea(currentPoints)) {
          yAxisPoints.forEach((item, index) => {
            if (currentPoints.y + offset + spacing > item) {
              current.index = index;
            }
          });
        }
      }
      return current;
    }
    const findPieChartCurrentIndex = (currentPoints: Point, pieData: pieDataPointsRes) => {
      let current: CurrentDataIndexRes = { index:-1, group:[] };
      let series = this.getPieDataPoints(pieData.series);
      if (pieData && pieData.center && this.isInExactPieChartArea(currentPoints, pieData.center, pieData.radius)) {
        let angle = Math.atan2(pieData.center.y - currentPoints.y, currentPoints.x - pieData.center.x);
        angle = -angle;
        if(this.opts.extra.pie && this.opts.extra.pie.offsetAngle){
          angle = angle - this.opts.extra.pie.offsetAngle * Math.PI / 180;
        }
        if(this.opts.extra.ring && this.opts.extra.ring.offsetAngle){
          angle = angle - this.opts.extra.ring.offsetAngle * Math.PI / 180;
        }
        for (let i = 0, len = series.length; i < len; i++) {
          if (this.isInAngleRange(angle, series[i]._start_, series[i]._start_ + series[i]._proportion_ * 2 * Math.PI)) {
            current.index = i;
            break;
          }
        }
      }
      return current;
    }
    const findRoseChartCurrentIndex = (currentPoints: Point, pieData: pieDataPointsRes) => {
      let current: CurrentDataIndexRes = { index:-1, group:[] };
      let series = this.getRoseDataPoints(this.opts._series_, this.opts.extra.rose?.type!, pieData.radius, pieData.radius);
      if (pieData && pieData.center && this.isInExactPieChartArea(currentPoints, pieData.center, pieData.radius)) {
        let angle = Math.atan2(pieData.center.y - currentPoints.y, currentPoints.x - pieData.center.x);
        angle = -angle;
        if(this.opts.extra.rose && this.opts.extra.rose.offsetAngle){
          angle = angle - this.opts.extra.rose.offsetAngle * Math.PI / 180;
        }
        for (let i = 0, len = series.length; i < len; i++) {
          if (this.isInAngleRange(angle, series[i]._start_, series[i]._start_ + series[i]._rose_proportion_ * 2 * Math.PI)) {
            current.index = i;
            break;
          }
        }
      }
      return current;
    }
    const findRadarChartCurrentIndex = (currentPoints: Point, radarData: radarDataPointsRes, count: number) => {
      let eachAngleArea = 2 * Math.PI / count;
      let current: CurrentDataIndexRes = { index:-1, group:[] };
      if (this.isInExactPieChartArea(currentPoints, radarData.center, radarData.radius)) {
        const fixAngle = (angle: number) => {
          if (angle < 0) {
            angle += 2 * Math.PI;
          }
          if (angle > 2 * Math.PI) {
            angle -= 2 * Math.PI;
          }
          return angle;
        };
        let angle = Math.atan2(radarData.center.y - currentPoints.y, currentPoints.x - radarData.center.x);
        angle = -1 * angle;
        if (angle < 0) {
          angle += 2 * Math.PI;
        }
        let angleList = radarData.angleList.map((item) => {
          item = fixAngle(-1 * item);
          return item;
        });
        angleList.forEach((item, index) => {
          let rangeStart = fixAngle(item - eachAngleArea / 2);
          let rangeEnd = fixAngle(item + eachAngleArea / 2);
          if (rangeEnd < rangeStart) {
            rangeEnd += 2 * Math.PI;
          }
          if (angle >= rangeStart && angle <= rangeEnd || angle + 2 * Math.PI >= rangeStart && angle + 2 * Math.PI <= rangeEnd) {
            current.index = index;
          }
        });
      }
      return current;
    }

    let _touches = this.getTouches(touches);
    if (this.opts.type === 'pie' || this.opts.type === 'ring') {
      return findPieChartCurrentIndex(_touches, this.opts.chartData.pieData);
    } else if (this.opts.type === 'rose') {
      return findRoseChartCurrentIndex(_touches, this.opts.chartData.pieData);
    } else if (this.opts.type === 'radar') {
      return findRadarChartCurrentIndex(_touches, this.opts.chartData.radarData, this.opts.categories.length);
    } else if (this.opts.type === 'funnel') {
      //return findFunnelChartCurrentIndex(_touches, this.opts.chartData.funnelData);
    } else if (this.opts.type === 'map') {
      //return findMapChartCurrentIndex(_touches, this.opts);
    } else if (this.opts.type === 'word') {
      //return findWordChartCurrentIndex(_touches, this.opts.chartData.wordCloudData);
    } else if (this.opts.type === 'bar') {
      return findBarChartCurrentIndex(_touches, this.opts.chartData.calPoints, Math.abs(this.scrollOption.currentOffset as number));
    }
    return findCurrentIndex(_touches, this.opts.chartData.calPoints, Math.abs(this.scrollOption.currentOffset as number));
  };

  /**
   * 图例点击交互
   */
  public touchLegend(touches: Point, animation?: boolean) {
    let index = this.getLegendDataIndex(touches);
    if (index >= 0) {
      if (this.opts.type == 'candle') {
        this.opts.seriesMA[index].show = !this.opts.seriesMA[index].show;
      } else {
        this.opts.series[index].show = !this.opts.series[index].show;
      }
      this.opts.animation = animation ? true : false;
      this.opts._scrollDistance_ = this.scrollOption.currentOffset;
      this.render()
    }
  }

  public showToolTip(touches: Point, option?: Partial<ToolTipOptions>) {
    let _touches = this.getTouches(touches);
    this.opts = ChartsUtil.objectAssign({} as ChartOptions, this.opts, {
      _scrollDistance_: this.scrollOption.currentOffset,
      animation: false
    });

    if (this.opts.type === 'line' || this.opts.type === 'area' || this.opts.type === 'column' || this.opts.type === 'scatter' || this.opts.type === 'bubble') {
      let current = this.getCurrentDataIndex(touches);
      let index: number|number[] = option?.index == undefined ? current.index : option.index;
      if ((typeof index == "number" && index > -1) || (Array.isArray(index) && index.length > 0)) {
        let seriesData = this.getSeriesDataItem(this.opts.series, index, current.group);
        if (seriesData.length !== 0) {
          let _getToolTipData = this.getToolTipData(seriesData, index, current.group, this.opts.categories, option),
            textList = _getToolTipData.textList,
            offset = _getToolTipData.offset;
          offset.y = _touches.y;
          this.opts.tooltip = {
            textList: option?.textList ? option.textList : textList,
            offset: option?.offset ? option.offset : offset,
            option: option,
            index: index,
            group: current.group
          };
        }
      } else {
        this.opts.tooltip = {
          show: false,
        }
      }
    }

    if (this.opts.type === 'mount') {
      let index: number|number[] = option?.index == undefined ? this.getCurrentDataIndex(touches).index : option.index;
      if (typeof index == "number" && index > -1) {
        this.opts = ChartsUtil.objectAssign({} as ChartOptions, this.opts, {animation: false});
        if (typeof index == "number") {
          let seriesData = this.opts._series_[index];
          let textList: tooltipTextList[] = [{
            text: option?.formatter ? option.formatter(seriesData, '', index, this.opts) : seriesData.name + ': ' + seriesData.data,
            color: seriesData.color,
            legendShape: this.opts.extra.tooltip?.legendShape == 'auto' ? seriesData.legendShape : this.opts.extra.tooltip?.legendShape
          }];
          let offset: Point = {
            x: this.opts.chartData.calPoints[index].x,
            y: _touches.y
          };
          this.opts.tooltip = {
            textList: option?.textList !== undefined ? option.textList : textList,
            offset: option?.offset !== undefined ? option.offset : offset,
            option: option,
            index: index
          };
        } else {
          this.opts.tooltip = {
            show: false,
          }
        }
      }
    }

    if (this.opts.type === 'bar') {
      let current = this.getCurrentDataIndex(touches);
      let index = option?.index == undefined ? current.index : option.index;
      if (typeof index == "number" && index > -1) {
        let seriesData = this.getSeriesDataItem(this.opts.series, index, current.group);
        if (seriesData.length !== 0) {
          let _getToolTipData = this.getToolTipData(seriesData, index, current.group, this.opts.categories, option),
            textList = _getToolTipData.textList,
            offset = _getToolTipData.offset;
          offset.x = _touches.x;
          this.opts.tooltip = {
            textList: option?.textList !== undefined ? option.textList : textList,
            offset: option?.offset !== undefined ? option.offset : offset,
            option: option,
            index: index
          };
        }
      } else {
        this.opts.tooltip = {
          show: false,
        }
      }
    }

    if (this.opts.type === 'mix') {
      let current = this.getCurrentDataIndex(touches);
      let index = option?.index == undefined ? current.index : option.index;
      if (typeof index == "number" && index > -1) {
        let currentOffset = this.scrollOption.currentOffset;
        this.opts = ChartsUtil.objectAssign({} as ChartOptions, this.opts, {
          _scrollDistance_: currentOffset,
          animation: false
        });
        let seriesData = this.getSeriesDataItem(this.opts.series, index, current.group);
        if (seriesData.length !== 0) {
          let _getMixToolTipData = this.getMixToolTipData(seriesData, index, this.opts.categories, option),
            textList = _getMixToolTipData.textList,
            offset = _getMixToolTipData.offset;
          offset.y = _touches.y;
          this.opts.tooltip = {
            textList: option?.textList !== undefined ? option.textList : textList,
            offset: option?.offset !== undefined ? option.offset : offset,
            option: option,
            index: index
          };
        }
      } else {
        this.opts.tooltip = {
          show: false,
        }
      }
    }

    if (this.opts.type === 'pie' || this.opts.type === 'ring' || this.opts.type === 'rose' || this.opts.type === 'funnel') {
      let index = option?.index == undefined ? this.getCurrentDataIndex(touches).index : option.index;
      if (typeof index == "number" && index > -1) {
        this.opts = ChartsUtil.objectAssign({} as ChartOptions, this.opts, {
          animation: false
        });

        let seriesData = ChartsUtil.objectAssign({} as AnyType, this.opts._series_[index]);
        let textList = [{
          text: option?.formatter ? option.formatter(seriesData, "", index, this.opts) : seriesData.name + ': ' + seriesData.data,
          color: seriesData.color,
          legendShape: this.opts.extra.tooltip?.legendShape == 'auto' ? seriesData.legendShape : this.opts.extra.tooltip?.legendShape
        }];
        let offset: Point = {
          x: _touches.x,
          y: _touches.y
        };
        this.opts.tooltip = {
          textList: option?.textList !== undefined ? option.textList : textList,
          offset: option?.offset !== undefined ? option.offset : offset,
          option: option,
          index: index
        };
      } else {
        this.opts.tooltip = {
          show: false,
        }
      }
    }

    if (this.opts.type === 'radar') {
      let current = this.getCurrentDataIndex(touches);
      let index = option?.index == undefined ? current.index : option.index;
      if (typeof index == "number" && index > -1) {
        this.opts = ChartsUtil.objectAssign({} as ChartOptions, this.opts, {animation: false});
        let seriesData = this.getSeriesDataItem(this.opts.series, index, current.group);
        if (seriesData.length !== 0) {
          let textList = seriesData.map((item) => {
            return {
              text: option?.formatter ? option.formatter(item, this.opts.categories[index as number], index as number, this.opts) : item.name + ': ' + item.data,
              color: item.color,
              legendShape: this.opts.extra.tooltip?.legendShape == 'auto' ? item.legendShape : this.opts.extra.tooltip?.legendShape
            };
          });
          let offset: Point = {
            x: _touches.x,
            y: _touches.y
          };
          this.opts.tooltip = {
            textList: option?.textList !== undefined ? option.textList : textList,
            offset: option?.offset !== undefined ? option.offset : offset,
            option: option,
            index: index
          };
        }
      } else {
        this.opts.tooltip = {
          show: false,
        }
      }
    }

    /*
    if (this.opts.type === 'candle') {
      var current = this.getCurrentDataIndex(e);
      var index = option.index == undefined ? current.index : option.index;
      if (index > -1) {
        var currentOffset = this.scrollOption.currentOffset;
        var opts = assign({}, this.opts, {
          _scrollDistance_: currentOffset,
          animation: false
        });
        var seriesData = getSeriesDataItem(this.opts.series, index);
        if (seriesData.length !== 0) {
          var _getToolTipData = getCandleToolTipData(this.opts.series[0].data, seriesData, this.opts, index, this.opts.categories, this.opts.extra.candle, option),
            textList = _getToolTipData.textList,
            offset = _getToolTipData.offset;
          offset.y = _touches$.y;
          opts.tooltip = {
            textList: option.textList ? option.textList : textList,
            offset: option.offset !== undefined ? option.offset : offset,
            option: option,
            index: index
          };
        }
      }
      drawCharts.call(this, opts.type, opts, this.config, this.context);
    }

    if (this.opts.type === 'map') {
      var index = option.index == undefined ? this.getCurrentDataIndex(e) : option.index;
      if (index > -1) {
        var opts = assign({}, this.opts, {animation: false});
        var seriesData = assign({}, this.opts.series[index]);
        seriesData.name = seriesData.properties.name
        var textList = [{
          text: option.formatter ? option.formatter(seriesData, undefined, index, this.opts) : seriesData.name,
          color: seriesData.color,
          legendShape: this.opts.extra.tooltip.legendShape == 'auto' ? seriesData.legendShape : this.opts.extra.tooltip.legendShape
        }];
        var offset = {
          x: _touches$.x,
          y: _touches$.y
        };
        opts.tooltip = {
          textList: option.textList ? option.textList : textList,
          offset: option.offset !== undefined ? option.offset : offset,
          option: option,
          index: index
        };
      }
      opts.updateData = false;
      drawCharts.call(this, opts.type, opts, this.config, this.context);
    }
    if (this.opts.type === 'word') {
      var index = option.index == undefined ? this.getCurrentDataIndex(e) : option.index;
      if (index > -1) {
        var opts = assign({}, this.opts, {animation: false});
        var seriesData = assign({}, this.opts.series[index]);
        var textList = [{
          text: option.formatter ? option.formatter(seriesData, undefined, index, this.opts) : seriesData.name,
          color: seriesData.color,
          legendShape: this.opts.extra.tooltip.legendShape == 'auto' ? seriesData.legendShape : this.opts.extra.tooltip.legendShape
        }];
        var offset = {
          x: _touches$.x,
          y: _touches$.y
        };
        opts.tooltip = {
          textList: option.textList ? option.textList : textList,
          offset: option.offset !== undefined ? option.offset : offset,
          option: option,
          index: index
        };
      }
      opts.updateData = false;
      drawCharts.call(this, opts.type, opts, this.config, this.context);
    }
    */
    this.render()
  };

  /**
   * 滚动条拖拽事件
   * 支持滚动条的图表类型为 column, mount, line, area, mix, candle
   */
  public scrollStart(touches: Point) {
    const _touches = this.getTouches(touches);
    if(this.opts.enableScroll === true) {
      this.scrollOption.startTouchX = _touches.x;
    }
  }

  public scroll(touches: Point) {
    if (this.scrollOption.lastMoveTime === 0) {
      this.scrollOption.lastMoveTime = Date.now();
    }
    let Limit: number = this.opts.touchMoveLimit || 60;
    let currMoveTime = Date.now();
    let duration = currMoveTime - Number(this.scrollOption.lastMoveTime);
    if (duration < Math.floor(1000 / Limit)) return;
    if (this.scrollOption.startTouchX == 0) return;
    this.scrollOption.lastMoveTime = currMoveTime;
    if (this.opts.enableScroll === true) {
      const _touches = this.getTouches(touches);
      let _distance = _touches.x - Number(this.scrollOption.startTouchX);
      let currentOffset = this.scrollOption.currentOffset as number;
      let validDistance = this.calValidDistance(currentOffset + _distance);
      this.scrollOption.distance = _distance = validDistance - currentOffset;
      this.opts = ChartsUtil.objectAssign({} as ChartOptions, this.opts, {
        _scrollDistance_: currentOffset + _distance,
        animation: false
      });
      this.render();
      return currentOffset + _distance;
    }
    return;
  }

  public scrollEnd() {
    if (this.opts.enableScroll === true) {
      let _scrollOption = this.scrollOption
      let currentOffset = _scrollOption.currentOffset as number
      let distance = _scrollOption.distance as number;
      this.scrollOption.currentOffset = currentOffset + distance;
      this.scrollOption.distance = 0;
      this.scrollOption.moveCount = 0;
    }
  }

  /**
   * 动态设置滚动条
   * 图表滚动条的横向偏移距离，应为负数
   */
  public translate(distance: number) {
    this.scrollOption = {
      "currentOffset": distance,
      "startTouchX": distance,
      "distance": 0,
      "lastMoveTime": 0
    };
    this.opts = ChartsUtil.objectAssign({} as ChartOptions, this.opts, {
      _scrollDistance_: distance,
      animation: false
    });
    this.render()
  }

  /**
   * 取消事件监听
   */
  public off(type: EventType, listener?: EventListener) {
    this.event.off(type, listener)
  }

  /**
   * 设置填充样式
   */
  protected setFillStyle(color: string|CanvasGradient|CanvasPattern): void {
    this.context.fillStyle = color;
  }

  /**
   * 设置描边样式
   */
  protected setStrokeStyle(color: string|CanvasGradient|CanvasPattern): void {
    this.context.strokeStyle = color;
  }

  /**
   * 设置绘制线条的宽度
   */
  protected setLineWidth(val: number) {
    this.context.lineWidth = val
  }

  /**
   * 指定线端点的样式
   */
  protected setLineCap(val: CanvasLineCap) {
    this.context.lineCap = val
  }

  /**
   * 设置文本绘制中的字体大小样式
   */
  protected setFontSize(val: number) {
    this.context.font = String(val) + GlobalConfig.fontUnit + " sans-serif";
  }

  /**
   * 设置文本绘制中的文本对齐方式
   */
  protected setTextAlign(val: CanvasTextAlign) {
    this.context.textAlign = val;
  }

  /**
   * 设置文本绘制中的水平对齐方式
   */
  protected setTextBaseline(val: CanvasTextBaseline) {
    this.context.textBaseline = val;
  }

  /**
   * 绘制阴影
   */
  protected setShadow(offsetX: number ,offsetY: number , blur: number, color: string) {
    this.context.shadowColor = color;
    this.context.shadowOffsetX = offsetX;
    this.context.shadowOffsetY = offsetY;
    this.context.shadowBlur = blur;
  }

  /**
   * 设置描边样式
   * @param 描述线段如何交替和线段间距长度的数组
   */
  protected setLineDash(val: number[]) {
    this.context.setLineDash(val);
  }

  /**
   * 测量文本宽度
   */
  protected measureText(text: string, fontSize: number): number {
    this.setFontSize(fontSize)
    return this.context.measureText(text).width;
  }

  /**
   * 旋转画布
   */
  protected contextRotate() {
    if (this.opts.rotateLock !== true) {
      this.context.translate(this.opts.height, 0);
      this.context.rotate(90 * Math.PI / 180);
    } else if (this.opts._rotate_ !== true) {
      this.context.translate(this.opts.height, 0);
      this.context.rotate(90 * Math.PI / 180);
      this.opts._rotate_ = true;
    }
  }

  /**
   * 计算图例数据
   */
  protected calculateLegendData(series: Series[], chartData: chartDataType) {
    let legendData: legendDataType = {
      area: {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
        width: 0,
        height: 0,
        wholeWidth: 0,
        wholeHeight: 0
      },
      points: [],
      widthArr: [],
      heightArr: []
    }
    if (this.opts.legend.show === false) {
      chartData.legendData = legendData;
      return legendData;
    }
    const padding = this.opts.legend.padding! * this.opts.pixelRatio;
    const margin = this.opts.legend.margin! * this.opts.pixelRatio;
    const fontSize = this.opts.legend.fontSize ? this.opts.legend.fontSize * this.opts.pixelRatio : this.opts.fontSize;
    let shapeWidth = 15 * this.opts.pixelRatio;
    let shapeRight = 5 * this.opts.pixelRatio;
    let lineHeight = Math.max(this.opts.legend.lineHeight! * this.opts.pixelRatio, fontSize);
    if (this.opts.legend.position == 'top' || this.opts.legend.position == 'bottom') {
      let legendList: Array<Series[]> = [];
      let widthCount = 0;
      let widthCountArr: number[] = [];
      let currentRow: Series[] = [];
      for (let i = 0; i < series.length; i++) {
        let item: Series = series[i];
        const legendText = item.legendText ? item.legendText : item.name;
        let itemWidth = shapeWidth + shapeRight + this.measureText(legendText || 'undefined', fontSize) + this.opts.legend.itemGap! * this.opts.pixelRatio;
        if (widthCount + itemWidth > this.opts.width - this.opts.area[1] - this.opts.area[3]) {
          legendList.push(currentRow);
          widthCountArr.push(widthCount - this.opts.legend.itemGap! * this.opts.pixelRatio);
          widthCount = itemWidth;
          currentRow = [item];
        } else {
          widthCount += itemWidth;
          currentRow.push(item);
        }
      }
      if (currentRow.length) {
        legendList.push(currentRow);
        widthCountArr.push(widthCount - this.opts.legend.itemGap! * this.opts.pixelRatio);
        legendData.widthArr = widthCountArr;
        let legendWidth = Math.max(...widthCountArr);
        switch (this.opts.legend.float) {
          case 'left':
            legendData.area.start.x = this.opts.area[3];
            legendData.area.end.x = this.opts.area[3] + legendWidth + 2 * padding;
            break;
          case 'right':
            legendData.area.start.x = this.opts.width - this.opts.area[1] - legendWidth - 2 * padding;
            legendData.area.end.x = this.opts.width - this.opts.area[1];
            break;
          default:
            legendData.area.start.x = (this.opts.width - legendWidth) / 2 - padding;
            legendData.area.end.x = (this.opts.width + legendWidth) / 2 + padding;
        }
        legendData.area.width = legendWidth + 2 * padding;
        legendData.area.wholeWidth = legendWidth + 2 * padding;
        legendData.area.height = legendList.length * lineHeight + 2 * padding;
        legendData.area.wholeHeight = legendList.length * lineHeight + 2 * padding + 2 * margin;
        legendData.points = legendList;
      }
    } else {
      let len = series.length;
      let maxHeight = this.opts.height - this.opts.area[0] - this.opts.area[2] - 2 * margin - 2 * padding;
      let maxLength = Math.min(Math.floor(maxHeight / lineHeight), len);
      legendData.area.height = maxLength * lineHeight + padding * 2;
      legendData.area.wholeHeight = maxLength * lineHeight + padding * 2;
      switch (this.opts.legend.float) {
        case 'top':
          legendData.area.start.y = this.opts.area[0] + margin;
          legendData.area.end.y = this.opts.area[0] + margin + legendData.area.height;
          break;
        case 'bottom':
          legendData.area.start.y = this.opts.height - this.opts.area[2] - margin - legendData.area.height;
          legendData.area.end.y = this.opts.height - this.opts.area[2] - margin;
          break;
        default:
          legendData.area.start.y = (this.opts.height - legendData.area.height) / 2;
          legendData.area.end.y = (this.opts.height + legendData.area.height) / 2;
      }
      let lineNum = len % maxLength === 0 ? len / maxLength : Math.floor((len / maxLength) + 1);
      let currentRow: Array<Series[]> = [];
      for (let i = 0; i < lineNum; i++) {
        let temp = series.slice(i * maxLength, i * maxLength + maxLength);
        currentRow.push(temp);
      }
      legendData.points = currentRow;
      if (currentRow.length) {
        for (let i = 0; i < currentRow.length; i++) {
          let item = currentRow[i];
          let maxWidth = 0;
          for (let j = 0; j < item.length; j++) {
            let itemWidth = shapeWidth + shapeRight + this.measureText(item[j].name || 'undefined', fontSize) + this.opts.legend.itemGap! * this.opts.pixelRatio;
            if (itemWidth > maxWidth) {
              maxWidth = itemWidth;
            }
          }
          legendData.widthArr.push(maxWidth);
          legendData.heightArr.push(item.length * lineHeight + padding * 2);
        }
        let legendWidth = 0
        for (let i = 0; i < legendData.widthArr.length; i++) {
          legendWidth += legendData.widthArr[i];
        }
        legendData.area.width = legendWidth - this.opts.legend.itemGap! * this.opts.pixelRatio + 2 * padding;
        legendData.area.wholeWidth = legendData.area.width + padding;
      }
    }

    switch (this.opts.legend.position) {
      case 'top':
        legendData.area.start.y = this.opts.area[0] + margin;
        legendData.area.end.y = this.opts.area[0] + margin + legendData.area.height;
        break;
      case 'bottom':
        legendData.area.start.y = this.opts.height - this.opts.area[2] - legendData.area.height - margin;
        legendData.area.end.y = this.opts.height - this.opts.area[2] - margin;
        break;
      case 'left':
        legendData.area.start.x = this.opts.area[3];
        legendData.area.end.x = this.opts.area[3] + legendData.area.width;
        break;
      case 'right':
        legendData.area.start.x = this.opts.width - this.opts.area[1] - legendData.area.width;
        legendData.area.end.x = this.opts.width - this.opts.area[1];
        break;
    }
    chartData.legendData = legendData;
    return legendData;
  }

  protected getYAxisTextList(series: Series[], stack: string, yData: Partial<YAxisOptionsData>) {
    let data: (number | ValueAndColorData | null)[] = [];
    if (stack === 'stack') {
      data = ChartsUtil.dataCombineStack(series, this.opts.categories.length);
    } else {
      data = ChartsUtil.dataCombine(series);
    }

    //过滤null并提取数值
    const sorted: number[] = [];

    data.forEach(item => {
      if (item === null) return;

      if (Array.isArray(item)) {
        if (this.opts.type === 'candle') {
          // 蜡烛图数据：展开所有子项
          item.forEach((subitem: number | ValueAndColorData | null) => {
            if (typeof subitem === 'number') {
              sorted.push(subitem);
            } else if (subitem && typeof subitem === 'object' && typeof subitem.value === 'number') {
              sorted.push(subitem.value);
            }
          });
        } else {
          // 其他图表类型：取数组第二个元素
          if (item.length > 1) {
            let tmp: Array<AnyType> = item
            const secondItem: number | ValueAndColorData | null = tmp[1];

            if (typeof secondItem === 'number') {
              sorted.push(secondItem);
            } else if (secondItem && typeof secondItem === 'object' && typeof secondItem.value === 'number') {
              sorted.push(secondItem.value);
            }
          }
        }
      } else if (typeof item === 'object') {
        // 处理对象类型（ValueAndColorData）
        if (typeof item.value === 'number') {
          sorted.push(item.value);
        }
      } else if (typeof item === 'number') {
        // 处理普通数值类型
        sorted.push(item);
      }
    });

    let minData = yData.min || 0;
    let maxData = yData.max || 0;
    if (sorted.length > 0) {
      minData = Math.min(...sorted);
      maxData = Math.max(...sorted);
    }
    if (minData === maxData) {
      if(maxData == 0){
        maxData = 10;
      }else{
        minData = 0;
      }
    }
    let dataRange = ChartsUtil.getDataRange(minData, maxData);
    let minRange = (yData.min === undefined || yData.min === null) ? dataRange.minRange : yData.min;
    let maxRange = (yData.max === undefined || yData.max === null) ? dataRange.maxRange : yData.max;
    let eachRange = (maxRange - minRange) / this.opts.yAxis.splitNumber!;
    let range: number[] = [];
    for (let i = 0; i <= this.opts.yAxis.splitNumber!; i++) {
      range.push(minRange + eachRange * i);
    }
    return range.reverse();
  }

  protected getXAxisTextList(series: Series[], stack: string) {
    let data: (number | ValueAndColorData | Array<number>)[] = [];
    if (stack === 'stack') {
      data = ChartsUtil.dataCombineStack(series, this.opts.categories.length);
    } else {
      data = ChartsUtil.dataCombine(series);
    }

    const sorted: number[] = [];
    data = data.filter((item: number | ValueAndColorData | Array<number>) => {
      if (typeof item === 'object' && item !== null) {
        if (item.constructor.toString().indexOf('Array') > -1) {
          return item !== null;
        } else {
          return (item as ValueAndColorData).value !== null;
        }
      } else {
        return item !== null;
      }
    });
    data.map((item: number | ValueAndColorData | Array<number>) => {
      if (typeof item === 'object' && item !== null) {
        if (Array.isArray(item)) {
          if (this.opts.type == 'candle') {
            (item).map((subitem: number) => {
              sorted.push(subitem);
            })
          } else {
            sorted.push(item[0]);
          }
        } else {
          sorted.push(item.value);
        }
      } else {
        sorted.push(item as number);
      }
    })

    let minData = 0;
    let maxData = 0;
    if (sorted.length > 0) {
      minData = Math.min(...sorted);
      maxData = Math.max(...sorted);
    }

    if (typeof this.opts.xAxis.min === 'number') {
      minData = Math.min(this.opts.xAxis.min, minData);
    }
    if (typeof this.opts.xAxis.max === 'number') {
      maxData = Math.max(this.opts.xAxis.max, maxData);
    }

    if (minData === maxData) {
      let rangeSpan = maxData || 10;
      maxData += rangeSpan;
    }
    //let dataRange = getDataRange(minData, maxData);
    let minRange = minData;
    let maxRange = maxData;
    let range: number[] = [];
    let eachRange = (maxRange - minRange) / this.opts.xAxis.splitNumber!;
    for (let i = 0; i <= this.opts.xAxis.splitNumber!; i++) {
      range.push(minRange + eachRange * i);
    }
    return range;
  }

  /**
   * 计算Y轴数据
   */
  protected calculateYAxisData(series: Series[]) {
    //堆叠图重算Y轴
    let columnstyle = ChartsUtil.objectAssign({} as Partial<ColumnExtra>, {
      type: ""
    }, this.opts.extra.column!);
    //如果是多Y轴，重新计算
    const YLength = this.opts.yAxis.data!.length;
    let newSeries: Array<Series[]> = new Array(YLength);

    let res: calculateYAxisDataRes = {
      rangesFormat: [],
      ranges: [],
      yAxisWidth: []
    }

    if (YLength > 0) {
      for (let i = 0; i < YLength; i++) {
        newSeries[i] = [];
        for (let j = 0; j < series.length; j++) {
          if (series[j].index == i) {
            newSeries[i].push(series[j]);
          }
        }
      }

      let rangesArr: Array<string[]|number[]> = new Array(YLength); //可能是个string[][]或者number[][]，或者{"value":0.2,"color":"#1890ff"}[][] ???
      let rangesFormatArr: Array<string[]> = new Array(YLength);
      let yAxisWidthArr: Array<yAxisWidthType> = new Array(YLength);

      for (let i = 0; i < YLength; i++) {
        let yData = this.opts.yAxis.data![i];
        //如果总开关不显示，强制每个Y轴为不显示
        if (this.opts.yAxis.disabled == true) {
          yData.disabled = true;
        }
        if(yData.type === 'categories'){
          if(!yData.formatter){
            yData.formatter = (val,index,opts) => {return val + (yData.unit || '')};
          }
          yData.categories = yData.categories || this.opts.categories;
          rangesArr[i] = yData.categories;
        }else{
          if(!yData.formatter){
            yData.formatter = (val,index,opts) => {return ChartsUtil.toFixed(val as number, yData.tofix || 0) + (yData.unit || '')};
          }
          rangesArr[i] = this.getYAxisTextList(newSeries[i], columnstyle.type!, yData);
        }
        let yAxisFontSizes = yData.fontSize ? (yData.fontSize * this.opts.pixelRatio) : this.opts.fontSize;
        yAxisWidthArr[i] = {
          position: yData.position ? yData.position : 'left',
          width: 0
        };
        rangesFormatArr[i] = rangesArr[i].map((items: number|string, index: number) => {
          let str = yData.formatter!(items, index, this.opts);
          yAxisWidthArr[i].width = Math.max(yAxisWidthArr[i].width, this.measureText(str, yAxisFontSizes) + 5);
          return str;
        });
        let calibration = yData.calibration ? 4 * this.opts.pixelRatio : 0;
        yAxisWidthArr[i].width += calibration + 3 * this.opts.pixelRatio;
        if (yData.disabled === true) {
          yAxisWidthArr[i].width = 0;
        }
      }

      res.rangesFormat = rangesFormatArr
      res.ranges = rangesArr
      res.yAxisWidth = yAxisWidthArr
    } else {
      let rangesArr: Array<string[]|number[]> = new Array(1);
      let rangesFormatArr: Array<string[]> = new Array(1);
      let yAxisWidthArr: Array<yAxisWidthType> = new Array(1);
      if(this.opts.type === 'bar'){
        rangesArr[0] = this.opts.categories;
        if(!this.opts.yAxis.formatter){
          this.opts.yAxis.formatter = (val,index,opts) => {return val + (this.opts.yAxis.unit || '')}
        }
      }else{
        if(!this.opts.yAxis.formatter){
          this.opts.yAxis.formatter = (val,index,opts) => {return ChartsUtil.toFixed(Number(val), this.opts.yAxis.tofix ?? 0) + (this.opts.yAxis.unit || '')}
        }
        rangesArr[0] = this.getYAxisTextList(series, columnstyle.type!, {});
      }
      yAxisWidthArr[0] = {
        position: 'left',
        width: 0
      };
      let yAxisFontSize = this.opts.yAxis.fontSize * this.opts.pixelRatio || this.opts.fontSize;
      rangesFormatArr[0] = rangesArr[0].map((item: string|number, index: number) => {
        let formattedValue: string;
        if (typeof item === 'string') {
          // 字符串类型（柱状图分类）
          formattedValue = this.opts.yAxis.formatter!(Number(item), index, this.opts);
        } else {
          // 数值类型（其他图表Y轴数据）
          formattedValue = this.opts.yAxis.formatter!(item, index, this.opts);
        }

        // 计算文本宽度并更新
        const textWidth = this.measureText(formattedValue, yAxisFontSize) + 5;
        yAxisWidthArr[0].width = Math.max(yAxisWidthArr[0].width, textWidth);

        return formattedValue;
      });
      yAxisWidthArr[0].width += 3 * this.opts.pixelRatio;
      if (this.opts.yAxis.disabled === true) {
        yAxisWidthArr[0] = {
          position: 'left',
          width: 0
        };
        this.opts.yAxis.data![0] = {
          disabled: true
        };
      } else {
        this.opts.yAxis.data![0] = {
          disabled: false,
          position: 'left',
          max: this.opts.yAxis.max,
          min: this.opts.yAxis.min,
          formatter: this.opts.yAxis.formatter
        };
        if(this.opts.type === 'bar'){
          this.opts.yAxis.data![0].categories = this.opts.categories;
          this.opts.yAxis.data![0].type = 'categories';
        }
      }
      res.rangesFormat = rangesFormatArr
      res.ranges = rangesArr
      res.yAxisWidth = yAxisWidthArr
    }

    return res
  }

  protected calculateXAxisData(series: Series[]) {
    //堆叠图重算X轴
    let style = ChartsUtil.objectAssign({} as Partial<BarExtra>, {
      type: ""
    }, this.opts.extra.bar!);
    let result: calculateXAxisDataRes = {
      xAxisPoints: [],
      startX: 0,
      endX: 0,
      eachSpacing: 0,

      angle: 0,
      xAxisHeight: this.opts.xAxis.lineHeight! * this.opts.pixelRatio + this.opts.xAxis.marginTop! * this.opts.pixelRatio,
      ranges: this.getXAxisTextList(series, style.type!)
    };
    result.rangesFormat = result.ranges.map((item: number) => {
      //item = opts.xAxis.formatter ? opts.xAxis.formatter(item) : util.toFixed(item, 2);
      item = Number(ChartsUtil.toFixed(item, 2));
      return String(item);
    });
    let xAxisScaleValues = result.ranges.map((item: number) => {
      // 如果刻度值是浮点数,则保留两位小数
      item = Number(ChartsUtil.toFixed(item, 2));
      // 若有自定义格式则调用自定义的格式化函数
      //item = opts.xAxis.formatter ? opts.xAxis.formatter(Number(item)) : item;
      return String(item);
    });
    result = ChartsUtil.objectAssign(result, this.getXAxisPoints(xAxisScaleValues));
    // 计算X轴刻度的属性譬如每个刻度的间隔,刻度的起始点\结束点以及总长
    let eachSpacing = result.eachSpacing;
    let textLength = xAxisScaleValues.map((item) => {
      return this.measureText(item, this.opts.xAxis.fontSize! * this.opts.pixelRatio);
    });
    if (this.opts.xAxis.disabled === true) {
      result.xAxisHeight = 0;
    }
    return result;
  }

  /**
   * 获取X轴位置
   */
  protected getXAxisPoints(categories: Array<string>) {
    let spacingValid = this.opts.width - this.opts.area[1] - this.opts.area[3];
    let dataCount = this.opts.enableScroll ? Math.min(this.opts.xAxis.itemCount!, categories.length) : categories.length;
    if ((this.opts.type == 'line' || this.opts.type == 'area' || this.opts.type == 'scatter' || this.opts.type == 'bubble' || this.opts.type == 'bar')
      && dataCount > 1 && this.opts.xAxis.boundaryGap == 'justify') {
      dataCount -= 1;
    }
    let widthRatio = 0;
    if(this.opts.type == 'mount' && this.opts.extra && this.opts.extra.mount && this.opts.extra.mount.widthRatio && this.opts.extra.mount.widthRatio > 1){
      if(this.opts.extra.mount.widthRatio>2) this.opts.extra.mount.widthRatio = 2
      widthRatio = this.opts.extra.mount.widthRatio - 1;
      dataCount += widthRatio;
    }
    let eachSpacing = spacingValid / dataCount;
    let xAxisPoints: number[] = [];
    let startX: number = this.opts.area[3];
    let endX: number = this.opts.width - this.opts.area[1];
    categories.forEach((item, index) => {
      xAxisPoints.push(startX + widthRatio / 2 * eachSpacing + index * eachSpacing);
    });
    if (this.opts.xAxis.boundaryGap !== 'justify') {
      if (this.opts.enableScroll === true) {
        xAxisPoints.push(startX + widthRatio * eachSpacing + categories.length * eachSpacing);
      } else {
        xAxisPoints.push(endX);
      }
    }
    return {
      xAxisPoints: xAxisPoints,
      startX: startX,
      endX: endX,
      eachSpacing: eachSpacing
    } as XAxisPointsType;
  }

  protected calculateCategoriesData(categories: Array<string>) {
    let result: calculateCategoriesDataRes = {
      angle: 0,
      xAxisHeight: this.opts.xAxis.lineHeight! * this.opts.pixelRatio + this.opts.xAxis.marginTop! * this.opts.pixelRatio
    };
    let fontSize = this.opts.xAxis.fontSize! * this.opts.pixelRatio
    let categoriesTextLen = categories.map((item,index) => {
      let xitem = this.opts.xAxis.formatter ? this.opts.xAxis.formatter(item,index,this.opts) : item;
      return this.measureText(String(xitem), fontSize);
    });
    let maxTextLength = Math.max(...categoriesTextLen);
    if (this.opts.xAxis.rotateLabel == true) {
      result.angle = this.opts.xAxis.rotateAngle! * Math.PI / 180;
      let tempHeight = this.opts.xAxis.marginTop! * this.opts.pixelRatio * 2 +  Math.abs(maxTextLength * Math.sin(result.angle))
      tempHeight = tempHeight < fontSize + this.opts.xAxis.marginTop! * this.opts.pixelRatio * 2 ? tempHeight + this.opts.xAxis.marginTop! * this.opts.pixelRatio * 2 : tempHeight;
      result.xAxisHeight = tempHeight;
    }
    if (this.opts.enableScroll && this.opts.xAxis.scrollShow) {
      result.xAxisHeight += 6 * this.opts.pixelRatio;
    }
    if (this.opts.xAxis.disabled) {
      result.xAxisHeight = 0;
    }
    return result;
  }

  /**
   * 获取Y轴网格
   */
  protected drawYAxisGrid(categories: Array<string>) {
    if (this.opts.yAxis.disableGrid === true) {
      return;
    }
    let spacingValid = this.opts.height - this.opts.area[0] - this.opts.area[2];
    let eachSpacing = spacingValid / this.opts.yAxis.splitNumber!;
    let startX: number = this.opts.area[3];
    let xAxisPoints: number[] = this.opts.chartData.xAxisData.xAxisPoints
    let xAxiseachSpacing: number = this.opts.chartData.xAxisData.eachSpacing;
    let TotalWidth = xAxiseachSpacing * (xAxisPoints.length - 1);
    if(this.opts.type == 'mount' && this.opts.extra && this.opts.extra.mount && this.opts.extra.mount?.widthRatio && this.opts.extra.mount.widthRatio > 1 ) {
      if(this.opts.extra.mount.widthRatio>2) this.opts.extra.mount.widthRatio = 2
      TotalWidth += (this.opts.extra.mount.widthRatio - 1) * xAxiseachSpacing;
    }
    let endX = startX + TotalWidth;
    let points: number[] = [];
    let startY = 1
    if (this.opts.xAxis.axisLine === false) {
      startY = 0
    }
    for (let i = startY; i < this.opts.yAxis.splitNumber! + 1; i++) {
      points.push(this.opts.height - this.opts.area[2] - eachSpacing * i);
    }
    this.context.save();
    if (this.opts._scrollDistance_ && this.opts._scrollDistance_ !== 0) {
      this.context.translate(this.opts._scrollDistance_, 0);
    }
    if (this.opts.yAxis.gridType == 'dash') {
      this.setLineDash([this.opts.yAxis.dashLength! * this.opts.pixelRatio, this.opts.yAxis.dashLength! * this.opts.pixelRatio]);
    }
    this.setStrokeStyle(this.opts.yAxis.gridColor!);
    this.setLineWidth(1 * this.opts.pixelRatio);
    points.forEach((item, index) => {
      this.context.beginPath();
      this.context.moveTo(startX, item);
      this.context.lineTo(endX, item);
      this.context.stroke();
    });
    this.setLineDash([]);
    this.context.restore();
  }

  protected drawXAxis(categories: Array<string>) {
    let xAxisData: XAxisPointsType = this.opts.chartData.xAxisData
    let xAxisPoints: number[] = xAxisData.xAxisPoints
    let startX: number = xAxisData.startX
    let endX: number = xAxisData.endX
    let eachSpacing: number = xAxisData.eachSpacing
    let boundaryGap: "center" | "justify" = 'center';
    if (this.opts.type == 'bar' || this.opts.type == 'line' || this.opts.type == 'area'|| this.opts.type == 'scatter' || this.opts.type == 'bubble') {
      boundaryGap = this.opts.xAxis.boundaryGap!;
    }
    let startY: number = this.opts.height - this.opts.area[2];
    let endY: number = this.opts.area[0];

    //绘制滚动条
    if (this.opts.enableScroll && this.opts.xAxis.scrollShow) {
      let scrollY = this.opts.height - this.opts.area[2] + GlobalConfig.xAxisHeight;
      let scrollScreenWidth = endX - startX;
      let scrollTotalWidth = eachSpacing * (xAxisPoints.length - 1);
      if(this.opts.type == 'mount' && this.opts.extra && this.opts.extra.mount && this.opts.extra.mount.widthRatio && this.opts.extra.mount.widthRatio > 1){
        if(this.opts.extra.mount.widthRatio>2) this.opts.extra.mount.widthRatio = 2
        scrollTotalWidth += (this.opts.extra.mount.widthRatio - 1) * eachSpacing;
      }
      let scrollWidth = scrollScreenWidth * scrollScreenWidth / scrollTotalWidth;
      let scrollLeft = 0;
      if (this.opts._scrollDistance_) {
        scrollLeft = -(this.opts._scrollDistance_ as number) * (scrollScreenWidth) / scrollTotalWidth;
      }
      this.context.beginPath();
      this.setLineCap('round');
      this.setLineWidth(6 * this.opts.pixelRatio);
      this.setStrokeStyle(this.opts.xAxis.scrollBackgroundColor || "#EFEBEF");
      this.context.moveTo(startX, scrollY);
      this.context.lineTo(endX, scrollY);
      this.context.stroke();
      this.context.closePath();
      this.context.beginPath();
      this.setLineCap('round');
      this.setLineWidth(6 * this.opts.pixelRatio);
      this.setStrokeStyle(this.opts.xAxis.scrollColor || "#A6A6A6");
      this.context.moveTo(startX + scrollLeft, scrollY);
      this.context.lineTo(startX + scrollLeft + scrollWidth, scrollY);
      this.context.stroke();
      this.context.closePath();
      this.setLineCap('butt');
    }
    this.context.save();
    if (this.opts._scrollDistance_ && this.opts._scrollDistance_ !== 0) {
      this.context.translate(this.opts._scrollDistance_, 0);
    }
    //绘制X轴刻度线
    if (this.opts.xAxis.calibration === true) {
      this.setStrokeStyle(this.opts.xAxis.gridColor || "#cccccc");
      this.setLineCap('butt');
      this.setLineWidth(1 * this.opts.pixelRatio);
      xAxisPoints.forEach((item, index) => {
        if (index > 0) {
          this.context.beginPath();
          this.context.moveTo(item - eachSpacing / 2, startY);
          this.context.lineTo(item - eachSpacing / 2, startY + 3 * this.opts.pixelRatio);
          this.context.closePath();
          this.context.stroke();
        }
      });
    }
    //绘制X轴网
    if (this.opts.xAxis.disableGrid !== true) {
      this.setStrokeStyle(this.opts.xAxis.gridColor || "#cccccc");
      this.setLineCap('butt');
      this.setLineWidth(1 * this.opts.pixelRatio);
      if (this.opts.xAxis.gridType == 'dash') {
        this.setLineDash([this.opts.xAxis.dashLength! * this.opts.pixelRatio, this.opts.xAxis.dashLength! * this.opts.pixelRatio]);
      }
      this.opts.xAxis.gridEval = this.opts.xAxis.gridEval || 1;
      xAxisPoints.forEach((item, index) => {
        if (index % this.opts.xAxis.gridEval! == 0) {
          this.context.beginPath();
          this.context.moveTo(item, startY);
          this.context.lineTo(item, endY);
          this.context.stroke();
        }
      });
      this.setLineDash([]);
    }
    //绘制X轴文案
    if (this.opts.xAxis.disabled !== true) {
      // 对X轴列表做抽稀处理
      //默认全部显示X轴标签
      let maxXAxisListLength = categories.length;
      //如果设置了X轴单屏数量
      if (this.opts.xAxis.labelCount) {
        //如果设置X轴密度
        if (this.opts.xAxis.itemCount) {
          maxXAxisListLength = Math.ceil(categories.length / this.opts.xAxis.itemCount * this.opts.xAxis.labelCount);
        } else {
          maxXAxisListLength = this.opts.xAxis.labelCount;
        }
        maxXAxisListLength -= 1;
      }

      let ratio = Math.ceil(categories.length / maxXAxisListLength);

      let newCategories: string[] = [];
      let cgLength = categories.length;
      for (let i = 0; i < cgLength; i++) {
        if (i % ratio !== 0) {
          newCategories.push("");
        } else {
          newCategories.push(categories[i]);
        }
      }
      newCategories[cgLength - 1] = categories[cgLength - 1];
      let xAxisFontSize = this.opts.xAxis.fontSize! * this.opts.pixelRatio || this.opts.fontSize;
      if (this.opts._xAxisTextAngle_ === 0) {
        newCategories.forEach((item, index) => {
          let xitem = this.opts.xAxis.formatter ? this.opts.xAxis.formatter(item, index, this.opts) : item;
          let offset = -this.measureText(String(xitem), xAxisFontSize) / 2;
          if (boundaryGap == 'center') {
            offset += eachSpacing / 2;
          }
          let scrollHeight = 0;
          if (this.opts.xAxis.scrollShow) {
            scrollHeight = 6 * this.opts.pixelRatio;
          }
          // 如果在主视图区域内
          let _scrollDistance_ = this.opts._scrollDistance_ as number || 0;
          let truePoints = boundaryGap == 'center' ? xAxisPoints[index] + eachSpacing / 2 : xAxisPoints[index];
          if((truePoints - Math.abs(_scrollDistance_)) >= (this.opts.area[3] - 1) && (truePoints - Math.abs(_scrollDistance_)) <= (this.opts.width - this.opts.area[1] + 1)) {
            this.context.beginPath();
            this.setFontSize(xAxisFontSize);
            this.setFillStyle(this.opts.xAxis.fontColor || this.opts.fontColor);
            this.context.fillText(String(xitem), xAxisPoints[index] + offset, startY + this.opts.xAxis.marginTop! * this.opts.pixelRatio + (this.opts.xAxis.lineHeight! - this.opts.xAxis.fontSize!) * this.opts.pixelRatio / 2 + this.opts.xAxis.fontSize! * this.opts.pixelRatio);
            this.context.closePath();
            this.context.stroke();
          }
        });
      } else {
        newCategories.forEach((item, index) => {
          let xitem = this.opts.xAxis.formatter ? this.opts.xAxis.formatter(item, index, this.opts) : item;
          // 如果在主视图区域内
          let _scrollDistance_ = this.opts._scrollDistance_ as number || 0;
          let truePoints = boundaryGap == 'center' ? xAxisPoints[index] + eachSpacing / 2 : xAxisPoints[index];
          if((truePoints - Math.abs(_scrollDistance_)) >= (this.opts.area[3] - 1) && (truePoints - Math.abs(_scrollDistance_)) <= (this.opts.width - this.opts.area[1] + 1)){
            this.context.save();
            this.context.beginPath();
            this.setFontSize(xAxisFontSize);
            this.setFillStyle(this.opts.xAxis.fontColor || this.opts.fontColor);
            let textWidth = this.measureText(String(xitem), xAxisFontSize);
            let offsetX = xAxisPoints[index];
            if (boundaryGap == 'center') {
              offsetX = xAxisPoints[index] + eachSpacing / 2;
            }
            let scrollHeight = 0;
            if (this.opts.xAxis.scrollShow) {
              scrollHeight = 6 * this.opts.pixelRatio;
            }
            let offsetY = startY + this.opts.xAxis.marginTop! * this.opts.pixelRatio + xAxisFontSize - xAxisFontSize * Math.abs(Math.sin(this.opts._xAxisTextAngle_));
            if(this.opts.xAxis.rotateAngle! < 0){
              offsetX -= xAxisFontSize / 2;
              textWidth = 0;
            }else{
              offsetX += xAxisFontSize / 2;
              textWidth = -textWidth;
            }
            this.context.translate(offsetX, offsetY);
            this.context.rotate(-1 * this.opts._xAxisTextAngle_);
            this.context.fillText(String(xitem), textWidth , 0 );
            this.context.closePath();
            this.context.stroke();
            this.context.restore();
          }
        });
      }
    }
    this.context.restore();

    //画X轴标题
    if (this.opts.xAxis.title) {
      this.context.beginPath();
      this.setFontSize(this.opts.xAxis.titleFontSize! * this.opts.pixelRatio);
      this.setFillStyle(this.opts.xAxis.titleFontColor!);
      this.context.fillText(String(this.opts.xAxis.title), this.opts.width - this.opts.area[1] + this.opts.xAxis.titleOffsetX! * this.opts.pixelRatio,
        this.opts.height - this.opts.area[2] + this.opts.xAxis.marginTop! * this.opts.pixelRatio + (this.opts.xAxis.lineHeight! - this.opts.xAxis.titleFontSize!)
          * this.opts.pixelRatio / 2 + (this.opts.xAxis.titleFontSize! + this.opts.xAxis.titleOffsetY!) * this.opts.pixelRatio);
      this.context.closePath();
      this.context.stroke();
    }

    //绘制X轴轴线
    if (this.opts.xAxis.axisLine) {
      this.context.beginPath();
      this.setStrokeStyle(this.opts.xAxis.axisLineColor!);
      this.setLineWidth(1 * this.opts.pixelRatio);
      this.context.moveTo(startX, this.opts.height - this.opts.area[2]);
      this.context.lineTo(endX, this.opts.height - this.opts.area[2]);
      this.context.stroke();
    }
  }

  /**
   * 处理柱状图/混合图数据
   */
  protected fixColumnData(points: Array<DataPoints | null>, eachSpacing: number, columnLen: number, seriesIndex: number) {
    return points.map((item) => {
      if (item === null) {
        return null;
      }
      let seriesGap = 0;
      let categoryGap = 0;
      if (this.opts.type == 'mix') {
        seriesGap = this.opts.extra.mix!.column?.seriesGap ? (this.opts.extra.mix!.column!.seriesGap * this.opts.pixelRatio) : 0;
        categoryGap = this.opts.extra.mix!.column?.categoryGap ? (this.opts.extra.mix!.column!.categoryGap * this.opts.pixelRatio) : 0;
      } else {
        seriesGap = this.opts.extra.column!.seriesGap ? (this.opts.extra.column!.seriesGap * this.opts.pixelRatio) : 0;
        categoryGap = this.opts.extra.column!.categoryGap ? (this.opts.extra.column!.categoryGap * this.opts.pixelRatio) : 0;
      }
      seriesGap =  Math.min(seriesGap, eachSpacing / columnLen)
      categoryGap =  Math.min(categoryGap, eachSpacing / columnLen)
      item.width = Math.ceil((eachSpacing - 2 * categoryGap - seriesGap * (columnLen - 1)) / columnLen);
      if (this.opts.extra.mix && this.opts.extra.mix.column && this.opts.extra.mix.column.width && +this.opts.extra.mix.column.width > 0) {
        item.width = Math.min(item.width, +this.opts.extra.mix.column!.width! * this.opts.pixelRatio);
      }
      if (this.opts.extra.column && this.opts.extra.column.width && +this.opts.extra.column.width > 0) {
        item.width = Math.min(item.width, +this.opts.extra.column.width * this.opts.pixelRatio);
      }
      if (item.width <= 0) {
        item.width = 1;
      }
      item.x += (seriesIndex + 0.5 - columnLen / 2) * (item.width + seriesGap);
      return item;
    });
  }

  /**
   * 获取数据位置
   */
  protected getDataPoints(data: SeriesDataItem[], minRange: number, maxRange: number, xAxisPoints: number[], eachSpacing: number, process: number = 1) {
    let boundaryGap: "center" | "justify" = 'center';
    if (this.opts.type == 'line' || this.opts.type == 'area' || this.opts.type == 'scatter' || this.opts.type == 'bubble' ) {
      boundaryGap = this.opts.xAxis.boundaryGap ?? 'center';
    }
    let points: Array<DataPoints|null> = [];
    let validHeight = this.opts.height - this.opts.area[0] - this.opts.area[2];
    let validWidth = this.opts.width - this.opts.area[1] - this.opts.area[3];
    data.forEach((item, index) => {
      if (item === null) {
        points.push(null);
      } else {
        let point: DataPoints = {
          color: "",  // item.color ???
          x: xAxisPoints[index],
          y: 0
        };
        let value: number | number[] | ValueAndColorData | Record<string, number> = item;
        if (typeof item === 'object' && item !== null) {
          if (item.constructor.toString().indexOf('Array') > -1) {
            let xranges: number[], xminRange: number, xmaxRange: number;
            xranges = [].concat(this.opts.chartData.xAxisData.ranges);
            xminRange = xranges.shift()!;
            xmaxRange = xranges.pop()!;
            value = (item as number[])[1] as number;
            point.x = this.opts.area[3] + validWidth * ((item as number[])[0] - xminRange) / (xmaxRange - xminRange);
            if(this.opts.type == 'bubble'){
              point.r = (item as number[])[2];
              point.t = (item as number[])[3];
            }
          } else {
            const tmp = item as ValueAndColorData
            value = tmp.value;
          }
        }
        if (boundaryGap == 'center') {
          point.x += eachSpacing / 2;
        }
        let height = validHeight * (Number(value) - minRange) / (maxRange - minRange);
        height *= process;
        point.y = this.opts.height - height - this.opts.area[2];
        points.push(point);
      }
    });
    return points;
  }


  protected drawYAxis() {
    if (this.opts.yAxis.disabled === true) {
      return;
    }
    let spacingValid = this.opts.height - this.opts.area[0] - this.opts.area[2];
    let eachSpacing = spacingValid / this.opts.yAxis.splitNumber!;
    let startX: number = this.opts.area[3];
    let endX = this.opts.width - this.opts.area[1];
    let endY = this.opts.height - this.opts.area[2];
    // set YAxis background
    this.context.beginPath();
    this.setFillStyle(this.opts.background);
    if (this.opts.enableScroll == true && this.opts.xAxis.scrollPosition && this.opts.xAxis.scrollPosition !== 'left') {
      this.context.fillRect(0, 0, startX, endY + 2 * this.opts.pixelRatio);
    }
    if (this.opts.enableScroll == true && this.opts.xAxis.scrollPosition && this.opts.xAxis.scrollPosition !== 'right') {
      this.context.fillRect(endX, 0, this.opts.width, endY + 2 * this.opts.pixelRatio);
    }
    this.context.closePath();
    this.context.stroke();

    let tStartLeft: number = this.opts.area[3];
    let tStartRight = this.opts.width - this.opts.area[1];
    let tStartCenter: number = this.opts.area[3] + (this.opts.width - this.opts.area[1] - this.opts.area[3]) / 2;
    if (this.opts.yAxis.data) {
      for (let i = 0; i < this.opts.yAxis.data.length; i++) {
        let yData = this.opts.yAxis.data[i] as YAxisOptionsData;
        let points: number[] = [];
        if(yData.type === 'categories'){
          for (let i = 0; i <= yData.categories.length; i++) {
            points.push(this.opts.area[0] + spacingValid / yData.categories.length / 2 + spacingValid / yData.categories.length * i);
          }
        }else{
          for (let i = 0; i <= this.opts.yAxis.splitNumber!; i++) {
            points.push(this.opts.area[0] + eachSpacing * i);
          }
        }
        if (yData.disabled !== true) {
          let rangesFormat: Array<string> = this.opts.chartData.yAxisData.rangesFormat[i];
          let yAxisFontSize = yData.fontSize ? (yData.fontSize * this.opts.pixelRatio) : this.opts.fontSize;
          let yAxisWidth: yAxisWidthType = this.opts.chartData.yAxisData.yAxisWidth[i];
          let textAlign = yData.textAlign || "right";
          //画Y轴刻度及文案
          rangesFormat.forEach((item, index) => {
            const pos = points[index];
            this.context.beginPath();
            this.setFontSize(yAxisFontSize);
            this.setLineWidth(1 * this.opts.pixelRatio);
            this.setStrokeStyle(yData.axisLineColor || '#cccccc');
            this.setFillStyle(yData.fontColor || this.opts.fontColor);
            let tmpstrat = 0;
            let gapwidth = 4 * this.opts.pixelRatio;
            if (yAxisWidth.position == 'left') {
              //画刻度线
              if (yData.calibration == true) {
                this.context.moveTo(tStartLeft, pos);
                this.context.lineTo(tStartLeft - 3 * this.opts.pixelRatio, pos);
                gapwidth += 3 * this.opts.pixelRatio;
              }
              //画文字
              switch (textAlign) {
                case "left":
                  this.setTextAlign('left');
                  tmpstrat = tStartLeft - yAxisWidth.width
                  break;
                case "right":
                  this.setTextAlign('right');
                  tmpstrat = tStartLeft - gapwidth
                  break;
                default:
                  this.setTextAlign('center');
                  tmpstrat = tStartLeft - yAxisWidth.width / 2
              }
              this.context.fillText(String(item), tmpstrat, pos + yAxisFontSize / 2 - 3 * this.opts.pixelRatio);

            } else if (yAxisWidth.position == 'right') {
              //画刻度线
              if (yData.calibration == true) {
                this.context.moveTo(tStartRight, pos);
                this.context.lineTo(tStartRight + 3 * this.opts.pixelRatio, pos);
                gapwidth += 3 * this.opts.pixelRatio;
              }
              switch (textAlign) {
                case "left":
                  this.setTextAlign('left');
                  tmpstrat = tStartRight + gapwidth
                  break;
                case "right":
                  this.setTextAlign('right');
                  tmpstrat = tStartRight + yAxisWidth.width
                  break;
                default:
                  this.setTextAlign('center');
                  tmpstrat = tStartRight + yAxisWidth.width / 2
              }
              this.context.fillText(String(item), tmpstrat, pos + yAxisFontSize / 2 - 3 * this.opts.pixelRatio);
            } else if (yAxisWidth.position == 'center') {
              //画刻度线
              if (yData.calibration == true) {
                this.context.moveTo(tStartCenter, pos);
                this.context.lineTo(tStartCenter - 3 * this.opts.pixelRatio, pos);
                gapwidth += 3 * this.opts.pixelRatio;
              }
              //画文字
              switch (textAlign) {
                case "left":
                  this.setTextAlign('left');
                  tmpstrat = tStartCenter - yAxisWidth.width
                  break;
                case "right":
                  this.setTextAlign('right');
                  tmpstrat = tStartCenter - gapwidth
                  break;
                default:
                  this.setTextAlign('center');
                  tmpstrat = tStartCenter - yAxisWidth.width / 2
              }
              this.context.fillText(String(item), tmpstrat, pos + yAxisFontSize / 2 - 3 * this.opts.pixelRatio);
            }
            this.context.closePath();
            this.context.stroke();
            this.setTextAlign('left');
          });
          //画Y轴轴线
          if (yData.axisLine !== false) {
            this.context.beginPath();
            this.setStrokeStyle(yData.axisLineColor || '#cccccc');
            this.setLineWidth(1 * this.opts.pixelRatio);
            if (yAxisWidth.position == 'left') {
              this.context.moveTo(tStartLeft, this.opts.height - this.opts.area[2]);
              this.context.lineTo(tStartLeft, this.opts.area[0]);
            } else if (yAxisWidth.position == 'right') {
              this.context.moveTo(tStartRight, this.opts.height - this.opts.area[2]);
              this.context.lineTo(tStartRight, this.opts.area[0]);
            } else if (yAxisWidth.position == 'center') {
              this.context.moveTo(tStartCenter, this.opts.height - this.opts.area[2]);
              this.context.lineTo(tStartCenter, this.opts.area[0]);
            }
            this.context.stroke();
          }
          //画Y轴标题
          if (this.opts.yAxis.showTitle) {
            let titleFontSize = yData.titleFontSize * this.opts.pixelRatio || this.opts.fontSize;
            let title = yData.title;
            this.context.beginPath();
            this.setFontSize(titleFontSize);
            this.setFillStyle(yData.titleFontColor || this.opts.fontColor);
            if (yAxisWidth.position == 'left') {
              this.context.fillText(title, tStartLeft - this.measureText(title, titleFontSize) / 2 + (yData.titleOffsetX || 0), this.opts.area[0] - (10 - (yData.titleOffsetY || 0)) * this.opts.pixelRatio);
            } else if (yAxisWidth.position == 'right') {
              this.context.fillText(title, tStartRight - this.measureText(title, titleFontSize) / 2 + (yData.titleOffsetX || 0), this.opts.area[0] - (10 - (yData.titleOffsetY || 0)) * this.opts.pixelRatio);
            } else if (yAxisWidth.position == 'center') {
              this.context.fillText(title, tStartCenter - this.measureText(title, titleFontSize) / 2 + (yData.titleOffsetX || 0), this.opts.area[0] - (10 - (yData.titleOffsetY || 0)) * this.opts.pixelRatio);
            }
            this.context.closePath();
            this.context.stroke();
          }
          if (yAxisWidth.position == 'left') {
            tStartLeft -= (yAxisWidth.width + this.opts.yAxis.padding! * this.opts.pixelRatio);
          } else {
            tStartRight += yAxisWidth.width + this.opts.yAxis.padding! * this.opts.pixelRatio;
          }
        }
      }
    }
  }

  private calMarkLineData(points: Array<Partial<MarkLineData>>) {
    let minRange: number, maxRange: number;
    let spacingValid = this.opts.height - this.opts.area[0] - this.opts.area[2];
    for (let i = 0; i < points.length; i++) {
      points[i].yAxisIndex = points[i].yAxisIndex ? points[i].yAxisIndex : 0;
      let range = [].concat(this.opts.chartData.yAxisData.ranges[points[i].yAxisIndex]);
      minRange = range.pop()!;
      maxRange = range.shift()!;
      let height = spacingValid * (points[i].value! - minRange) / (maxRange - minRange);
      points[i].y = this.opts.height - Math.round(height) - this.opts.area[2];
    }
    return points;
  }

  protected drawMarkLine() {
    const DefaultMarkLine: MarkLineOptions = {
      type: 'solid',
      dashLength: 4,
      data: []
    }
    let markLineOption = ChartsUtil.objectAssign({} as MarkLineOptions, DefaultMarkLine, this.opts.extra.markLine!);
    let startX: number = this.opts.area[3];
    let endX = this.opts.width - this.opts.area[1];
    let points: Array<Partial<MarkLineData>> = this.calMarkLineData(markLineOption.data);
    const DefaultMarkLineData: Partial<MarkLineData> = {
      lineColor: "#DE4A42",
      showLabel:	false,
      labelAlign: 'left',
      labelOffsetX: 0,
      labelOffsetY: 0,
      labelPadding: 6,
      labelFontSize: 13,
      labelFontColor: "#666666",
      labelBgColor: "#DFE8FF",
      labelBgOpacity: 0.8
    }
    for (let i = 0; i < points.length; i++) {
      let item = ChartsUtil.objectAssign({}, DefaultMarkLineData, points[i]);
      if (markLineOption.type == 'dash') {
        this.setLineDash([markLineOption.dashLength, markLineOption.dashLength]);
      }
      this.setStrokeStyle(item.lineColor!);
      this.setLineWidth(1 * this.opts.pixelRatio);
      this.context.beginPath();
      this.context.moveTo(startX, item.y);
      this.context.lineTo(endX, item.y);
      this.context.stroke();
      this.setLineDash([]);
      if (item.showLabel) {
        let fontSize = item.labelFontSize! * this.opts.pixelRatio;
        let labelText = item.labelText ? item.labelText : item.value;
        this.setFontSize(fontSize);
        let textWidth = this.measureText(String(labelText), fontSize);
        let bgWidth = textWidth + item.labelPadding! * this.opts.pixelRatio * 2;
        let bgStartX = item.labelAlign == 'left' ? this.opts.area[3] - bgWidth : this.opts.width - this.opts.area[1];
        bgStartX += item.labelOffsetX!;
        let bgStartY = item.y - 0.5 * fontSize - item.labelPadding! * this.opts.pixelRatio;
        bgStartY += item.labelOffsetY!;
        let textX = bgStartX + item.labelPadding! * this.opts.pixelRatio;
        //let textY = item.y;
        this.setFillStyle(ChartsUtil.hexToRgb(item.labelBgColor!, item.labelBgOpacity));
        this.setStrokeStyle(item.labelBgColor!);
        this.setLineWidth(1 * this.opts.pixelRatio);
        this.context.beginPath();
        this.context.rect(bgStartX, bgStartY, bgWidth, fontSize + 2 * item.labelPadding! * this.opts.pixelRatio);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
        this.setFontSize(fontSize);
        this.setTextAlign('left');
        this.setFillStyle(item.labelFontColor!);
        this.context.fillText(String(labelText), textX, bgStartY + fontSize + item.labelPadding! * this.opts.pixelRatio/2);
        this.context.stroke();
        this.setTextAlign('left');
      }
    }
  }

  protected drawLegend(chartData: chartDataType) {
    if (this.opts.legend.show === false) {
      return;
    }
    let legendData = chartData.legendData;
    let legendList = legendData.points;
    let legendArea = legendData.area;
    let padding = this.opts.legend.padding! * this.opts.pixelRatio;
    let fontSize = this.opts.legend.fontSize! * this.opts.pixelRatio;
    let shapeWidth = 15 * this.opts.pixelRatio;
    let shapeRight = 5 * this.opts.pixelRatio;
    let itemGap = this.opts.legend.itemGap! * this.opts.pixelRatio;
    let lineHeight = Math.max(this.opts.legend.lineHeight! * this.opts.pixelRatio, fontSize);
    //画背景及边框
    this.context.beginPath();
    this.setLineWidth(this.opts.legend.borderWidth! * this.opts.pixelRatio);
    this.setStrokeStyle(this.opts.legend.borderColor!);
    this.setFillStyle(this.opts.legend.backgroundColor!);
    this.context.moveTo(legendArea.start.x, legendArea.start.y);
    this.context.rect(legendArea.start.x, legendArea.start.y, legendArea.width, legendArea.height);
    this.context.closePath();
    this.context.fill();
    this.context.stroke();
    legendList.forEach((itemList, listIndex) => {
      let width = 0;
      let height = 0;
      width = legendData.widthArr[listIndex];
      height = legendData.heightArr[listIndex];
      let startX = 0;
      let startY = 0;
      if (this.opts.legend.position == 'top' || this.opts.legend.position == 'bottom') {
        switch (this.opts.legend.float) {
          case 'left':
            startX = legendArea.start.x + padding;
            break;
          case 'right':
            startX = legendArea.start.x + legendArea.width - width;
            break;
          default:
            startX = legendArea.start.x + (legendArea.width - width) / 2;
        }
        startY = legendArea.start.y + padding + listIndex * lineHeight;
      } else {
        if (listIndex == 0) {
          width = 0;
        } else {
          width = legendData.widthArr[listIndex - 1];
        }
        startX = legendArea.start.x + padding + width;
        startY = legendArea.start.y + padding + (legendArea.height - height) / 2;
      }
      this.setFontSize(this.opts.fontSize);
      for (let i = 0; i < itemList.length; i++) {
        let item = itemList[i];
        item.area = [0, 0, 0, 0];
        item.area[0] = startX;
        item.area[1] = startY;
        item.area[3] = startY + lineHeight;
        this.context.beginPath();
        this.setLineWidth(1 * this.opts.pixelRatio);
        this.setStrokeStyle(item.show ? item.color! : this.opts.legend.hiddenColor!);
        this.setFillStyle(item.show ? item.color! : this.opts.legend.hiddenColor!);
        switch (item.legendShape) {
          case 'line':
            this.context.moveTo(startX, startY + 0.5 * lineHeight - 2 * this.opts.pixelRatio);
            this.context.fillRect(startX, startY + 0.5 * lineHeight - 2 * this.opts.pixelRatio, 15 * this.opts.pixelRatio, 4 * this.opts.pixelRatio);
            break;
          case 'triangle':
            this.context.moveTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight - 5 * this.opts.pixelRatio);
            this.context.lineTo(startX + 2.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight + 5 * this.opts.pixelRatio);
            this.context.lineTo(startX + 12.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight + 5 * this.opts.pixelRatio);
            this.context.lineTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight - 5 * this.opts.pixelRatio);
            break;
          case 'diamond':
            this.context.moveTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight - 5 * this.opts.pixelRatio);
            this.context.lineTo(startX + 2.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight);
            this.context.lineTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight + 5 * this.opts.pixelRatio);
            this.context.lineTo(startX + 12.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight);
            this.context.lineTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight - 5 * this.opts.pixelRatio);
            break;
          case 'circle':
            this.context.moveTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight);
            this.context.arc(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * lineHeight, 5 * this.opts.pixelRatio, 0, 2 * Math.PI);
            break;
          case 'rect':
            this.context.moveTo(startX, startY + 0.5 * lineHeight - 5 * this.opts.pixelRatio);
            this.context.fillRect(startX, startY + 0.5 * lineHeight - 5 * this.opts.pixelRatio, 15 * this.opts.pixelRatio, 10 *this.opts.pixelRatio);
            break;
          case 'square':
            this.context.moveTo(startX + 5 * this.opts.pixelRatio, startY + 0.5 * lineHeight - 5 * this.opts.pixelRatio);
            this.context.fillRect(startX + 5 * this.opts.pixelRatio, startY + 0.5 * lineHeight - 5 * this.opts.pixelRatio, 10 * this.opts.pixelRatio, 10 * this.opts.pixelRatio);
            break;
          case 'none':
            break;
          default:
            this.context.moveTo(startX, startY + 0.5 * lineHeight - 5 * this.opts.pixelRatio);
            this.context.fillRect(startX, startY + 0.5 * lineHeight - 5 * this.opts.pixelRatio, 15 * this.opts.pixelRatio, 10 * this.opts.pixelRatio);
        }
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
        startX += shapeWidth + shapeRight;
        let fontTrans = 0.5 * lineHeight + 0.5 * fontSize - 2;
        const legendText = item.legendText ? item.legendText : item.name!;
        this.context.beginPath();
        this.setFontSize(fontSize);
        this.setFillStyle(item.show ? this.opts.legend.fontColor! : this.opts.legend.hiddenColor!);
        this.context.fillText(legendText, startX, startY + fontTrans);
        this.context.closePath();
        this.context.stroke();
        if (this.opts.legend.position == 'top' || this.opts.legend.position == 'bottom') {
          startX += this.measureText(legendText!, fontSize) + itemGap;
          item.area[2] = startX;
        } else {
          item.area[2] = startX + this.measureText(legendText!, fontSize) + itemGap;
          startX -= shapeWidth + shapeRight;
          startY += lineHeight;
        }
      }
    });
  }

  private calTooltipYAxisData(point: number) {
    let ranges = [].concat(this.opts.chartData.yAxisData.ranges) as Array<number[]>;
    let spacingValid = this.opts.height - this.opts.area[0] - this.opts.area[2];
    let minAxis: number = this.opts.area[0];
    let items: string[] = [];
    for (let i = 0; i < ranges.length; i++) {
      let maxVal = Math.max(...ranges[i]);
      let minVal = Math.min(...ranges[i]);
      let item = maxVal - (maxVal - minVal) * (point - minAxis) / spacingValid;
      let tmp = this.opts.yAxis.data && this.opts.yAxis.data[i].formatter ? this.opts.yAxis.data[i].formatter!(item, i, this.opts) : item.toFixed(0);
      items.push(String(tmp))
    }
    return items;
  }

  private drawToolTipHorizentalLine() {
    const DefaultToolTipOption: Partial<TooltipOptions> = {
      gridType: 'solid',
      dashLength: 4,
      boxPadding: 3,
      fontSize: 13,
      labelBgColor: "#FFFFFF",
      labelBgOpacity: 0.7
    }
    let toolTipOption = ChartsUtil.objectAssign({} as Partial<TooltipOptions>, DefaultToolTipOption, this.opts.extra.tooltip!);
    let startX: number = this.opts.area[3];
    let endX = this.opts.width - this.opts.area[1];
    if (toolTipOption.gridType == 'dash') {
      this.setLineDash([toolTipOption.dashLength!, toolTipOption.dashLength!]);
    }
    this.setStrokeStyle(toolTipOption.gridColor || '#cccccc');
    this.setLineWidth(1 * this.opts.pixelRatio);
    this.context.beginPath();
    this.context.moveTo(startX, this.opts.tooltip.offset.y);
    this.context.lineTo(endX, this.opts.tooltip.offset.y);
    this.context.stroke();
    this.setLineDash([]);
    if (toolTipOption.yAxisLabel) {
      let boxPadding = toolTipOption.boxPadding! * this.opts.pixelRatio;
      let labelText = this.calTooltipYAxisData(this.opts.tooltip.offset.y);
      let widthArr: Array<yAxisWidthType> = this.opts.chartData.yAxisData.yAxisWidth;
      let tStartLeft: number = this.opts.area[3];
      let tStartRight =  this.opts.width - this.opts.area[1];
      for (let i = 0; i < labelText.length; i++) {
        this.setFontSize(toolTipOption.fontSize! * this.opts.pixelRatio);
        let textWidth = this.measureText(labelText[i], toolTipOption.fontSize! * this.opts.pixelRatio);
        let bgStartX: number, bgEndX: number, bgWidth: number;
        if (widthArr[i].position == 'left') {
          bgStartX = tStartLeft - (textWidth + boxPadding * 2) - 2 * this.opts.pixelRatio;
          bgEndX = Math.max(bgStartX, bgStartX + textWidth + boxPadding * 2);
        } else {
          bgStartX = tStartRight + 2 * this.opts.pixelRatio;
          bgEndX = Math.max(bgStartX + widthArr[i].width, bgStartX + textWidth + boxPadding * 2);
        }
        bgWidth = bgEndX - bgStartX;
        let textX: number = bgStartX + (bgWidth - textWidth) / 2;
        let textY: number = this.opts.tooltip.offset.y;
        this.context.beginPath();
        this.setFillStyle(ChartsUtil.hexToRgb(toolTipOption.labelBgColor!, toolTipOption.labelBgOpacity));
        this.setStrokeStyle(toolTipOption.labelBgColor!);
        this.setLineWidth(1 * this.opts.pixelRatio);
        this.context.rect(bgStartX, textY - 0.5 * this.opts.fontSize - boxPadding, bgWidth, this.opts.fontSize + 2 * boxPadding);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
        this.context.beginPath();
        this.setFontSize(this.opts.fontSize);
        this.setFillStyle(toolTipOption.labelFontColor || this.opts.fontColor);
        this.context.fillText(labelText[i], textX, textY + 0.5 * this.opts.fontSize);
        this.context.closePath();
        this.context.stroke();
        if (widthArr[i].position == 'left') {
          tStartLeft -= (widthArr[i].width + this.opts.yAxis.padding! * this.opts.pixelRatio);
        } else {
          tStartRight += widthArr[i].width + this.opts.yAxis.padding! * this.opts.pixelRatio;
        }
      }
    }
  }

  private drawToolTipSplitLine(offsetX: number) {
    let toolTipOption = this.opts.extra.tooltip || {};
    toolTipOption.gridType = toolTipOption.gridType == undefined ? 'solid' : toolTipOption.gridType;
    toolTipOption.dashLength = toolTipOption.dashLength == undefined ? 4 : toolTipOption.dashLength;
    let startY: number = this.opts.area[0];
    let endY: number = this.opts.height - this.opts.area[2];
    if (toolTipOption.gridType == 'dash') {
      this.setLineDash([toolTipOption.dashLength, toolTipOption.dashLength]);
    }
    this.setStrokeStyle(toolTipOption.gridColor || '#cccccc');
    this.setLineWidth(1 * this.opts.pixelRatio);
    this.context.beginPath();
    this.context.moveTo(offsetX, startY);
    this.context.lineTo(offsetX, endY);
    this.context.stroke();
    this.setLineDash([]);
    if (toolTipOption.xAxisLabel) {
      let labelText: string = this.opts.categories[this.opts.tooltip.index];
      this.setFontSize(this.opts.fontSize);
      let textWidth = this.measureText(labelText, this.opts.fontSize);
      let textX = offsetX - 0.5 * textWidth;
      let textY = endY + 2 * this.opts.pixelRatio;
      this.context.beginPath();
      this.setFillStyle(ChartsUtil.hexToRgb(toolTipOption.labelBgColor || "#FFFFFF", toolTipOption.labelBgOpacity || 0.7));
      this.setStrokeStyle(toolTipOption.labelBgColor || "#FFFFFF");
      this.setLineWidth(1 * this.opts.pixelRatio);
      this.context.rect(textX - Number(toolTipOption.boxPadding) * this.opts.pixelRatio, textY, textWidth + 2 * Number(toolTipOption.boxPadding) * this.opts.pixelRatio, this.opts.fontSize + 2 * Number(toolTipOption.boxPadding) * this.opts.pixelRatio);
      this.context.closePath();
      this.context.stroke();
      this.context.fill();
      this.context.beginPath();
      this.setFontSize(this.opts.fontSize);
      this.setFillStyle(toolTipOption.labelFontColor || this.opts.fontColor);
      this.context.fillText(String(labelText), textX, textY + Number(toolTipOption.boxPadding) * this.opts.pixelRatio + this.opts.fontSize);
      this.context.closePath();
      this.context.stroke();
    }
  }

  private drawToolTip(textList: tooltipTextList[], offset: Point) {
    let toolTipOption = ChartsUtil.objectAssign({} as Partial<TooltipOptions>, {
      showBox: true,
      showArrow: true,
      showCategory: false,
      bgColor: '#000000',
      bgOpacity: 0.7,
      borderColor: '#000000',
      borderWidth: 0,
      borderRadius: 0,
      borderOpacity: 0.7,
      boxPadding: 3,
      fontColor: '#FFFFFF',
      fontSize: 13,
      lineHeight: 20,
      legendShow: true,
      legendShape: 'auto',
      splitLine: true,
    }, this.opts.extra.tooltip!);
    if(toolTipOption.showCategory == true && this.opts.categories) {
      textList.unshift({text: this.opts.categories[this.opts.tooltip.index],color:null})
    }
    let fontSize = toolTipOption.fontSize! * this.opts.pixelRatio;
    let lineHeight = toolTipOption.lineHeight! * this.opts.pixelRatio;
    let boxPadding = toolTipOption.boxPadding! * this.opts.pixelRatio;
    let legendWidth = fontSize;
    let legendMarginRight = 5 * this.opts.pixelRatio;
    if(toolTipOption.legendShow == false){
      legendWidth = 0;
      legendMarginRight = 0;
    }
    let arrowWidth = toolTipOption.showArrow ? 8 * this.opts.pixelRatio : 0;
    let isOverRightBorder = false;
    if (this.opts.type == 'line' || this.opts.type == 'mount' || this.opts.type == 'area' || this.opts.type == 'candle' || this.opts.type == 'mix') {
      if (toolTipOption.splitLine == true) {
        this.drawToolTipSplitLine(this.opts.tooltip.offset.x);
      }
    }
    offset = ChartsUtil.objectAssign({
      x: 0,
      y: 0
    } as Point, offset);
    offset.y -= 8 * this.opts.pixelRatio;
    let textWidth = textList.map((item) => {
      return this.measureText(item.text, fontSize);
    });
    let toolTipWidth = legendWidth + legendMarginRight + 4 * boxPadding + Math.max(...textWidth);
    let toolTipHeight = 2 * boxPadding + textList.length * lineHeight;
    if (toolTipOption.showBox == false) {
      return
    }
    // if beyond the right border
    if (offset.x - Math.abs(this.opts._scrollDistance_ || 0) + arrowWidth + toolTipWidth > this.opts.width) {
      isOverRightBorder = true;
    }
    if (toolTipHeight + offset.y > this.opts.height) {
      offset.y = this.opts.height - toolTipHeight;
    }
    // draw background rect
    this.context.beginPath();
    this.setFillStyle(ChartsUtil.hexToRgb(toolTipOption.bgColor!, toolTipOption.bgOpacity));
    this.setLineWidth(toolTipOption.borderWidth! * this.opts.pixelRatio);
    this.setStrokeStyle(ChartsUtil.hexToRgb(toolTipOption.borderColor!, toolTipOption.borderOpacity));
    let radius = toolTipOption.borderRadius as number;
    if (isOverRightBorder) {
      // 增加左侧仍然超出的判断
      if(toolTipWidth + arrowWidth > this.opts.width){
        offset.x = this.opts.width + Math.abs(this.opts._scrollDistance_ || 0) + arrowWidth + (toolTipWidth - this.opts.width)
      }
      if(toolTipWidth > offset.x){
        offset.x = this.opts.width + Math.abs(this.opts._scrollDistance_ || 0) + arrowWidth + (toolTipWidth - this.opts.width)
      }
      if (toolTipOption.showArrow) {
        this.context.moveTo(offset.x, offset.y + 10 * this.opts.pixelRatio);
        this.context.lineTo(offset.x - arrowWidth, offset.y + 10 * this.opts.pixelRatio + 5 * this.opts.pixelRatio);
      }
      this.context.arc(offset.x - arrowWidth - radius, offset.y + toolTipHeight - radius, radius, 0, Math.PI / 2, false);
      this.context.arc(offset.x - arrowWidth - Math.round(toolTipWidth) + radius, offset.y + toolTipHeight - radius, radius,
        Math.PI / 2, Math.PI, false);
      this.context.arc(offset.x - arrowWidth - Math.round(toolTipWidth) + radius, offset.y + radius, radius, -Math.PI, -Math.PI / 2, false);
      this.context.arc(offset.x - arrowWidth - radius, offset.y + radius, radius, -Math.PI / 2, 0, false);
      if (toolTipOption.showArrow) {
        this.context.lineTo(offset.x - arrowWidth, offset.y + 10 * this.opts.pixelRatio - 5 * this.opts.pixelRatio);
        this.context.lineTo(offset.x, offset.y + 10 * this.opts.pixelRatio);
      }
    } else {
      if (toolTipOption.showArrow) {
        this.context.moveTo(offset.x, offset.y + 10 * this.opts.pixelRatio);
        this.context.lineTo(offset.x + arrowWidth, offset.y + 10 * this.opts.pixelRatio - 5 * this.opts.pixelRatio);
      }
      this.context.arc(offset.x + arrowWidth + radius, offset.y + radius, radius, -Math.PI, -Math.PI / 2, false);
      this.context.arc(offset.x + arrowWidth + Math.round(toolTipWidth) - radius, offset.y + radius, radius, -Math.PI / 2, 0, false);
      this.context.arc(offset.x + arrowWidth + Math.round(toolTipWidth) - radius, offset.y + toolTipHeight - radius, radius, 0,
        Math.PI / 2, false);
      this.context.arc(offset.x + arrowWidth + radius, offset.y + toolTipHeight - radius, radius, Math.PI / 2, Math.PI, false);
      if (toolTipOption.showArrow) {
        this.context.lineTo(offset.x + arrowWidth, offset.y + 10 * this.opts.pixelRatio + 5 * this.opts.pixelRatio);
        this.context.lineTo(offset.x, offset.y + 10 * this.opts.pixelRatio);
      }
    }
    this.context.closePath();
    this.context.fill();
    if (toolTipOption.borderWidth! > 0) {
      this.context.stroke();
    }
    // draw legend
    if(toolTipOption.legendShow){
      textList.forEach((item, index) => {
        if (item.color !== null) {
          this.context.beginPath();
          this.setFillStyle(item.color);
          let startX = offset.x + arrowWidth + 2 * boxPadding;
          let startY = offset.y + (lineHeight - fontSize) / 2 + lineHeight * index + boxPadding + 1;
          if (isOverRightBorder) {
            startX = offset.x - toolTipWidth - arrowWidth + 2 * boxPadding;
          }
          switch (item.legendShape) {
            case 'line':
              this.context.moveTo(startX, startY + 0.5 * legendWidth - 2 * this.opts.pixelRatio);
              this.context.fillRect(startX, startY + 0.5 * legendWidth - 2 * this.opts.pixelRatio, legendWidth, 4 * this.opts.pixelRatio);
              break;
            case 'triangle':
              this.context.moveTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth - 5 * this.opts.pixelRatio);
              this.context.lineTo(startX + 2.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth + 5 * this.opts.pixelRatio);
              this.context.lineTo(startX + 12.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth + 5 * this.opts.pixelRatio);
              this.context.lineTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth - 5 * this.opts.pixelRatio);
              break;
            case 'diamond':
              this.context.moveTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth - 5 * this.opts.pixelRatio);
              this.context.lineTo(startX + 2.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth);
              this.context.lineTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth + 5 * this.opts.pixelRatio);
              this.context.lineTo(startX + 12.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth);
              this.context.lineTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth - 5 * this.opts.pixelRatio);
              break;
            case 'circle':
              this.context.moveTo(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth);
              this.context.arc(startX + 7.5 * this.opts.pixelRatio, startY + 0.5 * legendWidth, 5 * this.opts.pixelRatio, 0, 2 * Math.PI);
              break;
            case 'rect':
              this.context.moveTo(startX, startY + 0.5 * legendWidth - 5 * this.opts.pixelRatio);
              this.context.fillRect(startX, startY + 0.5 * legendWidth - 5 * this.opts.pixelRatio, 15 * this.opts.pixelRatio, 10 * this.opts.pixelRatio);
              break;
            case 'square':
              this.context.moveTo(startX + 2 * this.opts.pixelRatio, startY + 0.5 * legendWidth - 5 * this.opts.pixelRatio);
              this.context.fillRect(startX + 2 * this.opts.pixelRatio, startY + 0.5 * legendWidth - 5 * this.opts.pixelRatio, 10 * this.opts.pixelRatio, 10 * this.opts.pixelRatio);
              break;
            default:
              this.context.moveTo(startX, startY + 0.5 * legendWidth - 5 * this.opts.pixelRatio);
              this.context.fillRect(startX, startY + 0.5 * legendWidth - 5 * this.opts.pixelRatio, 15 * this.opts.pixelRatio, 10 * this.opts.pixelRatio);
          }
          this.context.closePath();
          this.context.fill();
        }
      });
    }

    // draw text list
    textList.forEach((item, index) => {
      let startX = offset.x + arrowWidth + 2 * boxPadding + legendWidth + legendMarginRight;
      if (isOverRightBorder) {
        startX = offset.x - toolTipWidth - arrowWidth + 2 * boxPadding + legendWidth + legendMarginRight;
      }
      let startY = offset.y + lineHeight * index + (lineHeight - fontSize)/2 - 1 + boxPadding + fontSize;
      this.context.beginPath();
      this.setFontSize(fontSize);
      this.setTextBaseline('alphabetic' /*'normal'*/);
      this.setFillStyle(toolTipOption.fontColor!);
      this.context.fillText(item.text, startX, startY);
      this.context.closePath();
      this.context.stroke();
    });
  }

  protected drawCanvas() {
    this.context.save();
    this.context.translate(0, 0.5);
    this.context.restore();
  }

  protected drawToolTipBridge(process: number) {
    let toolTipOption = this.opts.extra.tooltip || {};
    if (toolTipOption.horizentalLine && this.opts.tooltip && process === 1 && (this.opts.type == 'line' || this.opts.type == 'area' || this.opts.type == 'column' || this.opts.type == 'mount' || this.opts.type == 'candle' || this.opts.type == 'mix')) {
      this.drawToolTipHorizentalLine()
    }
    this.context.save();
    if (this.opts._scrollDistance_ && this.opts._scrollDistance_ !== 0 && this.opts.enableScroll === true) {
      this.context.translate(this.opts._scrollDistance_, 0);
    }
    if (this.opts.tooltip && this.opts.tooltip.textList && this.opts.tooltip.textList.length && process === 1) {
      this.drawToolTip(this.opts.tooltip.textList, this.opts.tooltip.offset);
    }
    this.context.restore();
  }

  private calValidDistance(distance: number) {
    let dataChartAreaWidth = this.opts.width - this.opts.area[1] - this.opts.area[3];
    let dataChartWidth = this.opts.chartData.eachSpacing * (this.opts.chartData.xAxisData.xAxisPoints.length - 1);
    if(this.opts.type == 'mount' && this.opts.extra && this.opts.extra.mount && this.opts.extra.mount.widthRatio && this.opts.extra.mount.widthRatio > 1){
      if(this.opts.extra.mount.widthRatio>2) this.opts.extra.mount.widthRatio = 2
      dataChartWidth += (this.opts.extra.mount.widthRatio - 1) * this.opts.chartData.eachSpacing;
    }
    let validDistance = distance;
    if (distance >= 0) {
      validDistance = 0;
      this.event.emit('scrollLeft');
      this.scrollOption.position = 'left'
      this.opts.xAxis.scrollPosition = 'left';
    } else if (Math.abs(distance) >= dataChartWidth - dataChartAreaWidth) {
      validDistance = dataChartAreaWidth - dataChartWidth;
      this.event.emit('scrollRight');
      this.scrollOption.position = 'right'
      this.opts.xAxis.scrollPosition = 'right';
    } else {
      this.scrollOption.position = distance
      this.opts.xAxis.scrollPosition = distance;
    }
    return validDistance;
  }

  protected fixPieSeries(series: Series[]){
    let pieSeriesArr: Series[] = [];
    if(series.length>0 && series[0].data.constructor.toString().indexOf('Array') > -1){
      this.opts._pieSeries_ = series;
      let oldseries = series[0].data as NameAndValueData[];
      for (let i = 0; i < oldseries.length; i++) {
        oldseries[i].formatter = series[0].formatter;
        oldseries[i].data = oldseries[i].value;
        pieSeriesArr.push(oldseries[i]);
      }
      this.opts.series = pieSeriesArr;
    }else{
      pieSeriesArr = series;
    }
    return pieSeriesArr;
  }

  protected splitPoints(points: (DataPoints | null)[], eachSeries: Series) {
    let newPoints: Array<DataPoints[]> = [];
    let items: DataPoints[] = [];
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

  protected createCurveControlPoints(points: Point[], i: number) {
    const isNotMiddlePoint = (points: Point[], i: number) => {
      if (points[i - 1] && points[i + 1]) {
        return points[i].y >= Math.max(points[i - 1].y, points[i + 1].y) || points[i].y <= Math.min(points[i - 1].y,
          points[i + 1].y);
      } else {
        return false;
      }
    }
    const isNotMiddlePointX = (points: Point[], i: number) => {
      if (points[i - 1] && points[i + 1]) {
        return points[i].x >= Math.max(points[i - 1].x, points[i + 1].x) || points[i].x <= Math.min(points[i - 1].x,
          points[i + 1].x);
      } else {
        return false;
      }
    }
    let a = 0.2;
    let b = 0.2;
    let pAx = 0;
    let pAy = 0;
    let pBx = 0;
    let pBy = 0;
    if (i < 1) {
      pAx = points[0].x + (points[1].x - points[0].x) * a;
      pAy = points[0].y + (points[1].y - points[0].y) * a;
    } else {
      pAx = points[i].x + (points[i + 1].x - points[i - 1].x) * a;
      pAy = points[i].y + (points[i + 1].y - points[i - 1].y) * a;
    }

    if (i > points.length - 3) {
      let last = points.length - 1;
      pBx = points[last].x - (points[last].x - points[last - 1].x) * b;
      pBy = points[last].y - (points[last].y - points[last - 1].y) * b;
    } else {
      pBx = points[i + 1].x - (points[i + 2].x - points[i].x) * b;
      pBy = points[i + 1].y - (points[i + 2].y - points[i].y) * b;
    }
    if (isNotMiddlePoint(points, i + 1)) {
      pBy = points[i + 1].y;
    }
    if (isNotMiddlePoint(points, i)) {
      pAy = points[i].y;
    }
    if (isNotMiddlePointX(points, i + 1)) {
      pBx = points[i + 1].x;
    }
    if (isNotMiddlePointX(points, i)) {
      pAx = points[i].x;
    }
    if (pAy >= Math.max(points[i].y, points[i + 1].y) || pAy <= Math.min(points[i].y, points[i + 1].y)) {
      pAy = points[i].y;
    }
    if (pBy >= Math.max(points[i].y, points[i + 1].y) || pBy <= Math.min(points[i].y, points[i + 1].y)) {
      pBy = points[i + 1].y;
    }
    if (pAx >= Math.max(points[i].x, points[i + 1].x) || pAx <= Math.min(points[i].x, points[i + 1].x)) {
      pAx = points[i].x;
    }
    if (pBx >= Math.max(points[i].x, points[i + 1].x) || pBx <= Math.min(points[i].x, points[i + 1].x)) {
      pBx = points[i + 1].x;
    }
    return {
      ctrA: {
        x: pAx,
        y: pAy
      },
      ctrB: {
        x: pBx,
        y: pBy
      }
    } as curveControlPoints;
  }

  protected drawPointShape(points: Array<DataPoints|Point|null>, color: string | CanvasGradient | CanvasPattern, shape: string) {
    this.context.beginPath();
    if (this.opts.dataPointShapeType == 'hollow') {
      this.setStrokeStyle(color);
      this.setFillStyle(this.opts.background);
      this.setLineWidth(2 * this.opts.pixelRatio);
    } else {
      this.setStrokeStyle("#ffffff");
      this.setFillStyle(color);
      this.setLineWidth(1 * this.opts.pixelRatio);
    }
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
    } else if (shape === 'none') {
      return;
    }
    this.context.closePath();
    this.context.fill();
    this.context.stroke();
  }

  protected drawActivePoint(points: Array<DataPoints|null>, color: string | CanvasGradient | CanvasPattern, shape: string, option: LineExtra|AreaExtra, seriesIndex: number = 0) {
    if(!this.opts.tooltip || !this.opts.tooltip.group){
      return
    }

    if(this.opts.tooltip.group.length>0 && this.opts.tooltip.group.includes(seriesIndex) == false){
      return
    }
    let pointIndex: number = typeof this.opts.tooltip.index === 'number' ? this.opts.tooltip.index : this.opts.tooltip.index[this.opts.tooltip.group.indexOf(seriesIndex)];
    this.context.beginPath();
    if (option.activeType == 'hollow') {
      this.setStrokeStyle(color);
      this.setFillStyle(this.opts.background);
      this.setLineWidth(2 * this.opts.pixelRatio);
    } else {
      this.setStrokeStyle("#ffffff");
      this.setFillStyle(color);
      this.setLineWidth(1 * this.opts.pixelRatio);
    }

    if (shape === 'diamond') {
      points.forEach((item, index) => {
        if (item !== null && pointIndex == index ) {
          this.context.moveTo(item.x, item.y - 4.5);
          this.context.lineTo(item.x - 4.5, item.y);
          this.context.lineTo(item.x, item.y + 4.5);
          this.context.lineTo(item.x + 4.5, item.y);
          this.context.lineTo(item.x, item.y - 4.5);
        }
      });
    } else if (shape === 'circle') {
      points.forEach((item, index) => {
        if (item !== null && pointIndex == index) {
          this.context.moveTo(item.x + 2.5 * this.opts.pixelRatio, item.y);
          this.context.arc(item.x, item.y, 3 * this.opts.pixelRatio, 0, 2 * Math.PI, false);
        }
      });
    } else if (shape === 'square') {
      points.forEach((item, index) => {
        if (item !== null && pointIndex == index) {
          this.context.moveTo(item.x - 3.5, item.y - 3.5);
          this.context.rect(item.x - 3.5, item.y - 3.5, 7, 7);
        }
      });
    } else if (shape === 'triangle') {
      points.forEach((item, index) => {
        if (item !== null && pointIndex == index) {
          this.context.moveTo(item.x, item.y - 4.5);
          this.context.lineTo(item.x - 4.5, item.y + 4.5);
          this.context.lineTo(item.x + 4.5, item.y + 4.5);
          this.context.lineTo(item.x, item.y - 4.5);
        }
      });
    } else if (shape === 'none') {
      return;
    }
    this.context.closePath();
    this.context.fill();
    this.context.stroke();
  }

  protected drawPointText(points: Array<DataPoints|null>, series: Series) {
    // 绘制数据文案
    let data: SeriesDataItem[] = series.data;
    let textOffset = series.textOffset ? series.textOffset : 0;
    points.forEach((item, index) => {
      if (item !== null) {
        this.context.beginPath();
        let fontSize = series.textSize ? series.textSize! * this.opts.pixelRatio : this.opts.fontSize;
        this.setFontSize(fontSize);
        this.setFillStyle(series.textColor || this.opts.fontColor);
        let value = data[index]
        if (typeof data[index] === 'object' && data[index] !== null) {
          if (Array.isArray(data[index])) {
            value = (data[index] as number[])[1];
          } else {
            value = (data[index] as Record<string, number>)["value"]
          }
        }
        let formatVal = series.formatter ? series.formatter(value as number,index,series,this.opts) : value;
        this.setTextAlign('center');
        this.context.fillText(String(formatVal), item.x, item.y - 4 + textOffset * this.opts.pixelRatio);
        this.context.closePath();
        this.context.stroke();
        this.setTextAlign('left');
      }
    });

  }

  protected getPieDataPoints(series: Series[], radius: number = 0, process: number = 1) {
    let count = 0;
    let _start_ = 0;
    for (let i = 0; i < series.length; i++) {
      let item: Series = series[i];
      item.data = item.data === null ? 0 : item.data;
      count += item.data;
    }
    for (let i = 0; i < series.length; i++) {
      let item: Series = series[i];
      item.data = item.data === null ? 0 : item.data;
      if (count === 0) {
        item._proportion_ = 1 / series.length * process;
      } else {
        item._proportion_ = item.data / count * process;
      }
      item._radius_ = radius;
    }
    for (let i = 0; i < series.length; i++) {
      let item = series[i];
      item._start_ = _start_;
      _start_ += 2 * item._proportion_ * Math.PI;
    }
    return series;
  }
  protected getRoseDataPoints(series: Series[], type: 'area'|'radius', minRadius: number, radius: number, process: number = 1) {
    let count = 0;
    let _start_ = 0;
    let dataArr = [];
    for (let i = 0; i < series.length; i++) {
      let item = series[i];
      item.data = item.data === null ? 0 : item.data;
      count += item.data;
      dataArr.push(item.data);
    }
    let minData = Math.min(...dataArr);
    let maxData = Math.max(...dataArr);
    let radiusLength = radius - minRadius;
    for (let i = 0; i < series.length; i++) {
      let item = series[i];
      item.data = item.data === null ? 0 : item.data;
      if (count === 0) {
        item._proportion_ = 1 / series.length * process;
        item._rose_proportion_ = 1 / series.length * process;
      } else {
        item._proportion_ = item.data / count * process;
        if(type == 'area'){
          item._rose_proportion_ = 1 / series.length * process;
        }else{
          item._rose_proportion_ = item.data / count * process;
        }
      }
      item._radius_ = minRadius + radiusLength * ((item.data - minData) / (maxData - minData)) || radius;
    }
    for (let i = 0; i < series.length; i++) {
      let item = series[i];
      item._start_ = _start_;
      _start_ += 2 * item._rose_proportion_ * Math.PI;
    }
    return series;
  }
}


/**
 * 一些内部使用的类型定义
 */

interface getToolTipDataRes {
  textList: tooltipTextList[]
  offset: Point
}

interface CurrentDataIndexRes {
  index: number[]|number
  group: number[]
}

interface tooltipTextList {
  text: string,
  color: string|null
  legendShape?: string
  disableLegend?: boolean
}

export interface curveControlPoints {
  ctrA: Point,
  ctrB: Point
}

export interface drawDataPointsRes {
  xAxisPoints?: number[],
  yAxisPoints?: number[],
  calPoints: Array<Array<DataPoints|null>>|Array<DataPoints|null>,
  eachSpacing: number
}

export interface DataPoints extends Point {
  color: string
  y0?: number
  x0?: number
  width?: number
  height?: number
  r?: number
  t?: number
  value?: number
}

export interface XAxisPointsType {
  xAxisPoints: number[]
  startX: number
  endX: number
  eachSpacing: number
}

export interface calculateCategoriesDataRes {
  angle: number
  xAxisHeight: number
}

export interface calculateYAxisDataRes {
  rangesFormat: Array<string[]>
  ranges: Array<string[]|number[]>
  yAxisWidth: Array<yAxisWidthType>
}
export interface calculateXAxisDataRes extends XAxisPointsType {
  angle: number
  xAxisHeight: number
  ranges: number[]
  rangesFormat?: string[]
}

export interface yAxisWidthType {
  position: "left" | "right" | "center"
  width: number
}

export interface legendDataType {
  area: legendDataAreaType
  points: Array<Series[]>
  widthArr: number[]
  heightArr: number[]
}

export interface legendDataAreaType {
  start: Point
  end: Point
  width: number
  height: number
  wholeWidth: number
  wholeHeight: number
}

export interface chartDataType {
  legendData: legendDataType
}
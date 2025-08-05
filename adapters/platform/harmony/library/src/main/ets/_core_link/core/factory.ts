import { BaseRenderer } from "./chart/base";
import { ChartOptions } from "./types";
import { ColumnChartRenderer } from "./chart/column";
import { MountChartRenderer } from "./chart/mount";
import { BarChartRenderer } from "./chart/bar";
import { LineChartRenderer } from "./chart/line";
import { AreaChartRenderer } from "./chart/area";
import { ScatterChartRenderer } from "./chart/scatter";
import { BubbleChartRenderer } from "./chart/bubble";
import { MixChartRenderer } from "./chart/mix";
import { PieChartRenderer } from "./chart/pie";
import { RingChartRenderer } from "./chart/ring";
import { RoseChartRenderer } from "./chart/rose";
import { RadarChartRenderer } from "./chart/radar";
import { WordChartRenderer } from "./chart/word";
import { ArcBarChartRenderer } from "./chart/arcbar";
import { GaugeChartRenderer } from "./chart/gauge";
import { FunnelChartRenderer } from "./chart/funnel";
import { CandleChartRenderer } from "./chart/candle";
import { MapChartRenderer } from "./chart/map";
import { EventListener } from "./event";
import { HeatmapChartRenderer } from "./chart/heatmap";

/**
 * 图表工厂类
 * 负责根据图表类型创建对应的渲染器
 */
export class Factory {
  /**
   * 创建图表渲染器
   * @param opts 图表配置选项
   * @returns 对应的图表渲染器实例
   */
  static createRenderer(opts: Partial<ChartOptions>, events: Record<string, EventListener[]> = {}): BaseRenderer {
    switch (opts.type) {
      case 'column':
        return new ColumnChartRenderer(opts, events);
      case 'mount':
        return new MountChartRenderer(opts, events);
      case 'bar':
        return new BarChartRenderer(opts, events);
      case 'line':
        return new LineChartRenderer(opts, events);
      case 'area':
        return new AreaChartRenderer(opts, events);
      case 'scatter':
        return new ScatterChartRenderer(opts, events);
      case 'bubble':
        return new BubbleChartRenderer(opts, events);
      case 'mix':
        return new MixChartRenderer(opts, events);
      case 'pie':
        return new PieChartRenderer(opts, events);
      case 'ring':
        return new RingChartRenderer(opts, events);
      case 'rose':
        return new RoseChartRenderer(opts, events);
      case 'radar':
        return new RadarChartRenderer(opts, events);
      case 'word':
        return new WordChartRenderer(opts, events);
      case 'arcbar':
        return new ArcBarChartRenderer(opts, events);
      case 'gauge':
        return new GaugeChartRenderer(opts, events);
      case 'funnel':
        return new FunnelChartRenderer(opts, events);
      case 'candle':
        return new CandleChartRenderer(opts, events);
      case 'map':
        return new MapChartRenderer(opts, events);
      case 'heatmap':
        return new HeatmapChartRenderer(opts, events);
      // TODO: 添加其他图表类型的渲染器
      // TODO: 每次新增图表后getCurrentDataIndex和showToolTip方法内需要适配图表操作逻辑
      default:
        throw new Error(`Unsupported chart type: ${opts.type}`);
    }

  }
}
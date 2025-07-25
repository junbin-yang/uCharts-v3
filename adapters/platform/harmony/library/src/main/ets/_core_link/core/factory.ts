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
  static createRenderer(opts: Partial<ChartOptions>): BaseRenderer {
    switch (opts.type) {
      case 'column':
        return new ColumnChartRenderer(opts);
      case 'mount':
        return new MountChartRenderer(opts);
      case 'bar':
        return new BarChartRenderer(opts);
      case 'line':
        return new LineChartRenderer(opts);
      case 'area':
        return new AreaChartRenderer(opts);
      case 'scatter':
        return new ScatterChartRenderer(opts);
      case 'bubble':
        return new BubbleChartRenderer(opts);
      case 'mix':
        return new MixChartRenderer(opts);
      case 'pie':
        return new PieChartRenderer(opts);
      case 'ring':
        return new RingChartRenderer(opts);
      case 'rose':
        return new RoseChartRenderer(opts);
      case 'radar':
        return new RadarChartRenderer(opts);
      case 'word':
        return new WordChartRenderer(opts);
      case 'arcbar':
        return new ArcBarChartRenderer(opts);
      case 'gauge':
        return new GaugeChartRenderer(opts);
      case 'funnel':
        return new FunnelChartRenderer(opts);
      case 'candle':
        return new CandleChartRenderer(opts);
      // TODO: 添加其他图表类型的渲染器
      // TODO: 每次新增图表后getCurrentDataIndex和showToolTip方法内需要适配图表操作逻辑
      default:
        throw new Error(`Unsupported chart type: ${opts.type}`);
    }

  }
}
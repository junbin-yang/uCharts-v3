import {default as UCharts} from './charts.js'
import { ChartOptions } from './types';

export class HMCharts {
  private chart: UCharts

  constructor(opts: ChartOptions) {
    opts.width = opts.context.width
    opts.height = opts.context.height
    this.chart = new UCharts(opts)
  }

  /**
   * 更新配置或数据
   */
  update(opts: Partial<ChartOptions>) {
    this.chart.updateData(opts)
  }

  onMouseEvent(event: MouseEvent) {
    if(event.action == MouseAction.Press) {
      this.chart.scrollStart({mp: {changedTouches: [{x: event.x, y: event.y}]}})
      this.chart.touchLegend({mp: {changedTouches: [{x: event.x, y: event.y}]}})
      this.chart.showToolTip({mp: {changedTouches: [{x: event.x, y: event.y}]}})
    } else if(event.action == MouseAction.Move) {
      this.chart.scroll({ mp: { changedTouches: [{ x: event.x, y: event.y }] } })
      this.chart.showToolTip({ mp: { changedTouches: [{ x: event.x, y: event.y }] } })
    } else if(event.action == MouseAction.Release) {
      this.chart.scrollEnd({ mp: { changedTouches: [{ x: event.x, y: event.y }] } })
    }
  }

  onTouchEvent(event: TouchEvent) {
    const touch = event.touches[0]
    if(event.type == TouchType.Down) {
      this.chart.scrollStart({mp: {changedTouches: [{x: touch.x, y: touch.y}]}})
      this.chart.touchLegend({mp: {changedTouches: [{x: touch.x, y: touch.y}]}})
      this.chart.showToolTip({mp: {changedTouches: [{x: touch.x, y: touch.y}]}})
    } else if(event.type == TouchType.Move) {
      this.chart.scroll({mp: {changedTouches: [{x: touch.x, y: touch.y}]}})
      this.chart.showToolTip({mp: {changedTouches: [{x: touch.x, y: touch.y}]}})
    } else if(event.type == TouchType.Up) {
      this.chart.scrollEnd({mp: {changedTouches: [{x: touch.x, y: touch.y}]}})
    }
  }
}
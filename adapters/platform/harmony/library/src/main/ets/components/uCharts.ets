import { BaseRenderer } from '../_core_link/core/chart/base';
import { EventType, EventListener } from '../_core_link/core/event';
import { Factory } from '../_core_link/core/factory';
import { CanvasContext, ChartOptions, Point } from '../_core_link/interface';

@Observed
export class UChartsController {
  private chartRenderer: BaseRenderer|undefined;
  public context: CanvasRenderingContext2D;
  private opts: Partial<ChartOptions>|undefined;

  constructor() {
    this.context = new CanvasRenderingContext2D(new RenderingContextSettings(true));
  }

  updateData(data: Partial<ChartOptions>) {
    this.opts = data
    if(this.chartRenderer == undefined) {
      data.context = this.context as CanvasContext
      try {
        this.chartRenderer = Factory.createRenderer(data);
      } catch (e) {
        throw new Error('Failed to create chart renderer');
      }
    } else {
      this.chartRenderer.updateData(data)
    }
  }

  translate(distance: number) {
    this.chartRenderer?.translate(distance)
  }

  onMouseEvent(event: MouseEvent) {
    const p: Point = {
      x: event.x,
      y: event.y
    }
    if(event.action == MouseAction.Press) {
      this.chartRenderer?.scrollStart(p)
      this.chartRenderer?.touchLegend(p)
      this.chartRenderer?.showToolTip(p)
    } else if(event.action == MouseAction.Move) {
      this.chartRenderer?.scroll(p)
      if(!this.opts?.enableScroll) this.chartRenderer?.showToolTip(p)
    } else if(event.action == MouseAction.Release) {
      this.chartRenderer?.scrollEnd()
    }
  }

  onTouchEvent(event: TouchEvent) {
    const touch = event.touches[0]
    const p: Point = {
      x: touch.x,
      y: touch.y
    }
    if(event.type == TouchType.Down) {
      this.chartRenderer?.scrollStart(p)
      this.chartRenderer?.touchLegend(p)
      this.chartRenderer?.showToolTip(p)
    } else if(event.type == TouchType.Move) {
      this.chartRenderer?.scroll(p)
      if(!this.opts?.enableScroll) this.chartRenderer?.showToolTip(p)
    } else if(event.type == TouchType.Up) {
      this.chartRenderer?.scrollEnd()
    }
  }

  addEventListener(type: EventType, listener: EventListener) {
    this.chartRenderer?.on(type, listener)
  }

  delEventListener(type: EventType) {
    this.chartRenderer?.off(type)
  }
}

@Component
export struct UCharts {
  @ObjectLink controller: UChartsController;
  onReady: () => void = () => {}

  build() {
    Canvas(this.controller.context)
      .onReady(()=>{
        this.onReady()
      })
      .onMouse((event: MouseEvent) => this.controller?.onMouseEvent(event))
      .onTouch((event: TouchEvent) => this.controller?.onTouchEvent(event))
  }
}
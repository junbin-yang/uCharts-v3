import { BaseRenderer } from '../_core_link/core/chart/base';
import { EventType, EventListener } from '../_core_link/core/event';
import { Factory } from '../_core_link/core/factory';
import { CanvasContext, ChartOptions, Point, AnyType } from '../_core_link/interface';

// 定义CanvasRenderingContext2D的CanvasContext适配器
class CanvasContextProxy implements ProxyHandler<CanvasRenderingContext2D>, ProxyHandler<CanvasContext> {
  // 拦截属性设置操作
  set(target: CanvasRenderingContext2D|CanvasContext, propertyKey: string, value: string, receiver: AnyType): AnyType {
    // 确保只设置存在的可写属性
    if (typeof propertyKey === 'string') {
      try {
        (target as AnyType)[propertyKey] = value;
        return true;
      } catch (e) {
        console.warn(`无法设置属性 ${String(propertyKey)}`, e);
      }
    }
    return false;
  }

  get(target: CanvasRenderingContext2D|CanvasContext, propertyKey: string, receiver: AnyType): AnyType {
    if (propertyKey === "createCircularGradient") {
      return undefined
    }

    const value: AnyType = (target as AnyType)[propertyKey];
    return typeof value === 'function' ? value.bind(target) : value;
  }
}

@Observed
export class UChartsController {
  private chartRenderer: BaseRenderer|undefined;
  public context: CanvasRenderingContext2D;
  private opts: Partial<ChartOptions>|undefined;
  private events_tmp: Record<string, EventListener[]> = {};

  constructor(data?: Partial<ChartOptions>) {
    this.context = new CanvasRenderingContext2D(new RenderingContextSettings(true));
    if(data) this.opts = data
  }

  reload() {
    if(this.opts) this.updateData(this.opts)
  }

  updateData(data: Partial<ChartOptions>) {
    this.opts = data
    if(this.chartRenderer == undefined) {
      const handler = new CanvasContextProxy();
      const canvasContext = new Proxy(this.context, handler) as CanvasContext;
      data.context = canvasContext;
      //data.context = this.context as CanvasContext
      try {
        this.chartRenderer = Factory.createRenderer(data, this.events_tmp);
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
    if(this.chartRenderer == undefined) {
      this.events_tmp[type] = this.events_tmp[type] || [];
      this.events_tmp[type].push(listener);
    } else {
      this.chartRenderer.on(type, listener)
    }
  }

  delEventListener(type: EventType) {
    if(this.chartRenderer == undefined) {
      this.events_tmp[type] = [];
    } else {
      this.chartRenderer.off(type)
    }
  }

  // 获取当前图表数据点击索引
  getCurrentDataIndex(p: Point) {
    return this.chartRenderer?.getCurrentDataIndex(p)
  }
}

@Component
export struct UCharts {
  @ObjectLink controller: UChartsController;
  /**
   * 图表宽度
   */
  @Prop contentWidth: number|string = "100%"
  /**
   * 图表高度
   */
  @Prop contentHeight: number|string = 300
  /*
   * 画布已加载完毕，可以开始渲染
   */
  onReady: () => void = () => {}
  /*
   * 图表点击事件
   * dataIndex：当前点击图表的数据索引
   */
  onTap: (dataIndex: number|number[]) => void = () => {}

  build() {
    Canvas(this.controller.context)
      .onReady(()=>{
        this.controller.reload()
        this.onReady()
        console.log("####", this.controller.context.width);
      })
      .onMouse((event: MouseEvent) => {
        if(event.action == MouseAction.Press) {
          const current = this.controller.getCurrentDataIndex({x: event.x, y: event.y})
          if(current) this.onTap(current.index)
        }
        this.controller.onMouseEvent(event)
      })
      .onTouch((event: TouchEvent) => {
        if(event.type == TouchType.Down) {
          const current = this.controller.getCurrentDataIndex({x: event.touches[0].x, y: event.touches[0].y})
          if(current) this.onTap(current.index)
        }
        this.controller.onTouchEvent(event)
      })
      .width(this.contentWidth)
      .height(this.contentHeight)
  }
}

export class UChartsControllerV2 {
  private chartRenderer: BaseRenderer|undefined;
  public context: CanvasRenderingContext2D;
  private opts: Partial<ChartOptions>|undefined;
  private events_tmp: Record<string, EventListener[]> = {};

  constructor(data?: Partial<ChartOptions>) {
    this.context = new CanvasRenderingContext2D(new RenderingContextSettings(true));
    if(data) this.opts = data
  }

  reload() {
    if(this.opts) this.updateData(this.opts)
  }

  updateData(data: Partial<ChartOptions>) {
    this.opts = data
    if(this.chartRenderer == undefined) {
      const handler = new CanvasContextProxy();
      const canvasContext = new Proxy(this.context, handler) as CanvasContext;
      data.context = canvasContext;
      //data.context = this.context as CanvasContext
      try {
        this.chartRenderer = Factory.createRenderer(data, this.events_tmp);
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

  getCurrentDataIndex(p: Point) {
    return this.chartRenderer?.getCurrentDataIndex(p)
  }
}

@ComponentV2
export struct UChartsV2 {
  @Require @Param controller: UChartsControllerV2;
  /**
   * 图表宽度
   */
  @Param contentWidth: number|string = "100%"
  /**
   * 图表高度
   */
  @Param contentHeight: number|string = 300
  /*
   * 画布已加载完毕，可以开始渲染
   */
  @Event onReady: () => void = () => {}
  /*
   * 图表点击事件
   * dataIndex：当前点击图表的数据索引
   */
  @Event onTap: (dataIndex: number|number[]) => void = () => {}

  build() {
    Canvas(this.controller.context)
      .onReady(()=>{
        this.controller.reload()
        this.onReady()
      })
      .onMouse((event: MouseEvent) => {
        if(event.action == MouseAction.Press) {
          const current = this.controller.getCurrentDataIndex({x: event.x, y: event.y})
          if(current) this.onTap(current.index)
        }
        this.controller.onMouseEvent(event)
      })
      .onTouch((event: TouchEvent) => {
        if(event.type == TouchType.Down) {
          const current = this.controller.getCurrentDataIndex({x: event.touches[0].x, y: event.touches[0].y})
          if(current) this.onTap(current.index)
        }
        this.controller.onTouchEvent(event)
      })
  }
}
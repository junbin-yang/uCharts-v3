import { Factory } from '../../../core/factory';
import { BaseRenderer } from '../../../core/chart/base';
import { H5CanvasContext } from './canvas-adapter';
import { setGlobalConfig, ChartOptions, Point } from '../../../interface';
import { EventType, EventListener } from '../../../core/event';

/**
 * H5平台Canvas渲染器
 * 实现浏览器Canvas API的渲染逻辑
 */
export class UCharts {
    private chartRenderer: BaseRenderer;

    constructor(opts: Partial<ChartOptions>) {
        setGlobalConfig({fontUnit: 'px'}) //默认单位用了鸿蒙的vp，根据平台适配一下。
        try {
            this.chartRenderer = Factory.createRenderer(opts);
        } catch (e) {
            throw new Error('Failed to create chart renderer');
        }
        // H5可以把点击事件属性通过H5CanvasContext传进来。这样可以在Renderer内部就适配好交互事件。无需用户处理。
        (opts.context! as H5CanvasContext).canvas.onclick = (e) => this.onclick(e);
        (opts.context! as H5CanvasContext).canvas.onmousemove = (e) => this.onmousemove(e);
        (opts.context! as H5CanvasContext).canvas.onmousedown = (e) => this.onmousedown(e);
        (opts.context! as H5CanvasContext).canvas.onmouseup = () => this.onmouseup();
    }

    updateData(data: Partial<ChartOptions>) {
        this.chartRenderer.updateData(data)
    }

    translate(distance: number) {
        this.chartRenderer?.translate(distance)
    }

    addEventListener(type: EventType, listener: EventListener) {
        this.chartRenderer?.on(type, listener)
    }

    delEventListener(type: EventType) {
        this.chartRenderer?.off(type)
    }

    private onclick(e: MouseEvent) {
        const p: Point = {
            x: e.offsetX,
            y: e.offsetY
        }
        this.chartRenderer?.touchLegend(p)
        this.chartRenderer?.showToolTip(p)
    }

    private onmousemove(e: MouseEvent) {
        const p: Point = {
            x: e.offsetX,
            y: e.offsetY
        }
        this.chartRenderer?.scroll(p)
        this.chartRenderer?.showToolTip(p)
    }

    private onmousedown(e: MouseEvent) {
        const p: Point = {
            x: e.offsetX,
            y: e.offsetY
        }
        this.chartRenderer?.scrollStart(p)
    }

    private onmouseup() {
        this.chartRenderer?.scrollEnd()
    }
    
} 
import { Factory } from '../../../core/factory';
import { BaseRenderer } from '../../../core/chart/base';
import { WechatCanvasContext } from './canvas-adapter';
import { setGlobalConfig, ChartOptions, Point } from '../../../interface';
import { EventType, EventListener } from '../../../core/event';

/**
 * 微信小程序Canvas渲染器
 * 实现微信小程序Canvas API的渲染逻辑
 */
export class UCharts {
    private chartRenderer: BaseRenderer;
    private canvasContext: WechatCanvasContext;

    constructor(opts: Partial<ChartOptions>) {
        // 设置微信小程序的全局配置，字体单位使用px
        setGlobalConfig({fontUnit: 'px'});
        
        try {
            this.chartRenderer = Factory.createRenderer(opts);
            this.canvasContext = opts.context as WechatCanvasContext;
        } catch (e) {
            throw new Error('创建图表渲染器失败');
        }
        console.log("创建微信小程序图表渲染器成功")
    }

    /**
     * 更新图表数据
     * @param data 新的图表配置数据
     */
    updateData(data: Partial<ChartOptions>) {
        this.chartRenderer.updateData(data);
    }

    /**
     * 平移图表
     * @param distance 平移距离
     */
    translate(distance: number) {
        this.chartRenderer?.translate(distance);
    }

    /**
     * 添加事件监听器
     * @param type 事件类型
     * @param listener 事件监听函数
     */
    addEventListener(type: EventType, listener: EventListener) {
        this.chartRenderer?.on(type, listener);
    }

    /**
     * 删除事件监听器
     * @param type 事件类型
     */
    delEventListener(type: EventType) {
        this.chartRenderer?.off(type);
    }

    /**
     * 处理触摸开始事件
     * @param e 触摸事件对象
     */
    touchStart(e: any) {
        if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            const p: Point = {
                x: touch.x,
                y: touch.y
            };
            this.chartRenderer?.scrollStart(p);
        }
    }

    /**
     * 处理触摸移动事件
     * @param e 触摸事件对象
     */
    touchMove(e: any) {
        if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            const p: Point = {
                x: touch.x,
                y: touch.y
            };
            this.chartRenderer?.scroll(p);
            this.chartRenderer?.showToolTip(p);
        }
    }

    /**
     * 处理触摸结束事件
     * @param e 触摸事件对象
     */
    touchEnd(e: any) {
        this.chartRenderer?.scrollEnd();
        
        // 处理点击事件
        if (e.changedTouches && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            const p: Point = {
                x: touch.x,
                y: touch.y
            };
            this.chartRenderer?.touchLegend(p);
            this.chartRenderer?.showToolTip(p);
        }
    }

    /**
     * 处理点击事件
     * @param e 点击事件对象
     */
    tap(e: any) {
        const p: Point = {
            x: e.detail.x,
            y: e.detail.y
        };
        this.chartRenderer?.touchLegend(p);
        this.chartRenderer?.showToolTip(p);
    }
}
// 微信小程序平台入口文件
import { UCharts } from './canvas-renderer';
import { WechatCanvasContext } from './canvas-adapter';
// 导出核心类型和接口
import * as Interface from '../../../interface';

// 合并所有内容到默认导出
const UChartsExport = UCharts as typeof UCharts & {
    WechatCanvasContext: typeof WechatCanvasContext;
} & typeof Interface;

UChartsExport.WechatCanvasContext = WechatCanvasContext;
Object.assign(UChartsExport, Interface);

export default UChartsExport;
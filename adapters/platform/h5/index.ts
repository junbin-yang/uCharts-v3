// H5平台入口文件
import { UCharts } from './canvas-renderer';
import { H5CanvasContext } from './canvas-adapter';
// 导出核心类型和接口
import * as Interface from '../../../interface';

// 合并所有内容到默认导出
const UChartsExport = UCharts as typeof UCharts & {
    H5CanvasContext: typeof H5CanvasContext;
  } & typeof Interface;
UChartsExport.H5CanvasContext = H5CanvasContext;
Object.assign(UChartsExport, Interface);

export default UChartsExport;
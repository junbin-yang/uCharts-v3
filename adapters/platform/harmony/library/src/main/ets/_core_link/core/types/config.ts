import { ChartsUtil } from "../utils"

export class ChartsConfig {
  /**
   * 字体单位
   */
  fontUnit: 'vp'|'px'|'lpx'|'fp' = 'vp'
  /**
   * 默认字体大小
   */
  fontSize: number = 13
  /**
   * 默认字体颜色
   */
  fontColor: string = '#666666'
  /**
   * 背景色
   */
  background: string = "#FFFFFF"
  /**
   * 动画展示时长，单位毫秒
   */
  duration: number = 1000
  /**
   * 是否旋转屏幕
   */
  rotate: boolean = false
  /**
   * 画布填充边距
   */
  padding: [number,number,number,number] = [10, 10, 10, 10]
  /**
   * Y轴基准宽度
   */
  yAxisWidth: number = 50
  /**
   * X轴基准宽度
   */
  xAxisHeight: number = 74
  /**
   * 数据点形状
   */
  dataPointShape: Array<string> = ['circle', 'circle', 'circle', 'circle']
  /**
   * 主题颜色
   */
  color: Array<string> = ['#3D8AF2', '#58DB6B', '#FAC858', '#EE6666', '#73C0DE', '#3CA272', '#FC8452', '#9A60B4', '#ea7ccc']
  /**
   * 线条颜色
   */
  linearColor: Array<string> = ['#0EE2F8', '#2BDCA8', '#FA7D8D', '#EB88E2', '#2AE3A0', '#0EE2F8', '#EB88E2', '#6773E3', '#F78A85']
  /**
   * 饼图文本与线条填充间隔
   */
  pieChartLinePadding: number = 15
  pieChartTextPadding: number = 5
  /**
   * 主副标题字体大小
   */
  titleFontSize: number = 20
  subtitleFontSize: number = 15
  /**
   * 雷达图标签文本边距
   */
  radarLabelTextMargin: number = 13
}

export const GlobalConfig: ChartsConfig = new ChartsConfig()

export const setGlobalConfig = (val: Partial<ChartsConfig>) => {
  ChartsUtil.objectAssign(GlobalConfig, val)
}
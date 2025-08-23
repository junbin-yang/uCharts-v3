import { CanvasContext } from '../../interface/canvas.type'
import { AnimationTiming } from '../animation/index.type'
import { Extra } from './extra'
import { MapSeries, Series, ValueAndColorData } from './series'

/**
 * 任意类型
 */
export type AnyType = any

/**
 * 图表选项
 */
export interface ChartOptions {
  type: ChartType
  categories?: Array<string|Partial<ValueAndColorData>>           //图表数据集，部分图表类型不需要categories
  series: Array<Series>|MapSeries                                 //图表数据集，请按不同图表类型传入对应的标准数据
  yAxis?: Partial<YAxisOptions>                                   //Y轴选项
  xAxis?: Partial<XAxisOptions>                                   //X轴选项
  extra: Extra                                                    //扩展配置
  context?: CanvasContext                                         //CanvasRenderingContext2D
  pixelRatio?: number                                             //设备像素比
  fontSize?: number                                               //全局默认字体大小，默认13
  fontColor?: string                                              //全局默认字体颜色，16进制颜色格式，默认#666666
  background?: string                                             //背景颜色，开启滚动条后请赋值
  title?: Partial<TitleOptions>                                   //标题配置，此配置仅适用于ring、arcbar、gauge，直角坐标系图表可在X轴配置/Y轴配置中设置标题
  subtitle?: Partial<TitleOptions>                                //副标题配置，此配置仅适用于ring、arcbar、gauge，直角坐标系图表可在X轴配置/Y轴配置中设置标题
  animation?: boolean                                             //是否动画展示图表，默认true
  timing?: AnimationTiming                                        //默认easeOut
  duration?: number                                               //动画展示时长，单位毫秒，默认1000
  enableScroll?: boolean                                          //开启滚动条，X轴配置里需要配置itemCount单屏幕数据点数量，默认false
  scrollPosition?: 'current'|'left'|'right'                       //连续更新数据时，滚动条的位置。默认'current'。可选值："current"当前位置,"left"左对齐,"right"右对齐
  rotate?: boolean                                                //横屏模式，默认false
  rotateLock?: boolean                                            //横屏锁定模式，默认false，如果开启横屏模式后，图表交互每次都会旋转90度，请赋值true
  padding?: [number, number, number, number]                      //画布填充边距，顺序为上右下左，例如[10,15,25,15]
  legend?: Partial<LegendOptions>                                 //图例配置
  touchMoveLimit?: number                                         //图表拖拽时，每秒重新渲染的帧数，默认60（用于图表拖拽卡顿，可以降低js与视图层交互的次数，理论上24帧/秒就够用了）
  dataLabel?: boolean                                             //是否显示图表区域内数据点上方的数据文案，默认true
  dataPointShape?: boolean                                        //是否显示数据点的图形标识，默认true
  dataPointShapeType?: 'solid'|'hollow'                           //图形标识点显示类型，可选值：'solid'实心,'hollow'空心，默认'solid'
  enableMarkLine?: boolean                                        //是否启用标记线功能，也可做为隐藏图表区域内的标记线的开关，默认true
  color?: Array<string>                                           //主题颜色，16进制颜色格式

  [key: string]: AnyType  // width  height
}

/**
 * 图表类型
 * column 柱状图 | mount 山峰图 | bar 条状图 | line 折线图 | area 区域图 | scatter 散点图 | bubble 气泡图 | mix 混合图 | pie 饼状图 | ring 圆环图 | rose 玫瑰图 | radar 雷达图 | arcbar 进度条 | gauge 仪表盘 | funnel 漏斗图 | candle K线图 | map 地图 | word 词云图
 */
export type ChartType = "column" | "bar" | "mount"  | "line" | "area" | "scatter" | "bubble" | "mix" | "pie" | "ring" | "rose" | "radar" | "arcbar" | "gauge" | "funnel" | "candle" | "map" | "word" | "heatmap"

/**
 * 标题配置
 */
export interface TitleOptions {
  value: string        //标题内容
  fontSize: number    //标题字体大小
  color: string      //标题颜色，主标题默认#666666，副标题默认#7cb5ec
  offsetX: number    //横向位置偏移量（相对屏幕中心为原点可为负数），默认0
  offsetY: number    //纵向位置偏移量（相对屏幕中心为原点可为负数），默认0
}

/**
 * Y轴选项
 */
export interface YAxisOptions {
  disabled: boolean        //不绘制Y轴，默认false
  disableGrid: boolean     //不绘制横向网格，默认false(即默认绘制网格)
  splitNumber: number      //横向向网格数量，默认5，此数量与Y轴数据点是否为小数有关，如果指定了max，请指定为能被max-min整除的数值，如果不传max一般指定为5
  gridType: 'solid'|'dash' //横向向网格线型，可选值：'solid'实线,'dash'虚线，默认solid
  dashLength: number       //横向网格为虚线时，单段虚线长度，默认8
  gridColor: string        //横向网格颜色，默认#CCCCCC
  padding: number          //多个Y轴间的间距，默认10
  showTitle: boolean       //不绘制Y轴标题，默认false
  data: Array<Partial<YAxisOptionsData>> //多Y轴配置

  formatter: (value: number|string, index?: number, opts?: ChartOptions) => string

  [key: string]: AnyType   //unit
}

export interface YAxisOptionsData {
  type: 'value'|'categories'         //Y轴数据类型，可选值：'value'数值,'categories'类别（条状图需选择为类别），默认value
  position: 'left'|'right'|'center'  //当前Y轴显示位置，可选值：'left','right','center'，默认left
  disabled: boolean                  //不绘制Y轴，默认false
  axisLine: boolean                  //坐标轴轴线是否显示，默认true
  axisLineColor: string              //坐标轴轴线颜色，默认#CCCCCC
  calibration: boolean               //刻度线是否显示，默认false
  fontColor: string                  //数据点（刻度点）字体颜色，默认#666666
  fontSize: number                   //数据点（刻度点）字体大小，默认13
  textAlign: 'left'|'right'|'center' //数据点（刻度点）相对轴线的对齐方式，可选值：'left','right','center'，默认right
  title: string                      //当前Y轴标题（需要上面showTitle设置为true）
  titleFontSize: number              //标题字体大小，默认13
  titleOffsetY: number               //标题纵向偏移距离，负数为向上偏移，正数向下偏移
  titleOffsetX: number               //标题横向偏移距离，负数为向左偏移，正数向右偏移
  titleFontColor: string             //标题字体颜色，默认#666666
  min: number                        //当前Y轴起始值（默认数据中的最小值）
  max: number                        //当前Y轴终止值（默认数据中的最大值）
  tofix: number                      //Y轴刻度值保留的小数位数
  unit: string                       //Y轴刻度值后附加单位

  formatter?: (value: number|string, index?: number, opts?: ChartOptions) => string  //格式化Y轴文案显示
  [key: string]: AnyType   //categories
}

/**
 * X轴选项
 */
export interface XAxisOptions {
  disabled: boolean        //不绘制X轴，默认false
  axisLine: boolean        //绘制坐标轴轴线，默认true
  axisLineColor: string    //坐标轴轴线颜色，默认#CCCCCC
  calibration: boolean     //坐标轴刻度线是否显示，默认false
  fontColor: string        //数据点（刻度点）字体颜色，默认#666666
  fontSize: number         //数据点（刻度点）字体大小，默认13
  lineHeight: number       //数据点（刻度点）字体行高，默认20
  marginTop: number        //X轴文字距离轴线的距离（不包含行高），默认0
  rotateLabel: boolean     //旋转数据点（刻度点）文字，默认false
  rotateAngle: number      //开启上面旋转功能后，文字旋转的角度，取值范围(-90至90)，默认45
  labelCount: number       //数据点文字（刻度点）单屏幕限制显示的数量
  itemCount: number        //单屏数据密度即图表可视区域内显示的X轴数据点数量，仅在启用enableScroll时有效，默认5
  boundaryGap: 'center'|'justify'  //折线图、区域图起画点结束点方法，可选值：'center'两端留空,'justify'两端对齐，默认center
  disableGrid: boolean     //不绘制纵向网格，默认true(即默认绘制网格)
  splitNumber: number      //X轴网格数量，纵向网格数量(竖着的)
  gridColor: string        //纵向网格颜色，默认#CCCCCC
  gridType: 'solid'|'dash' //纵向网格线型，可选值：'solid'实线,'dash'虚线，默认solid
  dashLength: number       //纵向网格为虚线时，单段虚线长度，默认4
  gridEval: number         //纵向网格线显示间隔，默认1
  scrollShow: boolean      //是否显示滚动条，配合拖拽滚动使用（即仅在启用enableScroll时有效），默认false
  scrollAlign: 'left'|'right'     //滚动条初始位置，可选值：'left'左对齐,'right'右对齐，默认left
  scrollColor: string      //滚动条颜色，默认#A6A6A6
  scrollBackgroundColor: string   //滚动条底部背景颜色，默认#EFEBEF
  min: number              //X轴起始值（默认数据中的最小值）
  max: number              //X轴终止值（默认数据中的最大值）
  title: string            //X轴标题文本
  titleFontSize: number    //标题字体大小，默认13
  titleOffsetY: number     //标题纵向偏移距离，负数为向上偏移，正数向下偏移
  titleOffsetX: number     //标题横向偏移距离，负数为向左偏移，正数向右偏移
  titleFontColor: string   //标题字体颜色，默认#666666
  background?: string        //背景颜色，开启滚动条后请赋值

  formatter?: (value: number|string, index?: number, opts?: ChartOptions) => string
  [key: string]: AnyType
}

/**
 * 图例配置
 */
export interface LegendOptions {
  show: boolean                                  //是否显示图例标识，默认true
  position: 'bottom'|'top'|'left'|'right'        //图例相对画布的显示位置，可选值：'bottom','top','left','right'，默认bottom
  float: 'bottom'|'top'|'left'|'right'|'center'  //图例位置对齐方向，可选值：'center','left','right','top','bottom'，默认center
  padding: number                                //图例内填充边距，默认5
  margin: number                                 //图例外侧填充边距
  backgroundColor: string                        //图例背景颜色，默认rgba(0,0,0,0)
  borderColor: string                            //图例边框颜色，默认rgba(0,0,0,0)
  borderWidth: number                            //图例边框线宽，默认0
  fontSize: number                               //字体大小，默认13
  fontColor: string                              //字体颜色，默认#666666
  lineHeight: number                             //字体行高，默认11
  hiddenColor: string                            //点击隐藏时图例标识及文字颜色，默认#CECECE
  itemGap: number                                //各个分类（类别）之间的间隔，默认10
}

export interface Point {
  x: number
  y: number
}

export interface ToolTipOptions {
  index: number     //强制选中的索引，即无论选择的位置是什么，都强制选中index的数据
  offset: Point,    //自定义ToolTip显示位置，格式为{x: Number, y: Number}
  textList: ToolTipTextList[]  //定义ToolTip文案，格式为[{text: 显示的字符串, color: null或16进制颜色值, legendShape: 图例形状，请参考series.legendShape赋值}]

  formatter?: (item: number|string|Series, category: string, index: number, opts: ChartOptions) => string
}

export interface ToolTipTextList {
  text: string,
  color: string,
  legendShape: 'diamond' | 'circle' | 'triangle' | 'square' | 'rect' | 'line' | 'none'
}

export interface MapDataRes {
  bounds: BoundBoxType,
  scale: number,
  xoffset: number,
  yoffset: number,
  mercator: boolean,
}

export interface BoundBoxType {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}
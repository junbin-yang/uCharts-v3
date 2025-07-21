import { ChartOptions } from "./index"

// 所有图表类型的数据系列联合类型
export type Series =
    | ColumnSeries
    | MountSeries
    | BarSeries
    | LineSeries
    | AreaSeries
    | ScatterSeries
    | BubbleSeries
    | MixedSeries
    | PieSeries
    | RingSeries
    | RoseSeries
    | RadarSeries
    | WordSeries
    | NameAndValueData   // use fixPieSeries

// 柱状图数据系列
export type SeriesDataItem = number|number[]|ValueAndColorData|null|Record<string, number>
export interface ColumnSeries extends BaseSeries {
  data: Array<SeriesDataItem>  //数据值，如果传入null图表该处出现断点
}

// 山峰图数据系列
export interface MountSeries extends BaseSeries {
  data: Array<NameAndValueData>  //数据值
}

// 条状图数据系列
export interface BarSeries extends BaseSeries {
  data: Array<number>  //数据值
}

// 折线图数据系列
export interface LineSeries extends BaseSeries {
  data: Array<number|null>|Array<[number, number]>   //数据值
  connectNulls?: boolean                         //断点续连，即跳过null的点位直接连到下个点位。默认false
  setShadow?: [number, number, number, string]   //阴影配置，格式为4位数组：[offsetX,offsetY,blur,color]
  linearColor?: Array<[number, string]>          //渐变色数组，格式为2维数组[起始位置，颜色值]，例如[[0,'#0EE2F8'],[0.3,'#2BDCA8'],[0.6,'#1890FF'],[1,'#9A60B4']]
  lineType?: string                              //折线线型，可选值：'solid'为实线,'dash'为虚线，默认solid
  dashLength?: number                            //折线为虚线时，单段虚线长度，默认8
}

// 区域图数据系列
export interface AreaSeries extends BaseSeries {
  data: Array<number|[number,number]>             //数据值
  connectNulls?: boolean                          //断点续连，即跳过null的点位直接连到下个点位。默认false
  lineType?: string                              //折线线型，可选值：'solid'为实线,'dash'为虚线，默认solid
  dashLength?: number                            //折线为虚线时，单段虚线长度，默认8
}

// 散点图数据系列
export interface ScatterSeries extends BaseSeries {
  data: Array<[number,number]>       //数据值
}

// 气泡图数据系列
export interface BubbleSeries extends BaseSeries {
  data: Array<[number,number,number,string]>       //数据值
}

// 混合图表数据系列
export interface MixedSeries extends BaseSeries {
  index?: number                          //多维数据结构索引值，应用于多坐标系混合图，默认0
  data: Array<SeriesDataItem>             //数据值
  type: 'point'|'line'|'column'|'area'    //混合图表图形展示方式，有效值为point,line,column,area
  disableLegend?: boolean                 //混合图表中禁止显示ToolTip图例，默认false即默认显示该类别图例
  style?: 'curve'|'straight'              //混合图表折线图或区域图样式，可选值：'curve'曲线,'straight'直线，默认直线
  addPoint?: boolean                      //混合图中，是否增加折线或区域图上的标记点，仅针对line,area,mix有效
}

// 饼图数据系列
export interface PieSeries extends BaseSeries {
  data: Array<HasLabelSeriesData>       //数据值
}

// 圆环图数据系列
export interface RingSeries extends BaseSeries {
  data: Array<HasLabelSeriesData>       //数据值
}

// 玫瑰图数据系列
export interface RoseSeries extends BaseSeries {
  data: Array<HasLabelSeriesData>       //数据值
}

// 雷达图数据系列
export interface RadarSeries extends BaseSeries {
  data: Array<number>  //数据值
}

// 词云图数据系列
export interface WordSeries extends BaseSeries {}

export interface HasLabelSeriesData extends NameAndValueData {
  labelText?: string    //自定义标签文字
  labelShow?: boolean   //是否显示标签，默认true
}

export interface NameAndValueData extends BaseSeries {
  name: string
  value: number

  [key: string]: any
}

export interface ValueAndColorData {
  value: number
  color: string
}

export interface BaseSeries {
  name?: string         //数据名称
  legendText?: string   //自定义图例显示文字（不传默认显示上面的name值）
  show?: boolean        //图形显示状态，配合点击图例显示状态，也可默认指定是否显示。默认true
  color?: string        //图形颜色，例如#7cb5ec 不传入则使用系统默认配色方案
  textColor?: string    //图形上方标注文字的颜色（datalabel文字颜色），例如#7cb5ec 不传入则使用系统默认配色方案
  textSize?: number     //图形上方标注文字的字体大小
  textOffset?: number   //图形上方标注文字的偏移距离，负数为向上偏移，正数向下偏移
  linearIndex?: number  //渐变色索引，用于对应extra配置中的渐变色数组下标，默认为当前series数组的下标
  pointShape?: 'diamond' | 'circle' | 'triangle' | 'square' | 'none'  //数据点标识样式，可选值为diamond◆, circle●, triangle▲, square■, none 无
  legendShape?: 'diamond' | 'circle' | 'triangle' | 'square' | 'rect' | 'line' | 'none'  //图例标识样式，有效值为diamond◆, circle●, triangle▲, square■, rect▬, line-, none 无

  formatter?: (value: number|string, index: number, series: Series, opts?: ChartOptions) => string

  [key: string]: any
}
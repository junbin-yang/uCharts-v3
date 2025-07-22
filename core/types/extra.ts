import { ChartOptions } from "./index"

/**
 * 所有图表的扩展配置
 */
export interface Extra {
  tooltip?: Partial<TooltipOptions>
  markLine?: Partial<MarkLineOptions>
  column?: Partial<ColumnExtra>
  mount?: Partial<MountExtra>
  bar?: Partial<BarExtra>
  line?: Partial<LineExtra>
  area?: Partial<AreaExtra>
  bubble?: Partial<BubbleExtra>
  mix?: Partial<MixExtra>
  pie?: Partial<PieExtra>
  ring?: Partial<RingExtra>
  rose?: Partial<RoseExtra>
  radar?: Partial<RadarExtra>
  word?:  Partial<WordExtra>
  arcbar?: Partial<ArcBarExtra>
  gauge?: Partial<GaugeExtra>
}

/**
 * 柱状图扩展配置
 */
export interface ColumnExtra {
  type: 'group'|'stack'|'meter'      //柱状图类型，可选值：'group'分组柱状图,'stack'堆叠柱状图,'meter'温度计式图，默认group
  width: number                      //柱状图每个柱子的图形宽度
  seriesGap: number                  //多series每个柱子之间的间距
  categoryGap: number                //每个category点位（X轴点）柱子组之间的间距
  barBorderCircle: boolean           //启用分组柱状图半圆边框，默认false
  barBorderRadius: [number,number,number,number]   //自定义4个圆角半径[左上,右上,右下,左下]
  linearType: 'none'|'opacity'|'custom'            //渐变类型，可选值："none"关闭渐变,"opacity"透明渐变,"custom"自定义颜色，默认none
  linearOpacity: number              //透明渐变的透明度（值范围0到1，值越小越透明），默认1
  customColor: string[]              //自定义渐变颜色，数组类型对应series的数组长度以匹配不同series颜色的不同配色方案，例如["#FA7D8D", "#EB88E2"]
  colorStop: number                  //渐变色的显示比例（值范围0到1，值越大自定义颜色程度越高）
  meterBorder: number                //温度计式图表的边框宽度，默认1
  meterFillColor: string             //温度计式图表的空余填充颜色，默认#FFFFFF
  activeBgColor: string              //当前点击柱状图的背景颜色，默认#000000
  activeBgOpacity: number            //当前点击柱状图的背景颜色透明度，默认0.08
  labelPosition: 'outside'|'insideTop'|'center'|'bottom'  //数据标签位置，有效值为"outside"外部,"insideTop"内顶部,"center"内中间,"bottom"内底部，默认outside
}

/**
 * 山峰图扩展配置
 */
export interface MountExtra {
  type: 'mount'|'sharp'|'triangle'|'bar'     //山峰图类型，可选值："mount"圆角,"sharp"尖角,"triangle"三角,"bar"直角，默认mount
  widthRatio: number                         //山峰图每个山峰的图形宽度比例0-2之间，默认1
  borderWidth: number                        //边框线条宽度，默认1
  barBorderCircle: boolean                   //类型为bar的柱状图顶部圆角，默认false
  barBorderRadius: [number,number,number,number]  //类型为bar的柱状图自定义4个圆角半径[左上,右上,右下,左下]
  linearType: 'none'|'opacity'|'custom'      //渐变类型，可选值："none"关闭渐变,"opacity"透明渐变,"custom"自定义颜色，默认none
  linearOpacity: number                      //透明渐变的透明度（值范围0到1，值越小越透明），默认1
  customColor: string[]                      //自定义渐变颜色，数组类型对应series的数组长度以匹配不同series颜色的不同配色方案，例如["#FA7D8D", "#EB88E2"]
  colorStop: number                          //渐变色的显示比例（值范围0到1，值越大自定义颜色程度越高），默认0
  labelPosition: 'outside'|'insideTop'|'center'|'bottom'  //数据标签位置，有效值为"outside"外部,"insideTop"内顶部,"center"内中间,"bottom"内底部，默认outside
}

/**
 * 条状图扩展配置
 */
export interface BarExtra {
  type: 'group'|'stack'      //条状图类型，可选值："group"分组条状图,"stack"堆叠条状图，默认group
  width: number              //条状图每个柱子的图形宽度
  seriesGap: number          //多series每个柱子之间的间距，默认2
  categoryGap: number        //每个category点位（X轴点）柱子组之间的间距，默认3
  barBorderCircle: boolean   //启用分组柱状图半圆边框，默认false
  barBorderRadius: [number,number,number,number]   //自定义4个圆角半径[左上,右上,右下,左下]
  linearType: 'none'|'opacity'|'custom'            //渐变类型，可选值："none"关闭渐变,"opacity"透明渐变,"custom"自定义颜色，默认none
  linearOpacity: number      //透明渐变的透明度（值范围0到1，值越小越透明），默认1
  customColor: string[]      //自定义渐变颜色，数组类型对应series的数组长度以匹配不同series颜色的不同配色方案，例如["#FA7D8D", "#EB88E2"]
  colorStop: number          //渐变色的显示比例（值范围0到1，值越大自定义颜色程度越高）
  activeBgColor: string      //当前点击柱状图的背景颜色，默认#000000
  activeBgOpacity: number    //当前点击柱状图的背景颜色透明度，默认0.08
  meterBorder: number                //温度计式图表的边框宽度，默认1
  meterFillColor: string             //温度计式图表的空余填充颜色，默认#FFFFFF
}

/**
 * 折线图扩展配置
 */
export interface LineExtra {
  type: 'straight'|'curve'|'step'      //折线图类型，可选值："straight"尖角折线模式,"curve"曲线圆滑模式,"step"时序图模式，默认straight
  width: number                        //折线的宽度，默认2
  activeType: 'none'|'hollow'|'solid'  //激活指示点类型，可选值："none"不启用激活指示点,"hollow"空心点模式,"solid"实心点模式，默认none
  linearType: 'none'|'custom'          //渐变色类型，可选值 "none"关闭渐变色，"custom"自定义渐变色。默认none。使用自定义渐变色时请赋值serie.linearColor作为颜色值
  onShadow: boolean                    //是否开启折线阴影，开启后请赋值serie.setShadow阴影设置，默认false
  animation: 'vertical'|'horizontal'   //动画效果方向，可选值为"vertical" 垂直动画效果，"horizontal" 水平动画效果，默认vertical
}

/**
 * 区域图扩展配置
 */
export interface AreaExtra {
  type: 'straight'|'curve'|'step'      //区域图类型，可选值："straight"尖角折线模式,"curve"曲线圆滑模式,"step"时序图模式
  opacity: number                      //区域图透明度，默认0.2
  addLine: boolean                     //是否叠加相应的折线，默认true
  width: number                        //叠加的折线宽度，默认2
  gradient: boolean                    //是否开启区域图渐变色，默认false
  activeType: 'none'|'hollow'|'solid'  //激活指示点类型，可选值："none"不启用激活指示点,"hollow"空心点模式,"solid"实心点模式，默认none
}

/**
 * 气泡图扩展配置
 */
export interface BubbleExtra {
  border: number     //气泡边框宽度，默认2
  opacity: number    //气泡内部透明度，默认0.5
}

/**
 * 混合图扩展配置
 */
export interface MixExtra {
  column: Partial<MixColumnExtra>
  area: Partial<MixAreaExtra>
  line: Partial<MixLineExtra>
}
export interface MixColumnExtra {
  width: number                                    //柱状图每个柱子的图形宽度
  seriesGap: number                                //多series每个柱子之间的间距
  categoryGap: number                              //每个category点位（X轴点）柱子组之间的间距
  barBorderCircle: boolean                         //启用分组柱状图半圆边框，默认false
  barBorderRadius: [number,number,number,number]   //自定义4个圆角半径[左上,右上,右下,左下]
  linearType: 'none'|'opacity'|'custom'            //渐变类型，可选值："none"关闭渐变,"opacity"透明渐变,"custom"自定义颜色，默认none
  linearOpacity: number                            //透明渐变的透明度（值范围0到1，值越小越透明），默认1
  customColor: string[]                            //自定义渐变颜色，数组类型对应series的数组长度以匹配不同series颜色的不同配色方案，例如["#FA7D8D", "#EB88E2"]
  colorStop: number                                //渐变色的显示比例（值范围0到1，值越大自定义颜色程度越高），默认0

  //[key: string]: any;
}
export interface MixAreaExtra {
  gradient: boolean    //区域图是否开启渐变色，默认false
  opacity: number      //区域图透明度，默认0.2

  //[key: string]: any;
}
export interface MixLineExtra {
  width: number    //折线的宽度，默认2

  //[key: string]: any;
}

/**
 * 饼状图扩展配置
 */
export interface PieExtra {
  activeOpacity: number		      //启用Tooltip点击时，突出部分的透明度，默认0.5
  activeRadius: number		        //启用Tooltip点击时，突出部分的宽度（最大值不得超过labelWidth），默认10
  offsetAngle: number		        //起始角度偏移度数，顺时针方向，起点为3点钟位置为0度（比如要设置起点为12点钟位置，即逆时针偏移90度，传入-90即可），默认0
  customRadius: number		        //自定义半径（一般不需要传值，饼图会自动计算半径，自定义半径可能会导致显示图表显示不全），默认0
  labelWidth: number		          //数据标签到饼图外圆连线的长度，默认15
  border: boolean		            //是否绘制各类别中间的分割线，默认true
  borderWidth: number		        //分割线的宽度，默认2
  borderColor: string		        //分割线的颜色，默认#FFFFFF
  linearType: 'none'|'custom'		//渐变类型，可选值："none"关闭渐变,"custom"开启渐变，默认none
  customColor: string[]		      //自定义渐变颜色，数组类型对应series的数组长度以匹配不同series颜色的不同配色方案，例如["#FA7D8D", "#EB88E2"]
}

/**
 * 圆环图扩展配置
 */
export interface RingExtra {
  ringWidth:	number		        //圆环的宽度，默认30
  centerColor: string		      //中间填充圆形的颜色，默认#FFFFFF
  activeOpacity:	number		    //启用Tooltip点击时，突出部分的透明度，默认0.5
  activeRadius: number		      //启用Tooltip点击时，突出部分的宽度（最大值不得超过labelWidth），默认10
  offsetAngle: number		      //起始角度偏移度数，顺时针方向，起点为3点钟位置为0度（比如要设置起点为12点钟位置，即逆时针偏移90度，传入-90即可），默认0
  customRadius: number		      //自定义半径（一般不需要传值，饼图会自动计算半径，自定义半径可能会导致显示图表显示不全），默认0
  labelWidth: number	          //数据标签到饼图外圆连线的长度，默认15
  border: boolean		          //是否绘制各类别中间的分割线，默认true
  borderWidth: number		      //分割线的宽度，默认2
  borderColor: string	        //分割线的颜色，默认	#FFFFFF
  linearType: 'none'|'custom'	//渐变类型，可选值："none"关闭渐变,"custom"开启渐变，默认none
  customColor:	string[]		    //自定义渐变颜色，数组类型对应series的数组长度以匹配不同series颜色的不同配色方案，例如["#FA7D8D", "#EB88E2"]
}

/**
 * 玫瑰图扩展配置
 */
export interface RoseExtra {
  type: 'area'|'radius'	    //玫瑰图样式，可选值："area"面积模式,"radius"半径模式，默认area
  minRadius:	number		      //最小半径值，默认为图形半径的50%
  activeOpacity:	number	  	//启用Tooltip点击时，突出部分的透明度，默认0.5
  activeRadius: number		    //启用Tooltip点击时，突出部分的宽度（最大值不得超过labelWidth），默认10
  offsetAngle: number	      //起始角度偏移度数，顺时针方向，起点为3点钟位置为0度（比如要设置起点为12点钟位置，即逆时针偏移90度，传入-90即可），默认0
  labelWidth: number	        //数据标签到饼图外圆连线的长度，默认15
  border: boolean		        //是否绘制各类别中间的分割线，默认true
  borderWidth:	number	      //分割线的宽度，默认2
  borderColor: string	      //分割线的颜色，默认#FFFFFF
  linearType: 'none'|'custom'  //渐变类型，可选值："none"关闭渐变,"custom"开启渐变，默认none
  customColor: string[]		  //自定义渐变颜色，数组类型对应series的数组长度以匹配不同series颜色的不同配色方案，例如["#FA7D8D", "#EB88E2"]
}

/**
 * 雷达图扩展配置
 */
export interface RadarExtra {
  gridType: 'radar'|'circle'     //雷达图网格类型，可选值："radar"蜘蛛网格样式,"circle"圆形背景网格，默认radar
  gridColor: string		          //雷达图网格颜色，默认#CCCCCC
  gridCount: number	            //雷达图网格数量，默认3
  gridEval: number	              //数据点位网格抽稀,默认1
  radius: number	                //自定义雷达图半径，默认0
  axisLabel:	boolean	            //刻度点值是否显示，默认false
  axisLabelTofix: number	        //刻度点值小数位数，默认0
  labelShow:	boolean	            //是否显示各项标识文案，默认true
  labelColor: string		          //各项标识文案的颜色，默认#666666
  labelPointShow: boolean	      //是否显示末端刻度圆点，默认false
  labelPointRadius: number		    //刻度圆点的半径，默认3
  labelPointColor: string		    //刻度圆点的颜色，默认#CCCCCC
  opacity:	number	              //主图区域透明度，默认0.2
  border: boolean	              //是否绘制主图区域描边线，默认false
  borderWidth: number	          //描边线的宽度，默认2
  max:	number		                //data的最大值，数据区间最大值，用于调整数据显示的比例
  linearType: 'none'|'custom'	  //渐变类型，可选值："none"关闭渐变,"custom"开启渐变
  customColor: string[]		      //自定义渐变颜色，数组类型对应series的数组长度以匹配不同series颜色的不同配色方案，例如["#FA7D8D", "#EB88E2"]
}

/**
 * 词云图扩展配置
 */
export interface WordExtra {
  type: 'normal'|'vertical'   //词云图样式，可选值："normal"水平排列,"vertical"垂直排列
}

/**
 * 进度条扩展配置
 */
export interface ArcBarExtra {
  type: 'default'|'circle'	        //圆弧进度图样式，可选值："default"半圆弧模式,"circle"整圆模式，默认default
  direction: 'cw'|'ccw'	          //动画方向（变换时需要注意起始与结束角度），可选值："cw"顺时针方向,"ccw"逆时针方向，默认cw
  width:	number	                  //圆弧进度图弧线宽度，默认12
  lineCap: 'round'|'square'|'butt'	//进度条两端样式，可选值："round"圆形线帽,"square"方形线帽,"butt"平直边缘，默认round
  backgroundColor: string		      //圆弧进度图背景颜色，默认#E9E9E9
  startAngle: number	              //圆弧进度图起始角度，0-2之间，0为3点钟位置，0.5为6点钟，1为9点钟，1.5为12点钟，默认0.75
  endAngle: number	                //圆弧进度图结束角度，0-2之间，0为3点钟位置，0.5为6点钟，1为9点钟，1.5为12点钟，默认0.25
  radius: number		                //圆弧进度图自定义半径（最大半径）（无特殊需求无需填写）
  gap: number	                    //圆弧进度条的间隔，默认2
  centerX:	number		              //自定义圆心x坐标（无特殊需求无需填写）
  centerY: number		              //自定义圆心y坐标（无特殊需求无需填写）
  linearType: 'none'|'custom'	    //渐变类型，可选值："none"关闭渐变,"custom"开启渐变，默认none
  customColor: string[]		        //自定义渐变颜色，数组类型对应series的数组长度以匹配不同series颜色的不同配色方案，例如["#FA7D8D", "#EB88E2"]
}

/**
 * 仪表盘扩展配置
 */
export interface GaugeExtra {
  type: 'default'|'progress'		  //仪表盘样式，default百度样式，progress新样式
  width:	number		    //仪表盘坐标轴（指示盘）线宽度，默认15
  labelColor: string		//仪表盘刻度尺标签文字颜色，默认#666666
  labelOffset:	number	//仪表盘标签文字径向偏移距离，默认13
  startAngle: number	  //仪表盘起始角度，0-2之间，0为3点钟位置，0.5为6点钟，1为9点钟，1.5为12点钟，默认0.75
  endAngle: number	    //仪表盘结束角度，0-2之间，0为3点钟位置，0.5为6点钟，1为9点钟，1.5为12点钟，默认0.25
  startNumber: number	//仪表盘起始数值。默认0。说明：仪表盘指针指向的值为比例值，假设起始值是11，结束值是15，想指向12，那就是11-15之间的20%，所以series里的data应为0.2，这个值需要自己算好再传chartData里
  endNumber: number	  //仪表盘结束数值，默认100
  formatter: (val: number|string, index: number, opts?: ChartOptions) => string  //仪表盘数据标签自定义，形参为(val,index,opts)
  splitLine: Partial<GaugeExtraSplitLine>
  pointer: Partial<GaugeExtraPointer>

  [key: string]: any; //oldAngle,oldData
}
export interface GaugeExtraSplitLine {
  fixRadius:	number	  //仪表盘刻度线径向偏移量，默认0
  splitNumber:	number	//仪表盘刻度线分段总数量，默认10
  width:	number	      //仪表盘分割线长度，默认15
  color: string		    //仪表盘分割线颜色，默认#FFFFFF
  childNumber:	number	//仪表盘子刻度线数量，默认5
  childWidth:number	  //仪表盘子刻度线长度，默认5
}
export interface GaugeExtraPointer {
  width: number    //仪表盘指针宽度，默认15
  color: string    //仪表盘指针颜色，定义为auto时，随仪表盘背景颜色改变,或者可以指定颜色例如#7cb5ec，默认auto
}



/**
 * 提示窗配置
 */
export interface TooltipOptions {
  showBox:	boolean		      //是否显示提示窗的方框及内部文字，默认true
  showArrow:	boolean		    //是否显示旁边的小三角箭头，默认true
  showCategory: boolean	  //是否显示顶部category标题（x轴对应点位），默认false
  borderWidth:	number	    //提示窗口的边框宽度，默认0
  borderRadius: number	    //提示窗口的四角圆弧半径，默认0
  borderColor: string		  //提示窗口的边框颜色，默认#000000
  borderOpacity:	number		//提示窗口的边框颜色透明度，默认0.7
  bgColor: string		      //提示窗口的背景颜色，默认#000000
  bgOpacity:	number	      //提示窗口的背景颜色透明度，默认0.7
  gridType: 'solid'|'dash'	//分割线线型，可选值：'solid'实线,'dash'虚线，默认solid
  dashLength: number	      //分割线为虚线时，单段虚线长度，默认4
  gridColor: string		    //分割线颜色，默认#CCCCCC
  boxPadding: number		    //提示窗边框填充距离，默认3
  fontSize: number		      //提示窗字体大小配置，默认13
  lineHeight: number		    //提示窗文字行高，默认20
  fontColor: string		    //提示窗内的文字颜色，默认#FFFFFF
  legendShow: boolean		  //是否显示左侧图例，默认true
  legendShape: 'auto'|'diamond'|'circle'|'triangle'|'square'|'rect'|'line'		//图例形状，默认auto。图例标识样式，有效值为 auto自动跟随图例, diamond◆, circle●, triangle▲, square■, rect▬, line-
  splitLine:	boolean	      //是否显示垂直竖线，默认true
  horizentalLine: boolean	//是否显示水平横线，默认false
  xAxisLabel: boolean	    //是否显示X轴数据标签，默认false
  yAxisLabel: boolean	    //是否显示Y轴数据标签，默认false
  labelBgColor: string		  //数据标签背景颜色，默认#FFFFFF
  labelBgOpacity: number		//数据标签背景颜色透明度，默认0.7
  labelFontColor: string		//数据标签文字颜色，默认#666666
}

/**
 * 标记线配置
 */
export interface MarkLineOptions {
  type: 'solid'|'dash'     //标记线线型，可选值：'solid'实线,'dash'虚线，默认solid
  dashLength: number       //单段虚线长度，默认4
  data: Array<Partial<MarkLineData>>
}
export interface MarkLineData {
  value:	number	        //标记线数值，默认0
  labelText: string		  //自定义标签显示文字，定义后上面值无效
  lineColor: string	    //标记线颜色，默认#DE4A42
  showLabel:	boolean	    //是否在相应坐标轴上显示数据标签，默认false
  labelAlign: 'left'|'right'	  //标签相对图表区域显示位置
  labelOffsetX: number	  //标签水平位置偏移距离，默认0
  labelOffsetY: number	  //标签垂直位置偏移距离，默认0
  labelPadding: number	  //标签边框内填充距离，默认6
  labelFontSize:	number	//数据标签字体大小，默认13
  labelFontColor: string	//数据标签文字颜色，默认#666666
  labelBgColor: string		//数据标签背景颜色，默认#DFE8FF
  labelBgOpacity: number	//数据标签背景颜色透明度，默认0.8

  [key: string]: any;  //yAxisIndex
}
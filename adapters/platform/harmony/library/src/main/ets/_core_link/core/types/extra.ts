
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
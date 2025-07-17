本文件对应 core/types/extra.ts，自动整理生成。

# extra.ts 类型说明

本文件定义了 UCharts 支持的所有图表类型的扩展配置项。

## Extra（扩展配置总接口）
- `tooltip?: Partial<TooltipOptions>` 提示框配置
- `markLine?: Partial<MarkLineOptions>` 标记线配置
- `column?: Partial<ColumnExtra>` 柱状图扩展配置
- `mount?: Partial<MountExtra>` 山峰图扩展配置
- `bar?: Partial<BarExtra>` 条状图扩展配置
- `line?: Partial<LineExtra>` 折线图扩展配置
- `area?: Partial<AreaExtra>` 区域图扩展配置
- `bubble?: Partial<BubbleExtra>` 气泡图扩展配置
- `mix?: Partial<MixExtra>` 混合图扩展配置
- `pie?: Partial<PieExtra>` 饼图扩展配置
- `ring?: Partial<RingExtra>` 圆环图扩展配置
- `rose?: Partial<RoseExtra>` 玫瑰图扩展配置

## 各图表扩展配置接口

### ColumnExtra（柱状图扩展配置）
- `type: 'group'|'stack'|'meter'` 柱状图类型
- `width: number` 柱宽
- `seriesGap: number` 系列间距
- `categoryGap: number` 类目间距
- `barBorderCircle: boolean` 是否半圆边框
- `barBorderRadius: [number,number,number,number]` 四角半径
- `linearType: 'none'|'opacity'|'custom'` 渐变类型
- `linearOpacity: number` 渐变透明度
- `customColor: string[]` 自定义渐变色
- `colorStop: number` 渐变色显示比例
- `meterBorder: number` 温度计边框宽度
- `meterFillColor: string` 温度计空余填充色
- `activeBgColor: string` 激活背景色
- `activeBgOpacity: number` 激活背景透明度
- `labelPosition: 'outside'|'insideTop'|'center'|'bottom'` 数据标签位置

### MountExtra（山峰图扩展配置）
- `type: 'mount'|'sharp'|'triangle'|'bar'` 山峰图类型
- `widthRatio: number` 宽度比例
- `borderWidth: number` 边框宽度
- `barBorderCircle: boolean` 柱状图顶部圆角
- `barBorderRadius: [number,number,number,number]` 顶部圆角半径
- `linearType: 'none'|'opacity'|'custom'` 渐变类型
- `linearOpacity: number` 渐变透明度
- `customColor: string[]` 自定义渐变色
- `colorStop: number` 渐变色显示比例
- `labelPosition: 'outside'|'insideTop'|'center'|'bottom'` 数据标签位置

### BarExtra（条状图扩展配置）
- `type: 'group'|'stack'` 条状图类型
- `width: number` 条宽
- `seriesGap: number` 系列间距
- `categoryGap: number` 类目间距
- `barBorderCircle: boolean` 是否半圆边框
- `barBorderRadius: [number,number,number,number]` 四角半径
- `linearType: 'none'|'opacity'|'custom'` 渐变类型
- `linearOpacity: number` 渐变透明度
- `customColor: string[]` 自定义渐变色
- `colorStop: number` 渐变色显示比例
- `activeBgColor: string` 激活背景色
- `activeBgOpacity: number` 激活背景透明度
- `meterBorder: number` 温度计边框宽度
- `meterFillColor: string` 温度计空余填充色

### LineExtra（折线图扩展配置）
- `type: 'straight'|'curve'|'step'` 折线图类型
- `width: number` 线宽
- `activeType: 'none'|'hollow'|'solid'` 激活点类型
- `linearType: 'none'|'custom'` 渐变类型
- `onShadow: boolean` 是否开启阴影
- `animation: 'vertical'|'horizontal'` 动画方向

### AreaExtra（区域图扩展配置）
- `type: 'straight'|'curve'|'step'` 区域图类型
- `opacity: number` 区域透明度
- `addLine: boolean` 是否叠加折线
- `width: number` 叠加折线宽度
- `gradient: boolean` 是否开启区域渐变色
- `activeType: 'none'|'hollow'|'solid'` 激活点类型

### BubbleExtra（气泡图扩展配置）
- `border: number` 气泡边框宽度
- `opacity: number` 气泡内部透明度

### MixExtra（混合图扩展配置）
- `column: Partial<MixColumnExtra>` 柱状图混合扩展
- `area: Partial<MixAreaExtra>` 区域图混合扩展
- `line: Partial<MixLineExtra>` 折线图混合扩展

#### MixColumnExtra
- `width: number` 柱宽
- `seriesGap: number` 系列间距
- `categoryGap: number` 类目间距
- `barBorderCircle: boolean` 是否半圆边框
- `barBorderRadius: [number,number,number,number]` 四角半径
- `linearType: 'none'|'opacity'|'custom'` 渐变类型
- `linearOpacity: number` 渐变透明度
- `customColor: string[]` 自定义渐变色
- `colorStop: number` 渐变色显示比例

#### MixAreaExtra
- `gradient: boolean` 是否开启渐变色
- `opacity: number` 区域透明度

#### MixLineExtra
- `width: number` 线宽

### PieExtra（饼图扩展配置）
- `activeOpacity: number` 激活透明度
- `activeRadius: number` 激活宽度
- `offsetAngle: number` 起始角度偏移
- `customRadius: number` 自定义半径
- `labelWidth: number` 标签到外圆连线长度
- `border: boolean` 是否绘制分割线
- `borderWidth: number` 分割线宽度
- `borderColor: string` 分割线颜色
- `linearType: 'none'|'custom'` 渐变类型
- `customColor: string[]` 自定义渐变色

### RingExtra（圆环图扩展配置）
- `ringWidth: number` 圆环宽度
- `centerColor: string` 中心填充色
- `activeOpacity: number` 激活透明度
- `activeRadius: number` 激活宽度
- `offsetAngle: number` 起始角度偏移
- `customRadius: number` 自定义半径
- `labelWidth: number` 标签到外圆连线长度
- `border: boolean` 是否绘制分割线
- `borderWidth: number` 分割线宽度
- `borderColor: string` 分割线颜色
- `linearType: 'none'|'custom'` 渐变类型
- `customColor: string[]` 自定义渐变色

### RoseExtra（玫瑰图扩展配置）
- `type: 'area'|'radius'` 玫瑰图样式
- `minRadius: number` 最小半径
- `activeOpacity: number` 激活透明度
- `activeRadius: number` 激活宽度
- `offsetAngle: number` 起始角度偏移
- `labelWidth: number` 标签到外圆连线长度
- `border: boolean` 是否绘制分割线
- `borderWidth: number` 分割线宽度
- `borderColor: string` 分割线颜色
- `linearType: 'none'|'custom'` 渐变类型
- `customColor: string[]` 自定义渐变色

### TooltipOptions（提示窗配置）
- 详见源码注释，支持 showBox、showArrow、showCategory、borderWidth、borderRadius、borderColor、borderOpacity、bgColor、bgOpacity、gridType、dashLength、gridColor、boxPadding、fontSize、lineHeight、fontColor、legendShow、legendShape、splitLine、horizentalLine、xAxisLabel、yAxisLabel、labelBgColor、labelBgOpacity、labelFontColor 等。

### MarkLineOptions（标记线配置）
- 详见源码注释，支持 type、dashLength、data（数组，见 MarkLineData）。

---

## 说明
如需详细字段说明，请参考 core/types/extra.ts 源码注释。 
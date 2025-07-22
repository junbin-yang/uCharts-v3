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
- `radar?: Partial<RadarExtra>` 雷达图扩展配置
- `word?: Partial<WordExtra>` 词云图扩展配置
- `arcbar?: Partial<ArcBarExtra>` 进度条图扩展配置
- `gauge?: Partial<GaugeExtra>` 仪表盘图扩展配置

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

### RadarExtra（雷达图扩展配置）
- `gridType: 'radar'|'circle'` 雷达图网格类型
- `gridColor: string` 网格颜色
- `gridCount: number` 网格数量
- `gridEval: number` 数据点位网格抽稀
- `radius: number` 自定义半径
- `axisLabel: boolean` 是否显示刻度点值
- `axisLabelTofix: number` 刻度点值小数位数
- `labelShow: boolean` 是否显示各项标识文案
- `labelColor: string` 标识文案颜色
- `labelPointShow: boolean` 是否显示末端刻度圆点
- `labelPointRadius: number` 刻度圆点半径
- `labelPointColor: string` 刻度圆点颜色
- `opacity: number` 主图区域透明度
- `border: boolean` 是否绘制主图区域描边
- `borderWidth: number` 描边宽度
- `max: number` 数据最大值
- `linearType: 'none'|'custom'` 渐变类型
- `customColor: string[]` 自定义渐变色

### WordExtra（词云图扩展配置）
- `type: 'normal'|'vertical'` 词云图样式

### ArcBarExtra（进度条图扩展配置）
- `type: 'default'|'circle'` 圆弧进度图样式
- `direction: 'cw'|'ccw'` 动画方向
- `width: number` 圆弧进度图弧线宽度
- `lineCap: 'round'|'square'|'butt'` 进度条两端样式
- `backgroundColor: string` 背景颜色
- `startAngle: number` 起始角度（0-2）
- `endAngle: number` 结束角度（0-2）
- `radius: number` 自定义半径
- `gap: number` 间隔
- `centerX: number` 自定义圆心x坐标
- `centerY: number` 自定义圆心y坐标
- `linearType: 'none'|'custom'` 渐变类型
- `customColor: string[]` 自定义渐变色

### GaugeExtra（仪表盘图扩展配置）
- `type: 'default'|'progress'` 仪表盘样式
- `width: number` 坐标轴线宽度
- `labelColor: string` 刻度尺标签文字颜色
- `labelOffset: number` 标签文字径向偏移距离
- `startAngle: number` 起始角度（0-2）
- `endAngle: number` 结束角度（0-2）
- `startNumber: number` 起始数值
- `endNumber: number` 结束数值
- `formatter: (val, index, opts) => string` 数据标签自定义
- `splitLine: Partial<GaugeExtraSplitLine>` 刻度线配置
- `pointer: Partial<GaugeExtraPointer>` 指针配置

#### GaugeExtraSplitLine
- `fixRadius: number` 刻度线径向偏移量
- `splitNumber: number` 刻度线分段总数量
- `width: number` 分割线长度
- `color: string` 分割线颜色
- `childNumber: number` 子刻度线数量
- `childWidth: number` 子刻度线长度

#### GaugeExtraPointer
- `width: number` 指针宽度
- `color: string` 指针颜色

### TooltipOptions（提示窗配置）
- 详见源码注释。

### MarkLineOptions（标记线配置）
- 详见源码注释。

---

## 说明
如需详细字段说明，请参考 core/types/extra.ts 源码注释。 
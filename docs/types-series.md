本文件对应 core/types/series.ts，自动整理生成。

# series.ts 类型说明

本文件定义了 UCharts 支持的所有图表类型的数据系列结构。

## Series（数据系列联合类型）
Series 是所有图表类型的数据系列的联合类型，包括：
- ColumnSeries：柱状图数据系列
- MountSeries：山峰图数据系列
- BarSeries：条状图数据系列
- LineSeries：折线图数据系列
- AreaSeries：区域图数据系列
- ScatterSeries：散点图数据系列
- BubbleSeries：气泡图数据系列
- MixedSeries：混合图表数据系列
- PieSeries：饼图数据系列
- RingSeries：圆环图数据系列
- RoseSeries：玫瑰图数据系列
- RadarSeries：雷达图数据系列
- WordSeries：词云图数据系列
- ArcBarSeries：进度条图数据系列
- GaugeSeries：仪表盘图数据系列
- NameAndValueData：名称-数值数据结构

---

## 各 Series 类型字段说明

### ColumnSeries（柱状图数据系列）
- data：Array<SeriesDataItem>，数据值，支持 number、number[]、ValueAndColorData、null、对象等
- 继承 BaseSeries 通用字段

### MountSeries（山峰图数据系列）
- data：Array<NameAndValueData>，数据值，包含 name 和 value
- 继承 BaseSeries 通用字段

### BarSeries（条状图数据系列）
- data：Array<number>，数据值
- 继承 BaseSeries 通用字段

### LineSeries（折线图数据系列）
- data：Array<number|null> 或 Array<[number, number]>，数据值
- connectNulls：boolean，断点续连，跳过 null 点
- setShadow：[number, number, number, string]，阴影配置 [offsetX,offsetY,blur,color]
- linearColor：Array<[number, string]>，渐变色数组
- lineType：string，折线线型，可选值：'solid' 实线，'dash' 虚线
- dashLength：number，虚线长度
- 继承 BaseSeries 通用字段

### AreaSeries（区域图数据系列）
- data：Array<number|[number,number]>，数据值
- connectNulls：boolean，断点续连
- lineType：string，折线线型
- dashLength：number，虚线长度
- 继承 BaseSeries 通用字段

### ScatterSeries（散点图数据系列）
- data：Array<[number,number]>，数据值
- 继承 BaseSeries 通用字段

### BubbleSeries（气泡图数据系列）
- data：Array<[number,number,number,string]>，数据值
- 继承 BaseSeries 通用字段

### MixedSeries（混合图表数据系列）
- index：number，多维数据结构索引值
- data：Array<SeriesDataItem>，数据值
- type：'point'|'line'|'column'|'area'，混合图表形态
- disableLegend：boolean，禁止显示ToolTip图例
- style：'curve'|'straight'，折线/区域图样式
- addPoint：boolean，是否增加标记点
- 继承 BaseSeries 通用字段

### PieSeries / RingSeries / RoseSeries（饼图/圆环图/玫瑰图数据系列）
- data：Array<HasLabelSeriesData>，数据值
- 继承 BaseSeries 通用字段

### RadarSeries（雷达图数据系列）
- data：Array<number>，数据值
- 继承 BaseSeries 通用字段

### WordSeries（词云图数据系列）
- 继承 BaseSeries 通用字段

### ArcBarSeries（进度条图数据系列）
- data：number，数据值
- 继承 BaseSeries 通用字段

### GaugeSeries（仪表盘图数据系列）
- data：number，数据值
- 继承 BaseSeries 通用字段

### HasLabelSeriesData
- name：string，名称
- value：number，数值
- labelText：string，自定义标签文字
- labelShow：boolean，是否显示标签，默认 true
- 继承 BaseSeries 通用字段

### NameAndValueData
- name：string，名称
- value：number，数值
- 继承 BaseSeries 通用字段

### ValueAndColorData
- value：number，数值
- color：string，颜色

### SeriesDataItem
- 支持 number、number[]、ValueAndColorData、null、Record<string, number> 等多种数据结构

### BaseSeries（所有系列通用字段）
- name：string，数据名称
- legendText：string，自定义图例显示文字（不传默认显示 name）
- show：boolean，图形显示状态，默认 true
- color：string，图形颜色
- textColor：string，数据标签文字颜色
- textSize：number，数据标签字体大小
- textOffset：number，数据标签偏移距离
- linearIndex：number，渐变色索引
- pointShape：'diamond' | 'circle' | 'triangle' | 'square' | 'none'，数据点标识样式
- legendShape：'diamond' | 'circle' | 'triangle' | 'square' | 'rect' | 'line' | 'none'，图例标识样式
- formatter：function，格式化函数 (value, index, series, opts) => string
- ... 其他自定义字段

---

如需详细字段说明，请参考 core/types/series.ts 源码注释。 
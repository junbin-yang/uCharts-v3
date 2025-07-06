本文件对应 core/types/series.ts，自动整理生成。

# series.ts 类型说明

本文件定义了 UCharts 支持的所有图表类型的数据系列结构。

## Series（数据系列联合类型）

Series 是所有图表类型的数据系列的联合类型，包括：
- NameAndValueData
- ColumnSeries
- MountSeries
- BarSeries
- LineSeries

## ColumnSeries（柱状图数据系列）
- `data: Array<SeriesDataItem>` 数据值，支持 number、number[]、ValueAndColorData、null、对象等

## MountSeries（山峰图数据系列）
- `data: Array<NameAndValueData>` 数据值，包含 name 和 value

## BarSeries（条状图数据系列）
- `data: Array<number>` 数据值

## LineSeries（折线图数据系列）
- `data: Array<number|null>|Array<[number, number]>` 数据值
- `connectNulls?: boolean` 断点续连，跳过 null 点
- `setShadow?: [number, number, number, string]` 阴影配置 [offsetX, offsetY, blur, color]
- `linearColor?: Array<[number, string]>` 渐变色数组
- `lineType?: string` 线型，'solid' 实线，'dash' 虚线
- `dashLength?: number` 虚线长度

## NameAndValueData
- `name: string` 名称
- `value: number` 数值

## ValueAndColorData
- `value: number` 数值
- `color: string` 颜色

## BaseSeries（基础系列）
- `name?: string` 数据名称
- `legendText?: string` 自定义图例显示文本
- `show?: boolean` 是否显示
- `color?: string` 颜色
- `textColor?: string` 数据标签颜色
- `textSize?: number` 数据标签字体大小
- `textOffset?: number` 数据标签偏移
- `linearIndex?: number` 渐变色索引
- `pointShape?: 'diamond' | 'circle' | 'triangle' | 'square' | 'none'` 数据点形状
- `legendShape?: 'diamond' | 'circle' | 'triangle' | 'square' | 'rect' | 'line' | 'none'` 图例形状
- `formatter?: (value, index, series, opts) => string` 格式化函数 

# 数据系列类型定义

## 系列联合类型

### Series
所有图表类型的数据系列联合类型
```typescript
export type Series =
    | ColumnSeries
    | MountSeries
    | BarSeries
    | LineSeries
    | AreaSeries
    | ScatterSeries
    | BubbleSeries
    | NameAndValueData   // use fixPieSeries
```

## 数据项类型

### SeriesDataItem
柱状图数据系列项类型
```typescript
export type SeriesDataItem = number|number[]|ValueAndColorData|null|Record<string, number>
```

### ValueAndColorData
带颜色值的数据
```typescript
export interface ValueAndColorData {
  value: number
  color: string
}
```

### NameAndValueData
带名称和值的数据
```typescript
export interface NameAndValueData extends BaseSeries {
  name: string
  value: number
  [key: string]: any
}
```

## 基础系列接口

### BaseSeries
基础系列配置
```typescript
interface BaseSeries {
  name?: string         // 数据名称
  legendText?: string   // 自定义图例显示文字（不传默认显示上面的name值）
  show?: boolean        // 图形显示状态，配合点击图例显示状态，也可默认指定是否显示。默认true
  color?: string        // 图形颜色，例如#7cb5ec 不传入则使用系统默认配色方案
  textColor?: string    // 图形上方标注文字的颜色（datalabel文字颜色），例如#7cb5ec 不传入则使用系统默认配色方案
  textSize?: number     // 图形上方标注文字的字体大小
  textOffset?: number   // 图形上方标注文字的偏移距离，负数为向上偏移，正数向下偏移
  linearIndex?: number  // 渐变色索引，用于对应extra配置中的渐变色数组下标，默认为当前series数组的下标
  pointShape?: 'diamond' | 'circle' | 'triangle' | 'square' | 'none'  // 数据点标识样式，可选值为diamond◆, circle●, triangle▲, square■, none 无
  legendShape?: 'diamond' | 'circle' | 'triangle' | 'square' | 'rect' | 'line' | 'none'  // 图例标识样式，有效值为diamond◆, circle●, triangle▲, square■, rect▬, line-, none 无
  formatter?: (value: number|string, index: number, series: Series, opts?: ChartOptions) => string
  [key: string]: any
}
```

## 具体图表系列类型

### ColumnSeries
柱状图数据系列
```typescript
export interface ColumnSeries extends BaseSeries {
  data: Array<SeriesDataItem>  // 数据值，如果传入null图表该处出现断点
}
```

### MountSeries
山峰图数据系列
```typescript
export interface MountSeries extends BaseSeries {
  data: Array<NameAndValueData>  // 数据值
}
```

### BarSeries
条状图数据系列
```typescript
export interface BarSeries extends BaseSeries {
  data: Array<number>  // 数据值
}
```

### LineSeries
折线图数据系列
```typescript
export interface LineSeries extends BaseSeries {
  data: Array<number|null>|Array<[number, number]>   // 数据值
  connectNulls?: boolean                         // 断点续连，即跳过null的点位直接连到下个点位。默认false
  setShadow?: [number, number, number, string]   // 阴影配置，格式为4位数组：[offsetX,offsetY,blur,color]
  linearColor?: Array<[number, string]>          // 渐变色数组，格式为2维数组[起始位置，颜色值]，例如[[0,'#0EE2F8'],[0.3,'#2BDCA8'],[0.6,'#1890FF'],[1,'#9A60B4']]
  lineType?: string                              // 折线线型，可选值：'solid'为实线,'dash'为虚线，默认solid
  dashLength?: number                            // 折线为虚线时，单段虚线长度，默认8
}
```

### AreaSeries
区域图数据系列
```typescript
export interface AreaSeries extends BaseSeries {
  data: Array<number|[number,number]>             // 数据值
  connectNulls?: boolean                          // 断点续连，即跳过null的点位直接连到下个点位。默认false
  lineType?: string                              // 折线线型，可选值：'solid'为实线,'dash'为虚线，默认solid
  dashLength?: number                            // 折线为虚线时，单段虚线长度，默认8
}
```

### ScatterSeries
散点图数据系列
```typescript
export interface ScatterSeries extends BaseSeries {
  data: Array<[number,number]>       // 数据值
}
```

### BubbleSeries
气泡图数据系列
```typescript
export interface BubbleSeries extends BaseSeries {
  data: Array<[number,number,number,string]>       // 数据值
}
``` 
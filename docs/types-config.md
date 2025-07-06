本文件对应 core/types/config.ts，自动整理生成。

# 图表配置类型定义

## ChartsConfig 类

图表配置类，包含所有默认配置项

```typescript
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
  color: Array<string> = ['#1890FF', '#91CB74', '#FAC858', '#EE6666', '#73C0DE', '#3CA272', '#FC8452', '#9A60B4', '#ea7ccc']
  
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
```

## 全局配置

### GlobalConfig
全局配置实例
```typescript
export const GlobalConfig: ChartsConfig = new ChartsConfig()
```

### setGlobalConfig
设置全局配置的函数
```typescript
export const setGlobalConfig = (val: Partial<ChartsConfig>) => {
  ChartsUtil.objectAssign(GlobalConfig, val)
}
```

## 配置项说明

### 基础配置
- `fontUnit`: 字体单位，支持 'vp'|'px'|'lpx'|'fp'，默认 'vp'
- `fontSize`: 默认字体大小，默认 13
- `fontColor`: 默认字体颜色，默认 '#666666'
- `background`: 背景色，默认 "#FFFFFF"
- `duration`: 动画展示时长，单位毫秒，默认 1000
- `rotate`: 是否旋转屏幕，默认 false
- `padding`: 画布填充边距，默认 [10, 10, 10, 10]

### 轴配置
- `yAxisWidth`: Y轴基准宽度，默认 50
- `xAxisHeight`: X轴基准宽度，默认 74

### 样式配置
- `dataPointShape`: 数据点形状数组，默认 ['circle', 'circle', 'circle', 'circle']
- `color`: 主题颜色数组，默认包含9种颜色
- `linearColor`: 线条颜色数组，默认包含9种颜色

### 特殊图表配置
- `pieChartLinePadding`: 饼图文本与线条填充间隔，默认 15
- `pieChartTextPadding`: 饼图文本填充间隔，默认 5
- `titleFontSize`: 主标题字体大小，默认 20
- `subtitleFontSize`: 副标题字体大小，默认 15
- `radarLabelTextMargin`: 雷达图标签文本边距，默认 13 
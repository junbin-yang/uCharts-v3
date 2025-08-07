# UCharts 微信小程序可视化图表库

UCharts 是一款类型丰富、高性能、可扩展、支持主题定制的图表库，现已适配 微信小程序 平台。支持多种常用图表类型，满足微信应用的数据可视化需求。

## 特性

- 🧩 **模块化设计**：底层渲染与平台适配解耦，易于扩展和维护
- 🛡️ **TypeScript 全面支持**：类型安全，开发体验优秀
- 🎨 **丰富图表类型**：柱状图、条状图、折线图、区域图、山峰图等
- ⚡ **高性能渲染**：底层优化，动画流畅
- 🔌 **易于扩展**：支持自定义图表类型和平台适配
- 🍭 **自定义样式**：支持主题定制
- 📦 **开箱即用** - 提供自定义组件，直接引入使用

## 安装

```bash
npm install wx-ucharts-v3
```

## 快速开始

### 1. 复制组件到项目

将npm包中的组件复制到你的小程序项目：

```bash
# 复制组件到小程序项目
cp -r node_modules/wx-ucharts-v3/components/ucharts ./components/
```

### 2. 引入自定义组件

在页面的 `json` 文件中引入组件：

```json
{
  "usingComponents": {
    "ucharts": "../../components/ucharts/ucharts"
  }
}
```

### 3. 在页面中使用组件

```xml
<ucharts 
  id="mychart" 
  canvas-id="mychart" 
  chart-data="{{chartData}}"
  width="{{750}}" 
  height="{{500}}">
</ucharts>
```

### 4. 在页面JS中配置图表数据

```javascript
Page({
  data: {
    chartData: {
      type: 'line',
      categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
      series: [{
        name: '销售额',
        data: [35, 20, 25, 10, 12, 40]
      }],
      // 其他图表配置...
      animation: true,
      background: '#FFFFFF',
      color: ['#1890FF', '#91CB74', '#FAC858'],
      padding: [15, 15, 0, 15],
      legend: {},
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        gridType: 'dash'
      },
      extra: {
        line: {
          type: 'straight',
          width: 2
        }
      }
    }
  },

  onLoad() {
    // 页面加载时图表会自动渲染
  },

  // 动态更新图表数据
  updateChart() {
    this.setData({
      chartData: {
        ...this.data.chartData,
        series: [{
          name: '销售额',
          data: [45, 30, 35, 20, 22, 50] // 新数据
        }]
      }
    });
  }
});
```

## 组件属性

### ucharts 组件支持的属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| canvas-id | String | - | Canvas的唯一标识符 |
| chart-data | Object | - | 图表配置数据对象 |
| width | Number | 375 | 图表宽度（rpx） |
| height | Number | 250 | 图表高度（rpx） |
| disable-scroll | Boolean | false | 禁用图表滚动 |
| enable-tooltip | Boolean | true | 启用提示框 |

### chart-data 配置对象

```javascript
{
  type: 'line',              // 图表类型
  categories: [],            // X轴分类数据
  series: [],               // 数据系列
  animation: true,          // 是否启用动画
  background: '#FFFFFF',    // 背景色
  color: [],               // 颜色数组
  padding: [15,15,0,15],   // 内边距 [上,右,下,左]
  legend: {},              // 图例配置
  xAxis: {},               // X轴配置
  yAxis: {},               // Y轴配置
  extra: {}                // 额外配置
}
```

## API 文档

详见[文档](https://github.com/junbin-yang/uCharts-v3/tree/master/docs)目录。

### 组件事件

组件会自动处理图表的渲染和交互，无需手动调用API。当`chart-data`属性发生变化时，组件会自动重新渲染图表。

## 支持的图表类型

- 📊 **柱状图** (column) - 垂直柱状图表
- 📈 **折线图** (line) - 数据趋势展示
- 📉 **区域图** (area) - 填充区域的折线图
- 📊 **条状图** (bar) - 水平条状图表
- 🏔️ **山峰图** (mount) - 山峰样式图表
- 🔵 **散点图** (scatter) - 数据点分布图
- 🫧 **气泡图** (bubble) - 带大小的散点图
- 🎯 **混合图** (mix) - 多种图表类型组合
- 🥧 **饼状图** (pie) - 圆形数据占比图
- 🍩 **圆环图** (ring) - 环形数据占比图
- 🌹 **玫瑰图** (rose) - 极坐标饼图
- 🕸️ **雷达图** (radar) - 多维数据对比
- 📊 **进度条** (arcbar) - 弧形进度显示
- ⏲️ **仪表盘** (gauge) - 仪表盘样式图表
- 🔻 **漏斗图** (funnel) - 转化流程图表
- 📈 **K线图** (candle) - 股票价格图表
- 🗺️ **地图** (map) - 地理数据可视化
- ☁️ **词云图** (word) - 文字云展示
- 🔥 **热力图** (heatmap) - 数据密度图

## 项目结构

```
adapters/platform/wechat/
├── canvas-adapter.ts      # Canvas上下文适配器
├── canvas-renderer.ts     # 图表渲染器
├── index.ts              # 入口文件
├── components/           # 微信小程序自定义组件
│   └── ucharts/
│       ├── ucharts.js    # 组件逻辑
│       ├── ucharts.wxml  # 组件模板
│       └── ucharts.json  # 组件配置
├── package.json          # 包配置
├── tsconfig.json         # TypeScript配置
├── rollup.config.js      # 构建配置
└── README.md            # 说明文档
```

## 构建

```bash
# 安装依赖
npm install

# 构建
npm run build

# 清理
npm run clean
```

构建后的文件位于 `../../dist/wechat/` 目录：

- `wx-ucharts-v3.js` - UMD格式，用于直接引入
- `wx-ucharts-v3.min.js` - 压缩版本
- `wx-ucharts-v3.esm.js` - ES模块格式
- `types/` - TypeScript类型定义文件

## 示例项目

完整的示例项目位于 `examples/wechat/` 目录，包含：

- 基础图表展示
- 触摸交互演示
- 数据更新示例

## 注意事项

1. **Canvas API差异** - 微信小程序的Canvas API与标准Canvas API存在差异，适配器已处理这些差异
2. **字体单位** - 微信小程序使用 `px` 作为字体单位，适配器会自动设置
3. **触摸事件** - 需要在页面中正确绑定触摸事件处理函数
4. **像素比** - 建议根据设备像素比设置Canvas尺寸以获得清晰显示

## 兼容性

- 微信小程序基础库 2.9.0+
- 支持Canvas 2D API的微信小程序版本

## 许可证

本项目采用 **Apache License 2.0** 开源协议。

- 允许自由使用、修改、分发和商业应用
- 需保留原始版权声明和许可证文件
- 详细条款请见根目录 LICENSE 文件

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持所有UCharts图表类型
- 完整的微信小程序Canvas API适配
- 触摸事件支持
- TypeScript类型定义
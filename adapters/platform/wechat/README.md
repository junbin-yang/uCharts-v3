# UCharts 微信小程序可视化图表组件

UCharts 是一款类型丰富、高性能、可扩展、支持主题定制的图表库，现已适配 微信小程序 平台。支持多种常用图表类型，满足微信应用的数据可视化需求。

## 特性

- 🧩 **模块化设计**：底层渲染与平台适配解耦，易于扩展和维护
- 🛡️ **TypeScript 全面支持**：类型安全，开发体验优秀
- 🎨 **丰富图表类型**：柱状图、条状图、折线图、区域图、山峰图等
- ⚡ **高性能渲染**：底层优化，动画流畅
- 🔌 **易于扩展**：支持自定义图表类型和平台适配
- 🍭 **自定义样式**：支持主题定制
- 📦 **开箱即用**：提供自定义组件，直接引入使用
- 🔄 **状态管理**：内置加载状态管理
- ❌ **重试机制**：内置错误处理和重试机制

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

### 3. 基础用法

在页面的 `.wxml` 文件中使用组件：

```xml
<ucharts 
  type="line" 
  canvas2d="{{true}}" 
  opts="{{opts}}" 
  chartData="{{chartData}}" 
  bindcomplete="complete"
/>
```

在页面的 `.js` 文件中定义数据：

```javascript
Page({
  data: {
    chartData: {
      categories: ['一月', '二月', '三月', '四月', '五月', '六月'],
      series: [{
        name: '销售额',
        data: [35, 20, 25, 10, 15, 30]
      }]
    }
  },

  complete(e) {
    console.log(e);
  }
});
```


## 属性配置

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| type | String | null | 是 | 图表类型，支持：pie、ring、rose、word、funnel、map、arcbar、line、column、bar、area、radar、gauge、candle、mix、tline、tarea、scatter、bubble、demotype |
| canvasId | String | 'uchartsid' | 否 | Canvas元素ID，如为默认值会自动生成32位随机ID |
| canvas2d | Boolean | false | 否 | 是否启用Canvas 2D模式 |
| background | String | 'rgba(0,0,0,0)' | 否 | 图表背景色 |
| animation | Boolean | true | 否 | 是否启用动画效果 |
| chartData | Object | {categories: [], series: []} | 否 | 图表数据，包含categories和series |
| localdata | Array | [] | 否 | 本地数据源，可替代chartData使用 |
| opts | Object | {} | 否 | 图表配置选项，会与默认配置合并 |
| loadingType | String | 'skeleton' | 否 | 加载动画类型：skeleton、spinner、pulse、dots |
| loadingText | String | '加载图表数据...' | 否 | 加载提示文本 |
| errorShow | Boolean | true | 否 | 是否显示错误信息 |
| errorReload | Boolean | true | 否 | 是否允许错误重试 |
| errorMessage | String | null | 否 | 自定义错误信息 |
| inScrollView | Boolean | false | 否 | 是否在scroll-view组件内 |
| reshow | Boolean | false | 否 | 重新显示图表 |
| reload | Boolean | false | 否 | 重新加载图表 |
| disableScroll | Boolean | false | 否 | 禁用Canvas滚动 |
| optsWatch | Boolean | true | 否 | 是否监听opts变化 |
| onzoom | Boolean | false | 否 | 是否启用双指缩放 |
| ontap | Boolean | true | 否 | 是否启用点击事件 |
| ontouch | Boolean | false | 否 | 是否启用触摸事件 |
| onmovetip | Boolean | false | 否 | 是否启用移动提示 |
| tooltipShow | Boolean | true | 否 | 是否显示工具提示 |
| tooltipFormat | String | undefined | 否 | 工具提示格式化函数名 |
| tooltipCustom | Object | undefined | 否 | 自定义工具提示配置 |
| pageScrollTop | Number | 0 | 否 | 页面滚动距离 |
| tapLegend | Boolean | true | 否 | 是否启用图例点击 |

## 事件回调

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| bind:complete | 图表渲染完成 | { type: "complete", complete: true, id: canvasId } |
| bind:error | 图表错误 | { type: "error", errorShow: boolean, msg: string, id: canvasId } |
| bind:getIndex | 点击获取数据索引 | { type: "getIndex", event: {x, y}, currentIndex: number, legendIndex: number, id: canvasId, opts: object } |
| bind:getTouchStart | 触摸开始 | { type: "touchStart", event: touchArray, id: canvasId } |
| bind:getTouchMove | 触摸移动 | { type: "touchMove", event: touchArray, id: canvasId } |
| bind:getTouchEnd | 触摸结束 | { type: "touchEnd", event: touchArray, id: canvasId } |
| bind:scrollLeft | 图表左滑到边界 | { type: "scrollLeft", scrollLeft: true, id: canvasId } |
| bind:scrollRight | 图表右滑到边界 | { type: "scrollRight", scrollRight: true, id: canvasId } |


## 使用场景

### 1. 基础图表

```xml
<ucharts 
  type="line"
  canvasId="basic-chart"
  canvas2d="{{true}}"
  chartData="{{chartData}}"
  bindcomplete="onComplete"
/>
```

### 2. 使用本地数据源

```xml
<ucharts 
  type="column"
  canvasId="local-chart"
  localdata="{{localChartData}}"
  opts="{{chartOpts}}"
  bindcomplete="onComplete"
/>
```

### 3. 启用交互功能

```xml
<ucharts 
  type="pie"
  canvasId="interactive-chart"
  chartData="{{chartData}}"
  ontap="{{true}}"
  ontouch="{{true}}"
  tapLegend="{{true}}"
  bindgetIndex="onGetIndex"
  bindgetTouchStart="onTouchStart"
  bindcomplete="onComplete"
/>
```

### 4. 自定义加载和错误处理

```xml
<ucharts 
  type="bar"
  canvasId="custom-chart"
  chartData="{{chartData}}"
  loadingType="spinner"
  loadingText="数据加载中..."
  errorShow="{{true}}"
  errorReload="{{true}}"
  errorMessage="{{customErrorMsg}}"
  binderror="onError"
  bindcomplete="onComplete"
/>
```

### 5. 动态更新数据

```javascript
// 在页面 JS 中
updateChartData() {
  const newData = {
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [{
      name: '营收',
      data: [
        Math.floor(Math.random() * 100) + 50,
        Math.floor(Math.random() * 100) + 50,
        Math.floor(Math.random() * 100) + 50,
        Math.floor(Math.random() * 100) + 50
      ]
    }]
  };

  this.setData({
    chartData: newData
  });
}
```

### 6. 在滚动视图中使用

```xml
<scroll-view scroll-y="true">
  <ucharts 
    type="area"
    canvasId="scroll-chart"
    chartData="{{chartData}}"
    inScrollView="{{true}}"
    disableScroll="{{true}}"
    bindcomplete="onComplete"
  />
</scroll-view>
```

## 加载动画类型

支持的 `loadingType` 值：

- `skeleton` - 骨架屏动画（默认）
- `spinner` - 旋转加载器
- `pulse` - 脉冲动画
- `dots` - 点状加载器

## 错误处理

组件内置错误处理机制：

1. **Canvas 初始化失败**：显示错误信息和重试按钮
2. **图表创建失败**：显示具体错误信息
3. **用户重试**：点击错误区域可重新初始化图表

## 注意事项

1. **Canvas ID 唯一性**：确保每个图表组件的 `canvas-id` 在页面中唯一
2. **数据格式**：确保 `chartData` 符合 uCharts 的数据格式要求
3. **尺寸设置**：建议根据屏幕尺寸动态设置图表宽高
4. **性能优化**：避免频繁更新大量数据，可使用防抖处理

## 完整示例

```xml
<!-- 页面 WXML -->
<view class="chart-container">
  <ucharts 
    type="line"
    canvasId="sales-chart"
    canvas2d="{{true}}"
    chartData="{{salesData}}"
    opts="{{chartOpts}}"
    loadingType="skeleton"
    loadingText="正在加载销售数据..."
    ontap="{{true}}"
    ontouch="{{true}}"
    tooltipShow="{{true}}"
    bindcomplete="onComplete"
    binderror="onError"
    bindgetIndex="onGetIndex"
    bindgetTouchStart="onTouchStart"
  />
  
  <button bindtap="updateData">更新数据</button>
  <button bindtap="changeType">切换图表类型</button>
</view>
```

```javascript
// 页面 JS
Page({
  data: {
    salesData: {},
    chartOpts: {
      color: ['#1890FF', '#91CC75', '#FAC858', '#EE6666'],
      padding: [15, 15, 0, 15],
      enableScroll: false,
      legend: {
        show: true
      },
      xAxis: {
        disableGrid: false
      },
      yAxis: {
        gridType: 'dash',
        dashLength: 2
      },
      extra: {
        line: {
          type: 'curve',
          width: 2,
          activeType: 'hollow'
        }
      }
    }
  },

  onLoad() {
    // 加载数据
    this.loadChartData();
  },

  loadChartData() {
    // 模拟数据加载
    setTimeout(() => {
      this.setData({
        salesData: {
          categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
          series: [{
            name: '销售额',
            data: [35, 20, 25, 10, 15, 30]
          }, {
            name: '利润',
            data: [18, 12, 15, 8, 10, 20]
          }]
        }
      });
    }, 1000);
  },

  updateData() {
    const newData = {
      categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
      series: [{
        name: '销售额',
        data: Array.from({length: 6}, () => Math.floor(Math.random() * 50) + 10)
      }, {
        name: '利润',
        data: Array.from({length: 6}, () => Math.floor(Math.random() * 30) + 5)
      }]
    };

    this.setData({
      chartData: newData
    });
  },

  changeType() {
    const types = ['line', 'column', 'area', 'bar'];
    const currentType = this.data.type || 'line';
    const currentIndex = types.indexOf(currentType);
    const nextType = types[(currentIndex + 1) % types.length];
    
    this.setData({
      type: nextType
    });
  },

  onComplete(e) {
    console.log('图表渲染完成:', e.detail);
    wx.showToast({
      title: '图表加载完成',
      icon: 'success',
      duration: 1000
    });
  },

  onError(e) {
    console.error('图表错误:', e.detail);
    wx.showModal({
      title: '图表错误',
      content: e.detail.msg || '图表渲染失败',
      showCancel: false
    });
  },

  onGetIndex(e) {
    console.log('点击数据:', e.detail);
    const { currentIndex, legendIndex } = e.detail;
    if (currentIndex >= 0) {
      wx.showToast({
        title: `点击了第${currentIndex + 1}个数据点`,
        icon: 'none'
      });
    }
  },

  onTouchStart(e) {
    console.log('触摸开始:', e.detail);
  }
});
```

## API 文档

详见[文档](https://github.com/junbin-yang/uCharts-v3/tree/master/docs)目录。

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
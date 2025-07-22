# UCharts - 跨平台可视化图表库

## 项目简介

UCharts 是一个基于 TypeScript 实现的类型丰富、高性能、模块化、可扩展、支持主题定制的跨平台图表库。底层渲染逻辑全部采用 TypeScript 实现，上层通过适配层（adapters）适配到不同平台，包括鸿蒙（HarmonyOS）、微信小程序、uniapp 等，真正实现"一套核心，多端复用"。

## 特性

- 🚀 **跨平台**：支持鸿蒙、微信小程序、uniapp 等主流平台
- 🧩 **模块化设计**：底层渲染与平台适配解耦，易于扩展和维护
- 🛡️ **TypeScript 全面支持**：类型安全，开发体验优秀
- 🎨 **丰富图表类型**：柱状图、条状图、折线图、区域图、山峰图等
- ⚡ **高性能渲染**：底层优化，动画流畅
- 🔌 **易于扩展**：支持自定义图表类型和平台适配
- 🍭 **自定义样式**：支持主题定制

## 支持的图表类型

- **柱状图 (column)**
- **条状图 (bar)**
- **折线图 (line)**
- **区域图 (area)**
- **山峰图 (mount)**
- **散点图 (scatter)**
- **气泡图 (bubble)**
- **混合图 (mix)**
- **饼状图 (pie)**
- **环形图 (ring)**
- **玫瑰图 (rose)**
- **雷达图 (radar)**
- **词云图 (word)**
- **进度条 (arcbar)**
- **仪表盘 (gauge)**
- **更多类型持续开发中...**

## 图表示例

以下为部分图表类型的鸿蒙平台实际渲染效果：

- 柱状图
  
  ![柱状图](https://junbin-yang.github.io/uCharts-v3/docs/image/column.png) ![柱状图](https://junbin-yang.github.io/uCharts-v3/docs/image/column3.png)

- 区域图
  
  ![区域图](https://junbin-yang.github.io/uCharts-v3/docs/image/area1.png) ![区域图](https://junbin-yang.github.io/uCharts-v3/docs/image/area2.png)

- 山峰图
  
  ![山峰图](https://junbin-yang.github.io/uCharts-v3/docs/image/mount1.png) ![山峰图](https://junbin-yang.github.io/uCharts-v3/docs/image/mount2.png)

- 散点图
  
  ![散点图](https://junbin-yang.github.io/uCharts-v3/docs/image/scatter.png)

- 气泡图
  
  ![气泡图](https://junbin-yang.github.io/uCharts-v3/docs/image/bubble.png)

- 饼图
  
  ![饼图](https://junbin-yang.github.io/uCharts-v3/docs/image/piepng.png)

- 玫瑰图
  
  ![玫瑰图](https://junbin-yang.github.io/uCharts-v3/docs/image/rose.png)

- 雷达图
  
  ![雷达图](https://junbin-yang.github.io/uCharts-v3/docs/image/radar.png)

- 词云图
  
  ![词云图](https://junbin-yang.github.io/uCharts-v3/docs/image/word1.png) ![词云图](https://junbin-yang.github.io/uCharts-v3/docs/image/word2.png)

- 进度条
  
  ![进度条](https://junbin-yang.github.io/uCharts-v3/docs/image/arcbar1.png) ![进度条](https://junbin-yang.github.io/uCharts-v3/docs/image/arcbar2.png)

- 仪表盘
  
  ![仪表盘](https://junbin-yang.github.io/uCharts-v3/docs/image/gauge1.png) ![仪表盘](https://junbin-yang.github.io/uCharts-v3/docs/image/gauge2.png)

（更多类型和样式可参考 docs 目录）


## 下载安装

鸿蒙平台请查看适配目录的README.md文件，其他平台可通过[Github下载](https://github.com/junbin-yang/uCharts-v3/releases)

## 快速开始

```html
<!-- 原生H5 -->
<html lang="zh-CN">
<head>
  ....
</head>
<body>
  <canvas id="chart" width="600px" height="400px"></canvas>
  ...
  <!-- 引入构建后的uCharts库 -->
  <script src="../adapters/dist/h5/ucharts-h5.min.js"></script>
  <script language="JavaScript">
    function createLineChart() {
      const canvas = document.getElementById('chart');
      const ctx = new UCharts.H5CanvasContext(canvas.getContext("2d"));
      const chart = new UCharts({
          type: "line",
          context: ctx,
          categories: ["2018","2019","2020","2021","2022","2023"],
          series: [
              {
                  name: "成交量A",
                  data: [35,8,25,37,4,20]
              },
              {
                  name: "成交量B",
                  data: [70,40,65,100,44,68]
              },
              {
                  name: "成交量C",
                  data: [100,80,95,150,112,132]
              }
          ],
          padding: [15,10,0,15],
          xAxis: { disableGrid: true },
          yAxis: { gridType: "dash", dashLength: 2 },
          extra: {
            line: {
              type: "straight",
              width: 2,
              activeType: "hollow"
            }
          }
      });
    }
    // 页面加载完成后默认显示折线图
    window.onload = function() {
      createLineChart();
    };
  </script>
</body>
</html>
```

> 具体平台的 context 获取方式请参考各自适配层文档。

## 目录结构

```
├── core/                # 图表核心能力（平台无关）
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   ├── chart/           # 各类图表渲染器
│   ├── event/           # 事件系统
│   ├── animation/       # 动画系统
│   └── factory.ts       # 图表工厂
├── adapters/            # 平台适配层
│   ├── harmony/         # 鸿蒙适配
│   ├── h5/              # 原生H5适配
│   ├── wechat/          # 微信小程序适配
│   └── uniapp/          # uniapp适配
├── interface/           # 对外统一接口
│   ├── CanvasContext.ts   # 跨平台统一 canvas context 接口定义
├── examples/            # 示例代码
├── docs/                # 文档
└── README.md
```

## 跨平台适配层说明

- 每个平台在 `adapters/` 下有独立目录，负责将平台 API 适配为统一的底层渲染接口。
- 适配层需实现统一的适配接口，并暴露标准的 context、事件等能力，可参考h5实现。
- 新增平台时，仅需在 `adapters/` 下新增目录并实现适配接口，无需修改 core 层代码。
- **CanvasContext 统一接口**：
  - `ChartOptions.context` 字段要求传入的 canvas context 必须兼容 `interface/CanvasContext` 类型。
  - 各平台适配层需将平台原生 canvas context 封装/适配为该接口，保证 core 层渲染逻辑的统一调用。
  - 具体接口定义见 `interface/CanvasContext.ts`，如需适配新平台，请实现该接口。

## 开发指南

### 新增图表类型

- 在 `core/chart/` 下创建新的渲染器类，**需继承 `BaseRenderer`**，实现通用渲染逻辑。
- 在 `core/factory.ts` 中注册新图表类型。
- 在 `core/types/extra.ts` 和 `core/types/series.ts` 中添加扩展配置类型。
- 更新文档和示例。

### 新增平台适配层

1. 在 `adapters/` 下新建平台目录（如 `myplatform/`）。
2. 实现统一适配接口，封装平台 canvas、事件等能力。
3. 在平台入口文件（如 `index.ts`）中暴露适配能力。
4. 如有需要暴露给用户层的适配层类型，在 `interface/` 下新建对应平台目录并导出。
5. 更新文档说明。

## 配置选项

详见 `core/types/` 目录下类型定义，支持丰富的通用与扩展配置。

## 类型与接口统一导出

为方便用户开发，所有类型和接口均已在 `UCharts/interface` 统一导出。无论是图表配置类型、CanvasContext 适配类型，还是平台相关类型，均可通过如下方式导入：

```ts
import type { ChartOptions, CanvasContext } from 'UCharts/interface';
```

如需使用平台专属类型，可从 `UCharts/interface/harmony` 或 `UCharts/interface/wechat` 等路径导入。例如：

```ts
import type { HarmonyCanvasContext } from 'UCharts/interface/harmony';
import type { WechatCanvasContext } from 'UCharts/interface/wechat';
```

普通用户只需用 `UCharts/interface` 统一类型即可，平台专属类型仅在需要平台能力扩展时使用。

## 性能优化

- **底层渲染优化**：TypeScript 实现，便于多端编译优化
- **动画与事件分离**：动画、事件系统独立，提升流畅度
- **按需加载**：仅加载所需图表类型和适配层

## 兼容性

- **鸿蒙系统**：支持 HarmonyOS 5.0 及以上
- **浏览器**：支持浏览器等H5运行环境
- **微信小程序**：支持主流小程序平台（适配中...）
- **uniapp**：支持主流 uniapp 运行环境（适配中...）

## 链接
- [Github](https://github.com/junbin-yang/uCharts-v3)
- [Gitee](https://gitee.com/uCharts/uCharts-v3)

## 许可证

本项目采用 **Apache License 2.0** 开源协议。

- 允许自由使用、修改、分发和商业应用
- 需保留原始版权声明和许可证文件
- 详细条款请见根目录 LICENSE 文件

## 致谢

感谢所有开源贡献者和用户的支持！


#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 发布准备脚本
 * 使用临时目录组织发布文件，保持根目录整洁
 */

console.log('🚀 开始准备独立包发布...');

// 1. 检查构建文件是否存在
const distPath = path.resolve(__dirname, '../../dist/wechat');
if (!fs.existsSync(distPath)) {
  console.error('❌ 构建文件不存在，请先运行 npm run build');
  process.exit(1);
}

// 2. 创建临时发布目录
const tempDir = path.join(__dirname, '.publish-temp');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });
console.log('📁 创建临时发布目录:', tempDir);

// 3. 复制构建文件到临时目录
const filesToCopy = [
  'wx-ucharts-v3.js',
  'wx-ucharts-v3.min.js', 
  'wx-ucharts-v3.esm.js',
  'wx-ucharts-v3.js.map',
  'wx-ucharts-v3.min.js.map',
  'wx-ucharts-v3.esm.js.map'
];

console.log('📁 复制构建文件到临时目录...');
filesToCopy.forEach(file => {
  const srcPath = path.join(distPath, file);
  const destPath = path.join(tempDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ 复制 ${file}`);
  } else {
    console.warn(`⚠️  文件不存在: ${file}`);
  }
});

// 4. 复制类型定义文件到临时目录
const typesDistPath = path.join(distPath, 'types');
const typesDestPath = path.join(tempDir, 'types');

if (fs.existsSync(typesDistPath)) {
  fs.cpSync(typesDistPath, typesDestPath, { recursive: true });
  console.log('✅ 复制类型定义文件');
}

// 5. 复制组件目录到临时目录
const componentsPath = path.join(__dirname, 'components');
const tempComponentsPath = path.join(tempDir, 'components');

if (fs.existsSync(componentsPath)) {
  fs.cpSync(componentsPath, tempComponentsPath, { recursive: true });
  console.log('✅ 复制组件目录');
}

// 6. 创建临时目录的package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 更新文件路径为临时目录的相对路径
packageJson.main = './wx-ucharts-v3.min.js';
packageJson.module = './wx-ucharts-v3.esm.js';
packageJson.types = './types/index.d.ts';

packageJson.files = [
  'wx-ucharts-v3.js',
  'wx-ucharts-v3.min.js',
  'wx-ucharts-v3.esm.js',
  '*.map',
  'types/',
  'components/',
  'README.md'
];

packageJson.exports = {
  ".": {
    "import": "./wx-ucharts-v3.esm.js",
    "require": "./wx-ucharts-v3.min.js",
    "types": "./types/index.d.ts"
  },
  "./components": "./components/ucharts/"
};

// 写入临时目录的package.json
const tempPackageJsonPath = path.join(tempDir, 'package.json');
fs.writeFileSync(tempPackageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ 创建临时package.json');

// 7. 创建发布用的README到临时目录
const tempReadmePath = path.join(tempDir, 'README.md');
const readmeContent = `# UCharts 微信小程序可视化图表组件

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

\`\`\`bash
npm install wx-ucharts-v3
\`\`\`

## 快速开始

### 1. 复制组件到项目

将npm包中的组件复制到你的小程序项目：

\`\`\`bash
# 复制组件到小程序项目
cp -r node_modules/wx-ucharts-v3/components/ucharts ./components/
\`\`\`

### 2. 引入自定义组件

在页面的 \`json\` 文件中引入组件：

\`\`\`json
{
  "usingComponents": {
    "ucharts": "../../components/ucharts/ucharts"
  }
}
\`\`\`

### 3. 基础用法

在页面的 \`.wxml\` 文件中使用组件：

\`\`\`xml
<ucharts 
  canvas-id="my-chart"
  chartData="{{chartData}}"
  width="{{350}}"
  height="{{250}}"
  bind:chartCreated="onChartCreated"
  bind:chartError="onChartError"
/>
\`\`\`

在页面的 \`.js\` 文件中定义数据：

\`\`\`javascript
Page({
  data: {
    chartData: {
      type: 'line',
      categories: ['一月', '二月', '三月', '四月', '五月', '六月'],
      series: [{
        name: '销售额',
        data: [35, 20, 25, 10, 15, 30]
      }]
    }
  },

  onChartCreated(e) {
    console.log('图表创建完成:', e.detail);
  },

  onChartError(e) {
    console.error('图表错误:', e.detail);
  }
});
\`\`\`

## 属性配置

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| chartData | Object | {} | 是 | 图表配置数据 |
| canvas-id | String | 'ucharts' | 否 | Canvas 元素 ID |
| width | Number | 375 | 否 | 图表宽度（px） |
| height | Number | 250 | 否 | 图表高度（px） |
| pixelRatio | Number | 1 | 否 | 像素比 |
| enableLoading | Boolean | true | 否 | 是否启用内部加载组件 |
| enableError | Boolean | true | 否 | 是否启用内部错误组件 |
| loadingType | String | 'skeleton' | 否 | 加载动画类型 |
| loadingText | String | '加载中...' | 否 | 加载提示文本 |

## 事件回调

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| bind:chartCreated | 图表创建完成 | { chart, canvasId, canvas, context } |
| bind:chartUpdated | 图表更新完成 | { data } |
| bind:chartError | 图表错误 | { error, canvasId } |
| bind:errorRetry | 用户点击重试 | {} |


## 使用场景

### 1. 基础图表

\`\`\`xml
<ucharts 
  canvas-id="basic-chart"
  chartData="{{chartData}}"
  width="{{350}}"
  height="{{250}}"
/>
\`\`\`

### 2. 禁用内部状态管理

如果你想使用自己的加载和错误处理逻辑：

\`\`\`xml
<ucharts 
  canvas-id="custom-chart"
  chartData="{{chartData}}"
  enableLoading="{{false}}"
  enableError="{{false}}"
  width="{{350}}"
  height="{{250}}"
/>
\`\`\`

### 3. 自定义加载样式

\`\`\`xml
<ucharts 
  canvas-id="custom-loading-chart"
  chartData="{{chartData}}"
  loadingType="spinner"
  loadingText="数据加载中..."
  width="{{350}}"
  height="{{250}}"
/>
\`\`\`

### 4. 动态更新数据

\`\`\`javascript
// 在页面 JS 中
updateChartData() {
  const newData = {
    type: 'line',
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
\`\`\`

## 加载动画类型

支持的 \`loadingType\` 值：

- \`skeleton\` - 骨架屏动画（默认）
- \`spinner\` - 旋转加载器
- \`pulse\` - 脉冲动画
- \`dots\` - 点状加载器

## 错误处理

组件内置错误处理机制：

1. **Canvas 初始化失败**：显示错误信息和重试按钮
2. **图表创建失败**：显示具体错误信息
3. **用户重试**：点击错误区域可重新初始化图表

## 注意事项

1. **Canvas ID 唯一性**：确保每个图表组件的 \`canvas-id\` 在页面中唯一
2. **数据格式**：确保 \`chartData\` 符合 uCharts 的数据格式要求
3. **尺寸设置**：建议根据屏幕尺寸动态设置图表宽高
4. **性能优化**：避免频繁更新大量数据，可使用防抖处理

## 完整示例

\`\`\`xml
<!-- 页面 WXML -->
<view class="chart-container">
  <ucharts 
    canvas-id="sales-chart"
    chartData="{{salesData}}"
    width="{{chartWidth}}"
    height="{{chartHeight}}"
    loadingType="skeleton"
    loadingText="正在加载销售数据..."
    bind:chartCreated="onChartCreated"
    bind:chartError="onChartError"
    bind:chartUpdated="onChartUpdated"
  />
  
  <button bindtap="updateData">更新数据</button>
</view>
\`\`\`

\`\`\`javascript
// 页面 JS
Page({
  data: {
    chartWidth: 350,
    chartHeight: 250,
    salesData: {}
  },

  onLoad() {
    // 获取屏幕尺寸
    const systemInfo = wx.getSystemInfoSync();
    const chartWidth = Math.min(systemInfo.windowWidth - 40, 350);
    
    this.setData({
      chartWidth,
      chartHeight: chartWidth * 0.7
    });

    // 加载数据
    this.loadChartData();
  },

  loadChartData() {
    // 模拟数据加载
    setTimeout(() => {
      this.setData({
        salesData: {
          type: 'line',
          categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
          series: [{
            name: '销售额',
            data: [35, 20, 25, 10, 15, 30]
          }]
        }
      });
    }, 1000);
  },

  updateData() {
    const newData = {
      type: 'line',
      categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
      series: [{
        name: '销售额',
        data: Array.from({length: 6}, () => Math.floor(Math.random() * 50) + 10)
      }]
    };

    this.setData({
      salesData: newData
    });
  },

  onChartCreated(e) {
    console.log('图表创建完成:', e.detail);
    wx.showToast({
      title: '图表加载完成',
      icon: 'success'
    });
  },

  onChartError(e) {
    console.error('图表错误:', e.detail);
    wx.showModal({
      title: '图表错误',
      content: e.detail.error,
      showCancel: false
    });
  },

  onChartUpdated(e) {
    console.log('图表更新完成:', e.detail);
  }
});
\`\`\`

## API 文档

详见[文档](https://github.com/junbin-yang/uCharts-v3/tree/master/docs)目录。

## 许可证

本项目采用 **Apache License 2.0** 开源协议。

- 允许自由使用、修改、分发和商业应用
- 需保留原始版权声明和许可证文件
- 详细条款请见根目录 LICENSE 文件

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 相关链接

- [GitHub仓库](https://github.com/junbin-yang/uCharts-v3)
- [问题反馈](https://github.com/junbin-yang/uCharts-v3/issues)
- [完整文档](https://github.com/junbin-yang/uCharts-v3/tree/master/docs)
`;

fs.writeFileSync(tempReadmePath, readmeContent);
console.log('✅ 创建临时README.md');

console.log('🎉 发布准备完成！');
console.log(`📁 临时发布目录: ${tempDir}`);
console.log('');
console.log('下一步：');
console.log('1. 检查文件: npm run pack:check');
console.log('2. 发布测试版: npm run publish:beta');
console.log('3. 发布正式版: npm run publish:latest');

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
  'ucharts-wechat.js',
  'ucharts-wechat.min.js', 
  'ucharts-wechat.esm.js',
  'ucharts-wechat.js.map',
  'ucharts-wechat.min.js.map',
  'ucharts-wechat.esm.js.map'
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
packageJson.main = './ucharts-wechat.min.js';
packageJson.module = './ucharts-wechat.esm.js';
packageJson.types = './types/index.d.ts';

packageJson.files = [
  'ucharts-wechat.js',
  'ucharts-wechat.min.js',
  'ucharts-wechat.esm.js',
  '*.map',
  'types/',
  'components/',
  'README.md'
];

packageJson.exports = {
  ".": {
    "import": "./ucharts-wechat.esm.js",
    "require": "./ucharts-wechat.min.js",
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
const readmeContent = `# UCharts 微信小程序可视化图表库

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

\`\`\`bash
npm install ucharts-wechat
\`\`\`

## 快速开始

### 1. 复制组件到项目

将npm包中的组件复制到你的小程序项目：

\`\`\`bash
# 复制组件到小程序项目
cp -r node_modules/ucharts-wechat/components/ucharts ./components/
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

### 3. 在页面中使用组件

\`\`\`xml
<ucharts 
  id="mychart" 
  canvas-id="mychart" 
  chart-data="{{chartData}}"
  width="{{750}}" 
  height="{{500}}">
</ucharts>
\`\`\`

### 4. 在页面JS中配置图表数据

\`\`\`javascript
Page({
  data: {
    chartData: {
      type: 'line',
      categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
      series: [{
        name: '销售额',
        data: [35, 20, 25, 10, 12, 40]
      }],
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
\`\`\`

## 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| canvas-id | String | - | Canvas的唯一标识符 |
| chart-data | Object | - | 图表配置数据对象 |
| width | Number | 375 | 图表宽度（rpx） |
| height | Number | 250 | 图表高度（rpx） |
| disable-scroll | Boolean | false | 禁用图表滚动 |
| enable-tooltip | Boolean | true | 启用提示框 |

## 支持的图表类型

- 📊 **柱状图** (column) - 垂直柱状图表
- 📈 **折线图** (line) - 数据趋势展示
- 📉 **区域图** (area) - 填充区域的折线图
- 📊 **条状图** (bar) - 水平条状图表
- 🥧 **饼状图** (pie) - 圆形数据占比图
- 🍩 **圆环图** (ring) - 环形数据占比图
- 🕸️ **雷达图** (radar) - 多维数据对比
- 📊 **进度条** (arcbar) - 弧形进度显示
- ⏲️ **仪表盘** (gauge) - 仪表盘样式图表
- 🔻 **漏斗图** (funnel) - 转化流程图表
- 📈 **K线图** (candle) - 股票价格图表
- 🔥 **热力图** (heatmap) - 数据密度图
- 更多图表类型...

## 注意事项

1. **组件使用**：推荐使用自定义组件方式，无需手动处理Canvas API
2. **数据更新**：通过修改 \`chart-data\` 属性实现图表数据更新
3. **兼容性**：支持微信小程序基础库 2.9.0+
4. **像素比**：组件会自动处理设备像素比适配

## 许可证

Apache-2.0

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

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * UCharts H5适配器发布文件准备脚本
 * 将构建产物和必要文件复制到临时发布目录
 */

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
    log(`✅ 复制文件: ${path.basename(src)}`, 'green');
  } else {
    log(`⚠️  文件不存在: ${src}`, 'yellow');
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    log(`⚠️  目录不存在: ${src}`, 'yellow');
    return;
  }
  
  ensureDir(dest);
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  
  log(`✅ 复制目录: ${path.basename(src)}`, 'green');
}

function createPublishPackageJson() {
  const originalPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  // 创建发布用的package.json
  const publishPackageJson = {
    ...originalPackageJson,
    // 移除开发相关的scripts
    scripts: {
      postinstall: "echo 'UCharts H5适配器安装完成！'"
    }
  };
  
  const publishDir = path.join(__dirname, '.publish-temp');
  ensureDir(publishDir);
  
  fs.writeFileSync(
    path.join(publishDir, 'package.json'),
    JSON.stringify(publishPackageJson, null, 2)
  );
  
  log('✅ 创建发布用package.json', 'green');
}

function createPublishReadme() {
  const readmeContent = `# UCharts 跨平台可视化图表库

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

## 图表示例

以下为部分图表类型的实际渲染效果：

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

- 漏斗图
  
  ![漏斗图](https://junbin-yang.github.io/uCharts-v3/docs/image/funnel1.png) ![漏斗图](https://junbin-yang.github.io/uCharts-v3/docs/image/funnel2.png)

- K线图
  
  ![K线图](https://junbin-yang.github.io/uCharts-v3/docs/image/candle.png)

（更多类型和样式可参考Github仓库 docs 目录）

## 安装

\`\`\`bash
npm install ucharts-v3
\`\`\`

## 快速开始

### 基础用法

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>UCharts H5示例</title>
</head>
<body>
    <canvas id="chart" width="400" height="300"></canvas>
    
    <script src="node_modules/ucharts-v3/ucharts-v3.min.js"></script>
    <script>
        const canvas = document.getElementById('chart');
        const ctx = new UCharts.H5CanvasContext(canvas.getContext("2d"));
        
        const chart = new UCharts({
            type: "column",
            context: ctx,
            categories: ["2018","2019","2020","2021","2022","2023"],
            series: [
              {
                name: "目标值",
                data: [35,36,31,33,13,34]
              },
              {
                name: "完成量",
                data: [18,27,21,24,6,28]
              }
            ],
            xAxis: { disableGrid: true },
            yAxis: { data: [{ min: 0 }] }
        });
    </script>
</body>
</html>
\`\`\`

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
- **漏斗图 (funnel)**
- **K线图 (candle)**
- **地图 (map)**
- **更多类型持续开发中...**

## 配置选项

详细的配置选项请参考 [UCharts文档](https://github.com/junbin-yang/uCharts-v3)。

## 浏览器支持

- Chrome >= 60
- Firefox >= 55
- Safari >= 12
- Edge >= 79
- 移动端浏览器

## 许可证

Apache-2.0

## 相关链接

- [GitHub仓库](https://github.com/junbin-yang/uCharts-v3)
- [问题反馈](https://github.com/junbin-yang/uCharts-v3/issues)
- [更新日志](https://github.com/junbin-yang/uCharts-v3/releases)
`;

  const publishDir = path.join(__dirname, '.publish-temp');
  ensureDir(publishDir);
  
  fs.writeFileSync(path.join(publishDir, 'README.md'), readmeContent);
  log('✅ 创建发布用README.md', 'green');
}

function main() {
  log('🚀 开始准备UCharts H5适配器发布文件...', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  const publishDir = path.join(__dirname, '.publish-temp');
  const distDir = path.join(__dirname, '../../dist/h5');
  
  // 清理并创建发布目录
  if (fs.existsSync(publishDir)) {
    fs.rmSync(publishDir, { recursive: true, force: true });
  }
  ensureDir(publishDir);
  log('🗑️  清理并创建发布目录', 'blue');
  
  // 检查构建文件是否存在
  if (!fs.existsSync(distDir)) {
    log('❌ 构建文件不存在，请先运行 npm run build', 'red');
    process.exit(1);
  }
  
  // 复制构建产物
  log('📁 复制构建产物...', 'blue');
  const buildFiles = [
    'ucharts-v3.js',
    'ucharts-v3.min.js',
    'ucharts-v3.esm.js',
    'ucharts-v3.js.map',
    'ucharts-v3.min.js.map',
    'ucharts-v3.esm.js.map'
  ];
  
  buildFiles.forEach(file => {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(publishDir, file);
    copyFile(srcPath, destPath);
  });
  
  // 复制类型定义文件
  log('📝 复制类型定义文件...', 'blue');
  const typesDir = path.join(distDir, 'types');
  const publishTypesDir = path.join(publishDir, 'types');
  copyDir(typesDir, publishTypesDir);
  
  // 创建发布用的package.json
  log('📦 创建发布配置...', 'blue');
  createPublishPackageJson();
  
  // 创建发布用的README.md
  log('📖 创建发布文档...', 'blue');
  createPublishReadme();
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
  log('✅ UCharts H5适配器发布文件准备完成！', 'green');
  log(`📁 发布目录: ${publishDir}`, 'blue');
  log('🎯 下一步: 运行 npm run publish:latest 或 npm run publish:beta', 'yellow');
}

if (require.main === module) {
  main();
}

module.exports = { main };
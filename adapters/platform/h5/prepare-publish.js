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
  const readmeContent = `# UCharts H5适配器

UCharts H5平台适配器，专为Web端图表开发设计。

## 特性

- 🎯 专门针对H5/Web平台优化
- 📊 支持20+种图表类型
- 🎨 丰富的自定义配置选项
- 📱 响应式设计，支持移动端
- 🔧 TypeScript支持，完整类型定义
- ⚡ 高性能Canvas渲染
- 🎪 支持动画和交互效果

## 安装

\`\`\`bash
npm install ucharts-h5
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
    
    <script src="node_modules/ucharts-h5/ucharts-h5.min.js"></script>
    <script>
        const canvas = document.getElementById('chart');
        const ctx = canvas.getContext('2d');
        
        const chartData = {
            categories: ['一月', '二月', '三月', '四月', '五月'],
            series: [{
                name: '销售额',
                data: [35, 20, 25, 10, 15]
            }]
        };
        
        const chart = new UCharts.H5UCharts(ctx, {
            type: 'column',
            data: chartData,
            width: 400,
            height: 300
        });
        
        chart.render();
    </script>
</body>
</html>
\`\`\`

### ES模块用法

\`\`\`javascript
import { H5UCharts } from 'ucharts-h5';

const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');

const chart = new H5UCharts(ctx, {
    type: 'line',
    data: {
        categories: ['一月', '二月', '三月', '四月', '五月'],
        series: [{
            name: '访问量',
            data: [100, 200, 150, 300, 250]
        }]
    },
    width: 600,
    height: 400
});

chart.render();
\`\`\`

### TypeScript用法

\`\`\`typescript
import { H5UCharts, ChartOptions } from 'ucharts-h5';

const canvas = document.getElementById('chart') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const options: ChartOptions = {
    type: 'pie',
    data: {
        series: [{
            name: '占比',
            data: [
                { name: '苹果', value: 30 },
                { name: '橙子', value: 25 },
                { name: '香蕉', value: 20 },
                { name: '葡萄', value: 25 }
            ]
        }]
    },
    width: 400,
    height: 400
};

const chart = new H5UCharts(ctx, options);
chart.render();
\`\`\`

## 支持的图表类型

- 📊 柱状图 (column)
- 📈 折线图 (line)
- 🥧 饼图 (pie)
- 🍩 环形图 (ring)
- 📊 条形图 (bar)
- 📈 面积图 (area)
- 📊 堆叠柱状图 (stackedColumn)
- 📈 堆叠折线图 (stackedLine)
- 📊 分组柱状图 (groupedColumn)
- 🎯 雷达图 (radar)
- 📊 散点图 (scatter)
- 📊 气泡图 (bubble)
- 📈 K线图 (candle)
- 📊 漏斗图 (funnel)
- 📊 仪表盘 (gauge)
- 📊 词云图 (wordCloud)
- 📊 热力图 (heatmap)
- 📊 树图 (treemap)
- 📊 桑基图 (sankey)
- 📊 玫瑰图 (rose)

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
    'ucharts-h5.js',
    'ucharts-h5.min.js',
    'ucharts-h5.esm.js',
    'ucharts-h5.js.map',
    'ucharts-h5.min.js.map',
    'ucharts-h5.esm.js.map'
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
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
  'README.md',
  'CHANGELOG.md'
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

// 7. 直接复制实际的README.md文件到临时目录
const sourceReadmePath = path.join(__dirname, 'README.md');
const tempReadmePath = path.join(tempDir, 'README.md');

if (fs.existsSync(sourceReadmePath)) {
  fs.copyFileSync(sourceReadmePath, tempReadmePath);
  console.log('✅ 复制README.md文件');
} else {
  console.error('❌ 源README.md文件不存在');
  process.exit(1);
}

const sourceChangeLogPath = path.join(__dirname, 'CHANGELOG.md');
const tempChangeLogPath = path.join(tempDir, 'CHANGELOG.md');

if (fs.existsSync(sourceChangeLogPath)) {
  fs.copyFileSync(sourceChangeLogPath, tempChangeLogPath);
  console.log('✅ 复制CHANGELOG.md文件');
} else {
  console.error('❌ 源CHANGELOG.md文件不存在');
  process.exit(1);
}

console.log('🎉 发布准备完成！');
console.log(`📁 临时发布目录: ${tempDir}`);
console.log('');
console.log('下一步：');
console.log('1. 检查文件: npm run pack:check');
console.log('2. 发布测试版: npm run publish:beta');
console.log('3. 发布正式版: npm run publish:latest');

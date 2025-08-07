#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { confirmVersion, confirmPublish } = require('./version-manager');

/**
 * UCharts微信小程序适配器独立包发布脚本
 * 支持发布到npm的自动化流程，包含版本确认和发布确认
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

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'inherit',
      ...options 
    });
    return result;
  } catch (error) {
    log(`命令执行失败: ${command}`, 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function checkPrerequisites() {
  log('🔍 检查发布前置条件...', 'blue');
  
  // 检查是否已登录npm
  try {
    const whoami = execSync('npm whoami', { stdio: 'pipe', encoding: 'utf8' });
    log(`✅ npm已登录 (${whoami.trim()})`, 'green');
  } catch (error) {
    log('❌ 请先登录npm: npm login', 'red');
    process.exit(1);
  }
  
  // 检查构建文件是否存在
  const distPath = path.resolve(__dirname, '../../dist/wechat');
  if (!fs.existsSync(distPath)) {
    log('❌ 构建文件不存在，请先运行 npm run build', 'red');
    process.exit(1);
  }
  
  log('✅ 构建文件检查通过', 'green');
}

function runTests() {
  log('🧪 运行测试...', 'blue');
  
  // 检查package.json中是否有test脚本
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.test) {
    try {
      execCommand('npm test');
      log('✅ 测试通过', 'green');
    } catch (error) {
      log('❌ 测试失败，发布中止', 'red');
      process.exit(1);
    }
  } else {
    log('⚠️  未找到测试脚本，跳过测试步骤', 'yellow');
  }
}

function buildProject() {
  log('🔨 构建项目...', 'blue');
  
  // 确保在正确的目录执行构建
  const originalDir = process.cwd();
  const wechatDir = path.join(__dirname);
  
  try {
    process.chdir(wechatDir);
    execCommand('npm run build');
    log('✅ 项目构建完成', 'green');
  } finally {
    process.chdir(originalDir);
  }
}

function preparePublish() {
  log('📁 准备发布文件...', 'blue');
  
  // 确保在正确的目录执行prepare:publish
  const originalDir = process.cwd();
  const wechatDir = path.join(__dirname);
  
  try {
    process.chdir(wechatDir);
    execCommand('npm run prepare:publish');
    log('✅ 发布文件准备完成', 'green');
  } finally {
    process.chdir(originalDir);
  }
}

async function updateVersion(isBeta = false) {
  log('📝 版本号确认...', 'blue');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  const newVersion = await confirmVersion(packageJsonPath, isBeta);
  
  if (!newVersion) {
    log('❌ 版本确认失败或用户取消', 'red');
    process.exit(1);
  }
  
  return newVersion;
}

async function publishToNpm(tag = 'latest') {
  log('🚀 发布确认...', 'blue');
  
  const packageJsonPath = path.join(__dirname, '.publish-temp', 'package.json');
  const publishDir = path.join(__dirname, '.publish-temp');
  
  const shouldPublish = await confirmPublish(packageJsonPath, publishDir);
  
  if (!shouldPublish) {
    log('❌ 用户取消发布', 'red');
    process.exit(1);
  }
  
  log(`📦 发布到npm (tag: ${tag})...`, 'blue');
  
  // 切换到发布目录
  const originalDir = process.cwd();
  process.chdir(publishDir);
  
  try {
    // 先检查包内容
    log('📋 检查包内容...', 'blue');
    try {
      execCommand('npm pack --dry-run');
    } catch (error) {
      log('⚠️  包内容检查失败，继续发布...', 'yellow');
    }
    
    const publishCommand = tag === 'latest' 
      ? 'npm publish' 
      : `npm publish --tag ${tag}`;
      
    execCommand(publishCommand);
    log('✅ 发布成功!', 'green');
  } finally {
    // 切换回原始目录
    process.chdir(originalDir);
  }
}

function cleanupTempFiles() {
  log('🧹 清理临时目录...', 'blue');
  
  // 切换回原始目录
  const originalDir = path.dirname(__dirname);
  process.chdir(path.join(originalDir, 'wechat'));
  
  // 删除临时发布目录
  const tempDir = path.join(__dirname, '.publish-temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    log(`🗑️  删除临时目录: ${tempDir}`, 'blue');
  }
  
  log('✅ 临时目录清理完成', 'green');
}

function showPublishInfo(version, tag) {
  log('\n🎉 发布完成!', 'green');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log(`📦 包名: wx-ucharts-v3`, 'blue');
  log(`🏷️  版本: ${version}`, 'blue');
  log(`🔖 标签: ${tag}`, 'blue');
  log(`🌐 npm: https://www.npmjs.com/package/wx-ucharts-v3`, 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('\n📥 安装命令:', 'yellow');
  if (tag === 'latest') {
    log('npm install wx-ucharts-v3', 'green');
  } else {
    log(`npm install wx-ucharts-v3@${tag}`, 'green');
  }
  log('\n📖 使用方法:', 'yellow');
  log('1. 复制组件: cp -r node_modules/wx-ucharts-v3/components/ucharts ./components/', 'blue');
  log('2. 注册组件: 在页面json中添加 "ucharts": "../../components/ucharts/ucharts"', 'blue');
  log('3. 使用组件: <ucharts chart-data="{{chartData}}" />', 'blue');
  log('\n📚 详细文档: 查看README.md获取完整使用说明', 'yellow');
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const isBeta = args.includes('--beta') || args.includes('beta');
  const isLatest = args.includes('--latest') || args.includes('latest') || args.length === 0;
  
  log('🚀 开始发布UCharts微信小程序适配器独立包...', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  try {
    // 1. 检查前置条件
    checkPrerequisites();
    
    // 2. 运行测试
    runTests();
    
    // 3. 版本号确认
    const newVersion = await updateVersion(isBeta);
    
    // 4. 构建项目
    buildProject();
    
    // 5. 准备发布文件
    preparePublish();
    
    // 6. 发布确认和发布到npm
    const tag = isBeta ? 'beta' : 'latest';
    await publishToNpm(tag);
    
    // 7. 显示发布信息
    showPublishInfo(newVersion, tag);
    
  } catch (error) {
    log('❌ 发布失败:', 'red');
    log(error.message, 'red');
    process.exit(1);
  } finally {
    // 7. 清理临时文件
    cleanupTempFiles();
  }
}

// 错误处理
process.on('uncaughtException', (error) => {
  log('❌ 发布过程中出现错误:', 'red');
  log(error.message, 'red');
  cleanupTempFiles();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('❌ 未处理的Promise拒绝:', 'red');
  log(reason, 'red');
  cleanupTempFiles();
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main };
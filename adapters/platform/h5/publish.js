#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * UCharts H5适配器独立包发布脚本
 * 支持发布到npm的自动化流程
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
  const distPath = path.resolve(__dirname, '../../dist/h5');
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

function preparePublish() {
  log('📁 准备发布文件...', 'blue');
  execCommand('npm run prepare:publish');
  log('✅ 发布文件准备完成', 'green');
}

function updateVersion(versionType) {
  log(`📝 更新版本 (${versionType})...`, 'blue');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const currentVersion = packageJson.version;
  log(`当前版本: ${currentVersion}`, 'blue');
  
  // 使用npm version命令更新版本
  let newVersion;
  if (versionType === 'prerelease') {
    // 如果当前版本不包含预发布标识，先添加beta标识
    if (!currentVersion.includes('-')) {
      newVersion = execSync(`npm version prerelease --preid=beta --no-git-tag-version`, { 
        encoding: 'utf8' 
      }).trim();
    } else {
      newVersion = execSync(`npm version prerelease --no-git-tag-version`, { 
        encoding: 'utf8' 
      }).trim();
    }
  } else {
    newVersion = execSync(`npm version ${versionType} --no-git-tag-version`, { 
      encoding: 'utf8' 
    }).trim();
  }
  
  log(`新版本: ${newVersion}`, 'green');
  return newVersion;
}

function publishToNpm(tag = 'latest') {
  log(`📦 发布到npm (tag: ${tag})...`, 'blue');
  
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
}

function cleanupTempFiles() {
  log('🧹 清理临时目录...', 'blue');
  
  // 切换回原始目录
  const originalDir = path.dirname(__dirname);
  process.chdir(path.join(originalDir, 'h5'));
  
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
  log(`📦 包名: ucharts-h5`, 'blue');
  log(`🏷️  版本: ${version}`, 'blue');
  log(`🔖 标签: ${tag}`, 'blue');
  log(`🌐 npm: https://www.npmjs.com/package/ucharts-h5`, 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('\n📥 安装命令:', 'yellow');
  if (tag === 'latest') {
    log('npm install ucharts-h5', 'green');
  } else {
    log(`npm install ucharts-h5@${tag}`, 'green');
  }
  log('\n📖 使用方法:', 'yellow');
  log('1. HTML引入: <script src="node_modules/ucharts-h5/ucharts-h5.min.js"></script>', 'blue');
  log('2. ES模块: import { H5UCharts } from "ucharts-h5";', 'blue');
  log('3. 创建图表: const chart = new H5UCharts(ctx, options);', 'blue');
  log('\n📚 详细文档: 查看README.md获取完整使用说明', 'yellow');
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const isBeta = args.includes('--beta') || args.includes('beta');
  const isLatest = args.includes('--latest') || args.includes('latest') || args.length === 0;
  
  log('🚀 开始发布UCharts H5适配器独立包...', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  try {
    // 1. 检查前置条件
    checkPrerequisites();
    
    // 2. 运行测试
    runTests();
    
    // 3. 准备发布文件
    preparePublish();
    
    // 4. 更新版本
    let versionType, tag;
    if (isBeta) {
      versionType = 'prerelease';
      tag = 'beta';
    } else if (isLatest) {
      versionType = 'patch'; // 可以改为 minor 或 major
      tag = 'latest';
    }
    
    const newVersion = updateVersion(versionType);
    
    // 5. 发布到npm
    publishToNpm(tag);
    
    // 6. 显示发布信息
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
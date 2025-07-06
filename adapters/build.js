#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 支持的平台
const PLATFORMS = ['h5', 'wechat', 'uniapp'];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}错误: ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

// 检查平台是否存在
function checkPlatform(platform) {
  const platformPath = path.join(__dirname, 'platform', platform);
  if (!fs.existsSync(platformPath)) {
    logError(`平台 ${platform} 不存在: ${platformPath}`);
    return false;
  }
  
  const packageJsonPath = path.join(platformPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    logError(`平台 ${platform} 缺少 package.json: ${packageJsonPath}`);
    return false;
  }
  
  return true;
}

// 安装平台依赖
function installDependencies(platform) {
  const platformPath = path.join(__dirname, 'platform', platform);
  logInfo(`安装 ${platform} 平台依赖...`);
  
  try {
    execSync('npm install', { 
      cwd: platformPath, 
      stdio: 'inherit' 
    });
    logSuccess(`${platform} 平台依赖安装完成`);
  } catch (error) {
    logError(`${platform} 平台依赖安装失败: ${error.message}`);
    return false;
  }
  
  return true;
}

// 构建单个平台
function buildPlatform(platform, watch = false) {
  if (!checkPlatform(platform)) {
    return false;
  }
  
  const platformPath = path.join(__dirname, 'platform', platform);
  const packageJsonPath = path.join(platformPath, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const buildScript = watch ? 'build:watch' : 'build';
    
    if (!packageJson.scripts || !packageJson.scripts[buildScript]) {
      logError(`平台 ${platform} 缺少构建脚本: ${buildScript}`);
      return false;
    }
    
    logInfo(`构建 ${platform} 平台...`);
    
    const command = watch ? 'npm run build:watch' : 'npm run build';
    const child = spawn(command, [], { 
      cwd: platformPath, 
      stdio: 'inherit',
      shell: true 
    });
    
    if (!watch) {
      return new Promise((resolve) => {
        child.on('close', (code) => {
          if (code === 0) {
            logSuccess(`${platform} 平台构建完成`);
            resolve(true);
          } else {
            logError(`${platform} 平台构建失败，退出码: ${code}`);
            resolve(false);
          }
        });
      });
    }
    
    return true;
  } catch (error) {
    logError(`构建 ${platform} 平台时出错: ${error.message}`);
    return false;
  }
}

// 清理构建文件
function cleanBuild() {
  logInfo('清理构建文件...');
  
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    try {
      fs.rmSync(distPath, { recursive: true, force: true });
      logSuccess('构建文件清理完成');
    } catch (error) {
      logError(`清理构建文件失败: ${error.message}`);
      return false;
    }
  } else {
    logInfo('没有找到构建文件需要清理');
  }
  
  return true;
}

// 显示帮助信息
function showHelp() {
  console.log(`
${colors.bright}uCharts-v3 构建管理器${colors.reset}

用法: node adapters/build.js [命令] [平台] [选项]

命令:
  build [平台]    构建指定平台或所有平台
  clean           清理所有构建文件
  install [平台]  安装指定平台或所有平台的依赖

平台:
  h5              构建 H5 平台版本
  wechat          构建微信小程序版本
  uniapp          构建 uni-app 版本
  all             构建所有平台版本

选项:
  --watch, -w     监听模式（仅适用于 build 命令）

示例:
  node adapters/build.js build h5
  node adapters/build.js build all
  node adapters/build.js build h5 --watch
  node adapters/build.js clean
  node adapters/build.js install all
`);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  const command = args[0];
  const platform = args[1];
  const watch = args.includes('--watch') || args.includes('-w');
  
  switch (command) {
    case 'build':
      if (!platform || platform === 'all') {
        logInfo('构建所有平台...');
        let success = true;
        for (const p of PLATFORMS) {
          if (checkPlatform(p)) {
            const result = await buildPlatform(p, watch);
            if (!result) success = false;
          }
        }
        if (success) {
          logSuccess('所有平台构建完成');
        } else {
          process.exit(1);
        }
      } else if (PLATFORMS.includes(platform)) {
        const result = await buildPlatform(platform, watch);
        if (!result) process.exit(1);
      } else {
        logError(`不支持的平台: ${platform}`);
        logInfo(`支持的平台: ${PLATFORMS.join(', ')}`);
        process.exit(1);
      }
      break;
      
    case 'clean':
      cleanBuild();
      break;
      
    case 'install':
      if (!platform || platform === 'all') {
        logInfo('安装所有平台依赖...');
        for (const p of PLATFORMS) {
          if (checkPlatform(p)) {
            installDependencies(p);
          }
        }
      } else if (PLATFORMS.includes(platform)) {
        installDependencies(platform);
      } else {
        logError(`不支持的平台: ${platform}`);
        logInfo(`支持的平台: ${PLATFORMS.join(', ')}`);
        process.exit(1);
      }
      break;
      
    default:
      logError(`未知命令: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    logError(`构建过程中发生错误: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  buildPlatform,
  cleanBuild,
  installDependencies,
  PLATFORMS
}; 
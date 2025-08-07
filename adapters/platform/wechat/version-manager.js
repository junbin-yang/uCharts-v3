#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * 版本管理工具
 * 提供版本号确认和更新功能
 */

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function question(rl, query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

/**
 * 解析版本号
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`无效的版本号格式: ${version}`);
  }
  
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null
  };
}

/**
 * 格式化版本号
 */
function formatVersion(versionObj) {
  let version = `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;
  if (versionObj.prerelease) {
    version += `-${versionObj.prerelease}`;
  }
  return version;
}

/**
 * 递增版本号
 */
function incrementVersion(currentVersion, type = 'patch', prerelease = null) {
  const version = parseVersion(currentVersion);
  
  switch (type) {
    case 'major':
      version.major++;
      version.minor = 0;
      version.patch = 0;
      version.prerelease = null;
      break;
    case 'minor':
      version.minor++;
      version.patch = 0;
      version.prerelease = null;
      break;
    case 'patch':
      version.patch++;
      version.prerelease = null;
      break;
    case 'prerelease':
      if (version.prerelease) {
        // 如果已经是预发布版本，递增预发布版本号
        const prereleaseMatch = version.prerelease.match(/^(.+?)\.?(\d+)?$/);
        if (prereleaseMatch) {
          const prereleaseType = prereleaseMatch[1];
          const prereleaseNum = parseInt(prereleaseMatch[2] || '0') + 1;
          version.prerelease = `${prereleaseType}.${prereleaseNum}`;
        } else {
          version.prerelease = `${version.prerelease}.1`;
        }
      } else {
        // 如果不是预发布版本，先递增patch版本，然后添加预发布标识
        version.patch++;
        version.prerelease = prerelease || 'beta.0';
      }
      break;
  }
  
  return formatVersion(version);
}

/**
 * 版本号确认流程
 */
async function confirmVersion(packageJsonPath, isBeta = false) {
  const rl = createReadlineInterface();
  
  try {
    // 读取当前package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;
    
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('📦 版本号确认', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log(`当前版本: ${currentVersion}`, 'cyan');
    
    // 生成建议的版本号
    const suggestedVersions = {
      patch: incrementVersion(currentVersion, 'patch'),
      minor: incrementVersion(currentVersion, 'minor'),
      major: incrementVersion(currentVersion, 'major'),
      prerelease: incrementVersion(currentVersion, 'prerelease', isBeta ? 'beta' : 'alpha')
    };
    
    log('\n可选的版本更新方式:', 'yellow');
    log(`1. 补丁版本 (patch): ${suggestedVersions.patch}`, 'green');
    log(`2. 次要版本 (minor): ${suggestedVersions.minor}`, 'green');
    log(`3. 主要版本 (major): ${suggestedVersions.major}`, 'green');
    log(`4. 预发布版本 (prerelease): ${suggestedVersions.prerelease}`, 'green');
    log(`5. 自定义版本号`, 'green');
    log(`6. 保持当前版本 (${currentVersion})`, 'green');
    
    const choice = await question(rl, '\n请选择版本更新方式 (1-6): ');
    
    let newVersion;
    switch (choice.trim()) {
      case '1':
        newVersion = suggestedVersions.patch;
        break;
      case '2':
        newVersion = suggestedVersions.minor;
        break;
      case '3':
        newVersion = suggestedVersions.major;
        break;
      case '4':
        newVersion = suggestedVersions.prerelease;
        break;
      case '5':
        newVersion = await question(rl, '请输入自定义版本号: ');
        // 验证版本号格式
        try {
          parseVersion(newVersion);
        } catch (error) {
          log(`❌ ${error.message}`, 'red');
          rl.close();
          return null;
        }
        break;
      case '6':
        newVersion = currentVersion;
        break;
      default:
        log('❌ 无效的选择', 'red');
        rl.close();
        return null;
    }
    
    if (newVersion !== currentVersion) {
      log(`\n版本号将从 ${currentVersion} 更新为 ${newVersion}`, 'yellow');
      const confirm = await question(rl, '确认更新版本号? (y/N): ');
      
      if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        log('❌ 用户取消版本更新', 'red');
        rl.close();
        return null;
      }
      
      // 更新package.json中的版本号
      packageJson.version = newVersion;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      log(`✅ 版本号已更新为: ${newVersion}`, 'green');
    } else {
      log(`✅ 保持当前版本: ${currentVersion}`, 'green');
    }
    
    rl.close();
    return newVersion;
    
  } catch (error) {
    log(`❌ 版本确认失败: ${error.message}`, 'red');
    rl.close();
    return null;
  }
}

/**
 * 发布确认流程
 */
async function confirmPublish(packageJsonPath, publishDir) {
  const rl = createReadlineInterface();
  
  try {
    // 读取package.json信息
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('🚀 发布确认', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    
    // 显示包信息
    log('📦 包信息:', 'cyan');
    log(`   名称: ${packageJson.name}`, 'white');
    log(`   版本: ${packageJson.version}`, 'white');
    log(`   描述: ${packageJson.description}`, 'white');
    log(`   作者: ${packageJson.author?.name || packageJson.author || '未知'}`, 'white');
    log(`   许可证: ${packageJson.license}`, 'white');
    
    // 显示文件列表
    log('\n📁 将要发布的文件:', 'cyan');
    if (packageJson.files && packageJson.files.length > 0) {
      packageJson.files.forEach(file => {
        log(`   ✓ ${file}`, 'green');
      });
    }
    
    // 显示发布目录内容
    if (fs.existsSync(publishDir)) {
      log('\n📂 发布目录内容:', 'cyan');
      const files = fs.readdirSync(publishDir);
      files.forEach(file => {
        const filePath = path.join(publishDir, file);
        const stats = fs.statSync(filePath);
        const size = stats.isFile() ? `(${(stats.size / 1024).toFixed(1)}KB)` : '(目录)';
        log(`   📄 ${file} ${size}`, 'white');
      });
    }
    
    // 显示发布配置
    log('\n⚙️ 发布配置:', 'cyan');
    log(`   注册表: ${packageJson.publishConfig?.registry || 'https://registry.npmjs.org/'}`, 'white');
    log(`   访问权限: ${packageJson.publishConfig?.access || 'public'}`, 'white');
    
    const confirm = await question(rl, '\n确认发布到 NPM? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      log('❌ 用户取消发布', 'red');
      rl.close();
      return false;
    }
    
    log('✅ 用户确认发布', 'green');
    rl.close();
    return true;
    
  } catch (error) {
    log(`❌ 发布确认失败: ${error.message}`, 'red');
    rl.close();
    return false;
  }
}

module.exports = {
  confirmVersion,
  confirmPublish,
  parseVersion,
  formatVersion,
  incrementVersion
};

// 如果直接运行此脚本
if (require.main === module) {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const publishDir = path.join(__dirname, '.publish-temp');
  
  async function main() {
    const version = await confirmVersion(packageJsonPath);
    if (version) {
      const shouldPublish = await confirmPublish(packageJsonPath, publishDir);
      if (shouldPublish) {
        log('🎉 准备发布...', 'green');
      }
    }
  }
  
  main().catch(console.error);
}
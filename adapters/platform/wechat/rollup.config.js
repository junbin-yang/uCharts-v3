const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const fs = require('fs');
const path = require('path');

// 自定义插件：构建完成后复制文件到组件目录和示例项目
function copyToComponents() {
  let hasExecuted = false; // 防止重复执行
  
  return {
    name: 'copy-to-components',
    generateBundle(options, bundle) {
      // 只在生成min.js文件时执行复制
      if (options.file && options.file.includes('min.js') && !hasExecuted) {
        hasExecuted = true;
        
        // 延迟执行，确保文件已写入磁盘
        setTimeout(() => {
          try {
            const sourceFile = path.resolve(__dirname, '../../dist/wechat/wx-ucharts-v3.min.js');
            
            // 1. 复制到适配器组件目录
            const adapterTargetFile = path.resolve(__dirname, 'components/ucharts/wx-ucharts-v3.min.js');
            const adapterTargetDir = path.dirname(adapterTargetFile);
            if (!fs.existsSync(adapterTargetDir)) {
              fs.mkdirSync(adapterTargetDir, { recursive: true });
            }
            
            if (fs.existsSync(sourceFile)) {
              fs.copyFileSync(sourceFile, adapterTargetFile);
              console.log('✅ 已复制 wx-ucharts-v3.min.js 到适配器组件目录');
              
              // 2. 复制整个组件目录到示例项目
              const componentSourceDir = path.resolve(__dirname, 'components/ucharts');
              const exampleTargetDir = path.resolve(__dirname, '../../../examples/wechat/components/ucharts');
              
              // 确保示例项目组件目录存在
              if (!fs.existsSync(path.dirname(exampleTargetDir))) {
                fs.mkdirSync(path.dirname(exampleTargetDir), { recursive: true });
              }
              
              // 复制整个组件目录
              copyDirectory(componentSourceDir, exampleTargetDir);
              console.log('✅ 已同步组件目录到示例项目');
              
            } else {
              console.warn('⚠️ 源文件不存在:', sourceFile);
            }
          } catch (error) {
            console.error('❌ 复制文件失败:', error.message);
          }
        }, 100); // 延迟100ms确保文件写入完成
      }
    }
  };
}

// 递归复制目录的辅助函数
function copyDirectory(src, dest) {
  // 如果目标目录存在，先删除
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  
  // 创建目标目录
  fs.mkdirSync(dest, { recursive: true });
  
  // 读取源目录内容
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

module.exports = {
  input: 'index.ts',
  output: [
    {
      file: '../../dist/wechat/wx-ucharts-v3.js',
      format: 'umd',
      name: 'UCharts',
      exports: 'default',
      sourcemap: true
    },
    {
      file: '../../dist/wechat/wx-ucharts-v3.min.js',
      format: 'umd',
      name: 'UCharts',
      exports: 'default',
      plugins: [terser()],
      sourcemap: true
    },
    {
      file: '../../dist/wechat/wx-ucharts-v3.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: '../../dist/wechat/types'
    }),
    copyToComponents() // 添加自动复制插件
  ],
  external: [], // 如果有外部依赖，在这里添加   
  onwarn(warning, warn) {
    // 忽略某些警告
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  }
};

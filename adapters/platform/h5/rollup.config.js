const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const fs = require('fs');
const path = require('path');

// 自定义插件：构建完成后复制文件到示例项目
function copyToExamples() {
  let hasExecuted = false; // 防止重复执行
  
  return {
    name: 'copy-to-examples',
    generateBundle(options, bundle) {
      // 只在生成min.js文件时执行复制
      if (options.file && options.file.includes('min.js') && !hasExecuted) {
        hasExecuted = true;
        
        // 延迟执行，确保文件已写入磁盘
        setTimeout(() => {
          try {
            const sourceFile = path.resolve(__dirname, '../../dist/h5/ucharts-v3.min.js');
            
            // 复制到H5示例项目目录
            const exampleTargetFile = path.resolve(__dirname, '../../../examples/h5/ucharts-v3.min.js');
            const exampleTargetDir = path.dirname(exampleTargetFile);
            
            // 确保示例项目目录存在
            if (!fs.existsSync(exampleTargetDir)) {
              fs.mkdirSync(exampleTargetDir, { recursive: true });
            }
            
            if (fs.existsSync(sourceFile)) {
              fs.copyFileSync(sourceFile, exampleTargetFile);
              console.log('✅ 已复制 ucharts-v3.min.js 到H5示例项目目录');
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

module.exports = {
  input: 'index.ts',
  output: [
    {
      file: '../../dist/h5/ucharts-v3.js',
      format: 'umd',
      name: 'UCharts',
      exports: 'default',
      sourcemap: true
    },
    {
      file: '../../dist/h5/ucharts-v3.min.js',
      format: 'umd',
      name: 'UCharts',
      exports: 'default',
      plugins: [terser()],
      sourcemap: true
    },
    {
      file: '../../dist/h5/ucharts-v3.esm.js',
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
      declarationDir: '../../dist/h5/types'
    }),
    copyToExamples() // 添加自动复制插件
  ],
  external: [], // 如果有外部依赖，在这里添加   
  onwarn(warning, warn) {
    // 忽略某些警告
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  }
};

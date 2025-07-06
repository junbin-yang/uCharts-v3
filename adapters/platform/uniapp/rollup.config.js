const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');

module.exports = {
  input: 'index.ts',
  output: [
    {
      file: '../../dist/uniapp/ucharts-uniapp.js',
      format: 'umd',
      name: 'UCharts',
      exports: 'default',
      sourcemap: true
    },
    {
      file: '../../dist/uniapp/ucharts-uniapp.min.js',
      format: 'umd',
      name: 'UCharts',
      exports: 'default',
      plugins: [terser()],
      sourcemap: true
    },
    {
      file: '../../dist/uniapp/ucharts-uniapp.esm.js',
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
      declarationDir: '../../dist/uniapp/types'
    })
  ],
  external: [], // 如果有外部依赖，在这里添加   
  onwarn(warning, warn) {
    // 忽略某些警告
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  }
}; 
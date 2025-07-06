# uCharts-v3 构建指南

## 项目结构

```
uCharts-v3/
├── core/           # 核心渲染逻辑（平台无关）
├── interface/      # 接口定义
├── adapters/       # 平台适配器
│   ├── platform/
│   │   ├── h5/     # H5平台适配
│   │   ├── wechat/ # 微信小程序适配
│   │   ├── uniapp/ # uni-app适配
│   │   └── harmony/# 鸿蒙适配
│   └── dist/       # 平台特定构建输出
└── examples/       # 示例代码
```

## 构建策略

本项目采用**平台特定构建策略**，每个平台都有独立的构建配置和输出：

### 平台特定构建 (`adapters/dist/`)
- 包含核心逻辑 + 平台适配器
- 开箱即用，无需额外配置
- 按需选择，减小包大小

## 构建系统

本项目使用 Rollup 作为打包工具，支持多平台构建。

### 安装依赖

```bash
npm install
```

### 构建命令

#### 1. 构建所有平台版本
```bash
npm run build
```
这会构建所有平台的版本到 `adapters/dist/` 目录。

#### 2. 构建特定平台版本
```bash
npm run build:h5        # H5平台
npm run build:wechat    # 微信小程序
npm run build:uniapp    # uni-app
```

#### 3. 清理构建文件
```bash
npm run clean
```

### 开发模式

```bash
npm run dev
```
启动监听模式，文件变化时自动重新构建H5平台。

## 推荐使用场景

- 快速开发
- 标准平台使用
- 开箱即用需求
- 按需选择，减小包大小

## 配置说明

### 构建配置

每个平台都有自己的构建配置：
- `adapters/platform/h5/rollup.config.js` - H5平台构建配置
- `adapters/platform/h5/tsconfig.json` - H5平台TypeScript配置
- 其他平台配置文件类似

### 构建管理器

- `adapters/build.js` - 统一的构建管理器，支持所有平台

## 发布到npm

```bash
npm run prepublishOnly  # 自动清理并构建
npm publish
```

发布后用户可以通过以下方式使用：

```javascript
// 平台特定版本
import { UCharts } from 'ucharts-v3/h5';
```

## 注意事项

1. 每个平台都有独立的构建配置和输出
2. 平台特定版本包含完整的适配器实现，开箱即用
3. 生产环境使用压缩版本以减小文件大小
4. 不同平台的构建输出目录不同，便于按需加载 
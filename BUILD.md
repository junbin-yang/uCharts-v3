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

### 主包发布（多平台统一包）

主包包含所有平台的适配器，用户可以按需导入：

```bash
npm run prepublishOnly  # 自动清理并构建
npm publish
```

发布后用户可以通过以下方式使用：

```javascript
// 按平台导入
import { UCharts } from 'ucharts-v3/h5';        // H5平台
import { UCharts } from 'ucharts-v3/wechat';    // 微信小程序
import { UCharts } from 'ucharts-v3/uniapp';    // uni-app平台
```

### H5独立包发布

H5适配器支持独立包发布，提供更好的Web开发体验：

#### 1. 进入H5适配器目录
```bash
cd adapters/platform/h5
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 构建和发布

**发布正式版本：**
```bash
npm run publish:latest
```

**发布测试版本：**
```bash
npm run publish:beta
```

#### 4. 发布流程说明

发布脚本会自动执行以下步骤：
1. 检查npm登录状态和构建文件
2. 运行测试（如果有）
3. 准备发布文件到临时目录
4. 更新版本号
5. 发布到npm
6. 清理临时文件

#### 5. H5独立包使用方式

**安装：**
```bash
# 正式版本
npm install ucharts-h5

# 测试版本
npm install ucharts-h5@beta
```

**在Web项目中使用：**

1. HTML直接引入：
```html
<script src="node_modules/ucharts-h5/ucharts-h5.min.js"></script>
<script>
  const chart = new UCharts.H5UCharts(ctx, options);
</script>
```

2. ES模块导入：
```javascript
import { H5UCharts } from 'ucharts-h5';
const chart = new H5UCharts(ctx, options);
```

3. TypeScript使用：
```typescript
import { H5UCharts, ChartOptions } from 'ucharts-h5';
const options: ChartOptions = { /* 配置 */ };
const chart = new H5UCharts(ctx, options);
```

#### 6. 发布前准备

确保已完成以下准备工作：
- 已登录npm：`npm login`
- 已完成代码构建：`npm run build`
- 已测试功能正常

#### 7. 版本管理

- **正式版本**：使用 `npm run publish:latest`，版本号自动递增patch版本
- **测试版本**：使用 `npm run publish:beta`，版本号添加beta预发布标识

### 微信小程序独立包发布

微信小程序适配器支持独立包发布，提供更好的小程序开发体验：

#### 1. 进入微信小程序适配器目录
```bash
cd adapters/platform/wechat
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 构建和发布

**发布正式版本：**
```bash
npm run publish:latest
```

**发布测试版本：**
```bash
npm run publish:beta
```

#### 4. 发布流程说明

发布脚本会自动执行以下步骤：
1. 检查npm登录状态和构建文件
2. 运行测试（如果有）
3. 准备发布文件到临时目录
4. 更新版本号
5. 发布到npm
6. 清理临时文件

#### 5. 微信小程序包使用方式

**安装：**
```bash
# 正式版本
npm install ucharts-wechat

# 测试版本
npm install ucharts-wechat@beta
```

**在小程序中使用：**

1. 复制组件到项目：
```bash
cp -r node_modules/ucharts-wechat/components/ucharts ./components/
```

2. 在页面json中注册组件：
```json
{
  "usingComponents": {
    "ucharts": "../../components/ucharts/ucharts"
  }
}
```

3. 在页面中使用：
```xml
<ucharts chart-data="{{chartData}}" />
```

#### 6. 发布前准备

确保已完成以下准备工作：
- 已登录npm：`npm login`
- 已完成代码构建：`npm run build`
- 已测试功能正常

#### 7. 版本管理

- **正式版本**：使用 `npm run publish:latest`，版本号自动递增patch版本
- **测试版本**：使用 `npm run publish:beta`，版本号添加beta预发布标识

独立包发布的优势：
- 专门针对微信小程序优化
- 包含完整的组件和类型定义
- 独立的版本管理和发布周期
- 更好的小程序开发体验
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


## 注意事项

1. 每个平台都有独立的构建配置和输出
2. 平台特定版本包含完整的适配器实现，开箱即用
3. 生产环境使用压缩版本以减小文件大小
4. 不同平台的构建输出目录不同，便于按需加载 
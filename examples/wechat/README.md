# UCharts 微信小程序示例项目

这是UCharts微信小程序适配器的完整示例项目，展示了如何在微信小程序中使用UCharts图表库。

## 🚀 快速开始

### 1. 导入微信开发者工具

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择当前目录 `examples/wechat/` 作为项目根目录
4. 填写项目信息：
   - 项目名称：UCharts微信小程序示例
   - AppID：使用测试号或您的AppID
   - 开发模式：小程序

### 2. 安装依赖

在项目根目录执行：
```bash
# 如果需要npm包，可以在小程序项目中使用
npm install
```

### 3. 配置项目

确保 `project.config.json` 配置正确：
```json
{
  "appid": "your-appid-here",
  "projectname": "ucharts-wechat-example",
  "setting": {
    "es6": true,
    "enhance": true,
    "postcss": true,
    "minified": true
  }
}
```

### 4. 运行项目

1. 在微信开发者工具中点击"编译"
2. 在模拟器中查看效果
3. 可以在真机上预览测试

## 📱 示例页面

### 主页面 (pages/index/)
- **图表示例** - 展示图表渲染功能
- **触摸交互** - 演示图表交互功能

## 📂 项目结构

```
examples/wechat/
├── 📄 app.js              # 小程序入口文件
├── 📄 app.json            # 小程序配置文件
├── 📄 app.wxss            # 全局样式文件
├── 📄 project.config.json # 项目配置文件
├── 📄 sitemap.json        # 站点地图配置
├── 📁 pages/              # 页面目录
│   └── 📁 index/          # 首页
│       ├── index.js       # 页面逻辑
│       ├── index.wxml     # 页面结构
│       ├── index.wxss     # 页面样式
│       └── index.json     # 页面配置
├── 📁 components/         # 组件目录
│   └── 📁 ucharts/        # UCharts组件
│       ├── ucharts.js     # 组件逻辑
│       ├── ucharts.wxml   # 组件模板
│       └── ucharts.json   # 组件配置
└── 📄 README.md           # 使用说明
```

## 🔧 开发调试

### 查看日志
在微信开发者工具的"调试器"面板中：
1. 打开"Console"标签
2. 查看图表创建和交互日志
3. 检查是否有错误信息

### 真机调试
- 点击"预览"生成二维码
- 使用微信扫码在真机上测试
- 查看真机调试信息

### 性能监控
1. 打开"Performance"面板
2. 记录图表渲染性能
3. 分析内存使用情况

## 📱 预期效果

### 正常运行时应该看到：
1. ✅ 页面正常加载
2. ✅ 图表正确渲染
3. ✅ 触摸交互响应
4. ✅ 控制台无错误信息

### 如果遇到问题：
1. 🔍 检查构建文件是否存在
2. 🔍 查看控制台错误信息
3. 🔍 确认微信开发者工具版本
4. 🔍 验证项目配置是否正确

## 📞 技术支持

### 常见问题解决：

#### 问题1：图表不显示
```javascript
// 检查Canvas是否正确初始化
console.log('Canvas context:', this.canvasContext);
```

#### 问题2：触摸事件无响应
```javascript
// 检查事件绑定
console.log('Touch event:', e);
```

#### 问题3：构建文件缺失
```bash
# 重新构建
npm run build:wechat
# 检查输出
ls -la adapters/dist/wechat/
```

## 🎉 开始体验

现在您可以：

1. **打开微信开发者工具**
2. **导入项目**：`examples/wechat/`
3. **点击编译**
4. **查看效果**
5. **真机测试**

祝您测试愉快！🚀

---

💡 **提示**：如果是第一次使用，建议先熟悉微信开发者工具的基本操作。

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

## 🎯 核心功能演示

### 1. 基础图表创建
```javascript
// pages/index/index.js
import UCharts from '../../components/ucharts/ucharts-wechat.js';

Page({
  data: {
    chart: null
  },

  onReady() {
    this.initChart();
  },

  initChart() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#mychart').fields({
      node: true,
      size: true
    }).exec((res) => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      
      // 设置canvas尺寸
      const dpr = wx.getWindowInfo().pixelRatio;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      // 创建图表
      const chart = new UCharts({
        type: 'line',
        context: new UCharts.WechatCanvasContext(ctx, canvas.width, canvas.height),
        width: canvas.width,
        height: canvas.height,
        categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
        series: [{
          name: '销售额',
          data: [35, 20, 25, 10, 12, 40]
        }]
      });

      this.setData({ chart });
    });
  }
});
```

### 2. 触摸交互处理
```javascript
// 触摸事件处理
touchStart(e) {
  if (this.data.chart) {
    this.data.chart.touchStart(e);
  }
},

touchMove(e) {
  if (this.data.chart) {
    this.data.chart.touchMove(e);
  }
},

touchEnd(e) {
  if (this.data.chart) {
    this.data.chart.touchEnd(e);
  }
}
```

### 3. 数据更新
```javascript
// 更新图表数据
updateChart() {
  if (this.data.chart) {
    this.data.chart.updateData({
      series: [{
        name: '新数据',
        data: [45, 30, 35, 20, 22, 50]
      }]
    });
  }
}
```

## 📂 项目结构

```
examples/wechat/
├── pages/                 # 页面目录
│   ├── index/            # 主页面
│   │   ├── index.js      # 页面逻辑
│   │   ├── index.wxml    # 页面结构
│   │   ├── index.wxss    # 页面样式
│   │   └── index.json    # 页面配置
│   └── charts/           # 图表列表页面
│       ├── charts.js
│       ├── charts.wxml
│       ├── charts.wxss
│       └── charts.json
├── components/           # 组件目录
│   └── ucharts/         # UCharts组件
│       ├── ucharts.js   # 组件逻辑
│       ├── ucharts.wxml # 组件模板
│       ├── ucharts.json # 组件配置
│       └── ucharts-wechat.js # UCharts库文件
├── utils/               # 工具函数
│   └── util.js
├── app.js              # 应用入口
├── app.json            # 应用配置
├── app.wxss            # 全局样式
├── project.config.json # 项目配置
├── sitemap.json        # 站点地图
└── README.md           # 说明文档
```

## 🔧 开发调试

### 1. 调试工具
- 使用微信开发者工具的调试面板
- 查看Console输出
- 使用Network面板监控请求

### 2. 真机调试
- 点击"预览"生成二维码
- 使用微信扫码在真机上测试
- 查看真机调试信息

### 3. 性能优化
- 监控图表渲染性能
- 优化触摸事件响应
- 减少不必要的重绘

## 🐛 常见问题

### 1. Canvas不显示
- 检查Canvas尺寸设置
- 确认像素比配置正确
- 验证Canvas上下文获取

### 2. 触摸事件无响应
- 检查事件绑定是否正确
- 确认事件处理函数存在
- 验证图表实例是否创建成功

### 3. 图表显示异常
- 检查数据格式是否正确
- 确认图表类型配置
- 验证Canvas上下文适配

## 📞 技术支持

如果遇到问题，可以：
1. 查看控制台错误信息
2. 检查示例代码实现
3. 参考UCharts官方文档
4. 提交Issue反馈问题

## 🎉 开始体验

现在您可以：
1. 在微信开发者工具中打开项目
2. 编译并运行示例
3. 在模拟器或真机上测试
4. 根据需要修改和扩展功能

祝您使用愉快！🚀
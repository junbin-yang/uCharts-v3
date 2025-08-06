// app.js
App({
  onLaunch() {
    console.log('UCharts 微信小程序示例启动');
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 登录
    wx.login({
      success: res => {
        console.log('登录成功', res.code);
      }
    });
  },
  
  globalData: {
    userInfo: null
  }
});
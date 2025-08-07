// uCharts折线图演示页面
Page({
  data: {
    // 折线图数据
    lineChartData: {},
    
    // 演示数据
    demoData: {
      line: {
        type: 'line',
        categories: ['一月', '二月', '三月', '四月', '五月', '六月'],
        series: [{
          name: '销售额',
          data: [35, 20, 25, 10, 15, 30]
        }, {
          name: '利润',
          data: [18, 12, 15, 8, 10, 20]
        }]
      }
    }
  },

  onLoad() {
    // 延迟加载演示数据
    setTimeout(() => {
      this.loadDemoData();
    }, 500);
  },

  /**
   * 加载演示数据
   */
  loadDemoData() {
    this.setData({
      lineChartData: this.data.demoData.line
    });
  },

  /**
   * 更新图表数据
   */
  updateChartData() {
    const newData = {
      type: 'line',
      categories: ['Q1', 'Q2', 'Q3', 'Q4'],
      series: [{
        name: '营收',
        data: [
          Math.floor(Math.random() * 100) + 50,
          Math.floor(Math.random() * 100) + 50,
          Math.floor(Math.random() * 100) + 50,
          Math.floor(Math.random() * 100) + 50
        ]
      }]
    };

    this.setData({
      lineChartData: newData
    });
  },

  /**
   * 图表创建完成事件
   */
  onChartCreated(e) {
    console.log('图表创建完成:', e.detail);
  },

  /**
   * 图表更新完成事件
   */
  onChartUpdated(e) {
    console.log('图表更新完成:', e.detail);
  },

  /**
   * 图表错误事件
   */
  onChartError(e) {
    console.error('图表错误:', e.detail);
    const { error, canvasId } = e.detail;
    
    wx.showModal({
      title: '图表错误',
      content: `图表发生错误: ${error}`,
      showCancel: false,
      confirmText: '确定'
    });
  }
});
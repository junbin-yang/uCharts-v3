// 微信小程序使用示例
Page({
  data: {
    // 图表配置数据
    chartData: {
      type: "line",
      categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
      series: [
        {
          name: "成交量A",
          data: [35, 8, 25, 37, 4, 20]
        },
        {
          name: "成交量B", 
          data: [70, 40, 65, 100, 44, 68]
        },
        {
          name: "成交量C",
          data: [100, 80, 95, 150, 112, 132]
        }
      ],
      padding: [15, 10, 0, 15],
      xAxis: { disableGrid: true },
      yAxis: { gridType: "dash", dashLength: 2 },
      extra: {
        line: {
          type: "straight",
          width: 2,
          activeType: "hollow"
        }
      }
    }
  },

  onLoad: function() {
    console.log('页面加载完成');
  },

  // 图表创建完成回调
  onChartCreated: function(e) {
    console.log('图表创建完成:', e.detail.chart);
    this.chart = e.detail.chart;
  },

  // 图表更新完成回调
  onChartUpdated: function(e) {
    console.log('图表更新完成:', e.detail.data);
  },

  // 图表错误回调
  onChartError: function(e) {
    console.error('图表错误:', e.detail.error);
    wx.showToast({
      title: '图表加载失败',
      icon: 'none'
    });
  },

  // 更新数据
  updateData: function() {
    const newData = this.data.chartData.series.map(series => ({
      ...series,
      data: series.data.map(() => Math.floor(Math.random() * 150))
    }));

    this.setData({
      chartData: {
        ...this.data.chartData,
        series: newData
      }
    });
  }
});
Page({
  data: {
    lineChartData: {},
    columnChartData: {},
    opts: {},
  },
  onReady() {
    this.getServerData();
  },
  getServerData() {
    //模拟从服务器获取数据时的延时
    setTimeout(() => {
      //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
      let lineChartData = {
        categories: ['一月', '二月', '三月', '四月', '五月', '六月'],
        series: [{
          name: '销售额',
          data: [35, 20, 25, 10, 15, 30]
        }, {
          name: '利润',
          data: [18, 12, 15, 8, 10, 20]
        }]
      };
      let columnChartData = {
        categories:["2018","2019","2020","2021","2022","2023","2024","2025"],
        series: [
          {
            name: "目标值",
            data: [35,36,31,33,13,34,44,38]
          },
          {
            name: "完成量",
            data: [18,27,21,24,6,28,40,30]
          }
        ]
      };
      let opts = {
        touchMoveLimit: 24,
        enableScroll: true,
        xAxis: {
          disableGrid: true,
          scrollShow: true,
          itemCount: 4
        },
        yAxis: { data: [{ min: 0 }] }
      }
      this.setData({ lineChartData, columnChartData, opts });
    }, 800);
  },
  complete(e){
    console.log(e);
  }
})
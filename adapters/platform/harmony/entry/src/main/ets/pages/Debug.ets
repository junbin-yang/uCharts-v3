import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import { ChartOptions, UCharts, UChartsController } from "@ibestservices/ucharts"
import { display } from "@kit.ArkUI"

// #4
/*
@Component
export struct DebugChart {
  @State title: string = "问题定位"
  @State icon: Resource = $r("app.media.column")
  @State chart: UChartsController = new UChartsController()
  @State contentWidth: number|string = "auto"
  @State contentHeight: number|string = 300
  @State isShow: boolean = true
  private opts: Partial<ChartOptions> = {
    type: 'line',
    dataLabel: false,
    rotate: true,
    rotateLock: true,
    padding: [20, 20, 25, 0],
    legend: {
      show: true,
      position: 'bottom',
      float: 'center',
      lineHeight: 20
    },
    scrollPosition: 'right',
    extra: {
      line: {
        linearType: 'none',
        type: 'curve',
      },
    },
    enableScroll: true,
    xAxis: {
      scrollShow: true,
      itemCount: 4,
      disableGrid: true,
      scrollAlign: 'right',
      boundaryGap: 'justify',
      marginTop: 10,
    },
    yAxis: {
      disabled: false,
      disableGrid: false,
      splitNumber: 3,
    },
    categories: ["2018","2019","2020","2021","2022","2023"],
    series: [
      {
        name: "成交量B",
        data: [70,40,65,100,44,68]
      },
      {
        name: "成交量C",
        data: [100,80,95,150,112,132]
      }
    ]
  }

  aboutToAppear(): void {
    const info = display.getDefaultDisplaySync()
    this.contentWidth = px2vp(info.width) - 80
    this.contentHeight = px2vp(info.height) - 180
  }

  build() {
    NavDestination() {
      IBestNavBar({
        title: this.title,
        titleIcon: this.icon,
        isShowStatusBar: true,
        onLeftClick: () => {
          RouterUtil.pop()
        }
      })
      Column() {
        Row({space: 5}) {
          Button("show").onClick(()=>{
            this.isShow = !this.isShow
          })
          Button("update").onClick(()=>{
            const getRandomInRange = (min: number, max: number): number => {
              return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            const y = Number(this.opts.categories![this.opts.categories!.length - 1]) + 1
            this.opts.categories!.push(y.toString())
            this.opts.series = [
              {
                name: "成交量B",
                data: [...this.opts.series![0].data as number[], getRandomInRange(1, 100)]
              },
              {
                name: "成交量C",
                data: [...this.opts.series![1].data as number[], getRandomInRange(1, 100)]
              }
            ]
            this.chart.updateData({
              categories: this.opts.categories!,
              series: this.opts.series,
              scrollPosition: 'right'
            })
          })
        }

        UCharts({controller: this.chart,
          contentWidth: this.contentWidth,
          contentHeight: this.contentHeight,
          onReady: () => {
            this.chart.updateData(this.opts)
          }}).visibility(this.isShow ? Visibility.Visible : Visibility.Hidden)
      }
      .padding({ left: 12, right: 12 })
    }.hideTitleBar(true)
    .backgroundColor("#f7f8fa")
  }
}
*/

@Component
export struct DebugChart {
  @State title: string = "问题定位"
  @State icon: Resource = $r("app.media.column")
  private searchOption: Partial<ChartOptions> = {
    type: 'area',
    fontSize: 12,
    padding: [20, 30, 20, 0],
    extra: {
      area: {
        type: 'curve',
        addLine: true,
        gradient: true,
      },
      line: {
        linearType: 'none',
      },
    },
    enableScroll: true,
    yAxis: {
      disabled: false,
      disableGrid: false,
      splitNumber: 4,
      data:[{tofix: 2}],
    },
    xAxis: {
      scrollShow: true,
      itemCount: 5,
      disableGrid: true,
      boundaryGap: 'justify',
      marginTop: 10,
      labelCount: 6,
      gridEval: 1,
    },
    categories: [],
    series: []
  }
  @State searchChart: UChartsController = new UChartsController()
  private priceOption: Partial<ChartOptions> = {
    fontSize: 12,
    type: 'area',
    padding: [20, 30, 20, 0],
    dataLabel: false,
    dataPointShape: false,
    extra: {
      area: {
        type: 'curve',
        addLine: true,
        gradient: true
      },
      line: {
        linearType: 'none',
      },
    },
    enableScroll: true,
    xAxis: {
      rotateLabel: true,
      scrollShow: true,
      disableGrid: true,
      scrollAlign: 'right',
      boundaryGap: 'justify',
      marginTop: 10,
      //labelCount: 3,
      itemCount: 9,
    },
    yAxis: {
      disabled: false,
      disableGrid: false,
      splitNumber: 4,
      data: [{tofix: 2, max: 2000}],
    }
  }
  @State priceChart: UChartsController = new UChartsController()

  build() {
    NavDestination() {
      IBestNavBar({
        title: this.title,
        titleIcon: this.icon,
        isShowStatusBar: true,
        onLeftClick: () => {
          RouterUtil.pop()
        }
      })
      Column() {
        UCharts({
          controller: this.searchChart, onReady: () => {
            this.searchChart.updateData(this.searchOption)
            setTimeout(() => {
              this.searchChart.updateData({
                categories: ["2022-02","2022-03","2022-04","2022-05","2022-06","2022-07","2022-08","2022-09","2022-10","2022-11","2022-12","2023-01","2023-02","2023-03","2023-04","2023-05","2023-06","2023-07","2023-08","2023-09","2023-10","2023-11","2023-12","2024-01","2024-02"],
                series:[
                  {
                    name: '测试',
                    data: [924.49,1305.3,1367.59,1531.61,1202.26,1223.11,1440.44,993.84,1247,1343.25,935.26,564.25,1164.38,1217.62,1061.12,1088.56,840.98,1118.76,833.33,795.13,685.71,741.2,697.13,757.75,349.04],
                    color: '#ff6120',
                    legendShape: 'square'
                  }
                ],
                scrollPosition: 'right'
              })

              this.priceChart.updateData({
                categories: [ "2023-06-11", "2023-06-18", "2023-06-25", "2023-07-02", "2023-07-09", "2023-07-16",
                              "2023-07-23", "2023-07-30", "2023-08-06", "2023-08-13", "2023-08-20", "2023-08-27",
                              "2023-09-03", "2023-09-10", "2023-09-17", "2023-09-24", "2023-10-01", "2023-10-08",
                              "2023-10-15", "2023-10-22", "2023-10-29", "2023-11-05", "2023-11-12", "2023-11-19",
                              "2023-11-26", "2023-12-03", "2023-12-10", "2023-12-17", "2023-12-24", "2023-12-31",
                              "2024-01-07", "2024-01-14", "2024-01-21", "2024-01-28", "2024-02-04", "2024-02-11",
                              "2024-02-18", "2024-02-25", "2024-03-03", "2024-03-10", "2024-03-17", "2024-03-24",
                              "2024-03-31", "2024-04-07", "2024-04-14", "2024-04-21", "2024-04-28", "2024-05-05",
                              "2024-05-12", "2024-05-19", "2024-05-26", "2024-06-02", "2024-06-09", "2024-06-16"],
                series: [
                  {
                    name: '测试1',
                    data: [1725.21, 1702.3, 1502.73, 1477.96, 1446.39, 1428.17, 1430.33, 1414.87, 1401.98, 1402.72,
                      1425.74, 1395.82, 1403.2, 1390.17, 1406.87, 1430.93, 1461.82, 1469.92, 1424.01, 1433.04, 1429.04,
                      1384.63, 1388.67, 1401.93, 1419.21, 1420.2, 1410.48, 1401.84, 1429.24, 1423.06, 1440.39, 1419.66,
                      1440.29, 1420.66, 1422, 1522.35, 1472.22, 1377.09, 1340.33, 1323.09, 1307.39, 1321.06, 1327.9,
                      1459.56, 1461.07, 1476.48, 1483.61, 1470.31, 1455.58, 1447.38, 1468.99, 1467.4, 1501.4, 1575.02],
                    color: '#ff6120',
                    legendShape: 'square'
                  },
                  {
                    name: '测试1',
                    data: [765.58, 968.61, 998.69, 960.12, 1034.85, 1014.98, 959.33, 1013.8, 957.82, 1004.96, 862,
                      975.3, 888.52, 899.78, 834.1, 800.06, 786.75, 889.42, 782, 824.91, 984.86, 972.81, 964.4, 977.82,
                      961.95, 953.2, 941.05, 935.77, 946.93, 939.28, 931.68, 929.26, 945.38, 934.92, 929.05, 932.39,
                      933.58, 929.19, 916.74, 908.58, 899.15, 903.88, 895.3, 889.5, 883.96, 887.94, 879.87, 878.24,
                      872.99, 869.41, 878.88, 869.63, 855.07, 851.64],
                    color: '#ff6120',
                    legendShape: 'square'
                  }
                ],
                scrollPosition: 'right'
              })

            }, 500)
            // this.init()
          }
        })
          .width('100%')
          .height(300)


        UCharts({
          controller: this.priceChart,contentHeight: 300, onReady: () => {
            this.priceChart.updateData(this.priceOption)
          }
        })
      }
      .padding({ left: 12, right: 12 })
    }.hideTitleBar(true)
    .backgroundColor("#f7f8fa")
  }
}
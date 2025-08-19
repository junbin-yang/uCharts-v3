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
  @State chart: UChartsController = new UChartsController()
  @State contentWidth: number|string = "auto"
  @State contentHeight: number|string = 300
  private opts: Partial<ChartOptions> = {
    type: 'line',
    padding: [20, 40, 25, 0],
    dataLabel: false,
    legend: {
      show: true
    },
    extra: {
      line: {
        linearType: 'none',
        type: 'curve'
      }
    },
    rotate: false,
    scrollPosition: 'right',
    enableScroll: true,
    xAxis: {
      scrollShow: true,
      itemCount: 4,
      disableGrid: true,
      scrollAlign: 'right',
      boundaryGap: 'justify'
    },
    yAxis: {
      disabled: false,
      disableGrid: false,
      splitNumber: 3,
      showTitle: true,
      data: [{ title: '单位(次)', tofix: 0, }]
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
          }})
      }
      .padding({ left: 12, right: 12 })
    }.hideTitleBar(true)
    .backgroundColor("#f7f8fa")
  }
}
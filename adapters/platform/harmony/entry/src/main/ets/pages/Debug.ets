import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import { ChartOptions, UCharts, UChartsController, setUChartsGlobalConfig } from "@ibestservices/ucharts"
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

  aboutToAppear(): void {
    /*
    setUChartsGlobalConfig({
      pieChartLinePadding: 0,
      pieChartTextPadding: 0
    })
    */
  }
  private option: Partial<ChartOptions> = {
    type: "pie",
    series: [
      {
        data: [
          {value: 1709.74, name: '储值账户'},
          {value: 203.6, name: '赠送卡金'},
          {value: 1415.77, name: '次卡'},
          {value: 240, name: '套盒'},
          {value: 0, name: '项目套装'}
        ]
      }
    ],
    dataLabel: false,
    padding: [0,0,0,0],
    //dataPointShape: false,
    legend: {
      show: false
    },
    extra: {
      pie: {
        activeOpacity: 0.5,
        activeRadius: 2,
        offsetAngle:0,
        border: false,
        labelWidth: 15
      }
    }
  }
  @State chart: UChartsController = new UChartsController()

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
          controller: this.chart, contentWidth:100, contentHeight:100, onReady: () => {
            this.chart.updateData(this.option)
          }
        }).border({ width: 1 })
      }
      .padding({ left: 12, right: 12 })
    }.hideTitleBar(true)
    .backgroundColor("#f7f8fa")
  }
}
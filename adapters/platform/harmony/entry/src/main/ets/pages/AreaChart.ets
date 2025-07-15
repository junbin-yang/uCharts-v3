import { IBestButton, IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { Series, UCharts, UChartsController } from "@qiuyun/ucharts"
import { chartDemoType } from "./common/type"

@Component
export struct AreaChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetAreaChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("area")[0] as Record<string, object>
    const title_param: Record<string, number> = Param.name as Record<string, number>
    this.title = getContext().resourceManager.getStringSync(title_param.id)
    this.icon = Param.icon as Resource
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
      List() {
        ForEach(this.demoData, (item: chartDemoType, index: number)=>{
          ListItem() {
            ComponentShowContainer({title: item.title}) {
              Flex({
                wrap: FlexWrap.Wrap,
                space: { main: LengthMetrics.vp(12), cross: LengthMetrics.vp(12) }
              }) {
                UCharts({controller: item.ctl, onReady: () => {
                  item.ctl.updateData(item.opts)
                }}).height(260)

                //CollapseAndExpand({ value: GetColumnDemoCodeStr(index) })
              }
            }
          }
        }, (item: chartDemoType) => {
          return item.title
        })
        ListItem() {}.margin({bottom: 20})
      }
      .layoutWeight(1)
      .padding({ left: 12, right: 12 })
    }.hideTitleBar(true)
    .backgroundColor("#f7f8fa")
  }
}

const SetAreaChartDemo = () => {
  const categories = ["2018","2019","2020","2021","2022","2023"];
  const series: Series[] = [
    {
      name: "成交量A",
      data: [35,8,25,37,4,20]
    },
    {
      name: "成交量B",
      data: [70,40,65,100,44,68]
    },
    {
      name: "成交量C",
      data: [100,80,95,150,112,132]
    }
  ];
  return [
    {
      title: "基本折线区域图",
      opts: {
        type: "area",
        categories: categories,
        series: series,
        padding: [15,10,0,0],
        xAxis: { disableGrid: true },
        yAxis: {
          gridType: "dash",
          dashLength: 2
        },
        extra: {
          area: {
            type: "straight",
            opacity: 0.2,
            addLine: true,
            width: 2,
            gradient: false,
            activeType: "hollow"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "渐变色曲线区域图",
      opts: {
        type: "area",
        categories: categories,
        series: series,
        padding: [15,10,0,0],
        xAxis: { disableGrid: true },
        yAxis: {
          gridType: "dash",
          dashLength: 2
        },
        extra: {
          area: {
            type: "curve",
            opacity: 0.2,
            addLine: true,
            width: 2,
            gradient: false,
            activeType: "hollow"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "渐变色时序区域图",
      opts: {
        type: "area",
        categories: categories,
        series: series,
        padding: [15,10,0,0],
        xAxis: { disableGrid: true },
        yAxis: {
          gridType: "dash",
          dashLength: 2
        },
        extra: {
          area: {
            type: "step",
            opacity: 0.2,
            addLine: true,
            width: 2,
            gradient: false,
            activeType: "hollow"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "时间轴(矢量轴)区域图",
      opts: {
        type: "area",
        series: [
          {
            name: "时间轴1",
            data: [[10000,55],[30000,25],[50000,55],[70000,25],[90000,55]]
          },
          {
            name: "时间轴2",
            data: [[0,25],[20000,55],[40000,25],[60000,55],[80000,25]]
          },
          {
            name: "时间轴3",
            data: [[0,55],[15000,25],[30000,55],[45000,25],[60000,55]]
          }
        ],
        padding: [15,10,0,0],
        xAxis: {
          disableGrid: true,
          boundaryGap: "justify",
          formatter: ((value: string | number) => {
            const date = new Date((Number(value)) * 1000)
            const h: string = date.getHours() > 9 ? `${date.getHours()}` : `0${date.getHours()}`
            const m: string = date.getMinutes() > 9 ? `${date.getMinutes()}` : `0${date.getMinutes()}`
            return `${h}:${m}`
          })
        },
        yAxis: {
          gridType: "dash",
          dashLength: 2,
          data: [
            {
              min: 0,
              max: 80
            }
          ]
        },
        extra: {
          area: {
            type: "curve",
            opacity: 0.2,
            addLine: true,
            width: 2,
            gradient: true,
            activeType: "hollow"
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
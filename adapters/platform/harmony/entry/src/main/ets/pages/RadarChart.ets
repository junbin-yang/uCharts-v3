import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { Series, UCharts, UChartsController } from '@ibestservices/ucharts'
import { chartDemoType } from "./common/type"

@Component
export struct RadarChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetRadarChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("radar")[0] as Record<string, object>
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

const SetRadarChartDemo = () => {
  const categories: string[] = ["维度1","维度2","维度3","维度4","维度5","维度6"];
  const series: Series[] = [
    {
      name: "成交量1",
      data: [90,110,165,195,187,172]
    },
    {
      name: "成交量2",
      data: [190,210,105,35,27,102]
    }
  ];
  return [
    {
      title: "多边形雷达图",
      opts: {
        type: "radar",
        categories: categories,
        series: series,
        padding: [5,5,5,5],
        dataLabel: false,
        legend: {
          show: true,
          position: "right",
          lineHeight: 25
        },
        extra: {
          radar: {
            gridType: "radar",
            gridColor: "#CCCCCC",
            gridCount: 3,
            opacity: 0.2,
            max: 200,
            labelShow: true,
            border: true
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "圆形雷达图",
      opts: {
        type: "radar",
        categories: categories,
        series: series,
        padding: [5,5,5,5],
        dataLabel: false,
        legend: {
          show: true,
          position: "right",
          lineHeight: 25
        },
        extra: {
          radar: {
            gridType: "circle",
            gridColor: "#CCCCCC",
            gridCount: 3,
            opacity: 0.2,
            max: 200,
            labelShow: true
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "刻度标签+网格抽稀",
      opts: {
        type: "radar",
        categories: categories,
        series: series,
        padding: [5,5,5,5],
        dataLabel: false,
        dataPointShape: false,
        legend: {
          show: true,
          position: "right",
          lineHeight: 25
        },
        extra: {
          radar: {
            gridType: "circle",
            gridColor: "#CCCCCC",
            gridCount: 3,
            opacity: 0.2,
            max: 200,
            labelShow: true,
            axisLabel: true,
            gridEval: 2,
            border: true
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "渐变色雷达图",
      opts: {
        type: "radar",
        categories: categories,
        series: [
          {
            name: "成交量1",
            data: [90,110,165,195,187,172]
          }
        ],
        padding: [5,5,5,5],
        dataLabel: true,
        dataPointShape: false,
        legend: {
          show: true,
          position: "right",
          lineHeight: 25
        },
        extra: {
          radar: {
            gridType: "circle",
            gridColor: "#CCCCCC",
            gridCount: 3,
            opacity: 1,
            max: 240,
            labelShow: true,
            linearType: "custom",
            border: false
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
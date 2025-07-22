import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { UCharts, UChartsController } from '@ibestservices/ucharts'
import { chartDemoType } from "./common/type"

@Component
export struct GaugeChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetGaugeChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("gauge")[0] as Record<string, object>
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

const SetGaugeChartDemo = () => {
  return [
    {
      title: "基本仪表盘",
      opts: {
        type: "gauge",
        categories: [{"value":0.2,"color":"#1890ff"},{"value":0.8,"color":"#2fc25b"},{"value":1,"color":"#f04864"}],
        series: [
          { name: "完成率", data: 0.6 }
        ],
        title: {
          value: "60Km/H",
          fontSize: 25,
          color: "#2fc25b",
          offsetY: 50
        },
        subtitle: {
          value: "实时速度",
          fontSize: 15,
          color: "#666666",
          offsetY: -50
        },
        extra: {
          gauge: {
            type: "default",
            width: 30,
            labelColor: "#666666",
            startAngle: 0.75,
            endAngle: 0.25,
            startNumber: 0,
            endNumber: 100,
            splitLine: {
              fixRadius: 0,
              splitNumber: 10,
              width: 30,
              color: "#FFFFFF",
              childNumber: 5,
              childWidth: 12
            },
            pointer: {
              width: 24,
              color: "auto"
            }
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "其他仪表盘",
      opts: {
        type: "gauge",
        series: [
          { name: "完成率", data: 0.66 }
        ],
        title: {
          value: "66Km/H",
          fontSize: 25,
          color: "#2fc25b",
          offsetY: 0
        },
        subtitle: {
          value: "实时速度",
          fontSize: 15,
          color: "#1890ff",
          offsetY: 0
        },
        extra: {
          gauge: {
            type: "progress",
            width: 20,
            startAngle: 0.75,
            endAngle: 0.25,
            splitLine: {
              fixRadius: -10,
              splitNumber: 10,
              width: 15,
              color: "#FFFFFF",
              childNumber: 5
            }
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
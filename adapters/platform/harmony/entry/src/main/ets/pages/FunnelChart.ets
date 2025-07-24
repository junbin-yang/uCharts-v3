import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { FunnelSeries, UCharts, UChartsController } from '@ibestservices/ucharts'
import { chartDemoType } from "./common/type"

@Component
export struct FunnelChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetFunnelChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("funnel")[0] as Record<string, object>
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

const SetFunnelChartDemo = () => {
  const series: FunnelSeries[] = [
    {
      data: [
        {"name":"一班","centerText":"50","value":50},
        {"name":"二班","centerText":"30","value":30},
        {"name":"三班","centerText":"20","value":20},
        {"name":"四班","centerText":"18","value":18},
        {"name":"五班","centerText":"8","value":8}
      ]
    }
  ]
  return [
    {
      title: "标准漏斗图",
      opts: {
        type: "funnel",
        series: series,
        padding: [15,15,0,15],
        extra: {
          funnel: {
            activeOpacity: 0.3,
            activeWidth: 10,
            border: true,
            borderWidth: 2,
            borderColor: "#FFFFFF",
            fillOpacity: 1,
            labelAlign: "right"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "渐变色+自定义标签",
      opts: {
        type: "funnel",
        series: [
          {
            data: [
              {"name":"一班","centerText":"50","value":50},
              {"name":"二班","centerText":"30","value":30,"labelShow":false},
              {"name":"三班","centerText":"20","value":20,"labelShow":false},
              {"name":"四班","centerText":"18","value":18,"labelText":"四班:18人"},
              {"name":"五班","centerText":"8","value":8,"labelShow":false}
            ]
          }
        ],
        padding: [15,15,0,15],
        extra: {
          funnel: {
            activeOpacity: 0.3,
            activeWidth: 10,
            border: true,
            borderWidth: 2,
            borderColor: "#FFFFFF",
            fillOpacity: 1,
            labelAlign: "right",
            linearType: "custom",
            minSize: 20
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "倒三角形漏斗图",
      opts: {
        type: "funnel",
        series: series,
        padding: [15,15,0,15],
        extra: {
          funnel: {
            activeOpacity: 0.3,
            activeWidth: 10,
            border: true,
            borderWidth: 2,
            borderColor: "#FFFFFF",
            fillOpacity: 1,
            labelAlign: "right",
            type: "triangle"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "金字塔形漏斗图",
      opts: {
        type: "funnel",
        series: series,
        padding: [15,15,0,15],
        extra: {
          funnel: {
            activeOpacity: 0.3,
            activeWidth: 10,
            border: true,
            borderWidth: 2,
            borderColor: "#FFFFFF",
            fillOpacity: 1,
            labelAlign: "left",
            type: "pyramid"
          }
        }
      },
      ctl: new UChartsController()
    }
  ] as chartDemoType[]
}
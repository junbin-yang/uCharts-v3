import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { Series, UCharts, UChartsController } from '@ibestservices/ucharts'
import { chartDemoType } from "./common/type"

@Component
export struct RingChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetRingChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("ring")[0] as Record<string, object>
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
                }})

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

const SetRingChartDemo = () => {
  const series: Series[] =  [
    {
      data: [
        {name:"一班",value:50},
        {name:"二班",value:30},
        {name:"三班",value:20},
        {name:"四班",value:18},
        {name:"五班",value:8}
      ]
    }
  ]
  return [
    {
      title: "基本环形图",
      opts: {
        type: "ring",
        series: series,
        padding: [5,5,5,5],
        legend: {
          show: true,
          position: "right",
          lineHeight: 25
        },
        title: {
          value: "收益率",
          fontSize: 10,
          color: "#666666"
        },
        subtitle: {
          value: "70%",
          fontSize: 16,
          color: "#7cb5ec"
        },
        extra: {
          ring: {
            ringWidth: 60,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: false,
            borderWidth: 3,
            borderColor: "#FFFFFF"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "分割线+渐变色",
      opts: {
        type: "ring",
        series: series,
        padding: [5,5,5,5],
        legend: {
          show: true,
          position: "right",
          lineHeight: 25
        },
        title: {
          value: "收益率",
          fontSize: 10,
          color: "#666666"
        },
        subtitle: {
          value: "70%",
          fontSize: 16,
          color: "#7cb5ec"
        },
        extra: {
          ring: {
            ringWidth: 60,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: true,
            borderWidth: 3,
            borderColor: "#FFFFFF",
            linearType: "custom"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "自定义标签内容",
      opts: {
        type: "ring",
        series: [
          {
            data: [
              {"name":"一班","value":50},
              {"name":"二班","value":30},
              {"name":"三班","value":20},
              {"name":"四班","value":18,"labelText":"四班:18人"},
              {"name":"五班","value":8}
            ]
          }
        ],
        padding: [5,5,5,5],
        legend: {
          show: true,
          position: "right",
          lineHeight: 25
        },
        title: {
          value: "收益率",
          fontSize: 10,
          color: "#666666"
        },
        subtitle: {
          value: "70%",
          fontSize: 16,
          color: "#7cb5ec"
        },
        extra: {
          ring: {
            ringWidth: 60,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: true,
            borderWidth: 3,
            borderColor: "#FFFFFF"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "自定义标签隐藏",
      opts: {
        type: "ring",
        series: [
          {
            data: [
              {"name":"一班","value":50,"labelShow":false},
              {"name":"二班","value":30,"labelShow":false},
              {"name":"三班","value":20,"labelShow":false},
              {"name":"四班","value":18},
              {"name":"五班","value":8,"labelShow":false}
            ]
          }
        ],
        padding: [5,5,5,5],
        legend: {
          show: true,
          position: "right",
          lineHeight: 25
        },
        title: {
          value: "收益率",
          fontSize: 10,
          color: "#666666"
        },
        subtitle: {
          value: "70%",
          fontSize: 16,
          color: "#7cb5ec"
        },
        extra: {
          ring: {
            ringWidth: 60,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: true,
            borderWidth: 3,
            borderColor: "#FFFFFF"
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
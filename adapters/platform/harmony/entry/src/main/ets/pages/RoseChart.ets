import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { Series, UCharts, UChartsController } from '@qiuyun/ucharts-v3'
import { chartDemoType } from "./common/type"

@Component
export struct RoseChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetRoseChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("rose")[0] as Record<string, object>
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

const SetRoseChartDemo = () => {
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
      title: "面积玫瑰图",
      opts: {
        type: "rose",
        series: series,
        padding: [5,5,5,5],
        legend: {
          show: true,
          position: "left",
          lineHeight: 25
        },
        extra: {
          rose: {
            type: "area",
            minRadius: 50,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: false,
            borderWidth: 2,
            borderColor: "#FFFFFF"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "半径玫瑰图+分割线+渐变色",
      opts: {
        type: "rose",
        series: series,
        padding: [5,5,5,5],
        legend: {
          show: true,
          position: "left",
          lineHeight: 25
        },
        extra: {
          rose: {
            type: "radius",
            minRadius: 50,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: true,
            borderWidth: 2,
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
        type: "rose",
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
          position: "left",
          lineHeight: 25
        },
        extra: {
          rose: {
            type: "area",
            minRadius: 50,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: false,
            borderWidth: 2,
            borderColor: "#FFFFFF"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "自定义标签隐藏",
      opts: {
        type: "rose",
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
          position: "left",
          lineHeight: 25
        },
        extra: {
          rose: {
            type: "area",
            minRadius: 50,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: false,
            borderWidth: 2,
            borderColor: "#FFFFFF"
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
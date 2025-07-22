import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { UCharts, UChartsController } from '@ibestservices/ucharts'
import { chartDemoType } from "./common/type"

@Component
export struct ArcBarChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetArcBarChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("arcbar")[0] as Record<string, object>
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

const SetArcBarChartDemo = () => {
  return [
    {
      title: "圆弧进度条+渐变色",
      opts: {
        type: "arcbar",
        series: [
          {
            name: "正确率",
            color: "#2fc25b",
            data: 0.8
          }
        ],
        title: {
          value: "80%",
          fontSize: 35,
          color: "#2fc25b"
        },
        subtitle: {
          value: "正确率",
          fontSize: 25,
          color: "#666666"
        },
        extra: {
          arcbar: {
            type: "default",
            width: 12,
            backgroundColor: "#E9E9E9",
            startAngle: 0.75,
            endAngle: 0.25,
            gap: 2,
            linearType: "custom"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "多重整圆进度条",
      opts: {
        type: "arcbar",
        series: [
          { name: "一班", data: 0.8 },
          { name: "二班", data: 0.6 },
          { name: "三班", data: 0.45 },
          { name: "四班", data: 0.3 },
          { name: "五班", data: 0.15 }
        ],
        title: {
          value: "指标",
          fontSize: 35,
          color: "#1890ff"
        },
        subtitle: {
          value: "默认标题",
          fontSize: 15,
          color: "#666666"
        },
        extra: {
          arcbar: {
            type: "circle",
            width: 12,
            backgroundColor: "#E9E9E9",
            startAngle: 1.5,
            endAngle: 0.25,
            gap: 2
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "逆时针+圆弧进度条",
      opts: {
        type: "arcbar",
        series: [
          {
            name: "正确率",
            color: "#2fc25b",
            data: 0.8
          }
        ],
        title: {
          value: "80%",
          fontSize: 35,
          color: "#2fc25b"
        },
        subtitle: {
          value: "正确率",
          fontSize: 25,
          color: "#666666"
        },
        extra: {
          arcbar: {
            type: "default",
            width: 12,
            backgroundColor: "#E9E9E9",
            startAngle: 0.25,
            endAngle: 0.75,
            gap: 2,
            direction: "ccw",
            linearType: "custom"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "逆时针+多重整圆进度条",
      opts: {
        type: "arcbar",
        series: [
          { name: "一班", data: 0.8 },
          { name: "二班", data: 0.6 },
          { name: "三班", data: 0.45 },
          { name: "四班", data: 0.3 },
          { name: "五班", data: 0.15 }
        ],
        title: {
          value: "指标",
          fontSize: 35,
          color: "#1890ff"
        },
        subtitle: {
          value: "默认标题",
          fontSize: 15,
          color: "#666666"
        },
        extra: {
          arcbar: {
            type: "circle",
            width: 12,
            backgroundColor: "#E9E9E9",
            startAngle: 1.5,
            endAngle: 0.25,
            gap: 2,
            direction: "ccw"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "圆角整圆进度条",
      opts: {
        type: "arcbar",
        series: [
          {
            name: "正确率",
            color: "#2fc25b",
            data: 0.8
          }
        ],
        title: {
          value: "80%",
          fontSize: 35,
          color: "#2fc25b"
        },
        subtitle: {
          value: "正确率",
          fontSize: 25,
          color: "#666666"
        },
        extra: {
          arcbar: {
            type: "circle",
            width: 12,
            backgroundColor: "#E9E9E9",
            startAngle: 1.5,
            endAngle: 0.25,
            gap: 2
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "平角整圆进度条",
      opts: {
        type: "arcbar",
        series: [
          {
            name: "正确率",
            color: "#2fc25b",
            data: 0.8
          }
        ],
        title: {
          value: "80%",
          fontSize: 35,
          color: "#2fc25b"
        },
        subtitle: {
          value: "正确率",
          fontSize: 25,
          color: "#666666"
        },
        extra: {
          arcbar: {
            type: "circle",
            width: 12,
            backgroundColor: "#E9E9E9",
            startAngle: 1.5,
            endAngle: 0.25,
            gap: 2,
            lineCap: "butt"
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
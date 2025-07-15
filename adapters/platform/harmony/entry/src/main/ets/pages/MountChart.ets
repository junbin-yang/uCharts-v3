import { IBestButton, IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { Series, UCharts, UChartsController } from "@qiuyun/ucharts"
import { chartDemoType } from "./common/type"

@Component
export struct MountChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetMountChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("mount")[0] as Record<string, object>
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

const SetMountChartDemo = () => {
  const series: Series[] = [
    {
      data: [
        {"name":"一班","value":82},
        {"name":"二班","value":63},
        {"name":"三班","value":86},
        {"name":"四班","value":65},
        {"name":"五班","value":79}
      ]
    }
  ]
  return [
    {
      title: "圆角山峰图",
      opts: {
        type: "mount",
        series: series,
        padding: [15,15,0,5],
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          mount: {
            type: "mount",
            widthRatio: 1.5
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "尖角山峰图",
      opts: {
        type: "mount",
        series: series,
        padding: [15,15,0,5],
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          mount: {
            type: "sharp",
            widthRatio: 1.5
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "三角山峰图",
      opts: {
        type: "mount",
        series: series,
        padding: [15,15,0,5],
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          mount: {
            type: "triangle",
            widthRatio: 1.5
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "直角山峰图",
      opts: {
        type: "mount",
        series: series,
        padding: [15,15,0,5],
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          mount: {
            type: "bar",
            widthRatio: 0.8
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "正负山峰图无边渐变色",
      opts: {
        type: "mount",
        series: [
          {
            data: [{"name":"一班","value":82},{"name":"二班","value":-63},{"name":"三班","value":86},{"name":"四班","value":-75},{"name":"五班","value":79}]
          }
        ],
        padding: [15,15,0,5],
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: -100, max: 100 }], splitNumber: 4 },
        extra: {
          mount: {
            type: "mount",
            widthRatio: 1.5,
            borderWidth: 0,
            linearType: "custom"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "山峰图有边透明渐变+滚动条",
      opts: {
        type: "mount",
        series: series,
        padding: [15,15,0,5],
        enableScroll: true,
        xAxis: { disableGrid: true, itemCount: 4, scrollShow: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          mount: {
            type: "sharp",
            widthRatio: 1.5,
            borderWidth: 2,
            linearType: "opacity",
            linearOpacity: 0.1
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "山峰图有边渐变+标记线",
      opts: {
        type: "mount",
        series: series,
        padding: [15,40,0,5],
        enableMarkLine: true,
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          mount: {
            type: "triangle",
            widthRatio: 1,
            borderWidth: 2,
            linearType: "custom"
          },
          markLine: {
            type: "solid",
            dashLength: 4,
            data: [
              {
                value: 45,
                lineColor: "#DE4A42",
                showLabel: true,
                labelAlign: "right",
                labelOffsetX: 0,
                labelOffsetY: 0,
                labelText: "均值",
                labelFontColor: "#666666",
                labelBgColor: "#DFE8FF",
                labelBgOpacity: 0.8
              }
            ]
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "山峰图圆角渐变色柱状图",
      opts: {
        type: "mount",
        series: series,
        padding: [15,15,0,5],
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          mount: {
            type: "bar",
            widthRatio: 0.3,
            borderWidth: 0,
            barBorderRadius: [50, 50, 50, 50],
            linearType: "custom"
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
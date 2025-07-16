import { IBestButton, IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { chartDemoType } from "./common/type"
import { UCharts, UChartsController } from "@ibestservices/ucharts"

@Component
export struct BubbleChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetBubbleChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("bubble")[0] as Record<string, object>
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

const SetBubbleChartDemo = () => {
  return [
    {
      title: "气泡图",
      opts: {
        type: "bubble",
        series: [
          {
            name: "气泡一",
            data: [[95,95,23,"标题1"],[30,55,33,"标题2"]]
          },
          {
            name: "气泡二",
            data: [[130,30,30,"标题3"],[200,90,40,"标题4"]]
          }
        ],
        padding: [15,15,0,0],
        xAxis: {
          disableGrid: false,
          gridType: "dash",
          splitNumber: 5,
          boundaryGap: "justify",
          min: 0,
          max: 250
        },
        yAxis: {
          disableGrid: false,
          gridType: "dash",
          data: [
            {
              min: 0,
              max: 150
            }
          ]
        },
        extra: {
          bubble: {
            border: 2,
            opacity: 0.5
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { UCharts, UChartsController } from '@ibestservices/ucharts'
import { chartDemoType } from "./common/type"

@Component
export struct WordChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetWordChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("word")[0] as Record<string, object>
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

const SetWordChartDemo = () => {
  return [
    {
      title: "水平排列",
      opts: {
        type: "word",
        series: [
          { name: "跨全端图表", textSize: 25, color: "#ef0c0c" },
          { name: "微信小程序", textSize: 20 },
          { name: "支付宝小程序", textSize: 20 },
          { name: "百度小程序", textSize: 20 },
          { name: "QQ小程序", textSize: 20 },
          { name: "头条小程序", textSize: 20 },
          { name: "抖音小程序", textSize: 20 },
          { name: "360小程序", textSize: 20 },
          { name: "跨全端", textSize: 10 },
          { name: "跨全端", textSize: 12 },
          { name: "跨全端", textSize: 10 },
          { name: "跨全端", textSize: 12 },
          { name: "跨全端", textSize: 10 },
          { name: "跨全端", textSize: 12 },
          { name: "跨全端", textSize: 10 },
          { name: "跨全端", textSize: 12 }
        ],
        extra: {
          word: {
            type: "normal"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "水平垂直混排",
      opts: {
        type: "word",
        series: [
          { name: "跨全端图表", textSize: 25 },
          { name: "微信小程序", textSize: 20 },
          { name: "支付宝小程序", textSize: 20 },
          { name: "百度小程序", textSize: 20 },
          { name: "QQ小程序", textSize: 20 },
          { name: "头条小程序", textSize: 20 },
          { name: "抖音小程序", textSize: 20 },
          { name: "360小程序", textSize: 20 },
          { name: "跨全端", textSize: 10 },
          { name: "跨全端", textSize: 12 },
          { name: "跨全端", textSize: 10 },
          { name: "跨全端", textSize: 12 },
          { name: "跨全端", textSize: 10 },
          { name: "跨全端", textSize: 12 },
          { name: "跨全端", textSize: 10 },
          { name: "跨全端", textSize: 12 }
        ],
        extra: {
          word: {
            type: "vertical"
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
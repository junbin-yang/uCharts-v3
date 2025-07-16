import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { UCharts, UChartsController } from "@ibestservices/ucharts"
import { chartDemoType } from "./common/type"

@Component
export struct ScatterChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetScatterChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("scatter")[0] as Record<string, object>
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


const SetScatterChartDemo = () => {
  return [
    {
      title: "散点图",
      opts: {
        type: "scatter",
        series: [
          {
            name: "散点一",
            data: [[10,8.04],[8.07,6.95],[13,7.58],[9.05,8.81],[11,8.33],[14,7.66],[13.4,6.81],[10,6.33],[14,8.96],[12.5,6.82]]
          },
          {
            name: "散点二",
            data: [[9.15,7.2],[11.5,7.2],[3.03,4.23],[12.2,7.83],[2.02,4.47],[1.05,3.33],[4.05,4.96],[6.03,7.24],[12,6.26],[12,8.84],[7.08,5.82],[5.02,5.68]]
          }
        ],
        padding: [15,15,0,0],
        dataLabel: false,
        xAxis: {
          disableGrid: false,
          gridType: "dash",
          splitNumber: 5,
          boundaryGap: "justify",
          min: 0
        },
        yAxis: {
          disableGrid: false,
          gridType: "dash"
        },
        extra: {}
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
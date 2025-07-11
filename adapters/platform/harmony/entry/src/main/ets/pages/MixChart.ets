import { IBestButton, IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { UCharts, UChartsController } from "@qiuyun/ucharts-v3"
import { chartDemoType } from "./common/type"

@Component
export struct MixChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetMixChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("mix")[0] as Record<string, object>
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

const SetMixChartDemo = () => {
  return [
    {
      title: "多坐标系混合图",
      opts: {
        type: "mix",
        categories: ["2018","2019","2020","2021","2022","2023"],
        series: [
          {
            name: "曲面",
            type: "area",
            style: "curve",
            data: [70,50,85,130,64,88]
          },
          {
            name: "柱1",
            index: 1,
            type: "column",
            data: [40,{"value":30,"color":"#f04864"},55,110,24,58]
          },
          {
            name: "柱2",
            index: 1,
            type: "column",
            data: [50,20,75,60,34,38]
          },
          {
            name: "曲线",
            type: "line",
            style: "curve",
            color: "#1890ff",
            disableLegend: true,
            data: [70,50,85,130,64,88]
          },
          {
            name: "折线",
            type: "line",
            color: "#2fc25b",
            data: [120,140,105,170,95,160]
          },
          {
            name: "点",
            index: 2,
            type: "point",
            color: "#f04864",
            data: [100,80,125,150,112,132]
          }
        ],
        padding: [15,5,5,5],
        rotate: true,
        rotateLock: true,
        xAxis: {
          disableGrid: true,
          title: "单位：年"
        },
        yAxis: {
          disabled: false,
          disableGrid: false,
          splitNumber: 5,
          gridType: "dash",
          dashLength: 4,
          gridColor: "#CCCCCC",
          padding: 10,
          showTitle: true,
          data: [
            {
              position: "left",
              title: "折线"
            },
            {
              position: "right",
              min: 0,
              max: 200,
              title: "柱状图",
              textAlign: "left"
            },
            {
              position: "right",
              min: 0,
              max: 200,
              title: "点",
              textAlign: "left"
            }
          ]
        },
        extra: {
          mix: {
            column: {
              width: 20
            }
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
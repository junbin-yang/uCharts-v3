import { IBestButton, IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { Series, UCharts, UChartsController } from "@ibestservices/ucharts"
import { chartDemoType } from "./common/type"

@Component
export struct BarChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetBarChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("bar")[0] as Record<string, object>
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

const SetBarChartDemo = () => {
  const categories = ["2018","2019","2020","2021","2022","2023"];
  const series: Series[] = [
    {
      name: "目标值",
      data: [35,36,31,33,13,34]
    },
    {
      name: "完成量",
      data: [18,27,21,24,6,28]
    }
  ];
  return [
    {
      title: "堆叠条状图",
      opts: {
        type: "bar",
        categories: categories,
        series: series,
        padding: [15,30,0,5],
        xAxis: {
          boundaryGap: "justify",
          disableGrid: false,
          min: 0,
          axisLine: false,
          max: 70
        },
        extra: {
          bar: {
            type: "stack",
            width: 30,
            meterBorder: 1,
            meterFillColor: "#FFFFFF",
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            categoryGap: 2
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "圆角条状图+渐变色",
      opts: {
        type: "bar",
        categories: categories,
        series: series,
        padding: [15,30,0,5],
        xAxis: {
          boundaryGap: "justify",
          disableGrid: false,
          min: 0,
          axisLine: false,
          max: 40
        },
        extra: {
          bar: {
            type: "group",
            width: 30,
            meterBorder: 1,
            meterFillColor: "#FFFFFF",
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            linearType: "custom",
            barBorderCircle: true,
            seriesGap: 2,
            categoryGap: 2
          }
        }
      },
      ctl: new UChartsController()
    }
  ] as chartDemoType[]
}
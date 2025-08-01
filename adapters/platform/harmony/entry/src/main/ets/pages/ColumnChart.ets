import { IBestButton, IBestDialogUtil, IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { Series, UCharts, UChartsController, UChartsControllerV2, UChartsV2 } from '@ibestservices/ucharts'
import { chartDemoType } from "./common/type"
import { CollapseAndExpand } from "./CollapseAndExpand"
import { GetColumnDemoCodeStr } from "./common/desc"

@Component
export struct ColumnChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetColumnChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("column")[0] as Record<string, object>
    const title_param: Record<string, number> = Param.name as Record<string, number>
    this.title = getContext().resourceManager.getStringSync(title_param.id)
    this.icon = Param.icon as Resource
  }

  @State easyChart:UChartsController =  new UChartsController({
    type: "column",
    categories: ["2018","2019","2020","2021"],
    series: [
      {
        name: "目标",
        data: [35,36,31,33]
      },
      {
        name: "完成",
        data: [18,27,21,24]
      }
    ],
    padding: [15,15,0,5],
    xAxis: { disableGrid: true },
    yAxis: { data: [{ min: 0 }] },
    extra: {
      column: {
        type: "group",
        width: 30,
        activeBgColor: "#000000",
        activeBgOpacity: 0.08
      }
    }
  })

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
        ListItem() {
          ComponentShowContainer({title: "简单用法"}) {
            Flex({
              wrap: FlexWrap.Wrap,
              space: { main: LengthMetrics.vp(12), cross: LengthMetrics.vp(12) }
            }) {
              UCharts({controller: this.easyChart})
              CollapseAndExpand({ value: GetColumnDemoCodeStr(-1) })
            }
          }
        }
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

                CollapseAndExpand({ value: GetColumnDemoCodeStr(index) })
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


const SetColumnChartDemo = () => {
  const categories = ["2018","2019","2020","2021","2022","2023"];
  const series: Series[] =  [
    {
      name: "目标值",
      data: [35,36,31,33,13,34]
    },
    {
      name: "完成量",
      data: [18,27,21,24,6,28]
    }
  ]
  return [
    {
      title: "基础柱状图",
      opts: {
        type: "column",
        categories: categories,
        series: series,
        padding: [15,15,0,5],
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          column: {
            type: "group",
            width: 40,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "堆叠柱状图",
      opts: {
        type: "column",
        categories: categories,
        series: series,
        padding: [15,15,0,5],
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          column: {
            type: "stack",
            width: 30,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            labelPosition: "center"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "圆角+渐变+半透明柱状图",
      opts: {
        type: "column",
        categories: categories,
        series: series,
        padding: [15,15,0,5],
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          column: {
            type: "group",
            width: 30,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            linearType: "custom",
            seriesGap: 5,
            linearOpacity: 0.5,
            barBorderCircle: true,
            customColor: [
              "#FA7D8D",
              "#EB88E2"
            ]
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "温度计图",
      opts: {
        type: "column",
        categories: categories,
        series: series,
        padding: [15,15,0,5],
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          column: {
            type: "meter",
            width: 30,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            meterBorder: 3,
            meterFillColor: "#EBFBD6"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "圆角温度计图",
      opts: {
        type: "column",
        categories: categories,
        series: series,
        padding: [15,15,0,5],
        legend: { show: false },
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          column: {
            type: "meter",
            width: 30,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            meterBorder: 1,
            meterFillColor: "#EBFBD6",
            barBorderRadius: [16,16,16,16]
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "正负柱状图",
      opts: {
        type: "column",
        categories: categories,
        series: [
          {
            name: "成交量A",
            data: [20,-20,25,-25,30,-30]
          }
        ],
        padding: [15,15,0,5],
        legend: { show: false },
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: -40, max: 40 }], splitNumber: 4 },
        extra: {
          column: {
            type: "group",
            width: 30,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            barBorderCircle: true,
            linearType: "custom"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "柱状图滚动条",
      opts: {
        type: "column",
        categories: categories,
        series: series,
        padding: [15,15,0,5],
        touchMoveLimit: 24,
        enableScroll: true,
        xAxis: {
          disableGrid: true,
          scrollShow: true,
          itemCount: 4
        },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          column: {
            type: "group",
            width: 30,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "圆角柱状图+标记线",
      opts: {
        type: "column",
        categories: categories,
        series: [
          {
            name: "目标值",
            data: [35,36,31,33,13,34]
          },
          {
            name: "完成量",
            data: [18,27,{"value":21,"color":"#EE6666"},24,6,28]
          }
        ],
        padding: [15,15,0,5],
        enableMarkLine: true,
        xAxis: { disableGrid: true },
        yAxis: { data: [{ min: 0 }] },
        extra: {
          column: {
            type: "group",
            width: 30,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            seriesGap: 5,
            barBorderRadius: [6, 6, 6, 6]
          },
          markLine: {
            data: [{ value: 21, showLabel: true }]
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}


@ComponentV2
export struct ColumnChartV2 {
  @Local title: string = ""
  @Local icon: Resource = $r("app.media.column")

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("column_v2")[0] as Record<string, object>
    const title_param: Record<string, number> = Param.name as Record<string, number>
    this.title = getContext().resourceManager.getStringSync(title_param.id)
    this.icon = Param.icon as Resource
  }

  @Local easyChart:UChartsControllerV2 =  new UChartsControllerV2({
    type: "column",
    categories: ["2018","2019","2020","2021"],
    series: [
      {
        name: "目标",
        data: [35,36,31,33]
      },
      {
        name: "完成",
        data: [18,27,21,24]
      }
    ],
    padding: [15,15,0,5],
    xAxis: { disableGrid: true },
    yAxis: { data: [{ min: 0 }] },
    extra: {
      column: {
        type: "group",
        width: 30,
        activeBgColor: "#000000",
        activeBgOpacity: 0.08
      }
    }
  })

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
        ListItem() {
          ComponentShowContainer({title: ""}) {
            Flex({
              wrap: FlexWrap.Wrap,
              space: { main: LengthMetrics.vp(12), cross: LengthMetrics.vp(12) }
            }) {
              UChartsV2({controller: this.easyChart}).height(260)
              CollapseAndExpand({ value: GetColumnDemoCodeStr(-2) })
            }
          }
        }
      }
      .layoutWeight(1)
      .padding({ left: 12, right: 12 })
    }.hideTitleBar(true)
    .backgroundColor("#f7f8fa")
  }
}
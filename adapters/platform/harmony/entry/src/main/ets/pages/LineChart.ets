import { IBestButton, IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { chartDemoType } from "./common/type"
import { Series, UCharts, UChartsController } from "@ibestservices/ucharts"

@Component
export struct LineChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetLineChartDemo()

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("line")[0] as Record<string, object>
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

const SetLineChartDemo = () => {
  const categories = ["2018","2019","2020","2021","2022","2023"];
  const series: Series[] = [
    {
      name: "成交量A",
      data: [35,8,25,37,4,20]
    },
    {
      name: "成交量B",
      data: [70,40,65,100,44,68]
    },
    {
      name: "成交量C",
      data: [100,80,95,150,112,132]
    }
  ];
  return [
    {
      title: "基本折线图",
      opts: {
        type: "line",
        categories: categories,
        series: series,
        padding: [15,10,0,0],
        xAxis: { disableGrid: true },
        yAxis: {
          gridType: "dash",
          dashLength: 2
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
            activeType: "hollow"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "基本曲线图",
      opts: {
        type: "line",
        categories: categories,
        series: series,
        padding: [15,10,0,0],
        xAxis: { disableGrid: true },
        yAxis: {
          gridType: "dash",
          dashLength: 2
        },
        extra: {
          line: {
            type: "curve",
            width: 2,
            activeType: "hollow"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "基本时序图",
      opts: {
        type: "line",
        categories: categories,
        series: series,
        padding: [15,10,0,0],
        xAxis: { disableGrid: true },
        yAxis: {
          gridType: "dash",
          dashLength: 2
        },
        extra: {
          line: {
            type: "step",
            width: 2,
            activeType: "hollow"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "折线图+断点续连connectNulls",
      opts: {
        type: "line",
        categories: categories,
        series: [
          {
            name: "成交量A",
            data: [35,8,null,37,4,20]
          },
          {
            name: "成交量B",
            connectNulls: true,
            data: [70,40,null,100,44,68]
          },
          {
            name: "成交量C",
            data: [100,80,null,150,112,132]
          }
        ],
        padding: [15,10,0,0],
        xAxis: { disableGrid: true },
        yAxis: {
          gridType: "dash",
          dashLength: 2
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
            activeType: "hollow"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "渐变色曲线图",
      opts: {
        type: "line",
        categories: categories,
        series: [
          {
            name: "成交量A",
            linearColor: [
              [
                0,
                "#1890FF"
              ],
              [
                0.25,
                "#00B5FF"
              ],
              [
                0.5,
                "#00D1ED"
              ],
              [
                0.75,
                "#00E6BB"
              ],
              [
                1,
                "#90F489"
              ]
            ],
            data: [15,45,15,45,15,45]
          },
          {
            name: "成交量B",
            linearColor: [
              [
                0,
                "#91CB74"
              ],
              [
                0.25,
                "#2BDCA8"
              ],
              [
                0.5,
                "#2AE3A0"
              ],
              [
                0.75,
                "#C4D06E"
              ],
              [
                1,
                "#F2D375"
              ]
            ],
            data: [55,85,55,85,55,85]
          },
          {
            name: "成交量C",
            linearColor: [
              [
                0,
                "#FAC858"
              ],
              [
                0.33,
                "#FFC371"
              ],
              [
                0.66,
                "#FFC2B2"
              ],
              [
                1,
                "#FA7D8D"
              ]
            ],
            data: [95,125,95,125,95,125]
          }
        ],
        padding: [15,10,0,0],
        dataLabel: false,
        dataPointShape: false,
        xAxis: { disableGrid: true },
        yAxis: {
          gridType: "dash",
          dashLength: 2,
          data: [
            {
              min: 0,
              max: 150
            }
          ]
        },
        extra: {
          line: {
            type: "curve",
            width: 2,
            activeType: "hollow",
            linearType: "custom"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "渐变色+阴影+水平动画",
      opts: {
        type: "line",
        categories: categories,
        series: [
          {
            name: "成交量A",
            linearColor: [
              [
                0,
                "#1890FF"
              ],
              [
                0.25,
                "#00B5FF"
              ],
              [
                0.5,
                "#00D1ED"
              ],
              [
                0.75,
                "#00E6BB"
              ],
              [
                1,
                "#90F489"
              ]
            ],
            setShadow: [
              3,
              8,
              10,
              "#1890FF"
            ],
            data: [15,45,15,45,15,45]
          },
          {
            name: "成交量B",
            data: [55,85,55,85,55,85]
          },
          {
            name: "成交量C",
            linearColor: [
              [
                0,
                "#FAC858"
              ],
              [
                0.33,
                "#FFC371"
              ],
              [
                0.66,
                "#FFC2B2"
              ],
              [
                1,
                "#FA7D8D"
              ]
            ],
            setShadow: [
              3,
              8,
              10,
              "#FC8452"
            ],
            data: [95,125,95,125,95,125]
          }
        ],
        padding: [15,10,0,0],
        dataLabel: false,
        dataPointShape: false,
        xAxis: { disableGrid: true },
        yAxis: {
          gridType: "dash",
          dashLength: 2,
          data: [
            {
              min: 0,
              max: 150
            }
          ]
        },
        extra: {
          line: {
            type: "curve",
            width: 2,
            activeType: "hollow",
            linearType: "custom",
            onShadow: true,
            animation: "horizontal"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "折线图滚动条",
      opts: {
        type: "line",
        categories: categories,
        series: series,
        padding: [15,10,0,0],
        enableScroll: true,
        xAxis: {
          disableGrid: true,
          scrollShow: true,
          itemCount: 4
        },
        yAxis: {
          gridType: "dash",
          dashLength: 2
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
            activeType: "hollow"
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "时间轴折线图",
      opts: {
        type: "line",
        series: [
          {
            name: "竖线",
            data: [[30,0],[30,80]]
          },
          {
            name: "横线",
            data: [[0,40],[60,40]]
          },
          {
            name: "曲线1",
            data: [[60,70],[30,40],[60,10]]
          },
          {
            name: "曲线2",
            data: [[0,70],[30,40],[0,10]]
          }
        ],
        padding: [15,10,0,0],
        xAxis: {
          disableGrid: false,
          boundaryGap: "justify"
        },
        yAxis: {
          gridType: "dash",
          dashLength: 2,
          data: [
            {
              min: 0,
              max: 80
            }
          ]
        },
        extra: {
          line: {
            type: "curve",
            width: 2,
            activeType: "hollow"
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
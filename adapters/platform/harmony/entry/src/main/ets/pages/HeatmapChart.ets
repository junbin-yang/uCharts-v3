import { IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { HeatmapDataItem, UCharts, UChartsController } from '@ibestservices/ucharts'
import { chartDemoType } from "./common/type"

@Component
export struct HeatmapChart {
  @State title: string = "贡献热力图"
  @State icon: Resource = $r("app.media.scatter")
  private demoData = SetHeatmapChartDemo()

  aboutToAppear(): void {}

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
                UCharts({controller: item.ctl, contentHeight: 180, onReady: () => {
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

// 生成随机热力图数据
const generateHeatmapData = () => {
  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const data: HeatmapDataItem[] = [];
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    let value: number = 0;
    // 工作日更可能有数据，周末概率较低
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // 工作日：70%概率有数据，1-15范围
      value = Math.random() < 0.7 ? Math.floor(Math.random() * 15) + 1 : 0;
    } else {
      // 周末：30%概率有数据，1-8范围
      value = Math.random() < 0.3 ? Math.floor(Math.random() * 8) + 1 : 0;
    }

    data.push({
      date: new Date(date).toLocaleDateString('en-CA'), // YYYY-MM-DD 格式
      value: value
    });
  }

  return data;
}

const SetHeatmapChartDemo = () => {
  return [
    {
      title: "贡献热力图",
      opts: {
        type: "heatmap",
        series: [{
          data: generateHeatmapData(),
        }],
        color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127', '#0a3d18'],
        extra: {
          heatmap: {
            cellGap: 3,
            cellRadius: 2,
            dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            monthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            legend: {
              show: true,
              position: 'right',
              labelLess: 'Less',
              labelMore: 'More',
              cellSize: 10,
              cellGap: 4,
              cellRadius: 2,
              textGap: 8,
              colorLevels: 5
            }
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
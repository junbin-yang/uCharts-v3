import { CanvasContext, ChartOptions, UCharts, UChartsController } from '@qiuyun/ucharts-v3'
import { HMCharts } from './hmcharts'

@Entry
@Component
struct Index {
  private settings: RenderingContextSettings = new RenderingContextSettings(true);
  private context: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings);
  private chart: HMCharts|undefined = undefined
  @State uchart: UChartsController = new UChartsController()

  private opts: Partial<ChartOptions> = {
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
    padding: [15,15,0,15],
    enableScroll: false,
    legend: {},
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
  }

  build() {
    RelativeContainer() {
      Column({space: 20}){
        UCharts({ controller: this.uchart, onReady: () => {
          this.uchart.updateData(this.opts)
        }})

        Canvas(this.context)
          .width('100%')
          .height('840px')
          .onReady(()=>{
            let opt2 = this.opts
            opt2.context = this.context as CanvasContext
            this.chart = new HMCharts(opt2 as ESObject)
          })
          .onMouse((event: MouseEvent) => this.chart?.onMouseEvent(event))
          .onTouch((event: TouchEvent) => this.chart?.onTouchEvent(event))
      }.height('840px')
    }
    .height('100%')
    .width('100%')
  }
}
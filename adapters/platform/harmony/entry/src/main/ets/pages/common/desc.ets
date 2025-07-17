
export const GetColumnDemoCodeStr = (index: number) => {
  if(index == -2) return `
@Entry
@ComponentV2
struct Index {
  ...
  @Local chart: UChartsControllerV2 = new UChartsControllerV2(this.opts);

  build() {
    Column(){
      UChartsV2({ controller: this.chart })
    }
    .height('100%').width('100%')
  }
}
      `;
  if(index == -1) return `
@Entry
@Component
struct Index {
  private opts: Partial<ChartOptions> = {
    type: "column",
    categories: ["2018","2019","2020","2021"],
    series: [{
        name: "目标值",
        data: [35,36,31,33]
      },{
        name: "完成量",
        data: [18,27,21,24]
    }],
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
  }
  @State chart: UChartsController = new UChartsController(this.opts);

  build() {
    Column(){
      UCharts({ controller: this.chart })
    }
    .height('100%').width('100%')
  }
}
      `;
  if(index == 0) return `
@Entry
@Component
struct Index {
  @State chart: UChartsController = new UChartsController();
  private opts: Partial<ChartOptions> = {
    type: "column",
    categories: ["2018","2019","2020","2021","2022","2023"],
    series: [{
        name: "目标值",
        data: [35,36,31,33,13,34]
      },{
        name: "完成量",
        data: [18,27,21,24,6,28]
    }],
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
  }

  build() {
    Column(){
      UCharts({ controller: this.chart, onReady: () => {
          this.chart.updateData(this.opts)
      }})
    }
    .height('100%').width('100%')
  }
}
      `;

  if(index == 1) return `
@Entry
@Component
struct Index {
  @State chart: UChartsController = new UChartsController();
  private opts: Partial<ChartOptions> = {
    type: "column",
    categories: ["2018","2019","2020","2021","2022","2023"],
    series: [{
        name: "目标值",
        data: [35,36,31,33,13,34]
      },{
        name: "完成量",
        data: [18,27,21,24,6,28]
    }],
    padding: [15,15,0,5],
    xAxis: { disableGrid: true },
    yAxis: { data: [{ min: 0 }] },
    extra: {
      column: {
        type: "stack",
        width: 30,
        activeBgColor: "#000000",
        activeBgOpacity: 0.08
      }
    }
  }

  build() {
    Column(){
      UCharts({ controller: this.chart, onReady: () => {
          this.chart.updateData(this.opts)
      }})
    }
    .height('100%').width('100%')
  }
}
      `;

  if(index == 2) return `
@Entry
@Component
struct Index {
  @State chart: UChartsController = new UChartsController();
  private opts: Partial<ChartOptions> = {
    type: "column",
    categories: ["2018","2019","2020","2021","2022","2023"],
    series: [{
        name: "目标值",
        data: [35,36,31,33,13,34]
      },{
        name: "完成量",
        data: [18,27,21,24,6,28]
    }],
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
  }

  build() {
    Column(){
      UCharts({ controller: this.chart, onReady: () => {
          this.chart.updateData(this.opts)
      }})
    }
    .height('100%').width('100%')
  }
}
      `;

  if(index == 3) return `
@Entry
@Component
struct Index {
  @State chart: UChartsController = new UChartsController();
  private opts: Partial<ChartOptions> = {
    type: "column",
    categories: ["2018","2019","2020","2021","2022","2023"],
    series: [{
        name: "目标值",
        data: [35,36,31,33,13,34]
      },{
        name: "完成量",
        data: [18,27,21,24,6,28]
    }],
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
  }

  build() {
    Column(){
      UCharts({ controller: this.chart, onReady: () => {
          this.chart.updateData(this.opts)
      }})
    }
    .height('100%').width('100%')
  }
}
      `;

  if(index == 4) return `
@Entry
@Component
struct Index {
  @State chart: UChartsController = new UChartsController();
  private opts: Partial<ChartOptions> = {
    type: "column",
    categories: ["2018","2019","2020","2021","2022","2023"],
    series: [{
        name: "目标值",
        data: [35,36,31,33,13,34]
      },{
        name: "完成量",
        data: [18,27,21,24,6,28]
    }],
    padding: [15,15,0,5],
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
  }

  build() {
    Column(){
      UCharts({ controller: this.chart, onReady: () => {
          this.chart.updateData(this.opts)
      }})
    }
    .height('100%').width('100%')
  }
}
      `;

  if(index == 5) return `
@Entry
@Component
struct Index {
  @State chart: UChartsController = new UChartsController();
  private opts: Partial<ChartOptions> = {
    type: "column",
    categories: ["2018","2019","2020","2021","2022","2023"],
    series: [{
        name: "成交量A",
        data: [20,-20,25,-25,30,-30]
    }],
    padding: [15,15,0,5],
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
  }

  build() {
    Column(){
      UCharts({ controller: this.chart, onReady: () => {
          this.chart.updateData(this.opts)
      }})
    }
    .height('100%').width('100%')
  }
}
      `;

  if(index == 6) return `
@Entry
@Component
struct Index {
  @State chart: UChartsController = new UChartsController();
  private opts: Partial<ChartOptions> = {
    type: "column",
    categories: ["2018","2019","2020","2021","2022","2023"],
    series: [{
        name: "目标值",
        data: [35,36,31,33,13,34]
      },{
        name: "完成量",
        data: [18,27,21,24,6,28]
    }],
    padding: [15,15,0,5],
    touchMoveLimit: 24,
    enableScroll: true,
    xAxis: { disableGrid: true, scrollShow: true, itemCount: 4 },
    yAxis: { data: [{ min: 0 }] },
    extra: {
      column: {
        type: "group",
        width: 30,
        activeBgColor: "#000000",
        activeBgOpacity: 0.08
      }
    }
  }

  build() {
    Column(){
      UCharts({ controller: this.chart, onReady: () => {
          this.chart.updateData(this.opts)
      }})
    }
    .height('100%').width('100%')
  }
}
      `;

  if(index == 7) return `
@Entry
@Component
struct Index {
  @State chart: UChartsController = new UChartsController();
  private opts: Partial<ChartOptions> = {
    type: "column",
    categories: ["2018","2019","2020","2021","2022","2023"],
    series: [{
        name: "目标值",
        data: [35,36,31,33,13,34]
      },{
        name: "完成量",
        data: [18,27,{"value":21,"color":"#EE6666"},24,6,28]
    }],
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
  }

  build() {
    Column(){
      UCharts({ controller: this.chart, onReady: () => {
          this.chart.updateData(this.opts)
      }})
    }
    .height('100%').width('100%')
  }
}
      `;

  return '';
}
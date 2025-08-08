import { IBestDialogUtil, IBestNavBar, IBestToast } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'
import { UCharts, UChartsController, MapDataRes,
  BoundBoxType,
  Point,
  GeoJsonProperties,
  FeatureCollection} from '@ibestservices/ucharts'
import { chartDemoType } from "./common/type"
import { getGeoJSON } from "@ibestservices/area-data"

// 模拟的标记点数据
interface markPointsType {
  latitude: number,
  longitude: number,
  value: number,
  name: string,
  x?: number,
  y?: number
}

@Component
export struct MapChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")
  private demoData = SetMapChartDemo()

  @State markPoints: markPointsType|undefined = undefined
  @State layoutEnd: boolean = false

  aboutToAppear(): void {
    const Param: Record<string, object> = RouterUtil.navPathStack.getParamByName("map")[0] as Record<string, object>
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
                Stack() {
                  UCharts({controller: item.ctl, onReady: () => {
                    // 添加事件监听，在图表渲染完成回调后，模拟地图标记
                    if(index == 1) item.ctl.addEventListener("renderComplete", (e) => {
                      // 经纬度转画布坐标
                      const coordinateToPoint = (longitude: number, latitude: number, bounds: BoundBoxType, scale: number, xoffset: number, yoffset: number, mercator: boolean) => {
                        let x = longitude;
                        let y = latitude;
                        if(mercator == true){
                          x = longitude * 20037508.34 / 180;
                          y = Math.log(Math.tan((90 + latitude) * Math.PI / 360)) / (Math.PI / 180);
                          y = y * 20037508.34 / 180;
                        }
                        return {
                          x: (x - bounds.xMin) * scale + xoffset,
                          y: (bounds.yMax - y) * scale + yoffset
                        } as Point;

                      }

                      const markPoints: markPointsType = {
                        latitude: 27.111699,
                        longitude: 114.986373,
                        value: 999,
                        name:'吉安市'
                      };
                      // 获取到地图参数
                      const mapData: MapDataRes = e.chartData.mapData;
                      // 用地图参数换取相对画布的坐标点
                      const points = coordinateToPoint(markPoints.longitude, markPoints.latitude, mapData.bounds, mapData.scale, mapData.xoffset, mapData.yoffset, mapData.mercator)
                      markPoints.x = points.x;
                      markPoints.y = points.y;
                      console.log('####markPoints', JSON.stringify(markPoints));
                      this.markPoints = markPoints
                    })

                    item.ctl.updateData(item.opts)
                  }, onTap: (dataIndex) => {
                    console.log("####", dataIndex)
                    // 通过onTap获取当前图表点击的数据索引
                    if(!Array.isArray(dataIndex) && index == 1) {
                      if(dataIndex == -1) {
                        this.layoutEnd = false
                        item.ctl.updateData(item.opts)
                      } else {
                        if(this.layoutEnd) return
                        this.layoutEnd = true
                        this.markPoints = undefined
                        let data: GeoJsonProperties = GeoJson2.features[dataIndex].properties;
                        let adcode = 100000;
                        if(data) adcode = data["adcode"]
                        // 根据adcode请求到对应的地图数据
                        const GeoJson3 = getGeoJSON(context, adcode.toString()) as FeatureCollection
                        let series = GeoJson3.features;
                        for (let i = 0; i < series.length; i++) {
                          series[i].value = Math.floor(Math.random() * 1000)
                          series[i].fillOpacity = series[i].value / 1000
                          series[i].color = "#0D9FD8"
                        }
                        item.ctl.updateData({
                          series: series,
                        })
                        IBestToast.show("点击空白区域返回")
                      }
                    }
                  }}).zIndex(0)
                  // 渲染地图标记点
                  if(this.markPoints && index == 1 && !this.layoutEnd) Image($r('app.media.point')).width(50).height(50).zIndex(1).position({
                    top: this.markPoints.y! - 50,
                    left: this.markPoints.x! - 25
                  }).overlay(this.markPoints.value.toString(), { align: Alignment.Center })
                    .onClick(()=>{
                      IBestDialogUtil.open({
                        title: this.markPoints!.name,
                        message: "销售金额：" + this.markPoints!.value + "万元",
                        onConfirm: () => {}
                      })
                    })
                }
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

const context = getContext().getApplicationContext() as Context
const GeoJson1 = getGeoJSON(context, '440300') as FeatureCollection
const GeoJson2 = getGeoJSON(context, '360000') as FeatureCollection
const SetMapChartDemo = () => {
  let series = GeoJson1.features
  // 这里循环一下series，把需要的数据增加到series的属性中，fillOpacity是根据数据来显示的颜色层级透明度
  for (let i = 0; i < series.length; i++) {
    series[i].value = Math.floor(Math.random() * 1000)
    series[i].fillOpacity = series[i].value / 1000
    series[i].color = "#0D9FD8"
    if(series[i].properties!["name"] == "福田区") {
      series[i].color = "#9f0477"
    }
  }

  let series2 = GeoJson2.features;
  // 不设置数据项的颜色时，会根据value值所在区间动态计算MapExtra.color的插值颜色
  for (let i = 0; i < series2.length; i++) {
    series2[i].value = Math.floor(Math.random() * 1000)
  }

  return [
    {
      title: "自定义区域颜色",
      opts: {
        type: "map",
        series: series,
        dataLabel: true,
        background: "#FFFFFF",
        extra: {
          map: {
            border: true,
            borderWidth: 1,
            borderColor: "#666666",
            fillOpacity: 0.6,
            activeBorderColor: "#F04864",
            activeFillColor: "#FACC14",
            activeFillOpacity: 1
          }
        }
      },
      ctl: new UChartsController()
    },
    {
      title: "区域颜色插值计算+地图标记+点击下钻",
      opts: {
        type: "map",
        series: series2,
        dataLabel: true,
        background: "#FFFFFF",
        extra: {
          map: {
            border: true,
            borderWidth: 1,
            borderColor: "#666666",
            fillOpacity: 0.6,
            activeBorderColor: "#F04864",
            activeFillColor: "#FACC14",
            activeFillOpacity: 1,
            color: ["#E0F7FF", "#81D4FA", "#29B6F6", "#EF5350", "#B71C1C"]
          }
        }
      },
      ctl: new UChartsController()
    },
  ] as chartDemoType[]
}
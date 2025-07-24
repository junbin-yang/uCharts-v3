import { bundleManager } from '@kit.AbilityKit';
import { router, window } from '@kit.ArkUI';
import { IBestCell, IBestCellGroup, IBestNoticeBar } from '@ibestservices/ibest-ui';
import { ColumnChart, ColumnChartV2 } from './ColumnChart';
import RouterUtil from './common/utils';
import { chartListType, Tab } from './common/type';
import { MountChart } from './MountChart';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { AreaChart } from './AreaChart';
import { ScatterChart } from './ScatterChart';
import { BubbleChart } from './BubbleChart';
import { MixChart } from './MixChart';
import { PieChart } from './PieChart';
import { RingChart } from './RingChart';
import { RoseChart } from './RoseChart';
import { HAR_VERSION } from '@ibestservices/ucharts';
import { RadarChart } from './RadarChart';
import { WordChart } from './WordChart';
import { ArcBarChart } from './ArcbarChart';
import { GaugeChart } from './GaugeChart';
import { FunnelChart } from './FunnelChart';
import { CandleChart } from './CandleChart';

@Entry
@Component
struct Index {
  @State notice: string = "uCharts是一款高性能、模块化、可扩展的跨平台图表库。以鸿蒙原生Canvas进行适配开发。"

  private navPathStack: NavPathStack = new NavPathStack();
  private tabsList: Tab[] = [
    {
      name: $r("app.string.tab1"),
      icon: $r("app.media.icon_base")
    },
    {
      name: $r("app.string.tab2"),
      icon: $r("app.media.icon_about")
    }
  ]
  @State currentTab: number = 0
  @Provide bottomBarHeight: number = 0
  @Provide topBarHeight: number = 0

  /**
   * 获取应用版本
   */
  getAppVersion() {
    return bundleManager.getBundleInfoForSelfSync(bundleManager.BundleFlag.GET_BUNDLE_INFO_DEFAULT).versionName
  }

  async getWindowAvoidSize() {
    let mainWindow: window.Window = await window.getLastWindow(getContext(this))
    let avoidArea = mainWindow.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM)
    let systemDht = mainWindow.getWindowAvoidArea(window.AvoidAreaType.TYPE_NAVIGATION_INDICATOR)
    let res: Record<string, number> = {
      "topSize": px2vp(avoidArea.topRect.height),
      "bottomSize": px2vp(avoidArea.bottomRect.height),
      "leftSize": px2vp(avoidArea.leftRect.width),
      "rightSize": px2vp(avoidArea.rightRect.width),
      "navigationSize": px2vp(systemDht.bottomRect.height)
    }
    return res;
  }

  private primaryColor: string = "#1989fa"
  private textColor4: string = "#969799"
  @Builder tabBuilder(index: number){
    Column({space: 5}) {
      Image(this.tabsList[index].icon)
        .width(16)
        .aspectRatio(1)
        .fillColor(this.currentTab == index ? this.primaryColor : this.textColor4)
      Text(this.tabsList[index].name)
        .fontColor(this.currentTab == index ? this.primaryColor : this.textColor4)
        .fontSize(12)
    }.width('100%').padding({top: 10, bottom: this.bottomBarHeight})
  }

  readonly chartList: chartListType [] = [
    //{ key: "column_v2", name: $r("app.string.charts_stateV2"), icon: $r("app.media.column") },
    { key: "column", name: $r("app.string.charts_column"), icon: $r("app.media.column") },
    { key: "mount", name: $r("app.string.charts_mount"), icon: $r("app.media.mount") },
    { key: "bar", name: $r("app.string.charts_bar"), icon: $r("app.media.bar") },
    { key: "line", name: $r("app.string.charts_line"), icon: $r("app.media.line") },
    { key: "area", name: $r("app.string.charts_area"), icon: $r("app.media.area") },
    { key: "scatter", name: $r("app.string.charts_scatter"), icon: $r("app.media.scatter") },
    { key: "bubble", name: $r("app.string.charts_bubble"), icon: $r("app.media.bubble") },
    { key: "mix", name: $r("app.string.charts_mix"), icon: $r("app.media.mix") },
    { key: "pie", name: $r("app.string.charts_pie"), icon: $r("app.media.pie") },
    { key: "ring", name: $r("app.string.charts_ring"), icon: $r("app.media.ring") },
    { key: "rose", name: $r("app.string.charts_rose"), icon: $r("app.media.rose") },
    { key: "radar", name: $r("app.string.charts_radar"), icon: $r("app.media.radar") },
    { key: "word", name: $r("app.string.charts_word"), icon: $r("app.media.word") },
    { key: "arcbar", name: $r("app.string.charts_arcbar"), icon: $r("app.media.arcbar") },
    { key: "gauge", name: $r("app.string.charts_gauge"), icon: $r("app.media.gauge") },
    { key: "funnel", name: $r("app.string.charts_funnel"), icon: $r("app.media.funnel") },
    { key: "candle", name: $r("app.string.charts_candle"), icon: $r("app.media.candle") }
  ]
  @State isPressed: Array<boolean> = new Array(this.chartList.length)

  @Builder tabContentBuilder(index: number) {
    if (index == 0) {
      Scroll() {
        Column() {
          Stack({alignContent: Alignment.Center}) {
            Image($r("app.media.charts_cover")).width("100%").height("30%").zIndex(0)
            Column() {
              Image($r("app.media.ucharts_r")).scale({ x: 0.6, y: 0.6})
              Text($r("app.string.head_description")).fontSize(18).fontColor("#323232")
            }.zIndex(1)
          }
          .padding({top: this.topBarHeight})
          IBestNoticeBar({
            leftIcon: "volume-o",
            text: this.notice
          })

          Flex({ direction: FlexDirection.Row,
            alignItems: ItemAlign.Center,
            justifyContent: FlexAlign.Center,
            wrap: FlexWrap.Wrap }) {
            ForEach(this.chartList, (item: chartListType, i: number) => {
              Column() {
                Image(item.icon)
                  .fitOriginalSize(true)
                  .alignSelf(ItemAlign.Center)

                Text(item.name)
                  .fontSize(14)
                  .textAlign(TextAlign.Center)
              }
              .width(90).height(90)
              .padding({top: 10, bottom: 10})
              .margin({bottom: 5})
              .alignItems(HorizontalAlign.Center)
              .transition(TransitionEffect.move(TransitionEdge.BOTTOM).animation({ duration: 1000, curve: Curve.Ease, delay: i * 100 }))
              .backgroundColor(this.isPressed[i] ? '#CCCCCC' : '#FFFFFF')
              .borderRadius(10)
              .onTouch((e: TouchEvent)=>{
                if(e.type == TouchType.Down) this.isPressed[i] = true
                if(e.type == TouchType.Up) this.isPressed[i] = false
              })
              .onClick(() =>{
                RouterUtil.push(item.key, item)
              })
            })
          }
          .backgroundColor($r('sys.color.comp_background_list_card'))
          .padding(10)
          .width('auto')
          .borderRadius(16)
          .layoutWeight(1)
        }.width('100%')
      }
      .layoutWeight(1)
      .align(Alignment.Top)
    } else {
      Column() {
        Scroll(){
          Column({ space: 16 }) {
            Image($r("app.media.mascot")).width(100).borderRadius(6)
              .transition(TransitionEffect.move(TransitionEdge.BOTTOM).animation({ duration: 1000, curve: Curve.Ease }))
            Text($r("app.string.app_name"))
              .fontSize(32)
              .fontColor("#323232")
              .transition(TransitionEffect.move(TransitionEdge.BOTTOM).animation({ duration: 1000, curve: Curve.Ease, delay: 100 }))
            Text($r("app.string.app_description"))
              .width("80%")
              .textAlign(TextAlign.Center)
              .fontSize(14)
              .fontColor("#969799")
              .transition(TransitionEffect.move(TransitionEdge.BOTTOM).animation({ duration: 1000, curve: Curve.Ease, delay: 200 }))
            Column(){
              IBestCellGroup({inset: true}){
                IBestCell({
                  title: $r("app.string.app_version"),
                  value: `v${this.getAppVersion()}`
                })
                IBestCell({
                  title: $r("app.string.charts_version"),
                  value: HAR_VERSION
                })
                IBestCell({
                  title: $r("app.string.charts_docs"),
                  isLink: true,
                  onCellClick: () => {
                    //IBestToast.show("建设中...")
                    router.pushUrl({
                      url: "pages/Doc"
                    })
                  }
                })
                IBestCell({
                  title: $r("app.string.privacy_policy"),
                  isLink: true,
                  hasBorder: false,
                  onCellClick: () => {
                    router.pushUrl({
                      url: "pages/PrivacyPolicy"
                    })
                  }
                })
              }
            }
            .transition(TransitionEffect.move(TransitionEdge.BOTTOM).animation({ duration: 1000, curve: Curve.Ease, delay: 300 }))
          }.padding({top: 80})
        }
        .layoutWeight(1)
        .align(Alignment.Top)
        Column({ space: 4 }){
          Text($r("app.string.app_record")).fontColor(this.primaryColor).fontSize(10)
          Text($r("app.string.app_ownership")).fontSize(10).textAlign(TextAlign.Center)
        }.padding(4)
      }
      .width('100%')
      .height('100%')
    }
  }

  aboutToAppear(): void {
    RouterUtil.navPathStackList.push(this.navPathStack)
  }
  onPageShow(): void {
    this.getWindowAvoidSize().then((res)=>{
      this.bottomBarHeight = res["navigationSize"]
      this.topBarHeight = res["topSize"]
    })
  }

  @Builder
  PageMap(name: string) {
    if(name === 'column_v2') {
      ColumnChartV2()
    } else if(name === 'column') {
      ColumnChart()
    } else if(name === 'mount') {
      MountChart()
    } else if(name === 'bar') {
      BarChart()
    } else if(name === 'line') {
      LineChart()
    } else if(name === 'area') {
      AreaChart()
    } else if(name === 'scatter') {
      ScatterChart()
    } else if(name === 'bubble') {
      BubbleChart()
    } else if(name === 'mix') {
      MixChart()
    } else if(name === 'pie') {
      PieChart()
    } else if(name === 'ring') {
      RingChart()
    } else if(name === 'rose') {
      RoseChart()
    } else if(name === 'radar') {
      RadarChart()
    } else if(name === 'word') {
      WordChart()
    } else if(name === 'arcbar') {
      ArcBarChart()
    } else if(name === 'gauge') {
      GaugeChart()
    } else if(name === 'funnel') {
      FunnelChart()
    } else if(name === 'candle') {
      CandleChart()
    }
  }

  build() {
    Navigation(this.navPathStack){
      Tabs({barPosition: BarPosition.End, index: $$this.currentTab}){
        TabContent(){
          this.tabContentBuilder(0)
        }
        .tabBar(this.tabBuilder(0))
        TabContent(){
          this.tabContentBuilder(1)
        }.tabBar(this.tabBuilder(1))
      }
      .width('100%')
      .barHeight(70)
      .barBackgroundColor("#fff")
      .divider({strokeWidth: 1, color: "#f2f3f5"})
      .layoutWeight(1)
    }
    .navDestination(this.PageMap)
    .mode(NavigationMode.Stack)
    .hideTitleBar(true)
    .mode(NavigationMode.Stack)
    .backgroundColor("#f7f8fa")
  }
}
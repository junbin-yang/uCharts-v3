import { IBestButton, IBestNavBar } from "@ibestservices/ibest-ui"
import RouterUtil from "./common/utils"
import ComponentShowContainer from "./ComponentShowContainer"
import { LengthMetrics } from '@ohos.arkui.node'

@Component
export struct LineChart {
  @State title: string = ""
  @State icon: Resource = $r("app.media.column")

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
        ListItem() {
          ComponentShowContainer({title: "?????"}) {
            Flex({
              wrap: FlexWrap.Wrap,
              space: { main: LengthMetrics.vp(12), cross: LengthMetrics.vp(12) }
            }) {
              IBestButton({
                text: "?????",
                type: 'primary'
              })
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
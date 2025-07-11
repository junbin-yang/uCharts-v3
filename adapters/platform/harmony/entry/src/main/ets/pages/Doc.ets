import { IBestNavBar } from '@ibestservices/ibest-ui'
import { webview } from '@kit.ArkWeb'
import { router } from '@kit.ArkUI'

@Builder
export function DocBuilder(){
  DocPage()
}

@Entry
@Component
struct DocPage {
  private controller: webview.WebviewController = new webview.WebviewController()
  build() {
    NavDestination(){
      IBestNavBar({
        title: $r("app.string.doc"),
        isShowStatusBar: true,
        onLeftClick: () => {
          router.back()
        }
      })
      Web({
        src: $r("app.string.app_doc_url"),
        controller: this.controller
      })
        .layoutWeight(1)
    }
    .hideTitleBar(true)
  }
}
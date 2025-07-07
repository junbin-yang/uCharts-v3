import { IBestNavBar } from '@ibestservices/ibest-ui'
import { webview } from '@kit.ArkWeb'
import { router } from '@kit.ArkUI'
@Entry
@Component
struct PrivacyPolicy {
	private webController: webview.WebviewController = new webview.WebviewController()
	build() {
		Column() {
			IBestNavBar({
				title: $r("app.string.privacy_policy"),
				isShowStatusBar: true,
				onLeftClick: () => {
					router.back()
				}
			})
			Web({
				src: $rawfile("PrivacyPolicy.html"),
				controller: this.webController
			})
				.cacheMode(CacheMode.Online)
				.layoutWeight(1)
				.expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.BOTTOM])
		}
		.width("100%")
		.height("100%")
	}
}
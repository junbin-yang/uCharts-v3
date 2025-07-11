
@Component
export struct CollapseAndExpand {
  @Prop value: string = "";
  @Provide("flag") flag: boolean = false

  build() {
    Column() {
      RowItem({
        value: "</> 查看代码",
        hasIcon: true,
        fontSize: 14,
        fontColor: "#ffb32906"
      })

      Column() {
        RowItem({ value: this.value })
      }
      .clip(true)
      .height(this.flag ? "auto" : 0)
      .backgroundColor("#ffb1b1b1")
      .borderRadius(12)
    }.padding({ top: 0, right: 10, left: 10 })
  }
}

@Component
struct RowItem {
  @Consume("flag") flag: boolean
  @Prop value: string = "";
  @Prop hasIcon: boolean = false;
  @Prop fontSize: number = 12;
  @Prop fontColor: string = "#000000";
  private onFlagChange = () => {
    animateTo({
      duration: 650,
      curve: Curve.Smooth
    }, () => {
      this.flag = !this.flag;
    })
  }

  build() {
    Flex({ alignItems: ItemAlign.Start, justifyContent: FlexAlign.Center }) {
      Text(this.value).fontSize(this.fontSize).fontColor(this.fontColor).margin({ left: 10, right: 10 })

      if (this.hasIcon) {
        Image($r("sys.media.ohos_ic_public_arrow_down"))
          .width(16)
          .height(16)
          .objectFit(ImageFit.Contain)
          .rotate({ angle: !this.flag ? 0 : 180 })
          .transition({ type: TransitionType.All, opacity: 0 })
      }
    }
    //.margin({ top: 15 })
    // 点击展开按钮后旋转180°，展示折叠按钮
    .onClick(() => {
      if(this.hasIcon) this.onFlagChange()
    })
  }
}

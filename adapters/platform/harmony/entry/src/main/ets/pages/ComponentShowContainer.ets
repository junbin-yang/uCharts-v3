
@Component
export default struct ComponentShowContainer {
  @Prop title: ResourceStr
  @Prop titlePaddingLeft: number
  @Prop card: boolean = false
  @BuilderParam defaultBuilder?: CustomBuilder

  build() {
    Column() {
      Text(this.title)
        .fontSize(14)
        .padding({
          top: 16,
          right: 8,
          bottom: this.card ? 8 : 0,
          left: this.titlePaddingLeft
        })
        .textAlign(TextAlign.Start)
        .fontWeight(FontWeight.Medium)
        .fontColor("#ff1a1919")
      Column() {
        if (this.defaultBuilder) {
          this.defaultBuilder()
        }
      }
      .alignItems(HorizontalAlign.Start)
      .margin({ left: this.card ? 12 : 0, right: this.card ? 12 : 0 })
      .borderRadius(8)
      .padding(this.card ? undefined : { top: 8, bottom: 8 })
      .clip(true)
    }
    .width("100%")
    .justifyContent(FlexAlign.Start)
    .alignItems(HorizontalAlign.Start)
  }
}
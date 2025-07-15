import { ChartOptions, UChartsController } from '@qiuyun/ucharts'

export interface Tab {
  name: ResourceStr
  icon: Resource
}

export interface chartListType extends Tab {
  key: string
}

export interface chartDemoType {
  title: string,
  opts: Partial<ChartOptions>,
  ctl: UChartsController
}
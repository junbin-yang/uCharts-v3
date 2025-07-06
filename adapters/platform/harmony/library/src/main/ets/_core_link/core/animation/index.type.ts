/**
 * 图表动画效果
 * 可选值：'easeOut'由快到慢,'easeIn'由慢到快,'easeInOut'慢快慢,'linear'匀速
 */
export type AnimationTiming = "easeOut" | "easeIn" | "easeInOut" | "linear"

export interface animationOption {
  timing: AnimationTiming,
  duration: number
  onProcess: (process: number) => void
  onFinish: () => void
}
import { animationOption, AnimationTiming } from './index.type';

/**
 * 动画时序函数工具类
 * 提供不同动画曲线的计算方法
 */
class Timing {
  // 创建方法
  static Create(timing: AnimationTiming) {
    switch (timing) {
      case "easeOut":
        return Timing.EaseOut;
      case "easeIn":
        return Timing.EaseIn;
      case "easeInOut":
        return Timing.EaseInOut;
      default:
        return Timing.Linear;
    }
  }

  // 由快到慢
  static EaseOut(process: number): number {
    return Math.pow(process - 1, 3) + 1;
  }

  // 由慢到快
  static EaseIn(process: number): number {
    return Math.pow(process, 3);
  }

  // 慢快慢
  static EaseInOut(process: number): number {
    if ((process /= 0.5) < 1) {
      return 0.5 * Math.pow(process, 3);
    } else {
      return 0.5 * (Math.pow(process - 2, 3) + 2);
    }
  }

  // 匀速
  static Linear(process: number): number {
    return process;
  }
}

export class Animation {
  private isStop: boolean = false;
  private opts: animationOption;
  private animationFrame: (step: (timestamp: number) => void, delay: number) => void;
  private startTimeStamp: number | null = null;
  private delay: number = 17;
  private timing: (process: number) => number;

  constructor(opts: animationOption) {
    this.opts = opts;
    this.timing = Timing.Create(opts.timing);
    this.animationFrame = this.createAnimationFrame();
    this.startAnimation();
  }

  private createAnimationFrame(): (step: (timestamp: number) => void, delay: number) => void {
    return (step, delay) => {
      setTimeout(() => {
        const timeStamp = new Date().getTime();
        step(timeStamp);
      }, delay);
    };
  }

  private startAnimation(): void {
    this.animationFrame((timestamp) => this.step(timestamp), this.delay);
  }

  private step(timestamp: number): void {
    if (this.isStop) {
      // 动画停止时执行完成回调
      this.opts.onProcess?.(1);
      this.opts.onFinish?.();
      return;
    }

    if (this.startTimeStamp === null) {
      this.startTimeStamp = timestamp;
    }

    if (timestamp - this.startTimeStamp < this.opts.duration) {
      // 计算动画进度并应用时序函数
      let process = (timestamp - this.startTimeStamp) / this.opts.duration;
      process = this.timing(process);

      // 触发进度回调
      this.opts.onProcess?.(process);

      // 继续下一帧动画
      this.animationFrame((ts) => this.step(ts), this.delay);
    } else {
      // 动画结束时执行完成回调
      this.opts.onProcess?.(1);
      this.opts.onFinish?.();
    }
  }

  public stop(): void {
    this.isStop = true;
  }
}
import { ChartOptions } from "../types";
import { ChartsUtil } from "../utils";
import { BaseRenderer } from "./base";
import { Animation } from '../animation';
import { Series, WordSeries } from '../types/series';
import { WordExtra } from "../types/extra";
import { EventListener } from "../event";

/**
 * 词云图渲染器
 */
export class WordChartRenderer extends BaseRenderer {
  constructor(opts: Partial<ChartOptions>, events: Record<string, EventListener[]> = {}) {
    super(opts, events);
    this.render();
  }

  protected render(): void {
    let series = ChartsUtil.fillSeries(this.opts.series, this.opts);
    const duration = this.opts.animation! ? this.opts.duration! : 0;
    this.animation && this.animation.stop();
    let seriesMA = series;
    /* 过滤掉show=false的series */
    this.opts._series_ = series = ChartsUtil.filterSeries(series);
    //重新计算图表区域
    this.opts.area = new Array(4);
    //复位绘图区域
    for (let j = 0; j < 4; j++) {
      this.opts.area[j] = this.opts.padding![j] * this.opts.pixelRatio!;
    }
    //通过计算三大区域：图例、X轴、Y轴的大小，确定绘图区域
    const calLegendData = this.calculateLegendData(seriesMA, this.opts.chartData);
    const legendHeight = calLegendData.area.wholeHeight;
    const legendWidth = calLegendData.area.wholeWidth;

    switch (this.opts.legend!.position) {
      case 'top':
        this.opts.area[0] += legendHeight;
        break;
      case 'bottom':
        this.opts.area[2] += legendHeight;
        break;
      case 'left':
        this.opts.area[3] += legendWidth;
        break;
      case 'right':
        this.opts.area[1] += legendWidth;
        break;
    }

    this.opts.chartData.yAxisData = {};
    this.opts.chartData.xAxisData = {};

    //计算右对齐偏移距离
    if (this.opts.enableScroll && this.opts.xAxis.scrollAlign == 'right' && this.opts._scrollDistance_ === undefined) {
      let offsetLeft = 0
      let xAxisPoints: number[] = this.opts.chartData.xAxisData.xAxisPoints
      let startX: number = this.opts.chartData.xAxisData.startX
      let endX: number = this.opts.chartData.xAxisData.endX
      let eachSpacing: number = this.opts.chartData.xAxisData.eachSpacing
      let totalWidth = eachSpacing * (xAxisPoints.length - 1);
      let screenWidth = endX - startX;
      offsetLeft = screenWidth - totalWidth;
      this.scrollOption["currentOffset"] = offsetLeft;
      this.scrollOption["startTouchX"] = offsetLeft;
      this.scrollOption["distance"] = 0;
      this.scrollOption["lastMoveTime"] = 0;
      this.opts._scrollDistance_ = offsetLeft;
    }

    this.animation = new Animation({
      timing: this.opts.timing!,
      duration: duration,
      onProcess: (process: number) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.opts.rotate) {
          this.contextRotate();
        }
        this.drawWordCloudDataPoints(series, process);
        this.drawCanvas();
      },
      onFinish: () => {
        this.event.emit('renderComplete', this.opts);
      }
    });
  }

  private drawWordCloudDataPoints(series: Series[], process: number = 1) {
    let wordOption = ChartsUtil.objectAssign({} as WordExtra, {
      type: 'normal'
    }, this.opts.extra.word!);
    if (!this.opts.chartData.wordCloudData) {
      this.opts.chartData.wordCloudData = this.getWordCloudPoint(series, wordOption.type);
    }
    this.context.beginPath();
    this.setFillStyle(this.opts.background!);
    this.context.rect(0, 0, this.opts.width, this.opts.height);
    this.context.fill();
    this.context.save();
    let points = this.opts.chartData.wordCloudData;
    this.context.translate(this.opts.width / 2, this.opts.height / 2);
    for (let i = 0; i < points.length; i++) {
      this.context.save();
      if (points[i].rotate) {
        this.context.rotate(90 * Math.PI / 180);
      }
      let text = points[i].name;
      let tHeight = points[i].textSize * this.opts.pixelRatio!;
      let tWidth = this.measureText(text, tHeight);
      this.context.beginPath();
      this.setStrokeStyle(points[i].color);
      this.setFillStyle(points[i].color);
      this.setFontSize(tHeight);
      if (points[i].rotate) {
        if (points[i].areav[0] > 0) {
          if (this.opts.tooltip) {
            if (this.opts.tooltip.index == i) {
              this.context.strokeText(text, (points[i].areav[0] + 5 - this.opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i].areav[1] + 5 + tHeight - this.opts.height / 2) * process);
            } else {
              this.context.fillText(text, (points[i].areav[0] + 5 - this.opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i].areav[1] + 5 + tHeight - this.opts.height / 2) * process);
            }
          } else {
            this.context.fillText(text, (points[i].areav[0] + 5 - this.opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i].areav[1] + 5 + tHeight - this.opts.height / 2) * process);
          }
        }
      } else {
        if (points[i].area[0] > 0) {
          if (this.opts.tooltip) {
            if (this.opts.tooltip.index == i) {
              this.context.strokeText(text, (points[i].area[0] + 5 - this.opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i].area[1] + 5 + tHeight - this.opts.height / 2) * process);
            } else {
              this.context.fillText(text, (points[i].area[0] + 5 - this.opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i].area[1] + 5 + tHeight - this.opts.height / 2) * process);
            }
          } else {
            this.context.fillText(text, (points[i].area[0] + 5 - this.opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i].area[1] + 5 + tHeight - this.opts.height / 2) * process);
          }
        }
      }
      this.context.stroke();
      this.context.restore();
    }
    this.context.restore();
  }

  private getWordCloudPoint(series: Series[], type: 'normal'|'vertical') {
    let points: WordSeries[] = this.opts.series;
    if(type == "normal") {
      for (let i = 0; i < points.length; i++) {
        let text = points[i].name || "";
        let textSize = points[i].textSize == undefined ? 20 : points[i].textSize!
        let tHeight = textSize * this.opts.pixelRatio!;
        let tWidth = this.measureText(text, tHeight);
        let x: number, y: number;
        let area: number[];
        let breaknum = 0;
        while (true) {
          breaknum++;
          x = this.normalInt(-this.opts.width / 2, this.opts.width / 2, 5) - tWidth / 2;
          y = this.normalInt(-this.opts.height / 2, this.opts.height / 2, 5) + tHeight / 2;
          area = [x - 5 + this.opts.width / 2, y - 5 - tHeight + this.opts.height / 2, x + tWidth + 5 + this.opts.width / 2, y + 5 + this.opts.height / 2];
          let isCollision = this.collisionNew(area, points, this.opts.width, this.opts.height);
          if (!isCollision) break;
          if (breaknum == 1000) {
            area = [-100, -100, -100, -100];
            break;
          }
        };
        points[i].area = area;
      }
    } else if(type == "vertical") {
      const Spin = () => {
        //获取均匀随机值，是否旋转，旋转的概率为（1-0.5）
        if (Math.random() > 0.7) {
          return true;
        } else {
          return false
        };
      };
      for (let i = 0; i < points.length; i++) {
        let text = points[i].name || "";
        let textSize = points[i].textSize == undefined ? 20 : points[i].textSize!
        let tHeight = textSize * this.opts.pixelRatio!;
        let tWidth = this.measureText(text, tHeight);
        let isSpin = Spin();
        let x: number, y: number, area: number[] = [], areav: number[] = [];
        let breaknum = 0;
        while (true) {
          breaknum++;
          let isCollision: boolean;
          if (isSpin) {
            x = this.normalInt(-this.opts.width / 2, this.opts.width / 2, 5) - tWidth / 2;
            y = this.normalInt(-this.opts.height / 2, this.opts.height / 2, 5) + tHeight / 2;
            area = [y - 5 - tWidth + this.opts.width / 2, (-x - 5 + this.opts.height / 2), y + 5 + this.opts.width / 2, (-x + tHeight + 5 + this.opts.height / 2)];
            areav = [this.opts.width - (this.opts.width / 2 - this.opts.height / 2) - (-x + tHeight + 5 + this.opts.height / 2) - 5, (this.opts.height / 2 - this.opts.width / 2) +
              (y - 5 - tWidth + this.opts.width / 2) - 5, this.opts.width - (this.opts.width / 2 - this.opts.height / 2) - (-x + tHeight + 5 + this.opts.height / 2) + tHeight,
              (this.opts.height / 2 - this.opts.width / 2) + (y - 5 - tWidth + this.opts.width / 2) + tWidth + 5];
            isCollision = this.collisionNew(areav, points, this.opts.height, this.opts.width);
          } else {
            x = this.normalInt(-this.opts.width / 2, this.opts.width / 2, 5) - tWidth / 2;
            y = this.normalInt(-this.opts.height / 2, this.opts.height / 2, 5) + tHeight / 2;
            area = [x - 5 + this.opts.width / 2, y - 5 - tHeight + this.opts.height / 2, x + tWidth + 5 + this.opts.width / 2, y + 5 + this.opts.height / 2];
            isCollision = this.collisionNew(area, points, this.opts.width, this.opts.height);
          }
          if (!isCollision) break;
          if (breaknum == 1000) {
            area = [-1000, -1000, -1000, -1000];
            break;
          }
        };
        if (isSpin) {
          points[i].area = areav;
          points[i].areav = area;
        } else {
          points[i].area = area;
        }
        points[i].rotate = isSpin;
      };
    }
    return points;
  }

  private normalInt(min: number, max: number, iter: number) {
    iter = iter == 0 ? 1 : iter;
    let arr = [];
    for (let i = 0; i < iter; i++) {
      arr[i] = Math.random();
    };
    return Math.floor(arr.reduce((i, j) => {
      return i + j
    }) / iter * (max - min)) + min;
  };

  private collisionNew(area: number[], points: WordSeries[], width: number, height: number) {
    let isIn = false;
    for (let i = 0; i < points.length; i++) {
      if (points[i].area) {
        if (area[3] < points[i].area[1] || area[0] > points[i].area[2] || area[1] > points[i].area[3] || area[2] < points[i].area[0]) {
          if (area[0] < 0 || area[1] < 0 || area[2] > width || area[3] > height) {
            isIn = true;
            break;
          } else {
            isIn = false;
          }
        } else {
          isIn = true;
          break;
        }
      }
    }
    return isIn;
  };
}
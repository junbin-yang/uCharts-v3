import { CanvasContext } from '../../interface/canvas.type';
import { BaseRenderer } from './base';
import { ChartOptions, AnyType, Point, ToolTipOptions } from '../types/index';
import { HeatmapExtra, HeatmapLegendOptions, TooltipOptions } from '../types/extra';
import { HeatmapSeries, HeatmapDataItem } from '../types/series';
import { ChartsUtil } from '../utils/index';
import { Animation } from '../animation/index';
import { EventListener } from '../event';

// 动态布局属性
interface HeatmapChartLayout {
  maxDayLabelWidth: number
  monthLabelHeight: number
  legendY: number            // 图例Y坐标
  legendX: number            // 图例X坐标
  legendWidth: number        // 图例宽度
  legendHeight: number       // 图例高度
  cellSize: number
  contentWidth: number
  contentOffsetX: number
  gridStartX: number         // 网格区域开始X坐标
  gridEndX: number           // 网格区域结束X坐标（精确到最后一个单元格的右边缘）
  margins: HeatmapChartLayoutMargins
}

interface HeatmapChartLayoutMargins {
  top: number
  left: number
  right: number
  bottom: number
}

interface HeatmapChartData {
  date: Date,
  contributions: number,
  level: number,
  isInYear: boolean
}

export class HeatmapChartRenderer extends BaseRenderer {
  private layout: HeatmapChartLayout;
  private drawData: Record<string, any>;

  constructor(opts: Partial<ChartOptions>, events: Record<string, EventListener[]> = {}) {
    super(opts, events);
    this.layout = {
      maxDayLabelWidth: 0,
      monthLabelHeight: 0,
      legendHeight: 0,
      legendY: 0,       
      legendX: 0,       
      legendWidth: 0,   
      cellSize: 0,
      contentWidth: 0,
      contentOffsetX: 0,
      gridStartX: 0,  
      gridEndX: 0,    
      margins: {top: 0, left: 0, right: 0, bottom: 0}
    };

    this.drawData = {
      "data": [] as HeatmapChartData[],
      "year": 2023,
      "startDate": undefined,
      "endDate": undefined,
      "yearStart": undefined,
      "yearEnd": undefined,
      "spacing": {
        "outer": 5,
        "label": 8,
        "legend": 10,
        "textVertical": 4
      },
      "tooltip": {
        "visible": false,
        "x": 0,
        "y": 0,
        "contributions": 0,
        "date": ''
      }
    };

    const DefaultHeatmapExtra: HeatmapExtra = {
      cellGap: 3,
      cellRadius: 2,
      legend: {
        show: true,
        position: 'center',
        labelLess: 'Less',
        labelMore: 'More',
        fontSize: 11,
        cellSize: 9,
        cellGap: 4,
        cellRadius: 2,
        textGap: 8,
        colorLevels: 5
      },
      monthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
    this.opts.extra.heatmap = ChartsUtil.objectAssign({} as HeatmapExtra, DefaultHeatmapExtra, this.opts.extra.heatmap!);

    // 确保等级在有效范围内
    const levels = this.opts.extra.heatmap!.legend!.colorLevels!;
    const validLevels = Math.max(3, Math.min(6, levels));
    this.opts.extra.heatmap!.legend!.colorLevels = validLevels;
    // 从完整颜色数组中截取相应数量的颜色
    this.opts.color = this.opts.color!.slice(0, validLevels);

    this.render();
  }

  protected render(): void {
    this.fillSeriesData();
    this.calculateLayoutMetrics();

    const duration = this.opts.animation! ? this.opts.duration! : 0;
    this.animation && this.animation.stop();
    
    this.animation = new Animation({
      timing: this.opts.timing!,
      duration: duration,
      onProcess: (process: number) => {
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        
        // 绘制基础元素
        this.drawMonthLabels();
        this.drawDayLabels();
        this.drawLegend();
                
        // 绘制热力图网格（带动画效果）
        this.drawHeatmapWithAnimation(process);

        // 最后绘制tooltip
        this.drawTooltip();
      },
      onFinish: () => {
        this.event.emit('renderComplete', this.opts);
      }
    });
  }

  /**
   * 绘制带动画效果的热力图
   * @param process 动画进度 (0-1)
   */
  private drawHeatmapWithAnimation(process: number): void {
    if (this.drawData.data.length === 0) return;

    // 计算总周数
    const totalWeeks = Math.ceil(this.drawData.data.length / 7);
    
    this.drawData.data.forEach((item: HeatmapChartData, index: number) => {
      if (!item.isInYear) return;

      const { x, y } = this.getCellPosition(index);
      const week = Math.floor(index / 7);
      const day = index % 7;
      
      // 基础进度：从左到右的列进度
      const weekProgress = week / Math.max(1, totalWeeks - 1);
      
      // 波浪效果：每列内部的行偏移，使用正弦波创造波浪效果
      const waveOffset = Math.sin(day * Math.PI / 6) * 0.1; // 波浪幅度
      const totalProgress = weekProgress + waveOffset;
      
      // 动画触发时间：80%时间用于渐进显示，20%用于完成动画
      const showThreshold = totalProgress * 0.8;
      const completeThreshold = showThreshold + 0.2;
      
      if (process < showThreshold) {
        // 还未到显示时间
        return;
      }
      
      // 计算缩放比例
      let scale = 1;
      if (process < completeThreshold) {
        // 在缩放动画阶段
        const scaleProgress = (process - showThreshold) / Math.max(0.001, completeThreshold - showThreshold);
        // 使用缓动函数创造弹性效果
        const easedProgress = this.easeOutBack(scaleProgress);
        scale = Math.min(1, easedProgress);
      }
      
      if (scale <= 0) return;
      
      // 保存当前绘图状态
      this.context.save();
      
      // 计算缩放后的尺寸和位置
      const scaledSize = this.layout.cellSize * scale;
      const offsetX = (this.layout.cellSize - scaledSize) / 2;
      const offsetY = (this.layout.cellSize - scaledSize) / 2;
      
      // 设置颜色并绘制方块
      this.setFillStyle(this.opts.color![item.level]);
      
      this.drawRoundedRect(
        x + offsetX, 
        y + offsetY, 
        scaledSize, 
        scaledSize,
        this.opts.extra.heatmap!.cellRadius! * scale
      );
      
      // 恢复绘图状态
      this.context.restore();
    });
  }

  /**
   * 缓动函数：弹性退出效果
   * @param t 进度 (0-1)
   * @returns 缓动后的值
   */
  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  private getCellPosition(index: number) {
    const week = Math.floor(index / 7);
    const day = index % 7;
                
    const x = this.layout.margins.left + week * (this.layout.cellSize + this.opts.extra.heatmap!.cellGap!);
    const y = this.layout.margins.top + day * (this.layout.cellSize + this.opts.extra.heatmap!.cellGap!);
                
    return { x, y } as Point;
  }

  private calculateLayoutMetrics() {
    const fontSize = this.opts.fontSize!;
    // 设置文本样式
    this.setFontSize(fontSize);
                
    // 计算最长周标签宽度
    let maxDayLabelWidth = 0;
    this.opts.extra.heatmap!.dayLabels!.forEach(day => {
        const textWidth = this.measureText(day || 'undefined', fontSize);
        maxDayLabelWidth = Math.max(maxDayLabelWidth, textWidth);
    });
    this.layout.maxDayLabelWidth = maxDayLabelWidth;
                
    // 计算月份标签高度
    const spacing: Record<string, number> = this.drawData["spacing"];
    this.layout.monthLabelHeight = fontSize + spacing["textVertical"] * 2;
                
    // 计算图例高度
    this.setFontSize(this.opts.extra.heatmap!.legend!.fontSize!);
    this.layout.legendHeight = Math.max(
      this.opts.extra.heatmap!.legend!.cellSize!, 
      this.opts.extra.heatmap!.legend!.fontSize! + spacing["textVertical"]
    );
                
    // 计算基础边距
    this.layout.margins = {
      top: this.layout.monthLabelHeight + spacing["outer"],
      left: this.layout.maxDayLabelWidth + spacing["label"],
      right: spacing["outer"],
      bottom: this.layout.legendHeight + spacing["legend"] + spacing["outer"]
    };
                
    // 计算内容尺寸
    this.calculateContentDimensions(spacing);
                
    // 计算内容居中偏移
    this.layout.contentOffsetX = Math.max(0, (this.opts.width - this.layout.contentWidth) / 2);
                
    // 计算网格实际起始和结束位置
    this.layout.gridStartX = this.layout.margins.left + this.layout.contentOffsetX + spacing["outer"];
    const weeksCount = this.drawData.data.length > 0 ? Math.ceil(this.drawData.data.length / 7) : 53;
    this.layout.gridEndX = this.layout.gridStartX + (weeksCount * this.layout.cellSize) + 
        ((weeksCount - 1) * this.opts.extra.heatmap!.cellGap!);
                
    // 计算图例位置和尺寸（用于鼠标检测）
    this.calculateLegendDimensions(spacing);
                
    // 最终左侧边距
    this.layout.margins.left += this.layout.contentOffsetX + spacing["outer"];
  }

  private calculateContentDimensions(spacing: Record<string, number>) {
    // 计算实际周数
    const weeksCount = this.drawData.data.length > 0 ? Math.ceil(this.drawData.data.length / 7) : 53;
                
    // 计算单元格大小
    const availableWidth = this.opts.width - this.layout.margins.left - this.layout.margins.right;
    const maxPossibleCellSize = (availableWidth + this.opts.extra.heatmap!.cellGap!) / weeksCount - this.opts.extra.heatmap!.cellGap!;
    this.layout.cellSize = Math.max(5, Math.min(12, Math.floor(maxPossibleCellSize)));
                
    // 计算实际内容宽度
    this.layout.contentWidth = this.layout.maxDayLabelWidth + spacing["label"] + // 左侧标签宽度
        weeksCount * (this.layout.cellSize + this.opts.extra.heatmap!.cellGap!) - this.opts.extra.heatmap!.cellGap! + // 网格宽度
          spacing["outer"] * 2; // 左右外间距
  }

  // 计算图例的位置和尺寸，用于鼠标悬停检测
  private calculateLegendDimensions(spacing: Record<string, number>) {
    const fontSize = this.opts.extra.heatmap!.legend!.fontSize!

    const lessTextWidth = this.measureText(this.opts.extra.heatmap!.legend!.labelLess!, fontSize);
    const moreTextWidth = this.measureText(this.opts.extra.heatmap!.legend!.labelMore!, fontSize);
    const colorBlocksWidth = this.opts.color!.length * this.opts.extra.heatmap!.legend!.cellSize! + 
            (this.opts.color!.length - 1) * this.opts.extra.heatmap!.legend!.cellGap!;
                
    this.layout.legendWidth = lessTextWidth + colorBlocksWidth + moreTextWidth + 
          this.opts.extra.heatmap!.legend!.textGap! * 2;
    this.layout.legendHeight = Math.max(
      this.opts.extra.heatmap!.legend!.cellSize!, 
      fontSize + spacing["textVertical"]
    );
                
    this.layout.legendY = this.layout.margins.top + 
        7 * (this.layout.cellSize + this.opts.extra.heatmap!.cellGap!) - this.opts.extra.heatmap!.cellGap! + spacing["legend"];
                
    switch (this.opts.extra.heatmap!.legend!.position) {
      case 'left':
        this.layout.legendX = this.layout.gridStartX;
        break;
      case 'right':
        this.layout.legendX = this.layout.gridEndX - this.layout.legendWidth;
        break;
      case 'center':
      default:
        const gridCenterX = this.layout.gridStartX + (this.layout.gridEndX - this.layout.gridStartX) / 2;
        this.layout.legendX = gridCenterX - this.layout.legendWidth / 2;
        break;
    }
  }

  private drawMonthLabels() {
    const ctx = this.context;
    ctx.save();
    
    this.setFontSize(this.opts.fontSize!);
    this.setFillStyle(this.opts.fontColor!);
    this.setTextAlign('center');
    this.setTextBaseline('middle');
                
    if (!this.drawData["startDate"]) return;
                
    const spacing: Record<string, number> = this.drawData["spacing"];
    const drawnMonths = new Set();
    const labelY = spacing["outer"] + this.opts.fontSize! / 2 + spacing["textVertical"];
                
    for (let month = 0; month < 12; month++) {
        const monthDate = new Date(this.drawData["year"], month, 1);
                    
        const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
        if (drawnMonths.has(monthKey)) continue;
        drawnMonths.add(monthKey);
                    
        if (monthDate > this.drawData["yearEnd"]) break;
                    
        const daysSinceStart = this.getDaysBetween(this.drawData["startDate"], monthDate);
        let weekIndex = Math.floor(daysSinceStart / 7);
                    
        if (weekIndex < 0) weekIndex = 0;
        const maxWeeks = Math.ceil(this.drawData.data.length / 7) - 1;
        if (weekIndex > maxWeeks) weekIndex = maxWeeks;
                    
        const weekX = this.layout.margins.left + weekIndex * (this.layout.cellSize + this.opts.extra.heatmap!.cellGap!) +
              (this.layout.cellSize + this.opts.extra.heatmap!.cellGap!) / 2;
                    
        const monthName = this.opts.extra.heatmap!.monthLabels![monthDate.getMonth()];
        ctx.fillText(monthName, weekX, labelY);
    }

    ctx.restore();
  }

  private drawDayLabels() {
    const ctx = this.context;
    ctx.save();

    this.setFontSize(this.opts.fontSize!);
    this.setFillStyle(this.opts.fontColor!);
    this.setTextAlign('left');
    this.setTextBaseline('middle');

    const spacing: Record<string, number> = this.drawData["spacing"];
    
    this.opts.extra.heatmap!.dayLabels!.forEach((day, index) => {
      const y = this.layout.margins.top + index * (this.layout.cellSize + this.opts.extra.heatmap!.cellGap!) + this.layout.cellSize / 2;
      const x = this.layout.margins.left - this.layout.maxDayLabelWidth - spacing["label"];
                    
      ctx.fillText(day, x, y);
    });
                
    ctx.restore();
  }

  protected drawLegend() {
    if (!this.opts.extra.heatmap!.legend!.show) return;
                
    const ctx = this.context;
    ctx.save();
                
    const spacing: Record<string, number> = this.drawData["spacing"];
    const legendY = this.layout.margins.top + 7 * (this.layout.cellSize + this.opts.extra.heatmap!.cellGap!) - 
      this.opts.extra.heatmap!.cellGap! + spacing["legend"];

    const fontSize = this.opts.extra.heatmap!.legend!.fontSize!
    this.setFontSize(fontSize);
    this.setFillStyle(this.opts.fontColor!);
    this.setTextBaseline('middle');
                
    // 根据当前配置的颜色等级计算图例宽度
    const colorBlocksWidth = this.opts.color!.length * this.opts.extra.heatmap!.legend!.cellSize! + 
              (this.opts.color!.length - 1) * this.opts.extra.heatmap!.legend!.cellGap!;
                
    const lessTextWidth = this.measureText(this.opts.extra.heatmap!.legend!.labelLess!, fontSize);
    const moreTextWidth = this.measureText(this.opts.extra.heatmap!.legend!.labelMore!, fontSize);
    // 总宽度计算使用统一的文本间距
    const totalLegendWidth = lessTextWidth + colorBlocksWidth + moreTextWidth + 
            (this.opts.extra.heatmap!.legend!.textGap!) * 2;
                
    let startX;
    switch (this.opts.extra.heatmap!.legend!.position) {
      case 'left':
        // 左对齐：与网格左边缘对齐
        startX = this.layout.gridStartX;
        break;
      case 'right':
        // 右对齐：与网格右边缘精确对齐
        startX = this.layout.gridEndX - totalLegendWidth;
        break;
      case 'center':
      default:
        // 居中对齐：相对于网格中心
        const gridCenterX = this.layout.gridStartX + (this.layout.gridEndX - this.layout.gridStartX) / 2;
        startX = gridCenterX - totalLegendWidth / 2;
        break;
    }
                
    // 更新图例位置信息（用于鼠标检测）
    this.layout.legendX = startX;
    this.layout.legendY = legendY;
    this.layout.legendWidth = totalLegendWidth;
                
    // 绘制"Less"文本，右对齐
    this.setTextAlign('right');
    ctx.fillText(this.opts.extra.heatmap!.legend!.labelLess!, startX + lessTextWidth, legendY);
                
    // 计算颜色块起始位置，使用统一间距
    let currentX = startX + lessTextWidth + this.opts.extra.heatmap!.legend!.textGap!;
    // 绘制当前配置的颜色等级数量的格子
    this.opts.color!.forEach((color) => {
      this.setFillStyle(color);
                    
      this.drawRoundedRect(
        currentX, 
        legendY - this.opts.extra.heatmap!.legend!.cellSize! / 2, 
        this.opts.extra.heatmap!.legend!.cellSize!, 
        this.opts.extra.heatmap!.legend!.cellSize!,
        this.opts.extra.heatmap!.legend!.cellRadius!
      );
                    
      currentX += this.opts.extra.heatmap!.legend!.cellSize! + this.opts.extra.heatmap!.legend!.cellGap!;
    });
                
    // 绘制"More"文本，左对齐，使用统一间距
    this.setTextAlign('left');
    this.setFillStyle(this.opts.fontColor!);
    ctx.fillText(this.opts.extra.heatmap!.legend!.labelMore!, currentX + this.opts.extra.heatmap!.legend!.textGap!, legendY);
    ctx.restore();
  }

  private getDaysBetween(date1: Date, date2: Date) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1).getTime();
    const secondDate = new Date(date2).getTime();
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number, fill = true, stroke = false) {
    if (radius <= 0) {
      if (fill) this.context.fillRect(x, y, width, height);
      if (stroke) this.context.strokeRect(x, y, width, height);
      return;
    }
                
    const r = Math.min(radius, width / 2, height / 2);
                
    this.context.beginPath();
    this.context.moveTo(x + r, y);
    this.context.arcTo(x + width, y, x + width, y + height, r);
    this.context.arcTo(x + width, y + height, x, y + height, r);
    this.context.arcTo(x, y + height, x, y, r);
    this.context.arcTo(x, y, x + width, y, r);
    this.context.closePath();
                
    if (fill) this.context.fill();
    if (stroke) this.context.stroke();
  }

  private fillSeriesData() {
    if(this.opts.series.length == 0) return;
    let seriesData = this.opts.series[0].data;
    if(seriesData.length == 0) return;
    //通过传入数据取第一个值作为年份
    this.drawData.year = new Date(seriesData[0].date).getFullYear();

    this.drawData.yearStart = new Date(this.drawData.year, 0, 1);
    this.drawData.yearEnd = new Date(this.drawData.year, 11, 31);
                
    // 修复：正确计算年度日历布局的起始和结束日期
    this.drawData.startDate = new Date(this.drawData.yearStart);
    const firstDayOfWeek = this.drawData.startDate.getDay();
    this.drawData.startDate.setDate(this.drawData.startDate.getDate() - firstDayOfWeek);
                
    this.drawData.endDate = new Date(this.drawData.yearEnd);
    const lastDayOfWeek = this.drawData.endDate.getDay();
    this.drawData.endDate.setDate(this.drawData.endDate.getDate() + (6 - lastDayOfWeek));
                
    // 修复：根据正确的日历布局生成完整的数据网格
    this.drawData.data = [] as HeatmapChartData[];
    const currentDate = new Date(this.drawData.startDate);
    
    // 生成从startDate到endDate的完整日历网格
    while (currentDate <= this.drawData.endDate) {
      const isInYear = currentDate >= this.drawData.yearStart && currentDate <= this.drawData.yearEnd;
      
      // 查找当前日期对应的数据
      let contributions = 0;
      const dateString = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD 格式
      const matchingData = seriesData.find((item: HeatmapDataItem) => {
        const itemDate = new Date(item.date);
        return itemDate.toLocaleDateString('en-CA') === dateString;
      });
      
      if (matchingData) {
        contributions = matchingData.value;
      }

      // 根据当前配置的颜色等级计算贡献等级
      const levels = this.opts.extra.heatmap!.legend!.colorLevels!;
      let level;
                    
      if (contributions === 0) {
        level = 0;
      } else {
        // 计算每个等级的贡献值范围
        const maxContributions = levels * 4;
        const range = maxContributions / (levels - 1);
        level = Math.min(levels - 1, Math.ceil(contributions / range));
      }

      this.drawData.data.push({
        date: new Date(currentDate),
        contributions: contributions,
        level: level,
        isInYear: isInYear
      });
      
      // 移动到下一天
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // 检查点是否在图例区域内
  private isPointInLegend(x: number, y: number) {
    // 图例区域大致为一个矩形
    const legendTop = this.layout.legendY - this.layout.legendHeight / 2;
    const legendBottom = this.layout.legendY + this.layout.legendHeight / 2;
                
    return x >= this.layout.legendX && x <= this.layout.legendX + this.layout.legendWidth && 
           y >= legendTop && y <= legendBottom;
  }

  /**
   * 图例点击交互
   */
  public touchLegend(touches: Point, animation?: boolean) {
    let index = this.isPointInLegend(touches.x, touches.y)
    console.log("####touchLegend", index)
  }

  public showToolTip(touches: Point, option?: Partial<ToolTipOptions>) {
    let _touches = this.getTouches(touches);
    this.opts = ChartsUtil.objectAssign({} as ChartOptions, this.opts, {
      _scrollDistance_: this.scrollOption.currentOffset,
      animation: false
    });

    // 检查鼠标是否在图例区域内，如果是则不显示tooltip
    if (this.isPointInLegend(_touches.x, _touches.y)) {
      this.drawData.tooltip.visible = false;
      this.render();
      return;
    }

    if (_touches.x < this.layout.gridStartX || _touches.y < this.layout.margins.top ||
          _touches.x > this.layout.gridEndX || _touches.y > this.opts.height - this.layout.margins.bottom) {
      this.drawData.tooltip.visible = false;
      this.render();
      return;
    }

    const week = Math.floor((_touches.x - this.layout.margins.left) / (this.layout.cellSize + this.opts.extra.heatmap!.cellGap!));
    const day = Math.floor((_touches.y - this.layout.margins.top) / (this.layout.cellSize + this.opts.extra.heatmap!.cellGap!));
    const index = week * 7 + day;

    if (index >= 0 && index < this.drawData.data.length) {
      const item = this.drawData.data[index];
      if (item && item.isInYear && item.contributions > 0) {
        const date = item.date;
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
                            
        this.drawData.tooltip = {
          visible: true,
          x: _touches.x,
          y: _touches.y,
          contributions: item.contributions,
          date: formattedDate
        };
        this.render();
        return;
      }
    }
                    
    this.drawData.tooltip.visible = false;
    this.render();
  }

  private drawTooltip() {
    if (!this.drawData.tooltip.visible) return;

    let toolTipOption = ChartsUtil.objectAssign({} as Partial<TooltipOptions>, {
      showBox: true,
      showArrow: true,
      showCategory: false,
      bgColor: 'rgba(30, 30, 30, 0.9)',
      bgOpacity: 0.2,
      borderColor: '#000000',
      borderWidth: 0,
      borderRadius: 4,
      borderOpacity: 0.7,
      boxPadding: 8,
      fontColor: '#FFFFFF',
      fontSize: 13,
      lineHeight: 20,
      splitLine: true,
    }, this.opts.extra.tooltip!);

    if (!toolTipOption.showBox) return;

    const shadow = 'rgba(0, 0, 0, '+toolTipOption.bgOpacity+')';
    let shadowBlur = 0;
    if(toolTipOption.showArrow) shadowBlur = 4;
    let dateSize = Number((toolTipOption.fontSize! * 0.85).toFixed());
    const offsetX = 10;
    const offsetY = 10;

    const ctx = this.context;
    ctx.save();

    this.setFontSize(toolTipOption.fontSize!);
    const titleText = `${this.drawData.tooltip.contributions} contribution${this.drawData.tooltip.contributions !== 1 ? 's' : ''}`;
    const titleWidth = this.measureText(titleText, toolTipOption.fontSize!);
                
    this.setFontSize(dateSize);
    const dateWidth = this.measureText(this.drawData.tooltip.date, dateSize);
    const maxTextWidth = Math.max(titleWidth, dateWidth);
                
    const tooltipWidth = maxTextWidth + toolTipOption.boxPadding! * 2;
    const tooltipHeight = toolTipOption.fontSize! + dateSize + toolTipOption.boxPadding! * 3;
                
    let x = this.drawData.tooltip.x + offsetX;
    let y = this.drawData.tooltip.y + offsetY;
                
    if (x + tooltipWidth > this.opts.width) {
      x = this.drawData.tooltip.x - tooltipWidth - offsetX;
    }
                
    if (y + tooltipHeight > this.opts.height) {
      y = this.drawData.tooltip.y - tooltipHeight - offsetY;
    }
                
    
    this.setShadow(2, 2, shadowBlur, shadow);
    this.setFillStyle(toolTipOption.bgColor!);
    this.drawRoundedRect(x, y, tooltipWidth, tooltipHeight, toolTipOption.borderRadius!);
                
    ctx.shadowBlur = 0;
    this.setFillStyle(toolTipOption.fontColor!);

    this.setFontSize(toolTipOption.fontSize!);
    ctx.fillText(titleText, x + toolTipOption.boxPadding, y + toolTipOption.boxPadding + toolTipOption.fontSize);
    
    this.setFontSize(dateSize);            
    ctx.fillText(this.drawData.tooltip.date, x + toolTipOption.boxPadding, y + toolTipOption.boxPadding + toolTipOption.fontSize + dateSize + toolTipOption.boxPadding);
                
    ctx.restore();
  }
}
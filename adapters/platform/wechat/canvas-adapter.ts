import { CanvasContext, CanvasGradient, CanvasPattern, TextMetrics } from '../../../interface/canvas.type';

/**
 * 微信小程序Canvas上下文适配器
 * 将微信小程序Canvas API适配到统一的CanvasContext接口
 */
export class WechatCanvasContext implements CanvasContext {
  private ctx: any; // 微信小程序的canvas context
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(ctx: any, width: number, height: number) {
    this.ctx = ctx;
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  // 属性
  get width(): number {
    return this.canvasWidth;
  }

  get height(): number {
    return this.canvasHeight;
  }

  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.ctx.fillStyle;
  }

  set fillStyle(value: string | CanvasGradient | CanvasPattern) {
    this.ctx.fillStyle = value;
  }

  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.ctx.strokeStyle;
  }

  set strokeStyle(value: string | CanvasGradient | CanvasPattern) {
    this.ctx.strokeStyle = value;
  }

  get lineWidth(): number {
    return this.ctx.lineWidth;
  }

  set lineWidth(value: number) {
    this.ctx.lineWidth = value;
  }

  get lineCap(): "butt" | "round" | "square" {
    return this.ctx.lineCap;
  }

  set lineCap(value: "butt" | "round" | "square") {
    this.ctx.lineCap = value;
  }

  get font(): string {
    return this.ctx.font || '10px sans-serif';
  }

  set font(value: string) {
    this.ctx.font = value;
  }

  get textAlign(): "center" | "end" | "left" | "right" | "start" {
    return this.ctx.textAlign || 'start';
  }

  set textAlign(value: "center" | "end" | "left" | "right" | "start") {
    this.ctx.textAlign = value;
  }

  get textBaseline(): "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top" {
    return this.ctx.textBaseline || 'alphabetic';
  }

  set textBaseline(value: "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top") {
    this.ctx.textBaseline = value;
  }

  get shadowColor(): string {
    return this.ctx.shadowColor || 'rgba(0, 0, 0, 0)';
  }

  set shadowColor(value: string) {
    this.ctx.shadowColor = value;
  }

  get shadowOffsetX(): number {
    return this.ctx.shadowOffsetX || 0;
  }

  set shadowOffsetX(value: number) {
    this.ctx.shadowOffsetX = value;
  }

  get shadowOffsetY(): number {
    return this.ctx.shadowOffsetY || 0;
  }

  set shadowOffsetY(value: number) {
    this.ctx.shadowOffsetY = value;
  }

  get shadowBlur(): number {
    return this.ctx.shadowBlur || 0;
  }

  set shadowBlur(value: number) {
    this.ctx.shadowBlur = value;
  }

  get lineJoin(): CanvasLineJoin {
    return this.ctx.lineJoin || 'miter';
  }

  set lineJoin(value: CanvasLineJoin) {
    this.ctx.lineJoin = value;
  }

  // 方法
  beginPath(): void {
    this.ctx.beginPath();
  }

  setLineDash(segments: number[]): void {
    if (this.ctx.setLineDash) {
      this.ctx.setLineDash(segments);
    }
  }

  measureText(text: string): TextMetrics {
    const metrics = this.ctx.measureText(text);
    return {
      width: metrics.width || 0,
      height: 12 // 微信小程序可能不支持height，使用默认值
    };
  }

  translate(x: number, y: number): void {
    this.ctx.translate(x, y);
  }

  rotate(angle: number): void {
    this.ctx.rotate(angle);
  }

  moveTo(x: number, y: number): void {
    this.ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number): void {
    this.ctx.lineTo(x, y);
  }

  stroke(): void {
    this.ctx.stroke();
  }

  restore(): void {
    this.ctx.restore();
  }

  save(): void {
    this.ctx.save();
  }

  closePath(): void {
    this.ctx.closePath();
  }

  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    if (maxWidth !== undefined) {
      this.ctx.fillText(text, x, y, maxWidth);
    } else {
      this.ctx.fillText(text, x, y);
    }
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.ctx.fillRect(x, y, w, h);
  }

  rect(x: number, y: number, w: number, h: number): void {
    this.ctx.rect(x, y, w, h);
  }

  fill(fillRule?: "evenodd" | "nonzero"): void {
    if (fillRule) {
      this.ctx.fill(fillRule);
    } else {
      this.ctx.fill();
    }
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    this.ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    this.ctx.clearRect(x, y, w, h);
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
    return this.ctx.createLinearGradient(x0, y0, x1, y1);
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.ctx.quadraticCurveTo(cpx, cpy, x, y);
  }

  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
    return this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }

  createCircularGradient(x: number, y: number, r: number): CanvasGradient {
    // 起点和终点都在同一个圆心，内半径为0，外半径为r
    return this.createRadialGradient(x, y, 0, x, y, r);
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number): void {
    if (maxWidth !== undefined) {
      this.ctx.strokeText(text, x, y, maxWidth);
    } else {
      this.ctx.strokeText(text, x, y);
    }
  }

  strokeRect(x: number, y: number, w: number, h: number): void {
    this.ctx.strokeRect(x, y, w, h);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    if (this.ctx.arcTo) {
      this.ctx.arcTo(x1, y1, x2, y2, radius);
    }
  }
}
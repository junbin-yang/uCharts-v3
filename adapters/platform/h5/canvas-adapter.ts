import { CanvasContext, CanvasGradient, CanvasPattern, Matrix2D, TextMetrics } from '../../../interface/canvas.type';

/**
 * H5平台Canvas上下文适配器
 * 将浏览器Canvas API适配到统一的CanvasContext接口
 */
export class H5CanvasContext implements CanvasContext {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // 这个是扩展的。H5可以通过该属性获取dom，这样就可以把点击事件在Renderer内部就适配好。
  get canvas(): HTMLCanvasElement {
    return this.ctx.canvas
  }

  // 属性
  get width(): number {
    return this.ctx.canvas.offsetWidth //this.ctx.canvas.width;
  }

  get height(): number {
    return this.ctx.canvas.offsetHeight //this.ctx.canvas.height;
  }

  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.ctx.fillStyle as any;
  }

  set fillStyle(value: string | CanvasGradient | CanvasPattern) {
    this.ctx.fillStyle = value as any;
  }

  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.ctx.strokeStyle as any;
  }

  set strokeStyle(value: string | CanvasGradient | CanvasPattern) {
    this.ctx.strokeStyle = value as any;
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
    return this.ctx.font;
  }

  set font(value: string) {
    this.ctx.font = value;
  }

  get textAlign(): "center" | "end" | "left" | "right" | "start" {
    return this.ctx.textAlign;
  }

  set textAlign(value: "center" | "end" | "left" | "right" | "start") {
    this.ctx.textAlign = value;
  }

  get textBaseline(): "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top" {
    return this.ctx.textBaseline;
  }

  set textBaseline(value: "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top") {
    this.ctx.textBaseline = value;
  }

  get shadowColor(): string {
    return this.ctx.shadowColor;
  }

  set shadowColor(value: string) {
    this.ctx.shadowColor = value;
  }

  get shadowOffsetX(): number {
    return this.ctx.shadowOffsetX;
  }

  set shadowOffsetX(value: number) {
    this.ctx.shadowOffsetX = value;
  }

  get shadowOffsetY(): number {
    return this.ctx.shadowOffsetY;
  }

  set shadowOffsetY(value: number) {
    this.ctx.shadowOffsetY = value;
  }

  get shadowBlur(): number {
    return this.ctx.shadowBlur;
  }

  set shadowBlur(value: number) {
    this.ctx.shadowBlur = value;
  }

  // 方法
  beginPath(): void {
    this.ctx.beginPath();
  }

  setLineDash(segments: number[]): void {
    this.ctx.setLineDash(segments);
  }

  measureText(text: string): TextMetrics {
    const metrics = this.ctx.measureText(text);
    return {
      width: metrics.width,
      height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
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
    this.ctx.fillText(text, x, y, maxWidth);
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.ctx.fillRect(x, y, w, h);
  }

  rect(x: number, y: number, w: number, h: number): void {
    this.ctx.rect(x, y, w, h);
  }

  fill(fillRule?: "evenodd" | "nonzero"): void {
    this.ctx.fill(fillRule);
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    this.ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    this.ctx.clearRect(x, y, w, h);
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
    return this.ctx.createLinearGradient(x0, y0, x1, y1) as any;
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.ctx.quadraticCurveTo(cpx, cpy, x, y);
  }
} 
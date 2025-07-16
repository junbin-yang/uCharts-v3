
export declare class CanvasContext {
  readonly width: number;
  readonly height: number;
  fillStyle: string|CanvasGradient|CanvasPattern;
  strokeStyle: string|CanvasGradient|CanvasPattern;
  lineWidth: number;
  lineCap: CanvasLineCap;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  lineJoin: CanvasLineJoin;

  beginPath(): void;
  setLineDash(segments: number[]): void;
  measureText(text: string): TextMetrics;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
  restore(): void;
  save(): void;
  closePath(): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  fill(fillRule?: CanvasFillRule): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  /* createRadialGradient 和 createCircularGradient 最少支持一个即可，平台适配时只需保证其中一个支持。另一个返回undefined即可 */
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
  createCircularGradient(x: number, y: number, r: number): CanvasGradient;
}
export declare type CanvasLineJoin = "bevel" | "miter" | "round";
export declare type CanvasTextAlign = "center" | "end" | "left" | "right" | "start";
export declare type CanvasLineCap = "butt" | "round" | "square";
export declare type CanvasTextBaseline = "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top";
export declare type CanvasFillRule = "evenodd" | "nonzero";
export declare class CanvasGradient {
  addColorStop(offset: number, color: string): void;
}
export declare interface CanvasPattern {
  setTransform(transform?: Matrix2D): void;
}
export declare class Matrix2D {
  scaleX?: number;
  rotateY?: number;
  rotateX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
  identity(): Matrix2D;
  invert(): Matrix2D;
  multiply(other?: Matrix2D): Matrix2D;
  rotate(rx?: number, ry?: number): Matrix2D;
  rotate(degree: number, rx?: number, ry?: number): Matrix2D;
  translate(tx?: number, ty?: number): Matrix2D;
  scale(sx?: number, sy?: number): Matrix2D;
  constructor();
}
export declare interface TextMetrics {
  readonly width: number;
  readonly height: number;
}
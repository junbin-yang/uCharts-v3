export type EventListener = (...args: Array<string|number>) => void;

/**
 * 可监听的事件类型
 * renderComplete 渲染完成 | scrollLeft 滚动到最左侧 | scrollRight 滚动到最右侧
 */
export type EventType = "renderComplete" | "scrollLeft" | "scrollRight"

export class EventEmitter {
  private events: Record<string, EventListener[]> = {};

  // 监听事件
  on(type: EventType, listener: EventListener): void {
    this.events[type] = this.events[type] || [];
    this.events[type].push(listener);
  }

  // 取消监听（支持移除单个或全部监听器）
  off(type: EventType, listener?: EventListener): void {
    if (!this.events[type]) return;

    if (listener) {
      // 移除特定监听器
      this.events[type] = this.events[type].filter(l => l !== listener);
    } else {
      // 移除所有监听器
      this.events[type] = [];
    }
  }

  // 触发事件
  emit(type: EventType, ...args: Array<string|number>): void {
    if (this.events[type]) {
      this.events[type].forEach(listener => {
        try {
          listener(...args);
        } catch (e) {
          console.error('[EventEmitter]', e);
        }
      });
    }
  }
}
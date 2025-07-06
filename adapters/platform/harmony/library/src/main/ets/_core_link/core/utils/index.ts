import { AnyType, ChartOptions } from '../types';
import { NameAndValueData, Series, ValueAndColorData } from '../types/series';
import { GlobalConfig } from "../types/config";

export class ChartsUtil {
   /**
   * 深度合并多个对象（递归合并）
   * @param target - 目标对象，合并结果将存入该对象
   * @param sources - 源对象数组，将按顺序合并到目标对象
   * @returns 合并后的目标对象
   */
  static objectAssign<T extends object, U extends Array<object | null | undefined>>(
    target: T,
    ...sources: U
  ): T & Partial<NonNullable<U[number]>> {
    // 处理目标对象为null或undefined的情况
    if (target === null || target === undefined) {
      throw new TypeError('[uCharts] Cannot convert undefined or null to object');
    }

    // 没有源对象时直接返回目标对象
    if (!sources || sources.length === 0) {
      return target
    }

    // 深度合并辅助函数
    const deepAssign = (obj1: any, obj2: any): any => {
      // 处理obj2为null或undefined的情况
      if (obj2 === null || obj2 === undefined) {
        return obj1
      }

      // 遍历obj2的所有属性
      for (const key in obj2) {
        if (Object.prototype.hasOwnProperty.call(obj2, key)) {
          const obj1Val = obj1[key]
          const obj2Val = obj2[key]

          // 如果两个值都是普通对象，则递归合并
          if (
            obj1Val &&
              obj2Val &&
              typeof obj1Val === 'object' &&
              typeof obj2Val === 'object' &&
              !Array.isArray(obj1Val) &&
              !Array.isArray(obj2Val)
          ) {
            obj1[key] = deepAssign(obj1Val, obj2Val)
          } else {
            // 否则直接赋值（覆盖）
            obj1[key] = obj2Val
          }
        }
      }
      return obj1
    }

    // 逐个合并源对象
    sources.forEach(source => {
      if (source !== null && source !== undefined) {
        target = deepAssign(target, source) as T & U[number]
      }
    })

    return target
  }

  /**
   * 判断是否为浮点数
   */
  static isFloat(num: number): boolean {
    return num % 1 !== 0
  }

  /**
   * 限制小数位数（仅对浮点数有效）
   * @param num 输入数字
   * @param limit 保留位数，默认2位
   */
  static toFixed(num: number, limit: number = 2): number | string {
    if (ChartsUtil.isFloat(num)) {
      return num.toFixed(limit)
    }
    return num
  }

  /**
   * 将 HEX 颜色值转换为 RGBA 格式
   * @param hexValue - HEX 颜色值（支持短格式如 #fff 或长格式如 #ffffff）
   * @param opacity - 透明度（0-1 之间的数字，默认 1）
   * @returns RGBA 颜色字符串（如 rgba(255, 255, 255, 0.5)）
   */
  static hexToRgb(hexValue: string, opacity: number = 1): string {
    // 处理短格式 HEX（如 #fff）
    const shortHexRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    const hex = hexValue.replace(shortHexRegex, (_, r, g, b) => r + r + g + g + b + b)

    // 解析标准 HEX（如 #ffffff）
    const rgbRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
    const match = rgbRegex.exec(hex)

    if (!match) {
      throw new Error(`Invalid HEX color: ${hexValue}`)
    }

    // 转换为十进制 RGB 值
    const r = parseInt(match[1], 16)
    const g = parseInt(match[2], 16)
    const b = parseInt(match[3], 16)

    // 限制透明度范围
    const clampedOpacity = Math.max(0, Math.min(1, opacity))

    return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`
  }

  static fillSeries(series: Series[], opts: ChartOptions) {
    let index = 0;
    for (let i = 0; i < series.length; i++) {
      let item: Series = series[i];
      if (!item.color) {
        item.color = GlobalConfig.color[index];
        index = (index + 1) % GlobalConfig.color.length;
      }
      if (!item.linearIndex) {
        item.linearIndex = i;
      }
      if (!item.index) {
        item.index = 0;
      }
      if (!item.type) {
        item.type = opts.type;
      }
      if (typeof item.show == "undefined") {
        item.show = true;
      }
      if (!item.pointShape) {
        item.pointShape = "circle";
      }
      if (!item.legendShape) {
        switch (item.type) {
          case 'line':
            item.legendShape = "line";
            break;
          case 'column':
          case 'bar':
            item.legendShape = "rect";
            break;
          case 'area':
          case 'mount':
            item.legendShape = "triangle";
            break;
          default:
            item.legendShape = "circle";
        }
      }
    }
    return series;
  }

  static filterSeries(series: Series[]) {
    let tempSeries: Series[] = [];
    for (let i = 0; i < series.length; i++) {
      if (series[i].show == true) {
        tempSeries.push(series[i])
      }
    }
    return tempSeries;
  }

  /**
   * 合并多个Series的数据数组并计算堆叠总和
   */
  static dataCombineStack(series: Series[], len: number): AnyType[] {
    const isValueAndColorData = (item: any): item is ValueAndColorData => {
      return typeof item === 'object' && item !== null && 'value' in item && 'color' in item;
    }
    const isNameAndValueData = (item: any): item is NameAndValueData => {
      return typeof item === 'object' && item !== null && 'name' in item && 'value' in item;
    }

    const sum = new Array(len).fill(0);

    // 计算每个索引位置的累加值
    for (const s of series) {
      for (let j = 0; j < len; j++) {
        const item = s.data[j];
        if (item === null) continue; // 跳过null值

        // 根据不同类型的数据项提取值
        if (typeof item === 'number') {
          sum[j] += item;
        } else if (isValueAndColorData(item)) {
          sum[j] += item.value;
        } else if (isNameAndValueData(item)) {
          sum[j] += item.value;
        } else if (Array.isArray(item)) {
          // 处理number[]类型（取第一个值作为代表）
          sum[j] += item[0] || 0;
        }
      }
    }

    // 扁平化所有数据并转换为统一格式
    const flatData = series.flatMap(s =>
      s.data.map((item: AnyType) => {
        if (item === null) return { value: 0 };
        if (typeof item === 'number') return { value: item };
        if (isValueAndColorData(item)) return item;
        if (isNameAndValueData(item)) return item;
        if (Array.isArray(item)) return { value: item[0] || 0 };
        return { value: 0 }; // 默认情况
      })
    );

    // 转换sum数组为对象格式
    const sumObjects = sum.map(value => ({ value }));

    return [...flatData, ...sumObjects];
  }

  /**
   * 合并多个Series的数据数组
   */
  static dataCombine(series: Series[]): AnyType[] {
    return series.reduce((acc: AnyType[], current: Series) => {
      // 获取当前 Series 的 data 属性，确保其为数组
      const currentData = current.data || [];
      // 合并到累积结果
      return acc.concat(currentData);
    }, []); // 初始值为数组，累积所有 data 元素
  }

  static getDataRange(minData: number, maxData: number) {
    let limit = 0;
    let range = maxData - minData;
    if (range >= 10000) {
      limit = 1000;
    } else if (range >= 1000) {
      limit = 100;
    } else if (range >= 100) {
      limit = 10;
    } else if (range >= 10) {
      limit = 5;
    } else if (range >= 1) {
      limit = 1;
    } else if (range >= 0.1) {
      limit = 0.1;
    } else if (range >= 0.01) {
      limit = 0.01;
    } else if (range >= 0.001) {
      limit = 0.001;
    } else if (range >= 0.0001) {
      limit = 0.0001;
    } else if (range >= 0.00001) {
      limit = 0.00001;
    } else {
      limit = 0.000001;
    }
    return {
      minRange: ChartsUtil.findRange(minData, 'lower', limit),
      maxRange: ChartsUtil.findRange(maxData, 'upper', limit)
    };
  }

  static findRange(num: number, type: string, limit: number) {
    limit = limit || 10;
    type = type ? type : 'upper';
    let multiple = 1;
    while (limit < 1) {
      limit *= 10;
      multiple *= 10;
    }
    if (type === 'upper') {
      num = Math.ceil(num * multiple);
    } else {
      num = Math.floor(num * multiple);
    }
    while (num % limit !== 0) {
      if (type === 'upper') {
        if (num == num + 1) { //修复数据值过大num++无效的bug
          break;
        }
        num++;
      } else {
        num--;
      }
    }
    return num / multiple;
  }

  static fillCustomColor(linearType: 'none'|'opacity'|'custom', customColor: string[], series: Series[]) {
    let newcolor = customColor || [];
    if (linearType == 'custom' && newcolor.length == 0 ) {
      newcolor = GlobalConfig.linearColor;
    }
    if (linearType == 'custom' && newcolor.length < series.length) {
      let chazhi = series.length - newcolor.length;
      for (var i = 0; i < chazhi; i++) {
        newcolor.push(GlobalConfig.linearColor[(i + 1) % GlobalConfig.linearColor.length]);
      }
    }
    return newcolor;
  }
}
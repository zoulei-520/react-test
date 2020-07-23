import '@/extensions';

/**
 * 加0补位
 */
const fAddZero = (v: string): string => {
  let newV: string = `00${v}`;
  return newV.substring(newV.length - 2, newV.length);
};
/**
 * rgb转hex
 */
const fColorToHex = (r: number, g: number, b: number): string => `#${fAddZero(r.toString(16))}${fAddZero(g.toString(16))}${fAddZero(b.toString(16))}`;
/**
 * 解析rgb格式
 */
const fAnalysisRGB = (temp: string): Array<number> => {
  let colorTemp: string = temp.toLowerCase().substring(1, temp.length);
  let colors: Array<any> = [];
  colors.push(parseInt(colorTemp.substring(0, 2), 16));
  colors.push(parseInt(colorTemp.substring(2, 4), 16));
  colors.push(parseInt(colorTemp.substring(4, 6), 16));
  return colors;
};
/**
 * @description
 * 颜色渐变
 * @param startColor:string 起始色值
 * @param endColor:string 结束色值
 * @param num:number 渐变数量
 * @returns Array<string> 产生的渐变色数组(16进制色值)
 */
const fColorGradualChange = (startColor: string, endColor: string, num: number): Array<string> => {
  let rgb: RegExp = /^rgb|RGB\((([0-9]|[1-9]\d|1\d\d|2([0-4]\d|5[0-5])),){2}([0-9]|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\)$/; // rgb
  let hex: RegExp = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i; // 16进制
  // 颜色预处理
  let startRGB: number[] = [];
  let endRGB: number[] = [];
  if (startColor.test(hex)) startRGB = fAnalysisRGB(startColor);
  else if (startColor.test(rgb))
    startRGB = startColor
      .substring(3, 15)
      .split(',')
      .map((item: string): number => parseInt(item));
  if (endColor.test(hex)) endRGB = fAnalysisRGB(endColor);
  else if (startColor.test(rgb))
    endRGB = endColor
      .substring(3, 15)
      .split(',')
      .map((item: string): number => parseInt(item));
  let [startR, startG, startB]: Array<number> = startRGB;
  let [endR, endG, endB]: Array<number> = endRGB;
  let sR: number = (endR - startR) / num;
  let sG: number = (endG - startG) / num;
  let sB: number = (endB - startB) / num;
  let colors: string[] = [];
  for (let i = 0; i < num; i++) colors.push(fColorToHex(Math.floor(sR * i + startR), Math.floor(sG * i + startG), Math.floor(sB * i + startB)));
  return colors;
};

/**
 * @description
 * 16进制色值转化为RGB值数组[R,G,B]
 * 若是传入色值不符合要求默认返回[255,0,0]
 *
 * @param hexColor 16进制色值
 * @returns number[] RGB各值数组
 */
const hexToRgb = (hexColor: string): number[] => {
  let sColor: string = hexColor.toLowerCase();
  // 十六进制颜色值的正则表达式
  let reg: RegExp = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  // 如果是16进制颜色
  if (sColor && sColor.test(reg)) {
    if (sColor.length === 4) {
      let sColorNew: string = '#';
      for (let i = 1; i < 4; i += 1) sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      sColor = sColorNew;
    }
    // 处理六位的颜色值
    let sColorChange: number[] = [];
    for (let i = 1; i < 7; i += 2) sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`));
    return sColorChange;
  }
  return [255, 0, 0];
};

/**
 * @description
 * RGB 颜色值转换为 HSL.
 * 转换公式参考自 http://en.wikipedia.org/wiki/HSL_color_space.
 * r, g, 和 b 需要在 [0, 255] 范围内
 * 返回的 h, s, 和 l 在 [0, 1] 之间
 *
 * @param number[] RGB色值数组
 * @returns Array<number> HSL各值数组
 */
const rgbToHsl = (rgb: number[]): Array<number> => {
  let [r, g, b]: Array<number> = rgb;
  r /= 255;
  g /= 255;
  b /= 255;
  let max: number = Math.max(r, g, b);
  let min: number = Math.min(r, g, b);
  let h: number = 0;
  let s: number = 0;
  let l: number = (max + min) / 2;
  if (max === min) {
    h = 0; // achromatic
    s = 0;
  } else {
    let d: number = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
};

const colorArray: Array<string> = ['#FF0000', '#FF9A00', '#CCFF00', '#33FF00', '#00FF67', '#00FFFF', '#0066FF', '#3300FF', '#CC00FF', '#FF0099', '#FF0000'];
/**
 * 获取HSL色值
 * @param value:number 1-100数值
 * @returns Array<number> [H,S,L]
 */
export const getHslColor = (value: number): Array<number> => {
  let step: number = 10;
  let colorZone: number = Math.floor(Math.abs(value - 1) / step);
  return rgbToHsl(hexToRgb(fColorGradualChange(colorArray[colorZone], colorArray[colorZone + 1], step)[value % step]));
};
/**
 * 获取16进制格式色值
 * @param value 色值在滑块上的值,1-100
 * @returns string 16进制Hex色值
 */
export const getHexColor = (value: number): string => {
  let step: number = 10;
  let colorZone: number = Math.floor(Math.abs(value - 1) / step);
  return fColorGradualChange(colorArray[colorZone], colorArray[colorZone + 1], step)[value % step];
};

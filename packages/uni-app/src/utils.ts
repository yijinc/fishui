/***
 * 简单尺寸转化：
 * @param {String|Number} size
 * @return {String|0}
 * **/
export const getSizeToPx = (size: number | string): string | 0 => {
  if (String(size).startsWith('0')) return 0;
  if (typeof size === 'number' || /^\d+$/.test(size)) {
    return `${size}px`;
  }
  return size;
};

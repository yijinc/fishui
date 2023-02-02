import { SelectorQuery, NodesRef } from '@tarojs/taro';

export type IQueryResult = 
  NodesRef.BoundingClientRectCallbackResult |
  NodesRef.ScrollOffsetCallbackResult |
  NodesRef.ContextCallbackResult;

/***
 * 递归查询 query.exec 直到有结果或超时报错（第一次可能无法获取到）
 * @param {SelectorQuery} query
 * @param {Number} interval
 * @param {Number} timeout
 * **/
export const execSelectQuery = (selectQuery: SelectorQuery, interval = 100, timeout = 3000): Promise<IQueryResult | IQueryResult[]> => {
  const _startTime = Date.now();
  return new Promise((resolve, reject) => {
    const func = () => {
      selectQuery.exec(res => {
        const result = res[0];
        if (Date.now() - _startTime > timeout) {
          reject(new Error('query time out'));
        } else if (result === null || (Array.isArray(result) && result.length === 0)) {
          setTimeout(func, interval);
        } else {
          resolve(result);
        }
      });
    };
    func();
  });
};

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

/***
 * _.isEqual 简单判断
 * **/
export const isEqual = (a: any, b: any) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length ? a.every((item, index) => isEqual(item, b[index])) : false;
  }
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    return Object.keys(a).length === Object.keys(b).length ? Object.keys(a).every((key) => isEqual(a[key], b[key])) : false;
  }
  return Object.is(a, b);
};
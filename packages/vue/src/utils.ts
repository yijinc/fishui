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

/**
 * 转驼峰命名
 * **/
export const toCamelCase = (name: string) => {
  return name.split('-').map((str: string) => str.charAt(0).toUpperCase() + str.substring(1)).join('');
}
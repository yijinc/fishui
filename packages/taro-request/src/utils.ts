/***
 * 在 url 尾部添加参数
 * @param {String} url
 * @param {Object} params
 * **/
export const appendQueryParams = (url: string = '', params: Record<string, string | number> = {}): string => {
  const queryParamsString = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
  if (!queryParamsString) return url;
  if (url.includes('?')) {
    if (url.endsWith('&') || url.endsWith('?')) return url + queryParamsString;
    return `${url}&${queryParamsString}`;
  }
  return `${url}?${queryParamsString}`;
};

export const merge = <TObject, TSource>(curObj: TObject, source: TSource): TObject & TSource => {
  const keys = Object.keys(curObj as Object);
  const sourceKeys = Object.keys(source as Object);
  sourceKeys.forEach(key => {
    if (keys.indexOf(key) === -1) {
      keys.push(key)
    }
  });
  const target = Array.isArray(curObj) ? [] : {};
  keys.forEach(key => { // @ts-ignore
    const cur = curObj[key]; // @ts-ignore
    const src = source[key];
    if (typeof cur === 'object' && typeof src === 'object') { // @ts-ignore
      target[key] = merge(cur, src);
    } else { // @ts-ignore
      target[key] = src === undefined ? cur : src;
    }
  });
  return target as TObject & TSource;
}
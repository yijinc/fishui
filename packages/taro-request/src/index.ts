import Taro from '@tarojs/taro';
import { appendQueryParams, merge } from './utils';
import * as Type from '../types'

/**
 * Taro.request Option 参数说明 https://docs.taro.zone/docs/apis/network/request/#option
 * 
 * 如果存在多个后端服务，可在每个服务创建不同 request instance
 * import { createRequest } from '@/utils/request'
 * const http = createRequest({ baseURL: 'api.other.com' })
 * 
 * 否则 直接使用默认请求
 * import request from '@/utils/request'
*/

export class ApiError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export const createRequest = (defaultConfig: Type.RequestConfig): Type.RequestMethod => {
  const _requestInterceptors: Type.RequestInterceptor[] = [];
  const _responseInterceptors: Type.ResponseInterceptor[] = [];
  const _responseErrorInterceptors: Type.ResponseErrorInterceptor[] = [];
  const _defaultConfig: Type.RequestConfig = defaultConfig;

  if (!_defaultConfig.header) {
    _defaultConfig.header = {};
  }
  if (!_defaultConfig.baseURL) {
    _defaultConfig.baseURL = '';
  }

  // 公共请求方法，请求/响应 处理 请在 requestInstance.interceptors 中
  const request = (async <T>(option: Type.RequestOption) => {
    let config = merge(_defaultConfig, option) as Type.AllConfig;
    if (!config.params) config.params = {};
    if (config.showErrorMsg === undefined) config.showErrorMsg = true;
    for (const func of _requestInterceptors ) {
      config = await func(config) || config;
    }
    const url = config.url.startsWith('http') ? config.url : _defaultConfig.baseURL + config.url;
    config.url = appendQueryParams(url, option.params);
    try {
      let response: ReturnType<Type.ResponseInterceptor> = await Taro.request(config);
      for (const func of _responseInterceptors ) {
        response = await func(response as Taro.request.SuccessCallbackResult<Type.ResponseData<T>>, config);
      }
      return (response as any) as T;
    } catch (e) {
      let error = e;
      for (const func of _responseErrorInterceptors) {
        error = await func(error, config);
      }
      return Promise.reject(error);
    }
  }) as Type.RequestMethod;

  // 简单模拟 axios interceptor api
  request.interceptors = {
    request: {
      use: (intercepter?: Type.RequestInterceptor) => {
        if (typeof intercepter === 'function') {
          _requestInterceptors.push(intercepter)
        }
      }
    },
    response: {
      use: (intercepter?: Type.ResponseInterceptor, errorIntercepter?: Type.ResponseErrorInterceptor) => {
        if (typeof intercepter === 'function') {
          _responseInterceptors.push(intercepter)
        }
        if (typeof errorIntercepter === 'function') {
          _responseErrorInterceptors.push(errorIntercepter)
        }
      }
    },
  };

  /**
   * interceptors.request 修改 config 每次请求都会执行，
   * 对于计算量大的、异步 或是 localStorage 等耗时操作可以直接 调用setConfig 设置一次
  */
  request.setConfig = (config: Type.RequestConfig) => {
    Object.assign(_defaultConfig, merge(_defaultConfig, config))
  };

  request.get = <T>(url: string, option?: Type.RequestWithMehodOption) => request<T>({...option, url, method: 'GET' }); 
  request.post = <T>(url: string, option?: Type.RequestWithMehodOption) => request<T>({...option, url, method: 'POST' });
  request.put = <T>(url: string, option?: Type.RequestWithMehodOption) => request<T>({...option, url, method: 'PUT' }); 
  request.delete = <T>(url: string, option?: Type.RequestWithMehodOption) => request<T>({...option, url, method: 'DELETE' });
  request.trace = <T>(url: string, option?: Type.RequestWithMehodOption) => request<T>({...option, url, method: 'TRACE' }); 
  request.head = <T>(url: string, option?: Type.RequestWithMehodOption) => request<T>({...option, url, method: 'HEAD' });

  return request;
};


/**
 * create a default request instance
 * ****/
const defaultRequest = createRequest({
  dataType: 'json',
  enableHttp2: true,
  enableQuic: true,
  enableCache: true,
});

export default defaultRequest;

/// <reference types="@tarojs/taro/types" />

declare class ApiError extends Error {
  code: string;
  constructor(message: string, code: string);
}

interface RequestConfig extends Omit<Taro.request.Option, 'url'|'data'|'method'|'success'|'fail'|'complete'> {
  baseURL?: string;
}

interface RequestOption extends Omit<Taro.request.Option, 'success'|'fail'|'complete'> {
  params?: Record<string, any>;
  showErrorMsg?: boolean; // Toast error message?
}

type AllConfig = Required<RequestOption> & Required<RequestConfig>

type RequestWithMehodOption = Omit<RequestOption, 'method'|'url'>

interface ResponseData<T> {
  code: string;
  data: T;
  message: string;
  ok: boolean;
  status: 200|500|400|401|502;
}

type RequestInterceptor = (config: AllConfig) => AllConfig|Promise<AllConfig>;

type ResponseInterceptor = <T>(
  response: Taro.request.SuccessCallbackResult<ResponseData<T>>,
  config: AllConfig,
) => Promise<Taro.request.SuccessCallbackResult<ResponseData<T>>>|Taro.request.SuccessCallbackResult<ResponseData<T>>|ResponseData<T>|Promise<ResponseData<T>>|Promise<T>|T;

type ResponseErrorInterceptor = (
  error: TaroGeneral.CallbackResult|Error,
  config: AllConfig,
) => TaroGeneral.CallbackResult|Error|Promise<Error>;

interface RequestMethod {
  <T>(option: RequestOption): Promise<T>;
  interceptors: {
    request: {
      use: (intercepter?: RequestInterceptor) => void;
    };
    response: {
      use: (intercepter?: ResponseInterceptor, errorIntercepter?: ResponseErrorInterceptor) => void;
    };
  };
  setConfig: (config: RequestConfig) => void;
  get: <T>(url: string, option?: RequestWithMehodOption) => Promise<T>;
  post: <T>(url: string, option?: RequestWithMehodOption) => Promise<T>;
  put: <T>(url: string, option?: RequestWithMehodOption) => Promise<T>;
  delete: <T>(url: string, option?: RequestWithMehodOption) => Promise<T>;
  trace: <T>(url: string, option?: RequestWithMehodOption) => Promise<T>;
  head: <T>(url: string, option?: RequestWithMehodOption) => Promise<T>;
}

declare const createRequest: (config: RequestConfig) => RequestMethod;

declare const iRequest: RequestMethod;

export {
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  ResponseErrorInterceptor,
  RequestMethod,
  RequestOption,
  RequestWithMehodOption,
  AllConfig,
  ResponseData,
  createRequest,
  ApiError,
}

export default iRequest;

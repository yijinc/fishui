
[Taro.requst](https://docs.taro.zone/docs/apis/network/request) 简单封装

## 安装

```base
npm add @taropui/request
```

## 使用

### 直接使用

```js
import request from '@taropui/request';

request({ url: 'https://api.example.com/user', method: 'POST', data: { user: 1 } })
// or
request.post('https://api.example.com/user', { data })
```

### 创建新的实例

```js
import { createRequest } from '@taropui/request';

const request = createRequest({
  baseURL: 'https://api.example.com',
  header: {
    'content-type': 'application/json',
    'appName': 'myApp',
    'token': Taro.getStorageSync('token') || '',
  }
});

request({ url: '/path/a', method: 'POST', data: { user: 1 } })
request.post('/path/a', { data })

```

### 添加拦截器

```js
// 请求前拦截
request.interceptors.request.use((config) => {
  config.header.timestamp = Date.now()
  config.header.token = getToken(); // 如果 getToken是耗时的， 建议用 request.setConfig({ header }) 设置一次
  return config;
})


// 响应拦截
request.interceptors.response.use((response， config) => {
  if (response.statusCode === 200) {
    // 正常返回
    return response.data;
  } else if (response.statusCode === 401) {
    // 权限处理
  } else if (response.statusCode === 500) {
    // 服务端错误
  }
})
```

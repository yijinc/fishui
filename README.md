## 安装

```bash
npm add @fishui/taro-vue

# or
npm add @fishui/taro-react

# and more
npm add @fishui/taro-request
```

## 使用

```js
// 引入样式
import '@fishui/taro-vue/lib/style/style.css';
import { Tab, Navbar } from '@fishui/taro-vue';
```


### 按需引入

```js
import Tab from '@fishui/taro-vue/lib/es/Tab';
import '@fishui/taro-vue/lib/style/Tab/style.css';
```

可通过 [babel-plugin-import](https://github.com/umijs/babel-plugin-import) 设置自动转换为按需引入的方式

在 `.babelrc` 或 `babel.config.js` 中添加配置：

```json
{
  // ...
  plugins: [
    [
      "import",
      {
        "libraryName": "@fishui/taro-vue",
        "libraryDirectory": "lib/es",
        "style": (name, file) => name.replace('es', 'style') + '/style.css',
        "camel2DashComponentName": false
      }
    ]
  ]
}
```


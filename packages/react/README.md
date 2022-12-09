## 安装

```bash
npm add @taropui/react
```

## 使用

```js
// 引入样式
import '@taropui/react/lib/style/style.css';
import { Tab, Navbar } from '@taropui/react';
```


### 按需引入

```js
import Tab from '@taropui/react/lib/es/Tab';
import '@taropui/react/lib/style/Tab/style.css';
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
        "libraryName": "@taropui/react",
        "libraryDirectory": "lib/es",
        "style": (name, file) => name.replace('es', 'style') + '/style.css',
        "camel2DashComponentName": false
      }
    ]
  ]
}
```


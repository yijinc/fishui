# Navbar 导航栏


## 用法


```tsx
import { Navbar } from '@fishui/taro-react';
import { View } from '@tarojs/components';

export default () => {
  return <View>
    <Navbar title="标题" backgroundColor="#000" color="#fff" />
  </View>
}
```


## API


### Props

| 参数                   | 说明                                                        | 类型           | 默认值      |
| ---------------------- | ----------------------------------------------------------- | -------------- | ----------- |
| title | 导航标题   | `string`       |    ''  |
| backIcon | 返回图标，可以是一个 url、filePath | `string`        |  path.defaultBackIcon    |
| color  | 导航标题字体颜色 | `string`        | '#222222' |
| backgroundColor |  标题背景颜色，可设置透明 |  `string`  |  '#FFFFFF'  |
| fixed | 是否固定 |  `boolean`  |  true    |
| height | 导航栏高度（不包含StatusBar） |  `number|string`  |  44      |
| hideBack | 是否隐藏返回按钮 |  `boolean`  |  false    |
| goback | 自定义点击返回事件 |  `() => void`  |  -   |
| renderLeft | 自定义左边返回按钮       |  `() => React.ReactNode;`  |  -   |
| renderTitle | 自定义标题内容   |  `() => React.ReactNode;`  |  -   |

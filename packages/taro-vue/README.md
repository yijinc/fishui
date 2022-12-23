## 说明

在使用小程序框架开发小程序过程中，发现很多常用的组件 社区都**找不到**合适的。
对于相应的一些比较完善的ui组件库，他们貌似只会依赖于设计，从 Button 开始造组件。。。
很多时候，我们可能不是需要他们的ui风格（主题），而是需要一个功能与交互相符、性能可靠的组件

fishui 是一套基于 [taro](https://github.com/NervJS/taro) 和 [uni-app](https://github.com/dcloudio/uni-app) 的常用的小程序组件，致力于用最简洁、舒适可靠的实现，这里可能有你需要的而ui库没有给你提供的组件


## 线上演示

![FishUI](https://img.souche.com/bolt/6JA5Bw2QbOvZxGymKuHbz/gh_1407e2b12b0f_258.jpg)

## 组件列表

- [Navbar：导航栏](https://github.com/yijinc/fishui/tree/master/packages/taro-vue/src/components/Navbar/doc.md)
- [Tab：选项切换](https://github.com/yijinc/fishui/tree/master/packages/taro-vue/src/components/Tab/doc.md)
- [Scroll：列表滚动 下拉刷新、加载更多](https://github.com/yijinc/fishui/tree/master/packages/taro-vue/src/components/Scroll/doc.md)
- [Drag：拖拽排序 - 单屏](https://github.com/yijinc/fishui/tree/master/packages/taro-vue/src/components/Drag/doc.md)
- [DragX：拖拽排序 - 列表](https://github.com/yijinc/fishui/tree/master/packages/taro-vue/src/components/DragX/doc.md)
- [VirtualSwiper：虚拟滑动](https://github.com/yijinc/fishui/tree/master/packages/taro-vue/src/components/VirtualSwiper/doc.md)


## 安装

```bash
npm add @fishui/taro-vue
```

## 使用

```js
// 引入样式（全局）
import '@fishui/taro-vue/lib/style.css';
import { Tab, Navbar } from '@fishui/taro-vue';
```


### 按需引入

手动指定引入

```js
import Tab from '@fishui/taro-vue/lib/components/Tab';
import '@fishui/taro-vue/lib/components/Tab/style.scss';
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
        "style": (name, file) => name + '/style.scss',
        "camel2DashComponentName": false
      }
    ]
  ]
}
```
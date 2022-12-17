## 说明

在使用小程序框架开发小程序过程中，发现很多常用的组件 社区都**找不到**合适的。
对于相应的一些比较完善的ui组件库，他们貌似只会依赖于设计，从 Button 开始造组件。。。
很多时候，我们可能不是需要他们的ui风格（主题），而是需要一个功能与交互相符、性能可靠的组件

fishui 是一套基于 [taro](https://github.com/NervJS/taro) 和 [uni-app](https://github.com/dcloudio/uni-app) 的常用的小程序组件，致力于用最简洁、舒适可靠的实现，这里可能有你需要的而ui库没有给你提供的组件


## 组件列表

- [Navbar：导航栏](https://github.com/yijinc/fishui/tree/master/packages/uni-app/src/components/Navbar/doc.md)
- [Tab：选项切换](https://github.com/yijinc/fishui/tree/master/packages/uni-app/src/components/Tab/doc.md)
- [Scroll：列表滚动 下拉刷新、加载更多](https://github.com/yijinc/fishui/tree/master/packages/uni-app/src/components/Scroll/doc.md)
- [Drag：拖拽排序 - 单屏](https://github.com/yijinc/fishui/tree/master/packages/uni-app/src/components/Drag/doc.md)
- [DragX：拖拽排序 - 列表](https://github.com/yijinc/fishui/tree/master/packages/uni-app/src/components/DragX/doc.md)
- VirtualSwiper：虚拟滑动


## 安装

```bash
npm add @fishui/uni-app
```

## 使用

> 注意 ⚠️ ：uni-app lib 是没有构建过的包，直接引入 .vue 源文件使用，需要使用方 支持 vue sfc & typescript

```js
// 引入样式（全局）
import '@fishui/uni-app/lib/style/style.css';
// 必须指定 .vue 原文件
import Tab from '@fishui/uni-app/lib/Tab/index.vue';
```


-  pages.json配置easycom规则(按需引入)

```json
// pages.json
{
	"easycom": {
		"^fish-(.*)": "@fishui/uni-app/lib/$1/index.vue"
	},
}
```
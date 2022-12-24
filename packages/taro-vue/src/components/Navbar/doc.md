# Navbar 导航栏


## 用法


```vue
<template>
  <navbar :title="state.title">
    <template #left>
      <icon name="home" />
    </template>
  </navbar>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import { Navbar } from '@fishui/taro-vue';

const state = reactive({
  title: "标题",
});

const onChange = (list) => {
	console.log('onChange', list);
	// state.listData = list; // 直接赋值 会重新渲染
};

</script>
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



### Slots

| 名称          | 说明                   | 参数类型     |
| ---------------- | ---------------------- | ------------ |
| title         | 标题插槽，用于自定义标题内容    |  VNode |
| left        |  左边返回按钮处插槽，自定义返回按钮         |   VNode |


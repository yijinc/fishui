# Drag 列表拖拽排序 


## 用法

建议页面配置 disableScroll 设置为true （for ios）

demo

```vue
<template>
  <dragx
    style="height: 500PX"
    :list-data="state.listData"
    :item-height="250"
    :columns="1"
    @change="onChange"
  >
    <!-- 注意：uni app vue3 不支持 v-bind，样式有 scoped 作用 -->
    <template #item="{ item }">
      <view
        class="item"
        :style="{ backgroundColor: item.backgroundColor }"
      >
        {{ item.fixed? ' fixed' : item.key }}
      </view>
    </template>
    <template #drag>
      <view class="drag-button"> </view>
    </template>
  </dragx>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import { DragX } from '@fishui/taro-vue';

const listData = [
	{ key: '0', backgroundColor: 'red', fixed: false },
	{ key: '1', backgroundColor: 'deeppink', fixed: true },
	{ key: '2', backgroundColor: 'green', fixed: false },
	{ key: '3', backgroundColor: 'orange', fixed: false },
	{ key: '4', backgroundColor: 'purple', fixed: false },
	{ key: '5', backgroundColor: 'lime', fixed: false },
	{ key: '6', backgroundColor: 'blue', fixed: false },
	{ key: '7', backgroundColor: 'violet', fixed: false },
	{ key: '8', backgroundColor: 'cyan', fixed: false },
	{ key: '9', backgroundColor: 'gold', fixed: false }
];

const state = reactive({
  listData,
  columns: 3,
	itemHeight: 125,
	longpressTrigger: true,
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
| listData                | 列表数据           | ` any & { fixed?:  boolean }`       |      |
| columns                | 列数       | `number`        |   3       |
| itemHeight                | 每个 item 高度 | `number`        | 124    |
| vibrate |  开始拖拽时震动一下？ |  `boolean`  |  false        |
| transition | 其他item 是否 有过度动画？ 可在 props 变化时设置元素是否需要过度动画 |  `boolean`  |  true        |
| trigger | 触发拖拽的事件 |  `'longpress' | 'touchstart'`  |  'longpress'      |



### Events

| 事件名           | 说明                   | 类型     |
| ---------------- | ---------------------- | ------------ |
| change            | 数据位置变化后的收据         |  (sortedList: any[]) => void  |
| dragstart        | 触发拖拽开始         |  (e: TouchEvnet) => void  |
| dragend        | 触发拖拽结束      |  (e: TouchEvnet) => void  |

### Slots

| 名称          | 说明                   | 参数类型     |
| ---------------- | ---------------------- | ------------ |
| item            | 列表每一项 插入 VNode，会将item 作为参数传出    |  (item: ListItem) => VNode  |
| drag            | 列表每一项 drag 按钮/视图，一般是一个image/icon    |  () => VNode  |


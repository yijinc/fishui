# DragX 列表拖拽排序 


## 用法

因 Taro 事件存在穿透问题，使用此组件建议禁用页面滚动

```js
definePageConfig({
	disableScroll: true,
});
```

demo

```tsx
import { useState, useMemo, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { DragX }  from '@fishui/taro-react';

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

export default () => {
  const sortedList = useRef(list);
  const onChange = (sorted) => sortedList.current = sorted;

  const renderItem = (item, index) => (<View key={index}>{ item.fixed? ' fixed' : index }</View>);
  const renderDragItem = () => <View>drag me</View>

  return (
    <Drag
      vibrate
      listData={listData}
      itemHeight={200}
      columns={1}
      onChange={onChange}
      renderItem={renderItem}
      renderDragItem={renderDragItem}
    />
  )
}

```


## API


### Props

| 参数                   | 说明                                                        | 类型           | 默认值      |
| ---------------------- | ----------------------------------------------------------- | -------------- | ----------- |
| listData                | 列表数据           | ` any & { fixed?:  boolean }`       |      |
| columns                | 列数       | `number`        |   1       |
| itemHeight                | 每个 item 高度 | `number`        | 124    |
| vibrate |  开始拖拽时震动一下？ |  `boolean`  |  false        |
| transition | 其他item 是否 有过度动画？ 可在 props 变化时设置元素是否需要过度动画 |  `boolean`  |  true        |
| renderItem | 列表每一项，会将item 作为参数传出 |  `(item: ListItem) => ReactNode`  |     |
| renderDragItem | 列表每一项 drag 按钮/视图，一般是一个image/icon |  `() => ReactNode`  |     |
| onChange | 数据位置变化后的回调 |  `(sortedList: any[]) => void`  |     |
| onDragStart | 触发拖拽开始 |  `(e: TouchEvnet) => void`  |     |
| onDragEnd | 触发拖拽结束 |  `(e: TouchEvnet) => void`  |     |

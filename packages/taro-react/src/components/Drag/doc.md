# Drag 拖拽排序


## 用法

因 Taro 事件存在穿透问题，使用此组件建议禁用页面滚动（for ios）

```js
definePageConfig({
	disableScroll: true,
});
```

demo

```tsx
import { useState, useMemo, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Button, Slider, Image } from '@tarojs/components';
import { Drag }  from '@fishui/taro-react';

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
  const maxCount = 9;
  const [columns, setColumns] = useState<number>(3);
  const [transition, setTransition] = useState<boolean>(true);
  const itemHeight = Taro.getSystemInfoSync().windowWidth / columns;
  const [longpressTrigger, setLongpressTrigger] = useState<boolean>(true);
  const [list, setList] = useState<IListItem[]>(listData);
  const sortedList = useRef(list);

  const onChange = (sorted) => sortedList.current = sorted;

  return (
    <Drag
      vibrate
      listData={list}
      itemHeight={itemHeight}
      columns={columns}
      onChange={onChange}
      renderItem={renderItem}
      transition={transition}
      trigger={longpressTrigger? 'longpress' : 'touchstart'}
    />
  )
}

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
| renderItem | 列表每一项，会将item 作为参数传出 |  `(item: ListItem) => ReactNode`  |     |
| onChange | 数据位置变化后的 |  `(sortedList: any[]) => void`  |     |
| onDragStart | 触发拖拽开始 |  `(e: TouchEvnet) => void`  |     |
| onDragEnd | 触发拖拽结束 |  `(e: TouchEvnet) => void`  |     |


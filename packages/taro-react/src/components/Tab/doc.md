# Tab 选项切换


## 用法

```tsx
import { useState } from 'react';
import { View } from '@tarojs/components';
import { Tab } from '@fishui/taro-react';

export default () => {
  const [current, setCurrent] = useState(0);
  const tabList = [{ title: '关注' }, { title: '推荐' }, { title: '热榜' }];

  return (
    <View>
      <Tab
        scrollable
        current={current}
        onChange={setCurrent}
        tabList={tabList}
      />
    </View>
  )
};
```


## API


### Props

| 参数                   | 说明                                                        | 类型           | 默认值      |
| ---------------------- | ----------------------------------------------------------- | -------------- | ----------- |
| tabList  | tabs列表           | `{ title: string; disabled?: boolean; validate?: (index: number) => boolean|Promise<boolean>; }[]`   |  []  |
| scrollable | 是否可以滚动       | `boolean`        |   false   |
| current    | 当前current index | `number`        | 0 |
| onChange    | 受控回调 | `(value: number) => void;`        |  |

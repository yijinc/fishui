# Tab 选项切换


## 用法

```vue
<template>
  <tabs v-model="state.current" :tab-list="state.tabList" scrollable />
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import Tab from '@fishui/uni-app/lib/Tab/index.vue';
import '@fishui/uni-app/lib/Tab/style.scss';

const state = reactive({
  tabList: [{ title: '关注' }, { title: '推荐' }, { title: '热榜' }],
  current: 0,
});

</script>
```


## API


### Props

| 参数                   | 说明                                                        | 类型           | 默认值      |
| ---------------------- | ----------------------------------------------------------- | -------------- | ----------- |
| tabList  | tabs列表           | `{ title: string; disabled?: boolean; validate?: (index: number) => boolean|Promise<boolean>; }[]`   |  []  |
| scrollable | 是否可以滚动       | `boolean`        |   false   |
| modelValue    | 当前current index | `number`        | 0 |


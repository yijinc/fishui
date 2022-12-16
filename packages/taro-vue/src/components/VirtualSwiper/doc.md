# VirtualSwiper 虚拟滑动/轮播


## 用法

```vue
<template>
  <virtual-swiper
    style="height: 500PX"
    :current="state.current"
    :slides-per-view="1"
    @change="onChange"
  >
    <swiper-slide v-for="(item, index) in state.sliders" :key="index">
      <view class="item" :style="{ backgroundColor: item.color }">{{ item.index}}</view>
    </swiper-slide>
  </virtual-swiper>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import { VirtualSwiper, SwiperSlide } from '../../components/virtual-swiper';

const colors = ['red', 'yellow', 'blue', 'green'];
const sliders: IItem[] = Array.from(({ length: 10000 })).map((_, index) => ({
  index,
  color: colors[index % 4],
}));

const state = reactive({
  sliders,
  current: 0,
});

const onChange = (index) => {
  state.current = index;
};

</script>
```


## API

### Props

| 参数                   | 说明                                                        | 类型           | 默认值      |
| ---------------------- | ----------------------------------------------------------- | -------------- | ----------- |
| current                | 当前 index 位置           | `number`       |  0      |
| vertical                | 是否为垂直滑动       | `boolean`        |   true       |
| duration                | 动画时长（单位是ms）                                                | `number`        | 500        |
| slidesPerView |  当前container 上下保存多少个view（swiper-slide）|  `number`  | 1        |
| catchMove |  是否防止穿透，阻止默认事件 |  `boolean`  |  true        |



### Events

| 事件名           | 说明                   | 回调参数     |
| ---------------- | ---------------------- | ------------ |
| change            | 滑动之后的回调         | 当前索引值index |


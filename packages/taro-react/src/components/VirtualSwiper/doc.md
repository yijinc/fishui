# VirtualSwiper 虚拟滑动/轮播


## 用法

```tsx
import { useState } from 'react';
import { View } from '@tarojs/components';
import { VirtualSwiper, SwiperSlide } from '@fishui/taro-react';
import styles from './styles.module.scss';

export default () => {
  const [current, setCurrent] = useState(0);
  const [sliders, setSliders] = useState(Array.from(({ length: 10000 }));

  return (
    <VirtualSwiper current={current} onChange={onChange} slidesPerView={2}>
      { sliders.map((_item, index) => (
          <SwiperSlide>
            <View className='item'>{index}</View>
          </SwiperSlide>
        ))
      }
    </VirtualSwiper>
  )
};
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
| onChange |  滑动之后的回调 |  `(index: number) => void;`  |          |

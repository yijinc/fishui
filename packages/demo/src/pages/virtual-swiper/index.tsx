import { useState, useEffect } from 'react';
import { View, Input, Text } from '@tarojs/components';
import { Navbar } from '@fishui/taro-react';
import VirtualSwiper from '../../components/VirtualSwiper/index';
import '../../components/VirtualSwiper/style.scss';
import SwiperSlide from '../../components/SwiperSlide';
import '../../components/SwiperSlide/style.scss';
import styles from './styles.module.scss';

definePageConfig({
  navigationBarTitleText: 'VirtualSwiper',
  enableShareAppMessage: true,
  enableShareTimeline: true,
  navigationStyle: 'custom',
});

interface IItem {
  index: number;
  color: string;
}

const randomColor = (len: 3|6 = 6): string => {
  let str = '#';
  for (let i = 0; i < len; i ++) {
    str += Math.floor(Math.random() * 16).toString(16);
  }
  return str;
};

export default () => {
  const [current, setCurrent] = useState(0);
  const [sliders, setSliders] = useState<IItem[]>(Array.from(({ length: 10000 })).map((_, index) => ({
    index,
    color: randomColor(),
  })));

  useEffect(() => {
    setTimeout(() => setCurrent(3), 2000);
  }, [])

  const onChange = (index) => setCurrent(index);
  
  const onConfirm = (e) => {
    const val = Number(e.detail.value);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(val)) return;
    if (val < 0 || val >= sliders.length) return;
    setCurrent(val);
  };

  const renderItem = (item: IItem) => (
    <SwiperSlide>
      <View className={styles.item} style={{ backgroundColor: item.color }}>{item.index}</View>
    </SwiperSlide>
  )

  return (
    <View className={styles.container}>
      <Navbar backgroundColor='transparent' />
      <VirtualSwiper current={current} onChange={onChange} slidesPerView={2}>
        { sliders.map(renderItem) }
      </VirtualSwiper>
      <View className={styles.footer}>
        <Input onConfirm={onConfirm} placeholder='跳转到' maxlength={4} />
        <Text> / { sliders.length - 1 }</Text>
      </View>
    </View>
  )
};
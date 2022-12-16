import * as React from 'react';
import classnames from 'classnames';
import { View } from '@tarojs/components';

type ISwiperSlideProps = React.PropsWithChildren<{
  current?: number;
  index?: number;
}>;

const SwiperSlide: React.FC<ISwiperSlideProps> = (props) => (
  <View className={classnames({
    'fish-swiper__slide': true,
    'fish-swiper__slide-active': props.current !== undefined && props.index === props.current
  })}
  >
    { props.children }
  </View>
);

SwiperSlide.displayName = 'SwiperSlide';

SwiperSlide.defaultProps = {}

export default SwiperSlide;

export type {
  ISwiperSlideProps
};
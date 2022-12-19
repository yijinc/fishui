import * as React from 'react';
import classnames from 'classnames';
import { View } from '@tarojs/components';

type ISwiperSlideProps = React.PropsWithChildren<{
  current?: number;
  index?: number;
  className?: string;
  style?: React.CSSProperties;
}>;

const SwiperSlide: React.FC<ISwiperSlideProps> = (props) => (
  <View
    className={classnames(props.className, {
      'fish-swiper__slide': true,
      'fish-swiper__slide-active': props.current !== undefined && props.index === props.current
    })}
    style={props.style || {}}
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
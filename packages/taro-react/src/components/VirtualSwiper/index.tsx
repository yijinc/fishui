import * as React from 'react';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import { View, CommonEventFunction } from '@tarojs/components';
import { execSelectQuery } from '../../utils';

type ISwiperProps = React.PropsWithChildren<{
  id?: string;
  current?: number;
  duration?: number;
  catchMove?: boolean; // 是否防止穿透，阻止默认事件
  vertical?: boolean;
  slidesPerView?: number; // 当前container 上下保存多少个？
  onChange?: (index: number) => void;
}>;

interface IState {
  currentIndex: number;
  translateX: number;
  translateY: number;
  width: number;
  height: number;
  isMoving: boolean;
  from: number;
  to: number;
}

interface IUtils {
  startX: number;
  startY: number;
  startTouchTime: number;
}

const VirtualSwiper: React.FC<ISwiperProps> = (props) => {
  const [state, _setState] = React.useState<IState>({
    currentIndex: props.current || 0,
    translateX: 0,
    translateY: 0,
    width: 0,
    height: 0,
    isMoving: false,
    from: Math.max(props.current! - props.slidesPerView!, 0),
    to: props.current! + props.slidesPerView!,
  });

  const setState = (nextState: Partial<IState>) => _setState({ ...state, ...nextState });

  const { current: _ } = React.useRef<IUtils>({
    startX: 0,
    startY: 0,
    startTouchTime: 0,
  });

  const slides = [];

  const doNotAnimate = () => {
    setState({ isMoving: true });
    setTimeout(() => {
      setState({ isMoving: false });
    }, props.duration);
  };

  const reset = () => {
    _.startX = 0;
    _.startY = 0;
    _.startTouchTime = 0;
    setState({ isMoving: false });
  };

  const moveTo = (index: number) => {
    const maxLen = slides.length;
    let targetIndex = index;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= maxLen) targetIndex = maxLen - 1;
  
    if (props.vertical) {
      setState({ translateY: -targetIndex * state.height });
    } else {
      setState({ translateX: -targetIndex * state.width });
    }
    if (state.currentIndex !== targetIndex) {
      setState({
        currentIndex: targetIndex,
        from: Math.max(targetIndex - props.slidesPerView!, 0),
        to: Math.min(targetIndex + props.slidesPerView!, maxLen - 1)
      });
      if (targetIndex !== props.current) {
        props.onChange?.(targetIndex);
      }
    }
  };
  
  const onTouchStart = (event: TouchEvent) => {
    if (props.catchMove) event.stopPropagation();
    const iTouch = event.touches[0];
    if (!iTouch) return;
    _.startX = iTouch.pageX;
    _.startY = iTouch.pageY;
    _.startTouchTime = Date.now();
    setState({ isMoving: true });
  };
  
  const onTouchMove = (event: TouchEvent) => {
    const iTouch = event.touches[0];
    if (!iTouch || !state.isMoving) return;
    const offsetX = iTouch.pageX - _.startX;
    const offsetY = iTouch.pageY - _.startY;
  
    if (props.vertical) {
      // offsetY > 0 => swipe down => go previous in first
      if (state.currentIndex === 0 && offsetY > 0) return;
      // offsetY < 0 => swipe up =>  go next in lastes
      if (state.currentIndex === slides.length - 1 && offsetY < 0) return;
      const currentTranY = - state.currentIndex * state.height;
      setState({ translateY: offsetY + currentTranY });
    } else {
      const currentTranX = - state.currentIndex * state.width;
      setState({ translateY: offsetX + currentTranX });
    }
  };
  
  const onTouchEnd = (event: TouchEvent) => {
    if (!state.isMoving) return;
    const iTouch = event.changedTouches[0];
    if (!iTouch) return;
    if (props.vertical) {
      const offsetY = iTouch.pageY - _.startY;
      const speed = offsetY / (Date.now() - _.startTouchTime);
      const isShouldMove = Math.abs(speed) > 0.3 || Math.abs(offsetY) > state.height / 2;
      if (isShouldMove) {
        // offsetY > 0 // 向下滑 go previous
        // offsetY < 0 // 向上滑 next
        moveTo(offsetY > 0 ? state.currentIndex - 1 : state.currentIndex + 1);
      } else {
        moveTo(state.currentIndex);
      }
    }

    reset();
  };
  
  Taro.useReady(() => {
    execSelectQuery(Taro.createSelectorQuery().select(`#${props.id}`).boundingClientRect())
    .then((res: Taro.NodesRef.BoundingClientRectCallbackResult) => {
      doNotAnimate();
      const nextState: Partial<IState> = {
        width: res.width,
        height: res.height,
      };
      if (props.vertical) {
        nextState.translateY = -props.current! * state.height;
      } else {
        nextState.translateX = -props.current! * state.width;
      }
      setState(nextState);
    });
  });
  
  
  // const renderSlides = (): VNode => {
  //   const itemStyle: CSSProperties = {};
  //   if (props.vertical) {
  //     itemStyle.top = `${state.from * state.height}px`;
  //     if (state.height !== 0) itemStyle.height = `${state.height}px`;
  //   } else {
  //     itemStyle.left = `${state.from * state.width}px`;
  //     if (state.width !== 0) itemStyle.width = `${state.width}px`;
  //   }
  
  //   return h(Fragment, {}, slides.value
  //     .filter((_item, index) => index >= state.from && index <= state.to)
  //     .map((slide: VNode, index) => {
  //     if (!slide.props) slide.props = { key: String(index) };
  //     if (!slide.props.style) slide.props.style = {};
  //     slide.props.style = { ...slide.props.style, ...itemStyle, ...{ top: `${state.from * state.height}px` }};
  //     return h(slide.type as any, {...slide.props}, slide.children as VNode[]);
  //   }));
  // };
  
  // watch(() => props.current, (newCurrent, preCurrent) => {
  //   if (newCurrent === state.currentIndex) return;
  //   if (Math.abs(newCurrent - preCurrent) > props.slidesPerView) {
  //     doNotAnimate();
  //   }
  //   moveTo(newCurrent);
  // });

  return (
    <View
      id={props.id}
      className='fish-swiper'
      catchMove={props.catchMove}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <View
        className={classnames({
        'fish-swiper__container': true,
        'fish-swiper__vertical': props.vertical,
      })}
        style={{
        transitionDuration: `${state.isMoving ? 0 : props.duration}ms`,
        transform: `translateX(${state.translateX}px) translateY(${state.translateY}px)`,
        [props.vertical ? 'height' : 'width']: props.vertical ? `${state.height * slides.length}px` : `${state.width * slides.length}px`,
      }}
      >
        {props.children}
    </View>
    </View>
  );
};

VirtualSwiper.defaultProps = {
  id: 'fish-swiper',
  current: 0,
  duration: 500,
  vertical: true,
  catchMove: true,
  slidesPerView: 1,
};

export default VirtualSwiper;

export type {
  ISwiperProps
};
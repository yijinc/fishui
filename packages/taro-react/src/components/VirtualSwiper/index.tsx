import * as React from 'react';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { execSelectQuery } from '../../utils';

type ISwiperProps = React.PropsWithChildren<{
  id?: string;
  className?: string;
  style?: React.CSSProperties;
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
    from: Math.max(props.current! - props.slidesPerView!, 0),
    to: props.current! + props.slidesPerView!,
  });
  const [isMoving, setIsMoving] = React.useState<boolean>(false);

  const setState = (nextState: Partial<IState>) => _setState({ ...state, ...nextState });

  const { current: _ } = React.useRef<IUtils>({
    startX: 0,
    startY: 0,
    startTouchTime: 0,
  });

  const slides = React.useMemo<React.ReactElement[]>(() => {
    const _slides = [];
    React.Children.toArray(props.children).forEach((child) => {
      // @ts-ignore
      if (child.type && child.type.displayName === 'SwiperSlide') {
        // @ts-ignore
        _slides.push(child);
      }
    });
    return _slides;
  }, [props.children]);

  const doNotAnimate = () => {
    setIsMoving(true);
    setTimeout(() => setIsMoving(false), props.duration);
  };

  const reset = () => {
    _.startX = 0;
    _.startY = 0;
    _.startTouchTime = 0;
    setIsMoving(false)
  };

  const moveTo = (index: number) => {
    const maxLen = slides.length;
    let targetIndex = index;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= maxLen) targetIndex = maxLen - 1;

    const nextState: Partial<IState> = {}
  
    if (props.vertical) {
      nextState.translateY = -targetIndex * state.height;
    } else {
      nextState.translateX = -targetIndex * state.width;
    }
    if (state.currentIndex !== targetIndex) {
      nextState.currentIndex = targetIndex;
      nextState.from = Math.max(targetIndex - props.slidesPerView!, 0);
      nextState.to = Math.min(targetIndex + props.slidesPerView!, maxLen - 1)
      if (targetIndex !== props.current) {
        props.onChange?.(targetIndex);
      }
    }
    setState(nextState);
  };
  
  const onTouchStart = (event: TouchEvent) => {
    if (props.catchMove) event.stopPropagation();
    const iTouch = event.touches[0];
    if (!iTouch) return;
    _.startX = iTouch.pageX;
    _.startY = iTouch.pageY;
    _.startTouchTime = Date.now();
    setIsMoving(true);
  };
  
  const onTouchMove = (event: TouchEvent) => {
    const iTouch = event.touches[0];
    if (!iTouch || !isMoving) return;
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
    if (!isMoving) return;
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

  React.useEffect(() => {
    if (props.current === state.currentIndex) return;
    if (Math.abs(props.current! - state.currentIndex) > props.slidesPerView!) {
      doNotAnimate();
    }
    moveTo(props.current!);
  }, [props.current])
  
  Taro.useReady(() => {
    execSelectQuery(Taro.createSelectorQuery().select(`#${props.id}`).boundingClientRect()).then(({ width, height }: any) => {
      doNotAnimate();
      const nextState: Partial<IState> = {
        width,
        height,
      };
      if (props.vertical) {
        nextState.translateY = -props.current! * height;
      } else {
        nextState.translateX = -props.current! * width;
      }
      setState(nextState);
    });
  });

  const slideStyle: React.CSSProperties = {};
  if (props.vertical) {
    slideStyle.top = `${state.from * state.height}px`;
    if (state.height !== 0) slideStyle.height = `${state.height}px`;
  } else {
    slideStyle.left = `${state.from * state.width}px`;
    if (state.width !== 0) slideStyle.width = `${state.width}px`;
  }

  return (
    <View
      id={props.id}
      className={classnames(props.className, 'fish-swiper')}
      style={props.style}
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
        transitionDuration: `${isMoving ? 0 : props.duration}ms`,
        transform: `translateX(${state.translateX}px) translateY(${state.translateY}px)`,
        [props.vertical ? 'height' : 'width']: props.vertical ? `${state.height * slides.length}px` : `${state.width * slides.length}px`,
      }}
      >
        {slides.filter((_c, index) => index >= state.from && index <= state.to).map((slide, index) => {
          const childProps = { ...slide.props };
          if (!childProps.key) childProps.key = String(index);
          childProps.style = { ...childProps.style, ...slideStyle };
          return React.cloneElement(slide, childProps)
        })}
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
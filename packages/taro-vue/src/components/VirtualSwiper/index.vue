<template>
  <view
    :id="props.id"
    :catch-move="props.catchMove"
    class="fish-swiper"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <view
      :class="{
        'fish-swiper__container': true,
        'fish-swiper__vertical': props.vertical,
      }"
      :style="{
        transitionDuration: `${state.isMoving ? 0 : props.duration}ms`,
        transform: `translateX(${state.translateX}px) translateY(${state.translateY}px)`,
        [props.vertical ? 'height' : 'width']: props.vertical ? `${state.height * slides.length}px` : `${state.width * slides.length}px`,
      }"
      @transitionend="onTransitionEnd"
    >
      <component :is="renderSlides"/>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { defineProps, defineEmits, withDefaults, reactive, computed, watch, useSlots, h, Fragment } from 'vue';
// eslint-disable-next-line no-duplicate-imports
import type { CSSProperties, VNode } from 'vue';
import Taro from '@tarojs/taro';
import type { BaseEventOrig } from '@tarojs/components';
import { execSelectQuery } from '../../utils';

interface ISwiperProps {
  id?: string;
  current?: number;
  duration?: number;
  catchMove?: boolean; // 是否防止穿透，阻止默认事件
  vertical?: boolean;
  slidesPerView?: number; // 当前container 上下保存多少个？
  debounce?: number; // 节流？默认同 duration 一样，如果设置为 0, 则可快速滑动
  width?: number;
  height?: number;
}

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
  lastTouchTime: number;
}

const props = withDefaults(defineProps<ISwiperProps>(), {
  id: 'fish-swiper',
  current: 0,
  duration: 500,
  vertical: true,
  catchMove: true,
  slidesPerView: 1,
  debounce: 500,
});

const emit = defineEmits<{
  (e: 'change', index: number): void;
  (e: 'transitionend', event: BaseEventOrig<{ elapsedTime: number }>): void;
}>();

const slots = useSlots();

const slides = computed<VNode[]>(() => {
  if (typeof slots.default !== 'function') return [];
  const fragmentRoot = slots.default();
  const _slides = [];
  if (Array.isArray(fragmentRoot[0].children)) {
    fragmentRoot[0].children.forEach((vnode: VNode) => {
      // @ts-ignore
      if (vnode.type && vnode.type.name === 'SwiperSlide') {
        // @ts-ignore
        _slides.push(vnode);
      }
    });
  }
  return _slides;
});

const state = reactive<IState>({
  currentIndex: props.current || 0,
  translateX: 0,
  translateY: 0,
  width: 0,
  height: 0,
  isMoving: false,
  from: Math.max(props.current - props.slidesPerView, 0),
  to: props.current + props.slidesPerView,
});

const _: IUtils = {
  startX: 0,
  startY: 0,
  startTouchTime: 0,
  lastTouchTime: 0,
};

const doNotAnimate = () => {
  state.isMoving = true;
  setTimeout(() => {
    state.isMoving = false;
  }, props.duration);
};

const reset = () => {
  _.startX = 0;
  _.startY = 0;
  _.startTouchTime = 0;
  _.lastTouchTime = Date.now();
  state.isMoving = false;
};

const moveTo = (index: number) => {
  const maxLen = slides.value.length;
  let targetIndex = index;
  if (targetIndex < 0) targetIndex = 0;
  if (targetIndex >= maxLen) targetIndex = maxLen - 1;

  if (props.vertical) {
    state.translateY = -targetIndex * state.height;
  } else {
    state.translateX = -targetIndex * state.width;
  }
  if (state.currentIndex !== targetIndex) {
    state.currentIndex = targetIndex;
    state.from = Math.max(targetIndex - props.slidesPerView, 0);
    state.to = Math.min(targetIndex + props.slidesPerView, maxLen - 1);
    if (targetIndex !== props.current) {
      emit('change', targetIndex);
    }
  }
};

const onTransitionEnd = (e) => {
  emit('transitionend', e);
};

const onTouchStart = (event: TouchEvent) => {
  if (props.catchMove) event.stopPropagation();
  if (Date.now() - _.lastTouchTime < props.debounce) {
    return;
  }
  const iTouch = event.touches[0];
  if (!iTouch) return;
  _.startX = iTouch.pageX;
  _.startY = iTouch.pageY;
  _.startTouchTime = Date.now();
  state.isMoving = true;
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
    if (state.currentIndex === slides.value.length - 1 && offsetY < 0) return;
    const currentTranY = - state.currentIndex * state.height;
    state.translateY = offsetY + currentTranY;
  } else {
    const currentTranX = - state.currentIndex * state.width;
    state.translateX = offsetX + currentTranX;
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

const initSize = (width: number, height: number) => {
  doNotAnimate();
  state.width = width;
  state.height = height;
  if (props.vertical) {
    state.translateY = -props.current * height;
  } else {
    state.translateX = -props.current * width;
  }
}

Taro.useReady(() => {
  if (props.width && props.height) {
    initSize(props.width, props.height);
  } else {
    execSelectQuery(Taro.createSelectorQuery().select(`#${props.id}`).boundingClientRect()).then((res: Taro.NodesRef.BoundingClientRectCallbackResult) => {
      initSize(res.width, res.height);
    });
  }
});


const renderSlides = (): VNode => {
  const itemStyle: CSSProperties = {};
  if (props.vertical) {
    itemStyle.top = `${state.from * state.height}px`;
    if (state.height !== 0) itemStyle.height = `${state.height}px`;
  } else {
    itemStyle.left = `${state.from * state.width}px`;
    if (state.width !== 0) itemStyle.width = `${state.width}px`;
  }

  return h(Fragment, {}, slides.value
    .filter((_item, index) => index >= state.from && index <= state.to)
    .map((slide: VNode, index) => {
    if (!slide.props) slide.props = { key: String(index) };
    if (!slide.props.style) slide.props.style = {};
    slide.props.style = { ...slide.props.style, ...itemStyle, ...{ top: `${state.from * state.height}px` }};
    return h(slide.type as any, {...slide.props}, slide.children as VNode[]);
  }));
};

watch(() => props.current, (newCurrent, preCurrent) => {
  if (newCurrent === state.currentIndex) return;
  if (Math.abs(newCurrent - preCurrent) > props.slidesPerView) {
    doNotAnimate();
  }
  moveTo(newCurrent);
});

</script>
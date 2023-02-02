<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <scroll-view
    :id="props.id"
    class="fish-drag-scroll"
    :scroll-y="true"
    :scroll-top="state.scrollTop"
  >
    <view class="fish-drag" :style="{ height: `${wrapHeight}px` }">
      <view
        v-for="item, index in state.listData"
        :key="index"
        :class="{
          'fish-drag-item': true,
          'fish-drag-item__upper': item.index === state.selected,
          'fish-drag-item__transition': state.selected !== -1 && item.index !== state.selected,
        }"
        :style="{
          width: `${100 / props.columns}%`,
          height: `${props.itemHeight}px`,
          transform: item.index === state.selected ? 
            `translateX(${state.translateX}px) translateY(${state.translateY}px)` : `translateX(${item.tranX}) translateY(${item.tranY})`
        }"
      >
        <slot name="item" v-bind="item.data" />
        <view
          catch-move
          @longpress="(e) => onLongPress(e, index)"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <slot name="drag" />
        </view>
      </view>
    </view>
  </scroll-view>
</template>
<script lang="ts" setup>
import { defineProps, withDefaults, defineEmits, reactive, computed, watch } from 'vue';
import { useReady, getSystemInfoSync, vibrateShort, createSelectorQuery, NodesRef } from '@tarojs/taro';
import { ITouchEvent } from '@tarojs/components/types';
import { execSelectQuery } from '../../utils';

interface IPropsListItem {
  [p: string]: any;
  fixed?: boolean;
}

interface IProps {
  listData: IPropsListItem[];
  id?: string;
  columns?: number; // 列数
  itemHeight?: number; // 每个 item 高度
  vibrate?: boolean; // 开始拖拽时震动一下？
}

interface IItem<T> {
  data: T,
  fixed: boolean;
  index: number;
  sortIndex: number;
  tranX: string;
  tranY: string;
}

interface IState {
  selected: number; // 当前选择的 item index
  translateX: number;
  translateY: number;
  listData: IItem<IPropsListItem>[];
  scrollTop: number;
}

interface IInnerData {
  current: number; // 内部记录 origin index
  distanceX: number;
  distanceY: number;
  identifier: number;
  itemWidth: number;
  itemHeight: number;
  isDragging: boolean;
  previousMove: string;
  windowHeight: number;
  // scroll view 
  left: number;
  top: number;
  bottom: number;
  scrollTop: number;
  ready: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  id: 'fish-drag-scroll',
  columns: 3,
  itemHeight: 124,
  vibrate: false,
});

const emit = defineEmits<{
  // eslint-disable-next-line no-unused-vars
  (e: 'change', list: IPropsListItem[]): void;
  // eslint-disable-next-line no-unused-vars
  (e: 'dragstart'|'dragend', event: ITouchEvent): void;
}>();

const state = reactive<IState>({
  selected: -1,
  listData: [],
  translateX: 0,
  translateY: 0,
  scrollTop: 0,
});

const _baseData: IInnerData = {
  current: -1,
  distanceX: 0,
  distanceY: 0,
  identifier: -1,
  itemHeight: 0,
  itemWidth: 0,
  isDragging: false,
  previousMove: '',
  windowHeight: 600,
  left: 0,
  top: 0,
  bottom: 0,
  scrollTop: -1, // -1 un-init
  ready: false,
};

const wrapHeight = computed(() => Math.ceil(props.listData.length / props.columns) * props.itemHeight);

const getOffsetX = (index: number): number => index % props.columns;
const getOffsetY = (index: number): number => Math.floor(index / props.columns);
const getIndex = (x: number, y: number) => x + props.columns * y;

const sort = (sourceIndex: number, targetIndex: number) => {
  const renderPositon = (list: IItem<IPropsListItem>[]) => {
    const listData = list.map(item => {
      item.tranX = `${getOffsetX(item.sortIndex) * 100}%`;
      item.tranY = `${getOffsetY(item.sortIndex) * 100}%`;
      return item;
    });
    state.listData = listData;
  };

  const excludeFixed = (sortKey: number, reversed: boolean) => {
		if (state.listData[sortKey].fixed) { // fixed 元素位置不会变化, 这里直接用 cKey(sortKey) 获取, 更加快捷
			// eslint-disable-next-line no-param-reassign
			reversed ? --sortKey : ++sortKey;
			return excludeFixed(sortKey, reversed);
		}
		return sortKey;
	};
  
  // 节流
  const move = `${sourceIndex}-${targetIndex}`;
  if (move === _baseData.previousMove) return;
  _baseData.previousMove = move;

  if (sourceIndex < targetIndex) {
    // 正序拖动
    const list = state.listData.map(item => {
      if (item.fixed) return item;
      if (item.sortIndex > sourceIndex && item.sortIndex <= targetIndex) {
        item.sortIndex = excludeFixed(item.sortIndex - 1, true);
      } else if (item.sortIndex === sourceIndex) {
        item.sortIndex = targetIndex;
      }
      return item;
    });
    renderPositon(list);
  } else if (sourceIndex > targetIndex) {
    // 倒序拖动
    const list = state.listData.map(item => {
      if (item.fixed) return item;
      if (item.sortIndex >= targetIndex && item.sortIndex < sourceIndex) {
        item.sortIndex = excludeFixed(item.sortIndex + 1, false);
      } else if (item.sortIndex === sourceIndex) {
        item.sortIndex = targetIndex;
      }
      return item;
    });
    renderPositon(list);
  }
};

const onLongPress = (event: ITouchEvent, originIndex: number) => {
  const iTouch = event.touches[0];
  if (!iTouch) return;
  const realIndex = state.listData[originIndex].sortIndex;
  // 初始项是固定项则返回
  if (state.listData[originIndex].fixed) return;
  // 如果已经在 drag 中则返回, 防止多指触发 drag 动作, touchstart 事件中有效果
  if (_baseData.isDragging) return;
  _baseData.isDragging = true;

  _baseData.current = originIndex;
  state.selected = realIndex;
  const offsetX = getOffsetX(realIndex) * _baseData.itemWidth;
  const offsetY = getOffsetY(realIndex) * _baseData.itemHeight;
  _baseData.distanceX = iTouch.pageX - _baseData.left - offsetX;
  _baseData.distanceY = iTouch.pageY - _baseData.top - offsetY;
  _baseData.identifier = iTouch.identifier;

  state.translateX = props.columns === 1 ? 0 : offsetX;
  state.translateY = offsetY;

  if (props.vibrate) vibrateShort({ type: 'light' });
  emit('dragstart', event);
  startMove();
};

const onTouchStart = () => {
  execSelectQuery(createSelectorQuery().select(`#${props.id}`).scrollOffset()).then(res => {
    _baseData.scrollTop = (res as NodesRef.ScrollOffsetCallbackResult).scrollTop;
    startMove();
  });
};

const startMove = () => {
  if (_baseData.scrollTop === -1 || !_baseData.isDragging) return;
  _baseData.ready = true;
};

const onTouchMove = (event: TouchEvent) => {
  event.stopPropagation();
  event.preventDefault();
  if (!_baseData.ready) return;
  const iTouch = event.touches[0];
  if (!iTouch) return;

  // 如果不是同一个触发点则返回
	if (_baseData.identifier !== iTouch.identifier) return;

  // 到顶到底自动滑动
  const offsetTop = _baseData.distanceY + _baseData.scrollTop;
  const toBottom = iTouch.clientY - offsetTop + _baseData.itemHeight - _baseData.bottom;
  if (toBottom > 0) {
    state.scrollTop = _baseData.scrollTop + toBottom;
  } else {
    const toTop = iTouch.clientY - offsetTop - _baseData.top;
    if (toTop < 0) {
      state.scrollTop = _baseData.scrollTop + toTop;
    }
  }
	// if (iTouch.clientY > _baseData.windowHeight - _baseData.itemHeight - props.bottom) {
	// 	// 当前触摸点pageY + item高度 - (屏幕高度 - 底部固定区域高度)
  //   emit('scroll', iTouch.pageY + _baseData.itemHeight - (_baseData.windowHeight - props.bottom));
	// } else if (iTouch.clientY < _baseData.itemHeight + props.top) {
	// 	// 当前触摸点pageY - item高度 - 顶部固定区域高度
  //   emit('scroll', iTouch.pageY - _baseData.itemHeight - props.top);
	// }

  const tranX = props.columns === 1 ? 0 : iTouch.pageX - _baseData.left - _baseData.distanceX;
  const tranY = iTouch.pageY - _baseData.top - _baseData.distanceY;
  state.translateX = tranX;
  state.translateY = tranY;
  
  const currentItem = state.listData[_baseData.current];
  const sourceIndex = currentItem.sortIndex;
  const curX = Math.round(tranX / _baseData.itemWidth);
	const curY = Math.round(tranY / _baseData.itemHeight);
  const targetIndex = getIndex(curX, curY);

  // 目标项是固定项则返回
	const targetItem = state.listData[targetIndex];
	if (targetItem && targetItem.fixed) return;

  if (targetIndex > -1 && targetIndex < state.listData.length) {
    sort(sourceIndex, targetIndex);
  }
};

const reset = () => {
  _baseData.previousMove = '';
  _baseData.isDragging = false;
  _baseData.current = -1;
  _baseData.scrollTop = -1;
  _baseData.ready = false;
  state.selected = -1;
};

const onTouchEnd = (event: TouchEvent) => {
  emit('dragend', event as any as ITouchEvent);
  reset();
  const hasChanged = state.listData.some(v => v.index !== v.sortIndex);
  if (hasChanged) {
    const listData = state.listData.map(item => ({
      ...item,
      index: item.sortIndex
    }));
    state.listData = [...listData];
    emit('change', listData.sort((a, b) => a.index - b.index).map(i => ({...i.data})));
  }
};

const render = (init?: 'init'|any) => {
  if (init !== 'init') {
    reset();
  }
  state.listData = (props.listData || []).map((data, index) => ({
    data,
    fixed: data.fixed || false,
    index,
    sortIndex: index,
    tranX: `${getOffsetX(index) * 100}%`,
    tranY: `${getOffsetY(index) * 100}%`,
  }));

  // 需要等到页面重排 再获取相应的尺寸
  setTimeout(async () => {
    const [container, item] = await Promise.all([
      execSelectQuery(createSelectorQuery().select(`#${props.id}`).boundingClientRect()),
      execSelectQuery(createSelectorQuery().select(`#${props.id} .fish-drag-item`).boundingClientRect())
    ]) as NodesRef.BoundingClientRectCallbackResult[];
    _baseData.itemWidth = item.width;
    _baseData.itemHeight = item.height;
    _baseData.left = container.left;
    _baseData.top = container.top;
    _baseData.bottom = container.bottom;
  }, 100);
};

// const onScroll = (e) => {
//   state.scrollTop= e.detail.scrollTop;
// };

useReady(() => {
  render('init');
  _baseData.windowHeight = getSystemInfoSync().windowHeight;
});

watch(() => props.itemHeight, render);
watch(() => props.columns, render);
watch(() => props.listData, render, { deep: true });
</script>
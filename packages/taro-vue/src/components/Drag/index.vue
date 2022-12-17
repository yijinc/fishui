<template>
  <view :id="props.id" class="fish-drag" :style="{ height: `${wrapHeight}px` }">
    <view
      v-for="item, index in state.listData"
      :key="index"
      :class="{
        'fish-drag-item': true,
        'fish-drag-item__upper': item.index === state.selected,
        'fish-drag-item__transition': props.transition && item.index !== state.selected
      }"
      :style="{
        width: `${100 / props.columns}%`,
        height: `${props.itemHeight}`,
        transform: item.index === state.selected ? 
          `translateX(${state.translateX}px) translateY(${state.translateY}px)` : `translateX(${item.tranX}) translateY(${item.tranY})`
      }"
      @longpress="(e) => onLongPress(e, index)"
      @touchstart="(e) => onTouchStart(e, index)"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <slot name="item" v-bind="item.data" />
    </view>
  </view>
</template>
<script lang="ts" setup>
import { defineProps, withDefaults, defineEmits, reactive, computed, watch } from 'vue';
import { useReady, vibrateShort, createSelectorQuery, NodesRef } from '@tarojs/taro';
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
  transition?: boolean; //
  trigger?: 'longpress' | 'touchstart'; // 触发拖拽的事件
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
}

interface IInnerData {
  current: number; // 内部记录 origin index
  distanceX: number;
  distanceY: number;
  identifier: number;
  containerLeft: number;
  containerTop: number;
  itemWidth: number;
  itemHeight: number;
  isDragging: boolean;
  previousMove: string;
}

const props = withDefaults(defineProps<IProps>(), {
  id: 'fish-drag',
  columns: 3,
  itemHeight: 124,
  vibrate: false,
  transition: true,
  trigger: 'longpress',
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
});

const _baseData: IInnerData = {
  current: -1,
  distanceX: 0,
  distanceY: 0,
  identifier: -1,
  itemHeight: 0,
  itemWidth: 0,
  containerLeft: 0,
  containerTop: 0,
  isDragging: false,
  previousMove: '',
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

const onDragStart = (event: ITouchEvent, originIndex) => {
  const iTouch = event.touches[0];
  if (!iTouch) return;
  const realIndex = state.listData[originIndex].sortIndex;
  // console.log('onLongPress originIndex:', originIndex, '\t realIndex:', realIndex, '\t itemWidth', _baseData.itemWidth);
  // 初始项是固定项则返回
  if (state.listData[originIndex].fixed) return;
  // 如果已经在 drag 中则返回, 防止多指触发 drag 动作, touchstart 事件中有效果
  if (_baseData.isDragging) return;
  _baseData.isDragging = true;

  _baseData.current = originIndex;
  state.selected = realIndex;
  const offsetX = getOffsetX(realIndex) * _baseData.itemWidth;
  const offsetY = getOffsetY(realIndex) * _baseData.itemHeight;
  _baseData.distanceX = iTouch.pageX - _baseData.containerLeft - offsetX;
  _baseData.distanceY = iTouch.pageY - _baseData.containerTop - offsetY;
  _baseData.identifier = iTouch.identifier;

  state.translateX = props.columns === 1 ? 0 : offsetX;
  state.translateY = offsetY;

  if (props.vibrate) vibrateShort({ type: 'light' });
  emit('dragstart', event);
};

const onLongPress = (event: ITouchEvent, index: number) => {
  if (props.trigger === 'longpress') {
    onDragStart(event, index);
  }  
};

const onTouchStart = (event: TouchEvent, index: number) => {
  if (props.trigger === 'touchstart') {
    onDragStart(event as any as ITouchEvent, index);
  }
};

const onTouchMove = (event: TouchEvent) => {
  event.stopPropagation();
  event.preventDefault();
  if (!_baseData.isDragging) return;
  const iTouch = event.touches[0];
  if (!iTouch) return;

  // 如果不是同一个触发点则返回
	if (_baseData.identifier !== iTouch.identifier) return;

  const tranX = props.columns === 1 ? 0 : iTouch.pageX - _baseData.containerLeft - _baseData.distanceX;
  const tranY = iTouch.pageY - _baseData.containerTop - _baseData.distanceY;
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
    _baseData.containerLeft = container.left;
    _baseData.containerTop = container.top;
  }, 100);
};

useReady(() => {
  render('init');
});

const isEqualListData = (l1: IPropsListItem[], l2: IPropsListItem[]): boolean => {
  const isEqual = (a, b) => { // _.isEqual 简单判断
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length ? a.every((item, index) => isEqual(item, b[index])) : false;
    }
    if (typeof a === 'object' && typeof b === 'object') {
      return Object.keys(a).length === Object.keys(b).length ? Object.keys(a).every((key) => isEqual(a[key], b[key])) : false;
    }
    return Object.is(a, b);
  };
  if (l1.length !== l2.length) return false;
  return l1.every((item, index) => {
    const { sort: _sort1, ...item1 } = item; // eslint-disable-line no-unused-vars
    const { sort: _srot2, ...item2 } = l2[index]; // eslint-disable-line no-unused-vars
    return isEqual(item1, item2);
  });
};

watch(() => props.itemHeight, render);
watch(() => props.columns, render);

// _previousListData 为 props.listData 的浅拷贝，fix props.listData 引用改变数据 watch 不到 pre data
let _previousListData = [...props.listData];
watch(() => props.listData, (nextListData) => {
  if (!isEqualListData(nextListData, _previousListData)) {
    render();
  }
  _previousListData = [...nextListData];
}, { deep: true });
</script>
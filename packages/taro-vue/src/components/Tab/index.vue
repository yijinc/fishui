<template>
  <view class="fish-tabs">
    <scroll-view
      :id="props.id"
      :class="{
        'fish-tabs__scroll-view': true,
        'fish-tabs__scrollable': props.scrollable
      }"
      :scroll-y="false"
      :scroll-x="props.scrollable"
      :scroll-with-animation="props.scrollable"
      :scroll-animation-duration="300"
      :scroll-left="state.scrollLeft"
    >
      <view class="fish-tabs__header">
        <view
          v-for="item, index in props.tabList"
          :key="index"
          :class="{
            'fish-tabs__item': true,
            'fish-tabs__item--active': props.modelValue === index
          }"
          @tap="() => handleClick(index)"
        >
          <view class="fish-tabs__item-text">{{ item.title }}</view>
        </view>
        <view class="fish-tabs__item-underline" :style="{
          width: `${state.lineWidth}px`,
          transform: `translateX(${state.lineTranX}px)`,
          transition: `${state.firstInit ? 'unset' : '' }`
        }" />
      </view>
    </scroll-view>
  </view>
</template>
<script lang="ts" setup>
import { reactive, defineProps, withDefaults, defineEmits, watch } from 'vue';
import { useReady, createSelectorQuery, NodesRef } from '@tarojs/taro';
import { execSelectQuery } from '../../utils';

interface ITabItem {
  title: string;
  disabled?: boolean;
  // eslint-disable-next-line no-unused-vars
  validate?: (index: number) => boolean|Promise<boolean>;
};

interface IProps {
  tabList: Readonly<ITabItem>[];
  modelValue: number; // current index
  scrollable?: boolean;
  id?: string;
};

interface IState {
  lineWidth: number;
  lineTranX: number;
  scrollLeft: number;
  firstInit: boolean;
};

const props = withDefaults(defineProps<IProps>(), {
  scrollable: false,
  id: 'fish-tabs',
});

// eslint-disable-next-line no-unused-vars
const emit = defineEmits<(e: 'update:modelValue', index: number) => void>();

const _: {
  containerWidth: number;
  containerLeft: number;
  tabItems: { width: number; left: number;}[];
  rerenderList: boolean;
} = {
  containerWidth: 375,
  containerLeft: 0,
  tabItems: [],
  rerenderList: false,
};

const state = reactive<IState>({
  lineWidth: 0,
  lineTranX: 0,
  scrollLeft: 0,
  firstInit: true,
});

const handleClick = async (index: number) => {
  const targetTab = props.tabList[index];
  if (targetTab.disabled) return;
  if (typeof targetTab.validate === 'function') {
    const isValid = await targetTab.validate(index);
    if (!isValid) return;
  }
  emit('update:modelValue', index);
};

const getLayout = () => {
  const item = _.tabItems[props.modelValue];
  if (!item) return;
  state.lineWidth = item.width;
  state.lineTranX = item.left - _.containerLeft;
  if (props.scrollable) {
    // 保持滚动后当前 item '尽可能' 在屏幕中间
    if (_.rerenderList) {
      state.scrollLeft = state.scrollLeft + 0.001; // invoke rerender
      _.rerenderList = false;
    } else {
      state.scrollLeft = Math.max(item.left - _.containerLeft - (_.containerWidth - item.width) / 2, 0);
    }
  }
};

const init = () => {
  if (!props.tabList || props.tabList.length === 0) return;
  Promise.all([
    execSelectQuery(createSelectorQuery().select(`#${props.id}`).boundingClientRect()),
    execSelectQuery(createSelectorQuery().selectAll(`#${props.id} .fish-tabs__item-text`).boundingClientRect()),
  ]).then(([_container, _items]) => {
    const container = _container as NodesRef.BoundingClientRectCallbackResult;
    const items = _items as NodesRef.BoundingClientRectCallbackResult[];
    _.containerWidth = container.width;
    _.containerLeft = container.left;
    if (_.rerenderList) {
      const previousFirstItem = _.tabItems[0];
      if (!previousFirstItem) {
        _.tabItems = items;
        _.rerenderList = false;
      } else {
        const distanceLeft = items[0].left - previousFirstItem.left;
        _.tabItems = items.map(v => ({ ...v, left: v.left - distanceLeft }));
      }
    } else {
      _.tabItems = items;
    }
    getLayout();
    if (state.firstInit) {
      setTimeout(() => state.firstInit = false, 300); // eslint-disable-line no-return-assign
    }
  });
};

const tabListChange = () => {
  _.rerenderList = true;
  /**
   * 必须等到 list 渲染完毕后再去获取 dom 信息，
   * 一般 tabList 数据量越大，需要给予渲染时间越长
  */
  setTimeout(init, Math.min(props.tabList.length * 2 + 16, 300));
};

useReady(init);
watch(() => props.modelValue, getLayout);
watch(() => props.tabList, tabListChange, { deep: true });

</script>
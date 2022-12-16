<template>
  <scroll-view
    :id="props.id"
    class="fish-scroll"
    refresher-default-style="none"
    :enable-passive="true"
    :scroll-x="false"
    :scroll-y="true"
    :lower-threshold="props.threshold"
    scroll-with-animation
    enable-flex
    :refresher-enabled="props.refresherEnabled"
    :refresher-threshold="props.refresherThreshold"
    :refresher-background="props.refresherBackground"
    :refresher-triggered="state.refreshStatus === 2"
    @scrolltolower="onScrollToLower"
    @refresherpulling="onRefresherPulling"
    @refresherrefresh="onRefresherRefresh"
    @refresherrestore="onRefresherRestore"
    @refresherabort="onRefresherAbort"
    @scroll="onScroll"
  >
    <view
      :class="{ 'fish-scroll__refresher': true, 'fish-scroll__refresher-flush': state.flush }"
      :style="{ height: props.refresherThreshold + 'px', top: -props.refresherThreshold + 'px' }"
    >
      <block v-if="state.refreshStatus === 2">
        <loading-icon />
        <text class="fish-scroll__refresher-text">加载中...</text>
      </block>
      <block v-else-if="state.refreshStatus < 2">
        <arrow-icon :class="{'rotate': state.refreshStatus === 1}" />
        <text class="fish-scroll__refresher-text">{{ state.refreshStatus === 1 ? '释放刷新': '下拉刷新' }}</text>
      </block>
    </view>
    <view
      v-if="props.showSuccess && state.refreshStatus >= 3"
      :class="{
        'fish-scroll__success': true,
        'fish-scroll__success-show': state.refreshStatus >= 4,
        'fish-scroll__success-hide': state.refreshStatus === 5,
      }"
      :style="{ height: props.refresherThreshold + 'px' }"
    >
      <view :class="{
        'fish-scroll__success-bar': true,
        'fish-scroll__success-bar-show': state.refreshStatus >= 4,
      }">
        {{ props.successText }}
      </view>
    </view>
    <slot />
    <view v-show="state.isMoreLoading" class="fish-scroll__loadmore">
      <loading-icon />
      <text class="fish-scroll__refresher-text">加载中...</text>
    </view>
    <view v-if="!props.hasmore && !state.isMoreLoading" class="fish-scroll__loadmore">
      {{ props.loadallText }}
    </view>
  </scroll-view>
</template>
<script lang="ts" setup>
import { reactive, defineProps, withDefaults, defineEmits, defineExpose } from 'vue';
import { useReady, createSelectorQuery, NodesRef } from '@tarojs/taro';
import type { ScrollViewProps, BaseEventOrig } from '@tarojs/components';
import { execSelectQuery } from '../../utils';
import LoadingIcon from './LoadingIcon';
import ArrowIcon from './ArrowIcon';

type IAsyncFunction = () => Promise<any>;
type IFunction = () => void;
type IRequest = IAsyncFunction | IFunction;
type IRefreshEvent = BaseEventOrig<{ dy: number }>;

interface IProps {
  id?: string;
  threshold?: number; // 距底部多远时（单位px），触发 loadmore 事件 default: 50
  refresherEnabled?: boolean; // 开启下拉刷新 default: true
  refresherBackground?: string; // 
  refresherThreshold?: number; // 设置自定义下拉刷新阈值
  refresh?: IRequest, // 下拉刷新请求方法
  loadmore?: IRequest, // 加载更多请求方法
  showSuccess?: boolean; // 
  successText?: string;
  hasmore?: boolean; // end 还有更多？ 可以触发 loadmore 
  loadallText?: string; // 已经加载全部
};

interface IState {
  /**
   * 0: default waiting pull “下拉刷新”
   * 1: 达到下拉刷新阈值  “松手更新”
   * 2: is refreshing "刷新加载中"
   * 3: refresh completed  & prepare show success bar 准备显示"刷新成功"
   * 4: show success bar "刷新成功"
   * 5: hide success bar
  */
  refreshStatus: 0|1|2|3|4|5;
  isMoreLoading: boolean; // 下拉加载更多 加载中
  flush: boolean; // 父组件 调用 ref.refresh() 刷新
};

const props = withDefaults(defineProps<IProps>(), {
  id: 'fish-scroll',
  threshold: 60,
  refresherEnabled: true,
  refresherBackground: '#eeeeee',
  refresherThreshold: 80,
  refresh: () => new Promise(resolve => { setTimeout(resolve, 1000) }),
  loadmore: () => new Promise(resolve => { setTimeout(resolve, 1000) }),
  showSuccess: true,
  successText: '刷新成功',
  hasmore: true,
  loadallText: '已经加载全部',
});

const emit = defineEmits<{
  // eslint-disable-next-line no-unused-vars
  (e: 'scroll', event: BaseEventOrig<ScrollViewProps.onScrollDetail>): void;
}>();

const state = reactive<IState>({
  refreshStatus: 0,
  isMoreLoading: false,
  flush: false,
});

let _scrollHeight = 0; // scroll-view height
let _timer: any = null;
const dummyRequest = (ms?: number) => new Promise(resolve => { setTimeout(resolve, typeof ms === 'number' ? ms : 1000) });

const onRefresherPulling = (e: IRefreshEvent) => {
  if (state.refreshStatus > 1) return;
  const status = e.detail.dy > props.refresherThreshold ? 1 : 0;
  if (state.refreshStatus !== status) {
    state.refreshStatus = status;
  }
};

const onScrollToLower = async () => {
  if(!props.hasmore) return;
  if (state.isMoreLoading) return;
  state.isMoreLoading = true;
  await Promise.all([props.loadmore(), dummyRequest(100)]);
  state.isMoreLoading = false;
};

const reset = () => {
  state.refreshStatus = 0;
};

const onRefresherRefresh = async (e?: IRefreshEvent) => {
  if (state.refreshStatus === 2) return;
  if (!e || e.type !== 'refresherrefresh') {
    state.flush = true;
  }
  state.refreshStatus = 2;
  await Promise.all([props.refresh(), dummyRequest(100)]);
  state.flush = false;
  state.refreshStatus = 3;
  clearTimeout(_timer);
  if (props.showSuccess) {
    _timer = setTimeout(() => {
      state.refreshStatus = 4;
      _timer = setTimeout(() => {
        state.refreshStatus = 5;
        _timer = setTimeout(reset, 360); 
      }, 1500);
    }, 20);
  } else {
    _timer = setTimeout(reset, 100);
  }
};

const onRefresherRestore = () => {
  // console.log('onRefresherRestore 复位');
};

const onRefresherAbort = () => {
  // console.log('onRefresherAbort 终止');
};

const tryScrollToLower = ({ detail: { scrollTop, scrollHeight } }) => {
  /**
   * onScrollToLower 的触发条件为 scrollTop + thisHeight + props.threshold >= scrollHeight
   * onScroll 监听的上面的条件不成立 也无法 触发 onScrollToLower，
   * 滑动过快 或页面列表原素 高度还没渲染出来，导致原生有此bug
   * 这里我们 增加一个 larger threshold 去判断 是否出现此情况
   * 
  */
  if (_scrollHeight === 0) return;
  const largerThreshold = _scrollHeight * 3 / 4; // 距离底部距离 列表的 3/4
  const originScrollHeight = scrollTop + _scrollHeight + props.threshold;
  const largerScrollHeight = scrollTop + _scrollHeight + largerThreshold;
  if (largerScrollHeight >= scrollHeight && originScrollHeight < scrollHeight) {
    onScrollToLower();
  } 
};

const onScroll = (e) => {
  emit('scroll', e);
  tryScrollToLower(e);
};

defineExpose<{ refresh: IRequest }>({
  refresh: onRefresherRefresh,
});

useReady(() => {
  execSelectQuery(createSelectorQuery().select(`#${props.id}`).boundingClientRect())
    .then((res) => {
      _scrollHeight = (res as NodesRef.BoundingClientRectCallbackResult).height;
    });
});

</script>
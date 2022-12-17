import * as React from 'react';
import classnames from 'classnames';
import { useReady, createSelectorQuery, NodesRef } from '@tarojs/taro';
import { ScrollView, View, Text, ScrollViewProps, BaseEventOrig } from '@tarojs/components';
import { execSelectQuery } from '../../utils';
import LoadingIcon from './LoadingIcon';
import ArrowIcon from './ArrowIcon';

type IAsyncFunction = () => Promise<any>;
type IFunction = () => void;
type IRequest = IAsyncFunction | IFunction;
type IRefreshEvent = BaseEventOrig<{ dy: number }>;

type IScrollProps = React.PropsWithChildren<{
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
  onScroll?: (event: BaseEventOrig<ScrollViewProps.onScrollDetail>) => void;
}>;

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

const dummyRequest = (ms?: number) => new Promise(resolve => { setTimeout(resolve, typeof ms === 'number' ? ms : 1000) });

const Scroll: React.ForwardRefRenderFunction<{refresh: any }, IScrollProps> = (props, ref) => {
  const [state, setState] = React.useState<IState>({
    refreshStatus: 0,
    isMoreLoading: false,
    flush: false,
  });

  const { current: _ } = React.useRef<{ scrollHeight: number; timer: any; }>({
    scrollHeight: 0,
    timer: null,
  });

  React.useImperativeHandle(ref, () => ({
    refresh: onRefresherRefresh,
  }));

  const onRefresherPulling = (e: IRefreshEvent) => {
    if (state.refreshStatus > 1) return;
    const status = e.detail.dy > props.refresherThreshold! ? 1 : 0;
    if (state.refreshStatus !== status) {
      setState({ ...state, refreshStatus: status })
    }
  };
  
  const onScrollToLower = async () => {
    if(!props.hasmore) return;
    if (state.isMoreLoading) return;
    setState({ ...state, isMoreLoading: true })
    await Promise.all([props.loadmore?.(), dummyRequest(100)]);
    setState({ ...state, isMoreLoading: false })
  };
  
  const reset = () => {
    setState({ ...state, refreshStatus: 0 })
  };
  
  const onRefresherRefresh = async (e?: IRefreshEvent) => {
    if (state.refreshStatus === 2) return;
    if (!e || e.type !== 'refresherrefresh') {
      setState({ ...state, flush: true })
    }
    setState({ ...state, refreshStatus: 2 })
    await Promise.all([props.refresh?.(), dummyRequest(100)]);
    if (state.flush) setState({ ...state, flush: false });

    if (props.showSuccess) {
      setState({ ...state, refreshStatus: 3 });
      _.timer = setTimeout(() => {
        setState({ ...state, refreshStatus: 4 });
        _.timer = setTimeout(() => {
          setState({ ...state, refreshStatus: 5 });
          _.timer = setTimeout(reset, 500 + 20); 
        }, 1600);
      });
    } else {
      _.timer = setTimeout(reset, 100);
    }
  };
  
  const onRefresherRestore = () => {
    // console.log('onRefresherRestore 复位');
  };
  
  const onRefresherAbort = () => {
    // console.log('onRefresherAbort 终止');
  };

  useReady(() => {
    execSelectQuery(createSelectorQuery().select(`#${props.id}`).boundingClientRect())
      .then((res) => {
        _.scrollHeight = (res as NodesRef.BoundingClientRectCallbackResult).height;
      });
  });
  
  const tryScrollToLower = ({ detail: { scrollTop, scrollHeight } }) => {
    /**
     * onScrollToLower 的触发条件为 scrollTop + thisHeight + props.threshold >= scrollHeight
     * onScroll 监听的上面的条件不成立 也无法 触发 onScrollToLower，
     * 滑动过快 或页面列表原素 高度还没渲染出来，导致原生有此bug
     * 这里我们 增加一个 larger threshold 去判断 是否出现此情况
     * 
    */
    if (_.scrollHeight === 0) return;
    const largerThreshold = _.scrollHeight * 3 / 4; // 距离底部距离 列表的 3/4
    const originScrollHeight = scrollTop + _.scrollHeight + props.threshold;
    const largerScrollHeight = scrollTop + _.scrollHeight + largerThreshold;
    if (largerScrollHeight >= scrollHeight && originScrollHeight < scrollHeight) {
      onScrollToLower();
    } 
  };
  
  const onScroll = (e) => {
    props.onScroll?.(e);
    tryScrollToLower(e);
  };

  return (
    <ScrollView
      id={props.id}
      className='fish-scroll'
      refresherDefaultStyle='none'
      enablePassive
      scrollX={false}
      scrollY
      lowerThreshold={props.threshold}
      scrollWithAnimation
      enableFlex
      refresherEnabled={props.refresherEnabled}
      refresherThreshold={props.refresherThreshold}
      refresherBackground={props.refresherBackground}
      refresherTriggered={state.refreshStatus === 2}
      onScrollToLower={onScrollToLower}
      onRefresherPulling={onRefresherPulling}
      onRefresherRefresh={onRefresherRefresh}
      onRefresherRestore={onRefresherRestore}
      onRefresherAbort={onRefresherAbort}
      onScroll={onScroll}
    >
      <View
        className={classnames({ 'fish-scroll__refresher': true, 'fish-scroll__refresher-flush': state.flush })}
        style={{ height: props.refresherThreshold + 'px', top: -props.refresherThreshold! + 'px' }}
      >
        {
          state.refreshStatus === 2 && (
            <React.Fragment>
              <LoadingIcon />
              <Text class='fish-scroll__refresher-text'>加载中...</Text>
            </React.Fragment>
          )
        }
        {
          state.refreshStatus < 2 && <React.Fragment>
            <ArrowIcon className={classnames({'rotate': state.refreshStatus === 1})} />
            <Text class='fish-scroll__refresher-text'>{ state.refreshStatus === 1 ? '释放刷新': '下拉刷新' }</Text>
          </React.Fragment>
        }
      </View>
      {
        props.showSuccess && state.refreshStatus >= 3 && (
          <View
            className={classnames({
              'fish-scroll__success': true,
              'fish-scroll__success-show': state.refreshStatus >= 3,
              'fish-scroll__success-hide': state.refreshStatus === 5,
            })}
            style={{ height: props.refresherThreshold + 'px' }}
          >
            <View className={classnames({
              'fish-scroll__success-bar': true,
              'fish-scroll__success-bar-show': state.refreshStatus >= 4,
            })}
            >
              { props.successText }
            </View>
          </View>
        )
      }
      { props.children }
      <View style={{ display: state.isMoreLoading ? '' : 'none' }} className='fish-scroll__loadmore'>
        <LoadingIcon />
        <Text className='fish-scroll__refresher-text'>加载中...</Text>
      </View>
      {
        (!props.hasmore && !state.isMoreLoading) && (
          <View className='fish-scroll__loadmore'>{props.loadallText}</View>
        )
      }
    </ScrollView>
  )
}

const WrapScroll = React.forwardRef(Scroll);

WrapScroll.defaultProps = {
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
};

export default WrapScroll;
export type {
  IScrollProps
}

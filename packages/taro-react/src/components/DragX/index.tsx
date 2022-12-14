import * as React from 'react'
import classnames from 'classnames';
import { useReady, vibrateShort, createSelectorQuery, NodesRef } from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';
import { ITouchEvent } from '@tarojs/components/types';
import { execSelectQuery } from '../../utils';

interface IPropsListItem {
  [p: string]: any;
  fixed?: boolean;
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
  current: number; // 当前选择的 item index
  translateX: number;
  translateY: number;
  listData: IItem<IPropsListItem>[];
  scrollTop: number;
}

interface IInnerData {
  distanceX: number;
  distanceY: number;
  identifier: number;
  itemWidth: number;
  itemHeight: number;
  isDragging: boolean;
  previousMove: string;
  windowHeight: number,
  // scroll view 
  left: number;
  top: number;
  bottom: number;
  scrollTop: number;
}

type IDragXProps = React.PropsWithChildren<{
  listData: IPropsListItem[];
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  columns?: number; // 列数
  itemHeight?: number; // 每个 item 高度
  vibrate?: boolean; // 开始拖拽时震动一下？
  transition?: boolean; //
  renderItem?: (item: IPropsListItem) => React.ReactNode;
  renderDragItem?: (item: IPropsListItem) => React.ReactNode;
  onChange?: (list: IPropsListItem[]) => void;
  onDragStart?: (event: ITouchEvent) => void;
  onDragEnd?: (event: ITouchEvent) => void;
}>;

const DragX: React.FC<IDragXProps> = (props) => {
  const [state, setState] = React.useState<IState>({
    current: 0,
    translateX: 0,
    translateY: 0,
    listData: [],
    scrollTop: 0,
  });
  const { current: _baseData } = React.useRef<IInnerData>({
    distanceX: 0,
    distanceY: 0,
    identifier: -1,
    itemHeight: 0,
    itemWidth: 0,
    isDragging: false,
    previousMove: '',
    windowHeight: 600,
    // scroll view 
    left: 0,
    top: 0,
    bottom: 0,
    scrollTop: -1,  // -1 un-init
  });

  const wrapHeight = Math.ceil(props.listData.length / props.columns!) * props.itemHeight!;
  const getOffsetX = (index: number): number => index % props.columns!;
  const getOffsetY = (index: number): number => Math.floor(index / props.columns!);
  const getIndex = (x: number, y: number) => x + props.columns! * y;

  const sort = (sourceIndex: number, targetIndex: number) => {
    const renderPositon = (list: IItem<IPropsListItem>[]) => {
      const listData = list.map(item => {
        item.tranX = `${getOffsetX(item.sortIndex) * 100}%`;
        item.tranY = `${getOffsetY(item.sortIndex) * 100}%`;
        return item;
      });
      setState({ ...state, listData });
    };
  
    const excludeFixed = (sortKey: number, reversed: boolean) => {
      if (state.listData[sortKey].fixed) {
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
    if (_baseData.scrollTop === -1) return; // 还未获取到 scrollTop
    const iTouch = event.touches[0];
    if (!iTouch) return;
    const realIndex = state.listData[originIndex].sortIndex;
    // 初始项是固定项则返回
    if (state.listData[originIndex].fixed) return;
    // 如果已经在 drag 中则返回, 防止多指触发 drag 动作, touchstart 事件中有效果
    if (_baseData.isDragging) return;
    _baseData.isDragging = true;

    const offsetX = getOffsetX(realIndex) * _baseData.itemWidth;
    const offsetY = getOffsetY(realIndex) * _baseData.itemHeight;
    _baseData.distanceX = iTouch.pageX - _baseData.left - offsetX;
    _baseData.distanceY = iTouch.pageY - _baseData.top - offsetY;
    _baseData.identifier = iTouch.identifier;

    setState({
      ...state,
      current: originIndex,
      translateX: props.columns === 1 ? 0 : offsetX,
      translateY: offsetY,
    })
  
    if (props.vibrate) vibrateShort({ type: 'light' });
    props.onDragStart?.(event);
  };
  
  const onTouchStart = (event: TouchEvent, index: number) => {
    execSelectQuery(createSelectorQuery().select(`#${props.id}`).scrollOffset()).then((res: NodesRef.ScrollOffsetCallbackResult) => {
      _baseData.scrollTop = res.scrollTop;
      onDragStart(event as any as ITouchEvent, index);
    });
  };
  
  const onTouchMove = (event: TouchEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (!_baseData.isDragging) return;
    const iTouch = event.touches[0];
    if (!iTouch) return;
  
    // 如果不是同一个触发点则返回
    if (_baseData.identifier !== iTouch.identifier) return;

    // 到顶到底自动滑动
  const offsetTop = _baseData.distanceY + _baseData.scrollTop;
  const toBottom = iTouch.clientY - offsetTop + _baseData.itemHeight - _baseData.bottom;
  const nextState = { ...state };
  if (toBottom > 0) {
    nextState.scrollTop = _baseData.scrollTop + toBottom;
  } else {
    const toTop = iTouch.clientY - offsetTop - _baseData.top;
    if (toTop < 0) {
      nextState.scrollTop = _baseData.scrollTop + toTop;
    }
  }
  
    const tranX = props.columns === 1 ? 0 : iTouch.pageX - _baseData.left - _baseData.distanceX;
    const tranY = iTouch.pageY - _baseData.top - _baseData.distanceY;

    nextState.translateX = tranX;
    nextState.translateY = tranY;
    setState(nextState)
    
    const currentItem = state.listData[state.current];
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
    _baseData.scrollTop = -1;
    setState({ ...state, current: -1 });
  };
  
  const onTouchEnd = (event: TouchEvent) => {
    props.onDragEnd?.(event as any as ITouchEvent);
    reset();
    const hasChanged = state.listData.some(v => v.index !== v.sortIndex);
    if (hasChanged) {
      const listData = state.listData.map(item => ({
        ...item,
        index: item.sortIndex
      }));
      state.listData = [...listData];
      props.onChange?.(listData.sort((a, b) => a.index - b.index).map(i => ({...i.data})));
    }
  };

  const render = (init?: 'init'|any) => {
    if (init !== 'init') {
      reset();
    }
    const listData = (props.listData || []).map((data, index) => ({
      data,
      fixed: data.fixed || false,
      index,
      sortIndex: index,
      tranX: `${getOffsetX(index) * 100}%`,
      tranY: `${getOffsetY(index) * 100}%`,
    }));

    setState({ ...state, listData })
  
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

  useReady(() => {
    render('init');
  });

  React.useEffect(render, [props.itemHeight, props.columns, props.listData]);

  return (
    <ScrollView
      id={props.id}
      className={classnames(props.className, 'fish-drag-scroll')}
      style={props.style}
      scrollY
      scrollTop={state.scrollTop}
    >
      <View className='fish-drag' style={{ height: `${wrapHeight}px` }}>
        {
          state.listData.map((item, index) => (
            <View
              key={index}
              className={classnames({
                'fish-drag-item': true,
                'fish-drag-item__upper': item.index === state.current,
                'fish-drag-item__transition': props.transition && item.index !== state.current
              })}
              style={{
                width: `${100 / props.columns!}%`,
                height: `${props.itemHeight}px`,
                transform: item.index === state.current ? 
                  `translateX(${state.translateX}px) translateY(${state.translateY}px)` : `translateX(${item.tranX}) translateY(${item.tranY})`
              }}
            >
              {props.renderItem?.(item.data)}
              <View
                catchMove
                onTouchStart={(e) => onTouchStart(e, index)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {props.renderDragItem?.(item.data)}
              </View>
            </View>
          ))
        }
      </View>
    </ScrollView>
  );
}

DragX.defaultProps = {
  listData: [], 
  id: 'fish-drag-scroll',
  columns: 1,
  itemHeight: 64,
  vibrate: false,
  transition: false,
};

export default DragX;
export type { IDragXProps }

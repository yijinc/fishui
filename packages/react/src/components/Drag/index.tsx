import * as React from 'react'
import classnames from 'classnames';
import { pxTransform, useReady, vibrateShort, createSelectorQuery, NodesRef } from '@tarojs/taro';
import { View } from '@tarojs/components';
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

type IDragProps = React.PropsWithChildren<{
  listData: IPropsListItem[];
  id?: string;
  columns?: number; // 列数
  itemHeight?: number; // 每个 item 高度
  vibrate?: boolean; // 开始拖拽时震动一下？
  transition?: boolean; //
  trigger?: 'longpress' | 'touchstart'; // 触发拖拽的事件
  before?: React.ReactNode;
  after?: React.ReactNode;
  renderItem?: (item: IPropsListItem) => React.ReactNode;
  onChange?: (list: IPropsListItem[]) => void;
  onDragStart?: (event: ITouchEvent) => void;
  onDragEnd?: (event: ITouchEvent) => void;
}>;

const Drag: React.FC<IDragProps> = (props) => {
  const [state, setState] = React.useState<IState>({
    selected: 0,
    translateX: 0,
    translateY: 0,
    listData: [],
  });
  const { current: _baseData } = React.useRef<IInnerData>({
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
    const iTouch = event.touches[0];
    if (!iTouch) return;
    const realIndex = state.listData[originIndex].sortIndex;
    // 初始项是固定项则返回
    if (state.listData[originIndex].fixed) return;
    // 如果已经在 drag 中则返回, 防止多指触发 drag 动作, touchstart 事件中有效果
    if (_baseData.isDragging) return;
    _baseData.isDragging = true;
  
    _baseData.current = originIndex;

    const offsetX = getOffsetX(realIndex) * _baseData.itemWidth;
    const offsetY = getOffsetY(realIndex) * _baseData.itemHeight;
    _baseData.distanceX = iTouch.pageX - _baseData.containerLeft - offsetX;
    _baseData.distanceY = iTouch.pageY - _baseData.containerTop - offsetY;
    _baseData.identifier = iTouch.identifier;

    setState({
      ...state,
      selected: realIndex,
      translateX: props.columns === 1 ? 0 : offsetX,
      translateY: offsetY,
    })
  
    if (props.vibrate) vibrateShort({ type: 'light' });
    props.onDragStart?.(event);
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
    setState({
      ...state,
      translateX: tranX,
      translateY: tranY,
    })
    
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
    setState({ ...state, selected: -1 })
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
      _baseData.containerLeft = container.left;
      _baseData.containerTop = container.top;
    }, 100);
  };

  useReady(() => {
    render('init');
  });

  React.useEffect(render, [props.itemHeight, props.columns, props.listData]);

  return (
    <View id={props.id} className='fish-drag' style={{ height: pxTransform(wrapHeight) }}>
      {props.before}
      {
        state.listData.map((item, index) => (
          <View
            key={index}
            className={classnames({
              'fish-drag-item': true,
              'fish-drag-item__upper': item.index === state.selected,
              'fish-drag-item__transition': props.transition && item.index !== state.selected
            })}
            style={{
              width: `${100 / props.columns!}%`,
              height: pxTransform(props.itemHeight!),
              transform: item.index === state.selected ? 
                `translateX(${state.translateX}px) translateY(${state.translateY}px)` : `translateX(${item.tranX}) translateY(${item.tranY})`
            }}
            onLongPress={(e) => onLongPress(e, index)}
            onTouchStart={(e) => onTouchStart(e, index)}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {props.renderItem?.(item)}
          </View>
        ))
      }
      {props.after}
    </View>
  );
}

Drag.defaultProps = {
  listData: [], 
  id: 'fish-drag',
  columns: 3,
  itemHeight: 124,
  vibrate: false,
  transition: true,
  trigger: 'longpress',
};

export default Drag;
export type { IDragProps }

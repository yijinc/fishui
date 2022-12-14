import * as React from 'react';
import classnames from 'classnames';
import { useReady, createSelectorQuery, NodesRef } from '@tarojs/taro';
import { ScrollView, View } from '@tarojs/components';
import { execSelectQuery } from '../../utils';

interface ITabItem {
  title: string;
  disabled?: boolean;
  // eslint-disable-next-line no-unused-vars
  validate?: (index: number) => boolean|Promise<boolean>;
};

type ITabProps = React.PropsWithChildren<{
  tabList: Readonly<ITabItem>[];
  current: number; // current index
  onChange: (value: number) => void;
  scrollable?: boolean;
  id?: string;
}>;

interface IState {
  lineWidth: number;
  lineTranX: number;
  scrollLeft: number;
};

const Tab: React.FC<ITabProps> = (props) => {
  const { current: _ } = React.useRef<{
    containerWidth: number;
    containerLeft: number;
    tabItems: { width: number; left: number;}[];
    rerenderList: boolean;
  }>({
    containerWidth: 375,
    containerLeft: 0,
    tabItems: [],
    rerenderList: false,
  });

  const [state, setState] = React.useState<IState>({
    lineWidth: 0,
    lineTranX: 0,
    scrollLeft: 0
  });

  const [firstInit, setFirstInit] = React.useState<boolean>(true);

  const handleClick = async (index: number) => {
    const targetTab = props.tabList[index];
    if (targetTab.disabled) return;
    if (typeof targetTab.validate === 'function') {
      const isValid = await targetTab.validate(index);
      if (!isValid) return;
    }
    props.onChange(index);
  };
  
  const getLayout = () => {
    const item = _.tabItems[props.current];
    if (!item) return;

    const nextState = { ...state };
    nextState.lineWidth = item.width;
    nextState.lineTranX = item.left - _.containerLeft;
    if (props.scrollable) {
      // 保持滚动后当前 item '尽可能' 在屏幕中间
      if (_.rerenderList) {
        nextState.scrollLeft += 0.001; // invoke rerender
        _.rerenderList = false;
      } else {
        nextState.scrollLeft = Math.max(item.left - _.containerLeft - (_.containerWidth - item.width) / 2, 0);
      }
    }
    setState(nextState);
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
      if (firstInit) {
        setTimeout(() => setFirstInit(false), 300);
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

  React.useEffect(getLayout, [props.current]);
  React.useEffect(tabListChange, [props.tabList])

  return (
    <View className='fish-tabs'>
      <ScrollView
        id={props.id}
        className={classnames({
          'fish-tabs__scroll-View': true,
          'fish-tabs__scrollable': props.scrollable
        })}
        scrollY={false}
        scrollX={props.scrollable}
        scrollWithAnimation={props.scrollable}
        scrollAnimationDuration={300}
        scrollLeft={state.scrollLeft}
      >
        <View className='fish-tabs__header'>
          {
            props.tabList.map((item, index) => (
              <View
                key={index}
                className={classnames({
                  'fish-tabs__item': true,
                  'fish-tabs__item--active': props.current === index
                })}
                onClick={() => handleClick(index)}
              >
                <View className='fish-tabs__item-text'>{ item.title }</View>
              </View>
            ))
          }
          <View
            className='fish-tabs__item-underline'
            style={{
              width: `${state.lineWidth}px`,
              transform: `translateX(${state.lineTranX}px)`,
              transition: `${firstInit ? 'unset' : '' }`
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

Tab.defaultProps = {
  scrollable: false,
  id: 'fish-tabs',
};

export default Tab;
export type {
  ITabProps
}
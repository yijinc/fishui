import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { DragX }  from '@fishui/taro-react';
import styles from './styles.module.scss'

definePageConfig({
  navigationBarTitleText: 'drag-x',
	disableScroll: true,
	enableShareAppMessage: true,
	enableShareTimeline: true,
});

interface IListItem {
  key: string;
  backgroundColor: string;
  fixed: boolean;
}

const listData: IListItem[] = [
	{ key: '0', backgroundColor: 'red', fixed: false },
	{ key: '1', backgroundColor: 'deeppink', fixed: false },
	{ key: '2', backgroundColor: 'green', fixed: false },
	{ key: '3', backgroundColor: 'orange', fixed: false },
	{ key: '4', backgroundColor: 'purple', fixed: false },
	{ key: '5', backgroundColor: 'lime', fixed: false },
	{ key: '6', backgroundColor: 'blue', fixed: false },
	{ key: '7', backgroundColor: 'violet', fixed: false },
	{ key: '8', backgroundColor: 'cyan', fixed: false },
	{ key: '9', backgroundColor: 'gold', fixed: false }
];

export default () => {
  const itemHeight = Taro.getSystemInfoSync().windowWidth / 1.5;
  
  const onChange = (list) => {
    console.log('onChange', list);
    // state.listData = list; // 直接赋值 会重新渲染
  };

  const renderItem = (item: IListItem) => {
    return (
      <View className={styles.item} style={{ backgroundColor: item.backgroundColor }}>
        {item.fixed ? 'fixed' : item.key }
      </View>
    ) as React.ReactNode
  };

  return (
    <View className={styles.container}>
      <DragX
        vibrate
        listData={listData}
        itemHeight={itemHeight}
        trigger='longpress'
        onChange={onChange}
        renderItem={renderItem}
        renderDragItem={() => <View className={styles.dragBtn} /> as React.ReactNode}
      />
    </View>
  )
};
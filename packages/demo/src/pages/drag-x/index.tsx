import { View, Image } from '@tarojs/components';
import { DragX }  from '@fishui/taro-react';
import styles from './styles.module.scss'

definePageConfig({
  navigationBarTitleText: 'DragX',
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
      <View className={styles.notice}>
        因为 Taro 无法使用原生 catch:touchmove 事件，无法让移动距离同原生scroll结合。
        整块item拖动将无法触发scroll，动态设置catch-move属性不会在dom中实时生效，所以给出这个临时方案
      </View>
      <DragX
        listData={listData}
        itemHeight={128}
        onChange={onChange}
        renderItem={renderItem}
        style={{ height: '500PX', backgroundColor: '#eee' }}
        renderDragItem={() => (
          <View className={styles.dragBtn}>
            <Image src='https://img.souche.com/bolt/cEdXvTmxcFffo_FwB3k80/sort.png' />
          </View>
        )}
      />
    </View>
  )
};
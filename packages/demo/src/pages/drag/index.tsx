import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Button, Slider } from '@tarojs/components';
import { Drag }  from '@fishui/taro-react';
import styles from './styles.module.scss'

definePageConfig({
  navigationBarTitleText: 'drag',
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
	{ key: '1', backgroundColor: 'deeppink', fixed: true },
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
  const [columns, setColumns] = useState<number>(3);
  const [longpressTrigger, setLongpressTrigger] = useState<boolean>(true);
  const onColumnsChange = (e) => {
    setColumns(e.detail.value);
  };
  
  const onChange = (list) => {
    console.log('onChange', list);
    // state.listData = list; // 直接赋值 会重新渲染
  };

  const renderItem = (item: IListItem) => {
    return (
      <View className={styles.item} style={{ backgroundColor: item.backgroundColor, width: `${100 / columns}vw` }}>
        {item.fixed ? 'fixed' : item.key }
      </View>
    )
  };

  return (
    <View className={styles.container}>
    <Drag
      vibrate
      listData={listData}
      itemHeight={itemHeight}
      columns={columns}
      onChange={onChange}
      renderItem={renderItem}
      trigger={longpressTrigger? 'longpress' : 'touchstart'}
    />
		<View className={styles.footer}>
			<Slider step={1} showValue min={1} max={5} value={columns} onChange={onColumnsChange} />
			<View className={styles.bottom}>
				<Text>colums: { columns }</Text>
				<Button onTap={() => setLongpressTrigger(!longpressTrigger)}>trigger: { longpressTrigger ? 'longpress' : 'touchstart' }</Button>
			</View>
		</View>
  </View>
  )
};
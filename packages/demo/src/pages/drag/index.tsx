import { useState, useMemo, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Button, Slider, Image } from '@tarojs/components';
import { Drag }  from '@fishui/taro-react';
import styles from './styles.module.scss'

definePageConfig({
  navigationBarTitleText: 'drag',
	disableScroll: true,
	enableShareAppMessage: true,
	enableShareTimeline: true,
});

interface IListItem {
  key?: string;
  path: string;
  backgroundColor?: string;
  fixed?: boolean;
}

const listData: IListItem[] = [
	{ key: '0', path: 'https://img.souche.com/bolt/D8VdjusNDi15fbtX-Gqp0/lufei2.jpg', backgroundColor: 'red', fixed: false },
	{ key: '1', path: 'https://img.souche.com/bolt/CamGvSVaPMeC3h2Qlv4Uv/lufei9.jpg', backgroundColor: 'deeppink', fixed: false },
	{ key: '2', path: 'https://img.souche.com/bolt/d7E95SUz7pCzy3fs5QQOg/lufei5.jpg',  backgroundColor: 'green', fixed: true },
	{ key: '3', path: 'https://img.souche.com/bolt/SE_sgFvCgn6Z0wSUaFTMk/lufei4.jpg', backgroundColor: 'orange', fixed: false },
	{ key: '4', path: 'https://img.souche.com/bolt/M4v9qNmwr4twhUhDtvVIJ/lufei3.jpg', backgroundColor: 'purple', fixed: false },
	{ key: '5', path: 'https://img.souche.com/bolt/dB-2a2V7fz6eXdzjlWT1V/lufei7.jpg', backgroundColor: 'lime', fixed: false },
	{ key: '6', path: 'https://img.souche.com/bolt/x7DbcKGEVHh2CnUiAvf76/lufei8.jpg', backgroundColor: 'blue', fixed: false },
];

const plusItem = {
  key: 'plus',
  path: 'https://img.souche.com/bolt/cbpqBOZR_SC8H4dmiwg6A/plus.png',
  fixed: true,
}

export default () => {
  const maxCount = 9;
  const [columns, setColumns] = useState<number>(3);
  const [transition, setTransition] = useState<boolean>(true);
  const itemHeight = Taro.getSystemInfoSync().windowWidth / columns;
  const [longpressTrigger, setLongpressTrigger] = useState<boolean>(true);
  const [list, setList] = useState<IListItem[]>(listData);
  const sortedList = useRef(list)

  const onColumnsChange = (e) => {
    setColumns(e.detail.value);
  };
  
  const onChange = (sorted: IListItem[]) => {
    console.log('onChange', sorted);
    sortedList.current = sorted.filter(v => v.key !== 'plus');
    // setList(sorted); // 直接赋值 会重新渲染
  };

  const add = () => {
    Taro.chooseMedia({
      count: maxCount - list.length,
      mediaType: ['image'],
      sourceType: ['album'],
      camera: 'back',
      success: ({ tempFiles }) => {
        // setTransition(false);
        sortedList.current = [ ...sortedList.current, ...tempFiles.map(temp => ({ path: temp.tempFilePath }))];
        setList(sortedList.current);
        // setTimeout(() => setTransition(true), 500)
      },
    });
  }

  const memoList = useMemo(() => list.length >= maxCount ? list : [...list, plusItem], [list]);

  const renderItem = (item: IListItem) => {
    if (item.key === 'plus') {
      return (
        <View className={styles.item} onClick={add}>
          <View className={styles.plus}><Image src={item.path} /></View>
        </View>
      )
    }
    return (
      <View className={styles.item}>
        <Image src={item.path} mode='aspectFill' />
        { item.fixed && <View className={styles.fixed}>fixed</View> }
      </View>
    )
  };

  return (
    <View className={styles.container}>
    <Drag
      vibrate
      listData={memoList}
      itemHeight={itemHeight}
      columns={columns}
      onChange={onChange}
      renderItem={renderItem}
      transition={transition}
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
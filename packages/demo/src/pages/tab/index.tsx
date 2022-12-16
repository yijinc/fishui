import { useState } from 'react';
import { View, Button } from '@tarojs/components';
import { Tab } from '@fishui/taro-react';
import styles from './styles.module.scss';

definePageConfig({
  navigationBarTitleText: 'Tab',
  enableShareAppMessage: true,
  enableShareTimeline: true,
});


let index = 0;

export default () => {
  const [current1, setCurrent1] = useState(0);
  const tabList1 = [{ title: '关注' }, { title: '推荐' }, { title: '热榜' }];
  const [current, setCurrent] = useState(0);
  const [tabList, setTabList] = useState([{ title: '体育' }, { title: '电竞' }, { title: '淘宝购物' }, { title: '健康' }, { title: '社交聊天' }, { title: '少儿编程' }]);

const operate = (func: 'push'|'unshift'|'remove'|'insert') => {
  if (func === 'push') {
    setTabList([...tabList, { title: `选项${++index}`}])
  }
  if (func === 'unshift') {
    setTabList([{ title: `选项${++index}`}, ...tabList])
  }
  if (func === 'remove') {
    tabList.splice(1, 1);
    setTabList([...tabList]);
  }
  if (func === 'insert') {
    tabList.splice(2, 0, {
      title: `选项${++index}`
    });
    setTabList([...tabList]);
  }
};

  return (
    <View className={styles.container}>
    <Tab current={current1} onChange={val => setCurrent1(val)} tabList={tabList1} />

    <View className={styles.title}>动态 tabList</View>
    <Tab
      id='my-tabs2'
      scrollable
      current={current}
      onChange={(v) => setCurrent(v)}
      tabList={tabList}
    />
    <View class={styles.footer}>
      <Button onTap={() => operate('push')}>尾部添加</Button>
      <Button onTap={() => operate('unshift')}>头部添加</Button>
      <Button onTap={() => operate('remove')}>移除第2个</Button>
      <Button onTap={() => operate('insert')}>插入第3个</Button>
    </View>
  </View>
  )
};
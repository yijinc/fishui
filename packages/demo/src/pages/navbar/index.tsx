import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { Navbar } from '@fishui/taro-react';
import { Tab } from '../../index'
import styles from './style.module.scss';

definePageConfig({
  navigationBarTitleText: 'Navbar',
  enableShareAppMessage: true,
  enableShareTimeline: true,
  navigationStyle: 'custom',
});

export default () => {
  const [current, setCurrent] = useState(0);
  const tabList = [{ title: '标题1' }, { title: '标题2' }];
  
  return (
    <View className={styles.container}>
      <Navbar hideBack title='Navbar' backgroundColor='#cb1ee0' color='#fff' />

      <View className={styles.title}>一般用法</View>
      <Navbar title='标题' />

      <View className={styles.title}>自定义导航栏返回内容</View>
      <Navbar
        renderLeft={() => <View
          className={styles.back}
          onClick={() => Taro.showModal({
            title: '确定返回吗',
            success(result) {
              if (result.confirm) Taro.navigateBack()
            },
          })}
        >
          🔙
        </View>}
        title='标题'
      />

      <View className={styles.title}>自定义导航栏中间内容</View>
      <Navbar
        renderTitle={() => <Tab current={current} tabList={tabList} onChange={setCurrent} />}
      />

    </View>
  )
};
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import styles from './styles.module.scss';

definePageConfig({
  navigationBarTitleText: 'taropui',
  enableShareAppMessage: true,
  enableShareTimeline: true,
});

const list = [
  { title: 'Tab', path: '/pages/tab/index' },
  { title: 'Scroll', path: '/pages/scroll/index' },
  { title: 'Drag', path: '/pages/drag/index' },
  { title: 'DragX', path: '/pages/drag-x/index' },
];

const navigate = (url) => Taro.navigateTo({ url });
const logoURL = 'https://img.souche.com/bolt/4aEPNxR0gh8-B5Vz_UtU6/image.png';

export default () => {
  Taro.useShareAppMessage(() => ({
    title: 'miniui组件库 - 一套基于Taro + Vue3的小程序组件合集，支持Typescript',
    imageUrl: logoURL,
  }));

  return (
    <View className={styles.container}>
      <View className={styles.flex}>
        <Image src={logoURL} />
      <View className={styles.info}>
        <View className={styles.title}>taropui</View>
        <View>一套基于Taro + Vue3的小程序组件合集，支持Typescript</View>
      </View>
    </View>
    <View className={styles.item} style={{ borderTop: 0, fontWeight: 600 }}>组件列表</View>
    {
      list.map((item => (
        <View className={styles.item} key={item.title} onTap={() => navigate(item.path)}>{ item.title }</View>
      )))
    }
    </View>
  )
};
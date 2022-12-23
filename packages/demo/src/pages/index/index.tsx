import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import styles from './styles.module.scss';

definePageConfig({
  navigationBarTitleText: 'Fish UI',
  enableShareAppMessage: true,
  enableShareTimeline: true,
});

const list = [
  { title: 'Navbar', path: '/pages/navbar/index' },
  { title: 'Tab', path: '/pages/tab/index' },
  { title: 'Scroll List', path: '/pages/scroll/index' },
  { title: 'Drag', path: '/pages/drag/index' },
  { title: 'DragX', path: '/pages/drag-x/index' },
  { title: 'Virtual Swiper', path: '/pages/virtual-swiper/index' },
];

const navigate = (url) => Taro.navigateTo({ url });
const logoURL = 'https://img.souche.com/bolt/4aEPNxR0gh8-B5Vz_UtU6/image.png';
const title = 'Fish UI 是一套基于 taro 和 uni-app 的常用的小程序组件，致力于用最简洁、舒适可靠的实现';

export default () => {
  Taro.useShareAppMessage(() => ({
    title,
    imageUrl: logoURL,
  }));

  return (
    <View className={styles.container}>
      <View className={styles.flex}>
        <Image src={logoURL} />
      <View className={styles.info}>
        {title}。地址：<Text selectable style={{ color: '#7468F2' }}>https://github.com/yijinc/fishui</Text>
      </View>
    </View>
    <View className={styles.itemTitle}>组件列表</View>
    {
      list.map((item => (
        <View className={styles.item} key={item.title} onTap={() => navigate(item.path)}>{ item.title }</View>
      )))
    }
    </View>
  )
};
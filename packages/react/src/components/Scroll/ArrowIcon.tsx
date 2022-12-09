import { View } from '@tarojs/components';

export default (props) => (
  <View className={`fish-arrow ${props.className||''}`}>
    <View className='fish-arrow__line' />
  </View>
);
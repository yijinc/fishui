import { View, Text } from '@tarojs/components';
import { Navbar } from '@fishui/taro-react';

definePageConfig({
  navigationBarTitleText: 'Navbar',
  enableShareAppMessage: true,
  enableShareTimeline: true,
  navigationStyle: 'custom',
});

export default () => {
  return (
    <View>
      <Navbar hideBack title='fishui' backgroundColor='red' color='white' />

      <Navbar
        renderTitle={() => <Text>自定义<Text style={{ color: 'blue' }}>标题</Text></Text>}
      />

      <Navbar
        renderLeft={() => <Text>返回</Text>}
        title='标题'
      />
    </View>
  )
};
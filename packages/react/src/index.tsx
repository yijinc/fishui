import { View } from '@tarojs/components';
import {  useState } from 'react';

export default () => {
  const [count, setCount] = useState<number>(0);
  return (
    <View onTap={() => setCount(count + 1)}>count: { count }</View>
  )
}
# Scroll 列表滚动 下拉刷新、加载更多


## 用法


```tsx
import { useState, useRef, useEffect } from 'react';
import { View } from '@tarojs/components';
import { Scroll } from '@fishui/taro-react';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default () => {
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [list, setList] = useState<IListItem[]>([]);
  const scrollRef = useRef<{refresh: () => Promise<any>}>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.refresh()); // 默认刷新
  }, []);

  const fetchData = async (pageNum = 1) => {
    const page_size = 10;
    try {
      await delay(Math.random() * 1200);
      if (page === 1) {
        setList(Array.from({ length: 10 }));
      } else {
        setList([...list, ...Array.from({ length: 10 })])
      }
      setPage(pageNum)
      setHasMore(pageNum < data.pageCount)
    } catch (error) {

    }
  }

  const loadmore = () => {
    if (!hasMore) return;
    return fetchData(page + 1);
  };

  return (
    <View className='list-wrap'>
      <Scroll
        ref={scrollRef}
        refresh={fetchData}
        loadmore={loadmore}
        hasmore={hasMore}
      >
        {list.map((item, index) => <View key={index}>{item.content}</View>)}
      </Scroll>
    </View>
  )
};
```


## API


### Props

| 参数                   | 说明                                                        | 类型           | 默认值      |
| ---------------------- | ----------------------------------------------------------- | -------------- | ----------- |
| threshold | 距底部多远时（单位px），触发 loadmore 事件  | `number`       |   50  |
| refresherEnabled  | 开启下拉刷新  | `boolean`        |   true   |
| refresherBackground | 下拉刷新的背景颜色 | `string`        | '#eeeeee' |
| refresherThreshold |  设置自定义下拉刷新阈值 |  `number`  |  80  |
| refresh | 下拉刷新请求方法 |  `() => Promise<any>`  |    |
| loadmore | 加载更多请求方法 |  `() => Promise<any>`  |      |
| showSuccess | 是否显示下拉刷新成功交户 |  `boolean`  |    true  |
| successText | 下拉刷新成功文案（可以动态给'刷新成功xx条数据'） |  `string`  |   '刷新成功'   |
| hasmore | 是否结束end 还有更多？ 可以触发 loadmore  |  `boolean`  |   true  |
| loadallText | 已经加载全部文案 |  `string`  |   '已经加载全部'   |
| onScroll | 滚动事件 |  `(event: BaseEventOrig<ScrollViewProps.onScrollDetail>) => void;`  |    |


### Scroll 暴露的方法

| 名称          | 说明                   | 参数类型     |
| ---------------- | ---------------------- | ------------ |
| refresh | 触发下拉刷新，可以在页面初始化调用 scrollRef.refresh 触发。（如果自己直接 获取数据 将没有下拉 刷新的交互） |  |


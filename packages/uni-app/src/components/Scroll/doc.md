# Scroll 列表滚动 下拉刷新、加载更多


## 用法

```vue
<template>
  <scroll ref="scrollRef" :refresh="fetchData" :loadmore="loadmore" :hasmore="state.hasMore">
    <view v-for="item in state.dataList" :key="item.id">
      list item content
    </view>
  </scroll>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import { Scroll } from '@fishui/uni-app';

// api doc https://www.wanandroid.com/blog/show/2
const fetchData = async (page = 1) => {
  const page_size = 10;
  try {
    const { data: { data } } = await uni.request({
      url: `https://www.wanandroid.com/project/list/${page}/json`,
      data: {
        cid: 29,
        page_size,
      }
    })
    if (page === 1) {
      state.dataList = data.datas;
    } else {
      state.dataList.push(...data.datas);
    }
    state.page = page;
    state.hasMore = page < data.pageCount;
  } catch (error) {}
}

const loadmore = () => {
  if (!state.hasMore) return;
  return fetchData(state.page + 1);
};

const scrollRef = ref(null);

const state = reactive({
  page: 1,
  hasMore: true,
  dataList: [],
});

onMounted(() => {
  scrollRef.value?.refresh();
});


</script>
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



### Events

| 事件名           | 说明                   | 类型     |
| ---------------- | ---------------------- | ------------ |
| scroll            | 滚动事件  |  (e: Event) => void  |


### Scroll 暴露的方法

| 名称          | 说明                   | 参数类型     |
| ---------------- | ---------------------- | ------------ |
| refresh | 触发下拉刷新，可以在页面初始化调用 scrollRef.refresh 触发。（如果自己直接 获取数据 将没有下拉 刷新的交互） |  |


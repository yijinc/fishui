import { useState, useRef, useEffect } from 'react';
import { View, Image, Text } from '@tarojs/components';
import { Scroll } from '@taropui/react';
import request from '@taropui/request';
import './styles.scss'

definePageConfig({
  navigationBarTitleText: 'Scroll',
  enableShareAppMessage: true,
  enableShareTimeline: true,
});

interface IListItem {
  id: number;
  author: string;
  title: string;
  chapterName: string;
  desc: string;
  envelopePic: string;
  link: string;
  niceDate: string;
  projectLink: string;
  superChapterName: string;
}

interface IResponse {
  data: {
    curPage: number;
    datas: Array<IListItem>;
    pageCount: number;
    total: number;
  },
  errorCode: number;
  errorMsg: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default () => {
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [list, setList] = useState<IListItem[]>([]);
  const scrollRef = useRef<{refresh: () => Promise<any>}>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.refresh())
  }, []);

  // api doc https://www.wanandroid.com/blog/show/2
  const fetchData = async (pageNum = 1) => {
    const page_size = 10;
    try {
      await delay(Math.random() * 1200);
      const { data: { data } }  = await request<IResponse>({
        url: `https://www.wanandroid.com/project/list/${pageNum}/json`,
        data: {
          cid: 29,
          page_size,
        }
      });
      console.log('data', data);
      if (page === 1) {
        setList(data.datas)
      } else {
        setList([...list, ...data.datas])
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

  const renderItem = (item: IListItem) => (
    <View className='item-wrap' key={item.id}>
      <Image src={item.envelopePic} mode='aspectFill' className='item-avatar' />
      <View className='item-info'>
        <View className='text-title'>{item.title}</View>
        <View className='item-row'>author: <Text>{item.author}</Text></View>
        <View className='text-desc'>{item.desc}</View>
      </View>
    </View>
  )

  return (
    <View className='scroll-page'>
      <View className='list-wrap'>
        <Scroll
          ref={scrollRef}
          refresh={fetchData}
          loadmore={loadmore}
          hasmore={hasMore}
        >
          {list.map(renderItem)}
        </Scroll>
      </View>
    </View>
  )
};
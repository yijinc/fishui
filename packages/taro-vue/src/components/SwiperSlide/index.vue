<template>
  <view
    :class="{
      'fish-swiper__slide': true,
      'fish-swiper__slide-active': props.current !== undefined && props.index === props.current
    }">
    <slot></slot>
  </view>
</template>

<script lang="ts">
export default { name: 'SwiperSlide' };
</script>

<script lang="ts" setup>
import { defineProps } from 'vue';

interface ISwiperSlideProps {
  current?: number;
  index?: number;
}

const props = defineProps<ISwiperSlideProps>();

</script>
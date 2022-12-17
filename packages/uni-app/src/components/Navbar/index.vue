<template>
  <view class='fish-navbar'>
    <view
      :class="{ 'fish-navbar__fixed': props.fixed }"
      :style="{ backgroundColor: props.backgroundColor }"
    >
      <view :style="{ height: `${statusBarHeight}px` }" />
      <view v-if="height !== 0" class='fish-navbar__header' :style="{ height, backgroundColor: props.backgroundColor }">
        <view v-if="!props.hideBack" class='fish-navbar__header-left'>
          <view v-if="!slots.left" class='fish-navbar__goback' @tap="handleBack">
            <image :src="props.backIcon!" class='fish-navbar__icon' />
          </view>
          <block v-else>
            <slot name="left" />
          </block>
              
        </view>
        <view class='fish-navbar__header-wrap'>
          <text v-if="!slots.title" :style="{ color: props.color }">{{props.title}}</text>
          <block v-else>
            <slot name="title" />
          </block>
        </view>
      </view>
    </view>
    <view class='fish-navbar__placeholder'>
      <view :style="{height: `${statusBarHeight}px`}" />
      <view :style="{ height }" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { withDefaults, defineProps, useSlots, computed } from 'vue';
const iconPath = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAApJJREFUaEPtmVmO1DAQhn8HhieugIQrfRceENDd0zPsF0DcBvEMM8AATyD25Sqx3ULcYRapU8hSIoVMko6TOIs0/RjZzv/VX0lXVQQm/hMT148LgKEd9OYAEd0E8JyZd4IgeKqU+uAD1gsAEe0CeAtgJxH9V2t9bRIAUsqVEOIoI97qVlrr2egBpJR7Qog3OfFnQRDciqLo16gBSsSfMvOeMeazD/H2zE6eASnlfhL5yxmh3sV3AjCbzfbjOLZp8594ACut9RdfkU/PbeVAGIZ3mfl1gfhdrfVX3+JbORCG4T1mfjWk+MYAFeKXWutvfUS+cQoR0X0Ah7nInwCwadOreGcHysQLIZZKqe99Rt7ZASJ6AOAgH/khxdd2wIpn5kMhxKVMlE+EEAul1I8hIl/bASJ6yMwHYxS/1QEp5SMAL/PigyCYR1H0c8jIb3WgRPxxHMeL9Xo9CvGlDkgpHwN4kYv8MTPPjTFeqsqmbp4rJWxts9lsjgrE3zHG/G56I1/7zgEQ0R8A2e7JRn6U4gtTiIgMgOtje12WOVjkwBLA+4I/rMHf+UUQheX0GEuG2g6kC6cCUdnQjKlsdnYg3VDRdfVe+9d+BvILx9A6NnYg3VjRvPfW/zZ2IN1YNj5JurFemvg8hPNUomyA1dcYpTWAPaBk/nk6BISzA5l0Khri9jKNy7rQGMAeUjBGt5d7hWgFUAFxxswrn0PdrR2ZS/1ORLYAfJcfqyeT6U8uZ7mube1ApnYaBKIzAAsShuGCmW0pnn5aspftB47bvoYAnQJkIGw6XUndYWZtjAld06PO+s4BEoh54kQKMZ2PfJna6UYcx88AXBVCPFFKfawTUdc1XhxwFdFm/QVAm+h1sXfyDvwDmUo+QDLH3GkAAAAASUVORK5CYII=";

interface IProps {
  title?: string;
  backIcon?: string;
  color?: string;
  backgroundColor?: string;
  fixed?: boolean;
  height?: number;
  hideBack?: boolean;
  goback?: (e: any) => void; // eslint-disable-line no-unused-vars
};

const props = withDefaults(defineProps<IProps>(), {
  title: '',
  backIcon: iconPath,
  color: '#222222',
  backgroundColor: '#FFFFFF',
  fixed: true,
  height: 44,
  hideBack: false,
});

const getSizeToPx = (size: number | string): string | 0 => {
  if (String(size).startsWith('0')) return 0;
  if (typeof size === 'number' || /^\d+$/.test(size)) {
    return `${size}px`;
  }
  return size;
};

const { statusBarHeight } = uni.getSystemInfoSync();

const slots = useSlots();

const handleBack = (e: any) => {
  if (typeof props.goback === 'function') {
    props.goback(e);
  } else {
    uni.navigateBack();
  }
};

const height = computed(() => getSizeToPx(props.height));

</script>
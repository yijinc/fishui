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
import { getSizeToPx } from '../../utils';
import iconPath from '../../../../../assets/icon-back.png';

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
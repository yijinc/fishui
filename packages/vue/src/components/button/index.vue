<template>
  <view>
    <text>{{ props.name }}</text>
    <text @tap="state.count++">{{ state.count }}</text>
  </view>
</template>

<script lang="ts" setup>
import {  defineProps, withDefaults, reactive } from 'vue';

interface IProps {
  name?: string;
};
const props = withDefaults(defineProps<IProps>(), {
  name: '123',
});

const state = reactive({
  count: 0,
})
</script>
<template>
  <view class="ai-float-btn" :style="customStyle" @click="$emit('click')">
    <text class="ai-text">AI</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  bottom: {
    type: [String, Number],
    default: 60, // rpx
  },
  right: {
    type: [String, Number],
    default: 40, // rpx
  },
})
const customStyle = computed(() => {
  return `bottom: ${props.bottom}rpx; right: ${props.right}rpx;`
})
</script>

<style scoped lang="scss">
.ai-float-btn {
  position: fixed;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a8dff, #b5c3ff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
  z-index: 1002;
}
.ai-text {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}
</style>

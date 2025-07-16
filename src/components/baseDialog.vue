<template>
  <view v-if="visible" class="dialog-mask">
    <view class="dialog-content">
      <slot />
      <view v-if="showClose" class="dialog-close" @click="handleClose">×</view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  visible: Boolean,
  showClose: { type: Boolean, default: true },
})
const emit = defineEmits(['close'])
function handleClose() {
  emit('close')
}
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  align-items: stretch;
  justify-content: center;
}
.dialog-content {
  background: #fff;
  border-radius: 24rpx;
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;
  overflow: auto;
}
.dialog-close {
  position: absolute;
  right: 20rpx;
  top: 10rpx;
  font-size: 40rpx;
  color: #888;
  cursor: pointer;
  z-index: 10;
}
</style>

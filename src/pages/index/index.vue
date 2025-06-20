<template>
  <view class="content">
    <image class="logo" src="/static/logo.png"></image>
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>

    <!-- AI浮动按钮 -->
    <AIFloatButton @click="showChat" />

    <!-- 聊天对话框 -->
    <ChatDialog v-model:visible="chatVisible" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import AIFloatButton from '@/components/AIFloatButton.vue'
import ChatDialog from '@/components/ChatDialog.vue'

const title = ref('Hello')
const chatVisible = ref(false)

function showChat() {
  chatVisible.value = true
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>

<template>
  <view class="create-container">
    <view class="memo-card">
      <!-- 页面标题 -->
      <view class="page-title">
        <text>新建备忘录</text>
      </view>

      <!-- 备忘录标题输入框 -->
      <view class="input-group">
        <input
          class="title-input"
          v-model="memo.title"
          maxlength="50"
          type="text"
          @focus="titleFocused = true"
          @blur="titleFocused = false"
        />
        <text
          v-if="!memo.title && !titleFocused"
          class="placeholder title-placeholder"
        >
          请输入标题
        </text>
      </view>

      <!-- 备忘录内容输入框 -->
      <view class="input-group content-group">
        <textarea
          class="content-textarea"
          v-model="memo.content"
          maxlength="2000"
          auto-height
          cursor-spacing="20"
          show-confirm-bar="false"
          @focus="contentFocused = true"
          @blur="contentFocused = false"
        />
        <text
          v-if="!memo.content && !contentFocused"
          class="placeholder content-placeholder"
        >
          请输入内容
        </text>
      </view>

      <!-- 保存按钮 -->
      <view class="save-btn" @click="saveMemo" :disabled="loading">
        <text class="save-text">{{ loading ? '保存中...' : '保存' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { memoApi } from '../../api/index'

const titleFocused = ref(false)
const contentFocused = ref(false)
const emit = defineEmits(['success'])
// 备忘录数据
const memo = ref({
  title: '',
  content: '',
})

// 状态变量
const loading = ref(false)
const errorMessage = ref('')

// 保存备忘录
const saveMemo = async () => {
  // 表单验证
  if (!memo.value.title.trim()) {
    uni.showToast({
      title: '请输入标题',
      icon: 'none',
    })
    return
  }

  if (!memo.value.content.trim()) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none',
    })
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

    // 调用API创建备忘录
    const newMemo = await memoApi.create(memo.value.title, memo.value.content)
    console.log('创建备忘录成功:', newMemo)

    uni.showToast({
      title: '保存成功',
      icon: 'success',
      success: () => {
        memo.value = { title: '', content: '' }
        // 触发页面刷新事件
        emit('success')
      },
    })
  } catch (error) {
    errorMessage.value = error.message || '创建备忘录失败'
    uni.showToast({
      title: errorMessage.value,
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
page {
  background-color: #b5c3ff;
}

.create-container {
  padding: 30rpx;
  min-height: 100vh;
  margin-top: 110rpx;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
}

.memo-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  position: relative;
  min-height: 85vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 70rpx;
  padding: 0 60rpx;
  margin-top: 40rpx;
  text-align: center;
}

.input-group {
  margin: 20rpx 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0 10rpx;
  position: relative; /* 为 placeholder 定位 */
}

.content-group {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.title-input {
  font-size: 34rpx;
  color: #333;
  border-bottom: 2rpx solid #ddd;
  padding: 20rpx 0;
  width: 100%;
  box-sizing: border-box;
  height: 80rpx;
  background: transparent;
}

.content-textarea {
  font-size: 30rpx;
  color: #666;
  line-height: 1.8;
  width: 100%;
  min-height: 500rpx;
  padding: 20rpx 0;
  border: none;
  border-top: 2rpx solid #ddd;
  border-radius: 0;
  box-sizing: border-box;
  background: transparent;
}

.placeholder {
  position: absolute;
  color: #999;
  pointer-events: none;
}

.title-placeholder {
  font-size: 34rpx;
  top: 20rpx;
  left: 10rpx;
}

.content-placeholder {
  font-size: 30rpx;
  top: 20rpx;
  left: 10rpx;
}

.save-btn {
  width: 240rpx;
  height: 80rpx;
  background-color: #f28500;
  color: white;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto auto 40rpx auto;
  margin-top: auto;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
}

.save-text {
  font-size: 32rpx;
  font-weight: bold;
}
</style>

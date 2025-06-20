<template>
  <view class="create-container">
    <view class="memo-card">
      <!-- 返回按钮 -->
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>

      <!-- 页面标题 -->
      <view class="page-title">
        <text>新建备忘录</text>
      </view>

      <!-- 备忘录标题输入框 -->
      <view class="input-group">
        <input
          class="title-input"
          v-model="memo.title"
          placeholder="请输入标题"
          maxlength="50"
          placeholder-class="placeholder"
          type="text"
        />
      </view>

      <!-- 备忘录内容输入框 -->
      <view class="input-group content-group">
        <textarea
          class="content-textarea"
          v-model="memo.content"
          placeholder="请输入内容"
          maxlength="2000"
          placeholder-class="placeholder"
          auto-height
          cursor-spacing="20"
          show-confirm-bar="false"
        />
      </view>

      <!-- 保存按钮 -->
      <view class="save-btn" @click="saveMemo" :disabled="loading">
        <text class="save-text">{{ loading ? '保存中...' : '保存' }}</text>
      </view>
    </view>
  </view>
  <!-- AI悬浮圈组件，放在根节点下，确保 fixed 定位生效 -->
  <AIFloatButton :bottom="80" :right="40" @click="showAIFloatWindow" />
  <ChatDialog v-model:visible="showChatDialog" />
</template>

<script setup>
import { ref } from 'vue'
import { memoApi } from '../../api/index'
import AIFloatButton from '../../components/AIFloatButton.vue'
import ChatDialog from '../../components/ChatDialog.vue'

// 备忘录数据
const memo = ref({
  title: '',
  content: '',
})

// 状态变量
const loading = ref(false)
const errorMessage = ref('')
const showChatDialog = ref(false)

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
        // 触发页面刷新事件
        uni.$emit('pageShow')

        // 缩短延迟时间，让用户更快看到结果
        setTimeout(() => {
          uni.navigateBack({
            success: () => {
              console.log('成功返回备忘录列表')
            },
            fail: (err) => {
              console.error('返回失败:', err)
              // 备用方式：直接跳转到列表页面
              uni.redirectTo({
                url: '/pages/memo/index',
                fail: (redirectErr) => {
                  console.error('跳转失败:', redirectErr)
                  uni.redirectTo({ url: '/pages/memo/index' })
                },
              })
            },
          })
        }, 800) // 缩短到800ms
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

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

const showAIFloatWindow = () => {
  showChatDialog.value = true
}
</script>

<style lang="scss">
page {
  background-color: #b5c3ff; /* 与其他页面背景色保持一致 */
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
  min-height: 85vh; /* 让卡片占据大部分屏幕高度 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.back-btn {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  border: 2rpx solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  z-index: 10;
}

.back-icon {
  font-size: 36rpx;
  line-height: 1;
  color: #333;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 70rpx; /* 增加与标题输入框的距离 */
  padding: 0 60rpx; /* 为左侧按钮留出空间 */
  margin-top: 40rpx; /* 为顶部的按钮留出空间 */
  text-align: center;
}

.input-group {
  margin: 20rpx 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0 10rpx; /* 增加左右内边距 */
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
  height: 80rpx; /* 固定高度 */
}

.content-textarea {
  font-size: 30rpx;
  color: #666;
  line-height: 1.8;
  width: 100%;
  min-height: 400rpx; /* 设置最小高度 */
  padding: 20rpx 0;
  border: none; /* 移除边框 */
  border-top: 2rpx solid #ddd; /* 只保留顶部边框 */
  border-radius: 0; /* 移除圆角 */
  box-sizing: border-box;
}

.placeholder {
  color: #999;
  font-size: 30rpx;
}

.save-btn {
  width: 240rpx;
  height: 80rpx;
  background-color: #8687fd;
  color: white;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto auto 40rpx auto;
  margin-top: auto; /* 将按钮推到底部 */
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
}

.save-text {
  font-size: 32rpx;
  font-weight: bold;
}
</style>

<template>
  <view class="edit-memo-container">
    <view class="memo-card">
      <view class="page-title">编辑备忘录</view>
      <input
        v-model="localMemo.title"
        placeholder="请输入标题"
        maxlength="50"
        class="title-input"
      />
      <textarea
        v-model="localMemo.content"
        placeholder="请输入内容"
        maxlength="2000"
        class="content-textarea"
      />
      <view class="save-btn" @click="saveMemo" :disabled="loading">
        <text class="save-text">{{ loading ? '保存中...' : '保存' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { memoApi } from '../../api/index'

const props = defineProps({
  memo: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['success'])

const localMemo = ref({
  id: '',
  title: '',
  content: '',
})

watch(
  () => props.memo,
  (val) => {
    if (val) {
      localMemo.value = { ...val }
    }
  },
  { immediate: true }
)

const loading = ref(false)

const saveMemo = async () => {
  if (!localMemo.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  if (!localMemo.value.content.trim()) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  try {
    loading.value = true
    await memoApi.update(
      localMemo.value.id,
      localMemo.value.title,
      localMemo.value.content
    )
    uni.showToast({
      title: '保存成功',
      icon: 'success',
      success: () => {
        emit('success')
      },
    })
  } catch (error) {
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.edit-memo-container {
  padding: 30rpx;
  min-height: 100vh;
  margin-top: 110rpx;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  background: transparent;
}

.memo-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  position: relative;
  min-height: 90vh;
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

.title-input {
  font-size: 34rpx;
  color: #333;
  border-bottom: 2rpx solid #ddd;
  padding: 20rpx 0;
  width: 100%;
  box-sizing: border-box;
  min-height: 80rpx;
  background: transparent;
  margin-bottom: 30rpx;
}

.content-textarea {
  font-size: 30rpx;
  color: #666;
  line-height: 1.8;
  width: 100%;
  min-height: 400rpx;
  max-height: 800rpx;
  padding: 20rpx 0;
  border: none;
  border-top: 2rpx solid #ddd;
  border-radius: 0;
  box-sizing: border-box;
  background: transparent;
  margin-bottom: 40rpx;
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
  margin-top: auto;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
}

.save-text {
  font-size: 32rpx;
  font-weight: bold;
}
</style>

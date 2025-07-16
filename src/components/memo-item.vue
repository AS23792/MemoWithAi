<!-- ./components/memo-item.vue -->
<template>
  <movable-area class="memo-item" scale-area>
    <movable-view
      class="memo-card"
      direction="horizontal"
      :x="x"
      @change="onSlideChange"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      inertia
      out-of-bounds
      disable-scroll
    >
      <view class="memo-content-wrapper" @click.stop="editThisMemo">
        <view class="memo-title">{{ memo.title }}</view>
        <view class="memo-content">{{ memo.content }}</view>
        <view class="memo-date">{{ formatDate(memo.createTime) }}</view>
        <image
          class="delete-btn"
          src="@/static/del.png"
          mode="aspectFit"
          @click.stop="deleteMemo"
        />
      </view>
    </movable-view>
  </movable-area>
</template>

<script setup>
import { ref } from 'vue'
import { memoApi } from '@/api/index'
import { formatDate } from '@/utils/index'
//点击事件
const emit = defineEmits(['refresh', 'edit'])
const editThisMemo = () => {
  emit('edit', props.memo)
}
const props = defineProps({
  memo: {
    type: Object,
    required: true,
  },
})
const x = ref(0)

const editMemo = () => {
  uni.navigateTo({
    url: `/pages/memo/edit?id=${props.memo.id}`,
  })
}

const deleteMemo = async () => {
  try {
    const res = await uni.showModal({
      title: '确认删除',
      content: '确定要删除此备忘录吗？',
      confirmText: '删除',
      confirmColor: '#FF4D4F',
    })
    if (!res.confirm) return
    await memoApi.delete(props.memo.id)
    uni.showToast({
      title: '删除成功',
      icon: 'success',
    })
    x.value = 0 // 重置滑动位置
    emit('refresh') // 通知父组件刷新列表
  } catch (error) {
    uni.showToast({
      title: '删除失败',
      icon: 'none',
    })
  }
}
</script>

<style lang="scss">
.memo-item {
  position: relative;
  width: 100%;
  height: 200rpx;
  widows: 100%;
}

.memo-card {
  position: absolute;
  height: 90%;
  width: 85vw;
  background-color: white;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 1;
  touch-action: pan-x;
  transition: transform 0.3s ease;
}
.memo-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.memo-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.memo-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
}

.memo-date {
  font-size: 22rpx;
  color: #aaa;
  margin-top: auto;
}
.delete-btn {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  width: 48rpx;
  height: 48rpx;
  z-index: 2;
}
.memo-content-wrapper {
  position: relative; // 让 delete-btn 绝对定位于内容区
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

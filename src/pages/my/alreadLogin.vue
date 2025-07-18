<template>
  <view class="user-center">
    <view class="user-info">
      <image class="avatar" :src="userStore.avatar || defaultAvatar" />
      <!-- user.avatar ||  -->
      <view class="nickname">{{ user.nickname }}</view>
    </view>
    <view class="actions">
      <button @click="goEditProfile">编辑资料</button>
      <button @click="goChangePassword">修改密码</button>
    </view>
    <view class="menu">
      <view @click="goMemoList">我的备忘录</view>
      <view @click="goChatHistory">AI对话历史</view>
      <view @click="goFeedback">意见反馈</view>
      <view @click="goAbout">关于我们</view>
      <view @click="goSettings">设置</view>
    </view>
    <view class="logout" @click="logout">退出登录</view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user'
import { computed } from 'vue'

const userStore = useUserStore()
const user = computed(() => ({
  avatar: userStore.avatar,
  nickname: userStore.nickname,
}))
const defaultAvatar = '../../static/default-avatar.png'
const logout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    confirmText: '退出',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    },
  })
}
</script>

<style>
.user-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.user-info {
  width: 100%;
  background: #f28500;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 32rpx 0;
  border-bottom-left-radius: 32rpx;
  border-bottom-right-radius: 32rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  background: #fff;
  margin-bottom: 16rpx;
  object-fit: cover;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.userid {
  font-size: 22rpx;
  color: #ffe0b2;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin: 32rpx 0 16rpx 0;
}

.actions button {
  background: #fff;
  color: #f28500;
  border: 2rpx solid #f28500;
  border-radius: 24rpx;
  padding: 0 32rpx;
  height: 56rpx;
  font-size: 26rpx;
  margin: 0;
}

.menu {
  width: 90%;
  margin: 32rpx 0 0 0;
  background: #fff;
  border-radius: 18rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.menu view {
  padding: 32rpx 0;
  text-align: left;
  font-size: 30rpx;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;
  padding-left: 32rpx;
  transition: background 0.2s;
}

.menu view:last-child {
  border-bottom: none;
}

.menu view:active {
  background: #f5f5f5;
}

.logout {
  width: 80%;
  margin: 48rpx auto 0 auto;
  background: #fff;
  color: #f28500;
  border: 2rpx solid #f28500;
  border-radius: 32rpx;
  height: 64rpx;
  font-size: 30rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
  text-align: center;
  line-height: 64rpx;
}
</style>

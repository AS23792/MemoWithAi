<template>
  <view class="login-container">
    <view class="form-container">
      <view class="form-header">
        <text class="form-title">微信授权登录</text>
      </view>
      <button
        v-if="platform === 'mp-weixin'"
        class="avatar-btn"
        open-type="chooseAvatar"
        @chooseavatar="onChooseAvatar"
      >
        <image :src="avatarUrl" class="avatar-img" />
        <view>选择头像</view>
      </button>
      <input
        v-if="platform === 'mp-weixin'"
        type="nickname"
        v-model="nickname"
        class="nickname-input"
        placeholder="请输入昵称"
      />
      <view
        v-if="platform === 'mp-weixin'"
        class="login-btn"
        :disabled="loading || !avatarUrl || !nickname"
        @click="handleWeChatLogin"
      >
        {{ loading ? '登录中...' : '微信一键登录' }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../store/user'
import { authApi } from '../../api/index'

const userStore = useUserStore()
const loading = ref(false)
const platform = ref(process.env.UNI_PLATFORM)
const avatarUrl = ref(
  'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
) // 默认头像
const nickname = ref('')

function onChooseAvatar(e) {
  avatarUrl.value = e.detail.avatarUrl
}

const handleWeChatLogin = async () => {
  loading.value = true
  try {
    // 微信小程序登录流程
    const res = await uni.login()
    const code = res.code
    // 调用后端API换取token
    const userData = await authApi.wxMpLogin(code)
    if (userData && userData.token) {
      uni.setStorageSync('user', {
        avatar: avatarUrl.value,
        nickname: nickname.value,
      })
      userStore.setToken(userData.token)
      userStore.setUserInfo({
        avatar: avatarUrl.value,
        nickname: nickname.value,
      })
      uni.setStorageSync('token', userData.token)
      uni.setStorageSync('loginTime', Date.now())
    } else {
      uni.showToast({ title: '登录失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.login-container {
  min-height: 100vh;
  padding: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f28500, #fdc830);
}
.form-container {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.form-header {
  margin-bottom: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.form-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}
.login-btn {
  width: 70%;
  height: 90rpx;
  background: linear-gradient(135deg, #f28500, #fdc830);
  border-radius: 45rpx;
  color: white;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
}
.avatar-btn {
  background: none;
  border: none;
  box-shadow: none;
  padding: 0;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  // 关键：去除伪元素边框
  &::after {
    border: none !important;
    display: none !important;
  }
}
.avatar-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #f0f0f0;
  object-fit: cover;
  margin-bottom: 10rpx;
}
.nickname-input {
  width: 40%;
  height: 80rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  font-size: 32rpx;
  background: #fff;
  text-align: center;
}
</style>

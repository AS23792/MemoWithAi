<template>
  <view class="login-container">
    <view class="form-container">
      <view class="form-header">
        <text class="form-title">微信授权登录</text>
      </view>
      <!-- H5端：二维码扫码 -->
      <view v-if="platform === 'h5'">
        <image :src="qrCodeUrl" class="wechat-qrcode" v-if="qrCodeUrl" />
        <view v-else>正在获取二维码...</view>
        <view class="tip">请使用微信扫码登录</view>
      </view>
      <!-- 小程序、App端：一键登录按钮 -->
      <button
        v-else
        class="login-btn"
        @click="handleWeChatLogin"
        :disabled="loading"
      >
        {{ loading ? '登录中...' : '微信一键登录' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { authApi } from '../../api/index'

const loading = ref(false)
const platform = ref('')
const qrCodeUrl = ref('')
let pollTimer = null

const checkAutoLogin = () => {
  const token = uni.getStorageSync('token')
  const loginTime = uni.getStorageSync('loginTime')
  if (token && loginTime) {
    const now = Date.now()
    if (now - loginTime < 30 * 24 * 60 * 60 * 1000) {
      uni.redirectTo({ url: '/pages/memo/index' })
    }
  }
}

onMounted(() => {
  checkAutoLogin()
  platform.value = process.env.UNI_PLATFORM
  if (platform.value === 'h5') {
    getQrCode()
    pollLoginStatus()
  }
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const getQrCode = async () => {
  // 调用后端API获取二维码URL
  const res = await authApi.getWxQrCode()
  qrCodeUrl.value = res.qrCodeUrl
}

const pollLoginStatus = () => {
  pollTimer = setInterval(async () => {
    const res = await authApi.checkQrLogin()
    if (res.success) {
      clearInterval(pollTimer)
      uni.setStorageSync('token', res.token)
      uni.setStorageSync('loginTime', Date.now())
      uni.redirectTo({ url: '/pages/memo/index' })
    }
  }, 2000)
}

const handleWeChatLogin = async () => {
  loading.value = true
  try {
    if (platform.value === 'mp-weixin') {
      // 小程序
      const res = await uni.login()
      const code = res.code
      const userData = await authApi.wxMpLogin(code)
      console.log('token', userData.token)
      uni.setStorageSync('token', userData.token)
      uni.setStorageSync('loginTime', Date.now())
      uni.redirectTo({ url: '/pages/memo/index' })
    } else if (platform.value === 'app') {
      // App端
      const code = await getAppWeChatCode()
      const userData = await authApi.wxAppLogin(code)
      uni.setStorageSync('token', userData.token)
      uni.setStorageSync('loginTime', Date.now())
      uni.redirectTo({ url: '/pages/memo/index' })
    }
  } catch (error) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const getAppWeChatCode = async () => {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => resolve(res.code),
      fail: reject,
    })
  })
}
</script>

<style lang="scss">
.login-container {
  min-height: 100vh;
  padding: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
}
.form-container {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
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
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  border-radius: 45rpx;
  color: white;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.wechat-qrcode {
  width: 300rpx;
  height: 300rpx;
  margin: 0 auto 20rpx auto;
  display: block;
}
.tip {
  text-align: center;
  color: #888;
  font-size: 28rpx;
}
</style>

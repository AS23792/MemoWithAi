<template>
  <view class="login-container">
    <view class="form-container">
      <view class="form-header">
        <text class="form-title">微信授权登录</text>
      </view>
      <view
        v-if="platform === 'mp-weixin'"
        class="login-btn"
        @click="handleWeChatLogin"
        :disabled="loading"
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
// 计算属性，实时响应 pinia 登录状态
const isLogin = computed(() => userStore.isLogin && userStore.checkLoginValid())

const handleWeChatLogin = async () => {
  loading.value = true
  try {
    // 1. 获取微信用户信息（头像、昵称）
    const profileRes = await uni.getUserProfile({
      desc: '用于完善用户资料',
    })
    const { avatarUrl, nickName } = profileRes.userInfo
    // 微信小程序登录流程
    const res = await uni.login()
    const code = res.code
    // 调用后端API换取token
    const userData = await authApi.wxMpLogin(code)
    if (userData && userData.token) {
      uni.setStorageSync('user', { avatar: avatarUrl, nickname: nickName })
      userStore.setToken(userData.token) // pinia同步
      userStore.setUserInfo({ avatar: avatarUrl, nickname: nickName })
      uni.setStorageSync('token', userData.token)
      uni.setStorageSync('loginTime', Date.now())
      // pinia状态变更后，my.vue会自动切换为已登录子页面
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
  background: linear-gradient(135deg, #f28500, #fdc830);
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

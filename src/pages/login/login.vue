<template>
  <view class="login-container">
    <view class="form-container">
      <view class="form-header">
        <text class="form-title">账号登录</text>
      </view>

      <view class="form-content">
        <view class="input-group">
          <input
            class="input-field"
            type="text"
            v-model="loginForm.username"
            placeholder="请输入用户名"
          />
        </view>

        <view class="input-group">
          <input
            class="input-field"
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
          />
        </view>

        <view class="remember-row">
          <view class="checkbox-wrapper" @click="toggleRemember">
            <view
              class="checkbox"
              :class="{ checked: loginForm.remember }"
            ></view>
            <text class="checkbox-label">记住我</text>
          </view>
          <text class="forgot-password" @click="goToForgetPassword"
            >忘记密码？</text
          >
        </view>

        <button class="login-btn" @click="handleLogin" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <view class="register-link">
          还没有账号？
          <view class="register-text" @click="goToRegister">立即注册</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '../../api/index'

// 表单数据
const loginForm = ref({
  username: '123',
  password: '123qwe',
  remember: false,
})

// 登录状态
const loading = ref(false)
const errorMessage = ref('')

// 方法
const toggleRemember = () => {
  loginForm.value.remember = !loginForm.value.remember
}

// 处理登录表单提交
const handleLogin = async () => {
  // 表单验证
  if (!loginForm.value.username || !loginForm.value.username.trim()) {
    uni.showToast({
      title: '请输入账号',
      icon: 'none',
    })
    return
  }

  if (!loginForm.value.password || !loginForm.value.password.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none',
    })
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

    // 调用登录API
    const userData = await userApi.login(
      loginForm.value.username,
      loginForm.value.password,
      loginForm.value.remember
    )

    // 存储登录信息
    uni.setStorageSync('token', userData.token)
    uni.setStorageSync('userId', userData.userId)
    uni.setStorageSync('username', userData.username)

    // 显示登录成功提示
    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 2000,
    })

    // 延迟跳转到备忘录页面
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/memo/index',
        fail: (err) => {
          console.error('跳转失败:', err)
        },
      })
    }, 1500)
  } catch (error) {
    // 显示登录错误
    errorMessage.value = error.message || '登录失败，请重试'
    uni.showToast({
      title: errorMessage.value,
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

// 跳转到注册页面
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register',
    fail: (err) => {
      console.error('跳转失败:', err)
    },
  })
}

// 跳转到忘记密码页面
const goToForgetPassword = () => {
  uni.showToast({
    title: '忘记密码功能开发中',
    icon: 'none',
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
}

.form-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.form-content {
  margin-bottom: 40rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-field {
  width: 100%;
  height: 90rpx;
  background-color: #f5f7fa;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #a6c0fe;
  border-radius: 6rpx;
  margin-right: 16rpx;
  position: relative;
}

.checkbox.checked::after {
  content: '';
  position: absolute;
  width: 24rpx;
  height: 24rpx;
  background-color: #a6c0fe;
  border-radius: 4rpx;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.checkbox-label {
  font-size: 26rpx;
  color: #666;
}

.forgot-password {
  font-size: 26rpx;
  color: #a6c0fe;
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

.register-link {
  text-align: center;
  font-size: 28rpx;
  color: #666;
}

.register-text {
  color: #a6c0fe;
  display: inline;
}
</style>

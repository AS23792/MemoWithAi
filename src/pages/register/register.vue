<template>
  <view class="register-container">
    <view class="form-container">
      <view class="form-header">
        <text class="form-title">注册账号2</text>
      </view>

      <view class="form-content">
        <view class="input-group">
          <input
            class="input-field"
            type="text"
            v-model="registerForm.username"
            placeholder="请输入用户名"
          />
        </view>

        <view class="input-group">
          <input
            class="input-field"
            type="password"
            v-model="registerForm.password"
            placeholder="请输入长度不小于六位密码"
          />
        </view>

        <view class="input-group">
          <input
            class="input-field"
            type="password"
            v-model="registerForm.confirmPassword"
            placeholder="请确认密码"
          />
        </view>

        <button
          class="register-btn"
          @click="handleRegister"
          :disabled="loading"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>

        <view class="login-link">
          已有账号？
          <view class="login-text" @click="goToLogin">立即登录</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { userApi } from '../../api/index'

// 表单数据
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

// 注册状态
const loading = ref(false)
const errorMessage = ref('')

// 方法
const toggleAgreement = () => {
  agreement.value = !agreement.value
}

// 处理注册表单提交
const handleRegister = async () => {
  // 表单验证
  if (!registerForm.value.username || !registerForm.value.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none',
    })
    return
  }

  if (!registerForm.value.password || !registerForm.value.password.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none',
    })
    return
  }

  if (
    !registerForm.value.confirmPassword ||
    !registerForm.value.confirmPassword.trim()
  ) {
    uni.showToast({
      title: '请确认密码',
      icon: 'none',
    })
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    uni.showToast({
      title: '两次输入的密码不一致',
      icon: 'none',
    })
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

    // 调用注册API
    const userData = await userApi.register(
      registerForm.value.username,
      registerForm.value.password,
      registerForm.value.confirmPassword
    )

    // 显示注册成功提示
    uni.showToast({
      title: '注册成功，请登录',
      icon: 'success',
      duration: 2000,
    })

    // 延迟跳转到登录页面
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/login/login',
        fail: (err) => {
          console.error('跳转失败:', err)
          // 备用方式
          uni.redirectTo({ url: '/pages/login/login' })
        },
      })
    }, 1500)
  } catch (error) {
    // 显示注册错误
    errorMessage.value = error.message || '注册失败，请重试'
    uni.showToast({
      title: errorMessage.value,
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

const viewTerms = () => {
  uni.showToast({
    title: '用户协议功能开发中',
    icon: 'none',
  })
}

const viewPrivacy = () => {
  uni.showToast({
    title: '隐私政策功能开发中',
    icon: 'none',
  })
}

// 跳转到登录页面
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login',
    fail: (err) => {
      console.error('跳转失败:', err)
      // 备用方式
      uni.redirectTo({ url: '/pages/login/login' })
    },
  })
}
</script>

<style lang="scss">
.register-container {
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

.register-btn {
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

.login-link {
  text-align: center;
  font-size: 28rpx;
  color: #666;
}

.login-text {
  color: #a6c0fe;
  display: inline;
}
</style>

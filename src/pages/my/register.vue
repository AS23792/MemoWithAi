<template>
  <view class="login-container">
    <view class="form-container">
      <view class="form-header">
        <text class="form-title">账号注册</text>
      </view>
      <view class="form-content">
        <view class="input-group">
          <input
            class="input-field"
            type="text"
            v-model="form.username"
            placeholder="请输入用户名"
          />
        </view>
        <view class="input-group">
          <input
            class="input-field"
            type="password"
            v-model="form.password"
            placeholder="请输入密码(6位及以上)"
          />
        </view>
        <view class="input-group">
          <input
            class="input-field"
            type="password"
            v-model="form.confirmPassword"
            placeholder="请确认密码(6位及以上)"
          />
        </view>
        <button class="login-btn" @click="handleRegister" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <view class="register-link">
          已有账号？
          <view class="register-text" @click="goToLogin">去登录</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { userApi } from '@/api/index'
const emit = defineEmits(['switchToLogin'])
const userStore = useUserStore()
const loading = ref(false)
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
})
const goToLogin = () => {
  emit('switchToLogin')
}
const handleRegister = async () => {
  if (
    !form.value.username ||
    !form.value.password ||
    !form.value.confirmPassword
  ) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  console.log(form.value.password, form.value.confirmPassword)
  if (form.value.password !== form.value.confirmPassword) {
    console.log('?')
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }
  try {
    loading.value = true
    const res = await userApi.register(
      form.value.username,
      form.value.password,
      form.value.confirmPassword
    )
    console.log('res', res)
    if (res) {
      uni.showToast({ title: '注册成功', icon: 'success' })
      goToLogin()
    }
  } catch (e) {
    uni.showToast({ title: e.message || '注册失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.login-container {
  min-height: 100vh;
  padding: 30rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f28500, #fdc830);
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
  margin-bottom: 30rpx;
}
.input-field {
  width: 100%;
  height: 90rpx;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
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
.register-link {
  text-align: center;
  font-size: 28rpx;
  color: #666;
}
.register-text {
  color: #fdc830;
  display: inline;
}
</style>

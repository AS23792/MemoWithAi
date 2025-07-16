<template>
  <view>
    <AlreadLogin v-if="isLogin" />
    <!-- //微信小程序跳转 -->
    <NotLogin v-else-if="isMpWeixin" />
    <!-- //其他设备跳转 -->
    <NotLoginOtherDevice v-else />
  </view>
</template>
<script setup>
import { computed } from 'vue'
import { useUserStore } from '../../store/user'
import AlreadLogin from './alreadLogin.vue'
import NotLogin from './notLogin.vue'
import NotLoginOtherDevice from './otherDevice.vue'

const userStore = useUserStore()
const isLogin = computed(() => userStore.isLogin && userStore.checkLoginValid())

// 判断平台
const isMpWeixin = process.env.UNI_PLATFORM === 'mp-weixin'
// 用 computed 实时响应 pinia状态
</script>
<!-- test的英文翻译是？（简要回答） -->
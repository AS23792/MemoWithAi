<template>
  <view class="login-container">
    <template v-if="isRegiste">
      <Register @switchToLogin="isRegiste = false" />
    </template>
    <template v-else>
      <OtherDeviceLogin @switchToRegister="isRegiste = true" />
    </template>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import OtherDeviceLogin from './otherDeviceLogin.vue'
import Register from './register.vue'
const isRegiste = ref(false)
</script>

<style lang="scss"></style>

<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */
@import url('./static/fonts/iconfont.css');
.dark-theme {
  background: #222;
  color: #eee;
}
.light-theme {
  background: #fff;
  color: #f28500;
}
</style>

<script setup>
import { useUserStore } from './store/user'
import { computed } from 'vue'
const userStore = useUserStore()
const darkMode = computed(() => userStore.darkMode)
</script>
<template>
  <view :class="darkMode ? 'dark-theme' : 'light-theme'">
    <slot />
  </view>
</template>

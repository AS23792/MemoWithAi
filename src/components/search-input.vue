<template>
  <view class="search-box">
    <input
      class="search-input"
      type="text"
      :value="modelValue"
      @input="onInput"
      @confirm="onSearch"
      placeholder="搜索你的内容"
    />

    <!-- <image
      src="@/static/search.png"
      mode="aspectFit"
      class="search-icon"
      @click.stop="onSearch"
    /> -->
  </view>
</template>

<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'search'])

const onInput = (e) => {
  emit('update:modelValue', e.detail.value)
}
const onSearch = () => {
  emit('search')
}
</script>

<style lang="scss">
.search-box {
  position: relative; // 由 absolute 改为 relative
  left: 0;
  top: 30rpx;
  z-index: 9999;
  width: 100%;
  .search-input {
    background-color: #ffffff;
    height: 70rpx;
    line-height: 40rpx;
    text-align: center;
    border-radius: 30rpx;
    margin: 0 20rpx;
    width: 100%;
    box-sizing: border-box;
    padding-right: 60rpx; // 给右侧按钮留空间
  }
  .search-icon {
    position: absolute;
    right: 40rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 40rpx;
    height: 40rpx;
    z-index: 100;
    background: transparent;
  }
}
</style>

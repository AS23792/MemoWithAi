<template>
  <view class="search-contianer">
    <view v-if="!isLogin" class="empty-container">
      <text class="empty-text">你还没登陆，赶快去登陆吧</text>
    </view>
    <view v-else>
      <SearchInput v-model="keyword" @search="handleSearch" />
      <view v-if="searchResult.length === 0 && keyword">暂无搜索结果</view>
      <view v-else>
        <view
          v-for="memo in searchResult"
          :key="memo.id"
          class="memo-item-wrapper"
        >
          <MemoItem :memo="memo" @refresh="fetchAllMemos" class="memoitem" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import SearchInput from '@/components/search-input.vue'
import MemoItem from '@/components/memo-item.vue'
import { memoApi } from '@/api/index'
import { useUserStore } from '@/store/user'
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'

const userStore = useUserStore()
const isLogin = computed(() => userStore.isLogin && userStore.checkLoginValid())

const keyword = ref('')
const allMemos = ref([])
const searchResult = ref([])

const fetchAllMemos = async () => {
  const data = await memoApi.getList(1, 1000)
  allMemos.value = data.list || []
  searchResult.value = allMemos.value
}

const handleSearch = () => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) {
    searchResult.value = allMemos.value
    return
  }
  searchResult.value = allMemos.value.filter(
    (memo) =>
      (memo.title && memo.title.toLowerCase().includes(kw)) ||
      (memo.content && memo.content.toLowerCase().includes(kw))
  )
}

watch(keyword, handleSearch)
onMounted(() => {
  if (isLogin.value) fetchAllMemos()
})
watch(isLogin, (val) => {
  if (val) fetchAllMemos()
  else {
    allMemos.value = []
    searchResult.value = []
  }
})

onPullDownRefresh(() => {
  if (isLogin.value) fetchAllMemos()
  console.log('刷新')
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss">
.search-contianer {
  padding: 30rpx;
  min-height: 100vh;
  background-color: rgba(#f5f6f7, 0.8);
}
.memo-item-wrapper {
  margin-bottom: 50rpx; // 控制item间距，20~40rpx都可以
  background-color: transparent; // 去掉红色背景
  // height: 200rpx; // 去掉或按需调整
}
.memo-item-wrapper:first-child {
  margin-top: 80rpx;
}
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}
.empty-text {
  font-size: 30rpx;
  color: #888;
}
</style>

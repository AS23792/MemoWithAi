<template>
  <view class="memo-container">
    <!-- 未登录提示 -->
    <view v-if="!isLogin" class="empty-container">
      <text class="empty-text">暂未登陆，快去我的进行登陆吧</text>
    </view>
    <view v-else>
      <!-- 备忘录网格 -->
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
      <view
        v-else-if="!memoList || memoList.length === 0"
        class="empty-container"
      >
        <text class="empty-text">暂无备忘录，赶快进行添加吧</text>
      </view>
      <view v-else class="memo-grid">
        <view v-for="memo in memoList" :key="memo.id" class="memo-item-wrapper">
          <memo-item
            :memo="memo"
            @refresh="fetchMemoList"
            @edit="openEditDialog"
          ></memo-item>
        </view>
      </view>
      <view class="add-button" @click="createNewMemo">
        <text class="add-icon">+</text>
      </view>
      <BaseDialog :visible="showCreateDialog" @close="showCreateDialog = false">
        <CreateMemo @success="handleCreateSuccess" />
      </BaseDialog>
      <BaseDialog :visible="showEditDialog" @close="showEditDialog = false">
        <EditMemo
          v-if="currentEditMemo"
          :memo="currentEditMemo"
          @success="handleEditSuccess"
        />
      </BaseDialog>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { memoApi } from '@/api/index'
import { useUserStore } from '@/store/user'
import { formatDate } from '@/utils/index'
import memoItem from '@/components/memo-item.vue'
import BaseDialog from '@/components/baseDialog.vue'
import CreateMemo from '@/pages/components/createMemo.vue'
import EditMemo from '@/pages/components/editMemo.vue'
const showDialog = ref(false)
const showCreateDialog = ref(false)
//编辑弹窗相关的
const showEditDialog = ref(false)
const currentEditMemo = ref(null)

const isMpWeixin = ref(false)
const userStore = useUserStore()
const isLogin = computed(() => userStore.isLogin && userStore.checkLoginValid())
// 备忘录数据
const memoList = ref([])
const loading = ref(true)
const errorMessage = ref('')
let isNavigating = false
// 分页参数
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 初始化加载数据
onMounted(() => {
  // #ifdef MP-WEIXIN
  isMpWeixin.value = true
  // #endif

  // 监听页面显示事件
  uni.$on('pageShow', handlePageShow)

  // 首次加载时根据登录状态拉取数据
  if (isLogin.value) {
    fetchMemoList()
  } else {
    loading.value = false
  }
})

// 监听登录状态变化，自动刷新数据
watch(isLogin, (val) => {
  if (val) {
    fetchMemoList()
  } else {
    memoList.value = []
    loading.value = false
  }
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  uni.$off('pageShow', handlePageShow)
})

const viewMemoDetail = (memo) => {
  if (isNavigating) return
  isNavigating = true
  uni.navigateTo({
    url: `/pages/memo/detail?id=${memo.id}`,
    complete: () => {
      setTimeout(() => {
        isNavigating = false
      }, 500)
    },
  })
}

// 页面显示时的处理函数
const handlePageShow = () => {
  if (isLogin.value) {
    fetchMemoList()
  } else {
    memoList.value = []
    loading.value = false
  }
}

// 获取备忘录列表
const fetchMemoList = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const data = await memoApi.getList(
      pagination.value.page,
      pagination.value.pageSize
    )

    memoList.value = data.list || []
    pagination.value.total = data.total || 0
  } catch (error) {
    errorMessage.value = error.message || '获取备忘录列表失败'
    uni.showToast({
      title: errorMessage.value,
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

// 创建新备忘录
const createNewMemo = () => {
  showCreateDialog.value = true
}
const handleCreateSuccess = () => {
  showCreateDialog.value = false
  fetchMemoList() // 重新拉取备忘录列表
}

//编辑部分
const openEditDialog = (memo) => {
  currentEditMemo.value = { ...memo } // 拷贝，避免直接修改
  showEditDialog.value = true
}
const handleEditSuccess = () => {
  showEditDialog.value = false
  fetchMemoList()
}

// 暴露生命周期钩子给 uni-app
defineExpose({
  onShow() {
    handlePageShow()
  },
})
</script>
<style lang="scss">
.memo-container {
  padding: 30rpx;
  min-height: 100vh;
  background-color: #f5f6f7;
}

.memo-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 40rpx;
  margin-bottom: 120rpx;
}
.memo-item-wrapper {
  margin-bottom: 20rpx; // 或你想要的间距
  //   width: 100%;
}
.add-button {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.add-icon {
  color: rgba(#f28500, 0.8);
  font-size: 80rpx;
  font-weight: bold;
  line-height: 1;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text,
.empty-text {
  font-size: 30rpx;
  color: #888;
}
</style>

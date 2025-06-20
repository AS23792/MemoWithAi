<template>
  <view class="memo-container">
    <!-- 页面标题 -->
    <view class="page-header" :class="{ 'is-mp': isMpWeixin }">
      <text class="page-title">我的备忘录</text>
      <view class="logout-button" @click="handleLogout">
        <text class="logout-icon">🚪</text>
        <text class="logout-text">登出</text>
      </view>
    </view>

    <!-- 备忘录网格 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <view
      v-else-if="!memoList || memoList.length === 0"
      class="empty-container"
    >
      <text class="empty-text">暂无备忘录，点击右下角添加</text>
    </view>

    <view v-else class="memo-grid">
      <view
        class="memo-card"
        v-for="memo in memoList"
        :key="memo.id"
        @click="viewMemoDetail(memo)"
      >
        <view class="memo-title">{{ memo.title }}</view>
        <view class="memo-content">{{ memo.content }}</view>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="add-button" @click="createNewMemo">
      <text class="add-icon">+</text>
    </view>
  </view>
  <!-- AI悬浮圈组件，放在根节点下，确保 fixed 定位生效 -->
  <AIFloatButton :bottom="180" :right="40" @click="showAIFloatWindow" />
  <ChatDialog v-model:visible="showChatDialog" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { memoApi } from '../../api/index'
import AIFloatButton from '../../components/AIFloatButton.vue'
import ChatDialog from '../../components/ChatDialog.vue'

const isMpWeixin = ref(false)

// 胶囊按钮安全距离
const headerPaddingRight = ref(0)

// 备忘录数据
const memoList = ref([])
const loading = ref(true)
const errorMessage = ref('')

// 分页参数
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 获取备忘录列表
const fetchMemoList = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    console.log('开始获取备忘录列表...')

    const data = await memoApi.getList(
      pagination.value.page,
      pagination.value.pageSize
    )

    console.log('获取到的备忘录数据:', data)

    // 更新备忘录列表和分页数据
    memoList.value = data.list || []
    pagination.value.total = data.total || 0

    console.log('更新后的备忘录列表:', memoList.value)
  } catch (error) {
    console.error('获取备忘录列表失败:', error)
    errorMessage.value = error.message || '获取备忘录列表失败'
    uni.showToast({
      title: errorMessage.value,
      icon: 'none',
    })

    // 如果是未授权错误，跳转到登录页
    if (error.code === 401) {
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/login/login',
          fail: (err) => {
            console.error('跳转失败:', err)
          },
        })
      }, 1500)
    }
  } finally {
    loading.value = false
  }
}

// 页面显示时的处理函数
const handlePageShow = () => {
  console.log('页面显示，刷新数据')
  const token = uni.getStorageSync('token')
  if (token) {
    fetchMemoList()
  }
}

// 初始化加载数据
onMounted(() => {
  // #ifdef MP-WEIXIN
  isMpWeixin.value = true
  // #endif

  // 检查用户是否已登录
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.redirectTo({
      url: '/pages/login/login',
      fail: (err) => {
        console.error('跳转失败:', err)
      },
    })
    return
  }

  // 加载备忘录列表
  fetchMemoList()

  // 监听页面显示事件
  uni.$on('pageShow', handlePageShow)
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  uni.$off('pageShow', handlePageShow)
})

let isNavigating = false

const viewMemoDetail = (memo) => {
  if (isNavigating) return
  isNavigating = true
  uni.navigateTo({
    url: `/pages/memo/detail?id=${memo.id}`,
    complete: () => {
      // 跳转完成后解锁
      setTimeout(() => { isNavigating = false }, 500)
    }
  })
}

// 创建新备忘录
const createNewMemo = () => {
  console.log('创建新备忘录')
  // 跳转到创建页面
  uni.navigateTo({
    url: '/pages/memo/create',
    fail: (err) => {
      console.error('跳转失败:', err)
    },
  })
}

// 登出功能
const handleLogout = () => {
  uni.showModal({
    title: '确认登出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        console.log('用户确认登出')
        // 清除本地存储的token
        uni.removeStorageSync('token')
        // 清除其他可能的用户数据
        uni.removeStorageSync('userInfo')

        uni.showToast({
          title: '已退出登录',
          icon: 'success',
          duration: 1500,
        })

        // 跳转到登录页面
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/login',
            fail: (err) => {
              console.error('跳转失败:', err)
            },
          })
        }, 1500)
      }
    },
  })
}

const showChatDialog = ref(false)

const showAIFloatWindow = () => {
  showChatDialog.value = true
}

// 暴露生命周期钩子给 uni-app
defineExpose({
  onShow() {
    console.log('onShow 被调用')
    handlePageShow()
  },
})
</script>

<style lang="scss">
page {
  background-color: #b5c3ff;
}

.memo-container {
  padding: 30rpx;
  min-height: 100vh;
  padding-top: 120rpx;
}

.page-header {
  margin-bottom: 40rpx;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  text-align: center;
}

.logout-button {
  position: absolute;
  right: 30rpx; /* This is for non-MP environments */
  top: 50%;
  transform: translateY(-50%);
  padding: 15rpx;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Styles for WeChat Mini Program */
.page-header.is-mp {
  justify-content: flex-start;
  padding-left: 30rpx;
}

.page-header.is-mp .logout-button {
  position: static;
  transform: none;
  margin-left: 20rpx;
  background: transparent;
  padding: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10rpx;
}

.logout-icon {
  font-size: 30rpx;
  margin-right: 10rpx;
}

.logout-text {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text,
.empty-text {
  font-size: 30rpx;
  color: white;
}

.memo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 120rpx;
}

.memo-card {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 200rpx;
  border: none;
}

.memo-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.memo-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
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
  color: #b5c3ff;
  font-size: 60rpx;
  font-weight: bold;
  line-height: 1;
}
</style>

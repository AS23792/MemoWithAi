<template>
  <!-- 未登录提示 -->
  <view v-if="!isLogin" class="empty-container">
    <text class="empty-text">暂未登陆，快去我的进行登陆吧</text>
  </view>
  <view v-else>
    <view class="chat-dialog">
      <view class="chat-header">
        <view class="chat-header-left">
          <view
            class="chat-btn chat-history-btn"
            @click="showHistory"
            title="历史记录"
          >
            <image src="@/static/history-chat.png" class="historyImg"></image>
          </view>
          <view
            class="chat-btn chat-new-btn"
            @click="createNewChat"
            title="新建聊天"
          >
            <image src="@/static/createChat.png" class="create-chat-img" />
          </view>
        </view>
        <span class="chat-title" @click="editTitle">{{
          currentChatTitle
        }}</span>
      </view>
      <!-- 历史记录侧边栏 -->
      <view v-if="showHistoryPanel" class="chat-history-panel">
        <view class="history-header">
          <span>聊天历史</span>
          <span class="history-close" @click="hideHistory">×</span>
        </view>
        <view class="history-list">
          <view
            v-for="chat in chatHistory"
            :key="chat._id"
            class="history-item"
            :class="{ active: currentSessionId === chat._id }"
          >
            <view class="history-item-content" @click="loadChat(chat._id)">
              <view class="history-item-title">{{
                chat.title || '新对话'
              }}</view>
              <view class="history-item-time">
                {{ formatTime(chat.updateTime) }}
              </view>
            </view>
            <view class="history-item-actions">
              <view
                class="delete-btn"
                @click.stop="deleteSession(chat._id)"
                title="删除会话"
              >
                <image
                  src="@/static/del.png"
                  class="del-icon"
                  mode="aspectFit"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 内容区 -->
      <view class="chat-body">
        <view
          v-for="(msg, idx) in messages"
          :key="idx"
          class="chat-message-row"
        >
          <view class="chat-message" :class="msg.role">
            <span>{{ msg.role === 'user' ? '我' : 'AI' }}：</span>{{ msg.text }}
          </view>
        </view>
      </view>
      <!-- 输入区 -->
      <view class="chat-footer">
        <input
          v-model="input"
          class="chat-input"
          placeholder="请输入内容..."
          @keyup.enter="send"
        />
        <button class="chat-send" @click="sendStream">发送</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { chatApi } from '@/api'
const userStore = useUserStore()
const isLogin = computed(() => userStore.isLogin && userStore.checkLoginValid())
const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['update:visible'])

const input = ref('')
const messages = ref([
  {
    role: 'ai',
    text: '你好，我是AI助手，有什么可以帮您？',
  },
])

// 新增状态
const showHistoryPanel = ref(false)
const chatHistory = ref([])
const currentSessionId = ref(null)
const currentChatTitle = ref('新对话')

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      input.value = ''
      showHistoryPanel.value = false
    } else {
      // 当对话框打开时，检查登录状态并加载历史记录
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({
          title: '请先登录后使用AI功能',
          icon: 'none',
          duration: 2000,
        })
        return
      }
      loadChatHistory()
    }
  }
)

function close() {
  emit('update:visible', false)
}

// 显示历史记录面板
function showHistory() {
  showHistoryPanel.value = true
  loadChatHistory()
}

// 隐藏历史记录面板
function hideHistory() {
  showHistoryPanel.value = false
}

// 加载聊天历史
async function loadChatHistory() {
  // 检查是否已登录
  const token = uni.getStorageSync('token')
  if (!token) {
    console.log('用户未登录，跳过加载聊天历史')
    return
  }

  try {
    const history = await chatApi.getChatHistory()
    chatHistory.value = history || []
  } catch (error) {
    console.error('加载聊天历史失败:', error)
    // 如果是认证错误，不显示模拟数据
    if (error.message && error.message.includes('401')) {
      console.log('用户未登录或登录已过期')
      return
    }
  }
}

// 加载指定聊天
async function loadChat(sessionId) {
  // 检查是否已登录
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  try {
    currentSessionId.value = sessionId
    const chatData = await chatApi.getChatMessages(sessionId)
    if (chatData && chatData.messages) {
      // 转换消息格式
      messages.value = chatData.messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'ai',
        text: msg.content,
      }))
      currentChatTitle.value = chatData.title || '历史对话'
    }
    showHistoryPanel.value = false
  } catch (error) {
    console.error('加载聊天记录失败:', error)
    // 如果是认证错误，显示提示
    if (error.message && error.message.includes('401')) {
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
      })
      return
    }
    // 如果接口不存在，使用模拟数据
    messages.value = [
      {
        role: 'ai',
        text: '你好，我是AI助手，有什么可以帮您？',
      },
      {
        role: 'user',
        text: '这是历史对话内容',
      },
      {
        role: 'ai',
        text: '我看到了历史对话，有什么需要继续讨论的吗？',
      },
    ]
    currentChatTitle.value = '历史对话'
    showHistoryPanel.value = false
  }
}

// 创建新聊天
async function createNewChat() {
  try {
    currentSessionId.value = null
    messages.value = [
      {
        role: 'ai',
        text: '你好，我是AI助手，有什么可以帮您？',
      },
    ]
    currentChatTitle.value = '新对话'
    showHistoryPanel.value = false
  } catch (error) {
    console.error('创建新聊天失败:', error)
    // 如果接口不存在，使用模拟数据
    currentSessionId.value = null
    messages.value = [
      {
        role: 'ai',
        text: '你好，我是AI助手，有什么可以帮您？',
      },
    ]
    currentChatTitle.value = '新对话'
    showHistoryPanel.value = false
  }
}

// 格式化时间
function formatTime(timeString) {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) {
    // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

async function send() {
  if (!input.value.trim()) return

  // 检查是否已登录
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  // 先 push 用户消息
  messages.value.push({
    role: 'user',
    text: input.value,
  })
  // push AI loading 占位
  messages.value.push({
    role: 'ai',
    text: 'AI正在思考...',
  })

  // 转换消息格式为API需要的格式
  const apiMessages = messages.value
    .filter((msg) => msg.role !== 'ai' || msg.text !== 'AI正在思考...')
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }))

  try {
    const aiRes = await chatApi.chatWithAI(apiMessages, {
      sessionId: currentSessionId.value,
    })

    // 更新会话ID（如果是新会话）
    if (aiRes.sessionId && !currentSessionId.value) {
      currentSessionId.value = aiRes.sessionId
      // 如果是新会话，重新加载历史记录
      loadChatHistory()
    }

    // 正确解析 content
    let aiContent = 'AI无回复'
    if (aiRes.choices && aiRes.choices.length > 0) {
      aiContent = aiRes.choices[0].message?.content || 'AI无回复'
    } else if (aiRes.content) {
      // 兼容旧的响应格式
      aiContent = aiRes.content
    }

    // 替换最后一条 loading
    const idx = messages.value.findIndex(
      (msg, i) =>
        msg.role === 'ai' &&
        msg.text === 'AI正在思考...' &&
        i === messages.value.length - 1
    )
    if (idx !== -1) {
      messages.value[idx].text = aiContent
    }
  } catch (e) {
    // 失败时也替换 loading
    const idx = messages.value.findIndex(
      (msg, i) =>
        msg.role === 'ai' &&
        msg.text === 'AI正在思考...' &&
        i === messages.value.length - 1
    )
    if (idx !== -1) {
      // 检查是否是认证错误
      if (e.message && e.message.includes('401')) {
        messages.value[idx].text = '请先登录'
        uni.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none',
        })
      } else {
        messages.value[idx].text = 'AI接口请求失败'
      }
    }
    console.error('AI接口请求失败', e)
  }
  input.value = ''
}
async function sendStream() {
  if (!input.value.trim()) return
  // 检查是否已登录
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  messages.value.push({ role: 'user', text: input.value }) //消息推入队列
  messages.value.push({ role: 'ai', text: 'AI正在思考...' }) // 先插入AI占位
  input.value = ''
  console.log(`API请求:chatWithAIStream`, messages.value, token)
  const apiMessages = messages.value
    .filter((msg, i) => !(msg.role === 'ai' && i === messages.value.length - 1))
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }))

  let aiContent = ''
  try {
    await chatApi.chatWithAIStream(
      apiMessages,
      { sessionId: currentSessionId.value },
      (fullContent, delta) => {
        aiContent = fullContent
        // 实时更新最后一条AI消息
        messages.value[messages.value.length - 1].text = aiContent
      }
    )
    console.log(aiContent)
  } catch (e) {
    messages.value[messages.value.length - 1].text = 'AI接口请求失败'
    console.error('chatWithAIStream error:', e)
  }
  input.value = ''
}
// 删除会话
async function deleteSession(sessionId) {
  // 检查是否已登录
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  // 显示确认对话框
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个会话吗？删除后无法恢复。',
    success: async (res) => {
      if (res.confirm) {
        try {
          await chatApi.deleteChat(sessionId)

          // 如果删除的是当前会话，清空当前会话
          if (currentSessionId.value === sessionId) {
            currentSessionId.value = null
            messages.value = [
              {
                role: 'ai',
                text: '你好，我是AI助手，有什么可以帮您？',
              },
            ]
            currentChatTitle.value = '新对话'
          }

          // 删除成功后，重新加载历史记录
          loadChatHistory()

          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
        } catch (error) {
          console.error('删除会话失败:', error)
          // 如果是认证错误，显示提示
          if (error.message && error.message.includes('401')) {
            uni.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none',
            })
          } else {
            uni.showToast({
              title: '删除失败',
              icon: 'none',
            })
          }
        }
      }
    },
  })
}

// 编辑标题功能
function editTitle() {
  // 检查是否已登录
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  if (!currentSessionId.value) {
    uni.showToast({
      title: '新对话无法编辑标题',
      icon: 'none',
    })
    return
  }

  uni.showModal({
    title: '编辑标题',
    editable: true,
    placeholderText: '请输入新的标题',
    content: currentChatTitle.value,
    success: async (res) => {
      if (res.confirm && res.content.trim()) {
        try {
          await chatApi.updateSessionTitle(
            currentSessionId.value,
            res.content.trim()
          )
          currentChatTitle.value = res.content.trim()
          // 重新加载历史记录以更新标题
          loadChatHistory()

          uni.showToast({
            title: '标题更新成功',
            icon: 'success',
          })
        } catch (error) {
          console.error('更新标题失败:', error)
          // 如果是认证错误，显示提示
          if (error.message && error.message.includes('401')) {
            uni.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none',
            })
          } else {
            uni.showToast({
              title: '更新标题失败',
              icon: 'none',
            })
          }
        }
      }
    },
  })
}
</script>

<style scoped lang="scss">
.chat-dialog {
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
/* #ifdef H5 */
  /* H5端专属样式，比如最大高度、滚动优化等 */
  max-height: 85vh;
  background-color: red;
/* #endif */
  .chat-header {
    padding: 32rpx;
    font-weight: bold;
    /* border-bottom: 2rpx solid #eee; */
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
  }

  .chat-header-left {
    display: flex;
    gap: 32rpx;
  }

  .chat-btn {
    width: 80rpx;
    height: 80rpx;
    border: none;
    border-radius: 50%;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
    box-shadow: none;
    padding: 0;
  }

  .chat-btn:hover {
    background: #e0e0e0;
  }

  .chat-history-btn .historyImg {
    width: 44rpx;
    height: 44rpx;
    display: block;
  }

  .chat-new-btn .chat-btn-icon {
    font-size: 22px;
    font-weight: bold;
    display: block;
    line-height: 1;
  }

  .chat-title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    color: #333;
    cursor: pointer;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    transition: all 0.2s ease;
  }

  .chat-title:hover {
    background: #f5f5f5;
  }
}

/* 历史记录面板样式 */
.chat-history-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  z-index: 10;
  display: flex;
  flex-direction: column;
  border-radius: 18px 18px 0 0;
}

.history-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 18px 18px 0 0;
}

.history-header span {
  font-weight: bold;
  color: #333;
}

.history-close {
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.history-close:hover {
  color: #666;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.history-item {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item:hover {
  background: #f5f5f5;
}

.history-item.active {
  background: #e3f2fd;
  border-color: #f28500;
}

.history-item-content {
  flex: 1;
  cursor: pointer;
}

.history-item-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
}

.history-item-time {
  font-size: 12px;
  color: #999;
}

.history-item-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.del-icon {
  width: 32rpx;
  height: 32rpx;
  display: block;
  border: none;
  background-color: #fff;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16rpx;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.chat-message-row {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 8px;
}

.chat-message {
  position: relative;
  padding: 10px 16px;
  border-radius: 16px;
  max-width: 70%;
  font-size: 24rpx;
  background: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  word-break: break-all;
}

.chat-message.user {
  background: #f28500;
  color: #fff;
  align-self: flex-end;
  margin-left: auto;
  position: relative;
}

.chat-message.user::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid #f28500;
}

.chat-message.ai {
  background: #fff;
  color: #333;
  align-self: flex-start;
  margin-right: auto;
  position: relative;
}

.chat-message.ai::after {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #fff;
}

.chat-footer {
  display: flex;
  padding: 24rpx 32rpx;
  background: #fff;
}

.chat-input {
  flex: 1;
  border: 2rpx solid #ddd;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  height: 64rpx;
  background: #fff;
}

.chat-send {
  margin-left: 20rpx;
  background: #f28500;
  color: #fff;
  border: none;
  border-radius: 36rpx;
  padding: 0 36rpx;
  font-size: 28rpx;
  cursor: pointer;
  height: 64rpx;
  line-height: 64rpx;
}

.create-chat-img {
  width: 44rpx;
  height: 44rpx;
  display: block;
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

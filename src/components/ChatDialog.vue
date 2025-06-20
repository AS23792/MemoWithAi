<template>
  <div v-if="visible" class="chat-dialog-mask">
    <div class="chat-dialog">
      <div class="chat-header">
        <div class="chat-header-left">
          <button
            class="chat-btn chat-history-btn"
            @click="showHistory"
            title="历史记录"
          >
            <span class="chat-btn-icon">📋</span>
          </button>
          <button
            class="chat-btn chat-new-btn"
            @click="createNewChat"
            title="新建聊天"
          >
            <span class="chat-btn-icon">➕</span>
          </button>
        </div>
        <span class="chat-title" @click="editTitle">{{
          currentChatTitle
        }}</span>
        <span class="chat-close" @click="close">×</span>
      </div>

      <!-- 历史记录侧边栏 -->
      <div v-if="showHistoryPanel" class="chat-history-panel">
        <div class="history-header">
          <span>聊天历史</span>
          <span class="history-close" @click="hideHistory">×</span>
        </div>
        <div class="history-list">
          <div
            v-for="chat in chatHistory"
            :key="chat._id"
            class="history-item"
            :class="{ active: currentSessionId === chat._id }"
          >
            <div class="history-item-content" @click="loadChat(chat._id)">
              <div class="history-item-title">{{ chat.title || '新对话' }}</div>
              <div class="history-item-time">
                {{ formatTime(chat.updateTime) }}
              </div>
            </div>
            <div class="history-item-actions">
              <button
                class="delete-btn"
                @click.stop="deleteSession(chat._id)"
                title="删除会话"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-body">
        <div v-for="(msg, idx) in messages" :key="idx" class="chat-message-row">
          <div class="chat-message" :class="msg.role">
            <span>{{ msg.role === 'user' ? '我' : 'AI' }}：</span>{{ msg.text }}
          </div>
        </div>
      </div>
      <div class="chat-footer">
        <input
          v-model="input"
          class="chat-input"
          placeholder="请输入内容..."
          @keyup.enter="send"
        />
        <button class="chat-send" @click="send">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue'
import { chatApi } from '@/api'

const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['update:visible'])

const input = ref('')
const messages = ref([
  { role: 'ai', text: '你好，我是AI助手，有什么可以帮您？' },
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
      { role: 'ai', text: '你好，我是AI助手，有什么可以帮您？' },
      { role: 'user', text: '这是历史对话内容' },
      { role: 'ai', text: '我看到了历史对话，有什么需要继续讨论的吗？' },
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
      { role: 'ai', text: '你好，我是AI助手，有什么可以帮您？' },
    ]
    currentChatTitle.value = '新对话'
    showHistoryPanel.value = false
  } catch (error) {
    console.error('创建新聊天失败:', error)
    // 如果接口不存在，使用模拟数据
    currentSessionId.value = null
    messages.value = [
      { role: 'ai', text: '你好，我是AI助手，有什么可以帮您？' },
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
  messages.value.push({ role: 'user', text: input.value })
  // push AI loading 占位
  messages.value.push({ role: 'ai', text: 'AI正在思考...' })

  // 转换消息格式为API需要的格式
  const apiMessages = messages.value
    .filter((msg) => msg.role !== 'ai' || msg.text !== 'AI正在思考...')
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }))

  try {
    const aiRes = await chatApi.chatAboutHistpryApi(apiMessages, {
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
              { role: 'ai', text: '你好，我是AI助手，有什么可以帮您？' },
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

<style scoped>
.chat-dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.chat-dialog {
  width: 90vw;
  max-width: 480px;
  background: #fff;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.08);
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 85vh;
  max-height: 90vh;
  position: relative;
}
.chat-header {
  padding: 16px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}
.chat-header-left {
  display: flex;
  gap: 8px;
}
.chat-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.chat-btn:hover {
  background: #e0e0e0;
}
.chat-btn-icon {
  font-size: 16px;
}
.chat-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.chat-title:hover {
  background: #f5f5f5;
}
.chat-close {
  font-size: 22px;
  cursor: pointer;
  color: #999;
}
.chat-close:hover {
  color: #666;
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
  border-bottom: 1px solid #eee;
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
  border-color: #2196f3;
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
.delete-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #999;
  margin-left: 8px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.delete-btn:hover {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
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
  background: #8687fd;
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
  border-left: 8px solid #8687fd;
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
  border-top: 2rpx solid #eee;
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
  background: #8687fd;
  color: #fff;
  border: none;
  border-radius: 36rpx;
  padding: 0 36rpx;
  font-size: 28rpx;
  cursor: pointer;
  height: 64rpx;
  line-height: 64rpx;
}
</style>

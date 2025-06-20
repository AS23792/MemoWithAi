<template>
	<view class="detail-container">
		<view class="memo-card">
			<!-- 返回按钮 -->
			<view class="back-btn" @click="goBack">
				<text class="back-icon">←</text>
			</view>

			<!-- 右上角删除按钮 - 改为垃圾桶图标 -->
			<view class="delete-btn" @click="deleteMemo">
				<text class="delete-icon">🗑️</text>
			</view>

			<!-- 备忘录标题 - 改为可编辑 -->
			<view class="memo-title">
				<input class="title-input" v-model="memo.title" placeholder="请输入标题" maxlength="50"
					placeholder-class="placeholder" type="text" />
			</view>

			<!-- 备忘录内容 - 改为可编辑 -->
			<view class="memo-content">
				<textarea class="content-textarea" v-model="memo.content" placeholder="请输入内容" maxlength="2000"
					placeholder-class="placeholder" auto-height cursor-spacing="20" show-confirm-bar="false" />
			</view>

			<!-- 保存按钮 -->
			<view class="save-btn" @click="saveMemo">
				<text class="save-text">保存</text>
			</view>
		</view>
	</view>
	<!-- AI悬浮圈组件，放在根节点下，确保 fixed 定位生效 -->
	<AIFloatButton :bottom="80" :right="40" @click="showAIFloatWindow" />
	<ChatDialog v-model:visible="showChatDialog" />
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import {
		memoApi
	} from '../../api/index'
	import AIFloatButton from '../../components/AIFloatButton.vue'
	import ChatDialog from '../../components/ChatDialog.vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'

	// 备忘录数据
	const memo = ref({
		id: null,
		title: '',
		content: '',
	})

	// 状态变量
	const loading = ref(false)
	const saving = ref(false)
	const deleting = ref(false)
	const errorMessage = ref('')
	const showChatDialog = ref(false)

	onLoad((options) => {
		console.log('备忘录页面参数:', options)
		if (options && options.id) {
			const memoId = options.id
			fetchMemoDetail(memoId)
			console.log('获取备忘录ID:', memoId)
		} else {
			uni.showToast({
				title: '缺少备忘录id参数',
				icon: 'none'
			})
			setTimeout(() => {
				goBack()
			}, 1500)
		}
	})
	// 获取备忘录详情数据
	const fetchMemoDetail = async (id) => {
		try {
			loading.value = true
			errorMessage.value = ''

			// 调用API获取备忘录详情
			const data = await memoApi.getDetail(id)

			// 更新备忘录数据
			memo.value = data || {
				id: null,
				title: '',
				content: '',
			}

			console.log('获取到备忘录数据:', memo.value)
		} catch (error) {
			errorMessage.value = error.message || '获取备忘录详情失败'
			uni.showToast({
				title: errorMessage.value,
				icon: 'none',
			})

			// 如果是未授权错误或资源不存在，返回上一页
			if (error.code === 401 || error.code === 404) {
				setTimeout(() => {
					goBack()
				}, 1500)
			}
		} finally {
			loading.value = false
		}
	}

	// 删除备忘录
	const deleteMemo = async () => {
		if (deleting.value) return

		uni.showModal({
			title: '提示',
			content: '确定要删除这条备忘录吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						deleting.value = true
						console.log('用户点击确定，执行删除操作')

						// 调用API删除备忘录
						await memoApi.delete(memo.value.id)

						uni.showToast({
							title: '删除成功',
							icon: 'success',
							success: () => {
								// 触发页面刷新事件
								uni.$emit('pageShow')

								setTimeout(() => {
									uni.navigateBack({
										success: () => {
											console.log('成功返回备忘录列表')
										},
										fail: (err) => {
											console.error('返回失败:', err)
											// 备用方式：直接跳转到列表页面
											uni.redirectTo({
												url: '/pages/memo/index',
												fail: (
													redirectErr
													) => {
													console
														.error(
															'跳转失败:',
															redirectErr
														)
												},
											})
										},
									})
								}, 800) // 缩短到800ms
							},
						})
					} catch (error) {
						errorMessage.value = error.message || '删除备忘录失败'
						uni.showToast({
							title: errorMessage.value,
							icon: 'none',
						})
					} finally {
						deleting.value = false
					}
				} else {
					console.log('用户点击取消')
				}
			},
		})
	}

	// 保存备忘录
	const saveMemo = async () => {
		if (saving.value) return

		// 表单验证
		if (!memo.value.title.trim()) {
			uni.showToast({
				title: '请输入标题',
				icon: 'none',
			})
			return
		}

		if (!memo.value.content.trim()) {
			uni.showToast({
				title: '请输入内容',
				icon: 'none',
			})
			return
		}

		try {
			saving.value = true
			console.log('保存备忘录:', memo.value)

			// 调用API更新备忘录
			await memoApi.update(memo.value.id, memo.value.title, memo.value.content)

			uni.showToast({
				title: '保存成功',
				icon: 'success',
				success: () => {
					// 触发页面刷新事件
					uni.$emit('pageShow')

					setTimeout(() => {
						uni.navigateBack({
							success: () => {
								console.log('成功返回备忘录列表')
							},
							fail: (err) => {
								console.error('返回失败:', err)
								// 备用方式：直接跳转到列表页面
								uni.redirectTo({
									url: '/pages/memo/index',
									fail: (redirectErr) => {
										console.error('跳转失败:',
											redirectErr)
									},
								})
							},
						})
					}, 800) // 缩短到800ms
				},
			})
		} catch (error) {
			errorMessage.value = error.message || '保存备忘录失败'
			uni.showToast({
				title: errorMessage.value,
				icon: 'none',
			})
		} finally {
			saving.value = false
		}
	}

	// 返回上一页
	const goBack = () => {
		uni.navigateBack()
	}

	const showAIFloatWindow = () => {
		showChatDialog.value = true
	}
</script>

<style lang="scss">
	page {
		background-color: #b5c3ff;
		/* 与首页背景色保持一致 */
	}

	.detail-container {
		padding: 30rpx;
		min-height: 100vh;
		display: flex;
		margin-top: 110rpx;
		justify-content: center;
		align-items: flex-start;
		box-sizing: border-box;
	}

	.memo-card {
		width: 100%;
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		position: relative;
		min-height: 85vh;
		/* 让卡片占据大部分屏幕高度 */
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.back-btn {
		position: absolute;
		top: 20rpx;
		left: 20rpx;
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		border: 2rpx solid #333;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
		z-index: 10;
	}

	.back-icon {
		font-size: 36rpx;
		line-height: 1;
		color: #333;
	}

	.delete-btn {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		border: 2rpx solid #333;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
		z-index: 10;
	}

	.delete-icon {
		font-size: 28rpx;
		line-height: 1;
		color: #333;
	}

	.memo-title {
		margin-bottom: 30rpx;
		padding: 0 60rpx;
		/* 为左右两侧的按钮留出空间 */
		margin-top: 70rpx;
		/* 为顶部的按钮留出空间 */
		width: 100%;
		box-sizing: border-box;
	}

	.title-input {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		width: 100%;
		text-align: center;
		border: none;
	}

	.memo-content {
		flex: 1;
		overflow: hidden;
		margin-top: 30rpx;
		padding: 0 20rpx;
		margin-bottom: 120rpx;
		/* 为底部保存按钮留出空间 */
		width: 100%;
		box-sizing: border-box;
	}

	.content-textarea {
		font-size: 30rpx;
		color: #666;
		line-height: 1.8;
		width: 100%;
		min-height: 400rpx;
		padding: 0;
		border: none;
		box-sizing: border-box;
	}

	.placeholder {
		color: #999;
		font-size: 30rpx;
	}

	.save-btn {
		width: 240rpx;
		height: 80rpx;
		background-color: #8687fd;
		color: white;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: auto auto 40rpx auto;
		margin-top: auto;
		/* 将按钮推到底部 */
		box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
	}

	.save-text {
		font-size: 32rpx;
		font-weight: bold;
	}
</style>
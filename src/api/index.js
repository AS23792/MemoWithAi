// API基础URL
// const BASE_URL = 'https://ekrlspkbrykg.sealosbja.site/api';//生产环境接口
const BASE_URL = 'https://xubapwweknjk.sealosbja.site/api'; //开发环境接口
// 获取存储的token
const getToken = () => {
	return uni.getStorageSync('token');
};

// 封装请求方法
const request = async (url, method = 'GET', data = null) => {
	const headers = {
		'Content-Type': 'application/json',
	};

	// 如果有token，添加到请求头
	const token = getToken();
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	// 为GET请求添加时间戳避免缓存，也可以保证每次请求都可以发送出去。
	let requestUrl = `${BASE_URL}${url}`;
	if (method === 'GET') {
		const separator = url.includes('?') ? '&' : '?';
		requestUrl += `${separator}_t=${Date.now()}`;
	}
	console.log(`API请求: ${method} ${requestUrl}`, data ? {
		data
	} : '');

	return new Promise((resolve, reject) => {
		uni.request({
			url: requestUrl,
			method,
			header: headers,
			data: data || {},
			success: (res) => {
				const result = res.data;
				console.log(`API响应: ${method} ${url}`, result);

				// 检查响应状态码
				if (res.statusCode === 200 || res.statusCode === 201) {
					// 如果响应数据包含 code 字段，按原有逻辑处理
					if (result && typeof result === 'object' && 'code' in result) {
						if (result.code === 200 || result.code === 201) {
							resolve(result.data);
						} else {
							const error = new Error(result.message || '请求失败');
							error.code = result.code;
							reject(error);
						}
					} else {
						// 后端node写的/chat/sessions 接口响应数据没有 code 字段，直接返回数据
						resolve(result);
					}
				} else {
					const error = new Error(result?.message || '请求失败');
					error.code = res.statusCode;
					reject(error);
				}
			},
			fail: (error) => {
				console.error('API请求错误:', error);
				reject(error);
			}
		});
	});
};

// 用户相关接口
export const userApi = {
	// 用户注册
	register: (username, password, confirmPassword) => {
		return request('/user/register', 'POST', {
			username,
			password,
			confirmPassword
		});
	},

	// 用户登录
	login: (username, password, remember = false) => {
		return request('/user/login', 'POST', {
			username,
			password,
			remember
		});
	}
};

// 备忘录相关接口
export const memoApi = {
	// 获取备忘录列表
	getList: (page = 1, pageSize = 10) => {
		return request(`/memo/list?page=${page}&pageSize=${pageSize}`);
	},

	// 获取备忘录详情
	getDetail: (id) => {
		return request(`/memo/detail/${id}`);
	},

	// 创建备忘录
	create: (title, content) => {
		return request('/memo/create', 'POST', {
			title,
			content
		});
	},

	// 更新备忘录
	update: (id, title, content) => {
		return request(`/memo/update/${id}`, 'PUT', {
			title,
			content
		});
	},

	// 删除备忘录
	delete: (id) => {
		return request(`/memo/delete/${id}`, 'DELETE');
	}
};

// 聊天相关接口
export const chatApi = {
	chatWithAI: (messages, options = {}) => {
		console.log('messages', messages)
		return new Promise((resolve, reject) => {
			// 获取token用于认证
			const token = getToken();
			const headers = {
				'Content-Type': 'application/json'
			};

			if (token) {
				headers['Authorization'] = `Bearer ${token}`;
			}

			uni.request({
				url: BASE_URL + '/chat', // BASE_URL 需为你的后端地址
				method: 'POST',
				header: headers,
				data: {
					messages,
					model: options.model || 'x1',
					sessionId: options.sessionId || null
				},
				success: (res) => {
					if (res.statusCode === 200) {
						// 检查是否有错误信息
						if (res.data.error) {
							reject(new Error(res.data.error));
						} else {
							resolve(res.data);
						}
					} else {
						reject(new Error(res.data?.error || '请求失败'));
					}
				},
				fail: (err) => {
					reject(err);
				}
			});
		});
	},
	// 获取聊天会话列表
	getChatHistory: () => {
		return request('/chat/sessions');
	},

	// 获取指定会话的详情
	getChatMessages: (sessionId) => {
		return request(`/chat/sessions/${sessionId}`);
	},

	// 更新会话标题
	updateSessionTitle: (sessionId, title) => {
		return request(`/chat/sessions/${sessionId}`, 'PUT', {
			title
		});
	},

	// 删除会话
	deleteChat: (sessionId) => {
		return request(`/chat/sessions/${sessionId}`, 'DELETE');
	}
};

export default {
	userApi,
	memoApi,
	chatApi
};
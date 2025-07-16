import { useUserStore } from '../store/user' // 新增

// API基础URL
const BASE_URL = 'https://ekrlspkbrykg.sealosbja.site/api';//生产环境接口
// const BASE_URL = 'https://xubapwweknjk.sealosbja.site/api'; //开发环境接口
// 获取存储的token
const getToken = () => {
    const userStore = useUserStore()
    return userStore.token || uni.getStorageSync('token');
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
    login: async (username, password, remember = false) => {
        const userStore = useUserStore()
        const data = await request('/user/login', 'POST', {
            username,
            password,
            remember
        });
        // 登录成功后，存储token到pinia和本地
        if (data && data.token) {
            userStore.setToken(data.token)
        }
        return data
    },

    logout: () => {
        const userStore = useUserStore()
        userStore.logout()
        uni.removeStorageSync('token')
        uni.removeStorageSync('loginTime')
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
function getWsUrl () {
    // BASE_URL 形如 https://xubapwweknjk.sealosbja.site/api
    let wsUrl = BASE_URL.replace(/^http/, 'ws'); // http/https => ws/wss
    // 去掉 /api
    wsUrl = wsUrl.replace(/\/api\/?$/, '');
    // 拼接 WebSocket 路径
    wsUrl += '/ws/chat';
    return wsUrl;
}
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
    // 流式
    chatWithAIStream: function (messages, options = {}, onProgress) {
        const wsUrl = getWsUrl();
        let fullContent = '';
        let sessionId = null;
        let wsClosed = false;
        const token = getToken(); // 你的 token 获取逻辑
        console.log(`API请求: stream ${wsUrl}`, messages)
        return new Promise((resolve, reject) => {
            let socketTask;

            // (typeof uni !== 'undefined' && typeof wx !== 'undefined' && wx.connectSocket)
            if (process.env.UNI_PLATFORM === 'mp-weixin') {
                // 小程序端
                socketTask = wx.connectSocket({
                    url: wsUrl,
                    header: token ? { 'Authorization': 'Bearer ' + token } : {}
                });
                socketTask.onOpen(() => {
                    socketTask.send({
                        data: JSON.stringify({
                            messages,
                            model: options.model || 'x1',
                            sessionId: options.sessionId || null
                        })
                    });
                });
                socketTask.onMessage((res) => {
                    let data;
                    try {
                        data = JSON.parse(res.data);
                    } catch (e) {
                        return;
                    }
                    if (data.error) {
                        reject(new Error(data.error));
                        socketTask.close();
                        wsClosed = true;
                        return;
                    }
                    if (data.content) {
                        fullContent += data.content;
                        if (onProgress) onProgress(fullContent, data.content);
                    }
                    if (data.sessionId) {
                        sessionId = data.sessionId;
                    }
                    if (data.done) {
                        wsClosed = true;
                        resolve({ content: fullContent, sessionId });
                        socketTask.close();
                    }
                });
                socketTask.onClose(() => {
                    if (!wsClosed) {
                        reject(new Error('WebSocket连接被关闭'));
                    }
                });
                socketTask.onError((err) => {
                    reject(err);
                    socketTask.close();
                });
            } else if (process.env.UNI_PLATFORM === 'app' || process.env.UNI_PLATFORM === 'app-plus') {
                //app
                console.log('app发送请求')
                uni.connectSocket({
                    url: wsUrl,
                    header: token ? { 'Authorization': 'Bearer ' + token } : {}
                });
                console.log('socketTask', socketTask);

                uni.onSocketOpen(() => {
                    console.log('WebSocket已连接');
                    uni.sendSocketMessage({
                        data: JSON.stringify({
                            messages,
                            model: options.model || 'x1',
                            sessionId: options.sessionId || null
                        })
                    });
                });
                uni.onSocketMessage((res) => {
                    let data;
                    try {
                        data = JSON.parse(res.data);
                    } catch (e) {
                        return;
                    }
                    if (data.error) {
                        reject(new Error(data.error));
                        uni.closeSocket();
                        wsClosed = true;
                        return;
                    }
                    if (data.content) {
                        fullContent += data.content;
                        if (onProgress) onProgress(fullContent, data.content);
                    }
                    if (data.sessionId) {
                        sessionId = data.sessionId;
                    }
                    if (data.done) {
                        wsClosed = true;
                        resolve({ content: fullContent, sessionId });
                        uni.closeSocket();
                    }
                });
                uni.onSocketClose(() => {
                    if (!wsClosed) {
                        reject(new Error('WebSocket连接被关闭'));
                    }
                });
                uni.onSocketError((err) => {
                    reject(err);
                    uni.closeSocket();
                });
            }
            else if (process.env.UNI_PLATFORM === 'h5') {
                // H5/Web
                let wsUrlWithToken = wsUrl;
                if (token) {
                    wsUrlWithToken += (wsUrl.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token);
                }
                socketTask = new WebSocket(wsUrlWithToken);
                socketTask.onopen = () => {
                    socketTask.send(JSON.stringify({
                        messages,
                        model: options.model || 'x1',
                        sessionId: options.sessionId || null
                    }));
                };
                socketTask.onmessage = (event) => {
                    let data;
                    try {
                        data = JSON.parse(event.data);
                    } catch (e) {
                        return;
                    }
                    if (data.error) {
                        reject(new Error(data.error));
                        socketTask.close();
                        wsClosed = true;
                        return;
                    }
                    if (data.content) {
                        fullContent += data.content;
                        if (onProgress) onProgress(fullContent, data.content);
                    }
                    if (data.sessionId) {
                        sessionId = data.sessionId;
                    }
                    if (data.done) {
                        wsClosed = true;
                        resolve({ content: fullContent, sessionId });
                        socketTask.close();
                    }
                };
                socketTask.onclose = () => {
                    if (!wsClosed) {
                        reject(new Error('WebSocket连接被关闭'));
                    }
                };
                socketTask.onerror = (err) => {
                    reject(err);
                    socketTask.close();
                };
            }

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

// 微信授权相关接口
export const authApi = {
    // 小程序端：微信授权登录
    wxMpLogin: (code) => {
        return request('/auth/wx/mp-login', 'POST', { code });
    },

};

export default {
    userApi,
    memoApi,
    chatApi,
    authApi
};
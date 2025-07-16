// filepath: /Users/cqq/code/my-vue3-project/src/store/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: uni.getStorageSync('token') || '',
        loginTime: uni.getStorageSync('loginTime') || 0,
        avatar: '',
        nickname: '',
    }),
    getters: {
        isLogin: (state) => !!state.token,
    },
    actions: {
        setToken (token) {
            this.token = token
            uni.setStorageSync('token', token)
            this.loginTime = Date.now()
            uni.setStorageSync('loginTime', this.loginTime)
        },
        setUserInfo ({ avatar, nickname }) {
            this.avatar = avatar || ''
            this.nickname = nickname || ''
            uni.setStorageSync('user', {
                avatar: this.avatar,
                nickname: this.nickname
            })
        },
        logout () {
            this.token = ''
            this.loginTime = 0
            this.avatar = ''
            this.nickname = ''
            uni.removeStorageSync('token')
            uni.removeStorageSync('loginTime')
            uni.removeStorageSync('avatar')
            uni.removeStorageSync('nickname')
        },
        checkLoginValid () {
            if (!this.token || !this.loginTime) return false
            return Date.now() - this.loginTime < 30 * 24 * 60 * 60 * 1000
        }
    },
})
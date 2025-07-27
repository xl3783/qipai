import Taro from '@tarojs/taro'

// 简单的API调用函数
export const api = {
  // GET请求
  get: async (url, params = {}) => {
    try {
      const response = await Taro.request({
        url: url,
        method: 'GET',
        data: params
      })
      return response.data
    } catch (error) {
      console.error('API GET Error:', error)
      throw error
    }
  },

  // POST请求
  post: async (url, data = {}) => {
    try {
      const response = await Taro.request({
        url: url,
        method: 'POST',
        data: data
      })
      return response.data
    } catch (error) {
      console.error('API POST Error:', error)
      throw error
    }
  },

  // 微信登录
  wxLogin: async () => {
    try {
      // 获取登录码
      const res = await Taro.login()
      
      // 调用后端API
      const response = await Taro.request({
        url: 'http://localhost:3000/api/wechat-login',
        method: 'POST',
        data: { code: res.code }
      })
      
      return response.data
    } catch (error) {
      console.error('微信登录失败:', error)
      throw error
    }
  }
} 
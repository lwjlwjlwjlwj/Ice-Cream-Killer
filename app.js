// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 初始化云开发
    wx.cloud.init({
      env: 'products-5gs24fnrd8e814c6', // 替换为您的环境 ID
      traceUser: false // 是否在将用户访问记录到用户管理中，在控制台中可见
    });
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})

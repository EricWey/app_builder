App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'your-env-id', // 替换为实际环境ID
      traceUser: true
    })

  },
  
  globalData: {
    db: null, // 将在onLaunch后初始化
    userInfo: null
  }
})
Page({
  data: {
    globalReminderEnabled: true,
    timeOptions: ['不提醒', '15分钟', '30分钟', '1小时', '2小时', '1天', '2天'],
    homeworkReminderIndex: 5, // 默认提前1天
    activityReminderIndex: 3 // 默认提前2小时
  },

  onLoad() {
    // 实际开发中应从缓存或数据库加载用户设置
    this.loadSettings()
  },

  loadSettings() {
    // 模拟加载设置
    const settings = wx.getStorageSync('reminderSettings') || {}
    this.setData({
      globalReminderEnabled: settings.globalEnabled !== false,
      homeworkReminderIndex: settings.homeworkIndex || 5,
      activityReminderIndex: settings.activityIndex || 3
    })
  },

  toggleGlobalReminder(e) {
    this.setData({
      globalReminderEnabled: e.detail.value
    })
  },

  changeHomeworkReminder(e) {
    this.setData({
      homeworkReminderIndex: e.detail.value
    })
  },

  changeActivityReminder(e) {
    this.setData({
      activityReminderIndex: e.detail.value
    })
  },

  saveSettings() {
    const settings = {
      globalEnabled: this.data.globalReminderEnabled,
      homeworkIndex: this.data.homeworkReminderIndex,
      activityIndex: this.data.activityReminderIndex
    }
    
    wx.setStorageSync('reminderSettings', settings)
    wx.showToast({
      title: '设置已保存',
      icon: 'success'
    })
    
    // 实际开发中这里应该同步到云端
  }
})
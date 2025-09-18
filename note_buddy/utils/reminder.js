// 提醒服务工具函数
const ReminderService = {
  // 初始化订阅消息
  initSubscription() {
    const tmplIds = [
      'TEMPLATE_ID_HOMEWORK', // 作业提醒模板
      'TEMPLATE_ID_ACTIVITY'  // 活动提醒模板
    ]
    
    return new Promise((resolve, reject) => {
      wx.requestSubscribeMessage({
        tmplIds,
        success: (res) => {
          if (res.errMsg === 'requestSubscribeMessage:ok') {
            console.log('订阅消息授权成功', res)
            this.log('订阅消息授权成功', tmplIds)
            resolve(res)
          } else {
            const err = new Error('订阅消息授权失败')
            this.logError('订阅消息授权失败', res)
            reject(err)
          }
        },
        fail: (err) => {
          this.logError('订阅消息授权失败', err)
          reject(err)
        }
      })
    })
  },

  // 设置作业提醒
  setHomeworkReminder(notification) {
    if (!notification.dueDate) return
    
    const reminderTime = this.calculateReminderTime(
      notification.dueDate, 
      this.getHomeworkReminderOffset()
    )
    
    this.scheduleReminder({
      title: `作业提醒: ${notification.subject}`,
      content: notification.content,
      time: reminderTime
    })
  },

  // 设置活动提醒
  setActivityReminder(notification) {
    if (!notification.eventTime) return
    
    const reminderTime = this.calculateReminderTime(
      notification.eventTime,
      this.getActivityReminderOffset()
    )
    
    this.scheduleReminder({
      title: `活动提醒: ${notification.eventName}`,
      content: `地点: ${notification.location}`,
      time: reminderTime
    })
  },

  // 计算提醒时间（增强版）
  calculateReminderTime(baseTime, offset) {
    if (!baseTime) return null
    
    // 支持字符串和Date对象
    const baseDate = new Date(baseTime)
    if (isNaN(baseDate.getTime())) {
      this.logError('无效的时间格式', baseTime)
      return null
    }

    // 精确计算提醒时间（考虑时区）
    const reminderTime = new Date(baseDate.getTime() - offset * 60 * 1000)
    return reminderTime.toISOString()
  },

  // 获取作业提醒提前时间（分钟）
  getHomeworkReminderOffset() {
    try {
      const settings = wx.getStorageSync('reminderSettings') || {}
      const offsets = [0, 15, 30, 60, 120, 1440, 2880] // 分钟
      return offsets[settings.homeworkIndex || 5] // 默认1天
    } catch (err) {
      this.logError('获取作业提醒设置失败', err)
      return 1440 // 默认1天
    }
  },

  // 获取活动提醒提前时间（分钟）
  getActivityReminderOffset() {
    try {
      const settings = wx.getStorageSync('reminderSettings') || {}
      const offsets = [0, 15, 30, 60, 120, 1440, 2880] // 分钟
      return offsets[settings.activityIndex || 3] // 默认2小时
    } catch (err) {
      this.logError('获取活动提醒设置失败', err)
      return 120 // 默认2小时
    }
  },

  // 云函数调度提醒
  async scheduleReminder({title, content, time, type}) {
    if (!time) return false
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'scheduleReminder',
        data: {
          title,
          content,
          remind_time: time,
          type,
          openid: wx.getStorageSync('openid')
        }
      })
      
      this.log('提醒设置成功', {title, time})
      return result.result
    } catch (err) {
      this.logError('提醒设置失败', err)
      return false
    }
  },
  // 日志记录
  log(message, data = {}) {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${message}`, data)
    // 实际开发中可以上报到日志服务
  },

  // 错误处理
  logError(message, error) {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] ${message}`, error)
    
    // 上报错误到监控系统
    wx.reportMonitor('REMINDER_ERROR', 1)
    
    // 显示用户友好的提示
    wx.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
  }
}

module.exports = ReminderService
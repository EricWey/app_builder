Page({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    weeks: ['日', '一', '二', '三', '四', '五', '六'],
    days: [],
    notifications: [],
    todayNotifications: [],
    selectedNotifications: [],
    selectedDate: null
  },

  async onLoad() {
    console.log('日历页面加载...')
    await this.loadNotifications()
    console.log('通知数据:', this.data.notifications)
    this.initCalendar()
    this.loadTodayNotifications()
    
    // 添加调试按钮
    this.setData({
      debug: true
    })
  },

  // 调试方法
  onDebugTap() {
    const fs = wx.getFileSystemManager()
    fs.readFile({
      filePath: `${wx.env.USER_DATA_PATH}/notifications/${this.data.year}-${this.data.month.toString().padStart(2,'0')}/notifications_${this.data.year}-${this.data.month.toString().padStart(2,'0')}-${new Date().getDate().toString().padStart(2,'0')}.json`,
      encoding: 'utf8',
      success: (res) => {
        wx.showModal({
          title: '调试信息',
          content: JSON.stringify(JSON.parse(res.data), null, 2),
          showCancel: false
        })
      }
    })
  },

  loadNotifications() {
    return new Promise((resolve) => {
      const fs = wx.getFileSystemManager()
      fs.readFile({
        filePath: `${wx.env.USER_DATA_PATH}/notifications.json`,
        encoding: 'utf8',
        success: (res) => {
          this.setData({
            notifications: JSON.parse(res.data) || []
          })
          resolve()
        },
        fail: () => {
          this.setData({ notifications: [] })
          resolve()
        }
      })
    })
  },

  initCalendar() {
    const { year, month } = this.data
    const days = []
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    
    // 填充空白格子
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ day: '', date: '', hasNotification: false })
    }
    
    // 填充日期格子
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = `${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`
      const isNotifDay = this.hasNotificationForDate(date)
      const notification = isNotifDay ? this.data.notifications.find(notif => notif.date === date) : null
      days.push({ 
        day: i, 
        date,
        subject: notification?.subject || '',
        content: notification?.content || '',
        hasNotification: isNotifDay,
        isToday: date === todayStr
      })
    }
    
    this.setData({ days: days })
  },

  hasNotificationForDate(date) {
    return this.data.notifications?.some(notif => notif.date === date) || false
  },

  loadTodayNotifications() {
    const todayStr = `${this.data.year}-${this.data.month.toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`
    const todayNotifs = this.data.days
      .filter(day => day.date === todayStr && day.hasNotification)
      .map(day => {
        const notification = this.data.notifications.find(n => n.date === day.date)
        return {
          id: day.date,
          subject: notification?.type || '通用',
          content: notification?.content || '今日通知'
        }
      })
    
    this.setData({
      todayNotifications: todayNotifs.length ? todayNotifs : [
        { id: 0, subject: '无通知', content: '今日没有待办事项' }
      ]
    })
  },

  onDayTap(e) {
    const { date } = e.currentTarget.dataset
    const selectedDay = this.data.days.find(day => day.date === date)
    
    const notifications = this.data.notifications?.filter(
      notif => notif.date === date
    ) || []
    
    if (notifications.length === 0) {
      wx.showToast({ title: '该日期没有通知', icon: 'none' })
      return
    }
    
    this.setData({
      selectedNotifications: notifications,
      selectedDate: date
    }, () => {
      console.log('日期选中更新完成:', this.data.selectedNotifications)
    })
  },
  
  onNotificationTap() {
    const selected = this.data.selectedNotifications
    if (!selected?.length) return
    
    // 传递所有选中通知的数据
    wx.navigateTo({
      url: `/pages/notification/detail`,
      events: {
        acceptData: (data) => {
          console.log('接收详情页返回数据:', data)
        }
      },
      success: (res) => {
        res.eventChannel.emit('sendData', {
          notifications: selected,
          selectedDate: this.data.selectedDate
        })
      }
    })
  },

  testCalendarRendering() {
    console.log('=== 日历渲染测试开始 ===')
    if (!this.data.days || this.data.days.length === 0) {
      console.error('错误: 日历数据未初始化')
      return
    }
    console.log(`当前显示: ${this.data.year}年${this.data.month}月`)
    console.log(`应显示天数: ${this.data.days.filter(day => day.day !== '').length}`)
    console.log(`今日高亮: ${this.data.days.find(day => day.isToday)?.date || '未找到今日日期'}`)
    console.log(`有通知的日期: ${this.data.days.filter(day => day.hasNotification).length}天`)
    console.log('=== 日历渲染测试完成 ===')
  },
  
  onReady() {
    this.testCalendarRendering()
  },

  navigateToAddNotification() {
    wx.navigateTo({
      url: '/pages/notification/add'
    })
  }
})

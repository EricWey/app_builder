Page({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    weeks: ['日', '一', '二', '三', '四', '五', '六'],
    days: [],
    todayNotifications: [],
    selectedNotifications: [],
    selectedDate: null
  },

  onLoad() {
    this.initCalendar()
    this.loadTodayNotifications()
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
      days.push({ 
        day: i, 
        date,
        subject: isNotifDay ? (date === '2025-09-15' ? '数学' : 
                              date === '2025-09-16' ? '学校' : 
                              date === '2025-09-17' ? '语文' : '通用') : '',
        content: isNotifDay ? (date === '2025-09-15' ? '完成练习册P23-24' : 
                              date === '2025-09-16' ? '下周三下午2点召开家长会' : 
                              date === '2025-09-17' ? '周五前提交体检表' : '') : '',
        hasNotification: isNotifDay,
        isToday: date === todayStr
      })
    }
    
    this.setData({ days: days })
  },

  hasNotificationForDate(date) {
    const mockDatesWithNotifications = [
      '2025-09-15',
      '2025-09-16', 
      '2025-09-17'
    ]
    return mockDatesWithNotifications.includes(date)
  },

  loadTodayNotifications() {
    const todayStr = `${this.data.year}-${this.data.month.toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`
    const todayNotifs = this.data.days
      .filter(day => day.date === todayStr && day.hasNotification)
      .map(day => ({
        id: day.date,
        subject: day.subject || '通用',
        content: day.content || '今日通知'
      }))
    
    this.setData({
      todayNotifications: todayNotifs.length ? todayNotifs : [
        { id: 0, subject: '无通知', content: '今日没有待办事项' }
      ]
    })
  },

  onDayTap(e) {
    const { date } = e.currentTarget.dataset
    const selectedDay = this.data.days.find(day => day.date === date)
    
    if (!selectedDay?.hasNotification) {
      wx.showToast({ title: '该日期没有通知', icon: 'none' })
      return
    }
    
    // 准备要传递的通知数据
    const notifications = Array.isArray(selectedDay.notifications) 
      ? selectedDay.notifications 
      : [{
          id: date,
          date,
          subject: selectedDay.subject,
          content: selectedDay.content
        }]
    
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

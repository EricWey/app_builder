Page({
  data: {
    searchText: '',
    filterOptions: ['全部', '作业', '任务', '活动'],
    filterIndex: 0,
    historyList: []
  },

  onLoad() {
    this.loadHistoryData()
  },

  loadHistoryData() {
    // 模拟数据
    const mockData = [
      {
        id: 1,
        type: '作业',
        subject: '数学',
        content: '完成练习册P23-24页，明天交',
        date: '2025-09-15',
        hasReminder: true
      },
      {
        id: 2,
        type: '活动',
        subject: '学校',
        content: '下周三下午2点召开家长会',
        date: '2025-09-16',
        hasReminder: false
      },
      {
        id: 3,
        type: '任务',
        subject: '语文',
        content: '周五前提交体检表',
        date: '2025-09-14',
        hasReminder: true
      }
    ]
    this.setData({ historyList: mockData })
  },

  onSearchInput(e) {
    this.setData({ searchText: e.detail.value })
    // 实际开发中这里应该触发搜索
  },

  onFilterChange(e) {
    this.setData({ filterIndex: e.detail.value })
    // 实际开发中这里应该触发筛选
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/notification/detail?id=${id}`
    })
  },

  onReuseTap(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.historyList.find(i => i.id === id)
    wx.navigateTo({
      url: `/pages/notification/add?reuse=${encodeURIComponent(JSON.stringify(item))}`
    })
  },

  // 实际开发中应从数据库加载提醒状态
  loadReminderStatus() {
    return Promise.resolve(this.data.historyList.map(item => ({
      ...item,
      hasReminder: Math.random() > 0.5 // 模拟数据
    })))
  }
})
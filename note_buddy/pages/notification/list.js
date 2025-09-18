import { noticeService } from '../../services/dbService'

Page({
  data: {
    notices: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadNotices()
  },

  // 加载通知列表
  loadNotices() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })
    
    // 查询最近3个月数据
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 3)

    noticeService.queryByDateRange(
      'date',
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      this.data.page,
      this.data.pageSize
    ).then(res => {
      const newNotices = res.data
      this.setData({
        notices: [...this.data.notices, ...newNotices],
        hasMore: newNotices.length >= this.data.pageSize,
        page: this.data.page + 1,
        loading: false
      })
    }).catch(err => {
      console.error('查询失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadNotices()
  },

  // 删除通知
  removeNotice(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条通知吗？',
      success: res => {
        if (res.confirm) {
          noticeService.remove(id)
            .then(() => {
              wx.showToast({ title: '删除成功' })
              this.setData({
                notices: this.data.notices.filter(item => item._id !== id)
              })
            })
            .catch(err => {
              console.error('删除失败:', err)
              wx.showToast({ title: '删除失败', icon: 'none' })
            })
        }
      }
    })
  }
})
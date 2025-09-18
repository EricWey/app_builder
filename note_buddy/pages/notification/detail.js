import { noticeService } from '../../services/dbService'

Page({
  data: {
    notice: null,
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.loadNoticeDetail(options.id)
    }
  },

  // 加载通知详情
  loadNoticeDetail(id) {
    this.setData({ loading: true })
    noticeService.query({
      where: { _id: id }
    }).then(res => {
      this.setData({
        notice: res.data[0] || null,
        loading: false
      })
    }).catch(err => {
      console.error('加载失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  // 编辑通知
  editNotice() {
    const { notice } = this.data
    wx.navigateTo({
      url: `/pages/notification/add?id=${notice._id}`,
    })
  },

  // 删除通知
  deleteNotice() {
    const { notice } = this.data
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条通知吗？',
      success: res => {
        if (res.confirm) {
          noticeService.remove(notice._id)
            .then(() => {
              wx.showToast({ title: '删除成功' })
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
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
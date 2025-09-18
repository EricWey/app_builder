import { noticeService } from '../../services/dbService'

Page({
  data: {
    categories: [
      { name: '语文', value: 'chinese' },
      { name: '数学', value: 'math' },
      { name: '英语', value: 'english' },
      { name: '班级通知', value: 'class' },
      { name: '校级通知', value: 'school' }
    ],
    currentCategory: {},
    showCustomInput: false,
    customCategory: '',
    selectedDate: '',
    content: '',
    noticeId: null,
    isEdit: false
  },

  onLoad(options) {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
    this.setData({ selectedDate: dateStr })

    if (options.id) {
      this.setData({ isEdit: true, noticeId: options.id })
      this.loadNoticeData(options.id)
    }
  },

  // 加载要编辑的通知
  loadNoticeData(id) {
    noticeService.query({ where: { _id: id } })
      .then(res => {
        const notice = res.data[0]
        if (notice) {
          this.setData({
            selectedDate: notice.date,
            content: notice.content,
            currentCategory: this.data.categories.find(cat => cat.name === notice.subject) || {}
          })
        }
      })
      .catch(err => {
        console.error('加载通知失败:', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  // ...保留其他方法...

  submitForm() {
    if (!this.data.content) {
      wx.showToast({ title: '请填写通知内容', icon: 'none' })
      return
    }

    const noticeData = {
      date: this.data.selectedDate,
      subject: this.data.showCustomInput ? this.data.customCategory : this.data.currentCategory.name,
      content: this.data.content
    }

    wx.showLoading({ title: '保存中...' })

    // 根据是否编辑状态调用不同方法
    const savePromise = this.data.isEdit 
      ? noticeService.update(this.data.noticeId, noticeData)
      : noticeService.add(noticeData)

    savePromise.then(res => {
      wx.hideLoading()
      wx.showToast({ title: this.data.isEdit ? '更新成功' : '保存成功' })
      
      // 更新本地数据
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.updateNoticeList) {
        prevPage.updateNoticeList()
      }

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }).catch(err => {
      wx.hideLoading()
      console.error('保存失败:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    })
  }
})
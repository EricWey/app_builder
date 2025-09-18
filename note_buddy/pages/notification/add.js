Page({
  data: {
    activeTab: 'manual',
    notificationTypes: ['语文', '数学', '英语', '班级通知', '校级通知'],
    selectedType: '',
    title: '',
    content: '',
    date: '',

    pasteContent: '',
    parsedContent: null,
    showParsedResult: false
  },

  onLoad() {
    const now = new Date()
    this.setData({
      date: `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    })
  },

  switchTab(e) {
    this.setData({
      activeTab: e.currentTarget.dataset.tab,
      showParsedResult: false
    })
  },

  onTypeChange(e) {
    this.setData({
      selectedType: this.data.notificationTypes[e.detail.value]
    })
  },

  showTitleInput() {
    wx.showModal({
      title: '输入通知标题',
      editable: true,
      placeholderText: '请输入通知标题',
      success: (res) => {
        if (res.confirm) {
          this.setData({ title: res.content })
        }
      }
    })
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },



  onPasteInput(e) {
    this.setData({ 
      pasteContent: e.detail.value,
      showParsedResult: false
    })
  },

  onParse() {
    if (!this.data.pasteContent.trim()) {
      wx.showToast({ title: '请粘贴需要解析的内容', icon: 'none' })
      return
    }
    
    // 模拟解析逻辑
    const parsed = {
      type: this.guessNotificationType(this.data.pasteContent),
      title: this.extractTitle(this.data.pasteContent),
      content: this.data.pasteContent,
      date: this.extractDate(this.data.pasteContent) || this.data.date
    }
    
    this.setData({
      parsedContent: parsed,
      showParsedResult: true
    })
  },

  useParsedResult() {
    if (!this.data.parsedContent) return
    
    this.setData({
      selectedType: this.data.parsedContent.type,
      title: this.data.parsedContent.title,
      content: this.data.parsedContent.content,
      date: this.data.parsedContent.date,
      showParsedResult: false
    })
  },

  onSubmit() {
    if (!this.data.selectedType) {
      wx.showToast({ title: '请选择通知类型', icon: 'none' })
      return
    }
    if (!this.data.title.trim()) {
      wx.showToast({ title: '请输入通知标题', icon: 'none' })
      return
    }

    const notification = {
      type: this.data.selectedType,
      title: this.data.title,
      content: this.data.content,
      date: this.data.date,
      createdAt: new Date().toISOString()
    }

    console.log('新通知:', notification)
    wx.showToast({ title: '通知已保存', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1500)
  },

  // 辅助方法
  guessNotificationType(content) {
    if (content.includes('数学') || content.includes('算术')) return '数学'
    if (content.includes('语文') || content.includes('作文')) return '语文'
    if (content.includes('英语') || content.includes('English')) return '英语'
    if (content.includes('班级') || content.includes('班')) return '班级通知'
    return '校级通知'
  },
  
  extractTitle(content) {
    const firstLine = content.split('\n')[0].trim()
    return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine
  },
  
  extractDate(content) {
    const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/)
    return dateMatch ? dateMatch[0] : null
  }
})
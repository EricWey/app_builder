Page({
  data: {
    showDebug: true, // 调试模式开关
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
    // 调试日志
    console.log('当前存储路径:', wx.env.USER_DATA_PATH)
    
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

  async onSubmit() {
    if (!this.data.selectedType) {
      wx.showToast({ title: '请选择通知类目', icon: 'none' })
      return
    }
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请输入通知内容', icon: 'none' })
      return
    }

    // 分步保存流程
    try {
      wx.showLoading({ 
        title: '正在准备数据...',
        mask: true
      })

      const notification = {
        id: Date.now(),
        type: this.data.selectedType,
        content: this.data.content,
        date: this.data.date,
        createdAt: new Date().toISOString()
      }

      // 第一步：验证数据
      wx.showLoading({ title: '正在验证数据...' })
      if (!notification.date || !notification.content) {
        throw new Error('通知数据不完整')
      }

      // 第二步：保存文件
      wx.showLoading({ title: '正在保存文件...' })
      try {
        await this.saveNotification(notification)
      } catch (err) {
        console.error('保存失败:', {
          error: err,
          notification: notification,
          time: new Date().toISOString()
        })
        throw err
      }

      // 第三步：刷新前一页
      wx.showLoading({ title: '正在更新页面...' })
      const pages = getCurrentPages()
      if (pages.length > 1) {
        const prevPage = pages[pages.length - 2]
        prevPage.onLoad && prevPage.onLoad()
      }

      // 完成提示
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500,
        success: () => setTimeout(() => wx.navigateBack(), 1500)
      })

    } catch (err) {
      console.error('保存流程出错:', err)
      wx.hideLoading()
      wx.showModal({
        title: '保存失败',
        content: err.message || '请检查网络后重试',
        showCancel: false
      })
    }
  },

  // 带重试的保存方法
  // 简化后的保存方法
  async saveNotification(notification) {
    return new Promise((resolve, reject) => {
      // 基础验证
      if (!notification.date || !notification.content) {
        return reject(new Error('通知数据不完整'))
      }

      const fs = wx.getFileSystemManager()
      const filePath = `${wx.env.USER_DATA_PATH}/notifications.json`

      // 读取或初始化通知列表
      fs.readFile({
        filePath,
        encoding: 'utf8',
        success: (res) => {
          try {
            const notifications = JSON.parse(res.data || '[]')
            notifications.push(notification)
            
            // 保存更新后的列表
            fs.writeFile({
              filePath,
              data: JSON.stringify(notifications),
              encoding: 'utf8',
              success: () => {
                console.log('通知保存成功:', notification)
                resolve()
              },
              fail: (err) => {
                console.error('保存失败:', err)
                reject(new Error('文件保存失败'))
              }
            })
          } catch (e) {
            reject(new Error('数据处理失败'))
          }
        },
        fail: () => {
          // 文件不存在则创建
          fs.writeFile({
            filePath,
            data: JSON.stringify([notification]),
            encoding: 'utf8',
            success: () => {
              console.log('新通知文件创建成功')
              resolve()
            },
            fail: (err) => {
              console.error('创建文件失败:', err)
              reject(new Error('无法创建通知文件'))
            }
          })
        }
      })
    })
  },

  saveNotification(notification) {
    return new Promise((resolve, reject) => {
      // 基础验证
      if (!notification.date || !notification.content) {
        return reject(new Error('通知数据不完整'))
      }

      const fs = wx.getFileSystemManager()
      const filePath = `${wx.env.USER_DATA_PATH}/notifications.json`

      // 读取或初始化通知列表
      fs.readFile({
        filePath,
        encoding: 'utf8',
        success: (res) => {
          try {
            const notifications = JSON.parse(res.data || '[]')
            notifications.push(notification)
            
            // 保存更新后的列表
            fs.writeFile({
              filePath,
              data: JSON.stringify(notifications),
              encoding: 'utf8',
              success: () => {
                console.log('通知保存成功:', notification)
                resolve()
              },
              fail: (err) => {
                console.error('保存失败:', err)
                reject(new Error('文件保存失败'))
              }
            })
          } catch (e) {
            reject(new Error('数据处理失败'))
          }
        },
        fail: () => {
          // 文件不存在则创建
          fs.writeFile({
            filePath,
            data: JSON.stringify([notification]),
            encoding: 'utf8',
            success: () => {
              console.log('新通知文件创建成功')
              resolve()
            },
            fail: (err) => {
              console.error('创建文件失败:', err)
              reject(new Error('无法创建通知文件'))
            }
          })
        }
      })
    })
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
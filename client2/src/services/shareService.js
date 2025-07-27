import Taro from '@tarojs/taro'

export class ShareService {
  /**
   * 分享房间给好友
   */
  static async shareRoom(roomId, roomName) {
    try {
      // 复制房间信息到剪贴板
      const shareText = `邀请你加入房间: ${roomName}\n房间号: ${roomId}\n点击链接加入: /pages/room/room?roomId=${roomId}&roomName=${encodeURIComponent(roomName)}`
      
      await Taro.setClipboardData({
        data: shareText
      })
      
      Taro.showToast({
        title: '房间信息已复制',
        icon: 'success'
      })
    } catch (error) {
      console.error('分享失败:', error)
      Taro.showToast({
        title: '分享失败',
        icon: 'none'
      })
    }
  }

  /**
   * 分享结算结果
   */
  static async shareSettlement(roomId, roomName, participants) {
    try {
      const sortedParticipants = [...participants].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
      const winner = sortedParticipants[0]
      const totalScore = participants.reduce((sum, p) => sum + (p.finalScore || 0), 0)
      
      // 生成结算结果文本
      let shareText = `${roomName} 结算结果\n`
      shareText += `总积分: ${totalScore}\n`
      shareText += `参与人数: ${participants.length}\n\n`
      shareText += `🏆 第一名: ${winner?.playerByPlayerId?.username || '玩家'} (${winner?.finalScore || 0}分)\n`
      
      // 添加前三名
      for (let i = 1; i < Math.min(3, sortedParticipants.length); i++) {
        const player = sortedParticipants[i]
        const medal = i === 1 ? '🥈' : '🥉'
        shareText += `${medal} 第${i + 1}名: ${player?.playerByPlayerId?.username || '玩家'} (${player?.finalScore || 0}分)\n`
      }
      
      shareText += `\n房间号: ${roomId}\n点击链接查看详情: /pages/room/room?roomId=${roomId}&roomName=${encodeURIComponent(roomName)}`
      
      await Taro.setClipboardData({
        data: shareText
      })
      
      Taro.showToast({
        title: '结算结果已复制',
        icon: 'success'
      })
    } catch (error) {
      console.error('分享失败:', error)
      Taro.showToast({
        title: '分享失败',
        icon: 'none'
      })
    }
  }

  /**
   * 截取当前页面并分享
   */
  static async shareCurrentPageAsImage() {
    try {
      // 显示加载提示
      Taro.showLoading({
        title: '生成图片中...'
      })

      // 使用Taro的原生截图功能
      const tempFilePath = await new Promise((resolve, reject) => {
        // 尝试使用微信小程序的截图API
        if (Taro.createSelectorQuery) {
          Taro.createSelectorQuery()
            .selectViewport()
            .fields({
              node: true,
              size: true,
            })
            .exec((res) => {
              console.log('Screenshot result:', res)
              if (res && res[0] && res[0].node) {
                Taro.canvasToTempFilePath({
                  canvas: res[0].node,
                  success: (canvasRes) => {
                    console.log('Canvas to temp file success:', canvasRes)
                    resolve(canvasRes.tempFilePath)
                  },
                  fail: (error) => {
                    console.error('Canvas to temp file failed:', error)
                    reject(error)
                  }
                })
              } else {
                console.error('No canvas node found:', res)
                reject(new Error('无法获取页面截图'))
              }
            })
        } else {
          reject(new Error('截图功能不可用'))
        }
      })

      // 隐藏加载提示
      Taro.hideLoading()

      // 保存图片到相册
      await Taro.saveImageToPhotosAlbum({
        filePath: tempFilePath
      })

      Taro.showToast({
        title: '图片已保存到相册',
        icon: 'success'
      })

      return tempFilePath
    } catch (error) {
      console.error('截取页面失败:', error)
      Taro.hideLoading()
      
      // 如果截图失败，提供备选方案
      Taro.showModal({
        title: '截图失败',
        content: '是否复制结算结果到剪贴板？',
        success: (res) => {
          if (res.confirm) {
            // 复制结算结果到剪贴板
            const shareText = `结算结果\n时间: ${new Date().toLocaleString()}`
            Taro.setClipboardData({
              data: shareText,
              success: () => {
                Taro.showToast({
                  title: '结算结果已复制',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
      
      throw error
    }
  }

  /**
   * 复制房间号到剪贴板
   */
  static async copyRoomId(roomId) {
    try {
      await Taro.setClipboardData({
        data: roomId
      })
      
      Taro.showToast({
        title: '房间号已复制',
        icon: 'success'
      })
    } catch (error) {
      console.error('复制失败:', error)
      Taro.showToast({
        title: '复制失败',
        icon: 'none'
      })
    }
  }

  /**
   * 保存图片到相册
   */
  static async saveImageToAlbum(filePath) {
    try {
      await Taro.saveImageToPhotosAlbum({
        filePath: filePath
      })
      
      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }

  /**
   * 显示分享选项
   */
  static async showShareOptions(roomId, roomName, participants = null) {
    const options = ['分享房间信息', '复制房间号']
    
    if (participants) {
      options.push('分享结算结果')
      options.push('截取页面分享')
    }
    
    try {
      const res = await Taro.showActionSheet({
        itemList: options
      })
      
      switch (res.tapIndex) {
        case 0:
          await this.shareRoom(roomId, roomName)
          break
        case 1:
          await this.copyRoomId(roomId)
          break
        case 2:
          if (participants) {
            await this.shareSettlement(roomId, roomName, participants)
          }
          break
        case 3:
          if (participants) {
            await this.shareCurrentPageAsImage()
          }
          break
      }
    } catch (error) {
      console.error('显示分享选项失败:', error)
    }
  }

  /**
   * 生成分享数据
   */
  static generateShareData(roomId, roomName, participants = []) {
    const sortedParticipants = [...participants].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    const totalScore = participants.reduce((sum, p) => sum + (p.finalScore || 0), 0)
    
    return {
      roomId,
      roomName,
      participants: sortedParticipants,
      totalScore,
      winner: sortedParticipants[0] || null,
      timestamp: new Date().toLocaleString(),
      stats: {
        totalPlayers: participants.length,
        averageScore: participants.length > 0 ? Math.round(totalScore / participants.length) : 0,
        maxScore: Math.max(...participants.map(p => p.finalScore || 0)),
        minScore: Math.min(...participants.map(p => p.finalScore || 0))
      }
    }
  }
} 
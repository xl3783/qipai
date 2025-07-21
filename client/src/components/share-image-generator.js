"use client"

import { Canvas, View } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'

export default function ShareImageGenerator({
  roomName,
  roomId,
  participants = [],
  onGenerated,
  onError,
}) {
  const [canvasContext, setCanvasContext] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      setCanvasContext(context)
    }
  }, [])

  // 生成分享图片
  const generateShareImage = async () => {
    if (!canvasContext || !participants.length) {
      onError?.('无法生成分享图片')
      return
    }

    try {
      setIsGenerating(true)
      
      const canvas = canvasRef.current
      const ctx = canvasContext
      const width = 750
      const height = 1000
      
      // 设置画布尺寸
      canvas.width = width
      canvas.height = height
      
      // 清空画布
      ctx.clearRect(0, 0, width, height)
      
      // 绘制背景
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#FF6B35')
      gradient.addColorStop(1, '#F7931E')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // 绘制标题
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 48px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('结算结果', width / 2, 80)
      
      // 绘制房间信息
      ctx.font = '24px sans-serif'
      ctx.fillText(`${roomName}`, width / 2, 120)
      ctx.font = '20px sans-serif'
      ctx.fillText(`房间号: ${roomId}`, width / 2, 150)
      
      // 绘制时间
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      ctx.fillText(timeStr, width / 2, 180)
      
      // 绘制分割线
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, 200)
      ctx.lineTo(width - 50, 200)
      ctx.stroke()
      
      // 绘制排行榜
      const sortedParticipants = [...participants].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
      const startY = 240
      const itemHeight = 80
      
      ctx.font = 'bold 32px sans-serif'
      ctx.fillText('积分排行榜', width / 2, startY)
      
      sortedParticipants.slice(0, 5).forEach((player, index) => {
        const y = startY + 60 + index * itemHeight
        
        // 绘制排名
        ctx.fillStyle = index < 3 ? '#FFD700' : '#FFFFFF'
        ctx.font = 'bold 28px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`${index + 1}`, 80, y + 20)
        
        // 绘制玩家名
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '24px sans-serif'
        ctx.fillText(player.playerByPlayerId?.username || '玩家', 120, y + 20)
        
        // 绘制积分
        ctx.fillStyle = (player.finalScore || 0) >= 0 ? '#4CAF50' : '#F44336'
        ctx.font = 'bold 28px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`¥${player.finalScore || 0}`, width - 80, y + 20)
        
        // 绘制奖牌图标
        if (index < 3) {
          const medals = ['🥇', '🥈', '🥉']
          ctx.font = '24px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(medals[index], 50, y + 20)
        }
      })
      
      // 绘制统计信息
      const totalScore = participants.reduce((sum, p) => sum + (p.finalScore || 0), 0)
      const avgScore = participants.length > 0 ? Math.round(totalScore / participants.length) : 0
      
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 32px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('统计信息', width / 2, startY + 60 + 5 * itemHeight + 40)
      
      // 统计信息网格
      const statsY = startY + 60 + 5 * itemHeight + 80
      const stats = [
        { label: '总积分', value: totalScore, color: '#4CAF50' },
        { label: '平均分', value: avgScore, color: '#2196F3' },
        { label: '参与人数', value: participants.length, color: '#9C27B0' },
        { label: '最高分', value: Math.max(...participants.map(p => p.finalScore || 0)), color: '#FF9800' }
      ]
      
      stats.forEach((stat, index) => {
        const x = 100 + (index % 2) * 275
        const y = statsY + Math.floor(index / 2) * 100
        
        // 绘制背景圆
        ctx.fillStyle = stat.color + '20'
        ctx.beginPath()
        ctx.arc(x + 60, y + 30, 40, 0, 2 * Math.PI)
        ctx.fill()
        
        // 绘制数值
        ctx.fillStyle = stat.color
        ctx.font = 'bold 24px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(stat.value.toString(), x + 60, y + 40)
        
        // 绘制标签
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '16px sans-serif'
        ctx.fillText(stat.label, x + 60, y + 70)
      })
      
      // 绘制底部信息
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('长按识别二维码加入房间', width / 2, height - 60)
      ctx.fillText('打牌记账小程序', width / 2, height - 40)
      
      // 转换为图片
      const tempFilePath = await new Promise((resolve, reject) => {
        Taro.canvasToTempFilePath({
          canvas: canvas,
          success: (res) => resolve(res.tempFilePath),
          fail: reject
        })
      })
      
      onGenerated?.(tempFilePath)
      
    } catch (error) {
      console.error('生成分享图片失败:', error)
      onError?.('生成分享图片失败')
    } finally {
      setIsGenerating(false)
    }
  }

  // 保存图片到相册
  const saveToAlbum = async (tempFilePath) => {
    try {
      await Taro.saveImageToPhotosAlbum({
        filePath: tempFilePath
      })
      
      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('保存图片失败:', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }

  // 分享图片
  const shareImage = async (tempFilePath) => {
    try {
      // 生成分享文本
      const shareText = `${roomName} 结算结果\n房间号: ${roomId}\n点击链接查看详情: /pages/room/room?roomId=${roomId}`
      
      await Taro.setClipboardData({
        data: shareText
      })
      
      Taro.showToast({
        title: '结算信息已复制',
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

  return (
    <View className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <View className='bg-white rounded-lg p-6 w-80'>
        <View className='text-center mb-4'>
          <Text className='text-lg font-semibold'>生成分享图片</Text>
        </View>
        
        <Canvas
          ref={canvasRef}
          className='w-full h-64 bg-gray-100 rounded mb-4'
          style={{ width: '100%', height: '256px' }}
        />
        
        <View className='flex flex-col gap-3'>
          <Button
            onClick={generateShareImage}
            disabled={isGenerating}
            className='bg-orange-500 text-white'
          >
            {isGenerating ? '生成中...' : '生成分享图片'}
          </Button>
          
          <Button
            onClick={() => onGenerated && onGenerated(null)}
            className='text-gray-600'
          >
            取消
          </Button>
        </View>
      </View>
    </View>
  )
} 
"use client"

import { View, Button, Text, Image, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import PlayerAvatar from './player-avatar.js'
import { ShareService } from '../services/shareService.js'

export default function SettlementPage({
  roomId = 'room-1',
  roomName = '房间1',
  participants = [],
  onBackToRoom,
  onViewHistory,
  onViewManual,
  onSettlement,
}) {
  const [shareImage, setShareImage] = useState(null)
  const [loading, setLoading] = useState(false)

  // 计算总积分
  const totalScore = participants.reduce((sum, player) => sum + (player.finalScore || 0), 0)
  
  // 按积分排序，生成排行榜
  const sortedParticipants = [...participants].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
  
  // 获取前三名
  const topThree = sortedParticipants.slice(0, 3)
  
  // 计算统计信息
  const stats = {
    totalPlayers: participants.length,
    totalScore: totalScore,
    averageScore: participants.length > 0 ? Math.round(totalScore / participants.length) : 0,
    winner: topThree[0] || null,
    maxScore: Math.max(...participants.map(p => p.finalScore || 0)),
    minScore: Math.min(...participants.map(p => p.finalScore || 0)),
  }

  // 生成分享图片
  const generateShareImage = async () => {
    try {
      setLoading(true)
      
      // 使用分享服务显示分享选项
      await ShareService.showShareOptions(roomId, roomName, participants)
    } catch (error) {
      console.error('分享失败:', error)
      Taro.showToast({
        title: '分享失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }



  // 查看玩家详情
  const viewPlayerDetail = (player) => {
    Taro.showModal({
      title: player.playerByPlayerId?.username || '玩家',
      content: `积分: ${player.finalScore || 0}\n排名: ${sortedParticipants.findIndex(p => p.participationId === player.participationId) + 1}`,
      showCancel: false
    })
  }

  return (
    <View className='min-h-screen bg-gray-50'>
      {/* Header */}
      {/* <View className='bg-white border-b p-4 flex items-center justify-between'>
        <View className='flex items-center gap-2'>
          <Button onClick={onBackToRoom} className='text-lg'>←</Button>
          <Text className='text-lg font-semibold'>结算结果</Text>
        </View>
        <Button 
          onClick={generateShareImage}
          disabled={loading}
          className='text-orange-500'
        >
          {loading ? '生成中...' : '分享'}
        </Button>
      </View> */}

      <ScrollView className='flex-1'>
        {/* 房间信息 */}
        <View className='bg-white p-4 mb-4'>
          <Text className='text-lg font-semibold'>房间：{roomName}</Text>
          {/* <View className='flex justify-between items-center mt-2'>
            <Text className='text-sm text-gray-600'>参与人数: {stats.totalPlayers}</Text>
            <Text className='text-sm text-gray-600'>总积分: {stats.totalScore}</Text>
          </View> */}
        </View>

        {/* 冠军展示 */}
        {/* {stats.winner && (
          <View className='bg-gradient-to-r from-yellow-400 to-orange-500 p-6 mb-4 mx-4 rounded-lg'>
            <View className='text-center'>
              <View className='flex justify-center mb-4'>
                <View className='relative'>
                  <PlayerAvatar 
                    name={stats.winner.playerByPlayerId?.username || '冠军'} 
                    size="xl"
                  />
                  <View className='absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center'>
                    <Text className='text-white font-bold text-sm'>1</Text>
                  </View>
                </View>
              </View>
              <Text className='text-white text-xl font-bold mb-2'>
                {stats.winner.playerByPlayerId?.username || '冠军'}
              </Text>
              <Text className='text-white text-2xl font-bold'>
                ¥{stats.winner.finalScore || 0}
              </Text>
              <Text className='text-yellow-200 text-sm mt-2'>恭喜获得第一名！</Text>
            </View>
          </View>
        )} */}

        {/* 排行榜 */}
        <View className='bg-white p-4 mb-4 mx-4 rounded-lg'>
          <Text className='text-lg font-semibold mb-4'>积分排行榜</Text>
          <View className='space-y-3'>
            {sortedParticipants.map((player, index) => (
              <View 
                key={player.participationId}
                onClick={() => viewPlayerDetail(player)}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <View className='flex items-center gap-3'>
                  <View className='flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold'>
                    {index + 1}
                  </View>
                  <PlayerAvatar 
                    name={player.playerByPlayerId?.username || '玩家'} 
                    size="md"
                  />
                  <Text className='font-medium'>{player.playerByPlayerId?.username || '玩家'}</Text>
                </View>
                <View className='text-right'>
                  <Text className={`text-lg font-bold ${player.finalScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ¥{player.finalScore || 0}
                  </Text>
                  {index < 3 && (
                    <Text className='text-xs text-orange-500'>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 统计信息 */}
        {/* <View className='bg-white p-4 mb-4 mx-4 rounded-lg'>
          <Text className='text-lg font-semibold mb-4'>统计信息</Text>
          <View className='grid grid-cols-2 gap-4'>
            <View className='text-center p-3 bg-blue-50 rounded-lg'>
              <Text className='text-2xl font-bold text-blue-600'>{stats.averageScore}</Text>
              <Text className='text-sm text-gray-600'>平均积分</Text>
            </View>
            <View className='text-center p-3 bg-green-50 rounded-lg'>
              <Text className='text-2xl font-bold text-green-600'>{stats.maxScore}</Text>
              <Text className='text-sm text-gray-600'>最高积分</Text>
            </View>
            <View className='text-center p-3 bg-red-50 rounded-lg'>
              <Text className='text-2xl font-bold text-red-600'>{stats.minScore}</Text>
              <Text className='text-sm text-gray-600'>最低积分</Text>
            </View>
            <View className='text-center p-3 bg-purple-50 rounded-lg'>
              <Text className='text-2xl font-bold text-purple-600'>{stats.totalScore}</Text>
              <Text className='text-sm text-gray-600'>总积分</Text>
            </View>
          </View>
        </View> */}

        {/* 结算建议 */}
        {/* <View className='bg-white p-4 mb-4 mx-4 rounded-lg'>
          <Text className='text-lg font-semibold mb-4'>结算建议</Text>
          <View className='space-y-2'>
            {sortedParticipants.filter(p => p.finalScore < 0).map((player, index) => (
              <View key={player.participationId} className='flex items-center justify-between p-2 bg-red-50 rounded'>
                <Text className='text-sm'>{player.playerByPlayerId?.username || '玩家'}</Text>
                <Text className='text-sm text-red-600'>需支付 ¥{Math.abs(player.finalScore || 0)}</Text>
              </View>
            ))}
            {sortedParticipants.filter(p => p.finalScore > 0).map((player, index) => (
              <View key={player.participationId} className='flex items-center justify-between p-2 bg-green-50 rounded'>
                <Text className='text-sm'>{player.playerByPlayerId?.username || '玩家'}</Text>
                <Text className='text-sm text-green-600'>应收 ¥{player.finalScore || 0}</Text>
              </View>
            ))}
          </View>
        </View> */}
      </ScrollView>

      {/* 底部操作按钮 */}
      <View className='bg-white border-t p-4'>
        <View className='grid grid-cols-3 gap-3'>
          <Button 
            onClick={onSettlement}
            className='text-orange-500 border-orange-500'
          >
            结算
          </Button>
          <Button 
            onClick={generateShareImage}
            disabled={loading}
            className='bg-orange-500 text-white'
          >
            {loading ? '生成中...' : '分享结果'}
          </Button>
          {/* <Button 
            onClick={onViewManual}
            className='text-orange-500 border-orange-500'
          >
            使用手册
          </Button> */}
        </View>
      </View>
    </View>
  )
} 
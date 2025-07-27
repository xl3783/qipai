"use client"

import { View, Button, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { GameService } from '../services/gameService.js'
import { useSettleRoom } from '../hooks/useGraphQL.js'
import SettlementPage from './settlement-page.js'

export default function GameSettlement({
  roomId = 'room-1', // 默认房间ID
  roomName = '房间1',
  participants = [],
  totalScore,
  onGenerateStrategy,
  onExitRoom,
  onViewSettlement,
  onViewRanking,
  onViewHistory,
  onViewManual,
  onBackToRoom,
  onSettlement,
}) {
  const [settlementStrategy, setSettlementStrategy] = useState([])
  const [settlementResults, setSettlementResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSettlementPage, setShowSettlementPage] = useState(false)
  const [settleRoom] = useSettleRoom()

  // 生成结算策略
  const handleGenerateStrategy = async () => {
    try {
      setLoading(true)
      const strategy = await GameService.calculateSettlementStrategy(roomId)
      setSettlementStrategy(strategy || [])
      if (onGenerateStrategy) {
        onGenerateStrategy(strategy)
      }
    } catch (error) {
      console.error('生成结算策略失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 执行房间结算
  const handleSettleRoom = async () => {
    try {
      setLoading(true)
      const results = await settleRoom({ roomId })
      setSettlementResults(results.settleRoom || [])
      // 结算完成后显示结算页面
      setShowSettlementPage(true)
    } catch (error) {
      console.error('房间结算失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 查看结算结果
  const handleViewSettlement = () => {
    setShowSettlementPage(true)
  }

  // 返回房间
  const handleBackToRoom = () => {
    setShowSettlementPage(false)
    if (onBackToRoom) {
      onBackToRoom()
    }
  }

  // 结算
  const handleSettlement = () => {
    setShowSettlementPage(false)
    if (onSettlement) {
      onSettlement()
    }
  }

  // 如果显示结算页面，则渲染结算页面组件
  if (showSettlementPage) {
    return (
      <SettlementPage
        roomId={roomId}
        roomName={roomName}
        participants={participants}
        onBackToRoom={handleBackToRoom}
        onViewHistory={onViewHistory}
        onViewManual={onViewManual}
        onSettlement={handleSettlement}
      />
    )
  }

  return (
    <View className='min-h-screen bg-gray-50 p-4'>
      <View className='max-w-md mx-auto flex flex-col gap-6'>
        <View className='flex items-center mb-6'>
          <Text className='w-6 h-6'>←</Text>
          <Text className='text-lg font-semibold ml-4'>打牌记账</Text>
        </View>
        <View className='text-center rounded-lg border bg-card text-card-foreground shadow-sm'>
          <View className='p-6 flex flex-col gap-1_5'>
            <Text className='text-2xl text-orange-500 font-semibold'>战斗胜利</Text>
          </View>
          <View className='p-6 pt-0'>
            <View className='text-3xl font-bold text-orange-500 mb-2'>
              总计: {totalScore || 0} <Text className='text-sm'>未结({settlementResults.length})</Text>
            </View>
            <Text className='text-sm text-muted-foreground mb-4'>获得 大神 称号，今晚你买单！</Text>
            
            {settlementStrategy.length > 0 ? (
              <View className='flex flex-col gap-2'>
                <Text className='text-sm font-semibold text-gray-700 mb-2'>推荐结算方案:</Text>
                {settlementStrategy.map((settlement, index) => (
                  <View key={index} className='bg-orange-50 p-3 rounded-lg'>
                    <Text className='text-sm'>
                      <Text className='font-medium'>{settlement.from}</Text>
                      <Text> → </Text>
                      <Text className='font-medium'>{settlement.to}</Text>
                      <Text className='text-orange-600 font-bold'> ¥{settlement.amount}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className='text-center text-gray-500 py-8'>
                {loading ? '正在计算结算方案...' : '点击生成结算策略查看详情'}
              </View>
            )}
          </View>
        </View>
        <View className='flex flex-col gap-3'>
          <Button 
            onClick={handleGenerateStrategy} 
            disabled={loading}
            className='w-full text-orange-500 border-orange-500'
          >
            {loading ? '计算中...' : '生成我的结算策略'}
          </Button>
          <View className='grid grid-cols-2 gap-3'>
            <Button onClick={onExitRoom} className='text-orange-500 border-orange-500'>直接退房</Button>
            <Button 
              onClick={handleSettleRoom} 
              disabled={loading}
              className='bg-orange-500'
              hoverClass="hover-bg-orange-600"
            >
              {loading ? '结算中...' : '执行房间结算'}
            </Button>
          </View>
          <View className='grid grid-cols-2 gap-3'>
            <Button onClick={handleViewSettlement} className='text-orange-500 border-orange-500'>查看结算结果</Button>
            <Button onClick={onViewHistory} className='text-orange-500 border-orange-500'>房间更多流水</Button>
          </View>
          <View className='grid grid-cols-2 gap-3'>
            <Button onClick={onViewHistory} className='text-orange-500 border-orange-500'>历史房间</Button>
            <Button onClick={onViewManual} className='text-orange-500 border-orange-500'>使用手册</Button>
          </View>
        </View>
      </View>
    </View>
  )
} 
"use client"

import { View, Button, Text } from '@tarojs/components'
import { useState } from 'react'
import PlayerAvatar from "./player-avatar"
import './transaction-history.css'


export default function TransactionHistory({ transactions, players }) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getPlayerName = (playerId) => {
    return players.find((p) => p.id === playerId)?.name || "未知用户"
  }

  const getPlayerAvatar = (playerId) => {
    const player = players.find((p) => p.id === playerId)
    return player ? <PlayerAvatar name={player.name} size="sm" /> : null
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: '2-digit', day: '2-digit',
    })
  }

  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'TRANSFER': return '转账'
      case 'EXPENSE': return '消费'
      case 'SETTLEMENT': return '结算'
      case 'transfer': return '转账' // 兼容旧格式
      case 'expense': return '消费' // 兼容旧格式
      case 'settlement': return '结算' // 兼容旧格式
      default: return '交易'
    }
  }

  const totalAmount = transactions ? transactions.reduce((sum, t) => sum + t.score, 0) : 0

// return (
//   <View style={{flex:1, backgroundColor: 'red'}}>
//     <Text>123</Text>
//   </View>
// )

  return (
    <View className='transaction-history'>
      <View className='transaction-header'>
        <Text className='transaction-title'>
          房间流水 <Text className='transaction-count'>({transactions ? transactions.length : 0}笔)</Text>
        </Text>
        <View className='transaction-summary'>
          <Text className='transaction-total'>总计: <Text className='total-amount'>¥{totalAmount}</Text></Text>
        </View>
      </View>
      {isExpanded && (
        <View className='transaction-content'>
          {transactions.length === 0 ? (
            <View className='empty-state'>
              <Text className='empty-icon'>📄</Text>
              <Text className='empty-text'>暂无交易记录</Text>
            </View>
          ) : (
            <View className='transaction-list'>
              <View className='transaction-items'>
                {transactions.map((transaction) => (
                  <View key={transaction.id} className='transaction-item'>
                    <View className='transaction-info'>
                      <View className='transaction-players'>
                        <Text className='player-name'>
                          {transaction.from}
                        </Text>
                        <Text className='transaction-arrow'>→</Text>
                        <Text className='player-name'>
                          {transaction.to}
                        </Text>
                      </View>
                    </View>
                    <View className='transaction-amount'>
                      <Text className='amount-text'>¥{transaction.score}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          {transactions.length > 0 && (
            <View className='transaction-stats'>
              <View className='stats-content'>
                <Text className='stats-label'>今日交易统计</Text>
                <View className='stats-details'>
                  <Text>交易笔数: <Text className='stats-value'>{transactions.length}</Text></Text>
                  <Text>交易总额: <Text className='stats-value total'>¥{totalAmount}</Text></Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  )
} 
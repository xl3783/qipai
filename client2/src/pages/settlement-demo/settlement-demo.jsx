import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import SettlementPage from '../../components/settlement-page.js'

export default function SettlementDemo() {
  // 模拟参与者数据
  const mockParticipants = [
    {
      participationId: '1',
      playerId: 'player1',
      finalScore: 150,
      playerByPlayerId: {
        username: '张三',
        avatarUrl: ''
      }
    },
    {
      participationId: '2',
      playerId: 'player2',
      finalScore: 80,
      playerByPlayerId: {
        username: '李四',
        avatarUrl: ''
      }
    },
    {
      participationId: '3',
      playerId: 'player3',
      finalScore: -50,
      playerByPlayerId: {
        username: '王五',
        avatarUrl: ''
      }
    },
    {
      participationId: '4',
      playerId: 'player4',
      finalScore: -180,
      playerByPlayerId: {
        username: '赵六',
        avatarUrl: ''
      }
    }
  ]

  const handleBackToRoom = () => {
    Taro.navigateBack()
  }

  const handleViewHistory = () => {
    Taro.showToast({
      title: '查看历史记录',
      icon: 'none'
    })
  }

  const handleViewManual = () => {
    Taro.showToast({
      title: '查看使用手册',
      icon: 'none'
    })
  }

  return (
    <SettlementPage
      roomId="demo-room-001"
      roomName="演示房间"
      participants={mockParticipants}
      onBackToRoom={handleBackToRoom}
      onViewHistory={handleViewHistory}
      onViewManual={handleViewManual}
    />
  )
} 
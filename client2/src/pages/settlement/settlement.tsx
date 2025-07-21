import { View, Button, Text, ScrollView, Snapshot } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import PlayerAvatar from '../../components/player-avatar.js'
import { GameService } from '../../services/gameService.js'
import { useSettleRoom } from '../../hooks/useGraphQL.js'
import { ShareService } from '../../services/shareService.js'
import testScreenshot from '../../utils/testScreenshot.js'
import './settlement.scss'

interface Player {
  participationId: string
  playerId: string
  finalScore: number
  playerByPlayerId: {
    username: string
    avatarUrl: string | null
  }
}

interface SettlementStrategy {
  from: string
  to: string
  amount: number
  fromId: string
  toId: string
}

export default function Settlement() {
  // 获取页面参数
  const router = Taro.getCurrentInstance().router
  const roomId = router?.params?.roomId || ''
  const roomName = router?.params?.roomName || ''

  // 状态管理
  const [settlementStrategy, setSettlementStrategy] = useState<SettlementStrategy[]>([])
  const [settlementResults, setSettlementResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showSettlementPage, setShowSettlementPage] = useState(true)
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([])
  const [totalScore, setTotalScore] = useState(0)

  const [settleRoom] = useSettleRoom()

  // 初始化数据
  useEffect(() => {
    if (roomId) {
      loadRoomData()
    }
  }, [roomId])

  // 加载房间数据
  const loadRoomData = async () => {
    try {
      setLoading(true)
      // 这里应该从API获取房间数据
      // 暂时使用模拟数据
      const mockPlayers = [
        {
          participationId: '1',
          playerId: '1',
          finalScore: 100,
          playerByPlayerId: {
            username: '玩家1',
            avatarUrl: null
          }
        },
        {
          participationId: '2',
          playerId: '2',
          finalScore: -50,
          playerByPlayerId: {
            username: '玩家2',
            avatarUrl: null
          }
        }
      ]
      setRoomPlayers(mockPlayers)
      setTotalScore(mockPlayers.reduce((sum, player) => sum + (player.finalScore || 0), 0))
    } catch (error) {
      console.error('加载房间数据失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 生成结算策略
  const handleGenerateStrategy = async () => {
    try {
      setLoading(true)
      const strategy = await GameService.calculateSettlementStrategy(roomId)
      setSettlementStrategy(strategy || [])
    } catch (error) {
      console.error('生成结算策略失败:', error)
      Taro.showToast({
        title: '生成策略失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 执行房间结算
  const handleSettleRoom = async () => {
    // 退出房间
    
    // 返回主页
    Taro.navigateTo({
      url: '/pages/index/index'
    })
  }

  // 查看结算结果
  const handleViewSettlement = () => {
    setShowSettlementPage(true)
  }

  // 返回房间
  const handleBackToRoom = () => {
    Taro.navigateBack()
  }

  // 生成分享图片
  const generateShareImage = async () => {
    try {
      setLoading(true)
      await ShareService.showShareOptions(roomId, roomName, roomPlayers as any)
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

  // 截取页面分享
  const shareCurrentPage = async () => {
    try {
      setLoading(true)
      await ShareService.shareCurrentPageAsImage()
    } catch (error) {
      console.error('截取页面失败:', error)
      Taro.showToast({
        title: '截取页面失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 测试截图功能
  const testScreenshotFunction = async () => {
    try {
      setLoading(true)
      await testScreenshot()
    } catch (error) {
      console.error('测试截图失败:', error)
      Taro.showToast({
        title: '测试截图失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 查看玩家详情
  const viewPlayerDetail = (player) => {
    const sortedPlayers = [...roomPlayers].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    const rank = sortedPlayers.findIndex(p => p.participationId === player.participationId) + 1
    
    Taro.showModal({
      title: player.playerByPlayerId?.username || '玩家',
      content: `积分: ${player.finalScore || 0}\n排名: ${rank}`,
      showCancel: false
    })
  }

  // 数据加载状态
  if (loading && roomPlayers.length === 0) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Text className="text-lg">正在加载...</Text>
      </View>
    )
  }

  // 如果显示结算页面，则渲染结算结果
  if (showSettlementPage) {
    const sortedParticipants = [...roomPlayers].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    
    return (
      <View className='min-h-screen bg-gray-50'>
        <ScrollView className='flex-1'>
          {/* 房间信息 */}
          <View className='bg-white p-4 mb-4'>
            <Text className='text-lg font-semibold'>房间：{roomName}</Text>
          </View>

          {/* 排行榜 */}
          <Snapshot id="ranking" mode='view' className='bg-white p-4 mb-4 mx-4 rounded-lg'>
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
                      avatar={player.playerByPlayerId?.avatarUrl}
                      size="md"
                      onClick={() => {}}
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
          </Snapshot>
        </ScrollView>

        {/* 底部操作按钮 */}
        <View className='bg-white border-t p-4'>
          <View className='grid grid-cols-3 gap-3'>
            <Button 
              onClick={handleBackToRoom}
              className='settlement-button-secondary'
            >
              返回房间
            </Button>
            <Button 
              onClick={handleSettleRoom}
              className='settlement-button'
            >
              结算退房
            </Button>
            {/* <Button 
              onClick={generateShareImage}
              disabled={loading}
              className='settlement-button'
            >
              {loading ? '生成中...' : '分享结果'}
            </Button> */}
            {/* <Button 
              onClick={shareCurrentPage}
              disabled={loading}
              className='settlement-button-secondary'
            >
              {loading ? '生成中...' : '截取页面分享'}
            </Button> */}
          </View>
        </View>
      </View>
    )
  }

  // 主结算页面
  return (
    <View className='min-h-screen bg-gray-50 p-4'>
      <View className='max-w-md mx-auto flex flex-col gap-6'>
        <View className='flex items-center mb-6'>
          <Button onClick={handleBackToRoom} className='text-lg'>←</Button>
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
            <Button onClick={handleBackToRoom} className='text-orange-500 border-orange-500'>直接退房</Button>
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
            <Button onClick={() => Taro.navigateTo({ url: `/pages/game-history/game-history?roomId=${roomId}` })} className='text-orange-500 border-orange-500'>房间更多流水</Button>
          </View>
          <View className='grid grid-cols-2 gap-3'>
            <Button onClick={() => Taro.navigateTo({ url: '/pages/game-history/game-history' })} className='text-orange-500 border-orange-500'>历史房间</Button>
            <Button onClick={testScreenshotFunction} className='text-orange-500 border-orange-500'>测试截图</Button>
          </View>
        </View>
      </View>
    </View>
  )
} 
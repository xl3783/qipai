import { View, Button, Text, ScrollView, Snapshot } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import PlayerAvatar from '../../components/player-avatar.js'
// import { GameService } from '../../services/gameService.js'
// import { useSettleRoom } from '../../hooks/useGraphQL.js'
// import { ShareService } from '../../services/shareService.js'
// import testScreenshot from '../../utils/testScreenshot.js'
import './index.scss'
import Avatar from '../../components/Avatar.js'

// interface Player {
//   participationId: string
//   playerId: string
//   finalScore: number
//   playerByPlayerId: {
//     username: string
//     avatarUrl: string | null
//   }
// }

// interface SettlementStrategy {
//   from: string
//   to: string
//   amount: number
//   fromId: string
//   toId: string
// }

export default function Settlement() {
  // 获取页面参数
  const router = Taro.getCurrentInstance().router
  const roomId = router?.params?.roomId || '1'
  const roomName = router?.params?.roomName || ''

  // 状态管理
  const [loading, setLoading] = useState(false)
  const [showSettlementPage, setShowSettlementPage] = useState(true)
  const [roomPlayers, setRoomPlayers] = useState([])
  const [totalScore, setTotalScore] = useState(0)

  // const [settleRoom] = useSettleRoom()

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
      console.log(mockPlayers);
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
    // try {
    //   setLoading(true)
    //   const strategy = await GameService.calculateSettlementStrategy(roomId)
    //   setSettlementStrategy(strategy || [])
    // } catch (error) {
    //   console.error('生成结算策略失败:', error)
    //   Taro.showToast({
    //     title: '生成策略失败',
    //     icon: 'none'
    //   })
    // } finally {
    //   setLoading(false)
    // }
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
  // if (loading && roomPlayers.length === 0) {
  //   return (
  //     <View className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <Text className="text-lg">正在加载...</Text>
  //     </View>
  //   )
  // }

  // 如果显示结算页面，则渲染结算结果
  if (showSettlementPage) {
    console.log(roomPlayers);
    const sortedParticipants = [...roomPlayers].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))

    return (
      <View className='min-h-screen bg-gray-50' style={{ padding: '10px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <ScrollView style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          {/* 房间信息 */}
          <View className='bg-white p-4 mb-4'>
            <Text className='text-lg font-semibold'>房间：{roomName}</Text>
          </View>

          {/* 排行榜 */}
          <Text className='text-lg font-semibold mb-4'>积分排行榜</Text>
          <View style={{ display: 'flex', flexDirection: 'column' }}>
            {sortedParticipants.map((player, index) => (
              <View
                key={player.participationId}
                onClick={() => viewPlayerDetail(player)}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View className='flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold' style={{ marginRight: '10px' }}>
                    {index + 1}
                  </View>
                  <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Avatar src={player.playerByPlayerId?.avatarUrl} size={30} />
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

              </View>
            ))}
          </View>
        </ScrollView>

        {/* 底部操作按钮 */}
        <View style={{
          height: '50px',
          backgroundColor: 'yellow',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          boxSizing: 'border-box'
        }}>
          <Button
            className='settlement-button-secondary'
            style={{
              flex: 1,
              height: '100%',
              margin: '0 5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} onClick={handleBackToRoom}>返回房间</Button>
          <Button
            className='settlement-button'
            style={{
              flex: 1,
              height: '100%',
              margin: '0 5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} onClick={handleSettleRoom}>结算退房</Button>
        </View>
      </View>
    )
  }
} 
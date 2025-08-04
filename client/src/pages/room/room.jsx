import { View, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PlayerAvatar from '../../components/player-avatar.js'
import PlayerProfileModal from '../../components/player-profile-modal.js'
import SpendingLimitModal from '../../components/spending-limit-modal.js'
import TransferModal from '../../components/transfer-modal.js'
import TransactionHistory from '../../components/transaction-history.js'
import { useRoomViewModel } from '../../hooks/useRoomViewModel.ts'
import './room.scss'
import { useCallback, useState, useEffect } from 'react'
import QRCodeModal from '../../components/qr-code-modal.js'
import { Icons } from '../../components/icons.jsx'
import ModalDialog from '../../components/modal-dialog.jsx'
import { restClient } from '../../services/restClient.js'

export default function Room() {
  // 获取页面参数
  const router = Taro.getCurrentInstance().router
  const roomId = router.params.roomId
  const roomName = router.params.roomName

  // restClient.post("/api/games/join", {
  //   gameId: roomId,
  //   playerId: playerId,
  // });

  // const [shareRoom, setShareRoom] = useState(false)

  // const handleShareRoom = useCallback(() => {
  //   setShareRoom(true)
  // })

  // // 使用 MVVM Hook
  // const {
  //   // 状态
  //   showProfileModal,
  //   showSpendingModal,
  //   showTransferModal,
  //   choosePlayerProfile,
  //   transactions,
  //   roomPlayers,
  //   loading,
  //   error,
    
  //   // 事件处理函数
  //   handleChoosePlayer,
  //   handleCloseProfileModal,
  //   handleShowTransferModal,
  //   handleCloseTransferModal,
  //   handleTransfer,
  //   handleExitRoom,
  //   clearError,
    
  //   // 获取数据的方法
  //   getCurrentUser,
  //   getPlayersForTransfer,
  // } = useRoomViewModel(roomId, roomName);

  // 数据加载状态
  // if (loading) {
  //   return (
  //     <View className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <View className="text-lg">正在加载...</View>
  //     </View>
  //   )
  // }

  // // 错误状态
  // if (error) {
  //   return (
  //     <View className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <View className="text-lg text-red-500">加载失败: {error}</View>
  //       <TaroButton onClick={clearError} className="mt-4">重试</TaroButton>
  //     </View>
  //   )
  // }

  // // 导航到结算页面
  // const handleNavigateToSettlement = () => {
  //   Taro.navigateTo({
  //     url: `/pages/settlement/settlement?roomId=${roomId}&roomName=${roomName}`
  //   })
  // }

  const [loading, setLoading] = useState(false)

  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferAmount, setTransferAmount] = useState(0)
  // const roommates = [
  //   { name: "张三", avatar: "/placeholder.svg?height=60&width=60", balance: 100, id: "zhangsan" },
  //   { name: "李四", avatar: "/placeholder.svg?height=60&width=60", balance: 100, id: "lisi" },
  //   { name: "王五", avatar: "/placeholder.svg?height=60&width=60", balance: 100, id: "wangwu" },
  // ]

  // const transactions = [
  //   { from: "张三", to: "李四", amount: 100, type: "transfer" },
  //   { from: "李四", to: "张三", amount: 100, type: "transfer" },
  // ]

  const [roommates, setRoommates] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const getRoomDetail = async () => {
      setLoading(true)
      const result = await restClient.post("/api/get-room-detail", {
        gameId: roomId,
      });
      console.log(result);
      setRoommates(result.data.roommates)
      setTransactions(result.data.transactions)
      setLoading(false)
    }
    getRoomDetail();
  }, []);

  const leftRoom = useCallback(async () => {
    try {
      const result = await restClient.post("/api/games/leave", {
        gameId: roomId,
      });
      console.log(result);
      Taro.navigateTo({
        url: '/pages/index/index',
      });
    } catch (error) {
      console.error(error);
    }
  }, [roomId])

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <View className="text-lg">正在加载...</View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"  >
      <View className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <View className="mb-8">
          <View className="flex items-center gap-3 mb-2">
            <View className="p-2 bg-blue-100 rounded-lg">
              <View className="h-6 w-6 text-blue-600">
                R
              </View>
            </View>
            <View className="text-2xl font-bold text-gray-900">
              {roomName}
            </View>
          </View>
          <View className="flex items-center gap-4"></View>
        </View>
        {/* Roommates Section */}
        <View className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <View>
            <View className="grid grid-cols-4 gap-4">
              {roommates.map((roommate, index) => (
                <View
                  key={index}
                  className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100"
                  onClick={() => setShowTransferModal(true)}
                >
                  {/* <Avatar className="h-12 w-12 mb-2 ring-2 ring-white shadow-md">
                    <AvatarImage src={roommate.avatar || "/placeholder.svg"} alt={roommate.name} />
                    <AvatarFallback className="bg-blue-500 text-white font-semibold text-sm">
                      {roommate.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar> */}
                  <View className="font-semibold text-gray-900 mb-1 text-sm">{roommate.name}</View>
                  <View className="bg-green-100 text-green-800 font-semibold px-2 py-1 text-xs">
                    {roommate.balance}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
        {/* Transaction History */}
        <View className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <View className="space-y-6">
            {/* Individual Transactions */}
            <View className="space-y-2">
              {transactions.map((transaction, index) => (
                <View
                  key={index}
                  className="flex items-center justify-between p-1 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <View className="flex items-center gap-3">
                    <View className="ml-1">
                      <View className="font-medium text-gray-900 text-sm">
                        {transaction.from} → {transaction.to}
                      </View>
                    </View>
                  </View>
                  <View className="text-base font-semibold text-green-600">{transaction.amount}</View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="grid grid-cols-2 gap-4">
          {/* <Button
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
          >
            创建房间
          </Button> */}
          <Button
            onClick={() => Taro.navigateTo({ url: '/pages/settlement/settlement?roomId=123&roomName=测试房间' })}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg text-lg"
          >
            结算
          </Button>
          <Button
            className="w-full h-14 border-2 border-gray-200 hover:bg-gray-50 font-semibold bg-transparent"
            onClick={() => leftRoom()}  
          >
            离开
          </Button>
        </View>
      </View>
      <ModalDialog
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="转入"
      >
        <Input
          type="number"
          placeholder="请输入金额"
          className='border border-gray-300 rounded-md p-2 w-full'
          onChange={(e) => setTransferAmount(e.target.value)}
        />
      </ModalDialog>
    </View>
  )

  return (
    <View className="room-page">
      {/* Header */}
      <View className="room-header">
        <View className="room-header-title">
          <View>房间: {roomName}</View>
        </View>
      </View>
      {/* Notice Bar */}
      <View className="room-notice">
        <View>退房/重开 需要先点结算归零数据</View>
      </View>
      {/* 内容区：好友+流水，底部加padding防止被按钮遮挡 */}
      <View className="room-content">
        {/* 好友区 */}
        <View className="room-players">
          {roomPlayers.map((player) => (
            <View key={player.participationId} className="room-player-item">
              <TaroButton onClick={() => handleChoosePlayer(player)} className="room-player-btn">
                <PlayerAvatar name={player.playerByPlayerId.username} size="lg" />
                <View className="room-player-name">{player.playerByPlayerId.username}</View>
                <View className="room-player-score">¥{player.finalScore}</View>
              </TaroButton>
            </View>
          ))}
          {/* 可加“添加好友”按钮 */}
          {/* <View className="room-player-item">
            <TaroButton className="room-player-btn"
              onClick={handleShareRoom}
            >
              <View className="room-player-avatar-add">
                <Icons.Plus size={24} color="#6B7280" />
              </View>
              <View className="room-player-name">添加好友</View>
            </TaroButton>
          </View> */}
        </View>
        {/* 流水区 */}
        <View className="room-history">
          <TransactionHistory transactions={transactions} />
        </View>
      </View>
      {/* 底部按钮栏，假定高度56px */}
      <View className="room-footer">
        <View className="room-footer-btns">
          <TaroButton 
            onClick={handleShowTransferModal} 
            className="room-footer-btn room-footer-btn-transfer"
          >
            转账
          </TaroButton>
          <TaroButton 
            onClick={handleNavigateToSettlement} 
            className="room-footer-btn room-footer-btn-settle"
          >
            结算
          </TaroButton>
          <TaroButton 
            onClick={handleExitRoom}
            className="room-footer-btn room-footer-btn-exit"
          >
            退房
          </TaroButton>
        </View>
      </View>
      {/* Modals */}
      <PlayerProfileModal
        isOpen={showProfileModal}
        onClose={handleCloseProfileModal}
        player={choosePlayerProfile}
        onUpdateNickname={() => {}}
        onExitRoom={handleExitRoom}
      />
      <SpendingLimitModal
        isOpen={showSpendingModal}
        onClose={() => {}}
        onConfirm={() => {}}
      />
      <TransferModal
        isOpen={showTransferModal}
        onClose={handleCloseTransferModal}
        players={roomPlayers.map(player => ({
          id: player.playerId,
          username: player.playerByPlayerId.username,
          avatarUrl: player.playerByPlayerId.avatarUrl
        }))}
        currentPlayer={getCurrentUser()}
        onTransfer={handleTransfer}
      />
      <QRCodeModal
        isOpen={shareRoom}
        onClose={() => setShareRoom(false)}
        roomId={roomId}
        roomName={roomName}
      />
    </View>
  )
} 
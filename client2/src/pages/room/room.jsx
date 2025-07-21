import { View, Button as TaroButton } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PlayerAvatar from '../../components/player-avatar.js'
import PlayerProfileModal from '../../components/player-profile-modal.js'
import SpendingLimitModal from '../../components/spending-limit-modal.js'
import TransferModal from '../../components/transfer-modal.js'
import TransactionHistory from '../../components/transaction-history.js'
import { useRoomViewModel } from '../../hooks/useRoomViewModel.ts'
import './room.scss'
import { useCallback, useState } from 'react'
import QRCodeModal from '../../components/qr-code-modal.js'
import { Icons } from '../../components/icons.jsx'

export default function Room() {
  // 获取页面参数
  const router = Taro.getCurrentInstance().router
  const roomId = router.params.roomId
  const roomName = router.params.roomName

  const [shareRoom, setShareRoom] = useState(false)

  const handleShareRoom = useCallback(() => {
    setShareRoom(true)
  })

  // 使用 MVVM Hook
  const {
    // 状态
    showProfileModal,
    showSpendingModal,
    showTransferModal,
    choosePlayerProfile,
    transactions,
    roomPlayers,
    loading,
    error,
    
    // 事件处理函数
    handleChoosePlayer,
    handleCloseProfileModal,
    handleShowTransferModal,
    handleCloseTransferModal,
    handleTransfer,
    handleExitRoom,
    clearError,
    
    // 获取数据的方法
    getCurrentUser,
    getPlayersForTransfer,
  } = useRoomViewModel(roomId, roomName);

  // 数据加载状态
  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <View className="text-lg">正在加载...</View>
      </View>
    )
  }

  // 错误状态
  if (error) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <View className="text-lg text-red-500">加载失败: {error}</View>
        <TaroButton onClick={clearError} className="mt-4">重试</TaroButton>
      </View>
    )
  }

  // 导航到结算页面
  const handleNavigateToSettlement = () => {
    Taro.navigateTo({
      url: `/pages/settlement/settlement?roomId=${roomId}&roomName=${roomName}`
    })
  }

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
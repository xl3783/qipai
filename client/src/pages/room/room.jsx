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
import socketService from '../../services/socketService.js'

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

  // 获取房间详情
  const getRoomDetail = useCallback(async () => {
    setLoading(true)
    try {
      const result = await restClient.post("/api/get-room-detail", {
        gameId: roomId,
      });
      console.log(result);
      setRoommates(result.data.roommates)
      setTransactions(result.data.transactions)
    } catch (error) {
      console.error('获取房间详情失败:', error);
    } finally {
      setLoading(false)
    }
  }, [roomId]);

  // 初始化WebSocket连接和房间监听
  useEffect(() => {
    // 获取token
    const token = Taro.getStorageSync('token');
    if (!token) {
      console.error('缺少认证token，无法连接WebSocket');
      Taro.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 2000
      });
      return;
    }
    
    // 连接WebSocket
    socketService.connect('http://localhost:3000', token);
    
    // 加入房间
    socketService.joinRoom(roomId);
    
    // 监听房间更新
    socketService.onRoomUpdate((data) => {
      console.log('收到房间更新:', data);
      
      if (data.roomDetail) {
        setRoommates(data.roomDetail.roommates || []);
        setTransactions(data.roomDetail.transactions || []);
      }
      
      // 显示转账通知
      if (data.type === 'transfer') {
        Taro.showToast({
          title: `转账成功: ${data.transfer.from} → ${data.transfer.to} ${data.transfer.points}`,
          icon: 'success',
          duration: 3000
        });
      }
    });

    // 初始加载房间数据
    getRoomDetail();

    // 清理函数
    return () => {
      socketService.leaveRoom();
      socketService.offRoomUpdate();
    };
  }, [roomId, getRoomDetail]);

  // 页面卸载时断开WebSocket连接
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  const leftRoom = useCallback(async () => {
    try {
      const result = await restClient.post("/api/games/leave", {
        gameId: roomId,
      });
      console.log(result);
      
      // 离开WebSocket房间
      socketService.leaveRoom();
      
      Taro.navigateTo({
        url: '/pages/index/index',
      });
    } catch (error) {
      console.error(error);
    }
  }, [roomId])

  // 处理转账
  const handleTransfer = useCallback(async (fromPlayerId, toPlayerId, amount, description) => {
    try {
      const result = await restClient.post("/api/games/transfer", {
        gameId: roomId,
        from: fromPlayerId,
        to: toPlayerId,
        points: amount,
        description: description || '转账'
      });
      
      console.log('转账成功:', result);
      
      // 关闭转账模态框
      setShowTransferModal(false);
      
      // 转账成功后，WebSocket会自动更新房间数据
      Taro.showToast({
        title: '转账成功',
        icon: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('转账失败:', error);
      Taro.showToast({
        title: '转账失败',
        icon: 'error',
        duration: 2000
      });
    }
  }, [roomId]);

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
          <Button
            onClick={() => Taro.navigateTo({ url: `/pages/settlement/settlement?roomId=${roomId}&roomName=${roomName}` })}
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
        
        {/* 测试按钮 - 开发环境使用 */}
        {process.env.NODE_ENV === 'development' && (
          <View className="mt-4">
            <Button
              onClick={() => {
                console.log('测试WebSocket连接...');
                console.log('当前房间ID:', roomId);
                console.log('当前用户ID:', Taro.getStorageSync('userId'));
                console.log('WebSocket连接状态:', socketService.isConnected());
              }}
              className="w-full h-10 bg-blue-500 text-white text-sm"
            >
              测试WebSocket连接
            </Button>
          </View>
        )}
      </View>
      
      {/* 转账模态框 */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        players={roommates.map(roommate => ({
          id: roommate.id,
          username: roommate.name,
          avatarUrl: roommate.avatar
        }))}
        currentPlayer={{
          id: socketService.getCurrentUserId() || Taro.getStorageSync('userId'),
          username: '当前用户'
        }}
        onTransfer={handleTransfer}
      />
    </View>
  )
} 
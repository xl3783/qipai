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

  const currentUserId = Taro.getStorageSync('userInfo').playerId
  // const currentUserId = "123"
  console.log("currentUserId", currentUserId);

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

  // const [showTransferModal, setShowTransferModal] = useState(false)
  // const [transferAmount, setTransferAmount] = useState(0)
  // const [transferTo, setTransferTo] = useState(null)
  const [transferInfo, setTransferInfo] = useState({
    show: false,
    amount: 0,
    to: null
  })
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
      setRoommates(result.data.roommates
        .sort((a, b) => {
          if (a.id === currentUserId) {
            return -1
          }
          if (b.id === currentUserId) {
            return 1
          }
          return 0
        })
      )
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
    socketService.connect();
    
    // 加入房间
    // socketService.joinRoom(roomId);
    
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
          title: `转账成功: ${data.transfer.fromName} → ${data.transfer.toName} ${data.transfer.points}`,
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

  // 使用 useCallback 包装转账回调，确保获取最新状态
  const handleTransferCallback = useCallback((data) => {
    console.log("onTransfer data", data);
    // 使用函数式更新确保获取最新状态
    setRoommates(prevRoommates => {
      console.log("prevRoommates", prevRoommates);
      const newRoommates = prevRoommates.map(roommate => {
        if (roommate.id === data.from) {
          return { ...roommate, balance: Number(roommate.balance) - Number(data.amount) }
        }
        if (roommate.id === data.to) {
          return { ...roommate, balance: Number(roommate.balance) + Number(data.amount) }
        }
        return roommate
      });
      console.log("newRoommates", newRoommates);
      return newRoommates;
    });

    // 更新transactions, 需要根据id去重, 往数组前面插入
    setTransactions(prevTransactions => {
      const newTransactions = [data, ...prevTransactions];
      console.log("newTransactions", newTransactions);
      return newTransactions;
    });
  }, []);

  const handleLeaveRoomCallback = useCallback((data) => {
    if (data.userId !== currentUserId) {
      setRoommates(prevRoommates => {
        return prevRoommates.filter(roommate => roommate.id !== data.userId)
      })
    }
  }, []);

  const handleJoinRoomCallback = useCallback((data) => {
    if (data.userId !== currentUserId) {
      setRoommates(prevRoommates => {
        if (prevRoommates.find(roommate => roommate.id === data.userId)) {  
          return prevRoommates
        }
        return [...prevRoommates, {
          id: data.userId,
          name: data.username,
          avatar: data.userAvatar,
          balance: 0
        }]
      })
    }
  }, []);

  // 注册转账监听器
  useEffect(() => {
    socketService.onTransfer(handleTransferCallback);
    socketService.onLeaveRoom(handleLeaveRoomCallback);
    socketService.onJoinRoom(handleJoinRoomCallback);
    return () => {
      // 清理转账监听器
      socketService.listeners.delete('transfer');
      socketService.listeners.delete('leave');
      socketService.listeners.delete('join');
    };
  }, [handleTransferCallback, handleLeaveRoomCallback, handleJoinRoomCallback]);

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
  const handleTransfer = useCallback(async (toPlayerId, amount) => {
    try {
      const result = await restClient.post("/api/games/transfer", {
        gameId: roomId,
        to: toPlayerId,
        points: amount,
        description: '转账'
      });
      
      console.log('转账结果:', result);
      
      // 关闭转账模态框
      // setShowTransferModal(false);
      setTransferInfo({ show: false, amount: 0, to: null });
      if (result.data.success) {
// 转账成功后，WebSocket会自动更新房间数据
Taro.showToast({
  title: '转账成功',
  icon: 'success',
  duration: 2000
});
      } else {
        Taro.showToast({
          title: '转账失败',
          icon: 'error',
          duration: 2000
        });
      }
      
      
    } catch (error) {
      console.error('转账失败:', error);
      Taro.showToast({
        title: '转账失败',
        icon: 'error',
        duration: 2000
      });
    }
  }, [roomId]);

  const onAvatarClick = useCallback((roommate) => {
    console.log("roommate", roommate);
    console.log("currentUserId", currentUserId);
    if (roommate.id === currentUserId) {
      return
    }
    setTransferInfo({
      show: true,
      amount: 0,
      to: {
        id: roommate.id,
        name: roommate.name,
        avatar: roommate.avatar
      }
    })
  }, [currentUserId])

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
                房间
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
                  onClick={() => onAvatarClick(roommate)}
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
                        {transaction.fromName} → {transaction.toName}
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
      </View>

        {transferInfo.show && (
          
      <ModalDialog
        isOpen={transferInfo.show}
        onClose={() => setTransferInfo({ show: false, amount: 0, to: null })}
      >
        <View>
          向 {transferInfo.to.name} 转账: 
          <Input type="number"
          focus={true}
          onInput={(e) => {
            setTransferInfo({ ...transferInfo, amount: e.detail.value })
          }}
           />
        </View>
        <View>
          <Button onClick={() => setTransferInfo({ show: false, amount: 0, to: null })}>取消</Button>
          <Button onClick={() => handleTransfer(transferInfo.to.id, transferInfo.amount)}>转账</Button>
        </View>
      </ModalDialog> )}
    </View>
  )
} 
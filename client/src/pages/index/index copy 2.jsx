import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { IndexPageViewModel } from '../../vms/IndexPageViewModel.js'
import { AtButton, AtCard, AtAvatar } from 'taro-ui'
import 'taro-ui/dist/style/index.scss'
import './index.scss'
import DefaultAvatar from '../../assets/default-avatar.png'
// import MyCommonClass from '../../shared/index.js'
// import Avatar from '../../components/Avatar.js'

export default function Index() {
  const [viewModel] = useState(() => new IndexPageViewModel());
  const [userInfo, setUserInfoState] = useState({
    username: '游客',
    avatarUrl: '',
    playerId: '',
  });
  const [gameStats, setGameStatsState] = useState({
    totalPoints: 0,
    wins: 0,
    losses: 0,
    winRate: '--',
    friendRanking: 0,
  });
  const [showQRModal, setShowQRModalState] = useState(false);
  const [isLoggingIn, setIsLoggingInState] = useState(true);
  const [loginData, setLoginDataState] = useState(null);
  const [roomId, setRoomIdState] = useState('123');

  const setUserInfo = useCallback((userInfo) => {
    viewModel.setUserInfo(userInfo);
    setUserInfoState(userInfo);
  }, [viewModel]);

  const setGameStats = useCallback((gameStats) => {
    viewModel.setGameStats(gameStats);
    setGameStatsState(gameStats);
  }, [viewModel]);
  useLoad(() => {
    console.log('Page loaded.')
  })
  return (
    <View className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <View className="container mx-auto px-4 py-8 max-w-md">
        {/* Profile Header */}
        <View className="text-center mb-8">
          <View className="relative inline-block mb-6">
            {/* <Avatar className="h-32 w-32 ring-4 ring-white shadow-2xl">
              <AvatarImage src="/placeholder.svg?height=128&width=128" alt="用户头像" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar> */}
            {/* <View className="absolute -bottom-2 -right-2 p-2 bg-green-500 rounded-full">
              <Star className="h-4 w-4 text-white" />
            </View> */}
          </View>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">游客</h1>

          <View className="flex items-center justify-center gap-2 mb-6">
            {/* <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 px-4 py-2"> */}
              {/* <Trophy className="h-4 w-4 mr-1" /> */}
              总积分: 0
            {/* </Badge> */}
          </View>

          {/* Stats Card */}
          <AtCard isFull={true} className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <View className="p-6">
              <View className="grid grid-cols-3 gap-4 text-center">
                <View>
                  <View className="text-2xl font-bold text-green-600 mb-1">0</View>
                  <View className="text-sm text-gray-600">胜场</View>
                </View>
                <View>
                  <View className="text-2xl font-bold text-red-600 mb-1">0</View>
                  <View className="text-sm text-gray-600">负场</View>
                </View>
                <View>
                  <View className="text-2xl font-bold text-blue-600 mb-1">--</View>
                  <View className="text-sm text-gray-600">胜率</View>
                </View>
              </View>  
            </View>
          </AtCard>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">
          {/* <Link href="/pages/room/index"> */}
            <AtButton
              size="normal"
              className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg text-lg"
            >
              {/* <Plus className="h-6 w-6 mr-3" /> */}
              创建房间
            </AtButton>
          {/* </Link> */}

          {/* <Link href="/join-room"> */}
            <AtButton
              size="normal"
              variant="outline"
              className="w-full h-16 border-2 border-blue-200 hover:bg-blue-50 font-semibold text-lg bg-white/80 backdrop-blur-sm"
            >
              {/* <LogIn className="h-6 w-6 mr-3" /> */}
              加入房间
            </AtButton>
          {/* </Link> */}

          {/* <Link href="/battle-records"> */}
            <AtButton
              size="normal"
              variant="outline"
              className="w-full h-16 border-2 border-purple-200 hover:bg-purple-50 font-semibold text-lg bg-white/80 backdrop-blur-sm"
            >
              {/* <TrendingUp className="h-6 w-6 mr-3" /> */}
              战绩
            </AtButton>
          {/* </Link> */}
        </View>
      </View>
    </View>
  )

  return (
    <View className="index-page" style={{ minHeight: '100vh', background: '#f8f8f8' }}>
      {/* card 隐藏标题 */}
      <AtCard isFull={true}>
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AtAvatar
            circle
            image={userInfo.avatarUrl || DefaultAvatar}
            size="large"
          />
          <Text style={{ fontSize: '20px', fontWeight: 'bold', marginTop: 8 }}>{userInfo.username}</Text>
          <Text style={{ fontSize: '18px', color: '#888', marginTop: 4 }}>总积分：{gameStats.totalPoints}</Text>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>胜场：{gameStats.wins}</Text>
            <Text style={{ margin: '0 8px' }}>|</Text>
            <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>负场：{gameStats.losses}</Text>
            <Text style={{ margin: '0 8px' }}>|</Text>
            <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>胜率：{gameStats.winRate}</Text>
          </View>
        </View>
      </AtCard>
      <View style={{ margin: '32px 16px 0 16px' }}>
        <AtButton
          type="primary"
          full
          circle
          onClick={() => Taro.navigateTo({ url: '/pages/room/index?roomId=' + roomId })}
          customStyle={{ marginBottom: '16px' }}
        >
          创建房间
        </AtButton>
        <AtButton
          type="secondary"
          full
          circle
          onClick={() => Taro.showToast({ title: '加入房间功能开发中', icon: 'none' })}
          customStyle={{ marginBottom: '16px' }}
        >
          加入房间
        </AtButton>
        <AtButton
          type="secondary"
          full
          circle
          onClick={() => Taro.navigateTo({ url: '/pages/game-history/index' })}
        >
          战绩
        </AtButton>
      </View>
    </View>
  );
}

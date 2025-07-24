import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { IndexPageViewModel } from '../../vms/IndexPageViewModel.js'
import { AtButton, AtCard, AtAvatar, AtBadge } from 'taro-ui'
import 'taro-ui/dist/style/index.scss'
import './index.scss'
import DefaultAvatar from '../../assets/default-avatar.png'
import Avatar from '../../components/Avatar.js'

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
    console.log('UserInfo:', userInfo)
    console.log('GameStats:', gameStats)
  })

  const handleCreateRoom = () => {
    console.log('Creating room with ID:', roomId)
    Taro.navigateTo({ url: '/pages/room/index?roomId=' + roomId })
  }

  const handleJoinRoom = () => {
    console.log('Join room clicked')
    Taro.showToast({ title: '加入房间功能开发中', icon: 'none' })
  }

  const handleBattleRecord = () => {
    console.log('Battle record clicked')
    Taro.navigateTo({ url: '/pages/game-history/index' })
  }

  return (
    <View className="min-h-screen background-gradient">
      <View className="container">
        {/* Profile Header */}
        <View className="text-center mb-8">
          <View className="relative inline-block mb-6">
            <View className="avatar-container">
              <Avatar 
                size={128}
                src={userInfo.avatarUrl || DefaultAvatar}
                borderColor="white"
                borderWidth={4}
                shape="circle"
                className="avatar-image"
              />
              <View className="status-badge">
                <View className="status-icon">★</View>
              </View>
            </View>
          </View>

          <Text className="username">{userInfo.username}</Text>

          <View className="score-badge">
            <View className="trophy-icon">🏆</View>
            <Text className="score-text">总积分: {gameStats.totalPoints}</Text>
          </View>
        </View>

        {/* Stats Card */}
        <View className="stats-card">
          <View className="stats-content">
            <View className="stats-grid">
              <View className="stat-item">
                <Text className="stat-number wins">{gameStats.wins}</Text>
                <Text className="stat-label">胜场</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-number losses">{gameStats.losses}</Text>
                <Text className="stat-label">负场</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-number win-rate">{gameStats.winRate}</Text>
                <Text className="stat-label">胜率</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="action-buttons">
          <View 
            className="action-button create-room"
            onClick={handleCreateRoom}
          >
            <View className="button-icon">+</View>
            <Text className="button-text">创建房间</Text>
          </View>

          <View 
            className="action-button join-room"
            onClick={handleJoinRoom}
          >
            <View className="button-icon">→</View>
            <Text className="button-text">加入房间</Text>
          </View>

          <View 
            className="action-button battle-record"
            onClick={handleBattleRecord}
          >
            <View className="button-icon">📊</View>
            <Text className="button-text">战绩</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

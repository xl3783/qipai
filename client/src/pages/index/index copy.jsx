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

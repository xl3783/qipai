import { View, Text, Button } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { IndexPageViewModel } from '../../vms/IndexPageViewModel.js'
import './index.scss'
// import MyCommonClass from '../../shared/index.js'
import Avatar from '../../components/Avatar.js'

export default function Index() {

  const [viewModel] = useState(() => new IndexPageViewModel());

  // gameStats: {
  //   totalPoints: 0,
  //   wins: 0,
  //   losses: 0,
  //   winRate: '--',
  //   friendRanking: 0,
  // },
  // showQRModal: false,
  // isLoggingIn: false,
  // loginData: null,
  // roomId: '',

  // 使用 React 状态来管理需要响应式更新的数据
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

  // 包装 viewModel 的方法，确保状态更新时组件重新渲染
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

  // return (
  //   <View className='index' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
  //     <Button onClick={() => setUserInfo({ username: 'John', avatarUrl: 'https://example.com/avatar.png', playerId: '123' })}>Set User Info</Button>
  //     <Button onClick={() => setGameStats({ totalPoints: 100, wins: 10, losses: 5, winRate: '50%', friendRanking: 1 })}>Set Game Stats</Button>
  //     <Button onClick={() => Taro.navigateTo({ url: '/pages/room/index' })}>Go to Room</Button>
  //     <Text>userInfo.username: {userInfo.username}</Text>
  //     <Text>userInfo.avatarUrl: {userInfo.avatarUrl}</Text>
  //     <Text>userInfo.playerId: {userInfo.playerId}</Text>
  //     <Text>gameStats.totalPoints: {gameStats.totalPoints}</Text>
  //     <Text>gameStats.wins: {gameStats.wins}</Text>
  //     <Text>gameStats.losses: {gameStats.losses}</Text>
  //     <Text>gameStats.winRate: {gameStats.winRate}</Text>
  //     <Text>gameStats.friendRanking: {gameStats.friendRanking}</Text>
  //     <Text>showQRModal: {showQRModal}</Text>
  //     <Text>isLoggingIn: {isLoggingIn}</Text>
  //     <Text>loginData: {loginData}</Text>
  //     <Text>roomId: {roomId}</Text>

  //   </View>
  // )

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* <View style={{ height: '50px', backgroundColor: 'red' }}>头部</View> */}
      <View style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Avatar src={userInfo.avatarUrl} size={100} />
        <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>{userInfo.username}</Text>
        <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>总积分：{gameStats.totalPoints}</Text>

        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>胜场：{gameStats.wins}</Text>
          <Text>&nbsp;|&nbsp;&nbsp;</Text>
          <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>负场：{gameStats.losses}</Text>
          <Text>&nbsp;|&nbsp;&nbsp;</Text>
          <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>胜率：{gameStats.winRate}</Text>
          {/* <Text>|</Text> */}
          {/* <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>好友排名：{gameStats.friendRanking}</Text> */}
        </View>
        {/* <View style={{ width: '100px', backgroundColor: 'blue' }}>左侧</View> */}
        {/* <View style={{ width: '100px', backgroundColor: 'green' }}>右侧</View> */}
      </View>
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
        <Button style={{
          flex: 1,
          height: '100%',
          margin: '0 5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={
          () => Taro.navigateTo({ url: '/pages/room/index?roomId=' + roomId })
        }>创建房间</Button>
        <Button style={{
          flex: 1,
          height: '100%',
          margin: '0 5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>加入房间</Button>
        <Button style={{
          flex: 1,
          height: '100%',
          margin: '0 5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={
          () => Taro.navigateTo({ url: '/pages/game-history/index' })
        }>战绩</Button>
      </View>
    </View>
  );
}

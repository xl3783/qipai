import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react';
import AvatarGrid from '../../components/avatar-grid.js';
import TransactionHistory from '../../components/transaction-history.js';

export default function Room() {
//  // 状态
//  showProfileModal,
//  showSpendingModal,
//  showTransferModal,
//  choosePlayerProfile,
//  transactions,
//  roomPlayers,
//  loading,
//  error,
 
//  // 事件处理函数
//  handleChoosePlayer,
//  handleCloseProfileModal,
//  handleShowTransferModal,
//  handleCloseTransferModal,
//  handleTransfer,
//  handleExitRoom,
//  clearError,
 
//  // 获取数据的方法
//  getCurrentUser,
//  getPlayersForTransfer,

  const { roomId } = Taro.getCurrentInstance().router.params;
  console.log(roomId);

  const [roomName, setRoomName] = useState('');

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSpendingModal, setShowSpendingModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [choosePlayerProfile, setChoosePlayerProfile] = useState(null);
  const [transactions, setTransactions] = useState([{
    id: 1,
    from: '张三',
    to: '李四',
    score: 100,
    date: '2021-01-01 12:00:00',
  }, {
    id: 2,
    from: '李四',
    to: '张三',
    score: 100,
    date: '2021-01-01 12:00:00',
  }]);
  const [roomPlayers, setRoomPlayers] = useState([{
    id: 1,
    name: '张三',
    avatar: 'https://example.com/avatar.png',
    score: 100,
    isCurrentUser: true,
  }, {
    id: 2,
    name: '李四',
    avatar: 'https://example.com/avatar.png',
    score: 100,
  }, {
    id: 3,
    name: '王五',
    avatar: 'https://example.com/avatar.png',
    score: 100,
  }]);
  const [loading, setLoading] = useState(false);    
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [playerForTransfer, setPlayerForTransfer] = useState(null);
  const gridColumns = 6;

  useEffect(() => {
    Taro.setNavigationBarTitle({
      title: '房间：' + roomName
    });
  }, [roomName]);

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* <View style={{ height: '50px', backgroundColor: 'red' }}>头部</View> */}
      <View style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Text>roomId: {roomId}</Text>
        <Text>roomName: {roomName}</Text>
        <AvatarGrid players={roomPlayers} gridColumns={gridColumns} />
        {/* <View style={{ display: 'grid', 
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`, 
            gap: '10px',
            width: '100%',
            padding: '0 10px'
          }}>
        {
          roomPlayers.map((player) => (
            <View key={player.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar src={player.avatar} size={avatarSize} />
              <Text>{player.name}</Text>
              <Text>{player.score}</Text>
            </View>
          ))
        }
        </View> */}

<View className="room-history">
          <TransactionHistory transactions={transactions}
            players={roomPlayers}
          />
        </View>
        
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
          () => Taro.navigateTo({ url: '/pages/index/index' })
        }>创建房间</Button>
        <Button style={{
          flex: 1,
          height: '100%',
          margin: '0 5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={
          () => Taro.navigateTo({ url: '/pages/settlement/index' })
        }>结算</Button>
        <Button style={{
          flex: 1,
          height: '100%',
          margin: '0 5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        } } onClick={
          () => setRoomName('222')
        }>退出登录</Button>
      </View>
    </View>
  );

  return (
    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Text>Room</Text>
      <Button onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}>Go to Index</Button>
      <Text>roomId: {roomId}</Text>
      <Text>roomName: {roomName}</Text>
      <Text>showProfileModal: {showProfileModal}</Text>
      <Text>showSpendingModal: {showSpendingModal}</Text>
      <Text>showTransferModal: {showTransferModal}</Text>
      <Text>choosePlayerProfile: {choosePlayerProfile}</Text>
      {
        transactions.map((transaction) => (
          <Text key={transaction.id}>{transaction.from}{"->"}{transaction.to} {transaction.score} {transaction.date}</Text>
        ))
      }
      {
        roomPlayers.map((player) => (
          <Text key={player.id}>{player.name} {player.score} {player.avatar}</Text>
        ))
      }
      <Text>loading: {loading}</Text>
    </View>
  )
}
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react';
import AvatarGrid from '../../components/avatar-grid.js';
import TransactionHistory from '../../components/transaction-history.js';
import { AtButton, AtCard } from 'taro-ui';
import 'taro-ui/dist/style/index.scss';

export default function Room() {
  const { roomId } = Taro.getCurrentInstance().router.params;
  console.log(roomId);

  const [roomName, setRoomName] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSpendingModal, setShowSpendingModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [choosePlayerProfile, setChoosePlayerProfile] = useState(null);
  const [transactions, setTransactions] = useState([
    { id: 1, from: '张三', to: '李四', score: 100, date: '2021-01-01 12:00:00' },
    { id: 2, from: '李四', to: '张三', score: 100, date: '2021-01-01 12:00:00' },
  ]);
  const [roomPlayers, setRoomPlayers] = useState([
    { id: 1, name: '张三', avatar: 'https://example.com/avatar.png', score: 100, isCurrentUser: true },
    { id: 2, name: '李四', avatar: 'https://example.com/avatar.png', score: 100 },
    { id: 3, name: '王五', avatar: 'https://example.com/avatar.png', score: 100 },
  ]);
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
    <View className="room-page" style={{ minHeight: '100vh', background: '#f8f8f8', display: 'flex', flexDirection: 'column' }}>
      <AtCard title={`房间ID: ${roomId || '--'}`} extra={roomName ? `房间名: ${roomName}` : ''} className="at-card-room-info" >
        <AvatarGrid players={roomPlayers} gridColumns={gridColumns} />
      </AtCard>
      <AtCard title="交易历史" className="at-card-history" style={{ marginTop: 16 }}>
        <TransactionHistory transactions={transactions} players={roomPlayers} />
      </AtCard>
      <View style={{ margin: '32px 16px 0 16px', display: 'flex', flexDirection: 'row', gap: 12 }}>
        <AtButton
          type="primary"
          circle
          onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}
          customStyle={{ flex: 1 }}
        >
          创建房间
        </AtButton>
        <AtButton
          type="secondary"
          circle
          onClick={() => Taro.navigateTo({ url: '/pages/settlement/index' })}
          customStyle={{ flex: 1 }}
        >
          结算
        </AtButton>
        <AtButton
          type="secondary"
          circle
          onClick={() => setRoomName('222')}
          customStyle={{ flex: 1 }}
        >
          退出登录
        </AtButton>
      </View>
    </View>
  );
}
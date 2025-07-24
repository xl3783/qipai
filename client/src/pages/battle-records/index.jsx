import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default class BattleRecords extends Component {
  componentDidMount() {}

  state = {
    rooms: [
      {
        id: 1,
        name: '房间1',
        status: '进行中',
        host: '张三',
        participants: 4,
        date: '2024/5/24',
        amount: 100,
        isActive: true,
      },
      {
        id: 2,
        name: '房间2',
        status: '已关闭',
        host: '李四',
        participants: 4,
        date: '2024/5/24',
        amount: 100,
        isActive: false,
      },
    ]
  }

  navigateToRoom = (roomId) => {
    Taro.navigateTo({
      url: `/pages/room/index?id=${roomId}`
    })
  }

  goBack = () => {
    Taro.navigateBack()
  }

  render() {
    const { rooms } = this.state

    return (
      <View className='battle-records-container'>
        <View className='header'>
          <Button className='back-button' onClick={this.goBack}>
            <Text className='back-icon'>←</Text>
          </Button>
          <View className='header-content'>
            <Text className='title'>战绩记录</Text>
            <Text className='subtitle'>查看所有房间历史</Text>
          </View>
        </View>

        <View className='room-list'>
          {rooms.map((room) => (
            <View key={room.id} className='room-card'>
              <View className='room-header'>
                <Text className='room-name'>{room.name}</Text>
                <View className={`status-badge ${room.isActive ? 'active' : 'inactive'}`}>
                  <Text className='status-icon'>{room.isActive ? '▶️' : '⏹️'}</Text>
                  <Text className='status-text'>{room.status}</Text>
                </View>
              </View>

              <View className='room-content'>
                <View className='room-info'>
                  <View className='host-info'>
                    <View className='avatar'>{room.host.charAt(0)}</View>
                    <View className='host-details'>
                      <Text className='host-name'>房主: {room.host}</Text>
                      <View className='room-meta'>
                        <Text className='participants'>👥 {room.participants}人</Text>
                        <Text className='date'>📅 {room.date}</Text>
                      </View>
                    </View>
                  </View>
                  <View className='amount'>
                    <Text className='amount-text'>💰¥{room.amount}</Text>
                  </View>
                </View>

                {room.isActive && (
                  <View className='room-actions'>
                    <Button 
                      className='enter-button'
                      onClick={() => this.navigateToRoom(room.id)}
                    >
                      进入房间
                    </Button>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {rooms.length === 0 && (
          <View className='empty-state'>
            <Text className='empty-icon'>👥</Text>
            <Text className='empty-text'>暂无房间记录</Text>
            <Button className='create-button' onClick={() => Taro.navigateTo({ url: '/pages/profile/index' })}>
              创建第一个房间
            </Button>
          </View>
        )}
      </View>
    )
  }
}
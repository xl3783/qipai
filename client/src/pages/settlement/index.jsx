import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default class Settlement extends Component {
  componentDidMount() {}

  state = {
    rankings: [
      {
        rank: 1,
        name: '玩家1',
        amount: 100,
        icon: '👑',
        color: 'gold',
      },
      {
        rank: 2,
        name: '玩家2',
        amount: -50,
        icon: '🥈',
        color: 'silver',
      },
    ]
  }

  returnToRoom = () => {
    Taro.navigateTo({
      url: '/pages/index/index'
    })
  }

  settleAndLeave = () => {
    Taro.showModal({
      title: '确认结算',
      content: '结算后将退出房间，确定要继续吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({
            title: '结算中...'
          })

          setTimeout(() => {
            Taro.hideLoading()
            Taro.showToast({
              title: '结算完成',
              icon: 'success'
            })

            setTimeout(() => {
              Taro.redirectTo({
                url: '/pages/profile/index'
              })
            }, 1500)
          }, 2000)
        }
      }
    })
  }

  goBack = () => {
    Taro.navigateBack()
  }

  render() {
    const { rankings } = this.state

    return (
      <View className='settlement-container'>
        <View className='header'>
          <Button className='back-button' onClick={this.goBack}>
            <Text className='back-icon'>←</Text>
          </Button>
          <View className='header-content'>
            <Text className='title'>房间结算</Text>
            <Text className='subtitle'>最终积分排行榜</Text>
          </View>
        </View>

        <View className='settlement-card'>
          <View className='card-header'>
            <Text className='trophy-icon'>🏆</Text>
            <Text className='card-title'>积分排行榜</Text>
          </View>
          
          <View className='rankings-list'>
            {rankings.map((player, index) => (
              <View key={index} className={`ranking-item rank-${player.rank}`}>
                <View className='ranking-left'>
                  <View className='rank-badge'>
                    <Text className='rank-number'>{player.rank}</Text>
                  </View>

                  <View className='player-avatar'>
                    <Text className='avatar-text'>{player.name.charAt(player.name.length - 1)}</Text>
                  </View>

                  <View className='player-info'>
                    <Text className='player-name'>{player.name}</Text>
                    <View className='player-medal'>
                      <Text className='medal-icon'>{player.icon}</Text>
                      <Text className='medal-text'>{player.rank === 1 ? '冠军' : '亚军'}</Text>
                    </View>
                  </View>
                </View>

                <View className='ranking-right'>
                  <View className={`amount-badge ${player.amount > 0 ? 'positive' : 'negative'}`}>
                    <Text className='amount-text'>¥{player.amount}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className='action-buttons'>
          <Button className='return-button' onClick={this.returnToRoom}>
            <Text className='button-icon'>🏠</Text>
            <Text className='button-text'>返回房间</Text>
          </Button>

          <Button className='settle-button' onClick={this.settleAndLeave}>
            <Text className='button-icon'>💰</Text>
            <Text className='button-text'>结算退房</Text>
          </Button>
        </View>

        <View className='summary-card'>
          <Text className='summary-text'>本局游戏已结束</Text>
          <Text className='winner-text'>
            恭喜 <Text className='winner-name'>玩家1</Text> 获得胜利！
          </Text>
        </View>
      </View>
    )
  }
}
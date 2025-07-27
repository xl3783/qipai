import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
// import { Avatar, Card, Badge } from '../../components'
import Taro from '@tarojs/taro'
import './index.scss'

export default class Index extends Component {
  componentDidMount() {}

  state = {
    roommates: [
      { name: "张三", avatar: "", balance: 100, id: "zhangsan" },
      { name: "李四", avatar: "", balance: 100, id: "lisi" },
      { name: "王五", avatar: "", balance: 100, id: "wangwu" },
    ],
    transactions: [
      { from: "张三", to: "李四", amount: 100, type: "transfer" },
      { from: "李四", to: "张三", amount: 100, type: "transfer" },
    ]
  }

  navigateToCreateRoom = () => {
    Taro.navigateTo({
      url: '/pages/create-room/index'
    })
  }

  navigateToTransfer = () => {
    Taro.navigateTo({
      url: '/pages/transfer/index'
    })
  }

  navigateToSettlement = () => {
    Taro.navigateTo({
      url: '/pages/settlement/index'
    })
  }

  render() {
    const { roommates, transactions } = this.state

    return (
      <View className='index-container'>
        {/* Header */}
        <View className='header'>
          <View className='room-info'>
            <Text className='room-icon'>🏠</Text>
            <View className='room-details'>
              <Text className='room-title'>房间 ID: 123</Text>
              <Text className='room-subtitle'>共享费用管理</Text>
            </View>
          </View>
        </View>

        {/* Roommates Section */}
        <View className='roommates-card'>
          <View className='card-header'>
            <Text className='section-icon'>👥</Text>
            <Text className='section-title'>室友信息</Text>
          </View>
          <View className='roommates-grid'>
            {roommates.map((roommate, index) => (
              <View key={index} className='roommate-item'>
                <View className='avatar'>
                  <Text className='avatar-text'>{roommate.name.charAt(0)}</Text>
                </View>
                <Text className='roommate-name'>{roommate.name}</Text>
                <View className='balance-badge'>
                  <Text className='balance-text'>¥{roommate.balance}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Transaction History */}
        <View className='transaction-card'>
          <View className='card-header'>
            <Text className='section-icon'>📋</Text>
            <Text className='section-title'>交易历史</Text>
          </View>
          
          {/* Room Expenses Summary */}
          <View className='expense-summary'>
            <View className='summary-left'>
              <Text className='summary-icon'>📊</Text>
              <View className='summary-info'>
                <Text className='summary-title'>房间流水</Text>
                <Text className='summary-subtitle'>(2笔) 总计</Text>
              </View>
            </View>
            <Text className='summary-amount'>¥200</Text>
          </View>

          {/* Individual Transactions */}
          <View className='transactions-list'>
            {transactions.map((transaction, index) => (
              <View key={index} className='transaction-item'>
                <View className='transaction-users'>
                  <View className='user-avatar'>
                    <Text className='avatar-text'>{transaction.from.charAt(0)}</Text>
                  </View>
                  <Text className='arrow'>→</Text>
                  <View className='user-avatar'>
                    <Text className='avatar-text'>{transaction.to.charAt(0)}</Text>
                  </View>
                  <View className='transaction-info'>
                    <Text className='transaction-text'>{transaction.from} → {transaction.to}</Text>
                    <Text className='transaction-type'>转账</Text>
                  </View>
                </View>
                <Text className='transaction-amount'>¥{transaction.amount}</Text>
              </View>
            ))}
          </View>

          {/* Daily Summary */}
          <View className='daily-summary'>
            <View className='summary-item'>
              <Text className='summary-label'>今日交易统计</Text>
              <Text className='summary-value'>2笔</Text>
            </View>
            <View className='summary-item'>
              <Text className='summary-label'>交易笔数</Text>
              <Text className='summary-value'>2</Text>
            </View>
            <View className='summary-item'>
              <Text className='summary-label'>交易总额</Text>
              <Text className='summary-value amount'>¥200</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className='action-buttons'>
          <Button className='primary-button' onClick={this.navigateToCreateRoom}>
            <Text className='button-icon'>🏠</Text>
            <Text className='button-text'>创建房间</Text>
          </Button>
          <Button className='secondary-button' onClick={this.navigateToTransfer}>
            <Text className='button-icon'>💰</Text>
            <Text className='button-text'>转账</Text>
          </Button>
          <Button className='secondary-button' onClick={this.navigateToSettlement}>
            <Text className='button-icon'>📊</Text>
            <Text className='button-text'>结算</Text>
          </Button>
        </View>
      </View>
    )
  }
}
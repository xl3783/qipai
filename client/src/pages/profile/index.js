import { Component } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default class Profile extends Component {
  componentDidMount() {}

  navigateToCreateRoom = () => {
    Taro.navigateTo({
      url: '/pages/create-room/index'
    })
  }

  navigateToJoinRoom = () => {
    Taro.navigateTo({
      url: '/pages/join-room/index'
    })
  }

  navigateToBattleRecords = () => {
    Taro.navigateTo({
      url: '/pages/battle-records/index'
    })
  }

  render() {
    return (
      <View className='profile-container'>
        <View className='profile-header'>
          <View className='avatar-container'>
            <View className='avatar'>
              <Text className='avatar-icon'>👤</Text>
            </View>
            <View className='status-badge'>
              <Text className='star-icon'>⭐</Text>
            </View>
          </View>
          
          <Text className='username'>游客</Text>
          
          <View className='score-badge'>
            <Text className='trophy-icon'>🏆</Text>
            <Text className='score-text'>总积分: 1</Text>
          </View>

          <View className='stats-card'>
            <View className='stat-item'>
              <Text className='stat-number win'>1</Text>
              <Text className='stat-label'>胜场</Text>
            </View>
            <View className='stat-item'>
              <Text className='stat-number lose'>0</Text>
              <Text className='stat-label'>负场</Text>
            </View>
            <View className='stat-item'>
              <Text className='stat-number rate'>--</Text>
              <Text className='stat-label'>胜率</Text>
            </View>
          </View>
        </View>

        <View className='action-buttons'>
          <Button 
            className='primary-button'
            onClick={this.navigateToCreateRoom}
          >
            <Text className='button-icon'>➕</Text>
            <Text className='button-text'>创建房间</Text>
          </Button>

          <Button 
            className='secondary-button'
            onClick={this.navigateToJoinRoom}
          >
            <Text className='button-icon'>🚪</Text>
            <Text className='button-text'>加入房间</Text>
          </Button>

          <Button 
            className='secondary-button'
            onClick={this.navigateToBattleRecords}
          >
            <Text className='button-icon'>📊</Text>
            <Text className='button-text'>战绩</Text>
          </Button>
        </View>
      </View>
    )
  }
}
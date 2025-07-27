import { View, Text, Button as TaroButton, ScrollView } from "@tarojs/components";
// import { useGameHistoryViewModel } from "../../hooks/useGameHistoryViewModel";
import "./index.scss";
import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';

export default function GameHistory() {
  // const {
  //   rooms,
  //   stats,
  //   loading,
  //   error,
  //   refreshing,
  //   handleRoomClick,
  //   handleRefresh,
  //   clearError,
  //   formatTime,
  //   getStatusText,
  //   getStatusClass,
  // } = useGameHistoryViewModel();

  const rooms = [
    {
      id: '1',
      name: '房间1',
      status: 'playing',
      hostName: '张三',
      playerCount: 4,
      createdAt: 1716537600000,
      totalAmount: 100,
    },
    {
      id: '2',
      name: '房间2',
      status: 'finished',
      hostName: '李四',
      playerCount: 4,
      createdAt: 1716537600000,
      totalAmount: 100,
    },
  ]
  const loading = false
  const error = null
  const refreshing = false
  const handleRoomClick = useCallback((room) => {
    if (room.status === 'playing' || room.status === 'waiting') {
      // 正在进行中的房间，进入房间页面
      Taro.navigateTo({
        url: `/pages/room/index?roomId=${room.id}&roomName=${encodeURIComponent(room.name)}`
      });
    } else if (room.status === 'finished') {
      // 已结束的房间，进入结算页面
      Taro.navigateTo({
        url: `/pages/settlement/index?roomId=${room.id}&roomName=${encodeURIComponent(room.name)}`
      });
    } else {
      // 已关闭的房间，显示提示
      Taro.showToast({
        title: '房间已取消',
        icon: 'none'
      });
    }
  }, [])
  const handleRefresh = useCallback(() => {
    console.log('refresh')
  }, [])
  const clearError = useCallback(() => {
    console.log('clearError')
  }, [])
  const formatTime = useCallback((dateString) => {
    const date = new Date(Number(dateString));
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }, [])
  const getStatusText = useCallback((status) => {
    switch (status) {
      case 'waiting':
      case 'playing':
        return '进行中';
      case 'cancelled':
        return '已取消';
      case 'finished':
        return '已关闭';
      default:
        return '未知';
    }
  }, [])
  const getStatusClass = useCallback((status) => {
    switch (status) {
      case 'waiting':
      case 'playing':
        return 'active';
      case 'cancelled':
        return 'cancelled';
      case 'finished':
        return 'finished';
      default:
        return '';
    }
  }, [])

  // 加载状态
  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <View className="text-lg">正在加载...</View>
      </View>
    );
  }

  // 错误状态
  if (error) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <View className="text-center">
          <View className="text-lg text-red-500 mb-4">加载失败: {error}</View>
          <TaroButton onClick={clearError} className="bg-orange-500 text-white px-6 py-2 rounded">
            重试
          </TaroButton>
        </View>
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-gray-50 game-history">

      {/* Room List */}
      <ScrollView 
        className="flex-1 px-4"
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
      >
        {rooms.length === 0 ? (
          <View className="empty-state">
            <View className="empty-icon">
              <Text className="text-4xl">📊</Text>
            </View>
            <Text className="text-lg font-semibold text-gray-600 mb-2">暂无战绩记录</Text>
            <Text className="text-sm text-gray-500 text-center">
              开始创建房间或加入房间来记录你的战绩吧！
            </Text>
          </View>
        ) : (
          <View className="space-y-3 pb-4">
            {rooms.map((room) => (
              <View
                key={room.id}
                className="room-item bg-white rounded-lg p-4 shadow-sm border"
                onClick={() => handleRoomClick(room)}
              >
                <View className="flex items-center justify-between mb-2">
                  <Text className="font-semibold text-lg truncate flex-1 mr-2">
                    {room.name}
                  </Text>
                  <View className={`status-badge ${getStatusClass(room.status)} px-2 py-1 rounded-full text-xs`}>
                    {getStatusText(room.status)}
                  </View>
                </View>
                
                <View className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <Text>房主: {room.hostName}</Text>
                  <Text>{room.playerCount}人</Text>
                </View>
                
                <View className="flex items-center justify-between">
                  <Text className="text-sm text-gray-500">
                    {formatTime(room.createdAt)}
                  </Text>
                  <Text className="font-semibold text-orange-600">
                    ¥{room.totalAmount}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
} 
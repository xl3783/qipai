"use client"

import { View, Button, Text } from '@tarojs/components'
import { Image } from '@tarojs/components'

export default function PlayerProfileModal({ isOpen, onClose, player, onUpdateNickname, onExitRoom }) {
  if (!isOpen) return null
  return (
    <View className='fixed left-0 top-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60'>
      <View className='bg-white rounded-lg p-6 w-80'>
        <View className='flex flex-col items-center gap-2'>
          <View className='w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2'>
            {player.avatarUrl ? <Image src={player.avatarUrl} className='w-full h-full rounded-full' mode='aspectFill' /> : <Text>👤</Text>}
          </View>
          <Text className='text-lg font-semibold'>{player.username}</Text>
          <Text className='text-2xl font-bold text-orange-500'>¥{player.balance}</Text>
        </View>
        <View className='grid grid-cols-2 gap-3'>
          <Button onClick={onUpdateNickname} className='bg-gray-100'>更新昵称</Button>
          <Button 
          onClick={onExitRoom} 
          className='bg-orange-500'
          hoverClass="hover-bg-orange-600"
        >
          退出房间
        </Button>
        </View>
        <Button className='mt-4 w-full' onClick={onClose}>关闭</Button>
      </View>
    </View>
  )
} 
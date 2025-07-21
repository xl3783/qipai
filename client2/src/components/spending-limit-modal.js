"use client"

import { View, Button, Input, Text } from '@tarojs/components'
import { useState } from 'react'

export default function SpendingLimitModal({ isOpen, onClose, onConfirm }) {
  const [limit, setLimit] = useState(0)
  const [percentage, setPercentage] = useState(0)
  if (!isOpen) return null
  return (
    <View className='fixed left-0 top-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60'>
      <View className='bg-white rounded-lg p-6 w-80'>
        <Text className='block text-center text-lg font-semibold mb-4'>请大家喝茶吃饭吧！上限是：</Text>
        <Input
          type='number'
          value={limit}
          onInput={e => setLimit(Number(e.detail.value))}
          className='text-center text-2xl font-bold text-orange-500 border-2 mb-4'
          placeholder='0'
        />
        <View className='flex flex-col gap-4'>
          <Text className='text-center text-sm'>从每笔扣除 {percentage}%</Text>
          {/* Slider 可用 Input[type=range] 或自定义实现，这里用 Input 简化 */}
          <Input
            type='range'
            min='0'
            max='100'
            value={percentage}
            onInput={e => setPercentage(Number(e.detail.value))}
            className='w-full'
          />
          <Text className='text-center text-sm text-orange-500'>本设置将从下把开始生效</Text>
        </View>
        <View className='grid grid-cols-2 gap-3 mt-4'>
          <Button onClick={onClose}>取消</Button>
          <Button 
            onClick={() => onConfirm(limit)} 
            className='bg-orange-500'
            hoverClass="hover-bg-orange-600"
          >
            确认
          </Button>
        </View>
      </View>
    </View>
  )
} 
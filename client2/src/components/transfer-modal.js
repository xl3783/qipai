"use client"

import { View, Button, Input, Text, Textarea, Picker } from '@tarojs/components'
import { useState, useEffect } from 'react'
import PlayerAvatar from "./player-avatar"

export default function TransferModal({ isOpen, onClose, players, currentPlayer, onTransfer }) {
  const [fromPlayerId, setFromPlayerId] = useState(currentPlayer?.id || '')
  const [toPlayerId, setToPlayerId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const fromPlayer = players?.find((p) => p.id === fromPlayerId)
  const toPlayer = players?.find((p) => p.id === toPlayerId)

  // 当currentPlayer变化时更新fromPlayerId
  useEffect(() => {
    if (currentPlayer?.id && !fromPlayerId) {
      setFromPlayerId(currentPlayer.id)
    }
  }, [currentPlayer?.id, fromPlayerId])

  const handleTransfer = () => {
    if (!fromPlayerId || !toPlayerId || !amount || fromPlayerId === toPlayerId) {
      return
    }

    const transferAmount = Number.parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return
    }

    onTransfer(fromPlayerId, toPlayerId, transferAmount, description)

    // Reset form
    setToPlayerId('')
    setAmount('')
    setDescription('')
  }

  const quickAmounts = [10, 20, 50, 100, 200, 500]

  // 如果没有数据则不渲染
  if (!isOpen) return null

  return (
    <View className='fixed left-0 top-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60'>
      <View className='bg-white rounded-lg p-6 w-96'>
        <Text className='block text-center text-lg font-semibold mb-4'>转账记分</Text>
        <View className='flex flex-col gap-6 py-4'>
          <View className='flex flex-col gap-2'>
            <Text>付款人</Text>
            <Picker mode='selector' range={players?.map(p => p.username) || []} onChange={e => setFromPlayerId(players[e.detail.value]?.id || '')}>
              <View className='border p-2 rounded'>{fromPlayer?.username || '选择付款人'}</View>
            </Picker>
          </View>
          <View className='flex items-center justify-center my-2'>
            <Text>{fromPlayer?.username || '付款人'}</Text>
            <Text className='mx-2'>→</Text>
            <Text>{toPlayer?.username || '收款人'}</Text>
          </View>
          <View className='flex flex-col gap-2'>
            <Text>收款人</Text>
            <Picker mode='selector' range={players?.filter(p => p.id !== fromPlayerId).map(p => p.username) || []} onChange={e => setToPlayerId(players?.filter(p => p.id !== fromPlayerId)[e.detail.value]?.id || '')}>
              <View className='border p-2 rounded'>{toPlayer?.username || '选择收款人'}</View>
            </Picker>
          </View>
          <View className='flex flex-col gap-2'>
            <Text>转账金额</Text>
            <Input type='number' value={amount} onInput={e => setAmount(e.detail.value)} placeholder='输入金额' className='text-center text-lg' />
            <View className='grid grid-cols-3 gap-2 mt-2'>
              {quickAmounts.map((quickAmount) => (
                <Button key={quickAmount} onClick={() => setAmount(quickAmount.toString())} className='text-xs'>¥{quickAmount}</Button>
              ))}
            </View>
          </View>
          <View className='flex flex-col gap-2'>
            <Text>备注 (可选)</Text>
            <Textarea value={description} onInput={e => setDescription(e.detail.value)} placeholder='输入转账备注...' className='resize-none' rows={2} />
          </View>
          {fromPlayer && toPlayer && amount && (
            <View className='bg-orange-50 p-3 rounded-lg'>
              <Text className='text-sm text-center'>{fromPlayer.name} → {toPlayer.name}</Text>
              <Text className='text-lg font-bold text-center text-orange-600 mt-1'>¥{amount}</Text>
              {description && <Text className='text-xs text-center text-muted-foreground mt-1'>{description}</Text>}
            </View>
          )}
          <View className='grid grid-cols-2 gap-3 mt-4'>
            <Button onClick={onClose}>取消</Button>
            <Button 
              onClick={handleTransfer} 
              disabled={!fromPlayerId || !toPlayerId || !amount || fromPlayerId === toPlayerId} 
              className='bg-orange-500'
              hoverClass="hover-bg-orange-600"
            >
              确认转账
            </Button>
          </View>
        </View>
      </View>
    </View>
  )
} 
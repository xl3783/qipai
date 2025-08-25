import React from 'react'
import { View, Text } from '@tarojs/components'
import Avatar from './avatar'

export default function AvatarDemo() {
  return (
    <View className="p-4 space-y-6">
      {/* 基础用法 */}
      <View>
        <Text className="text-lg font-semibold mb-3">基础用法</Text>
        <View className="flex items-center space-x-4">
          <Avatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
          <Avatar fallback="JD" />
          <Avatar fallback="张三" />
        </View>
      </View>

      {/* 不同尺寸 */}
      <View>
        <Text className="text-lg font-semibold mb-3">不同尺寸</Text>
        <View className="flex items-center space-x-4">
          <Avatar size="xs" fallback="XS" />
          <Avatar size="sm" fallback="SM" />
          <Avatar size="md" fallback="MD" />
          <Avatar size="lg" fallback="LG" />
          <Avatar size="xl" fallback="XL" />
          <Avatar size="2xl" fallback="2XL" />
        </View>
      </View>

      {/* 状态指示器 */}
      <View>
        <Text className="text-lg font-semibold mb-3">状态指示器</Text>
        <View className="flex items-center space-x-4">
          <Avatar fallback="在线" status="online" />
          <Avatar fallback="离线" status="offline" />
          <Avatar fallback="离开" status="away" />
          <Avatar fallback="忙碌" status="busy" />
        </View>
      </View>

      {/* 头像组 */}
      <View>
        <Text className="text-lg font-semibold mb-3">头像组</Text>
        <Avatar.Group max={4} spacing="md">
          <Avatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
          <Avatar fallback="张三" />
          <Avatar fallback="李四" />
          <Avatar fallback="王五" />
          <Avatar fallback="赵六" />
          <Avatar fallback="钱七" />
        </Avatar.Group>
      </View>

      {/* 组合式用法 */}
      <View>
        <Text className="text-lg font-semibold mb-3">组合式用法</Text>
        <View className="flex items-center space-x-4">
          <Avatar>
            <Avatar.Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
            <Avatar.Fallback>JD</Avatar.Fallback>
          </Avatar>
          
          <Avatar>
            <Avatar.Image src="invalid-url" />
            <Avatar.Fallback>错误</Avatar.Fallback>
          </Avatar>
        </View>
      </View>

      {/* 自定义样式 */}
      <View>
        <Text className="text-lg font-semibold mb-3">自定义样式</Text>
        <View className="flex items-center space-x-4">
          <Avatar 
            className="ring-2 ring-blue-500 ring-offset-2"
            fallback="自定义"
          />
          <Avatar 
            className="shadow-lg border-4 border-green-500"
            fallback="边框"
          />
          <Avatar 
            className="bg-gradient-to-r from-purple-400 to-pink-400"
            fallback="渐变"
          />
        </View>
      </View>
    </View>
  )
} 
import { View, Image } from '@tarojs/components'
import { useState } from 'react'
import defaultAvatar from '../assets/placeholder.png'

export default function PlayerAvatar({ name, avatar, size = 'md', onClick }) {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }
  
  // 使用相对路径来引用assets中的图片
  // const defaultAvatar = require('../assets/placeholder.png')
  
  const handleImageError = () => {
    console.log('PlayerAvatar: 图片加载失败', avatar)
    setImageError(true)
  }
  
  const handleImageLoad = () => {
    console.log('PlayerAvatar: 图片加载成功', avatar)
    // setImageError(false)
  }
  
  const imageSrc = imageError ? defaultAvatar : (avatar || defaultAvatar)
  
  return (
    <View className={`${sizeClasses[size]} flex items-center justify-center`} onClick={onClick}>
      <Image
        src={imageSrc}
        alt={name || '用户头像'}
        className='w-full h-full rounded-full'
        mode='aspectFill'
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      {/* 调试信息 - 开发时可以启用 */}
      {/* <View className="text-xs text-gray-500">{name}</View> */}
    </View>
  )
} 
import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

// Avatar组件
export const Avatar = ({ 
  src, 
  alt, 
  fallback, 
  size = 'md',
  status,
  className = '',
  onError,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm', 
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
    onError?.()
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const renderFallback = () => {
    if (typeof fallback === 'string') {
      return (
        <Text className="font-medium text-gray-600 bg-gray-100 flex items-center justify-center rounded-full">
          {fallback.slice(0, 2).toUpperCase()}
        </Text>
      )
    }
    return fallback
  }

  return (
    <View className={`relative inline-block ${sizeClasses[size]} ${className}`} {...props}>
      {/* 头像图片 */}
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        renderFallback()
      )}
      
      {/* 加载状态 */}
      {imageLoading && src && (
        <View className="absolute inset-0 bg-gray-200 rounded-full animate-pulse" />
      )}
      
      {/* 状态指示器 */}
      {status && (
        <View 
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`}
        />
      )}
    </View>
  )
}

// Avatar组相关组件
export const AvatarGroup = ({ 
  children, 
  max = 5,
  spacing = 'sm',
  className = '',
  ...props 
}) => {
  const spacingClasses = {
    xs: '-space-x-1',
    sm: '-space-x-2', 
    md: '-space-x-3',
    lg: '-space-x-4'
  }

  const avatars = React.Children.toArray(children)
  const visibleAvatars = avatars.slice(0, max)
  const hiddenCount = avatars.length - max

  return (
    <View className={`flex items-center ${spacingClasses[spacing]} ${className}`} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <View key={index} className="relative">
          {avatar}
        </View>
      ))}
      
      {hiddenCount > 0 && (
        <View className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
          <Text className="text-sm font-medium text-gray-600">
            +{hiddenCount}
          </Text>
        </View>
      )}
    </View>
  )
}

// Avatar.Image组件
export const AvatarImage = ({ 
  src, 
  alt, 
  className = '',
  onError,
  ...props 
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      className={`w-full h-full rounded-full object-cover ${className}`}
      onError={onError}
      {...props}
    />
  )
}

// Avatar.Fallback组件
export const AvatarFallback = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <View 
      className={`w-full h-full bg-gray-100 flex items-center justify-center rounded-full ${className}`}
      {...props}
    >
      {children}
    </View>
  )
}

// 导出默认组件
Avatar.Image = AvatarImage
Avatar.Fallback = AvatarFallback
Avatar.Group = AvatarGroup

export default Avatar 
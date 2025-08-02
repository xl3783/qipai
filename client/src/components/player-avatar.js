import { View } from '@tarojs/components'
import Avatar from './avatar'

export default function PlayerAvatar({ 
  name, 
  avatar, 
  size = 'md', 
  onClick,
  status,
  className = ''
}) {
  // 映射size到Avatar组件的size
  const sizeMap = {
    sm: 'sm',
    md: 'md', 
    lg: 'lg'
  }
  
  // 生成fallback文本
  const getFallback = () => {
    if (!name) return '用户'
    return name.length > 2 ? name.slice(0, 2) : name
  }
  
  return (
    <View onClick={onClick} className={className}>
      <Avatar
        src={avatar}
        alt={name || '用户头像'}
        fallback={getFallback()}
        size={sizeMap[size]}
        status={status}
        onError={(error) => {
          console.log('PlayerAvatar: 图片加载失败', avatar, error)
        }}
      />
    </View>
  )
} 
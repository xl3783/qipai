import React from 'react'

export interface AvatarProps {
  /** 头像图片URL */
  src?: string
  /** 图片alt属性 */
  alt?: string
  /** 图片加载失败时的fallback内容 */
  fallback?: string | React.ReactNode
  /** 头像尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** 用户状态指示器 */
  status?: 'online' | 'offline' | 'away' | 'busy'
  /** 自定义CSS类名 */
  className?: string
  /** 图片加载错误回调 */
  onError?: (error: any) => void
  /** 其他属性 */
  [key: string]: any
}

export interface AvatarImageProps {
  /** 图片URL */
  src: string
  /** 图片alt属性 */
  alt?: string
  /** 自定义CSS类名 */
  className?: string
  /** 图片加载错误回调 */
  onError?: (error: any) => void
  /** 其他属性 */
  [key: string]: any
}

export interface AvatarFallbackProps {
  /** 子元素 */
  children: React.ReactNode
  /** 自定义CSS类名 */
  className?: string
  /** 其他属性 */
  [key: string]: any
}

export interface AvatarGroupProps {
  /** 子元素 */
  children: React.ReactNode
  /** 最大显示数量 */
  max?: number
  /** 间距大小 */
  spacing?: 'xs' | 'sm' | 'md' | 'lg'
  /** 自定义CSS类名 */
  className?: string
  /** 其他属性 */
  [key: string]: any
}

export interface AvatarComponent extends React.FC<AvatarProps> {
  Image: React.FC<AvatarImageProps>
  Fallback: React.FC<AvatarFallbackProps>
  Group: React.FC<AvatarGroupProps>
} 
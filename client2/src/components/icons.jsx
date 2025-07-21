import React from 'react'
import { View } from '@tarojs/components'

// 简单的Plus图标组件，使用CSS样式适配小程序
const PlusIcon = ({ size = 24, color = '#6B7280', className = '', ...props }) => {
  const iconStyle = {
    width: `${size}px`,
    height: `${size}px`,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const lineStyle = {
    position: 'absolute',
    backgroundColor: color,
    borderRadius: '1px'
  }

  const horizontalLineStyle = {
    ...lineStyle,
    width: `${size * 0.6}px`,
    height: '2px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }

  const verticalLineStyle = {
    ...lineStyle,
    width: '2px',
    height: `${size * 0.6}px`,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }

  return (
    <View style={iconStyle} className={className} {...props}>
      <View style={horizontalLineStyle} />
      <View style={verticalLineStyle} />
    </View>
  )
}

// 导出图标组件
export const Icons = {
  Plus: PlusIcon
}

export default Icons 
import { View, Image } from '@tarojs/components'
import defaultAvatar from '../assets/placeholder.png'
import { useState } from 'react'

export default function Avatar({
    size = 100,
    src,
    borderColor = '#ccc',
    borderWidth = 2,
    shape = 'circle', // 'circle' 或 'square'
    onClick
  }) {
    const [imageError, setImageError] = useState(false);
    const borderRadius = shape === 'circle' ? '50%' : '4px';
    const imageSrc = imageError ? defaultAvatar : (src || defaultAvatar);

    const handleImageError = () => {
        console.log('Avatar: 图片加载失败', src)
        setImageError(true)
    }
    const handleImageLoad = () => {
        console.log('Avatar: 图片加载成功', src)
    }

    return (
      <View 
        className="avatar-container"
        style={{
          display: 'flex',
          width: `${size}px`,
          height: `${size}px`,
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius: borderRadius,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onClick}
      >
        <Image
          className="avatar-image"
          src={imageSrc}
          mode="aspectFill"
          style={{
            width: `calc(100% - ${borderWidth * 2}px)`,
            height: `calc(100% - ${borderWidth * 2}px)`,
            borderRadius: borderRadius
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </View>
    )
  }
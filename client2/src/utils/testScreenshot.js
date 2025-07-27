import Taro from '@tarojs/taro'

// 测试截图功能
export const testScreenshot = async () => {
  console.log('Testing screenshot functionality...')
  
  try {
    // 显示加载提示
    Taro.showLoading({
      title: '测试截图中...'
    })

    // 尝试截图
    const tempFilePath = await new Promise((resolve, reject) => {
      Taro.createSelectorQuery()
        .selectViewport()
        .fields({
          node: true,
          size: true,
        })
        .exec((res) => {
          console.log('Screenshot result:', res)
          if (res && res[0] && res[0].node) {
            Taro.canvasToTempFilePath({
              canvas: res[0].node,
              success: (canvasRes) => {
                console.log('Canvas to temp file success:', canvasRes)
                resolve(canvasRes.tempFilePath)
              },
              fail: (error) => {
                console.error('Canvas to temp file failed:', error)
                reject(error)
              }
            })
          } else {
            console.error('No canvas node found:', res)
            reject(new Error('无法获取页面截图'))
          }
        })
    })

    // 隐藏加载提示
    Taro.hideLoading()

    console.log('✅ Screenshot test passed, tempFilePath:', tempFilePath)
    
    // 尝试保存到相册
    await Taro.saveImageToPhotosAlbum({
      filePath: tempFilePath
    })
    
    Taro.showToast({
      title: '截图测试成功',
      icon: 'success'
    })
    
    return tempFilePath
    
  } catch (error) {
    console.error('❌ Screenshot test failed:', error)
    Taro.hideLoading()
    Taro.showToast({
      title: '截图测试失败',
      icon: 'none'
    })
    throw error
  }
}

// 导出测试函数
export default testScreenshot 
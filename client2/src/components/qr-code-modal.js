import { View, Button, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default function QRCodeModal({ isOpen, onClose, roomId, roomName }) {


  // 生成二维码
  // const generateQRCode = (roomId) => {
  //   console.log("generateQRCode", roomId)
  //   const qrCode = Taro.createQRCode({
  //     text: roomId,
  //     width: 300,
  //     height: 300
  //   })
  //   console.log("qrCode", qrCode)
  //   return qrCode.toTempFileURL()
  // }
  
  const handleShare = async () => {
    try {
      const shareText = `邀请你加入房间\n房间号: ${roomId}\n`
      
      await Taro.setClipboardData({
        data: shareText
      })
      
      Taro.showToast({
        title: '房间信息已复制',
        icon: 'success'
      })
    } catch (error) {
      console.error('分享失败:', error)
      Taro.showToast({
        title: '分享失败',
        icon: 'none'
      })
    }
  }

  if (!isOpen) return null
  return (
    <View className='fixed left-0 top-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60'>
      <View className='bg-white rounded-lg p-6 w-80'>
        <Text className='block text-center text-lg font-semibold mb-4'>邀请好友加入</Text>
        <View className='text-center flex flex-col gap-4'>
          <Text className='text-lg font-semibold'>房号: <Text className='text-orange-500'>{roomName}</Text></Text>
        </View>
        <Button className='mt-4 w-full' onClick={onClose}>关闭</Button>
      </View>
    </View>
    // <View className='fixed left-0 top-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60'>
    //   <View className='bg-white rounded-lg p-6 w-80'>
    //     <Text className='block text-center text-lg font-semibold mb-4'>微信扫码二维码加入</Text>
    //     <View className='text-center flex flex-col gap-4'>
    //       <Text className='text-lg font-semibold'>房号: <Text className='text-orange-500'>{roomName}</Text></Text>
    //       <Text className='text-sm text-muted-foreground'>邀请好友扫描以下二维码加入房间</Text>
    //       <View className='flex justify-center'>
    //         <View className='w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center'>
    //           {/* 用占位图片代替二维码 */}
    //           {/* <Image src={qrCode} className='w-32 h-32' /> */}
    //         </View>
    //       </View>
    //       <Text className='text-sm text-muted-foreground'>也可以通过"转发"让好友加入</Text>
    //       <Button 
    //         onClick={handleShare}
    //         className='w-full bg-orange-500'
    //         hoverClass="hover-bg-orange-600"
    //       >
    //         转发给好友
    //       </Button>
    //     </View>
    //     <Button className='mt-4 w-full' onClick={onClose}>关闭</Button>
    //   </View>
    // </View>
  )
} 
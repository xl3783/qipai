import { ShareService } from '../services/shareService.js'

// 测试分享服务
export const testShareService = async () => {
  console.log('Testing ShareService...')
  
  try {
    // 测试复制房间号
    await ShareService.copyRoomId('test-room-123')
    console.log('✅ copyRoomId test passed')
    
    // 测试分享房间信息
    await ShareService.shareRoom('test-room-123', '测试房间')
    console.log('✅ shareRoom test passed')
    
    // 测试分享结算结果
    const mockParticipants = [
      {
        participationId: '1',
        finalScore: 100,
        playerByPlayerId: { username: '玩家A' }
      },
      {
        participationId: '2',
        finalScore: 50,
        playerByPlayerId: { username: '玩家B' }
      },
      {
        participationId: '3',
        finalScore: -30,
        playerByPlayerId: { username: '玩家C' }
      }
    ]
    
    await ShareService.shareSettlement('test-room-123', '测试房间', mockParticipants)
    console.log('✅ shareSettlement test passed')
    
    // 测试显示分享选项
    await ShareService.showShareOptions('test-room-123', '测试房间', mockParticipants)
    console.log('✅ showShareOptions test passed')
    
    // 测试生成分享数据
    const shareData = ShareService.generateShareData('test-room-123', '测试房间', mockParticipants)
    console.log('✅ generateShareData test passed:', shareData)
    
    console.log('🎉 All ShareService tests passed!')
    
  } catch (error) {
    console.error('❌ ShareService test failed:', error)
  }
}

// 导出测试函数
export default testShareService 
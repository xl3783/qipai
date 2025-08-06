import socketService from '../services/socketService.js';

export const testWebSocket = () => {
  console.log('开始测试WebSocket连接...');
  
  // 连接WebSocket
  socketService.connect('http://localhost:3000');
  
  // 加入测试房间
  socketService.joinRoom('test-room-123', 'test-user-456');
  
  // 监听房间更新
  socketService.onRoomUpdate((data) => {
    console.log('收到房间更新:', data);
  });
  
  // 测试连接状态
  setTimeout(() => {
    console.log('WebSocket连接状态:', socketService.isConnected());
  }, 1000);
  
  // 5秒后断开连接
  setTimeout(() => {
    socketService.disconnect();
    console.log('WebSocket测试完成');
  }, 5000);
};

export const testRoomUpdate = (roomId, userId) => {
  console.log(`测试房间 ${roomId} 的实时更新...`);
  
  socketService.connect('http://localhost:3000');
  socketService.joinRoom(roomId, userId);
  
  socketService.onRoomUpdate((data) => {
    console.log('房间更新:', data);
    
    if (data.type === 'transfer') {
      console.log(`转账事件: ${data.transfer.from} → ${data.transfer.to} ${data.transfer.points}`);
    }
  });
  
  return () => {
    socketService.disconnect();
  };
}; 
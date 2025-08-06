const WebSocket = require('ws');

// 创建WebSocket客户端
const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('open', () => {
  console.log('WebSocket连接成功');
  
  // 加入房间
  ws.send(JSON.stringify({
    type: 'join-room',
    roomId: 'test-room-123',
    userId: 'test-user-456'
  }));
  
  console.log('已发送加入房间请求');
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('收到消息:', message);
    
    if (message.type === 'joined-room') {
      console.log('成功加入房间:', message.roomId);
    } else if (message.event === 'room-updated') {
      console.log('收到房间更新:', message.data);
    }
  } catch (error) {
    console.error('解析消息错误:', error);
  }
});

ws.on('close', () => {
  console.log('WebSocket连接关闭');
});

ws.on('error', (error) => {
  console.error('WebSocket错误:', error);
});

// 保持连接10秒
setTimeout(() => {
  console.log('测试完成，关闭连接');
  ws.close();
}, 10000); 
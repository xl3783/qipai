const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

// 创建一个测试token
const testToken = jwt.sign(
  { aud: "postgraphile", role: "user", userId: "test_user", openid: "test_openid" },
  'your_super_secret_jwt_key_here_change_this_in_production',
  { expiresIn: '7d' }
);

console.log('测试token:', testToken);

// 测试WebSocket连接
const testWebSocketConnection = () => {
  console.log('开始测试WebSocket连接...');
  
  // 创建WebSocket连接
  const ws = new WebSocket(`ws://localhost:3000/ws?token=${testToken}`);
  
  ws.on('open', () => {
    console.log('✅ WebSocket连接成功');
    
    // 发送加入房间消息
    ws.send(JSON.stringify({
      type: 'join-room',
      roomId: 'test-room-123',
      userId: 'test_user'
    }));
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('收到消息:', message);
      
      if (message.type === 'auth-success') {
        console.log('✅ 认证成功');
      } else if (message.type === 'joined-room') {
        console.log('✅ 成功加入房间');
      }
    } catch (error) {
      console.error('解析消息错误:', error);
    }
  });
  
  ws.on('close', (event) => {
    console.log('WebSocket连接关闭:', event.code, event.reason);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error.message);
  });
  
  // 5秒后关闭连接
  setTimeout(() => {
    console.log('测试完成，关闭连接');
    ws.close();
    process.exit(0);
  }, 5000);
};

// 启动测试
testWebSocketConnection(); 
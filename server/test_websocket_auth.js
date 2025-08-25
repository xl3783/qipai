const WebSocket = require('ws');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 模拟用户登录获取token
const loginUser = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/wechat-login`, {
      code: userId,
      encryptedData: null,
      iv: null
    });
    
    return response.data.token;
  } catch (error) {
    console.error('登录失败:', error.response?.data || error.message);
    return null;
  }
};

// 测试带认证的WebSocket连接
const testWebSocketAuth = async () => {
  console.log('开始测试带认证的WebSocket连接...');
  
  // 登录用户获取token
  const token = await loginUser('test-user-123');
  if (!token) {
    console.error('获取token失败');
    return;
  }
  
  console.log('获取token成功');
  
  // 创建WebSocket连接
  const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);
  
  ws.on('open', () => {
    console.log('WebSocket连接成功');
    
    // 加入房间
    ws.send(JSON.stringify({
      type: 'joined-room',
      roomId: 'test-room-456'
    }));
    
    console.log('已发送加入房间请求');
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('收到消息:', message);
      
      if (message.type === 'auth-success') {
        console.log('认证成功:', message.message);
      } else if (message.type === 'joined-room') {
        console.log('成功加入房间:', message.roomId);
      } else if (message.event === 'room-updated') {
        console.log('收到房间更新:', message.data);
      }
    } catch (error) {
      console.error('解析消息错误:', error);
    }
  });
  
  ws.on('close', (event) => {
    console.log('WebSocket连接关闭:', event.code, event.reason);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
  
  // 保持连接10秒
  setTimeout(() => {
    console.log('测试完成，关闭连接');
    ws.close();
  }, 1000000);
};

// 运行测试
testWebSocketAuth().catch(console.error); 
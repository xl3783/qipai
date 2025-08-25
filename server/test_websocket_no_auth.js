const WebSocket = require('ws');

// 测试没有token的WebSocket连接
const testWebSocketNoAuth = () => {
  console.log('开始测试没有token的WebSocket连接...');
  
  // 创建WebSocket连接，不传递token
  const ws = new WebSocket('ws://localhost:3000/ws');
  
  ws.on('open', () => {
    console.log('WebSocket连接成功（不应该发生）');
  });
  
  ws.on('message', (data) => {
    console.log('收到消息:', data.toString());
  });
  
  ws.on('close', (event) => {
    console.log('WebSocket连接关闭:', event.code, event.reason);
    if (event.code === 1008) {
      console.log('✅ 正确：连接被拒绝，原因:', event.reason);
    } else {
      console.log('❌ 错误：连接关闭代码不是1008');
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error.message);
  });
  
  // 5秒后关闭
  setTimeout(() => {
    console.log('测试完成');
    process.exit(0);
  }, 5000);
};

// 运行测试
testWebSocketNoAuth(); 
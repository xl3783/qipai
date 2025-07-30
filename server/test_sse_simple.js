const EventSource = require('eventsource');
const axios = require('axios');

// 简单SSE测试
async function testSSE() {
  const baseUrl = 'http://localhost:3000';
  const clientId = `test-${Date.now()}`;
  
  console.log('🧪 开始简单SSE测试...');
  console.log(`🔗 连接地址: ${baseUrl}/sse/connect?clientId=${clientId}`);
  
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(`${baseUrl}/sse/connect?clientId=${clientId}`);
    const events = [];
    
    eventSource.onopen = () => {
      console.log('✅ SSE连接已建立');
    };
    
    eventSource.onerror = (error) => {
      console.error('❌ SSE连接错误:', error);
      eventSource.close();
      reject(error);
    };
    
    eventSource.onmessage = (event) => {
      console.log('📨 收到消息:', event.data);
      events.push({ type: 'message', data: event.data });
    };
    
    // 监听特定事件
    eventSource.addEventListener('init', (event) => {
      console.log('🎯 收到init事件:', event.data);
      events.push({ type: 'init', data: event.data });
    });
    
    eventSource.addEventListener('connection', (event) => {
      console.log('🎯 收到connection事件:', event.data);
      events.push({ type: 'connection', data: event.data });
    });
    
    eventSource.addEventListener('heartbeat', (event) => {
      console.log('💓 收到heartbeat:', event.data);
      events.push({ type: 'heartbeat', data: event.data });
    });
    
    // 5秒后测试发送通知
    setTimeout(async () => {
      try {
        console.log('📤 发送测试通知...');
        await axios.post(`${baseUrl}/sse/notify`, {
          clientId: clientId,
          message: '这是测试消息'
        });
        console.log('✅ 通知发送成功');
      } catch (error) {
        console.error('❌ 发送通知失败:', error.message);
      }
    }, 5000);
    
    // 10秒后结束测试
    setTimeout(() => {
      console.log('\n📊 测试结果:');
      console.log(`收到 ${events.length} 个事件:`);
      events.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.type}: ${event.data}`);
      });
      
      eventSource.close();
      console.log('🔌 连接已关闭');
      
      if (events.length > 0) {
        console.log('✅ SSE测试成功!');
        resolve(events);
      } else {
        console.log('❌ SSE测试失败: 没有收到任何事件');
        reject(new Error('没有收到任何事件'));
      }
    }, 10000);
  });
}

// 运行测试
if (require.main === module) {
  testSSE()
    .then(() => {
      console.log('🎉 测试完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 测试失败:', error.message);
      process.exit(1);
    });
}

module.exports = testSSE; 
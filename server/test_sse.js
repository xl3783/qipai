const EventSource = require('eventsource');
const axios = require('axios');

class SSETester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.clients = new Map();
    this.testResults = [];
  }

  // 生成唯一客户端ID
  generateClientId() {
    return `test-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 创建SSE连接
  async createConnection(clientId) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}/sse/connect?clientId=${clientId}`;
      console.log(`🔗 创建SSE连接: ${url}`);
      
      const eventSource = new EventSource(url);
      const events = [];
      
      eventSource.onopen = () => {
        console.log(`✅ 连接已建立: ${clientId}`);
        this.clients.set(clientId, { eventSource, events });
        resolve({ clientId, eventSource, events });
      };
      
      eventSource.onerror = (error) => {
        console.error(`❌ 连接错误: ${clientId}`, error);
        reject(error);
      };
      
      eventSource.onmessage = (event) => {
        console.log(`📨 收到消息 [${clientId}]:`, event.data);
        events.push({ type: 'message', data: event.data, timestamp: new Date() });
      };
      
      // 监听特定事件类型
      eventSource.addEventListener('init', (event) => {
        console.log(`🎯 收到init事件 [${clientId}]:`, event.data);
        events.push({ type: 'init', data: event.data, timestamp: new Date() });
      });
      
      eventSource.addEventListener('connection', (event) => {
        console.log(`🎯 收到connection事件 [${clientId}]:`, event.data);
        events.push({ type: 'connection', data: event.data, timestamp: new Date() });
      });
      
      eventSource.addEventListener('heartbeat', (event) => {
        console.log(`💓 收到heartbeat [${clientId}]:`, event.data);
        events.push({ type: 'heartbeat', data: event.data, timestamp: new Date() });
      });
      
      eventSource.addEventListener('notification', (event) => {
        console.log(`🔔 收到notification [${clientId}]:`, event.data);
        events.push({ type: 'notification', data: event.data, timestamp: new Date() });
      });
      
      eventSource.addEventListener('custom', (event) => {
        console.log(`🎨 收到custom事件 [${clientId}]:`, event.data);
        events.push({ type: 'custom', data: event.data, timestamp: new Date() });
      });
      
      eventSource.addEventListener('announcement', (event) => {
        console.log(`📢 收到announcement [${clientId}]:`, event.data);
        events.push({ type: 'announcement', data: event.data, timestamp: new Date() });
      });
    });
  }

  // 关闭连接
  closeConnection(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      client.eventSource.close();
      this.clients.delete(clientId);
      console.log(`🔌 连接已关闭: ${clientId}`);
    }
  }

  // 发送通知到服务器
  async sendNotification(clientId = null, message = '测试消息') {
    try {
      const payload = clientId ? { clientId, message } : { message };
      const response = await axios.post(`${this.baseUrl}/sse/notify`, payload);
      console.log(`📤 发送通知成功:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ 发送通知失败:`, error.message);
      throw error;
    }
  }

  // 测试基本连接
  async testBasicConnection() {
    console.log('\n🧪 测试1: 基本连接测试');
    const clientId = this.generateClientId();
    
    try {
      const connection = await this.createConnection(clientId);
      
      // 等待一段时间接收事件
      await this.wait(3000);
      
      const client = this.clients.get(clientId);
      const eventCount = client.events.length;
      
      console.log(`📊 收到 ${eventCount} 个事件`);
      client.events.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.type}: ${event.data}`);
      });
      
      this.closeConnection(clientId);
      
      this.testResults.push({
        test: '基本连接测试',
        success: eventCount > 0,
        events: eventCount,
        details: client.events
      });
      
    } catch (error) {
      console.error('❌ 基本连接测试失败:', error.message);
      this.testResults.push({
        test: '基本连接测试',
        success: false,
        error: error.message
      });
    }
  }

  // 测试多客户端连接
  async testMultipleClients() {
    console.log('\n🧪 测试2: 多客户端连接测试');
    const clientIds = [
      this.generateClientId(),
      this.generateClientId(),
      this.generateClientId()
    ];
    
    try {
      // 创建多个连接
      for (const clientId of clientIds) {
        await this.createConnection(clientId);
        await this.wait(500); // 间隔创建
      }
      
      console.log(`✅ 成功创建 ${clientIds.length} 个连接`);
      
      // 等待心跳
      await this.wait(5000);
      
      // 检查每个客户端的事件
      let totalEvents = 0;
      for (const clientId of clientIds) {
        const client = this.clients.get(clientId);
        const eventCount = client.events.length;
        totalEvents += eventCount;
        console.log(`📊 ${clientId}: ${eventCount} 个事件`);
      }
      
      // 清理连接
      for (const clientId of clientIds) {
        this.closeConnection(clientId);
      }
      
      this.testResults.push({
        test: '多客户端连接测试',
        success: totalEvents > 0,
        clients: clientIds.length,
        totalEvents: totalEvents
      });
      
    } catch (error) {
      console.error('❌ 多客户端连接测试失败:', error.message);
      this.testResults.push({
        test: '多客户端连接测试',
        success: false,
        error: error.message
      });
    }
  }

  // 测试事件发送
  async testEventSending() {
    console.log('\n🧪 测试3: 事件发送测试');
    const clientId = this.generateClientId();
    
    try {
      await this.createConnection(clientId);
      await this.wait(1000);
      
      // 发送给特定客户端
      console.log('📤 发送给特定客户端...');
      await this.sendNotification(clientId, '这是给特定客户端的消息');
      await this.wait(1000);
      
      // 广播给所有客户端
      console.log('📤 广播给所有客户端...');
      await this.sendNotification(null, '这是广播消息');
      await this.wait(1000);
      
      const client = this.clients.get(clientId);
      const customEvents = client.events.filter(e => e.type === 'custom');
      const announcementEvents = client.events.filter(e => e.type === 'announcement');
      
      console.log(`📊 收到 ${customEvents.length} 个custom事件`);
      console.log(`📊 收到 ${announcementEvents.length} 个announcement事件`);
      
      this.closeConnection(clientId);
      
      this.testResults.push({
        test: '事件发送测试',
        success: customEvents.length > 0 && announcementEvents.length > 0,
        customEvents: customEvents.length,
        announcementEvents: announcementEvents.length
      });
      
    } catch (error) {
      console.error('❌ 事件发送测试失败:', error.message);
      this.testResults.push({
        test: '事件发送测试',
        success: false,
        error: error.message
      });
    }
  }

  // 测试连接断开重连
  async testReconnection() {
    console.log('\n🧪 测试4: 连接断开重连测试');
    const clientId = this.generateClientId();
    
    try {
      // 第一次连接
      await this.createConnection(clientId);
      await this.wait(2000);
      
      // 断开连接
      this.closeConnection(clientId);
      console.log('🔌 连接已断开');
      await this.wait(1000);
      
      // 重新连接
      await this.createConnection(clientId);
      await this.wait(2000);
      
      const client = this.clients.get(clientId);
      const eventCount = client.events.length;
      
      console.log(`📊 重连后收到 ${eventCount} 个事件`);
      
      this.closeConnection(clientId);
      
      this.testResults.push({
        test: '连接断开重连测试',
        success: eventCount > 0,
        events: eventCount
      });
      
    } catch (error) {
      console.error('❌ 连接断开重连测试失败:', error.message);
      this.testResults.push({
        test: '连接断开重连测试',
        success: false,
        error: error.message
      });
    }
  }

  // 测试压力测试
  async testStressTest() {
    console.log('\n🧪 测试5: 压力测试');
    const clientCount = 10;
    const clientIds = [];
    
    try {
      console.log(`🚀 创建 ${clientCount} 个并发连接...`);
      
      // 并发创建连接
      const promises = [];
      for (let i = 0; i < clientCount; i++) {
        const clientId = this.generateClientId();
        clientIds.push(clientId);
        promises.push(this.createConnection(clientId));
      }
      
      await Promise.all(promises);
      console.log(`✅ 成功创建 ${clientCount} 个连接`);
      
      // 等待一段时间
      await this.wait(5000);
      
      // 统计事件
      let totalEvents = 0;
      for (const clientId of clientIds) {
        const client = this.clients.get(clientId);
        if (client) {
          totalEvents += client.events.length;
        }
      }
      
      console.log(`📊 总共收到 ${totalEvents} 个事件`);
      
      // 清理连接
      for (const clientId of clientIds) {
        this.closeConnection(clientId);
      }
      
      this.testResults.push({
        test: '压力测试',
        success: totalEvents > 0,
        clientCount: clientCount,
        totalEvents: totalEvents
      });
      
    } catch (error) {
      console.error('❌ 压力测试失败:', error.message);
      this.testResults.push({
        test: '压力测试',
        success: false,
        error: error.message
      });
    }
  }

  // 等待函数
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 开始SSE测试套件...\n');
    
    await this.testBasicConnection();
    await this.testMultipleClients();
    await this.testEventSending();
    await this.testReconnection();
    await this.testStressTest();
    
    this.printResults();
  }

  // 打印测试结果
  printResults() {
    console.log('\n📊 测试结果汇总:');
    console.log('='.repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${result.test}: ${status}`);
      
      if (result.success) {
        passed++;
      } else {
        failed++;
        if (result.error) {
          console.log(`   错误: ${result.error}`);
        }
      }
      
      // 打印详细信息
      if (result.events) console.log(`   事件数: ${result.events}`);
      if (result.clients) console.log(`   客户端数: ${result.clients}`);
      if (result.totalEvents) console.log(`   总事件数: ${result.totalEvents}`);
      if (result.customEvents) console.log(`   Custom事件: ${result.customEvents}`);
      if (result.announcementEvents) console.log(`   Announcement事件: ${result.announcementEvents}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`总计: ${passed} 通过, ${failed} 失败`);
    
    if (failed === 0) {
      console.log('🎉 所有测试通过!');
    } else {
      console.log('⚠️  有测试失败，请检查SSE服务');
    }
  }

  // 清理所有连接
  cleanup() {
    console.log('\n🧹 清理所有连接...');
    for (const [clientId, client] of this.clients) {
      client.eventSource.close();
    }
    this.clients.clear();
    console.log('✅ 清理完成');
  }
}

// 主函数
async function main() {
  const tester = new SSETester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
  } finally {
    tester.cleanup();
    process.exit(0);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = SSETester; 
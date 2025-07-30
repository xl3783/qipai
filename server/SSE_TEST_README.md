# SSE 测试脚本使用说明

## 概述

本项目包含两个SSE测试脚本，用于测试Server-Sent Events功能：

1. `test_sse.js` - 完整的测试套件
2. `test_sse_simple.js` - 简单快速测试

## 前置条件

1. 确保服务器正在运行：
```bash
cd server
npm start
```

2. 安装依赖：
```bash
npm install
```

## 测试脚本

### 1. 简单测试 (test_sse_simple.js)

快速验证SSE连接是否正常工作：

```bash
node test_sse_simple.js
```

**测试内容：**
- 建立SSE连接
- 接收初始化和连接事件
- 接收心跳事件
- 发送测试通知
- 验证事件接收

**预期输出：**
```
🧪 开始简单SSE测试...
🔗 连接地址: http://localhost:3000/sse/connect?clientId=test-1234567890
✅ SSE连接已建立
🎯 收到init事件: {"clientId":"test-1234567890","config":{"refreshInterval":5000},"timestamp":"2024-01-01T12:00:00.000Z"}
🎯 收到connection事件: {"clientId":"test-1234567890","message":"SSE connection established"}
💓 收到heartbeat: {"status":"alive"}
📤 发送测试通知...
✅ 通知发送成功
🎨 收到custom事件: {"from":"server","message":"这是测试消息","timestamp":"2024-01-01T12:00:05.000Z"}

📊 测试结果:
收到 4 个事件:
  1. init: {"clientId":"test-1234567890","config":{"refreshInterval":5000},"timestamp":"2024-01-01T12:00:00.000Z"}
  2. connection: {"clientId":"test-1234567890","message":"SSE connection established"}
  3. heartbeat: {"status":"alive"}
  4. custom: {"from":"server","message":"这是测试消息","timestamp":"2024-01-01T12:00:05.000Z"}
🔌 连接已关闭
✅ SSE测试成功!
🎉 测试完成
```

### 2. 完整测试套件 (test_sse.js)

运行全面的SSE功能测试：

```bash
node test_sse.js
```

**测试内容：**

1. **基本连接测试**
   - 建立单个SSE连接
   - 验证事件接收
   - 检查连接状态

2. **多客户端连接测试**
   - 同时建立多个连接
   - 验证每个客户端都能正常接收事件
   - 测试并发连接处理

3. **事件发送测试**
   - 发送给特定客户端
   - 广播给所有客户端
   - 验证事件类型和内容

4. **连接断开重连测试**
   - 模拟连接断开
   - 测试重新连接
   - 验证重连后的功能

5. **压力测试**
   - 创建10个并发连接
   - 测试服务器负载能力
   - 验证事件分发性能

**预期输出：**
```
🚀 开始SSE测试套件...

🧪 测试1: 基本连接测试
🔗 创建SSE连接: http://localhost:3000/sse/connect?clientId=test-client-1234567890-abc123
✅ 连接已建立: test-client-1234567890-abc123
🎯 收到init事件 [test-client-1234567890-abc123]: {"clientId":"test-client-1234567890-abc123","config":{"refreshInterval":5000},"timestamp":"2024-01-01T12:00:00.000Z"}
🎯 收到connection事件 [test-client-1234567890-abc123]: {"clientId":"test-client-1234567890-abc123","message":"SSE connection established"}
💓 收到heartbeat [test-client-1234567890-abc123]: {"status":"alive"}
📊 收到 3 个事件
  1. init: {"clientId":"test-client-1234567890-abc123","config":{"refreshInterval":5000},"timestamp":"2024-01-01T12:00:00.000Z"}
  2. connection: {"clientId":"test-client-1234567890-abc123","message":"SSE connection established"}
  3. heartbeat: {"status":"alive"}
🔌 连接已关闭: test-client-1234567890-abc123

🧪 测试2: 多客户端连接测试
🔗 创建SSE连接: http://localhost:3000/sse/connect?clientId=test-client-1234567890-def456
✅ 连接已建立: test-client-1234567890-def456
🔗 创建SSE连接: http://localhost:3000/sse/connect?clientId=test-client-1234567890-ghi789
✅ 连接已建立: test-client-1234567890-ghi789
🔗 创建SSE连接: http://localhost:3000/sse/connect?clientId=test-client-1234567890-jkl012
✅ 连接已建立: test-client-1234567890-jkl012
✅ 成功创建 3 个连接
📊 test-client-1234567890-def456: 3 个事件
📊 test-client-1234567890-ghi789: 3 个事件
📊 test-client-1234567890-jkl012: 3 个事件
🔌 连接已关闭: test-client-1234567890-def456
🔌 连接已关闭: test-client-1234567890-ghi789
🔌 连接已关闭: test-client-1234567890-jkl012

🧪 测试3: 事件发送测试
🔗 创建SSE连接: http://localhost:3000/sse/connect?clientId=test-client-1234567890-mno345
✅ 连接已建立: test-client-1234567890-mno345
📤 发送给特定客户端...
📤 发送通知成功: { success: true }
📤 广播给所有客户端...
📤 发送通知成功: { success: true }
📊 收到 1 个custom事件
📊 收到 1 个announcement事件
🔌 连接已关闭: test-client-1234567890-mno345

🧪 测试4: 连接断开重连测试
🔗 创建SSE连接: http://localhost:3000/sse/connect?clientId=test-client-1234567890-pqr678
✅ 连接已建立: test-client-1234567890-pqr678
🔌 连接已关闭: test-client-1234567890-pqr678
🔌 连接已断开
🔗 创建SSE连接: http://localhost:3000/sse/connect?clientId=test-client-1234567890-pqr678
✅ 连接已建立: test-client-1234567890-pqr678
📊 重连后收到 3 个事件
🔌 连接已关闭: test-client-1234567890-pqr678

🧪 测试5: 压力测试
🚀 创建 10 个并发连接...
🔗 创建SSE连接: http://localhost:3000/sse/connect?clientId=test-client-1234567890-stu901
✅ 连接已建立: test-client-1234567890-stu901
🔗 创建SSE连接: http://localhost:3000/sse/connect?clientId=test-client-1234567890-vwx234
✅ 连接已建立: test-client-1234567890-vwx234
...
✅ 成功创建 10 个连接
📊 总共收到 30 个事件
🔌 连接已关闭: test-client-1234567890-stu901
🔌 连接已关闭: test-client-1234567890-vwx234
...

📊 测试结果汇总:
==================================================
1. 基本连接测试: ✅ PASS
   事件数: 3
2. 多客户端连接测试: ✅ PASS
   客户端数: 3
   总事件数: 9
3. 事件发送测试: ✅ PASS
   Custom事件: 1
   Announcement事件: 1
4. 连接断开重连测试: ✅ PASS
   事件数: 3
5. 压力测试: ✅ PASS
   客户端数: 10
   总事件数: 30

==================================================
总计: 5 通过, 0 失败
🎉 所有测试通过!

🧹 清理所有连接...
✅ 清理完成
```

## 故障排除

### 常见问题

1. **连接失败**
   ```
   ❌ SSE连接错误: Error: connect ECONNREFUSED 127.0.0.1:3000
   ```
   **解决方案：** 确保服务器正在运行，检查端口是否正确

2. **没有收到事件**
   ```
   ❌ SSE测试失败: 没有收到任何事件
   ```
   **解决方案：** 
   - 检查SSE路由是否正确配置
   - 验证SSE管理器是否正常工作
   - 检查心跳间隔设置

3. **依赖错误**
   ```
   Error: Cannot find module 'eventsource'
   ```
   **解决方案：** 运行 `npm install` 安装依赖

### 调试技巧

1. **查看服务器日志**
   ```bash
   npm run dev
   ```

2. **检查SSE路由**
   ```bash
   curl http://localhost:3000/sse/connect?clientId=test
   ```

3. **测试通知API**
   ```bash
   curl -X POST http://localhost:3000/sse/notify \
     -H "Content-Type: application/json" \
     -d '{"clientId":"test","message":"test"}'
   ```

## 自定义测试

你可以修改测试脚本中的参数：

```javascript
// 修改服务器地址
const tester = new SSETester('http://your-server:3000');

// 修改测试参数
await tester.testStressTest(20); // 测试20个并发连接
```

## 性能监控

测试脚本会输出详细的性能信息：
- 连接建立时间
- 事件接收数量
- 并发连接处理能力
- 内存使用情况

这些信息可以帮助你优化SSE服务的性能。 
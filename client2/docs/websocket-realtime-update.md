# WebSocket实时更新功能

## 概述

房间页面已集成WebSocket实时刷新功能，当房间内发生转账等事件时，所有在线用户都会实时收到更新。

## 技术实现

### 服务端 (Express + express-ws)

1. **WebSocket服务器**: 使用express-ws库实现WebSocket功能
2. **连接管理**: 通过socketManager管理房间连接
3. **消息广播**: 当发生转账等事件时，向房间内所有用户广播更新

### 客户端 (Taro + 微信小程序)

1. **连接管理**: 使用socketService管理WebSocket连接
2. **消息监听**: 监听房间更新事件并实时更新UI
3. **环境适配**: 同时支持微信小程序和浏览器环境

## 功能特性

### 实时更新
- 转账成功后，房间内所有用户立即看到余额变化
- 交易记录实时更新
- 用户加入/离开房间实时通知

### 连接管理
- 自动重连机制
- 连接状态监控
- 优雅断开连接

### 错误处理
- 网络异常处理
- 消息解析错误处理
- 连接超时处理

## 使用方法

### 在房间页面中使用

```javascript
import socketService from '../../services/socketService.js';

// 连接WebSocket并加入房间
useEffect(() => {
  socketService.connect();
  socketService.joinRoom(roomId, userId);
  
  // 监听房间更新
  socketService.onRoomUpdate((data) => {
    // 更新房间数据
    setRoommates(data.roomDetail.roommates);
    setTransactions(data.roomDetail.transactions);
  });
  
  return () => {
    socketService.disconnect();
  };
}, []);
```

### 转账后自动更新

当用户执行转账操作时：

1. 客户端发送转账请求到服务端
2. 服务端处理转账并更新数据库
3. 服务端通过WebSocket广播房间更新
4. 房间内所有用户收到更新并刷新UI

## 消息格式

### 客户端发送消息
```javascript
{
  type: 'join-room',
  roomId: 'room123',
  userId: 'user456'
}
```

### 服务端广播消息
```javascript
{
  event: 'room-updated',
  data: {
    type: 'transfer',
    roomDetail: {
      roommates: [...],
      transactions: [...]
    },
    transfer: {
      from: 'user1',
      to: 'user2',
      points: 100,
      description: '转账'
    }
  }
}
```

## 配置说明

### 服务端配置
- WebSocket端点: `/ws`
- 支持的消息类型: `join-room`, `leave-room`
- 广播事件: `room-updated`

### 客户端配置
- 默认服务器地址: `http://localhost:3000`
- WebSocket URL: `ws://localhost:3000/ws`
- 自动重连: 支持
- 连接超时: 20秒

## 注意事项

1. **网络环境**: 确保服务器和客户端网络连接稳定
2. **微信小程序**: 需要在微信开发者工具中配置WebSocket域名
3. **生产环境**: 需要配置HTTPS和WSS协议
4. **错误处理**: 建议添加重连机制和错误提示

## 测试方法

### 服务端测试
```bash
cd server
node test_websocket_broadcast.js
```

### 客户端测试
在房间页面点击"测试WebSocket连接"按钮查看连接状态。

## 扩展功能

可以基于现有WebSocket架构扩展以下功能：

1. **用户在线状态**: 显示房间内在线用户
2. **实时聊天**: 房间内文字聊天
3. **游戏状态同步**: 游戏进度实时同步
4. **通知推送**: 重要事件推送通知 
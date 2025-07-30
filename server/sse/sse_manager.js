// utils/sse_manager.js
const SSEEvent = require('./sse_event');

class SSEManager {
  constructor() {
    this.clients = new Map(); // 存储所有客户端连接
    this.heartbeatInterval = null;
  }

  // 添加新客户端
  addClient(clientId, res) {
    // 初始化连接
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // 发送连接确认
    res.write(new SSEEvent('connection', {
      clientId,
      message: 'SSE connection established'
    }).toString());

    // 存储连接
    this.clients.set(clientId, res);
    
    // 设置心跳（如果未启动）
    if (!this.heartbeatInterval && this.clients.size > 0) {
      this.startHeartbeat();
    }

    // 返回清理函数
    return () => this.removeClient(clientId);
  }

  // 移除客户端
  removeClient(clientId) {
    if (this.clients.has(clientId)) {
      const res = this.clients.get(clientId);
      if (!res.writableEnded) {
        res.end();
      }
      this.clients.delete(clientId);
      
      // 如果没有客户端了，停止心跳
      if (this.clients.size === 0) {
        this.stopHeartbeat();
      }
    }
  }

  // 发送心跳
  startHeartbeat(interval = 15000) {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.broadcast(SSEEvent.heartbeat());
    }, interval);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 广播消息给所有客户端
  broadcast(event) {
    const eventString = event.toString();
    this.clients.forEach((res, clientId) => {
      if (!res.writableEnded) {
        res.write(eventString);
      } else {
        this.removeClient(clientId);
      }
    });
  }

  // 发送给特定客户端
  sendTo(clientId, event) {
    if (this.clients.has(clientId)) {
      const res = this.clients.get(clientId);
      if (!res.writableEnded) {
        res.write(event.toString());
        return true; // 客户端存在且消息发送成功
      } else {
        this.removeClient(clientId);
        return false; // 客户端连接已断开
      }
    }
    return false; // 客户端不存在
  }

  // 获取当前客户端数量
  getClientCount() {
    return this.clients.size;
  }
}

module.exports = new SSEManager(); // 单例模式导出
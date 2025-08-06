import Taro from '@tarojs/taro';

class SocketService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.userId = null;
    this.token = null;
    this.listeners = new Map();
    this.socketOpen = false;
    this.socketMsgQueue = [];
  }

  // 连接到WebSocket服务器
  connect(serverUrl = 'http://localhost:3000', token = null) {
    if (this.socket) {
      Taro.closeSocket();
    }

    // 获取token
    this.token = token || Taro.getStorageSync('token');
    if (!this.token) {
      console.error('缺少认证token');
      return null;
    }

    // 将HTTP URL转换为WebSocket URL，并添加token参数
    const wsUrl = serverUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws?token=' + this.token;
    
    // 使用Taro的WebSocket API
    Taro.connectSocket({
      url: wsUrl,
      success: () => {
        console.log('WebSocket连接成功');
      },
      fail: (error) => {
        console.error('WebSocket连接失败:', error);
      }
    });

    // 监听WebSocket连接打开事件
    Taro.onSocketOpen((res) => {
      console.log('WebSocket连接已打开');
      this.socketOpen = true;
      // 发送队列中的消息
      for (let i = 0; i < this.socketMsgQueue.length; i++) {
        this.sendSocketMessage(this.socketMsgQueue[i]);
      }
      this.socketMsgQueue = [];
    });

    // 监听WebSocket连接关闭事件
    Taro.onSocketClose((res) => {
      console.log('WebSocket连接已关闭:', res.code, res.reason);
      this.socketOpen = false;
      if (res.code === 1008) {
        console.error('WebSocket认证失败:', res.reason);
      }
    });

    // 监听WebSocket错误事件
    Taro.onSocketError((error) => {
      console.error('WebSocket连接错误:', error);
      this.socketOpen = false;
    });

    // 监听WebSocket消息事件
    Taro.onSocketMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        console.log('收到WebSocket消息:', data);
        
        // 处理认证成功消息
        if (data.type === 'auth-success') {
          console.log('WebSocket认证成功:', data.message);
          this.userId = data.userId;
        }
        
        // 触发相应的监听器
        console.log("this.listeners", this.listeners);
        if (data.type && this.listeners.has(data.type)) {
          this.listeners.get(data.type).forEach(callback => callback(data.data));
        }
      } catch (error) {
        console.error('解析WebSocket消息错误:', error);
      }
    });

    return this.socket;
  }

  // 发送WebSocket消息
  sendSocketMessage(msg) {
    if (this.socketOpen) {
      Taro.sendSocketMessage({
        data: msg,
        success: () => {
          console.log('消息发送成功');
        },
        fail: (error) => {
          console.error('消息发送失败:', error);
        }
      });
    } else {
      this.socketMsgQueue.push(msg);
    }
  }

  // 加入房间
  joinRoom(roomId, userId = null) {
    if (!this.socketOpen) {
      console.error('WebSocket未连接');
      return;
    }

    this.roomId = roomId;
    // 如果没有传入userId，使用认证后的userId
    if (userId) {
      this.userId = userId;
    }

    const message = JSON.stringify({
      type: 'join-room',
      roomId: roomId
    });

    this.sendSocketMessage(message);
    console.log(`加入房间: ${roomId}, 用户: ${this.userId}`);
  }

  // 离开房间
  leaveRoom() {
    if (!this.socketOpen || !this.roomId) {
      return;
    }

    const message = JSON.stringify({
      type: 'leave-room',
      roomId: this.roomId
    });

    this.sendSocketMessage(message);
    console.log('离开房间');
    this.roomId = null;
  }

  // 监听房间更新
  onRoomUpdate(callback) {
    if (!this.listeners.has('room-updated')) {
      this.listeners.set('room-updated', []);
    }
    this.listeners.get('room-updated').push(callback);
  }

  // 移除房间更新监听
  offRoomUpdate() {
    this.listeners.delete('room-updated');
  }

  onTransfer(callback) {
    if (!this.listeners.has('transfer')) {
      this.listeners.set('transfer', []);
    }
    this.listeners.get('transfer').push(callback);
  } 

  onJoinRoom(callback) {
    if (!this.listeners.has('join')) {
      this.listeners.set('join', []);
    }
    this.listeners.get('join').push(callback);
  }

  onLeaveRoom(callback) {
    if (!this.listeners.has('leave')) {
      this.listeners.set('leave', []);
    }
    this.listeners.get('leave').push(callback);
  }

  // 断开连接
  disconnect() {
    if (this.socketOpen) {
      this.leaveRoom();
      Taro.closeSocket();
      this.socketOpen = false;
      this.socketMsgQueue = [];
      this.token = null;
      this.userId = null;
    }
  }

  // 获取连接状态
  isConnected() {
    return this.socketOpen;
  }

  // 获取当前用户ID
  getCurrentUserId() {
    return this.userId;
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService; 
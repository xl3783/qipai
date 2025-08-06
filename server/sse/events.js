const SSEEvent = require('./sse_event');

class TransferEvent extends SSEEvent {
    constructor(from, to, amount, description) {
      this.type = 'transfer'; // 事件类型
      this.data = { id, from, to, amount, description }; // 事件数据
      this.id = Date.now(); // 事件ID
      this.retry = 3000; // 重连时间(ms)
      this.timestamp = new Date().toISOString();
    }
}

class JoinEvent extends SSEEvent {
    constructor(roomId, userId, username, position, userAvatar) {
      this.type = 'join'; // 事件类型
      this.data = { id, roomId, userId, username, position, userAvatar }; // 事件数据
      this.id = Date.now(); // 事件ID
      this.retry = 3000; // 重连时间(ms)
      this.timestamp = new Date().toISOString();
    }
}

class LeaveEvent extends SSEEvent {
    constructor(roomId, userId, username) {
      this.type = 'leave'; // 事件类型
      this.data = { id, roomId, userId, username}; // 事件数据
      this.id = Date.now(); // 事件ID
      this.retry = 3000; // 重连时间(ms)
      this.timestamp = new Date().toISOString();
    }
}



module.exports = { TransferEvent, JoinEvent, LeaveEvent };
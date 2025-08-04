// utils/sse_event.js
class SSEEvent {
    constructor(type, data, options = {}) {
      this.type = type; // 事件类型
      this.data = data; // 事件数据
      this.id = options.id || Date.now(); // 事件ID
      this.retry = options.retry || 3000; // 重连时间(ms)
      this.timestamp = options.timestamp || new Date().toISOString();
    }
  
    toString() {
      let output = '';
      
      // 标准字段
      if (this.id) output += `id: ${this.id}\n`;
      if (this.retry) output += `retry: ${this.retry}\n`;
      if (this.type !== 'message') output += `event: ${this.type}\n`;
      
      // 数据字段（支持对象和字符串）
      output += `data: ${typeof this.data === 'string' 
        ? this.data 
        : JSON.stringify(this.data)}\n\n`;
      
      return output;
    }
  
    // 常用事件快捷方法
    static heartbeat() {
      return new SSEEvent('heartbeat', { status: 'alive' });
    }
  
    static error(message, code = 500) {
      return new SSEEvent('error', { message, code });
    }
  
    static notification(title, content, level = 'info') {
      return new SSEEvent('notification', { title, content, level });
    }
  }
  
  module.exports = SSEEvent;
// routes/sseRouter.js
const express = require('express');
const router = express.Router();
const sseManager = require('../sse/sse_manager');
const SSEEvent = require('../sse/sse_event');

// SSE 连接端点
router.get('/connect', (req, res) => {
  const clientId = req.query.clientId || generateUniqueId(); // 实现你的ID生成逻辑
  
  // 添加客户端并获取清理函数
  const cleanup = sseManager.addClient(clientId, res);
  
  // 客户端断开连接时清理
  req.on('close', () => {
    cleanup();
    console.log(`Client ${clientId} disconnected`);
  });

  // 发送初始化数据
  res.write(new SSEEvent('init', {
    clientId,
    config: { refreshInterval: 5000 },
    timestamp: new Date().toISOString()
  }).toString());
});

// 触发事件端点（示例）
router.post('/notify', (req, res) => {
  try {
    const { clientId, message } = req.body;
    
    if (clientId) {
      // 发送给特定客户端
      const clientExists = sseManager.sendTo(clientId, new SSEEvent('custom', {
        from: 'server',
        message,
        timestamp: new Date().toISOString()
      }));
      
      if (!clientExists) {
        console.log(`Client ${clientId} not found`);
        return res.status(404).json({ 
          error: '客户端不存在', 
          clientId,
          availableClients: Array.from(sseManager.clients.keys())
        });
      }
    } else {
      // 广播给所有客户端
      sseManager.broadcast(new SSEEvent('announcement', {
        message: 'System notification: ' + (message || 'No message provided'),
        severity: 'warning'
      }));
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('SSE通知错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 辅助函数
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports = router;
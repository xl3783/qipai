const express = require('express');
const expressWs = require('express-ws');
const path = require('path');

// 创建 Express 应用
const app = express();
expressWs(app); // 启用 WebSocket 支持

// 存储所有连接的客户端
const clients = new Set();

// 静态文件服务（可选）
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket 路由
app.ws('/ws', (ws, req) => {
    console.log('新的客户端连接');
    clients.add(ws);

    // 发送欢迎消息
    ws.send(JSON.stringify({
        type: 'system',
        message: '欢迎连接到 WebSocket 服务器'
    }));

    // 接收消息
    ws.on('message', (message) => {
        console.log(`收到消息: ${message}`);

        // 广播消息给所有客户端
        broadcast({
            type: 'message',
            from: 'client',
            content: message.toString()
        });
    });

    // 连接关闭
    ws.on('close', () => {
        console.log('客户端断开连接');
        clients.delete(ws);
        broadcast({
            type: 'system',
            message: '一个客户端已断开连接'
        });
    });

    // 错误处理
    ws.on('error', (error) => {
        console.error('WebSocket 错误:', error);
    });
});

// 广播消息给所有客户端
function broadcast(message) {
    const jsonMessage = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(jsonMessage);
        }
    });
}

// HTTP 路由示例
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`服务器已启动，监听端口 ${PORT}`);
    console.log(`WebSocket 地址: ws://localhost:${PORT}/ws`);
});
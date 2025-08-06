const WebSocket = require('ws');
const readline = require('readline');

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// WebSocket 服务器地址
const serverUrl = 'wss://localhost:3000/ws'; // 更改为你的服务器地址

// 创建 WebSocket 连接
const socket = new WebSocket(serverUrl);

// 连接成功时触发
socket.on('open', () => {
  console.log('已连接到服务器');
  // promptForMessage();
  socket.send("123");
});

// 接收到消息时触发
socket.on('message', (data) => {
  console.log(`收到消息: ${data}`);
});
// 连接关闭时触发
socket.on('close', (code, reason) => {
  console.log(`连接已关闭，代码: ${code}, 原因: ${reason}`);
  process.exit(0);
});

// 发生错误时触发
socket.on('error', (error) => {
  console.error('发生错误:', error.message);
});

// 提示用户输入消息
function promptForMessage() {
  rl.question('请输入消息 (输入 "exit" 退出): ', (message) => {
    if (message.toLowerCase() === 'exit') {
      socket.close();
      rl.close();
      return;
    }

    // 发送消息
    socket.send(message);

    // 继续提示输入
    promptForMessage();
  });
}
// 使用示例
const { testLogin, testCreateRoom, testQueryLeaderboard } = require('./test.js');

// 示例1: 基本登录和创建房间
async function example1() {
  console.log('=== 示例1: 基本登录和创建房间 ===');
  
  // 登录
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('登录失败，无法继续');
    return;
  }
  
  // 创建房间
  const gameId = await testCreateRoom();
  if (gameId) {
    console.log(`房间创建成功，ID: ${gameId}`);
  }
}

// 示例2: 查询排行榜
async function example2() {
  console.log('=== 示例2: 查询排行榜 ===');
  
  const leaderboard = await testQueryLeaderboard();
  if (leaderboard) {
    console.log('排行榜前10名:');
    leaderboard.forEach((score, index) => {
      console.log(`${index + 1}. ${score.playerByPlayerId.username} - ${score.currentTotal}分`);
    });
  }
}

// 示例3: 完整的游戏流程
async function example3() {
  console.log('=== 示例3: 完整的游戏流程 ===');
  
  const { testLogin, testCreateRoom, testJoinRoom, testScorePlayer, testQueryRoomTransactions } = require('./test.js');
  
  // 1. 登录
  const loginSuccess = await testLogin();
  if (!loginSuccess) return;
  
  // 2. 创建房间
  const gameId = await testCreateRoom();
  if (!gameId) return;
  
  // 3. 加入房间
  const joinSuccess = await testJoinRoom(gameId);
  if (!joinSuccess) return;
  
  // 4. 给自己加分
  await testScorePlayer(gameId, 1, 100); // 假设当前用户ID为1
  
  // 5. 查询房间交易记录
  await testQueryRoomTransactions(gameId);
}

// 运行示例
async function runExamples() {
  try {
    await example1();
    console.log('\n');
    
    await example2();
    console.log('\n');
    
    await example3();
    
  } catch (error) {
    console.error('运行示例时出错:', error.message);
  }
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
  runExamples();
}

module.exports = {
  example1,
  example2,
  example3,
  runExamples
}; 
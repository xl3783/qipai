const { Pool } = require('pg');
const GameServices = require('./roomServices');
require('dotenv').config();

// 数据库连接配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const gameServices = new GameServices(pool);

async function testMigration() {
  console.log('开始测试PostgreSQL函数迁移到Node.js...\n');
  
  try {
    // 测试1: 微信登录
    console.log('测试1: 微信登录');
    const loginResult = await gameServices.loginWithWechat('test_openid_123', '测试用户');
    console.log('登录结果:', loginResult);
    console.log('✓ 微信登录测试通过\n');
    
    // 测试2: 创建游戏房间
    console.log('测试2: 创建游戏房间');
    const gameId = await gameServices.createGameRoom(loginResult.user_id);
    console.log('游戏ID:', gameId);
    console.log('✓ 创建游戏房间测试通过\n');
    
    // 测试3: 获取游戏信息
    console.log('测试3: 获取游戏信息');
    const gameInfo = await gameServices.getGameInfo(gameId);
    console.log('游戏信息:', JSON.stringify(gameInfo, null, 2));
    console.log('✓ 获取游戏信息测试通过\n');
    
    // 测试4: 更新玩家积分
    console.log('测试4: 更新玩家积分');
    const transactionId = await gameServices.updatePlayerScore(
      loginResult.user_id, 
      gameId, 
      100, 
      '测试积分增加'
    );
    console.log('交易ID:', transactionId);
    console.log('✓ 更新玩家积分测试通过\n');
    
    // 测试5: 获取积分历史
    console.log('测试5: 获取积分历史');
    const history = await gameServices.getScoreHistory(loginResult.user_id, 10);
    console.log('积分历史:', history);
    console.log('✓ 获取积分历史测试通过\n');
    
    // 测试6: 获取排行榜
    console.log('测试6: 获取排行榜');
    const leaderboard = await gameServices.getLeaderboard(5);
    console.log('排行榜:', leaderboard);
    console.log('✓ 获取排行榜测试通过\n');
    
    // 测试7: 结束游戏
    console.log('测试7: 结束游戏');
    await gameServices.endGame(gameId);
    console.log('✓ 结束游戏测试通过\n');
    
    console.log('🎉 所有测试通过！PostgreSQL函数已成功迁移到Node.js');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await pool.end();
  }
}

// 运行测试
testMigration(); 
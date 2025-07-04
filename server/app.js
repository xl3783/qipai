const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { Pool } = require('pg');
const GameServices = require('./gameServices');
require('dotenv').config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 数据库连接配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 创建统一的数据库服务对象
const dbService = {
  pool: pool,
  
  // 获取数据库连接
  async getConnection() {
    return await this.pool.connect();
  },
  
  // 执行查询
  async query(text, params) {
    return await this.pool.query(text, params);
  },
  
  // 执行事务
  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

// 初始化游戏服务 - 传入数据库服务对象
const gameServices = new GameServices(dbService);

// 中间件配置
app.use(helmet()); // 安全头
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined')); // 日志
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 数据库连接测试
pool.on('connect', () => {
  console.log('数据库连接成功');
});

pool.on('error', (err) => {
  console.error('数据库连接错误:', err);
});

// JWT验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '访问令牌无效' });
    }
    req.user = user;
    next();
  });
};

// 微信数据解密函数
const decryptData = (encryptedData, iv, sessionKey) => {
  try {
    const crypto = require('crypto');
    const decipher = crypto.createDecipher('aes-128-cbc', sessionKey);
    decipher.setAutoPadding(true);
    decipher.setAAD(Buffer.from(''));
    
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('数据解密失败:', error);
    return null;
  }
};

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: pool.totalCount > 0 ? 'connected' : 'disconnected'
  });
});

// 随机生成UUID
const randomUUID = () => {
  return 'mock_openid_' + Math.random().toString(36).substring(2, 15);
};

// 微信登录接口
app.post('/api/wechat-login', async (req, res) => {
  try {
    const { code, encryptedData, iv } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: '缺少微信授权码' });
    }

    // mock data
    const wechatRes = {
      data: {
        openid: randomUUID(),
        session_key: randomUUID()
      }
    };
    console.log(wechatRes);

    // 1. 用code换取openid
    // const wechatRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    //   params: {
    //     appid: process.env.WX_APPID,
    //     secret: process.env.WX_SECRET,
    //     js_code: code,
    //     grant_type: 'authorization_code'
    //   }
    // });

    if (wechatRes.data.errcode) {
      return res.status(400).json({ error: `微信API错误: ${wechatRes.data.errmsg}` });
    }

    const { openid, session_key } = wechatRes.data;
    console.log(openid, session_key);
    
    // 2. 解密用户数据（如果需要）
    let userInfo = {
        nickName: 'mock_nickname'
    };
    if (encryptedData && iv) {
      userInfo = decryptData(encryptedData, iv, session_key);
    }
    
    // 3. 调用游戏服务处理登录
    const loginResult = await gameServices.loginWithWechat(openid, userInfo?.nickName || '');
    
    if (!loginResult) {
      return res.status(500).json({ error: '用户登录失败' });
    }
    
    const { role, user_id } = loginResult;
    
    // 4. 生成JWT令牌
    const token = jwt.sign(
      { aud: "postgraphile", role, user_id, openid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token,
      user: {
        id: user_id,
        role: role,
        nickname: userInfo?.nickName || ''
      }
    });
  } catch (error) {
    console.error('微信登录错误:', error);
    res.status(500).json({ error: '登录失败，请重试' });
  }
});

// 玩家相关API
app.get('/api/players/profile', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    
    const result = await dbService.query(`
      SELECT p.player_id, p.username, p.created_at, s.current_total as score
      FROM players p
      LEFT JOIN scores s ON p.player_id = s.player_id
      WHERE p.player_id = $1
    `, [user_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '玩家不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('获取玩家信息错误:', error);
    res.status(500).json({ error: '获取玩家信息失败' });
  }
});

// 游戏相关API
app.post('/api/games', authenticateToken, async (req, res) => {
  try {
    const { game_type, participants } = req.body;
    const { user_id } = req.user;
    
    if (!game_type) {
      return res.status(400).json({ error: '游戏类型不能为空' });
    }
    
    // 使用数据库服务的事务功能
    const result = await dbService.transaction(async (client) => {
      // 创建游戏
      const gameResult = await client.query(`
        INSERT INTO games (game_type, start_time, created_by)
        VALUES ($1, NOW(), $2)
        RETURNING game_id
      `, [game_type, user_id]);
      
      const gameId = gameResult.rows[0].game_id;
      
      // 添加参与者
      if (participants && participants.length > 0) {
        for (let i = 0; i < participants.length; i++) {
          const participant = participants[i];
          await client.query(`
            INSERT INTO game_participants (game_id, player_id, initial_score, position)
            VALUES ($1, $2, $3, $4)
          `, [gameId, participant.player_id, participant.initial_score || 0, i + 1]);
        }
      }
      
      return { game_id: gameId };
    });
    
    res.json({ 
      game_id: result.game_id,
      message: '游戏创建成功'
    });
  } catch (error) {
    console.error('创建游戏错误:', error);
    res.status(500).json({ error: '创建游戏失败' });
  }
});

// 创建游戏房间API（使用JWT token中的user_id）
app.post('/api/games/create', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    
    // 调用游戏服务创建游戏房间
    const gameId = await gameServices.createGameRoom(user_id);
    
    res.json({ 
      game_id: gameId,
      message: '游戏房间创建成功'
    });
  } catch (error) {
    console.error('创建游戏房间错误:', error);
    res.status(500).json({ error: '创建游戏房间失败: ' + error.message });
  }
});

app.get('/api/games/:gameId', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const gameInfo = await gameServices.getGameInfo(gameId);
    
    if (!gameInfo) {
      return res.status(404).json({ error: '游戏不存在' });
    }
    
    res.json(gameInfo);
  } catch (error) {
    console.error('获取游戏信息错误:', error);
    res.status(500).json({ error: '获取游戏信息失败' });
  }
});

// 积分相关API
app.post('/api/scores/transaction', authenticateToken, async (req, res) => {
  try {
    const { player_id, points_change, game_id, description } = req.body;
    const { user_id } = req.user;
    
    if (!player_id || points_change === undefined) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 验证权限（只能修改自己的积分或管理员）
    if (user_id !== player_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '权限不足' });
    }
    
    const transactionId = await gameServices.updatePlayerScore(player_id, game_id, points_change, description);
    
    res.json({
      success: true,
      transaction_id: transactionId,
      message: '积分更新成功'
    });
  } catch (error) {
    console.error('积分交易错误:', error);
    res.status(500).json({ error: '积分交易失败: ' + error.message });
  }
});

app.get('/api/scores/history/:playerId', authenticateToken, async (req, res) => {
  try {
    const { playerId } = req.params;
    const { limit = 50 } = req.query;
    
    const history = await gameServices.getScoreHistory(playerId, parseInt(limit));
    
    res.json(history);
  } catch (error) {
    console.error('获取积分历史错误:', error);
    res.status(500).json({ error: '获取积分历史失败' });
  }
});

// 排行榜API
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = await gameServices.getLeaderboard(parseInt(limit));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({ error: '获取排行榜失败' });
  }
});

// 游戏管理API
app.post('/api/games/join', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.body;
    const { user_id } = req.user;
    const { position } = req.body;

    console.log(gameId, user_id, position);
    
    const participationId = await gameServices.joinGame(gameId, user_id, position);
    
    res.json({
      success: true,
      participation_id: participationId,
      message: '成功加入游戏'
    });
  } catch (error) {
    console.error('加入游戏错误:', error);
    res.status(500).json({ error: '加入游戏失败: ' + error.message });
  }
});

app.post('/api/games/leave', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.body;
    const { user_id } = req.user;
    
    const result = await gameServices.leaveGame(gameId, user_id);
    
    res.json({
      success: true,
      message: '成功离开游戏'
    });
  } catch (error) {
    console.error('离开游戏错误:', error);
    res.status(500).json({ error: '离开游戏失败: ' + error.message });
  }
});

app.post('/api/games/end', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.body;
    // const { gameId } = req.params;
    const { user_id } = req.user;
    
    // 检查权限（只有游戏创建者或管理员可以结束游戏）
    const gameInfo = await gameServices.getGameInfo(gameId);
    if (!gameInfo) {
      return res.status(404).json({ error: '游戏不存在' });
    }
    
    // if (gameInfo.created_by !== user_id && req.user.role !== 'admin') {
    //   return res.status(403).json({ error: '权限不足' });
    // }
    
    await gameServices.endGame(gameId);
    
    res.json({
      success: true,
      message: '游戏已结束'
    });
  } catch (error) {
    console.error('结束游戏错误:', error);
    res.status(500).json({ error: '结束游戏失败: ' + error.message });
  }
});

app.post('/api/games/transfer', authenticateToken, async (req, res) => {
  try {
    const { gameId, to, points, description } = req.body;
    const { user_id } = req.user;

    let from = user_id;
    
    // // 验证权限（只能转移自己的积分或管理员）
    // if (from !== user_id && req.user.role !== 'admin') {
    //   return res.status(403).json({ error: '权限不足' });
    // }
    
    const result = await gameServices.transferPointsBetweenPlayers(
      from, 
      to, 
      points, 
      gameId, 
      description
    );
    
    res.json({
      success: true,
      transfer_id: result.transfer_id,
      message: '积分转移成功'
    });
  } catch (error) {
    console.error('积分转移错误:', error);
    res.status(500).json({ error: '积分转移失败: ' + error.message });
  }
});

app.post('/api/games/:gameId/kick', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { player_id, reason } = req.body;
    const { user_id } = req.user;
    
    // 检查权限（只有游戏创建者或管理员可以踢出玩家）
    const gameInfo = await gameServices.getGameInfo(gameId);
    if (!gameInfo) {
      return res.status(404).json({ error: '游戏不存在' });
    }
    
    if (gameInfo.created_by !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '权限不足' });
    }
    
    const result = await gameServices.kickPlayer(gameId, player_id, reason);
    
    res.json({
      success: true,
      message: '玩家已被踢出游戏'
    });
  } catch (error) {
    console.error('踢出玩家错误:', error);
    res.status(500).json({ error: '踢出玩家失败: ' + error.message });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  pool.end();
  process.exit(0);
});

// 导出app和数据库服务，以便其他模块使用
module.exports = { app, dbService, pool };
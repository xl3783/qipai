
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { GameServices, convertKeysToCamelCase } = require('./gameServices');
const sseManager = require('./sse/sse_manager');
const SSEEvent = require('./sse/sse_event');
const { TransferEvent } = require('./sse/events');
const expressWs = require('express-ws');
require('dotenv').config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 初始化express-ws
const wsInstance = expressWs(app);

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

// WebSocket连接管理
const socketManager = {
  // 存储房间连接
  roomConnections: new Map(),
  
  // 添加连接到房间
  joinRoom(socketId, roomId) {
    if (!this.roomConnections.has(roomId)) {
      this.roomConnections.set(roomId, new Set());
    }
    this.roomConnections.get(roomId).add(socketId);
    console.log(`用户 ${socketId} 加入房间 ${roomId}`);
  },
  
  // 从房间移除连接
  leaveRoom(socketId, roomId) {
    const room = this.roomConnections.get(roomId);
    if (room) {
      room.delete(socketId);
      if (room.size === 0) {
        this.roomConnections.delete(roomId);
      }
      console.log(`用户 ${socketId} 离开房间 ${roomId}`);
    }
  },
  
  // 向房间广播消息
  broadcastToRoom(roomId, event, data) {
    const room = this.roomConnections.get(roomId);
    if (room) {
      const message = JSON.stringify({ event, data });
      room.forEach(socketId => {
        // 向房间内的所有客户端发送消息
        wsInstance.getWss().clients.forEach(client => {
          if (client.readyState === 1 && client.socketId === socketId) { // 1 means 'OPEN'
            client.send(message);
          }
        });
      });
      console.log(`向房间 ${roomId} 广播事件 ${event}`);
    }
  },
  
  // 获取房间连接数
  getRoomConnectionCount(roomId) {
    const room = this.roomConnections.get(roomId);
    return room ? room.size : 0;
  }
};

// 自动关闭超时房间的定时任务
const autoCloseInactiveRooms = async () => {
  try {
    console.log('执行自动关闭超时房间任务...');
    
    // 查找超过1小时没有交易记录且状态为active的游戏
    const inactiveGames = await dbService.query(`
      SELECT DISTINCT g.game_id, g.game_name
      FROM games g
      LEFT JOIN transfer_records tr ON g.game_id = tr.game_id
      WHERE g.status = 'playing'
      AND (
        -- 没有交易记录且开始时间超过1小时
        (tr.transfer_id IS NULL AND g.created_at < NOW() - INTERVAL '1 hour')
        OR
        -- 有交易记录但最后一次交易超过1小时
        (tr.transfer_id IS NOT NULL AND tr.created_at < NOW() - INTERVAL '1 hour')
      )
    `);
    
    if (inactiveGames.rows.length === 0) {
      console.log('没有需要关闭的超时房间');
      return;
    }
    
    console.log(`找到 ${inactiveGames.rows.length} 个超时房间需要关闭`);
    
    // 批量关闭超时房间
    for (const game of inactiveGames.rows) {
      try {
        await gameServices.endGame(game.game_id);
        console.log(`已自动关闭房间: ${game.game_name} (ID: ${game.game_id})`);
      } catch (error) {
        console.error(`关闭房间 ${game.game_name} (ID: ${game.game_id}) 失败:`, error.message);
      }
    }
    
    console.log('自动关闭超时房间任务完成');
  } catch (error) {
    console.error('自动关闭超时房间任务执行失败:', error);
  }
};

// 启动定时任务 - 每30分钟执行一次
const startAutoCloseTask = () => {
  // 立即执行一次
  autoCloseInactiveRooms();
  
  // 设置定时器，每30分钟执行一次
  setInterval(autoCloseInactiveRooms, 30 * 60 * 1000);
  
  console.log('自动关闭超时房间定时任务已启动 (每30分钟执行一次)');
};

// 发送交易通知的辅助函数
const sendEventToClient = async (event) => {
  try {
    // 广播给所有连接的客户端
    sseManager.broadcast(event);
    
    console.log('已发送通知:', event);
  } catch (error) {
    console.error('发送通知失败:', error.message);  
  }
};

// 初始化游戏服务 - 传入数据库服务对象和通知回调
const gameServices = new GameServices(dbService, sendEventToClient);

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

// SSE连接端点
app.get('/api/sse/connect', authenticateToken, (req, res) => {
  const { userId } = req.user;
  const clientId = `user_${userId}`;
  
  console.log(`用户 ${userId} 建立SSE连接`);
  
  // 添加客户端到SSE管理器
  const cleanup = sseManager.addClient(clientId, res);
  
  // 当客户端断开连接时清理
  req.on('close', () => {
    console.log(`用户 ${userId} SSE连接断开`);
    cleanup();
  });
});

// 获取当前连接的客户端数量（调试用）
app.get('/api/sse/status', (req, res) => {
  res.json({
    connectedClients: sseManager.getClientCount(),
    timestamp: new Date().toISOString()
  });
});



// 发送游戏状态变更通知
const sendGameStatusNotification = async (gameData) => {
  try {
    const event = new SSEEvent('game_status', {
      type: 'game_status_change',
      data: gameData,
      timestamp: new Date().toISOString()
    });
    
    sseManager.broadcast(event);
    
    console.log('已发送游戏状态变更通知:', gameData);
  } catch (error) {
    console.error('发送游戏状态变更通知失败:', error);
  }
};

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
        openid: code,
        session_key: code
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
        nickName: ''
    };
    if (encryptedData && iv) {
      userInfo = decryptData(encryptedData, iv, session_key);
    }
    
    // 3. 调用游戏服务处理登录
    const loginResult = await gameServices.loginWithWechat(openid, userInfo?.nickName || '');
    
    if (!loginResult) {
      return res.status(500).json({ error: '用户登录失败' });
    }
    
    const { role, userId, username } = loginResult;
    
    // 4. 生成JWT令牌
    const token = jwt.sign(
      { aud: "postgraphile", role, userId, openid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token,
      user: {
        id: userId,
        role: role,
        nickname: username
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
    const { userId } = req.user;

    const result  = await gameServices.getPlayerProfile(userId);
    
    res.json(result);
  } catch (error) {
    console.error('获取玩家信息错误:', error);
    res.status(500).json({ error: '获取玩家信息失败' });
  }
});

// 游戏相关API
app.post('/api/games', authenticateToken, async (req, res) => {
  try {
    const { game_type, participants } = req.body;
    const { userId } = req.user;
    
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
      `, [game_type, userId]);
      
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

// 创建游戏房间API（使用JWT token中的userId）
app.post('/api/games/create', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // 调用游戏服务创建游戏房间
    const gameInfo = await gameServices.createGameRoom(userId);
    
    res.json({ 
      gameId: gameInfo.gameId,
      gameName: gameInfo.gameName,
      message: '游戏房间创建成功'
    });
  } catch (error) {
    console.error('创建游戏房间错误:', error);
    res.status(500).json({ error: '创建游戏房间失败: ' + error.message });
  }
});


// 积分相关API
app.post('/api/scores/transaction', authenticateToken, async (req, res) => {
  try {
    const { player_id, points_change, game_id, description } = req.body;
    const { userId } = req.user;
    
    if (!player_id || points_change === undefined) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 验证权限（只能修改自己的积分或管理员）
    if (userId !== player_id && req.user.role !== 'admin') {
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
    const { gameName } = req.body;
    const { userId } = req.user;
    const { position } = req.body;

    console.log(gameName, userId, position);
    
    const joinResult = await gameServices.joinGame(gameName, userId, position);
    console.log(joinResult);
    res.json({
      success: true,
      participationId: joinResult.participationId,
      gameId: joinResult.gameId,
      gameName: joinResult.gameName,
      playerId: joinResult.playerId,
      position: joinResult.position,
      currentScore: joinResult.currentScore,
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
    const { userId } = req.user;
    
    const result = await gameServices.leaveGame(gameId, userId);
    
    res.json({
      success: true,
      message: '成功离开游戏'
    });
  } catch (error) {
    console.error('离开游戏错误:', error);
    res.status(500).json({ error: '离开游戏失败: ' + error.message });
  }
});

app.post('/api/players/update', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { username, phone, email, avatarUrl } = req.body;

    const result = await gameServices.updatePlayer(userId, username, phone, email, avatarUrl);

    res.json({
      success: true,
    })
  } catch (error) {
    console.error('更新玩家信息错误:', error);
    res.status(500).json({ error: '更新玩家信息失败: ' + error.message });
  }
})

app.post('/api/games/end', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.body;
    // const { gameId } = req.params;
    const { userId } = req.user;
    
    // 检查权限（只有游戏创建者或管理员可以结束游戏）
    const gameInfo = await gameServices.getGameInfo(gameId);
    if (!gameInfo) {
      return res.status(404).json({ error: '游戏不存在' });
    }
    
    // if (gameInfo.created_by !== userId && req.user.role !== 'admin') {
    //   return res.status(403).json({ error: '权限不足' });
    // }
    
    await gameServices.endGame(gameId);
    
    // 发送游戏结束通知
    await sendGameStatusNotification({
      gameId: gameId,
      gameName: gameInfo.gameName,
      status: 'finished',
      endedBy: userId,
      endTime: new Date().toISOString()
    });
    
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
    const { gameId, from, to, points, description } = req.body;
    const { userId } = req.user;

    // 如果没有指定from，使用当前用户ID
    const fromPlayerId = from || userId;
    
    // 验证权限（只能转移自己的积分或管理员）
    if (fromPlayerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: '权限不足' });
    }
    
    const result = await gameServices.transferPointsBetweenPlayers(
      fromPlayerId, 
      to, 
      points, 
      gameId, 
      description
    );

    // 获取最新的房间详情
    const roomDetail = await gameServices.getRoomDetail(gameId);
    
    // 通过WebSocket广播房间更新
    socketManager.broadcastToRoom(gameId, 'room-updated', {
      type: 'transfer',
      roomDetail: roomDetail,
      transfer: {
        from: fromPlayerId,
        to: to,
        points: points,
        description: description
      }
    });

    res.json({
      success: true,
      transferId: result.transferId,
      message: '积分转移成功'
    });
  } catch (error) {
    console.error('积分转移错误:', error);
    res.status(500).json({ error: '积分转移失败: ' + error.message });
  }
});


app.post('/api/get-room-detail', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.body;
    console.log(gameId);
    const roomDetail = await gameServices.getRoomDetail(gameId);
    console.log(roomDetail);
    res.json(roomDetail);
  } catch (error) {
    console.error('获取游戏列表错误:', error);
  }
});

app.get('/api/get-rooms', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    console.log(userId);
    const games = await gameServices.getRooms(userId);
    console.log(games);
    // js 下划线转驼峰工具
    res.json(games);
  } catch (error) {
    console.error('获取游戏列表错误:', error);
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.post('/api/get-rankings', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.body;
    const rankings = await gameServices.getRankings(gameId);
    res.json(rankings);
  } catch (error) {
    console.error('获取排行榜错误:', error);
  }
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 导出app和数据库服务，以便其他模块使用
module.exports = { app, dbService, pool };

// WebSocket路由处理
app.ws('/ws', (ws, req) => {
  console.log(`WebSocket连接建立: ${req.url}`);
  
  // 从多种方式获取token
  let token = null;
  
  // 1. 从URL查询参数获取
  const url = new URL(req.url, `http://${req.headers.host}`);
  token = url.searchParams.get('token');
  
  // 2. 从Authorization header获取
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  console.log('获取到的token:', token ? '存在' : '不存在');
  
  if (!token) {
    console.log('WebSocket连接缺少token，拒绝连接');
    ws.close(1008, 'Missing authentication token');
    return;
  }
  
  // 验证token
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`WebSocket连接认证成功，用户: ${user.userId}`);
    
    // 为每个连接生成唯一ID
    ws.socketId = Math.random().toString(36).substr(2, 9);
    ws.roomId = null;
    ws.userId = user.userId;
    ws.user = user;
    
    // 发送认证成功消息
    ws.send(JSON.stringify({
      type: 'auth-success',
      userId: user.userId,
      message: '认证成功'
    }));
    
    // 处理消息
    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        console.log('收到WebSocket消息:', data);
        
        switch (data.type) {
          case 'join-room':
            ws.roomId = data.roomId;
            socketManager.joinRoom(ws.socketId, data.roomId);
            ws.send(JSON.stringify({
              type: 'joined-room',
              roomId: data.roomId,
              userId: ws.userId
            }));
            console.log(`用户 ${ws.userId} 加入房间 ${data.roomId}`);
            break;
            
          case 'leave-room':
            if (ws.roomId) {
              socketManager.leaveRoom(ws.socketId, ws.roomId);
              ws.roomId = null;
            }
            console.log(`用户 ${ws.userId} 离开房间`);
            break;
            
          default:
            console.log('未知消息类型:', data.type);
        }
      } catch (error) {
        console.error('处理WebSocket消息错误:', error);
      }
    });
    
    // 处理连接关闭
    ws.on('close', () => {
      console.log(`WebSocket连接关闭: ${ws.socketId}, 用户: ${ws.userId}`);
      if (ws.roomId) {
        socketManager.leaveRoom(ws.socketId, ws.roomId);
      }
    });
    
    // 处理错误
    ws.on('error', (error) => {
      console.error('WebSocket错误:', error);
    });
    
  } catch (err) {
    console.log('WebSocket连接token无效，拒绝连接:', err.message);
    ws.close(1008, 'Invalid authentication token');
  }
});

// 只在非测试环境下启动服务器
if (process.env.NODE_ENV !== 'test') {
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`WebSocket服务器已启动`);
    
    // 启动自动关闭超时房间的定时任务
    startAutoCloseTask();
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
}
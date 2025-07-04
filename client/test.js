const axios = require('axios');
const config = require('./config');

// 配置
const BASE_URL = config.server.baseUrl;
const GRAPHQL_URL = config.server.graphqlUrl;

// 全局变量
let authToken = null;
let currentUserId = null;

// 工具函数
const log = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log('---');
};

// REST API 请求函数
const restRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    log(`REST API 错误: ${method} ${endpoint}`, {
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    throw error;
  }
};

// GraphQL 请求函数
const graphqlRequest = async (query, variables = {}, headers = {}) => {
  try {
    const response = await axios.post(GRAPHQL_URL, {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        ...headers
      }
    });
    
    if (response.data.errors) {
      log('GraphQL 错误', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }
    
    return response.data.data;
  } catch (error) {
    log(`GraphQL 错误`, {
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    throw error;
  }
};

// 测试登录（使用 REST API）
async function testLogin() {
  log('开始测试登录...');
  
  try {
    // 模拟微信登录
    const loginData = {
      code: config.testData.wechat.codePrefix + Date.now(),
      encryptedData: config.testData.wechat.encryptedData,
      iv: config.testData.wechat.iv
    };
    
    const result = await restRequest('POST', '/api/wechat-login', loginData);
    
    authToken = result.token;
    currentUserId = result.user.id;
    
    log('登录成功', {
      userId: currentUserId,
      role: result.user.role,
      nickname: result.user.nickname
    });
    
    return true;
  } catch (error) {
    log('登录失败', error.message);
    return false;
  }
}

// 测试创建房间（使用 GraphQL）
async function testCreateRoom() {
  log('开始测试创建房间...');
  
  try {
    const mutation = `
      mutation CreateGameRoom {
        createGameRoom {
          gameId
          message
        }
      }
    `;
    
    const result = await graphqlRequest(mutation);
    
    log('创建房间成功', result.createGameRoom);
    return result.createGameRoom.gameId;
  } catch (error) {
    log('创建房间失败', error.message);
    return null;
  }
}

// 测试邀请玩家（使用 GraphQL）
async function testInvitePlayer(gameId, targetPlayerId) {
  log(`开始测试邀请玩家 ${targetPlayerId} 到房间 ${gameId}...`);
  
  try {
    const mutation = `
      mutation InvitePlayer($gameId: BigInt!, $playerId: BigInt!) {
        invitePlayerToGame(input: {
          gameId: $gameId,
          playerId: $playerId
        }) {
          success
          message
        }
      }
    `;
    
    const result = await graphqlRequest(mutation, {
      gameId: gameId.toString(),
      playerId: targetPlayerId.toString()
    });
    
    log('邀请玩家成功', result.invitePlayerToGame);
    return result.invitePlayerToGame.success;
  } catch (error) {
    log('邀请玩家失败', error.message);
    return false;
  }
}

// 测试加入房间（使用 GraphQL）
async function testJoinRoom(gameId) {
  log(`开始测试加入房间 ${gameId}...`);
  
  try {
    const mutation = `
      mutation JoinGame($gameId: BigInt!) {
        joinGame(input: {
          gameId: $gameId
        }) {
          success
          message
          participationId
        }
      }
    `;
    
    const result = await graphqlRequest(mutation, {
      gameId: gameId.toString()
    });
    
    log('加入房间成功', result.joinGame);
    return result.joinGame.success;
  } catch (error) {
    log('加入房间失败', error.message);
    return false;
  }
}

// 测试给玩家打分（使用 GraphQL）
async function testScorePlayer(gameId, playerId, pointsChange) {
  log(`开始测试给玩家 ${playerId} 打分: ${pointsChange}...`);
  
  try {
    const mutation = `
      mutation ScorePlayer($gameId: BigInt!, $playerId: BigInt!, $pointsChange: Int!) {
        createScoreTransaction(input: {
          playerId: $playerId,
          gameId: $gameId,
          pointsChange: $pointsChange
        }) {
          success
          newTotal
          message
          transactionId
        }
      }
    `;
    
    const result = await graphqlRequest(mutation, {
      gameId: gameId.toString(),
      playerId: playerId.toString(),
      pointsChange: pointsChange
    });
    
    log('打分成功', result.createScoreTransaction);
    return result.createScoreTransaction.success;
  } catch (error) {
    log('打分失败', error.message);
    return false;
  }
}

// 测试查询房间交易（使用 GraphQL）
async function testQueryRoomTransactions(gameId) {
  log(`开始测试查询房间 ${gameId} 的交易记录...`);
  
  try {
    const query = `
      query GetGameTransactions($gameId: BigInt!) {
        gameById(id: $gameId) {
          gameId
          gameType
          status
          startTime
          endTime
          gameParticipantsByGameId {
            nodes {
              playerId
              initialScore
              finalScore
              position
              status
              playerByPlayerId {
                username
              }
            }
          }
          scoreTransactionsByGameId {
            nodes {
              transactionId
              playerId
              pointsChange
              currentTotal
              transactionType
              eventTime
              playerByPlayerId {
                username
              }
            }
          }
        }
      }
    `;
    
    const result = await graphqlRequest(query, {
      gameId: gameId.toString()
    });
    
    log('查询房间交易成功', result.gameById);
    return result.gameById;
  } catch (error) {
    log('查询房间交易失败', error.message);
    return null;
  }
}

// 测试查询玩家积分历史（使用 GraphQL）
async function testQueryPlayerScoreHistory(playerId) {
  log(`开始测试查询玩家 ${playerId} 的积分历史...`);
  
  try {
    const query = `
      query GetPlayerScoreHistory($playerId: BigInt!, $limit: Int!) {
        playerById(id: $playerId) {
          playerId
          username
          scoresByPlayerId {
            currentTotal
            gamesPlayed
            gamesWon
            lastUpdated
          }
          scoreTransactionsByPlayerId(first: $limit, orderBy: EVENT_TIME_DESC) {
            nodes {
              transactionId
              gameId
              pointsChange
              currentTotal
              transactionType
              eventTime
              gameByGameId {
                gameType
              }
            }
          }
        }
      }
    `;
    
    const result = await graphqlRequest(query, {
      playerId: playerId.toString(),
      limit: 10
    });
    
    log('查询玩家积分历史成功', result.playerById);
    return result.playerById;
  } catch (error) {
    log('查询玩家积分历史失败', error.message);
    return null;
  }
}

// 测试查询排行榜（使用 GraphQL）
async function testQueryLeaderboard() {
  log('开始测试查询排行榜...');
  
  try {
    const query = `
      query GetLeaderboard($limit: Int!) {
        allScores(first: $limit, orderBy: CURRENT_TOTAL_DESC) {
          nodes {
            currentTotal
            gamesPlayed
            gamesWon
            lastUpdated
            playerByPlayerId {
              playerId
              username
            }
          }
        }
      }
    `;
    
    const result = await graphqlRequest(query, {
      limit: 10
    });
    
    log('查询排行榜成功', result.allScores);
    return result.allScores.nodes;
  } catch (error) {
    log('查询排行榜失败', error.message);
    return null;
  }
}

// 测试积分转移（使用 GraphQL）
async function testTransferPoints(fromPlayerId, toPlayerId, points, gameId = null) {
  log(`开始测试积分转移: ${fromPlayerId} -> ${toPlayerId}, 积分: ${points}...`);
  
  try {
    const mutation = `
      mutation TransferPoints($fromPlayerId: BigInt!, $toPlayerId: BigInt!, $points: Int!, $gameId: BigInt) {
        transferPoints(input: {
          fromPlayerId: $fromPlayerId,
          toPlayerId: $toPlayerId,
          points: $points,
          gameId: $gameId
        }) {
          success
          message
          transferId
        }
      }
    `;
    
    const result = await graphqlRequest(mutation, {
      fromPlayerId: fromPlayerId.toString(),
      toPlayerId: toPlayerId.toString(),
      points: points,
      gameId: gameId ? gameId.toString() : null
    });
    
    log('积分转移成功', result.transferPoints);
    return result.transferPoints.success;
  } catch (error) {
    log('积分转移失败', error.message);
    return false;
  }
}

// 主测试函数
async function runAllTests() {
  log('开始运行所有测试...');
  
  // 1. 测试登录
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    log('登录失败，停止测试');
    return;
  }
  
  // 2. 测试创建房间
  const gameId = await testCreateRoom();
  if (!gameId) {
    log('创建房间失败，停止测试');
    return;
  }
  
  // 3. 测试邀请玩家（需要先有其他玩家）
  // 这里假设有一个测试玩家ID
  const testPlayerId = config.testData.testPlayerId; // 需要根据实际情况调整
  await testInvitePlayer(gameId, testPlayerId);
  
  // 4. 测试加入房间
  await testJoinRoom(gameId);
  
  // 5. 测试给玩家打分
  await testScorePlayer(gameId, currentUserId, config.testData.score.initialPoints);
  await testScorePlayer(gameId, testPlayerId, config.testData.score.penaltyPoints);
  
  // 6. 测试查询房间交易
  await testQueryRoomTransactions(gameId);
  
  // 7. 测试查询玩家积分历史
  await testQueryPlayerScoreHistory(currentUserId);
  
  // 8. 测试查询排行榜
  await testQueryLeaderboard();
  
  // 9. 测试积分转移
  await testTransferPoints(currentUserId, testPlayerId, config.testData.score.transferPoints, gameId);
  
  log('所有测试完成！');
}

// 健康检查
async function healthCheck() {
  try {
    const result = await restRequest('GET', '/health');
    log('服务器健康检查成功', result);
    return true;
  } catch (error) {
    log('服务器健康检查失败', error.message);
    return false;
  }
}

// 导出函数供单独测试使用
module.exports = {
  testLogin,
  testCreateRoom,
  testInvitePlayer,
  testJoinRoom,
  testScorePlayer,
  testQueryRoomTransactions,
  testQueryPlayerScoreHistory,
  testQueryLeaderboard,
  testTransferPoints,
  runAllTests,
  healthCheck
};

// 如果直接运行此文件，执行所有测试
if (require.main === module) {
  (async () => {
    // 先进行健康检查
    const healthy = await healthCheck();
    if (!healthy) {
      log('服务器不可用，请确保服务器正在运行');
      process.exit(1);
    }
    
    // 运行所有测试
    await runAllTests();
  })();
}
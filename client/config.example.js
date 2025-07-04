// 测试配置文件示例
// 复制此文件为 config.js 并根据实际情况修改配置

module.exports = {
  // 服务器配置
  server: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    graphqlUrl: process.env.GRAPHQL_URL || 'http://localhost:5000/graphql',
    timeout: 10000 // 请求超时时间（毫秒）
  },
  
  // 测试数据配置
  testData: {
    // 测试玩家ID（需要根据实际数据库中的玩家ID调整）
    testPlayerId: parseInt(process.env.TEST_PLAYER_ID) || 2,
    
    // 微信登录配置
    wechat: {
      codePrefix: 'mock_wechat_code_',
      encryptedData: null,
      iv: null
    },
    
    // 游戏配置
    game: {
      gameType: process.env.TEST_GAME_TYPE || '自定义',
      maxPlayers: parseInt(process.env.TEST_MAX_PLAYERS) || 30,
      minPlayers: parseInt(process.env.TEST_MIN_PLAYERS) || 2
    },
    
    // 积分测试配置
    score: {
      initialPoints: parseInt(process.env.TEST_INITIAL_POINTS) || 100,
      transferPoints: parseInt(process.env.TEST_TRANSFER_POINTS) || 25,
      penaltyPoints: parseInt(process.env.TEST_PENALTY_POINTS) || -50
    }
  },
  
  // 测试配置
  test: {
    // 是否启用详细日志
    verbose: process.env.TEST_VERBOSE === 'true',
    
    // 是否在测试失败时停止
    stopOnFailure: process.env.TEST_STOP_ON_FAILURE === 'true',
    
    // 重试次数
    retryCount: parseInt(process.env.TEST_RETRY_COUNT) || 3,
    
    // 重试间隔（毫秒）
    retryDelay: parseInt(process.env.TEST_RETRY_DELAY) || 1000
  },
  
  // GraphQL 查询配置
  graphql: {
    // 查询超时时间
    timeout: 5000,
    
    // 最大查询结果数量
    maxResults: 100
  }
}; 
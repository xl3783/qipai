// 测试配置文件
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
    testPlayerId: 2,
    
    // 微信登录配置
    wechat: {
      codePrefix: 'mock_wechat_code_',
      encryptedData: null,
      iv: null
    },
    
    // 游戏配置
    game: {
      gameType: '自定义',
      maxPlayers: 30,
      minPlayers: 2
    },
    
    // 积分测试配置
    score: {
      initialPoints: 100,
      transferPoints: 25,
      penaltyPoints: -50
    }
  },
  
  // 测试配置
  test: {
    // 是否启用详细日志
    verbose: true,
    
    // 是否在测试失败时停止
    stopOnFailure: false,
    
    // 重试次数
    retryCount: 3,
    
    // 重试间隔（毫秒）
    retryDelay: 1000
  },
  
  // GraphQL 查询配置
  graphql: {
    // 查询超时时间
    timeout: 5000,
    
    // 最大查询结果数量
    maxResults: 100
  }
}; 
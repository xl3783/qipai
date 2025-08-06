const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 模拟用户登录获取token
const loginUser = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/wechat-login`, {
      code: userId, // 使用userId作为code进行模拟登录
      encryptedData: null,
      iv: null
    });
    
    return response.data.token;
  } catch (error) {
    console.error('登录失败:', error.response?.data || error.message);
    return null;
  }
};

// 测试转账功能
const testTransfer = async () => {
  console.log('开始测试转账功能...');
  
  // 登录用户1
  const token1 = await loginUser('user1');
  if (!token1) {
    console.error('用户1登录失败');
    return;
  }
  
  // 登录用户2
  const token2 = await loginUser('user2');
  if (!token2) {
    console.error('用户2登录失败');
    return;
  }
  
  console.log('用户登录成功');
  
  // 创建游戏房间
  const createGameResponse = await axios.post(`${BASE_URL}/api/games/create`, {}, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  
  const gameId = createGameResponse.data.gameId;
  console.log('创建游戏房间:', gameId);
  
  // 用户2加入房间
  await axios.post(`${BASE_URL}/api/games/join`, {
    gameName: createGameResponse.data.gameName,
    position: 2
  }, {
    headers: { Authorization: `Bearer ${token2}` }
  });
  
  console.log('用户2加入房间成功');
  
  // 执行转账
  const transferResponse = await axios.post(`${BASE_URL}/api/games/transfer`, {
    gameId: gameId,
    from: 'user1',
    to: 'user2',
    points: 100,
    description: '测试转账'
  }, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  
  console.log('转账成功:', transferResponse.data);
  
  // 获取房间详情
  const roomDetailResponse = await axios.post(`${BASE_URL}/api/get-room-detail`, {
    gameId: gameId
  }, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  
  console.log('房间详情:', roomDetailResponse.data);
};

// 运行测试
testTransfer().catch(console.error); 
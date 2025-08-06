const request = require('supertest');

// 直接通过HTTP调用app，不依赖内部对象
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

describe('API 业务流程集成测试', () => {
  let userToken1;
  let userToken2;
  let gameId;
  let gameName;
  let userId1;
  let userId2;

  beforeAll(async () => {
    // 添加延迟避免速率限制
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // 登录第一个用户
    try {
      const loginResponse1 = await request(BASE_URL)
        .post('/api/wechat-login')
        .send({
          code: 'test_code_user1'
        });
      
      if (loginResponse1.status === 200) {
        userToken1 = loginResponse1.body.token;
        userId1 = loginResponse1.body.user.id;
        console.log('✅ 成功获取用户1登录token');
      } else {
        console.log('⚠️ 用户1登录失败，将使用测试token');
        const jwt = require('jsonwebtoken');
        userToken1 = jwt.sign(
          { aud: "postgraphile", role: "player", userId: 'test_user_1', openid: 'test_openid_1' },
          'test-secret',
          { expiresIn: '7d' }
        );
        userId1 = 'test_user_1';
      }
    } catch (error) {
      console.log('⚠️ 用户1登录请求失败，使用测试token:', error.message);
      const jwt = require('jsonwebtoken');
      userToken1 = jwt.sign(
        { aud: "postgraphile", role: "player", userId: 'test_user_1', openid: 'test_openid_1' },
        'test-secret',
        { expiresIn: '7d' }
      );
      userId1 = 'test_user_1';
    }

    // 添加延迟避免速率限制
    await delay(100);

    // 登录第二个用户
    try {
      const loginResponse2 = await request(BASE_URL)
        .post('/api/wechat-login')
        .send({
          code: 'test_code_user2'
        });
      
      if (loginResponse2.status === 200) {
        userToken2 = loginResponse2.body.token;
        userId2 = loginResponse2.body.user.id;
        console.log('✅ 成功获取用户2登录token');
      } else {
        console.log('⚠️ 用户2登录失败，将使用测试token');
        const jwt = require('jsonwebtoken');
        userToken2 = jwt.sign(
          { aud: "postgraphile", role: "player", userId: 'test_user_2', openid: 'test_openid_2' },
          'test-secret',
          { expiresIn: '7d' }
        );
        userId2 = 'test_user_2';
      }
    } catch (error) {
      console.log('⚠️ 用户2登录请求失败，使用测试token:', error.message);
      const jwt = require('jsonwebtoken');
      userToken2 = jwt.sign(
        { aud: "postgraphile", role: "player", userId: 'test_user_2', openid: 'test_openid_2' },
        'test-secret',
        { expiresIn: '7d' }
      );
      userId2 = 'test_user_2';
    }
  });

  describe('创建房间流程', () => {
    it('创建房间流程', async () => {
      console.log('🎮 开始创建房间流程...');
      

      // 步骤3: 创建房间
      console.log('🏠 步骤1: 创建房间');
      const createResponse = await request(BASE_URL)
        .post('/api/games/create')
        .set('Authorization', `Bearer ${userToken1}`);
      
      expect(createResponse.status).toBe(200);
      expect(createResponse.body).toHaveProperty('gameId');
      expect(createResponse.body).toHaveProperty('gameName');
      gameId = createResponse.body.gameId;
      gameName = createResponse.body.gameName;
      console.log('✅ 房间创建成功, gameId: ', gameId, 'gameName: ', gameName);
    });
  });
}); 
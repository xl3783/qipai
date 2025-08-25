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

  describe('临时流程', () => {
    it('临时流程', async () => {
      const transferResponse1 = await request(BASE_URL)
        .post('/api/games/transfer')
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          gameId: gameId,
          to: "0c1qQb1w3dKtp537bG1w3zGrmw1qQb1Z",
          points: 32,
          description: '用户1向用户2转账'
        });
      
      expect(transferResponse1.status).toBe(200);
      expect(transferResponse1.body).toHaveProperty('success');
      expect(transferResponse1.body.success).toBe(true);
      console.log('✅ 用户1向用户2转账成功');
    });
  });
}); 
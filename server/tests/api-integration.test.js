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

  describe('完整业务流程测试', () => {
    it('应该严格按照业务流程.md执行完整操作流程', async () => {
      console.log('🎮 开始严格按照业务流程执行测试...');
      
      // 步骤1: 用户1登录
      console.log('👤 步骤1: 用户1登录');
      const loginResponse1 = await request(BASE_URL)
        .post('/api/wechat-login')
        .send({
          code: 'test_code_user1'
        });
      
      expect(loginResponse1.status).toBe(200);
      expect(loginResponse1.body).toHaveProperty('token');
      expect(loginResponse1.body).toHaveProperty('user');
      userToken1 = loginResponse1.body.token;
      userId1 = loginResponse1.body.user.id;
      console.log('✅ 用户1登录成功');

      // 步骤2: 查询用户1的信息
      console.log('👤 步骤2: 查询用户1的信息');
      const profileResponse1 = await request(BASE_URL)
        .get('/api/players/profile')
        .set('Authorization', `Bearer ${userToken1}`);
      
      expect(profileResponse1.status).toBe(200);
      expect(profileResponse1.body).toHaveProperty('playerId');
      console.log('✅ 用户1信息查询成功');

      // 步骤3: 创建房间
      console.log('🏠 步骤3: 创建房间');
      const createResponse = await request(BASE_URL)
        .post('/api/games/create')
        .set('Authorization', `Bearer ${userToken1}`);
      
      expect(createResponse.status).toBe(200);
      expect(createResponse.body).toHaveProperty('gameId');
      expect(createResponse.body).toHaveProperty('gameName');
      gameId = createResponse.body.gameId;
      gameName = createResponse.body.gameName;
      console.log('✅ 房间创建成功');

      // 步骤4: 查询房间信息
      console.log('📋 步骤4: 查询房间信息');
      const roomDetailResponse = await request(BASE_URL)
        .post('/api/get-room-detail')
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          gameId: gameId
        });
      
      expect(roomDetailResponse.status).toBe(200);
      expect(roomDetailResponse.body).toBeDefined();
      console.log('✅ 房间信息查询成功');

      // 步骤5: 用户2登录
      console.log('👤 步骤5: 用户2登录');
      const loginResponse2 = await request(BASE_URL)
        .post('/api/wechat-login')
        .send({
          code: 'test_code_user2'
        });
      
      expect(loginResponse2.status).toBe(200);
      expect(loginResponse2.body).toHaveProperty('token');
      expect(loginResponse2.body).toHaveProperty('user');
      userToken2 = loginResponse2.body.token;
      userId2 = loginResponse2.body.user.id;
      console.log('✅ 用户2登录成功');

      // 步骤6: 加入用户1创建的房间
      console.log('🎯 步骤6: 用户2加入用户1创建的房间');
      const joinResponse = await request(BASE_URL)
        .post('/api/games/join')
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          gameName: gameName,
          position: 2
        });
      
      expect(joinResponse.status).toBe(200);
      expect(joinResponse.body).toHaveProperty('success');
      expect(joinResponse.body.success).toBe(true);
      console.log('✅ 用户2成功加入房间');

      // 步骤7: 查询房间信息
      console.log('📋 步骤7: 查询房间信息');
      const roomDetailResponse2 = await request(BASE_URL)
        .post('/api/get-room-detail')
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          gameId: gameId
        });
      
      expect(roomDetailResponse2.status).toBe(200);
      expect(roomDetailResponse2.body).toBeDefined();
      console.log('✅ 房间信息再次查询成功');

      // 步骤8: 用户1向用户2转账
      console.log('💰 步骤8: 用户1向用户2转账');
      const transferResponse1 = await request(BASE_URL)
        .post('/api/games/transfer')
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          gameId: gameId,
          to: userId2,
          points: 100,
          description: '用户1向用户2转账'
        });
      
      expect(transferResponse1.status).toBe(200);
      expect(transferResponse1.body).toHaveProperty('success');
      expect(transferResponse1.body.success).toBe(true);
      console.log('✅ 用户1向用户2转账成功');

      // 步骤9: 用户2向用户1转账
      console.log('💰 步骤9: 用户2向用户1转账');
      const transferResponse2 = await request(BASE_URL)
        .post('/api/games/transfer')
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          gameId: gameId,
          to: userId1,
          points: 50,
          description: '用户2向用户1转账'
        });
      
      expect(transferResponse2.status).toBe(200);
      expect(transferResponse2.body).toHaveProperty('success');
      expect(transferResponse2.body.success).toBe(true);
      console.log('✅ 用户2向用户1转账成功');

      // 步骤10: 用户2离开房间
      console.log('🚪 步骤10: 用户2离开房间');
      const leaveResponse2 = await request(BASE_URL)
        .post('/api/games/leave')
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          gameId: gameId
        });
      
      expect(leaveResponse2.status).toBe(200);
      expect(leaveResponse2.body).toHaveProperty('success');
      expect(leaveResponse2.body.success).toBe(true);
      console.log('✅ 用户2成功离开房间');

      // 步骤11: 用户1离开房间
      console.log('🚪 步骤11: 用户1离开房间');
      const leaveResponse1 = await request(BASE_URL)
        .post('/api/games/leave')
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          gameId: gameId
        });
      
      expect(leaveResponse1.status).toBe(200);
      expect(leaveResponse1.body).toHaveProperty('success');
      expect(leaveResponse1.body.success).toBe(true);
      console.log('✅ 用户1成功离开房间');

      // 步骤12: 查询结算信息
      console.log('📊 步骤12: 查询结算信息');
      const settlementResponse = await request(BASE_URL)
        .post('/api/get-rankings')
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          gameId: gameId
        });
      
      expect(settlementResponse.status).toBe(200);
      expect(settlementResponse.body).toBeDefined();
      console.log('✅ 结算信息查询成功');

      // 步骤13: 查询用户2信息
      console.log('👤 步骤13: 查询用户2信息');
      const profileResponse2 = await request(BASE_URL)
        .get('/api/players/profile')
        .set('Authorization', `Bearer ${userToken2}`);
      
      expect(profileResponse2.status).toBe(200);
      expect(profileResponse2.body).toHaveProperty('playerId');
      console.log('✅ 用户2信息查询成功');

      // 步骤14: 查询用户1的房间列表
      console.log('📋 步骤14: 查询用户1的房间列表');
      const roomsResponse1 = await request(BASE_URL)
        .get('/api/get-rooms')
        .set('Authorization', `Bearer ${userToken1}`);
      
      expect(roomsResponse1.status).toBe(200);
      expect(Array.isArray(roomsResponse1.body)).toBe(true);
      console.log('✅ 用户1房间列表查询成功');

      // 步骤15: 查询用户2的房间列表
      console.log('📋 步骤15: 查询用户2的房间列表');
      const roomsResponse2 = await request(BASE_URL)
        .get('/api/get-rooms')
        .set('Authorization', `Bearer ${userToken2}`);
      
      expect(roomsResponse2.status).toBe(200);
      expect(Array.isArray(roomsResponse2.body)).toBe(true);
      console.log('✅ 用户2房间列表查询成功');

      console.log('🎉 完整业务流程测试成功完成！');
    });
  });
}); 
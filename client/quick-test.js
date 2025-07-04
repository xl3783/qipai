const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:3000';
const GRAPHQL_URL = 'http://localhost:5000/graphql';

let authToken = null;
let currentUserId = null;

// 简单的日志函数
const log = (message) => console.log(`[${new Date().toISOString()}] ${message}`);

// 快速测试登录
async function quickLogin() {
  try {
    log('测试登录...');
    const response = await axios.post(`${BASE_URL}/api/wechat-login`, {
      code: 'quick_test_' + Date.now()
    });
    
    authToken = response.data.token;
    currentUserId = response.data.user.id;
    log(`登录成功 - 用户ID: ${currentUserId}`);
    return true;
  } catch (error) {
    log(`登录失败: ${error.message}`);
    return false;
  }
}

// 快速测试健康检查
async function quickHealthCheck() {
  try {
    log('健康检查...');
    const response = await axios.get(`${BASE_URL}/health`);
    log(`服务器状态: ${response.data.status}`);
    return true;
  } catch (error) {
    log(`健康检查失败: ${error.message}`);
    return false;
  }
}

// 快速测试 GraphQL 查询
async function quickGraphQLTest() {
  try {
    log('测试 GraphQL 查询...');
    const response = await axios.post(GRAPHQL_URL, {
      query: `
        query {
          __schema {
            types {
              name
            }
          }
        }
      `
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      }
    });
    
    if (response.data.errors) {
      log(`GraphQL 错误: ${JSON.stringify(response.data.errors)}`);
      return false;
    }
    
    log('GraphQL 查询成功');
    return true;
  } catch (error) {
    log(`GraphQL 测试失败: ${error.message}`);
    return false;
  }
}

// 主函数
async function runQuickTest() {
  log('开始快速测试...');
  
  // 1. 健康检查
  const healthy = await quickHealthCheck();
  if (!healthy) {
    log('服务器不可用，停止测试');
    return;
  }
  
  // 2. 登录测试
  const loginSuccess = await quickLogin();
  if (!loginSuccess) {
    log('登录失败，停止测试');
    return;
  }
  
  // 3. GraphQL 测试
  await quickGraphQLTest();
  
  log('快速测试完成！');
}

// 运行测试
if (require.main === module) {
  runQuickTest().catch(console.error);
}

module.exports = {
  quickLogin,
  quickHealthCheck,
  quickGraphQLTest,
  runQuickTest
}; 
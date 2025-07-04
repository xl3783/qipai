# 棋牌游戏客户端测试工具

这个测试工具用于测试棋牌游戏的后端 API，包括 REST API 和 GraphQL 接口。

## 功能特性

- **登录测试**：使用 REST API 进行微信登录
- **房间管理**：使用 GraphQL 创建、加入房间
- **玩家管理**：邀请玩家、查询玩家信息
- **积分系统**：打分、积分转移、查询积分历史
- **排行榜**：查询玩家排行榜
- **交易记录**：查询房间交易记录

## 安装依赖

```bash
npm install
```

## 配置

1. 复制配置文件示例：
```bash
cp config.example.js config.js
```

2. 根据实际情况修改 `config.js` 中的配置：
   - 服务器地址
   - 测试玩家ID
   - 积分测试参数

## 使用方法

### 1. 确保服务器运行

首先确保后端服务器正在运行：

```bash
cd ../server
npm start
```

### 2. 运行所有测试

```bash
npm test
```

### 3. 运行快速测试

```bash
npm run quick
```

### 4. 运行使用示例

```bash
npm run example
```

### 5. 运行单个测试

```bash
# 健康检查
npm run health

# 登录测试
npm run test:login

# 创建房间测试
npm run test:room

# 运行所有测试
npm run test:all
```

### 6. 直接运行测试函数

```javascript
const { testLogin, testCreateRoom } = require('./test.js');

// 测试登录
testLogin().then(success => {
  if (success) {
    console.log('登录成功');
  }
});

// 测试创建房间
testCreateRoom().then(gameId => {
  if (gameId) {
    console.log('房间创建成功，ID:', gameId);
  }
});
```

## API 接口说明

### REST API（登录）

- `POST /api/wechat-login` - 微信登录接口

### GraphQL 接口

#### 房间管理
- `createGameRoom` - 创建游戏房间
- `joinGame` - 加入游戏房间
- `invitePlayerToGame` - 邀请玩家到房间

#### 积分系统
- `createScoreTransaction` - 创建积分交易
- `transferPoints` - 积分转移

#### 查询接口
- `gameById` - 查询游戏详情
- `playerById` - 查询玩家信息
- `allScores` - 查询排行榜

## 配置说明

在 `test.js` 文件中可以修改以下配置：

```javascript
const BASE_URL = 'http://localhost:3000';           // REST API 基础URL
const GRAPHQL_URL = 'http://localhost:3000/graphql'; // GraphQL 端点
```

## 测试数据

测试工具会自动生成测试数据：

- 微信登录码：`mock_wechat_code_${timestamp}`
- 测试玩家ID：默认为 2（可根据实际情况调整）

## 错误处理

测试工具包含完善的错误处理：

- 网络请求错误
- GraphQL 查询错误
- 服务器响应错误
- 认证失败

所有错误都会在控制台输出详细的错误信息。

## 注意事项

1. 确保后端服务器正在运行
2. 确保数据库连接正常
3. 确保 GraphQL 端点可访问
4. 测试前请确保数据库中有足够的测试数据

## 扩展测试

可以通过修改 `test.js` 文件来添加更多测试用例：

```javascript
// 添加新的测试函数
async function testCustomFunction() {
  // 自定义测试逻辑
}

// 在 runAllTests 中调用
async function runAllTests() {
  // ... 现有测试
  await testCustomFunction();
}
``` 
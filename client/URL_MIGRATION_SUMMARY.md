# URL配置迁移总结

## 概述

已成功将项目中的硬编码URL迁移到统一的配置系统，使用`apiConfig.baseURL`和`apiConfig.graphqlURL`来管理所有API端点。

## 修改的文件列表

### 1. 配置文件
- `src/config/api.ts` - 简化的API配置，只包含baseURL、graphqlURL和wsURL
- `src/config/env.ts` - 环境变量配置
- `src/config/index.ts` - 配置入口文件

### 2. 服务文件
- `src/services/RoomService.ts` - 游戏房间服务
- `src/services/restClient.js` - REST客户端
- `src/services/GraphQLService.ts` - GraphQL服务

### 3. 模型文件
- `src/models/IndexPageModel.ts` - 首页模型
- `src/models/GameHistoryModel.ts` - 游戏历史模型
- `src/models/RoomModel.ts` - 房间模型

### 4. 工具和钩子文件
- `src/hooks/restApis.js` - REST API钩子
- `src/hooks/useGraphQL.js` - GraphQL钩子
- `src/utils/simpleApi.js` - 简单API工具
- `src/utils/testGraphQL.js` - GraphQL测试工具
- `src/graphql/client2.ts` - GraphQL客户端

## 迁移详情

### 硬编码URL替换

#### API端点 (baseURL)
- `http://localhost:3000` → `apiConfig.baseURL`
- `http://47.113.229.69:3000` → `apiConfig.baseURL`

替换的端点包括：
- `/api/games/create`
- `/api/games/join`
- `/api/games/leave`
- `/api/games/transfer`
- `/api/games/list`
- `/api/wechat-login`
- `/api/players/profile`
- `/api/players/update`
- `/api/scores/transaction`
- `/api/scores/history/:playerId`
- `/api/leaderboard`

#### GraphQL端点 (graphqlURL)
- `http://localhost:15000/graphql` → `apiConfig.graphqlURL`
- `http://47.113.229.69:15000/graphql` → `apiConfig.graphqlURL`

#### WebSocket端点 (wsURL)
- `ws://localhost:4000/subscriptions` → `apiConfig.wsURL`
- `wss://47.113.229.69:4000/subscriptions` → `apiConfig.wsURL`

## 配置系统

### 开发环境
```typescript
{
  baseURL: 'http://localhost:3000',
  graphqlURL: 'http://localhost:15000/graphql',
  wsURL: 'ws://localhost:4000/subscriptions',
}
```

### 生产环境
```typescript
{
  baseURL: 'http://47.113.229.69:3000',
  graphqlURL: 'http://47.113.229.69:15000/graphql',
  wsURL: 'wss://47.113.229.69:4000/subscriptions',
}
```

### 测试环境
```typescript
{
  baseURL: 'https://api.example.com',
  graphqlURL: 'https://api.example.com/graphql',
  wsURL: 'wss://api.example.com/subscriptions',
}
```

## 使用方法

### 1. 导入配置
```typescript
import { apiConfig } from '../config/api';
```

### 2. 使用baseURL
```typescript
// 替换前
const response = await Taro.request({
  url: 'http://localhost:3000/api/games/create',
  // ...
});

// 替换后
const response = await Taro.request({
  url: `${apiConfig.baseURL}/api/games/create`,
  // ...
});
```

### 3. 使用graphqlURL
```typescript
// 替换前
const response = await Taro.request({
  url: 'http://localhost:15000/graphql',
  // ...
});

// 替换后
const response = await Taro.request({
  url: apiConfig.graphqlURL,
  // ...
});
```

## 环境切换

通过设置`NODE_ENV`环境变量来切换环境：

```bash
# 开发环境
NODE_ENV=development npm run dev

# 生产环境
NODE_ENV=production npm run build

# 测试环境
NODE_ENV=test npm run test
```

## 优势

1. **统一管理**: 所有URL配置集中在一个文件中
2. **环境隔离**: 不同环境使用不同的配置
3. **易于维护**: 修改URL只需要修改配置文件
4. **类型安全**: 使用TypeScript确保配置的类型安全
5. **减少错误**: 避免硬编码URL导致的错误

## 注意事项

1. 确保在修改配置后重新构建应用
2. 生产环境建议使用HTTPS/WSS协议
3. 敏感信息应该通过环境变量传入
4. 新增API端点时，只需要在代码中使用`apiConfig.baseURL`拼接路径

## 验证

可以通过以下方式验证迁移是否成功：

1. 检查所有文件中的硬编码URL是否已替换
2. 在不同环境下测试API调用是否正常
3. 确认GraphQL查询是否正常工作
4. 验证WebSocket连接是否正常

## 后续工作

1. 删除不再需要的迁移文件
2. 更新文档说明新的配置方式
3. 添加配置验证功能
4. 考虑添加配置热更新功能 
# 配置系统说明

## 概述

本项目采用统一的配置管理系统，将所有API端点、环境变量等配置集中管理，支持多环境配置。

## 文件结构

```
src/config/
├── index.ts              # 配置入口文件
├── api.ts               # API配置
├── env.ts               # 环境变量配置
├── usage-example.ts     # 使用示例
└── README.md           # 说明文档
```

## 配置内容

### API配置 (api.ts)

包含所有API端点的配置：

#### 游戏相关API
- `games.create` - 创建游戏
- `games.join` - 加入游戏
- `games.leave` - 离开游戏
- `games.transfer` - 积分转移
- `games.list` - 游戏列表
- `games.end` - 结束游戏
- `games.kick` - 踢出玩家

#### 认证相关API
- `auth.wechatLogin` - 微信登录

#### 玩家相关API
- `players.profile` - 获取玩家信息
- `players.update` - 更新玩家信息

#### 积分相关API
- `scores.transaction` - 积分交易
- `scores.history` - 积分历史

#### 其他API
- `leaderboard` - 排行榜

#### GraphQL配置
- `graphql.endpoint` - GraphQL端点
- `graphql.wsEndpoint` - WebSocket端点

### 环境配置 (env.ts)

包含环境变量配置：

- `NODE_ENV` - 环境标识
- `API_BASE_URL` - API基础URL
- `GRAPHQL_ENDPOINT` - GraphQL端点
- `WS_ENDPOINT` - WebSocket端点
- `CLIENT_URL` - 客户端URL

## 环境配置

### 开发环境 (development)
- API基础URL: `http://localhost:3000`
- GraphQL端点: `http://localhost:15000/graphql`
- WebSocket端点: `ws://localhost:4000/subscriptions`

### 生产环境 (production)
- API基础URL: `http://47.113.229.69:3000`
- GraphQL端点: `http://47.113.229.69:15000/graphql`
- WebSocket端点: `wss://47.113.229.69:4000/subscriptions`

### 测试环境 (test)
- API基础URL: `https://api.example.com`
- GraphQL端点: `https://api.example.com/graphql`
- WebSocket端点: `wss://api.example.com/subscriptions`

## 使用方法

### 1. 基本使用

```typescript
import { apiConfig, envConfig } from '@/config';

// 使用API配置
const gameCreateUrl = apiConfig.endpoints.games.create;
const graphqlUrl = apiConfig.graphql.endpoint;

// 使用环境配置
const isDev = envConfig.NODE_ENV === 'development';
const apiBaseUrl = envConfig.API_BASE_URL;
```

### 2. 在服务中使用

```typescript
import { apiConfig } from '@/config';

export class GameService {
  async createGame(gameData: any) {
    const response = await fetch(apiConfig.endpoints.games.create, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData),
    });
    return response.json();
  }
}
```

### 3. 在React组件中使用

```typescript
import { useApiConfig } from '@/config/usage-example';

const MyComponent = () => {
  const { api, env, isDev, isProd } = useApiConfig();
  
  return (
    <div>
      <p>当前环境: {env.NODE_ENV}</p>
      <p>API基础URL: {api.baseURL}</p>
    </div>
  );
};
```

### 4. 配置验证

```typescript
import { validateConfig } from '@/config/usage-example';

// 在应用启动时验证配置
if (!validateConfig()) {
  console.error('配置验证失败');
  // 处理错误
}
```

## 配置管理

### 添加新的API端点

1. 在 `api.ts` 中的 `ApiConfig` 接口添加新字段
2. 在各个环境配置中添加对应的URL
3. 更新使用示例

### 添加新的环境变量

1. 在 `env.ts` 中的 `EnvConfig` 接口添加新字段
2. 在各个环境配置中添加对应的值
3. 更新使用示例

### 切换环境

通过设置 `NODE_ENV` 环境变量来切换环境：

```bash
# 开发环境
NODE_ENV=development npm run dev

# 生产环境
NODE_ENV=production npm run build

# 测试环境
NODE_ENV=test npm run test
```

## 最佳实践

1. **统一配置**: 所有API端点都应该通过配置系统管理
2. **环境隔离**: 不同环境使用不同的配置
3. **类型安全**: 使用TypeScript确保配置的类型安全
4. **配置验证**: 在应用启动时验证配置的完整性
5. **文档更新**: 添加新的配置时要更新文档

## 注意事项

1. 生产环境的URL应该使用HTTPS
2. WebSocket端点在生产环境应该使用WSS
3. 敏感信息（如密钥）应该通过环境变量传入
4. 配置变更后需要重新构建应用

## 迁移指南

如果要从现有的硬编码URL迁移到配置系统：

1. 找到所有硬编码的URL
2. 将URL添加到配置系统中
3. 更新代码使用配置
4. 测试所有功能
5. 删除硬编码的URL

## 故障排除

### 常见问题

1. **配置未生效**: 检查 `NODE_ENV` 环境变量是否正确设置
2. **TypeScript错误**: 确保导入了正确的类型定义
3. **构建失败**: 检查配置文件的语法错误

### 调试技巧

```typescript
import { apiConfig, envConfig } from '@/config';

// 打印当前配置
console.log('API配置:', apiConfig);
console.log('环境配置:', envConfig);
``` 
# GraphQL API 使用指南

## 概述
本文档介绍游戏记账系统GraphQL API的使用方法，包括查询、变更和订阅操作的示例。

## 基础配置

### 客户端初始化
```javascript
import { graphqlClient, QUERIES, MUTATIONS } from '../src/graphql/client.js';
import { GameService } from '../src/services/gameService.js';
```

### 使用Hooks
```javascript
import { 
  useCurrentUser, 
  useUsers, 
  useRoom, 
  useTransactions,
  useCreateTransaction 
} from '../src/hooks/useGraphQL.js';
```

## 查询操作 (Queries)

### 1. 获取当前用户信息
```javascript
// 使用Hook
const { data, loading, error } = useCurrentUser();

// 使用Service
const currentUser = await GameService.getCurrentUser();

// 直接使用GraphQL
const result = await graphqlClient.query(QUERIES.GET_CURRENT_USER);
```

**响应格式:**
```json
{
  "data": {
    "currentUser": {
      "id": "1",
      "name": "肖磊",
      "avatar": null,
      "balance": 0,
      "isHost": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 2. 获取房间详情
```javascript
// 使用Hook
const { data, loading, error } = useRoom(roomId);

// 使用Service
const room = await GameService.getRoom('room-1');

// 手动查询
const result = await graphqlClient.query(QUERIES.GET_ROOM, { id: 'room-1' });
```

**响应格式:**
```json
{
  "data": {
    "room": {
      "id": "room-1",
      "name": "打牌记账 jyyj 房间",
      "hostId": "1",
      "status": "ACTIVE",
      "host": {
        "id": "1",
        "name": "肖磊"
      },
      "players": [
        {
          "id": "1",
          "name": "肖磊",
          "balance": 0,
          "isHost": true
        }
      ],
      "transactions": [],
      "totalAmount": 0
    }
  }
}
```

### 3. 获取交易记录
```javascript
// 获取房间交易记录
const { data } = useTransactions(roomId);

// 获取用户交易历史
const { data } = useUserTransactions(userId, 10, 0);

// 使用Service
const transactions = await GameService.getTransactions('room-1');
const userTransactions = await GameService.getUserTransactions('user-1', 10, 0);
```

### 4. 获取游戏统计
```javascript
// 获取用户统计
const { data } = useGameStats(userId);

// 获取排行榜
const { data } = useLeaderboard();

// 使用Service
const stats = await GameService.getGameStats('user-1');
const leaderboard = await GameService.getLeaderboard();
```

## 变更操作 (Mutations)

### 1. 创建用户
```javascript
// 使用Hook
const [createUser, { loading, error }] = useCreateUser();

const handleCreateUser = async () => {
  try {
    const result = await createUser({
      input: {
        name: "新用户",
        avatar: "avatar-url"
      }
    });
    console.log('用户创建成功:', result);
  } catch (error) {
    console.error('创建失败:', error);
  }
};

// 使用Service
const newUser = await GameService.createUser({
  name: "新用户",
  avatar: "avatar-url"
});
```

### 2. 创建交易
```javascript
// 转账示例
const [createTransaction] = useCreateTransaction();

const handleTransfer = async (fromId, toId, amount, description) => {
  try {
    await createTransaction({
      input: {
        fromPlayerId: fromId,
        toPlayerId: toId,
        amount: parseFloat(amount),
        description: description,
        type: 'TRANSFER',
        roomId: 'room-1'
      }
    });
  } catch (error) {
    console.error('转账失败:', error);
  }
};

// 使用Service简化版本
await GameService.transfer('user-1', 'user-2', 100, '游戏赔付', 'room-1');
```

### 3. 房间结算
```javascript
// 使用Hook
const [settleRoom] = useSettleRoom();

const handleSettle = async () => {
  const results = await settleRoom({ roomId: 'room-1' });
  console.log('结算结果:', results);
};

// 使用Service
const settlementResults = await GameService.settleRoom('room-1');
```

### 4. 更新游戏统计
```javascript
const [updateGameStats] = useUpdateGameStats();

await updateGameStats({
  userId: 'user-1',
  input: {
    wins: 5,
    losses: 2,
    totalPoints: 1000
  }
});
```

## 高级用法

### 1. 组合多个操作
```javascript
// React组件中的综合示例
export default function GameRoom({ roomId }) {
  const { data: roomData, refetch: refetchRoom } = useRoom(roomId);
  const { data: transactionsData, refetch: refetchTransactions } = useTransactions(roomId);
  const [createTransaction] = useCreateTransaction();

  const handleTransfer = async (fromId, toId, amount, description) => {
    try {
      // 创建交易
      await createTransaction({
        input: {
          fromPlayerId: fromId,
          toPlayerId: toId,
          amount: parseFloat(amount),
          description,
          type: 'TRANSFER',
          roomId
        }
      });

      // 刷新相关数据
      await Promise.all([
        refetchRoom(),
        refetchTransactions()
      ]);

    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  // 组件渲染逻辑...
}
```

### 2. 错误处理
```javascript
const { data, loading, error, refetch } = useRoom(roomId);

if (loading) return <div>加载中...</div>;
if (error) return <div>错误: {error.message}</div>;
if (!data?.room) return <div>房间不存在</div>;

return <RoomComponent room={data.room} />;
```

### 3. 条件查询
```javascript
// 只有当用户ID存在时才查询
const { data: userStats } = useGameStats(currentUser?.id);

// 跳过查询的示例
const { data, loading } = useQuery(
  QUERIES.GET_USER_TRANSACTIONS, 
  { userId, limit: 10 }, 
  { skip: !userId } // 当userId为空时跳过查询
);
```

## 业务场景示例

### 1. 完整的转账流程
```javascript
const TransferComponent = ({ roomId, currentUser, players }) => {
  const [createTransaction] = useCreateTransaction();
  const { refetch: refetchRoom } = useRoom(roomId);

  const handleTransfer = async (formData) => {
    try {
      // 1. 验证余额
      if (currentUser.balance < formData.amount) {
        throw new Error('余额不足');
      }

      // 2. 创建交易
      await createTransaction({
        input: {
          fromPlayerId: currentUser.id,
          toPlayerId: formData.toPlayerId,
          amount: formData.amount,
          description: formData.description,
          type: 'TRANSFER',
          roomId
        }
      });

      // 3. 刷新房间数据
      await refetchRoom();

      // 4. 显示成功提示
      showSuccess('转账成功');

    } catch (error) {
      showError(`转账失败: ${error.message}`);
    }
  };

  return (
    // 转账表单组件...
  );
};
```

### 2. 房间结算流程
```javascript
const SettlementComponent = ({ roomId }) => {
  const [settlementStrategy, setSettlementStrategy] = useState([]);
  const [settleRoom] = useSettleRoom();

  // 生成结算策略
  const generateStrategy = async () => {
    const strategy = await GameService.calculateSettlementStrategy(roomId);
    setSettlementStrategy(strategy);
  };

  // 执行结算
  const executeSettlement = async () => {
    try {
      const results = await settleRoom({ roomId });
      // 处理结算结果
      console.log('结算完成:', results);
    } catch (error) {
      console.error('结算失败:', error);
    }
  };

  return (
    <div>
      <button onClick={generateStrategy}>生成结算策略</button>
      <button onClick={executeSettlement}>执行结算</button>
      {/* 显示结算策略 */}
    </div>
  );
};
```

## 最佳实践

### 1. 数据缓存
- 使用React Query或类似库进行数据缓存
- 合理设置缓存时间和刷新策略
- 实现乐观更新提升用户体验

### 2. 错误处理
- 统一错误处理机制
- 友好的错误提示
- 网络错误重试机制

### 3. 性能优化
- 避免不必要的查询
- 使用分页查询大量数据
- 实现数据懒加载

### 4. 类型安全
- 使用TypeScript定义GraphQL类型
- 代码生成工具自动生成类型定义
- 运行时类型检查 
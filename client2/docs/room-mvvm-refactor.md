# Room 页面 MVVM 重构说明

## 重构概述

将 `src/pages/room/room.jsx` 从传统的组件模式重构为 MVVM 架构模式，实现了关注点分离，提高了代码的可维护性和可测试性。

## 重构前后对比

### 重构前的问题

1. **业务逻辑与 UI 混合**: 在 View 层中直接处理数据获取、状态管理和业务逻辑
2. **GraphQL 查询内联**: 在组件中直接定义 GraphQL 查询
3. **状态管理分散**: 多个 useState 分散在组件中
4. **错误处理不统一**: 缺乏统一的错误处理机制
5. **可测试性差**: 业务逻辑与 UI 耦合，难以进行单元测试

### 重构后的优势

1. **关注点分离**: Model、View、ViewModel 各司其职
2. **业务逻辑集中**: 所有业务逻辑集中在 ViewModel 中
3. **数据获取统一**: 通过 Model 层统一管理数据获取
4. **状态管理清晰**: 通过 Hook 统一管理状态
5. **错误处理完善**: 统一的错误处理和重试机制
6. **可测试性提升**: 业务逻辑独立，易于单元测试

## 文件结构

### 新增文件

1. **类型定义** (`src/types/index.ts`)
   - `GameParticipant`: 游戏参与者类型
   - `TransferRecord`: 转账记录类型
   - `Transaction`: 交易类型
   - `PlayerProfile`: 玩家资料类型
   - `RoomState`: 房间状态类型
   - `CreateTransactionInput`: 创建交易输入类型

2. **Model 层** (`src/models/RoomModel.ts`)
   - `getGameParticipants()`: 获取游戏参与者
   - `getPlayerTransactions()`: 获取玩家交易记录
   - `createTransaction()`: 创建交易记录
   - `getCurrentUser()`: 获取当前用户信息
   - `transformTransactions()`: 转换交易记录格式

3. **ViewModel 层** (`src/viewmodels/RoomViewModel.ts`)
   - `initialize()`: 初始化页面
   - `handleChoosePlayer()`: 处理选择玩家
   - `handleTransfer()`: 处理转账
   - `handleSwitchToSettlement()`: 切换到结算视图
   - `handleExitRoom()`: 退出房间
   - `refreshData()`: 刷新数据

4. **Hook 层** (`src/hooks/useRoomViewModel.ts`)
   - 管理 ViewModel 生命周期
   - 提供响应式状态管理
   - 连接 View 和 ViewModel

### 重构文件

**View 层** (`src/pages/room/room.jsx`)
- 移除所有业务逻辑
- 移除 GraphQL 查询
- 移除状态管理代码
- 只保留 UI 渲染和事件绑定
- 通过 Hook 获取数据和事件处理函数

## 架构层次

### Model 层 (`src/models/RoomModel.ts`)
```typescript
export class RoomModel {
  async getGameParticipants(): Promise<GameParticipant[]>
  async getPlayerTransactions(): Promise<TransferRecord[]>
  async createTransaction(input: CreateTransactionInput): Promise<any>
  getCurrentUser(): { playerId: string; username: string; avatarUrl?: string }
  transformTransactions(transferRecords: TransferRecord[]): Transaction[]
}
```

### ViewModel 层 (`src/viewmodels/RoomViewModel.ts`)
```typescript
export class RoomViewModel {
  async initialize(): Promise<void>
  handleChoosePlayer(player: GameParticipant): void
  async handleTransfer(fromId: string, toId: string, amount: number, description: string): Promise<void>
  handleSwitchToSettlement(): void
  handleExitRoom(): void
  async refreshData(): Promise<void>
}
```

### Hook 层 (`src/hooks/useRoomViewModel.ts`)
```typescript
export const useRoomViewModel = (roomId: string) => {
  // 返回状态和事件处理函数
  return {
    currentView, showProfileModal, transactions, roomPlayers, loading, error,
    handleChoosePlayer, handleTransfer, handleSwitchToSettlement, handleExitRoom
  };
};
```

### View 层 (`src/pages/room/room.jsx`)
```typescript
export default function Room() {
  const {
    currentView, showProfileModal, transactions, roomPlayers, loading, error,
    handleChoosePlayer, handleTransfer, handleSwitchToSettlement, handleExitRoom
  } = useRoomViewModel(roomId);

  // 只负责 UI 渲染
  return (
    <View>
      {/* UI 组件 */}
    </View>
  );
}
```

## 数据流

1. **初始化**: View → Hook → ViewModel → Model → API
2. **用户交互**: View → Hook → ViewModel → Model → API
3. **状态更新**: Model → ViewModel → Hook → View

## 错误处理

- **统一错误处理**: 在 ViewModel 中统一处理所有错误
- **错误状态管理**: 通过 `error` 状态显示错误信息
- **重试机制**: 提供 `clearError` 方法清除错误并重试

## 测试策略

### 单元测试
- **Model 层**: 测试数据获取和转换逻辑
- **ViewModel 层**: 测试业务逻辑和状态管理
- **Hook 层**: 测试状态管理和生命周期

### 集成测试
- **端到端测试**: 测试完整的用户交互流程

## 后续优化建议

1. **添加缓存机制**: 在 Model 层添加数据缓存
2. **优化错误处理**: 添加更详细的错误分类和处理
3. **添加加载状态**: 为不同操作添加独立的加载状态
4. **添加数据验证**: 在 Model 层添加数据验证逻辑
5. **添加单元测试**: 为 Model 和 ViewModel 添加单元测试

## 总结

通过这次重构，Room 页面成功实现了 MVVM 架构模式，实现了：

- ✅ 关注点分离
- ✅ 业务逻辑集中管理
- ✅ 统一的数据获取和错误处理
- ✅ 清晰的状态管理
- ✅ 提升的可测试性
- ✅ 更好的代码可维护性

这种架构模式为后续的功能扩展和维护提供了良好的基础。 
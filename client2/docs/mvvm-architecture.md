# MVVM 架构说明

本项目采用 MVVM (Model-View-ViewModel) 架构模式，使用 TypeScript 进行开发。

## 架构层次

### 1. Model 层 (`src/models/`)
- 负责数据获取和存储
- 处理 API 调用和本地存储
- 不包含业务逻辑

**示例文件**: `IndexPageModel.ts`
```typescript
export class IndexPageModel {
  async wechatLogin(): Promise<LoginResponse> { ... }
  async getUserProfile(): Promise<UserInfo> { ... }
  async getWechatUserInfo(): Promise<WechatUserInfo> { ... }
}
```

### 2. ViewModel 层 (`src/viewmodels/`)
- 处理业务逻辑
- 管理页面状态
- 协调 Model 和 View 之间的交互

**示例文件**: `IndexPageViewModel.ts`
```typescript
export class IndexPageViewModel {
  async doLogin(): Promise<void> { ... }
  handleCreateRoom(): void { ... }
  handleJoinRoom(): void { ... }
}
```

### 3. View 层 (`src/pages/`)
- 负责 UI 渲染
- 通过 Hook 获取 ViewModel 提供的数据和方法
- 不包含业务逻辑

**示例文件**: `index.tsx`
```typescript
export default function Index() {
  const {
    userInfo,
    gameStats,
    handleCreateRoom,
    handleJoinRoom,
  } = useIndexPageViewModel();
  
  return (
    // UI 渲染
  );
}
```

### 4. Hook 层 (`src/hooks/`)
- 管理 ViewModel 的生命周期
- 提供响应式的状态管理
- 连接 View 和 ViewModel

**示例文件**: `useIndexPageViewModel.ts`
```typescript
export const useIndexPageViewModel = () => {
  const [state, setState] = useState<IndexPageState>({...});
  const [viewModel] = useState(() => new IndexPageViewModel(...));
  
  return {
    userInfo: state.userInfo,
    handleCreateRoom: () => viewModel.handleCreateRoom(),
    // ...
  };
};
```

## 类型定义 (`src/types/`)

所有接口和类型定义都集中在 `src/types/index.ts` 中：

```typescript
export interface UserInfo {
  username: string;
  avatarUrl?: string;
  playerId: string;
}

export interface GameStats {
  totalPoints: number;
  wins: number;
  losses: number;
  winRate: number;
  friendRanking: number;
}
```

## 使用方式

### 创建新页面

1. **定义类型** (`src/types/index.ts`)
```typescript
export interface NewPageState {
  // 页面状态类型
}
```

2. **创建 Model** (`src/models/NewPageModel.ts`)
```typescript
export class NewPageModel {
  // 数据获取方法
}
```

3. **创建 ViewModel** (`src/viewmodels/NewPageViewModel.ts`)
```typescript
export class NewPageViewModel {
  // 业务逻辑方法
}
```

4. **创建 Hook** (`src/hooks/useNewPageViewModel.ts`)
```typescript
export const useNewPageViewModel = () => {
  // 状态管理和生命周期
};
```

5. **创建 View** (`src/pages/newpage/index.tsx`)
```typescript
export default function NewPage() {
  const { data, handlers } = useNewPageViewModel();
  return (
    // UI 渲染
  );
}
```

## 优势

1. **关注点分离**: Model、View、ViewModel 各司其职
2. **可测试性**: 业务逻辑集中在 ViewModel 中，易于单元测试
3. **可维护性**: 代码结构清晰，易于理解和维护
4. **类型安全**: 使用 TypeScript 提供完整的类型检查
5. **可复用性**: Model 和 ViewModel 可以在不同页面间复用

## 注意事项

1. View 层只负责渲染，不包含业务逻辑
2. Model 层只负责数据，不包含业务逻辑
3. 所有业务逻辑都在 ViewModel 层处理
4. 使用 Hook 来管理 ViewModel 的生命周期
5. 状态更新通过 ViewModel 进行，保持单向数据流 
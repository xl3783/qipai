# 战绩页面功能说明

## 概述

战绩页面展示用户的历史房间列表，提供房间状态管理和导航功能。页面采用MVVM架构模式，实现了关注点分离，提高了代码的可维护性。

## 功能特性

### 1. 战绩统计
- **总房间数**: 显示用户参与的所有房间数量
- **进行中**: 显示当前正在进行的房间数量
- **已结束**: 显示已经结束的房间数量
- **总金额**: 显示所有房间的总金额

### 2. 房间列表
- **房间信息**: 显示房间名称、房主、参与人数、创建时间、总金额
- **状态标识**: 通过不同颜色的标签显示房间状态
  - 🟢 进行中 (ACTIVE)
  - 🟡 已结束 (SETTLED)
  - ⚫ 已关闭 (CLOSED)
- **时间显示**: 智能显示时间（今天、昨天、X天前、具体日期）

### 3. 导航功能
- **进行中房间**: 点击进入房间页面，可以继续游戏
- **已结束房间**: 点击进入结算页面，查看详细结算信息
- **已关闭房间**: 点击显示提示信息

### 4. 交互功能
- **下拉刷新**: 支持下拉刷新获取最新数据
- **加载状态**: 显示加载动画和错误处理
- **空状态**: 当没有战绩记录时显示友好的空状态页面

## 页面结构

### 文件组织
```
src/pages/game-history/
├── game-history.config.js    # 页面配置
├── game-history.scss         # 样式文件
├── game-history.tsx          # 主组件
└── ...

src/models/
└── GameHistoryModel.ts       # 数据模型

src/viewmodels/
└── GameHistoryViewModel.ts   # 视图模型

src/hooks/
└── useGameHistoryViewModel.ts # React Hook
```

### 架构模式

#### Model层 (GameHistoryModel.ts)
- 负责数据获取和API调用
- 提供模拟数据用于开发阶段
- 处理数据格式转换

#### ViewModel层 (GameHistoryViewModel.ts)
- 处理业务逻辑
- 管理页面状态
- 提供事件处理方法
- 格式化显示数据

#### View层 (game-history.tsx)
- 纯UI展示
- 通过Hook连接ViewModel
- 处理用户交互

## API接口

### 获取用户房间列表
```graphql
query GetUserRooms {
  userRooms {
    id
    name
    status
    hostId
    host {
      id
      name
    }
    players {
      id
    }
    totalAmount
    createdAt
    updatedAt
  }
}
```

### 数据结构
```typescript
interface GameHistoryRoom {
  id: string;
  name: string;
  status: 'ACTIVE' | 'SETTLED' | 'CLOSED';
  hostId: string;
  hostName: string;
  playerCount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
```

## 样式设计

### 颜色方案
- **主色调**: 橙色 (#f97316) - 与整体应用保持一致
- **状态颜色**:
  - 进行中: 绿色 (#10b981)
  - 已结束: 橙色 (#f59e0b)
  - 已关闭: 灰色 (#6b7280)

### 布局特点
- **响应式设计**: 适配不同屏幕尺寸
- **卡片式布局**: 房间信息以卡片形式展示
- **网格统计**: 统计数据采用2x2网格布局
- **平滑动画**: 点击和悬停效果

## 使用方式

### 从首页进入
在首页的"战绩"按钮点击后，会导航到战绩页面：
```typescript
Taro.navigateTo({ 
  url: '/pages/game-history/game-history' 
});
```

### 页面导航逻辑
```typescript
handleRoomClick(room: GameHistoryRoom): void {
  if (room.status === 'ACTIVE') {
    // 进入房间页面
    Taro.navigateTo({
      url: `/pages/room/room?roomId=${room.id}&roomName=${encodeURIComponent(room.name)}`
    });
  } else if (room.status === 'SETTLED') {
    // 进入结算页面
    Taro.navigateTo({
      url: `/pages/settlement-demo/settlement-demo?roomId=${room.id}&roomName=${encodeURIComponent(room.name)}`
    });
  } else {
    // 显示提示
    Taro.showToast({
      title: '房间已关闭',
      icon: 'none'
    });
  }
}
```

## 开发说明

### 开发阶段
- 使用模拟数据，便于开发和测试
- 支持热重载，修改代码后自动刷新
- 提供完整的错误处理和加载状态

### 生产环境
- 连接真实的GraphQL API
- 实现数据缓存和离线支持
- 添加性能监控和错误上报

## 后续优化

1. **搜索功能**: 支持按房间名称、房主等条件搜索
2. **筛选功能**: 按状态、时间范围筛选房间
3. **分页加载**: 支持大量数据的分页显示
4. **数据导出**: 支持战绩数据的导出功能
5. **分享功能**: 支持分享战绩到社交媒体 
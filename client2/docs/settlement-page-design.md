# Settlement页面设计文档

## 概述

Settlement页面是一个独立的结算页面，从原来的room页面中分离出来，专门处理房间结算相关的功能。

## 页面结构

### 文件结构
```
src/pages/settlement/
├── settlement.config.js    # 页面配置
├── settlement.scss         # 页面样式
└── settlement.tsx          # 页面主组件
```

### 功能模块

#### 1. 主结算页面
- 显示房间总积分
- 生成结算策略
- 执行房间结算
- 查看结算结果
- 导航到其他页面（历史记录、使用手册等）

#### 2. 结算结果页面
- 显示积分排行榜
- 玩家详情查看
- 分享结算结果
- 返回房间

## 主要功能

### 1. 结算策略生成
- 调用`GameService.calculateSettlementStrategy()`生成最优结算方案
- 显示推荐转账路径和金额

### 2. 房间结算执行
- 调用GraphQL的`settleRoom`mutation
- 更新房间状态
- 显示结算结果

### 3. 积分排行榜
- 按积分排序显示玩家
- 显示前三名奖牌
- 点击查看玩家详情

### 4. 分享功能
- 生成结算结果分享图片
- 调用`ShareService.showShareOptions()`

## 页面导航

### 进入方式
从room页面点击"结算"按钮导航：
```javascript
Taro.navigateTo({
  url: `/pages/settlement/settlement?roomId=${roomId}&roomName=${roomName}`
})
```

### 参数传递
- `roomId`: 房间ID
- `roomName`: 房间名称

## 状态管理

### 主要状态
- `settlementStrategy`: 结算策略数组
- `settlementResults`: 结算结果
- `loading`: 加载状态
- `showSettlementPage`: 是否显示结算结果页面
- `roomPlayers`: 房间玩家列表
- `totalScore`: 总积分

## 样式设计

### 主题色彩
- 主色调：橙色 (#f97316)
- 背景色：浅灰色 (#f9fafb)
- 卡片背景：白色

### 响应式设计
- 移动端优先设计
- 适配不同屏幕尺寸
- 触摸友好的按钮尺寸

## 技术实现

### 依赖组件
- `PlayerAvatar`: 玩家头像组件
- `GameService`: 游戏服务
- `ShareService`: 分享服务
- `useSettleRoom`: GraphQL hook

### 类型定义
```typescript
interface Player {
  participationId: string
  playerId: string
  finalScore: number
  playerByPlayerId: {
    username: string
    avatarUrl: string | null
  }
}

interface SettlementStrategy {
  from: string
  to: string
  amount: number
  fromId: string
  toId: string
}
```

## 未来优化

1. **数据获取优化**
   - 实现真实的API数据获取
   - 添加数据缓存机制

2. **用户体验优化**
   - 添加加载动画
   - 优化错误处理
   - 添加操作确认弹窗

3. **功能扩展**
   - 支持多种结算模式
   - 添加结算历史记录
   - 支持自定义结算规则 
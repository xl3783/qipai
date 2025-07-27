# Database Types

这个目录包含了基于DDL schema生成的TypeScript类型定义。

## 文件结构

- `database.ts` - 核心数据库类型定义
- `database-utils.ts` - 数据库操作工具类型
- `index.ts` - 类型导出入口

## 核心类型

### 枚举类型

```typescript
// 游戏状态
type GameStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';

// 参与者状态
type ParticipantStatus = 'active' | 'inactive' | 'left' | 'disconnected' | 'kicked';

// 转移状态
type TransferStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
```

### 表结构类型

```typescript
// 玩家信息
interface Player {
  player_id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  phone?: string;
}

// 游戏对局
interface Game {
  game_id: string;
  game_type: string;
  status: GameStatus;
  start_time: Date;
  end_time?: Date;
  max_players: number;
  min_players: number;
  created_at: Date;
  updated_at: Date;
}

// 游戏参与者
interface GameParticipant {
  participation_id: string;
  game_id: string;
  player_id: string;
  initial_score: number;
  final_score?: number;
  position?: number;
  status: ParticipantStatus;
  joined_at: Date;
  left_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// 转移记录
interface TransferRecord {
  transfer_id: string;
  from_player_id: string;
  to_player_id: string;
  points: number;
  game_id?: string;
  description?: string;
  transfer_time: Date;
  from_transaction_id?: string;
  to_transaction_id?: string;
  status: TransferStatus;
  created_at: Date;
}

// 积分表
interface Score {
  player_id: string;
  current_total: number;
  games_played: number;
  games_won: number;
  last_updated: Date;
  games_lost: number;
}
```

### 扩展类型

```typescript
// 带参与者的游戏
interface GameWithParticipants extends Game {
  participants?: GameParticipant[];
}

// 带积分的玩家
interface PlayerWithScore extends Player {
  score?: Score;
}

// 带玩家信息的参与者
interface GameParticipantWithPlayer extends GameParticipant {
  player?: Player;
}

// 带玩家信息的转移记录
interface TransferRecordWithPlayers extends TransferRecord {
  from_player?: Player;
  to_player?: Player;
  game?: Game;
}
```

## 输入类型

用于创建和更新操作的类型：

```typescript
// 创建玩家
interface CreatePlayerInput {
  player_id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
}

// 更新玩家
interface UpdatePlayerInput {
  username?: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
}

// 创建游戏
interface CreateGameInput {
  game_type: string;
  max_players?: number;
  min_players?: number;
}

// 创建转移记录
interface CreateTransferRecordInput {
  from_player_id: string;
  to_player_id: string;
  points: number;
  game_id?: string;
  description?: string;
  from_transaction_id?: string;
  to_transaction_id?: string;
}
```

## 查询和过滤类型

```typescript
// 游戏过滤
interface GameFilter {
  status?: GameStatus;
  game_type?: string;
  start_time_from?: Date;
  start_time_to?: Date;
  min_players?: number;
  max_players?: number;
}

// 玩家过滤
interface PlayerFilter {
  username?: string;
  email?: string;
  phone?: string;
}

// 转移记录过滤
interface TransferFilter {
  from_player_id?: string;
  to_player_id?: string;
  game_id?: string;
  status?: TransferStatus;
  transfer_time_from?: Date;
  transfer_time_to?: Date;
}

// 排序选项
interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// 分页选项
interface PaginationOptions {
  page: number;
  limit: number;
}

// 分页结果
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
```

## 服务层类型

### Repository 模式

```typescript
// 通用Repository接口
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findOne(options: SelectOptions): Promise<T | null>;
  findMany(options: SelectOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(options?: SelectOptions): Promise<number>;
}

// 玩家Repository
interface PlayerRepository extends Repository<Player> {
  findByUsername(username: string): Promise<Player | null>;
  findByEmail(email: string): Promise<Player | null>;
  findByPhone(phone: string): Promise<Player | null>;
  getPlayersWithScore(): Promise<(Player & { score: Score })[]>;
}

// 游戏Repository
interface GameRepository extends Repository<Game> {
  findActiveGames(): Promise<Game[]>;
  findGamesByStatus(status: GameStatus): Promise<Game[]>;
  findGamesByType(gameType: string): Promise<Game[]>;
  findGamesByDateRange(startDate: Date, endDate: Date): Promise<Game[]>;
  getGameWithParticipants(gameId: string): Promise<(Game & { participants: GameParticipant[] }) | null>;
}
```

### Service 层

```typescript
// 游戏服务
interface GameService {
  createGame(gameData: Partial<Game>): Promise<Game>;
  joinGame(gameId: string, playerId: string, initialScore?: number): Promise<GameParticipant>;
  leaveGame(gameId: string, playerId: string): Promise<GameParticipant | null>;
  startGame(gameId: string): Promise<Game>;
  endGame(gameId: string): Promise<Game>;
  cancelGame(gameId: string): Promise<Game>;
  getGameStats(): Promise<{
    totalGames: number;
    activeGames: number;
    finishedGames: number;
    averagePlayersPerGame: number;
  }>;
}

// 转移服务
interface TransferService {
  createTransfer(transferData: Partial<TransferRecord>): Promise<TransferRecord>;
  processTransfer(transferId: string): Promise<TransferRecord>;
  cancelTransfer(transferId: string): Promise<TransferRecord>;
  getTransferHistory(playerId: string, options?: PaginationOptions): Promise<PaginatedResult<TransferRecord>>;
  getGameTransferHistory(gameId: string): Promise<TransferRecord[]>;
}
```

## 实时通信类型

```typescript
// WebSocket消息
interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  gameId?: string;
  playerId?: string;
}

// 游戏更新消息
interface GameUpdateMessage extends WebSocketMessage<Game> {
  type: 'GAME_UPDATE';
}

// 转移消息
interface TransferMessage extends WebSocketMessage<TransferRecord> {
  type: 'TRANSFER';
}

// 参与者更新消息
interface ParticipantUpdateMessage extends WebSocketMessage<GameParticipant> {
  type: 'PARTICIPANT_UPDATE';
}
```

## 使用示例

### 创建游戏

```typescript
import { CreateGameInput, GameService } from '@/types';

const gameService: GameService = {
  async createGame(gameData: CreateGameInput): Promise<Game> {
    // 实现创建游戏的逻辑
    return {} as Game;
  }
  // ... 其他方法
};

const newGame = await gameService.createGame({
  game_type: 'mahjong',
  max_players: 4,
  min_players: 2
});
```

### 查询玩家

```typescript
import { PlayerRepository, PlayerFilter, PaginationOptions } from '@/types';

const playerRepo: PlayerRepository = {
  async findMany(options: SelectOptions): Promise<Player[]> {
    // 实现查询逻辑
    return [];
  }
  // ... 其他方法
};

const players = await playerRepo.findMany({
  where: [
    { field: 'username', operator: 'LIKE', value: '%张%' }
  ],
  orderBy: [{ field: 'created_at', direction: 'DESC' }],
  limit: 10
});
```

### 处理转移记录

```typescript
import { TransferService, CreateTransferRecordInput } from '@/types';

const transferService: TransferService = {
  async createTransfer(transferData: CreateTransferRecordInput): Promise<TransferRecord> {
    // 实现转移逻辑
    return {} as TransferRecord;
  }
  // ... 其他方法
};

const transfer = await transferService.createTransfer({
  from_player_id: 'player1',
  to_player_id: 'player2',
  points: 100,
  game_id: 'game123',
  description: '游戏结算'
});
```

## 注意事项

1. 所有时间字段都使用 `Date` 类型
2. 可选字段使用 `?` 标记
3. 外键关系通过扩展接口表示
4. 使用泛型来保持类型安全
5. Repository 模式提供了数据访问的抽象层
6. Service 层封装了业务逻辑

这些类型定义确保了类型安全，并提供了清晰的API契约。 
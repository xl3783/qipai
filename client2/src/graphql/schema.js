// GraphQL Schema Definition
export const typeDefs = `
  # 用户类型
  type User {
    id: ID!
    name: String!
    avatar: String
    balance: Float!
    isHost: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  # 房间类型
  type Room {
    id: ID!
    name: String!
    hostId: ID!
    host: User!
    players: [User!]!
    status: RoomStatus!
    createdAt: String!
    updatedAt: String!
    transactions: [Transaction!]!
    totalAmount: Float!
  }

  # 房间状态枚举
  enum RoomStatus {
    ACTIVE
    SETTLED
    CLOSED
  }

  # 交易类型
  type Transaction {
    id: ID!
    fromPlayerId: ID!
    toPlayerId: ID!
    fromPlayer: User!
    toPlayer: User!
    amount: Float!
    description: String
    type: TransactionType!
    timestamp: String!
    roomId: ID!
    room: Room!
  }

  # 交易类型枚举
  enum TransactionType {
    TRANSFER
    EXPENSE
    SETTLEMENT
  }

  # 游戏统计类型
  type GameStats {
    id: ID!
    userId: ID!
    user: User!
    wins: Int!
    losses: Int!
    draws: Int!
    winRate: Float!
    totalPoints: Float!
    friendRanking: Int!
    updatedAt: String!
  }

  # 结算结果类型
  type SettlementResult {
    id: ID!
    roomId: ID!
    room: Room!
    userId: ID!
    user: User!
    finalBalance: Float!
    totalTransferred: Float!
    totalReceived: Float!
    createdAt: String!
  }

  # 查询根类型
  type Query {
    # 用户相关查询
    user(id: ID!): User
    users: [User!]!
    currentUser: User
    
    # 房间相关查询
    room(id: ID!): Room
    rooms: [Room!]!
    activeRooms: [Room!]!
    userRooms(userId: ID!): [Room!]!
    
    # 交易相关查询
    transaction(id: ID!): Transaction
    transactions(roomId: ID): [Transaction!]!
    userTransactions(userId: ID!, limit: Int, offset: Int): [Transaction!]!
    
    # 统计相关查询
    gameStats(userId: ID!): GameStats
    leaderboard: [GameStats!]!
    
    # 结算相关查询
    settlementResults(roomId: ID!): [SettlementResult!]!
  }

  # 变更根类型
  type Mutation {
    # 用户相关变更
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    updateUserBalance(id: ID!, amount: Float!): User!
    
    # 房间相关变更
    createRoom(input: CreateRoomInput!): Room!
    joinRoom(roomId: ID!, userId: ID!): Room!
    leaveRoom(roomId: ID!, userId: ID!): Room!
    closeRoom(roomId: ID!): Room!
    
    # 交易相关变更
    createTransaction(input: CreateTransactionInput!): Transaction!
    
    # 结算相关变更
    settleRoom(roomId: ID!): [SettlementResult!]!
    
    # 游戏统计变更
    updateGameStats(userId: ID!, input: UpdateGameStatsInput!): GameStats!
  }

  # 订阅根类型
  type Subscription {
    # 房间实时更新
    roomUpdated(roomId: ID!): Room!
    transactionAdded(roomId: ID!): Transaction!
    userBalanceUpdated(userId: ID!): User!
  }

  # 输入类型定义
  input CreateUserInput {
    name: String!
    avatar: String
  }

  input UpdateUserInput {
    name: String
    avatar: String
  }

  input CreateRoomInput {
    name: String!
    hostId: ID!
  }

  input CreateTransactionInput {
    fromPlayerId: ID!
    toPlayerId: ID!
    amount: Float!
    description: String
    type: TransactionType!
    roomId: ID!
  }

  input UpdateGameStatsInput {
    wins: Int
    losses: Int
    draws: Int
    totalPoints: Float
  }
`; 
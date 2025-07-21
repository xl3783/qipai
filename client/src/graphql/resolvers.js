import {
  mockUsers,
  mockRooms,
  mockTransactions,
  mockGameStats,
  mockSettlementResults,
  generateId,
  findById,
  findByProperty,
  updateById,
  removeById,
} from './mock-data.js';

// GraphQL Resolvers
export const resolvers = {
  // 查询解析器
  Query: {
    // 用户相关查询
    user: (parent, args) => {
      return findById(mockUsers, args.id);
    },
    getUsers: () => {
      return mockUsers;
    },
    currentUser: () => {
      // 模拟当前用户，实际应用中从认证上下文获取
      return mockUsers[0];
    },

    // 房间相关查询
    getRoom: (parent, args) => {
      return findById(mockRooms, args.id);
    },
    rooms: () => {
      return mockRooms;
    },
    activeRooms: () => {
      return mockRooms.filter(room => room.status === 'ACTIVE');
    },
    userRooms: (parent, args) => {
      const userRooms = mockRooms.filter(room => {
        // 检查用户是否是房主或房间成员
        return room.hostId === args.userId || 
               mockUsers.some(user => user.id === args.userId);
      });
      return userRooms;
    },

    // 交易相关查询
    transaction: (parent, args) => {
      return findById(mockTransactions, args.id);
    },
    transactions: (parent, args) => {
      if (args.roomId) {
        return findByProperty(mockTransactions, 'roomId', args.roomId);
      }
      return mockTransactions;
    },
    userTransactions: (parent, args) => {
      const userTransactions = mockTransactions.filter(tx => 
        tx.fromPlayerId === args.userId || tx.toPlayerId === args.userId
      );
      
      const limit = args.limit || 10;
      const offset = args.offset || 0;
      
      return userTransactions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(offset, offset + limit);
    },

    // 统计相关查询
    gameStats: (parent, args) => {
      return findByProperty(mockGameStats, 'userId', args.userId)[0];
    },
    leaderboard: () => {
      return mockGameStats
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 10);
    },

    // 结算相关查询
    settlementResults: (parent, args) => {
      return findByProperty(mockSettlementResults, 'roomId', args.roomId);
    },
  },

  // 变更解析器
  Mutation: {
    // 用户相关变更
    createUser: (parent, args) => {
      const newUser = {
        id: generateId(),
        name: args.input.name,
        avatar: args.input.avatar || null,
        balance: 0,
        isHost: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      return newUser;
    },

    updateUser: (parent, args) => {
      const updatedUser = updateById(mockUsers, args.id, args.input);
      if (!updatedUser) {
        throw new Error('用户不存在');
      }
      return updatedUser;
    },

    updateUserBalance: (parent, args) => {
      const user = findById(mockUsers, args.id);
      if (!user) {
        throw new Error('用户不存在');
      }
      
      const updatedUser = updateById(mockUsers, args.id, { 
        balance: user.balance + args.amount 
      });
      return updatedUser;
    },

    // 房间相关变更
    createRoom: (parent, args) => {
      const newRoom = {
        id: generateId(),
        name: args.input.name,
        hostId: args.input.hostId,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockRooms.push(newRoom);
      return newRoom;
    },

    joinRoom: (parent, args) => {
      const room = findById(mockRooms, args.roomId);
      if (!room) {
        throw new Error('房间不存在');
      }
      
      // 这里简化处理，实际应该维护房间成员列表
      return room;
    },

    leaveRoom: (parent, args) => {
      const room = findById(mockRooms, args.roomId);
      if (!room) {
        throw new Error('房间不存在');
      }
      
      // 这里简化处理，实际应该从房间成员列表移除用户
      return room;
    },

    closeRoom: (parent, args) => {
      const updatedRoom = updateById(mockRooms, args.roomId, { status: 'CLOSED' });
      if (!updatedRoom) {
        throw new Error('房间不存在');
      }
      return updatedRoom;
    },

    // 交易相关变更
    createTransaction: (parent, args) => {
      const { fromPlayerId, toPlayerId, amount, description, type, roomId } = args.input;
      
      // 验证用户存在
      const fromPlayer = findById(mockUsers, fromPlayerId);
      const toPlayer = findById(mockUsers, toPlayerId);
      
      if (!fromPlayer || !toPlayer) {
        throw new Error('用户不存在');
      }

      // 验证房间存在
      const room = findById(mockRooms, roomId);
      if (!room) {
        throw new Error('房间不存在');
      }

      // 创建交易记录
      const newTransaction = {
        id: generateId(),
        fromPlayerId,
        toPlayerId,
        amount,
        description: description || '',
        type,
        timestamp: new Date().toISOString(),
        roomId,
      };

      mockTransactions.push(newTransaction);

      // 更新用户余额
      updateById(mockUsers, fromPlayerId, { 
        balance: fromPlayer.balance - amount 
      });
      updateById(mockUsers, toPlayerId, { 
        balance: toPlayer.balance + amount 
      });

      return newTransaction;
    },

    // 结算相关变更
    settleRoom: (parent, args) => {
      const room = findById(mockRooms, args.roomId);
      if (!room) {
        throw new Error('房间不存在');
      }

      // 获取房间所有交易
      const roomTransactions = findByProperty(mockTransactions, 'roomId', args.roomId);
      
      // 计算每个用户的最终结算
      const userBalances = {};
      roomTransactions.forEach(tx => {
        userBalances[tx.fromPlayerId] = (userBalances[tx.fromPlayerId] || 0) - tx.amount;
        userBalances[tx.toPlayerId] = (userBalances[tx.toPlayerId] || 0) + tx.amount;
      });

      // 创建结算结果
      const settlementResults = Object.entries(userBalances).map(([userId, balance]) => {
        const user = findById(mockUsers, userId);
        const totalTransferred = roomTransactions
          .filter(tx => tx.fromPlayerId === userId)
          .reduce((sum, tx) => sum + tx.amount, 0);
        const totalReceived = roomTransactions
          .filter(tx => tx.toPlayerId === userId)
          .reduce((sum, tx) => sum + tx.amount, 0);

        const result = {
          id: generateId(),
          roomId: args.roomId,
          userId,
          finalBalance: balance,
          totalTransferred,
          totalReceived,
          createdAt: new Date().toISOString(),
        };

        mockSettlementResults.push(result);
        return result;
      });

      // 更新房间状态
      updateById(mockRooms, args.roomId, { status: 'SETTLED' });

      return settlementResults;
    },

    // 游戏统计变更
    updateGameStats: (parent, args) => {
      let stats = findByProperty(mockGameStats, 'userId', args.userId)[0];
      
      if (!stats) {
        // 如果统计不存在，创建新的
        stats = {
          id: generateId(),
          userId: args.userId,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
          totalPoints: 0,
          friendRanking: 0,
          updatedAt: new Date().toISOString(),
        };
        mockGameStats.push(stats);
      }

      // 更新统计数据
      const updates = { ...args.input };
      if (updates.wins !== undefined || updates.losses !== undefined || updates.draws !== undefined) {
        const totalGames = (updates.wins || stats.wins) + (updates.losses || stats.losses) + (updates.draws || stats.draws);
        updates.winRate = totalGames > 0 ? ((updates.wins || stats.wins) / totalGames * 100) : 0;
      }

      const updatedStats = updateById(mockGameStats, stats.id, updates);
      return updatedStats;
    },
  },

  // 类型解析器
  User: {
    // 关联解析器可以在这里添加
  },

  Room: {
    host: (parent) => {
      return findById(mockUsers, parent.hostId);
    },
    players: (parent) => {
      // 简化实现：返回所有用户作为房间成员
      // 实际应该维护房间成员关系表
      return mockUsers;
    },
    transactions: (parent) => {
      return findByProperty(mockTransactions, 'roomId', parent.id);
    },
    totalAmount: (parent) => {
      const roomTransactions = findByProperty(mockTransactions, 'roomId', parent.id);
      return roomTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    },
  },

  Transaction: {
    fromPlayer: (parent) => {
      return findById(mockUsers, parent.fromPlayerId);
    },
    toPlayer: (parent) => {
      return findById(mockUsers, parent.toPlayerId);
    },
    room: (parent) => {
      return findById(mockRooms, parent.roomId);
    },
  },

  GameStats: {
    user: (parent) => {
      return findById(mockUsers, parent.userId);
    },
  },

  SettlementResult: {
    room: (parent) => {
      return findById(mockRooms, parent.roomId);
    },
    user: (parent) => {
      return findById(mockUsers, parent.userId);
    },
  },
}; 
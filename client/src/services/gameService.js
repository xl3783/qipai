// 游戏业务逻辑服务
import { graphqlClient, QUERIES, MUTATIONS } from '../graphql/client.js';

export class GameService {
  // 用户管理
  static async getCurrentUser() {
    const result = await graphqlClient.query(QUERIES.GET_CURRENT_USER);
    return result.data?.currentUser;
  }

  static async getAllUsers() {
    const result = await graphqlClient.query(QUERIES.GET_USERS);
    return result.data?.users || [];
  }

  static async createUser(userInput) {
    const result = await graphqlClient.mutate(MUTATIONS.CREATE_USER, {
      input: userInput
    });
    return result.data?.createUser;
  }

  static async updateUser(userId, userInput) {
    const result = await graphqlClient.mutate(MUTATIONS.UPDATE_USER, {
      id: userId,
      input: userInput
    });
    return result.data?.updateUser;
  }

  // 房间管理
  static async getActiveRooms() {
    const result = await graphqlClient.query(QUERIES.GET_ACTIVE_ROOMS);
    return result.data?.activeRooms || [];
  }

  static async getRoom(roomId) {
    const result = await graphqlClient.query(QUERIES.GET_ROOM, { id: roomId });
    return result.data?.room;
  }

  static async createRoom(roomInput) {
    const result = await graphqlClient.mutate(MUTATIONS.CREATE_ROOM, {
      input: roomInput
    });
    return result.data?.createRoom;
  }

  static async joinRoom(roomId, userId) {
    const result = await graphqlClient.mutate(MUTATIONS.JOIN_ROOM, {
      roomId,
      userId
    });
    return result.data?.joinRoom;
  }

  // 交易管理
  static async getTransactions(roomId) {
    const result = await graphqlClient.query(QUERIES.GET_TRANSACTIONS, { roomId });
    return result.data?.transactions || [];
  }

  static async createTransaction(transactionInput) {
    const result = await graphqlClient.mutate(MUTATIONS.CREATE_TRANSACTION, {
      input: transactionInput
    });
    return result.data?.createTransaction;
  }

  static async getUserTransactions(userId, limit = 10, offset = 0) {
    const result = await graphqlClient.query(QUERIES.GET_USER_TRANSACTIONS, {
      userId,
      limit,
      offset
    });
    return result.data?.userTransactions || [];
  }

  // 游戏统计
  static async getGameStats(userId) {
    const result = await graphqlClient.query(QUERIES.GET_GAME_STATS, { userId });
    return result.data?.gameStats;
  }

  static async getLeaderboard() {
    const result = await graphqlClient.query(QUERIES.GET_LEADERBOARD);
    return result.data?.leaderboard || [];
  }

  static async updateGameStats(userId, statsInput) {
    const result = await graphqlClient.mutate(MUTATIONS.UPDATE_GAME_STATS, {
      userId,
      input: statsInput
    });
    return result.data?.updateGameStats;
  }

  // 房间结算
  static async settleRoom(roomId) {
    const result = await graphqlClient.mutate(MUTATIONS.SETTLE_ROOM, { roomId });
    return result.data?.settleRoom || [];
  }

  // 转账业务逻辑
  static async transfer(fromPlayerId, toPlayerId, amount, description, roomId) {
    const transactionInput = {
      fromPlayerId,
      toPlayerId,
      amount,
      description,
      type: 'TRANSFER',
      roomId
    };

    return await this.createTransaction(transactionInput);
  }

  // 消费记录
  static async recordExpense(fromPlayerId, toPlayerId, amount, description, roomId) {
    const transactionInput = {
      fromPlayerId,
      toPlayerId,
      amount,
      description,
      type: 'EXPENSE',
      roomId
    };

    return await this.createTransaction(transactionInput);
  }

  // 获取房间余额汇总
  static async getRoomBalance(roomId) {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    const balanceMap = {};
    room.players.forEach(player => {
      balanceMap[player.id] = {
        id: player.id,
        name: player.name,
        balance: player.balance
      };
    });

    const totalAmount = room.totalAmount;
    const playerCount = room.players.length;
    const averageBalance = playerCount > 0 ? totalAmount / playerCount : 0;

    return {
      players: Object.values(balanceMap),
      totalAmount,
      averageBalance,
      playerCount
    };
  }

  // 计算结算策略
  static async calculateSettlementStrategy(roomId) {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    const balances = room.players.map(player => ({
      id: player.id,
      name: player.name,
      balance: player.balance
    }));

    // 分离债权人和债务人
    const creditors = balances.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);

    const settlements = [];
    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      
      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
      
      if (amount > 0) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: amount,
          fromId: debtor.id,
          toId: creditor.id
        });

        creditor.balance -= amount;
        debtor.balance += amount;
      }

      if (creditor.balance === 0) i++;
      if (debtor.balance === 0) j++;
    }

    return settlements;
  }
} 
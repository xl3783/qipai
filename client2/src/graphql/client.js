import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

// 简单的GraphQL客户端实现 (用于mock数据)
class MockGraphQLClient {
  constructor(schema, resolvers) {
    this.schema = schema;
    this.resolvers = resolvers;
  }

  // 执行查询
  async query(queryString, variables = {}) {
    try {
      console.log('queryString', queryString);
      console.log('variables', variables);
      const result = this.executeQuery(queryString, variables);
      console.log('result', result);
      return { data: result, errors: null };
    } catch (error) {
      return { data: null, errors: [{ message: error.message }] };
    }
  }

  // 执行变更
  async mutate(mutationString, variables = {}) {
    try {
      const result = this.executeMutation(mutationString, variables);
      return { data: result, errors: null };
    } catch (error) {
      return { data: null, errors: [{ message: error.message }] };
    }
  }

  // 简化的查询解析器
  executeQuery(queryString, variables) {
    // 解析查询字符串
    const operation = this.parseOperation(queryString);
    const resolver = this.resolvers.Query[operation.name];
    
    if (!resolver) {
      throw new Error(`Query ${operation.name} not found`);
    }

    return { [operation.name]: resolver(null, { ...operation.args, ...variables }) };
  }

  // 简化的变更解析器
  executeMutation(mutationString, variables) {
    // 解析变更字符串
    const operation = this.parseOperation(mutationString);
    const resolver = this.resolvers.Mutation[operation.name];
    
    if (!resolver) {
      throw new Error(`Mutation ${operation.name} not found`);
    }

    return { [operation.name]: resolver(null, { ...operation.args, ...variables }) };
  }

  // 简化的操作解析器
  parseOperation(operationString) {
    // 这是一个非常简化的解析器，仅用于mock数据
    // 实际项目中应该使用专业的GraphQL解析库
    
    const lines = operationString.trim().split('\n').map(line => line.trim());
    const operationLine = lines.find(line => line.includes('{') && !line.startsWith('#'));
    
    if (!operationLine) {
      throw new Error('Invalid operation format');
    }

    const match = operationLine.match(/(\w+)\s*(?:\(([^)]*)\))?\s*\{/);
    if (!match) {
      throw new Error('Could not parse operation');
    }

    const name = match[1];
    const argsString = match[2] || '';
    
    // 简化参数解析
    const args = {};
    if (argsString) {
      const argMatches = argsString.match(/(\w+):\s*([^,]+)/g);
      if (argMatches) {
        argMatches.forEach(argMatch => {
          const [key, value] = argMatch.split(':').map(s => s.trim());
          args[key] = value.replace(/['"]/g, '');
        });
      }
    }

    return { name, args };
  }
}

// 创建GraphQL客户端实例
export const graphqlClient = new MockGraphQLClient(typeDefs, resolvers);

// GraphQL 查询字符串
export const QUERIES = {
  // 用户相关查询
  GET_CURRENT_USER: `
    query getCurrentUser {
      currentUser {
        id
        name
        avatar
        balance
        isHost
        createdAt
        updatedAt
      }
    }
  `,

  GET_USERS: `
    query getUsers {
      users {
        id
        name
        avatar
        balance
        isHost
        createdAt
        updatedAt
      }
    }
  `,

  GET_USER: `
    query getUser($id: ID!) {
      user(id: $id) {
        id
        name
        avatar
        balance
        isHost
        createdAt
        updatedAt
      }
    }
  `,

  // 房间相关查询
  GET_ACTIVE_ROOMS: `
    query getActiveRooms {
      activeRooms {
        id
        name
        hostId
        status
        createdAt
        updatedAt
        host {
          id
          name
        }
        players {
          id
          name
          balance
          isHost
        }
        totalAmount
      }
    }
  `,

  GET_ROOM: `
    query getRoom($id: ID!) {
      room(id: $id) {
        id
        name
        hostId
        status
        createdAt
        updatedAt
        host {
          id
          name
        }
        players {
          id
          name
          avatar
          balance
          isHost
        }
        transactions {
          id
          fromPlayerId
          toPlayerId
          fromPlayer {
            id
            name
          }
          toPlayer {
            id
            name
          }
          amount
          description
          type
          timestamp
        }
        totalAmount
      }
    }
  `,

  // 交易相关查询
  GET_TRANSACTIONS: `
    query getTransactions($roomId: ID) {
      transactions(roomId: $roomId) {
        id
        fromPlayerId
        toPlayerId
        fromPlayer {
          id
          name
        }
        toPlayer {
          id
          name
        }
        amount
        description
        type
        timestamp
        roomId
      }
    }
  `,

  GET_USER_TRANSACTIONS: `
    query getUserTransactions($userId: ID!, $limit: Int, $offset: Int) {
      userTransactions(userId: $userId, limit: $limit, offset: $offset) {
        id
        fromPlayerId
        toPlayerId
        fromPlayer {
          id
          name
        }
        toPlayer {
          id
          name
        }
        amount
        description
        type
        timestamp
        roomId
      }
    }
  `,

  // 统计相关查询
  GET_GAME_STATS: `
    query getGameStats($userId: ID!) {
      gameStats(userId: $userId) {
        id
        userId
        wins
        losses
        draws
        winRate
        totalPoints
        friendRanking
        updatedAt
        user {
          id
          name
        }
      }
    }
  `,

  GET_LEADERBOARD: `
    query getLeaderboard {
      leaderboard {
        id
        userId
        wins
        losses
        draws
        winRate
        totalPoints
        friendRanking
        updatedAt
        user {
          id
          name
        }
      }
    }
  `,
};

// GraphQL 变更字符串
export const MUTATIONS = {
  // 用户相关变更
  CREATE_USER: `
    mutation createUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id
        name
        avatar
        balance
        isHost
        createdAt
        updatedAt
      }
    }
  `,

  UPDATE_USER: `
    mutation updateUser($id: ID!, $input: UpdateUserInput!) {
      updateUser(id: $id, input: $input) {
        id
        name
        avatar
        balance
        isHost
        updatedAt
      }
    }
  `,

  // 房间相关变更
  CREATE_ROOM: `
    mutation createRoom($input: CreateRoomInput!) {
      createRoom(input: $input) {
        id
        name
        hostId
        status
        createdAt
        updatedAt
        host {
          id
          name
        }
      }
    }
  `,

  JOIN_ROOM: `
    mutation joinRoom($roomId: ID!, $userId: ID!) {
      joinRoom(roomId: $roomId, userId: $userId) {
        id
        name
        players {
          id
          name
          balance
        }
      }
    }
  `,

  // 交易相关变更
  CREATE_TRANSACTION: `
    mutation createTransaction($input: CreateTransactionInput!) {
      createTransaction(input: $input) {
        id
        fromPlayerId
        toPlayerId
        fromPlayer {
          id
          name
        }
        toPlayer {
          id
          name
        }
        amount
        description
        type
        timestamp
        roomId
      }
    }
  `,

  // 结算相关变更
  SETTLE_ROOM: `
    mutation settleRoom($roomId: ID!) {
      settleRoom(roomId: $roomId) {
        id
        roomId
        userId
        finalBalance
        totalTransferred
        totalReceived
        createdAt
        user {
          id
          name
        }
      }
    }
  `,

  // 游戏统计变更
  UPDATE_GAME_STATS: `
    mutation updateGameStats($userId: ID!, $input: UpdateGameStatsInput!) {
      updateGameStats(userId: $userId, input: $input) {
        id
        userId
        wins
        losses
        draws
        winRate
        totalPoints
        friendRanking
        updatedAt
      }
    }
  `,
}; 
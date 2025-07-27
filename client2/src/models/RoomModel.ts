import Taro from '@tarojs/taro';
import { 
  GameParticipant, 
  TransferRecord, 
  Transaction, 
  CreateTransactionInput 
} from '../types/index';

export class RoomModel {
  private roomId: string;
  private roomName: string;

  constructor(roomId: string, roomName: string) {
    this.roomId = roomId;
    this.roomName = roomName;
  }

  /**
   * 获取游戏参与者数据
   */
  async getGameParticipants(): Promise<GameParticipant[]> {
    const query = `
      query GetGameParticipants($gameId: String!) {
        allGameParticipants(condition: { gameId: $gameId }) {
          nodes {
            participationId,
            playerId,
            finalScore,
            playerByPlayerId {
              username
              avatarUrl
            }
          }
        }
      }
    `;

    try {
      const response = await Taro.request({
        url: 'http://localhost:15000/graphql',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
        },
        data: {
          query,
          variables: { gameId: this.roomId },
        },
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const result = response.data;
        return result.data?.allGameParticipants?.nodes || [];
      } else {
        throw new Error(`获取游戏参与者失败: ${response.statusCode}`);
      }
    } catch (error) {
      console.error('获取游戏参与者失败:', error);
      throw error;
    }
  }

  /**
   * 获取玩家交易记录
   */
  async getPlayerTransactions(): Promise<TransferRecord[]> {
    const query = `
      query GetPlayerTransactions($gameId: String!) {
        allTransferRecords(condition: {gameId: $gameId}, orderBy: CREATED_AT_DESC) {
          nodes {
            nodeId,
            transferId,
            fromPlayerId,
            toPlayerId,
            playerByFromPlayerId {
              username,
              avatarUrl
            },
            playerByToPlayerId {
              username,
               avatarUrl
            }
            points
          }
        }
      }
    `;

    try {
      const response = await Taro.request({
        url: 'http://localhost:15000/graphql',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
        },
        data: {
          query,
          variables: { gameId: this.roomId },
        },
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const result = response.data;
        return result.data?.allTransferRecords?.nodes || [];
      } else {
        throw new Error(`获取交易记录失败: ${response.statusCode}`);
      }
    } catch (error) {
      console.error('获取交易记录失败:', error);
      throw error;
    }
  }

  /**
   * 转账
   */
  async transfer(gameId: string, to: string, points: number): Promise<any> {
    // http://localhost:3000/api/games/transfer
    const token = Taro.getStorageSync("token");
    if (!token) {
      throw new Error("用户未登录");
    }

    const response = await Taro.request({
      url: 'http://localhost:3000/api/games/transfer',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        gameId,
        to,
        points
      }
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data;
    } else {
      throw new Error(`转账失败: ${response.statusCode}`);
    }
  }
  

  /**
   * 创建交易记录
   */
  async createTransaction(input: CreateTransactionInput): Promise<any> {
    const mutation = `
      mutation CreateTransaction($input: CreateTransferRecordInput!) {
        createTransferRecord(input: $input) {
          transferRecord {
            transferId
            fromPlayerId
            toPlayerId
            points
          }
        }
      }
    `;

    try {
      const response = await Taro.request({
        url: 'http://localhost:15000/graphql',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
        },
        data: {
          query: mutation,
          variables: { input },
        },
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.data;
      } else {
        throw new Error(`创建交易失败: ${response.statusCode}`);
      }
    } catch (error) {
      console.error('创建交易失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): { playerId: string; username: string; avatarUrl?: string } {
    const userInfo = Taro.getStorageSync('userInfo');
    return {
      playerId: userInfo?.playerId || "mock_openid_gp55mnaesqj",
      username: userInfo?.username || "mock_nickname",
      avatarUrl: userInfo?.avatarUrl || null,
    };
  }

  /**
   * 转换交易记录格式
   */
  transformTransactions(transferRecords: TransferRecord[]): Transaction[] {
    return transferRecords.map((node) => ({
      id: node.nodeId,
      fromPlayerId: node.fromPlayerId,
      toPlayerId: node.toPlayerId,
      fromPlayer: {
        username: node.playerByFromPlayerId.username,
        avatarUrl: node.playerByFromPlayerId.avatarUrl,
      },
      toPlayer: {
        username: node.playerByToPlayerId.username,
        avatarUrl: node.playerByToPlayerId.avatarUrl,
      },
      points: node.points,
    }));
  }
} 
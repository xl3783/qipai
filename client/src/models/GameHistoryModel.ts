import Taro from "@tarojs/taro";
import { apiConfig } from "../config/api";

export interface GameHistoryRoom {
  id: string;
  name: string;
  status: 'waiting' | 'playing' | 'cancelled' | 'finished';
  hostId: string;
  hostName: string;
  playerCount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameHistoryStats {
  totalRooms: number;
  activeRooms: number;
  settledRooms: number;
  totalAmount: number;
  winRate: number;
}

export class GameHistoryModel {

  async getRoomIdsByUserId(): Promise<string[]> {
    const token = Taro.getStorageSync("token");
    if (!token) {
      throw new Error("用户未登录");
    }
    const userInfo = Taro.getStorageSync("userInfo");
    if (!userInfo) {
      throw new Error("用户未登录");
    }
    const userId = userInfo.id;

          const response = await Taro.request({
        url: apiConfig.graphqlURL,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          query: `
            query GetRoomIdsByUserId {
              allGameParticipantsList(condition: {playerId: "${userId}"}) {
                gameId
              }
            }
          `
        }
      });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      const result = response.data;
      const roomIds = result.data?.allGameParticipantsList || [];
      return roomIds.map((room: any) => room.gameId);
    } else {
      throw new Error(`获取房间列表失败: ${response.statusCode}`);
    }
  }

  /**
   * 获取用户的历史房间列表
   */
  async getUserRooms(): Promise<GameHistoryRoom[]> {
    try {
      const token = Taro.getStorageSync("token");
      if (!token) {
        throw new Error("用户未登录");
      }


      const response = await Taro.request({
        url: `${apiConfig.baseURL}/api/games/list`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log("response.data", response)
        const result = response.data;
        const rooms = result || [];

        // 转换数据格式
        // return this.getMockRooms();
        return rooms.map((room: any) => ({
          id: room.gameId,
          name: room.gameName,
          status: room.status,
          hostId: room.hostId,
          hostName: room.hostName,
          playerCount: room.participants?.length || 0,
          totalAmount: room.totalAmount || 0,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        }));
      } else {
        throw new Error(`获取房间列表失败: ${response.statusCode}`);
      }
    } catch (error) {
      console.error('获取房间列表失败:', error);
      // 返回模拟数据用于开发
      return this.getMockRooms();
    }
  }

  /**
   * 获取战绩统计
   */
  async getGameStats(): Promise<GameHistoryStats> {
    try {
      const rooms = await this.getUserRooms();

      const totalRooms = rooms.length;
      const activeRooms = rooms.filter(room => room.status === 'ACTIVE').length;
      const settledRooms = rooms.filter(room => room.status === 'SETTLED').length;
      const totalAmount = rooms.reduce((sum, room) => sum + room.totalAmount, 0);

      // 简单的胜率计算（这里可以根据实际业务逻辑调整）
      const winRate = totalRooms > 0 ? (settledRooms / totalRooms) * 100 : 0;

      return {
        totalRooms,
        activeRooms,
        settledRooms,
        totalAmount,
        winRate: Math.round(winRate * 100) / 100,
      };
    } catch (error) {
      console.error('获取战绩统计失败:', error);
      return {
        totalRooms: 0,
        activeRooms: 0,
        settledRooms: 0,
        totalAmount: 0,
        winRate: 0,
      };
    }
  }

  /**
   * 获取模拟数据（开发阶段使用）
   */
  private getMockRooms(): GameHistoryRoom[] {
    return [
      {
        id: 'room-1',
        name: '打牌记账 jyyj 房间',
        status: 'ACTIVE',
        hostId: 'user-1',
        hostName: '张三',
        playerCount: 4,
        totalAmount: 1200,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T12:30:00Z',
      },
      {
        id: 'room-2',
        name: '周末麻将局',
        status: 'SETTLED',
        hostId: 'user-2',
        hostName: '李四',
        playerCount: 3,
        totalAmount: 800,
        createdAt: '2024-01-10T14:00:00Z',
        updatedAt: '2024-01-10T18:00:00Z',
      },
      {
        id: 'room-3',
        name: '朋友聚会',
        status: 'CLOSED',
        hostId: 'user-1',
        hostName: '张三',
        playerCount: 5,
        totalAmount: 1500,
        createdAt: '2024-01-05T19:00:00Z',
        updatedAt: '2024-01-05T22:00:00Z',
      },
      {
        id: 'room-4',
        name: '新年第一局',
        status: 'ACTIVE',
        hostId: 'user-3',
        hostName: '王五',
        playerCount: 4,
        totalAmount: 600,
        createdAt: '2024-01-20T20:00:00Z',
        updatedAt: '2024-01-20T21:15:00Z',
      },
      {
        id: 'room-4',
        name: '新年第一局',
        status: 'ACTIVE',
        hostId: 'user-3',
        hostName: '王五',
        playerCount: 4,
        totalAmount: 600,
        createdAt: '2024-01-20T20:00:00Z',
        updatedAt: '2024-01-20T21:15:00Z',
      },
      {
        id: 'room-4',
        name: '新年第一局',
        status: 'ACTIVE',
        hostId: 'user-3',
        hostName: '王五',
        playerCount: 4,
        totalAmount: 600,
        createdAt: '2024-01-20T20:00:00Z',
        updatedAt: '2024-01-20T21:15:00Z',
      },
      {
        id: 'room-4',
        name: '新年第一局',
        status: 'ACTIVE',
        hostId: 'user-3',
        hostName: '王五',
        playerCount: 4,
        totalAmount: 600,
        createdAt: '2024-01-20T20:00:00Z',
        updatedAt: '2024-01-20T21:15:00Z',
      },
      {
        id: 'room-4',
        name: '新年第一局',
        status: 'ACTIVE',
        hostId: 'user-3',
        hostName: '王五',
        playerCount: 4,
        totalAmount: 600,
        createdAt: '2024-01-20T20:00:00Z',
        updatedAt: '2024-01-20T21:15:00Z',
      },
      {
        id: 'room-4',
        name: '新年第一局',
        status: 'ACTIVE',
        hostId: 'user-3',
        hostName: '王五',
        playerCount: 4,
        totalAmount: 600,
        createdAt: '2024-01-20T20:00:00Z',
        updatedAt: '2024-01-20T21:15:00Z',
      },
      {
        id: 'room-4',
        name: '新年第一局',
        status: 'ACTIVE',
        hostId: 'user-3',
        hostName: '王五',
        playerCount: 4,
        totalAmount: 600,
        createdAt: '2024-01-20T20:00:00Z',
        updatedAt: '2024-01-20T21:15:00Z',
      },
      {
        id: 'room-4',
        name: '新年第一局',
        status: 'ACTIVE',
        hostId: 'user-3',
        hostName: '王五',
        playerCount: 4,
        totalAmount: 600,
        createdAt: '2024-01-20T20:00:00Z',
        updatedAt: '2024-01-20T21:15:00Z',
      },
    ];
  }
} 
import Taro from "@tarojs/taro";
import { apiConfig } from "../config/api";

interface Room {
    gameId: string;
    gameName: string;
    message: string;
}

interface JoinRoomResponse {
    success: boolean;
    participationId: string;
    message: string;
    gameName: string;
    gameId: string;
}

export class RoomService {

    static async createRoom(): Promise<Room> {

        const token = Taro.getStorageSync("token");
        if (!token) {
            throw new Error("用户未登录");
        }
        
        const result = await Taro.request({
            url: `${apiConfig.baseURL}/api/games/create`,
            method: 'POST',
            header: {
                'Authorization': `Bearer ${token}`
            }
        });
        return result.data;
    }

    static async joinRoom(roomName: string): Promise<JoinRoomResponse> {
        const token = Taro.getStorageSync("token");
        if (!token) {
            throw new Error("用户未登录");
        }

        const result = await Taro.request({
            url: `${apiConfig.baseURL}/api/games/join`,
            method: 'POST',
            header: {
                'Authorization': `Bearer ${token}`
            },
            data: {
                gameName: roomName
            }
        });
        return result.data as unknown as JoinRoomResponse;
    }

    static async leaveRoom(roomId: string): Promise<any> {
        const token = Taro.getStorageSync("token");
        if (!token) {
            throw new Error("用户未登录");
        }

        const result = await Taro.request({
            url: `${apiConfig.baseURL}/api/games/leave`,
            method: 'POST',
            header: {
                'Authorization': `Bearer ${token}`
            },
            data: {
                gameId: roomId
            }
        });
        return result.data;
    }
}
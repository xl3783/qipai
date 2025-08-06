import Taro from "@tarojs/taro";
import { IndexPageModel } from "../models/IndexPageModel";
import {
  IndexPageState,
  UserInfo,
  GameStats
} from "../types/index";
import { GraphQLService } from "../services/GraphQLService";
import { RoomService } from "../services/RoomService";
import { restClient } from "../services/restClient";

export class IndexPageViewModel {
  private model: IndexPageModel;
  private state: IndexPageState;
  private setState: React.Dispatch<React.SetStateAction<IndexPageState>>;

  constructor(
    model: IndexPageModel,
    state: IndexPageState,
    setState: React.Dispatch<React.SetStateAction<IndexPageState>>
  ) {
    this.model = model;
    this.state = state;
    this.setState = setState;
  }

  /**
   * 初始化页面
   */
  async initialize(): Promise<void> {
    try {
      await this.doLogin();
    } catch (error) {
      console.error("页面初始化失败:", error);
      // 如果登录失败，设置默认状态
      this.setState(prev => ({
        ...prev,
        isLoggingIn: false,
        userInfo: {
          username: "游客",
          avatarUrl: "",
          playerId: "guest",
        }
      }));
    }
  }

  /**
   * 执行登录流程
   */
  async doLogin(): Promise<void> {

    this.setState(prev => ({ ...prev, isLoggingIn: true }));

    // 检查是否已经登录
    const storedUserInfo = Taro.getStorageSync("userInfo");
    console.log("storedUserInfo", storedUserInfo);
    if (!storedUserInfo) {
      // 如果没有登录信息，执行微信登录
      await this.model.wechatLogin();
    }

    const token = Taro.getStorageSync('token');
    restClient.setToken(token);

    const userProfile = await this.model.getUserProfile();
    console.log("userProfile", userProfile);

    // const userProfile = await GraphQLService.getPlayerProfile();
    console.log("登录成功:", userProfile);

    const score = userProfile.scoreInfo;

    // 更新用户信息
    const userInfo: UserInfo = {
      username: userProfile.username,
      avatarUrl: userProfile.avatarUrl,
      playerId: userProfile.playerId,
    };

    this.setState(prev => ({
      ...prev,
      userInfo,
      gameStats: {
        totalPoints: score.currentTotal,
        wins: score.gamesWon,
        losses: score.gamesLost,
        winRate: score.gamesPlayed > 0 ? ((score.gamesWon / score.gamesPlayed) * 100).toFixed(2) + '%' : '--',
        friendRanking: 0,
      }
    }));

    this.setState(prev => ({ ...prev, isLoggingIn: false }));
  }

  /**
   * 获取微信用户信息
   */
  async handleGetUserProfile(): Promise<void> {
    try {
      const wxUserInfo = await this.model.getWechatUserInfo();
      await this.model.setUserInfo(wxUserInfo);

      const userInfo: UserInfo = {
        username: wxUserInfo.nickName,
        avatarUrl: wxUserInfo.avatarUrl,
        playerId: this.state.userInfo?.playerId || "unknown",
      };

      this.setState(prev => ({ ...prev, userInfo }));
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  }

  /**
   * 创建房间
   */
  async handleCreateRoom(): Promise<void> {

    const room = await RoomService.createRoom();
    Taro.navigateTo({
      url: `/pages/room/room?roomId=${room.gameId}&roomName=${room.gameName}`,
    });
  }

  /**
   * 加入房间
   */
  async handleJoinRoom(roomName: string): Promise<void>  {
    // this.setState(prev => ({ ...prev, showQRModal: true }));
    const joinRoomResponse = await RoomService.joinRoom(roomName);
    if (joinRoomResponse.success) {
      console.log("joinRoomResponse", joinRoomResponse);
      console.log("roomName", roomName);
      Taro.navigateTo({
        url: `/pages/room/room?roomName=${roomName}&roomId=${joinRoomResponse.gameId}`,
      });
    } else {
      Taro.showToast({
        title: joinRoomResponse.message,
        icon: 'none'
      }); 
    }
  }

  /**
   * 关闭二维码模态框
   */
  // handleCloseQRModal(): void {
  //   this.setState(prev => ({ ...prev, showQRModal: false }));
  // }

  // /**
  //  * 二维码扫描成功
  //  */
  // handleQRCodeScanned(roomId: string): void {
  //   this.setState(prev => ({ ...prev, showQRModal: false }));
  //   // 扫码成功后跳转到房间页面
  //   Taro.navigateTo({
  //     url: `/pages/room/room?roomId=${roomId}`,
  //   });
  // }

  // /**
  //  * 获取当前状态
  //  */
  // getState(): IndexPageState {
  //   return this.state;
  // }

  // /**
  //  * 检查是否正在加载
  //  */
  // isLoading(): boolean {
  //   return this.state.isLoggingIn;
  // }

  // /**
  //  * 获取用户信息
  //  */
  // getUserInfo(): UserInfo | null {
  //   return this.state.userInfo;
  // }

  // /**
  //  * 获取游戏统计
  //  */
  // getGameStats(): GameStats {
  //   return this.state.gameStats;
  // }

  // /**
  //  * 获取二维码模态框状态
  //  */
  // getQRModalState(): boolean {
  //   return this.state.showQRModal;
  // }
} 
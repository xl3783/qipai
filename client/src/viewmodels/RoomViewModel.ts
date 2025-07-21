import Taro from '@tarojs/taro';
import { RoomModel } from '../models/RoomModel';
import { 
  RoomState, 
  GameParticipant, 
  Transaction, 
  PlayerProfile,
  CreateTransactionInput 
} from '../types/index';

export class RoomViewModel {
  private model: RoomModel;
  private state: RoomState;
  private setState: React.Dispatch<React.SetStateAction<RoomState>>;

  constructor(
    model: RoomModel,
    state: RoomState,
    setState: React.Dispatch<React.SetStateAction<RoomState>>
  ) {
    this.model = model;
    this.state = state;
    this.setState = setState;

    // 每2秒刷新一次数据
    setInterval(() => {
      this.refreshData();
    }, 2000);
  }

  /**
   * 初始化页面
   */
  async initialize(): Promise<void> {
    try {
      this.setState(prev => ({ ...prev, loading: true, error: null }));
      
      // 并行获取游戏参与者和交易记录
      const [gameParticipants, transferRecords] = await Promise.all([
        this.model.getGameParticipants(),
        this.model.getPlayerTransactions()
      ]);

      const transactions = this.model.transformTransactions(transferRecords);
      console.log("gameParticipants", gameParticipants)
      console.log("gameParticipants length", gameParticipants?.length)
      console.log("gameParticipants structure", gameParticipants?.[0])

      this.setState(prev => ({
        ...prev,
        roomPlayers: gameParticipants,
        transactions,
        loading: false
      }));
    } catch (error) {
      console.error('页面初始化失败:', error);
      this.setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '初始化失败'
      }));
    }
  }

  /**
   * 选择玩家
   */
  handleChoosePlayer(player: GameParticipant): void {
    const playerProfile: PlayerProfile = {
      username: player.playerByPlayerId.username,
      avatarUrl: player.playerByPlayerId.avatarUrl,
      balance: 0, // 这里可以根据实际需求计算余额
    };

    this.setState(prev => ({
      ...prev,
      choosePlayerProfile: playerProfile,
      showProfileModal: true
    }));
  }

  /**
   * 关闭个人资料模态框
   */
  handleCloseProfileModal(): void {
    this.setState(prev => ({
      ...prev,
      showProfileModal: false,
      choosePlayerProfile: null
    }));
  }

  /**
   * 显示转账模态框
   */
  handleShowTransferModal(): void {
    console.log("handleShowTransferModal called")
    console.log("Current roomPlayers:", this.state.roomPlayers)
    console.log("Current roomPlayers length:", this.state.roomPlayers?.length)
    this.setState(prev => ({ ...prev, showTransferModal: true }));
  }

  /**
   * 关闭转账模态框
   */
  handleCloseTransferModal(): void {
    this.setState(prev => ({ ...prev, showTransferModal: false }));
  }

  /**
   * 执行转账
   */
  async handleTransfer(fromId: string, toId: string, amount: number, description: string): Promise<void> {
    
    try {
      await this.model.transfer(this.state.roomId, toId, amount);
      
      // 刷新数据
      // await this.refreshData();
      
      this.setState(prev => ({ ...prev, showTransferModal: false }));
    } catch (error) {
      console.error('转账失败:', error);
      this.setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '转账失败'
      }));
    }
  }

  /**
   * 刷新数据
   */
  async refreshData(): Promise<void> {
    try {
      const [gameParticipants, transferRecords] = await Promise.all([
        this.model.getGameParticipants(),
        this.model.getPlayerTransactions()
      ]);

      const transactions = this.model.transformTransactions(transferRecords);

      this.setState(prev => ({
        ...prev,
        roomPlayers: gameParticipants,
        transactions
      }));
    } catch (error) {
      console.error('刷新数据失败:', error);
      this.setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '刷新数据失败'
      }));
    }
  }

  /**
   * 切换到结算视图
   */
  handleSwitchToSettlement(): void {
    this.setState(prev => ({ ...prev, currentView: 'settlement' }));
  }

  /**
   * 切换回房间视图
   */
  handleSwitchToRoom(): void {
    this.setState(prev => ({ ...prev, currentView: 'room' }));
  }

  /**
   * 退出房间
   */
  handleExitRoom(): void {
    Taro.navigateTo({
      url: '/pages/index/index'
    });
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): { id: string; username: string; avatarUrl?: string } {
    const currentUser = this.model.getCurrentUser();
    return {
      id: currentUser.playerId,
      username: currentUser.username,
      avatarUrl: currentUser.avatarUrl
    };
  }

  /**
   * 获取玩家列表（用于转账模态框）
   */
  getPlayersForTransfer(): Array<{ id: string; username: string; avatarUrl?: string }> {
    console.log("roomPlayers", this.state.roomPlayers)
    console.log("roomPlayers length", this.state.roomPlayers.length)
    console.log("roomPlayers structure", this.state.roomPlayers[0])
    
    if (!this.state.roomPlayers || this.state.roomPlayers.length === 0) {
      console.log("No room players found")
      return []
    }
    
    return this.state.roomPlayers.map(player => {
      console.log("Processing player:", player)
      return {
        id: player.playerId,
        username: player.playerByPlayerId?.username || 'Unknown',
        avatarUrl: player.playerByPlayerId?.avatarUrl
      }
    });
  }

  /**
   * 获取当前状态
   */
  getState(): RoomState {
    return this.state;
  }

  /**
   * 检查是否正在加载
   */
  isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * 获取错误信息
   */
  getError(): string | null {
    return this.state.error;
  }

  /**
   * 清除错误
   */
  clearError(): void {
    this.setState(prev => ({ ...prev, error: null }));
  }
} 
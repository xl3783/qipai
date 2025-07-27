import { GameHistoryModel, GameHistoryRoom, GameHistoryStats } from '../models/GameHistoryModel';
import Taro from '@tarojs/taro';

export interface GameHistoryState {
  rooms: GameHistoryRoom[];
  stats: GameHistoryStats;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export class GameHistoryViewModel {
  private model: GameHistoryModel;
  private state: GameHistoryState;
  private setState: (state: GameHistoryState | ((prev: GameHistoryState) => GameHistoryState)) => void;

  constructor(
    model: GameHistoryModel,
    initialState: GameHistoryState,
    setState: (state: GameHistoryState | ((prev: GameHistoryState) => GameHistoryState)) => void
  ) {
    this.model = model;
    this.state = initialState;
    this.setState = setState;
  }

  /**
   * 初始化页面数据
   */
  async initialize(): Promise<void> {
    try {
      this.setState(prev => ({ ...prev, loading: true, error: null }));
      
      // 并行获取房间列表和统计数据
      const [rooms, stats] = await Promise.all([
        this.model.getUserRooms(),
        this.model.getGameStats()
      ]);

      this.setState(prev => ({
        ...prev,
        rooms,
        stats,
        loading: false
      }));
    } catch (error) {
      console.error('初始化失败:', error);
      this.setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '初始化失败'
      }));
    }
  }

  /**
   * 刷新数据
   */
  async refreshData(): Promise<void> {
    try {
      this.setState(prev => ({ ...prev, refreshing: true, error: null }));
      
      const [rooms, stats] = await Promise.all([
        this.model.getUserRooms(),
        this.model.getGameStats()
      ]);

      this.setState(prev => ({
        ...prev,
        rooms,
        stats,
        refreshing: false
      }));
    } catch (error) {
      console.error('刷新数据失败:', error);
      this.setState(prev => ({
        ...prev,
        refreshing: false,
        error: error instanceof Error ? error.message : '刷新失败'
      }));
    }
  }

  /**
   * 处理房间点击
   */
  handleRoomClick(room: GameHistoryRoom): void {
    if (room.status === 'playing' || room.status === 'waiting') {
      // 正在进行中的房间，进入房间页面
      Taro.navigateTo({
        url: `/pages/room/room?roomId=${room.id}&roomName=${encodeURIComponent(room.name)}`
      });
    } else if (room.status === 'finished') {
      // 已结束的房间，进入结算页面
      Taro.navigateTo({
        url: `/pages/settlement-demo/settlement-demo?roomId=${room.id}&roomName=${encodeURIComponent(room.name)}`
      });
    } else {
      // 已关闭的房间，显示提示
      Taro.showToast({
        title: '房间已取消',
        icon: 'none'
      });
    }
  }

  /**
   * 清除错误
   */
  clearError(): void {
    this.setState(prev => ({ ...prev, error: null }));
  }

  /**
   * 格式化时间
   */
  formatTime(dateString: string): string {
    const date = new Date(Number(dateString));
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }

  /**
   * 获取状态显示文本
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'waiting':
      case 'playing':
        return '进行中';
      case 'cancelled':
        return '已取消';
      case 'finished':
        return '已关闭';
      default:
        return '未知';
    }
  }

  /**
   * 获取状态样式类名
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'waiting':
      case 'playing':
        return 'active';
      case 'cancelled':
        return 'cancelled';
      case 'finished':
        return 'finished';
      default:
        return '';
    }
  }
} 
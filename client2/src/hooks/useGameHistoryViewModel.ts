import { useState, useEffect, useCallback } from 'react';
import { GameHistoryModel } from '../models/GameHistoryModel';
import { GameHistoryViewModel, GameHistoryState } from '../viewmodels/GameHistoryViewModel';
import { GameHistoryRoom } from '../models/GameHistoryModel';

export const useGameHistoryViewModel = () => {
  const [state, setState] = useState<GameHistoryState>({
    rooms: [],
    stats: {
      totalRooms: 0,
      activeRooms: 0,
      settledRooms: 0,
      totalAmount: 0,
      winRate: 0,
    },
    loading: false,
    error: null,
    refreshing: false,
  });

  const [viewModel] = useState(() => {
    const model = new GameHistoryModel();
    return new GameHistoryViewModel(model, state, setState);
  });

  // 初始化
  useEffect(() => {
    viewModel.initialize();
  }, []);

  // 创建事件处理函数
  const handleRoomClick = useCallback((room: GameHistoryRoom) => {
    viewModel.handleRoomClick(room);
  }, [viewModel]);

  const handleRefresh = useCallback(async () => {
    await viewModel.refreshData();
  }, [viewModel]);

  const clearError = useCallback(() => {
    viewModel.clearError();
  }, [viewModel]);

  const formatTime = useCallback((dateString: string) => {
    return viewModel.formatTime(dateString);
  }, [viewModel]);

  const getStatusText = useCallback((status: string) => {
    return viewModel.getStatusText(status);
  }, [viewModel]);

  const getStatusClass = useCallback((status: string) => {
    return viewModel.getStatusClass(status);
  }, [viewModel]);

  return {
    // 状态
    rooms: state.rooms,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,
    
    // 事件处理函数
    handleRoomClick,
    handleRefresh,
    clearError,
    formatTime,
    getStatusText,
    getStatusClass,
  };
}; 
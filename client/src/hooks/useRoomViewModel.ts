import { useState, useEffect, useCallback } from 'react';
import { RoomModel } from '../models/RoomModel';
import { RoomViewModel } from '../viewmodels/RoomViewModel';
import { RoomState, GameParticipant } from '../types/index';

export const useRoomViewModel = (roomId: string, roomName: string) => {
  const [state, setState] = useState<RoomState>({
    roomId,
    roomName,
    currentView: 'room',
    showProfileModal: false,
    showSpendingModal: false,
    showTransferModal: false,
    choosePlayerProfile: null,
    transactions: [],
    roomPlayers: [],
    loading: false,
    error: null,
  });

  const [viewModel] = useState(() => {
    const model = new RoomModel(roomId, roomName);
    return new RoomViewModel(model, state, setState);
  });

  // 初始化
  useEffect(() => {
    viewModel.initialize();
  }, [roomId]);

  // 创建事件处理函数
  const handleChoosePlayer = useCallback((player: GameParticipant) => {
    viewModel.handleChoosePlayer(player);
  }, [viewModel]);

  const handleCloseProfileModal = useCallback(() => {
    viewModel.handleCloseProfileModal();
  }, [viewModel]);

  const handleShowTransferModal = useCallback(() => {
    viewModel.handleShowTransferModal();
  }, [viewModel]);

  const handleCloseTransferModal = useCallback(() => {
    viewModel.handleCloseTransferModal();
  }, [viewModel]);

  const handleTransfer = useCallback(async (
    fromId: string, 
    toId: string, 
    amount: number, 
    description: string
  ) => {
    await viewModel.handleTransfer(fromId, toId, amount, description);
  }, [viewModel]);



  const handleExitRoom = useCallback(() => {
    viewModel.handleExitRoom();
  }, [viewModel]);

  const clearError = useCallback(() => {
    viewModel.clearError();
  }, [viewModel]);

  return {
    // 状态
    currentView: state.currentView,
    showProfileModal: state.showProfileModal,
    showSpendingModal: state.showSpendingModal,
    showTransferModal: state.showTransferModal,
    choosePlayerProfile: state.choosePlayerProfile,
    transactions: state.transactions,
    roomPlayers: state.roomPlayers,
    loading: state.loading,
    error: state.error,
    
    // 事件处理函数
    handleChoosePlayer,
    handleCloseProfileModal,
    handleShowTransferModal,
    handleCloseTransferModal,
    handleTransfer,
    handleExitRoom,
    clearError,
    
    // 获取数据的方法
    getCurrentUser: () => viewModel.getCurrentUser(),
    getPlayersForTransfer: () => viewModel.getPlayersForTransfer(),
    handleShareRoom: () => viewModel.handleShareRoom(),
  };
}; 
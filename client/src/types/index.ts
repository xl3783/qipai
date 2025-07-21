// 用户信息类型
export interface UserInfo {
  username: string;
  avatarUrl?: string;
  playerId: string;
}

// 微信用户信息类型
export interface WechatUserInfo {
  nickName: string;
  avatarUrl: string;
  gender: number;
  country: string;
  province: string;
  city: string;
  language: string;
}

// 游戏统计数据类型
export interface GameStats {
  totalPoints: number;
  wins: number;
  losses: number;
  winRate: string;
  friendRanking: number;
}

export interface LoginUser {
  id: string;
  role: string;
  nickname: string;
}


// 登录响应数据类型
export interface LoginResponse {
  token: string;
  user: LoginUser;
}

// API响应类型
export interface ApiResponse<T = any> {
  data: T;
  code: number;
  message: string;
}

// 页面状态类型
export interface IndexPageState {
  userInfo: UserInfo | null;
  gameStats: GameStats;
  showQRModal: boolean;
  isLoggingIn: boolean;
  loginData: LoginResponse | null;
  roomId: string;
}

// Room 页面相关类型
export interface GameParticipant {
  participationId: string;
  playerId: string;
  finalScore: number;
  playerByPlayerId: {
    username: string;
    avatarUrl?: string;
  };
}

export interface TransferRecord {
  nodeId: string;
  transferId: string;
  fromPlayerId: string;
  toPlayerId: string;
  playerByFromPlayerId: {
    username: string;
    avatarUrl?: string;
  };
  playerByToPlayerId: {
    username: string;
    avatarUrl?: string;
  };
  points: number;
}

export interface Transaction {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  fromPlayer: {
    username: string;
    avatarUrl?: string;
  };
  toPlayer: {
    username: string;
    avatarUrl?: string;
  };
  points: number;
}

export interface PlayerProfile {
  username: string;
  avatarUrl?: string;
  balance: number;
}

export interface RoomState {
  roomId: string;
  roomName: string;
  currentView: 'room' | 'settlement';
  showProfileModal: boolean;
  showSpendingModal: boolean;
  showTransferModal: boolean;
  choosePlayerProfile: PlayerProfile | null;
  transactions: Transaction[];
  roomPlayers: GameParticipant[];
  loading: boolean;
  error: string | null;
}

export interface CreateTransactionInput {
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  description: string;
  type: string;
  roomId: string;
}

// Export database types
export * from './database';
export * from './database-utils'; 
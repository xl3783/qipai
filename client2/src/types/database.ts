// Database types based on DDL schema

// Enums
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';

export type ParticipantStatus = 'active' | 'inactive' | 'left' | 'disconnected' | 'kicked';

export type TransferStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

// JWT Token type
export interface JwtToken {
  role: string;
  user_id: string;
  openid: string;
}

// Table interfaces
export interface Player {
  player_id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  phone?: string;
}

export interface Game {
  game_id: string;
  game_type: string;
  status: GameStatus;
  start_time: Date;
  end_time?: Date;
  max_players: number;
  min_players: number;
  created_at: Date;
  updated_at: Date;
}

export interface GameParticipant {
  participation_id: string;
  game_id: string;
  player_id: string;
  initial_score: number;
  final_score?: number;
  position?: number;
  status: ParticipantStatus;
  joined_at: Date;
  left_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TransferRecord {
  transfer_id: string;
  from_player_id: string;
  to_player_id: string;
  points: number;
  game_id?: string;
  description?: string;
  transfer_time: Date;
  from_transaction_id?: string;
  to_transaction_id?: string;
  status: TransferStatus;
  created_at: Date;
}

export interface Score {
  playerId: string;
  currentTotal: number;
  gamesPlayed: number;
  gamesWon: number;
  lastUpdated: Date;
  gamesLost: number;
}

// Extended interfaces with relationships
export interface GameWithParticipants extends Game {
  participants?: GameParticipant[];
}

export interface PlayerWithScore extends Player {
  score?: Score;
}

export interface GameParticipantWithPlayer extends GameParticipant {
  player?: Player;
}

export interface TransferRecordWithPlayers extends TransferRecord {
  from_player?: Player;
  to_player?: Player;
  game?: Game;
}

// Input types for mutations
export interface CreatePlayerInput {
  player_id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
}

export interface UpdatePlayerInput {
  username?: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
}

export interface CreateGameInput {
  game_type: string;
  max_players?: number;
  min_players?: number;
}

export interface UpdateGameInput {
  status?: GameStatus;
  end_time?: Date;
  max_players?: number;
  min_players?: number;
}

export interface CreateGameParticipantInput {
  game_id: string;
  player_id: string;
  initial_score?: number;
  position?: number;
}

export interface UpdateGameParticipantInput {
  final_score?: number;
  status?: ParticipantStatus;
  left_at?: Date;
}

export interface CreateTransferRecordInput {
  from_player_id: string;
  to_player_id: string;
  points: number;
  game_id?: string;
  description?: string;
  from_transaction_id?: string;
  to_transaction_id?: string;
}

export interface UpdateTransferRecordInput {
  status?: TransferStatus;
  from_transaction_id?: string;
  to_transaction_id?: string;
}

export interface CreateScoreInput {
  player_id: string;
  current_total?: number;
  games_played?: number;
  games_won?: number;
  games_lost?: number;
}

export interface UpdateScoreInput {
  current_total?: number;
  games_played?: number;
  games_won?: number;
  games_lost?: number;
}

// Query result types
export interface GameStats {
  total_games: number;
  active_games: number;
  finished_games: number;
  average_players_per_game: number;
}

export interface PlayerStats {
  player_id: string;
  username: string;
  total_games: number;
  games_won: number;
  games_lost: number;
  win_rate: number;
  current_score: number;
  total_points_transferred_in: number;
  total_points_transferred_out: number;
}

export interface GameHistory {
  game_id: string;
  game_type: string;
  status: GameStatus;
  start_time: Date;
  end_time?: Date;
  participants: GameParticipantWithPlayer[];
  total_transfers: number;
  total_points_transferred: number;
}

// Filter and sort types
export interface GameFilter {
  status?: GameStatus;
  game_type?: string;
  start_time_from?: Date;
  start_time_to?: Date;
  min_players?: number;
  max_players?: number;
}

export interface PlayerFilter {
  username?: string;
  email?: string;
  phone?: string;
}

export interface TransferFilter {
  from_player_id?: string;
  to_player_id?: string;
  game_id?: string;
  status?: TransferStatus;
  transfer_time_from?: Date;
  transfer_time_to?: Date;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Pagination
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
} 
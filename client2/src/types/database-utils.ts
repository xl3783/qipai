import {
  Player,
  Game,
  GameParticipant,
  TransferRecord,
  Score,
  GameStatus,
  ParticipantStatus,
  TransferStatus,
  PaginationOptions,
  PaginatedResult
} from './database';

// Database operation result types
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
}

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

// Transaction types
export interface Transaction {
  id: string;
  status: 'pending' | 'committed' | 'rolled_back';
  createdAt: Date;
}

// Database connection types
export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

// Query builder types
export interface WhereClause {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface OrderByClause {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface SelectOptions {
  fields?: string[];
  where?: WhereClause[];
  orderBy?: OrderByClause[];
  limit?: number;
  offset?: number;
  groupBy?: string[];
  having?: WhereClause[];
}

// Repository pattern types
export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findOne(options: SelectOptions): Promise<T | null>;
  findMany(options: SelectOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(options?: SelectOptions): Promise<number>;
}

// Specific repository interfaces
export interface PlayerRepository extends Repository<Player> {
  findByUsername(username: string): Promise<Player | null>;
  findByEmail(email: string): Promise<Player | null>;
  findByPhone(phone: string): Promise<Player | null>;
  getPlayersWithScore(): Promise<(Player & { score: Score })[]>;
}

export interface GameRepository extends Repository<Game> {
  findActiveGames(): Promise<Game[]>;
  findGamesByStatus(status: GameStatus): Promise<Game[]>;
  findGamesByType(gameType: string): Promise<Game[]>;
  findGamesByDateRange(startDate: Date, endDate: Date): Promise<Game[]>;
  getGameWithParticipants(gameId: string): Promise<(Game & { participants: GameParticipant[] }) | null>;
}

export interface GameParticipantRepository extends Repository<GameParticipant> {
  findParticipantsByGame(gameId: string): Promise<GameParticipant[]>;
  findGamesByPlayer(playerId: string): Promise<GameParticipant[]>;
  findActiveParticipantsByGame(gameId: string): Promise<GameParticipant[]>;
  updateParticipantStatus(participationId: string, status: ParticipantStatus): Promise<GameParticipant | null>;
}

export interface TransferRecordRepository extends Repository<TransferRecord> {
  findTransfersByGame(gameId: string): Promise<TransferRecord[]>;
  findTransfersByPlayer(playerId: string): Promise<TransferRecord[]>;
  findTransfersByDateRange(startDate: Date, endDate: Date): Promise<TransferRecord[]>;
  findTransfersByStatus(status: TransferStatus): Promise<TransferRecord[]>;
  getTransferStats(playerId: string): Promise<{
    totalTransferredIn: number;
    totalTransferredOut: number;
    transferCount: number;
  }>;
}

export interface ScoreRepository extends Repository<Score> {
  updateScore(playerId: string, points: number): Promise<Score | null>;
  getTopPlayers(limit: number): Promise<Score[]>;
  getPlayerRanking(playerId: string): Promise<number>;
}

// Service layer types
export interface GameService {
  createGame(gameData: Partial<Game>): Promise<Game>;
  joinGame(gameId: string, playerId: string, initialScore?: number): Promise<GameParticipant>;
  leaveGame(gameId: string, playerId: string): Promise<GameParticipant | null>;
  startGame(gameId: string): Promise<Game>;
  endGame(gameId: string): Promise<Game>;
  cancelGame(gameId: string): Promise<Game>;
  getGameStats(): Promise<{
    totalGames: number;
    activeGames: number;
    finishedGames: number;
    averagePlayersPerGame: number;
  }>;
}

export interface TransferService {
  createTransfer(transferData: Partial<TransferRecord>): Promise<TransferRecord>;
  processTransfer(transferId: string): Promise<TransferRecord>;
  cancelTransfer(transferId: string): Promise<TransferRecord>;
  getTransferHistory(playerId: string, options?: PaginationOptions): Promise<PaginatedResult<TransferRecord>>;
  getGameTransferHistory(gameId: string): Promise<TransferRecord[]>;
}

export interface PlayerService {
  createPlayer(playerData: Partial<Player>): Promise<Player>;
  updatePlayer(playerId: string, playerData: Partial<Player>): Promise<Player | null>;
  getPlayerStats(playerId: string): Promise<{
    player: Player;
    score: Score;
    gameStats: {
      totalGames: number;
      gamesWon: number;
      gamesLost: number;
      winRate: number;
    };
    transferStats: {
      totalTransferredIn: number;
      totalTransferredOut: number;
    };
  }>;
  getTopPlayers(limit: number): Promise<(Player & { score: Score })[]>;
}

// Event types for real-time updates
export interface DatabaseEvent<T> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: T;
  timestamp: Date;
}

export interface GameEvent extends DatabaseEvent<Game> {
  table: 'games';
}

export interface TransferEvent extends DatabaseEvent<TransferRecord> {
  table: 'transfer_records';
}

export interface ParticipantEvent extends DatabaseEvent<GameParticipant> {
  table: 'game_participants';
}

// WebSocket message types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  gameId?: string;
  playerId?: string;
}

export interface GameUpdateMessage extends WebSocketMessage<Game> {
  type: 'GAME_UPDATE';
}

export interface TransferMessage extends WebSocketMessage<TransferRecord> {
  type: 'TRANSFER';
}

export interface ParticipantUpdateMessage extends WebSocketMessage<GameParticipant> {
  type: 'PARTICIPANT_UPDATE';
}

// Cache types
export interface CacheOptions {
  ttl: number; // Time to live in seconds
  key: string;
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Database migration types
export interface Migration {
  version: number;
  name: string;
  up: string;
  down: string;
  createdAt: Date;
}

export interface MigrationResult {
  success: boolean;
  version: number;
  message: string;
  error?: string;
} 
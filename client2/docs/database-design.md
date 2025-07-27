# 游戏记账系统数据库设计

## 概述
本文档描述了游戏记账小程序的数据库设计，采用关系型数据库设计思路，可适配MySQL、PostgreSQL等数据库。

## 数据库表结构

### 1. 用户表 (users)
存储用户基本信息

```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    balance DECIMAL(10,2) DEFAULT 0.00,
    is_host BOOLEAN DEFAULT FALSE,
    status ENUM('ACTIVE', 'INACTIVE', 'BANNED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
);
```

### 2. 房间表 (rooms)
存储游戏房间信息

```sql
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    host_id VARCHAR(50) NOT NULL,
    room_code VARCHAR(20) UNIQUE,
    max_players INT DEFAULT 20,
    status ENUM('ACTIVE', 'SETTLED', 'CLOSED') DEFAULT 'ACTIVE',
    settings JSON, -- 房间设置(如是否允许透支等)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_host_id (host_id),
    INDEX idx_status (status),
    INDEX idx_room_code (room_code),
    INDEX idx_created_at (created_at)
);
```

### 3. 房间成员表 (room_members)
存储房间成员关系

```sql
CREATE TABLE room_members (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    nickname VARCHAR(100), -- 房间内昵称
    role ENUM('HOST', 'MEMBER', 'OBSERVER') DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_room_user (room_id, user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_user_id (user_id)
);
```

### 4. 交易记录表 (transactions)
存储所有交易记录

```sql
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    from_player_id VARCHAR(50) NOT NULL,
    to_player_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    type ENUM('TRANSFER', 'EXPENSE', 'SETTLEMENT', 'ADJUSTMENT') NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'COMPLETED',
    metadata JSON, -- 额外信息(如游戏轮次、时间戳等)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (from_player_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_player_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_room_id (room_id),
    INDEX idx_from_player (from_player_id),
    INDEX idx_to_player (to_player_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);
```

### 5. 游戏统计表 (game_stats)
存储用户游戏统计数据

```sql
CREATE TABLE game_stats (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    total_games INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    draws INT DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    total_points DECIMAL(10,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    total_losses DECIMAL(10,2) DEFAULT 0.00,
    friend_ranking INT DEFAULT 0,
    last_game_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_stats (user_id),
    INDEX idx_total_points (total_points),
    INDEX idx_win_rate (win_rate)
);
```

### 6. 结算结果表 (settlement_results)
存储房间结算结果

```sql
CREATE TABLE settlement_results (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    final_balance DECIMAL(10,2) NOT NULL,
    total_transferred DECIMAL(10,2) DEFAULT 0.00,
    total_received DECIMAL(10,2) DEFAULT 0.00,
    settlement_rank INT,
    is_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_room_user_settlement (room_id, user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_user_id (user_id),
    INDEX idx_final_balance (final_balance)
);
```

### 7. 系统配置表 (system_configs)
存储系统配置信息

```sql
CREATE TABLE system_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    description VARCHAR(500),
    config_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_config_key (config_key)
);
```

## 数据关系说明

### 主要关系
1. **用户 ↔ 房间**: 多对多关系，通过 `room_members` 表关联
2. **房间 ↔ 交易**: 一对多关系，一个房间可以有多个交易记录
3. **用户 ↔ 交易**: 多对多关系，用户可以作为付款人或收款人参与多个交易
4. **用户 ↔ 游戏统计**: 一对一关系，每个用户对应一条统计记录
5. **房间 ↔ 结算结果**: 一对多关系，一个房间结算后产生多个用户的结算结果

### 数据完整性约束
1. 所有外键都设置了级联删除或更新
2. 用户余额不允许为负数（可在应用层或数据库层控制）
3. 交易金额必须大于0
4. 房间成员在同一房间内不能重复
5. 结算结果在同一房间内每个用户只能有一条记录

## 索引策略

### 主要查询场景及对应索引
1. **按房间查询交易记录**: `idx_room_id` (transactions)
2. **按用户查询交易历史**: `idx_from_player`, `idx_to_player` (transactions)
3. **用户排行榜查询**: `idx_total_points`, `idx_win_rate` (game_stats)
4. **活跃房间查询**: `idx_status` (rooms)
5. **房间成员查询**: `idx_room_id`, `idx_user_id` (room_members)

## 数据备份与维护

### 备份策略
1. 每日增量备份交易数据
2. 每周全量备份所有数据
3. 重要操作前实时备份

### 数据清理
1. 定期清理已关闭超过6个月的房间数据
2. 归档历史交易记录
3. 清理未激活的用户账户

## 性能优化建议

1. **分表策略**: 交易表按时间分表（月度分表）
2. **读写分离**: 统计查询使用只读副本
3. **缓存策略**: 
   - 用户基本信息缓存
   - 房间状态缓存
   - 实时余额计算结果缓存
4. **批量操作**: 批量插入交易记录以提高性能 
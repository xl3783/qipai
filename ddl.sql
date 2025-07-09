-- 玩家表
CREATE TABLE players (
                         player_id BIGSERIAL PRIMARY KEY,
                         username VARCHAR(100) NOT NULL UNIQUE,
                         created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 游戏对局表
CREATE TABLE games (
                       game_id BIGSERIAL PRIMARY KEY,
                       game_type VARCHAR(50) NOT NULL,
                       start_time TIMESTAMPTZ DEFAULT NOW(),
                       end_time TIMESTAMPTZ
);

-- 积分事务表（核心变动记录）
CREATE TABLE score_transactions (
                                    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    player_id BIGINT NOT NULL REFERENCES players(player_id),
                                    game_id BIGINT REFERENCES games(game_id),
                                    points_change INTEGER NOT NULL CHECK (points_change != 0),
    current_total INTEGER NOT NULL,
    event_time TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (event_time);

-- 创建分区表（按月分区）
-- CREATE TABLE score_transactions_2024_01 PARTITION OF score_transactions
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
-- CREATE TABLE score_transactions_2024_02 PARTITION OF score_transactions
--     FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- 可以继续添加更多分区...

-- 当前总分表
CREATE TABLE scores (
                        player_id BIGINT PRIMARY KEY REFERENCES players(player_id),
                        current_total INTEGER NOT NULL DEFAULT 0 CHECK (current_total >= 0),
                        last_updated TIMESTAMPTZ DEFAULT NOW()
);


-- 游戏参与者表
CREATE TABLE game_participants (
                                   participation_id BIGSERIAL PRIMARY KEY,
                                   game_id BIGINT NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
                                   player_id BIGINT NOT NULL REFERENCES players(player_id),
                                   initial_score INTEGER NOT NULL DEFAULT 0,
                                   final_score INTEGER,
                                   position SMALLINT, -- 玩家在游戏中的位置/座位号
                                   created_at TIMESTAMPTZ DEFAULT NOW(),
                                   updated_at TIMESTAMPTZ DEFAULT NOW(),

                                   CONSTRAINT unique_game_player UNIQUE (game_id, player_id)
);

-- 创建索引以加速查询
CREATE INDEX idx_score_transactions_player_id ON score_transactions(player_id);
CREATE INDEX idx_score_transactions_game_id ON score_transactions(game_id);
CREATE INDEX idx_score_transactions_event_time ON score_transactions(event_time);
CREATE INDEX idx_game_participants_game_id ON game_participants(game_id);
CREATE INDEX idx_game_participants_player_id ON game_participants(player_id);
CREATE INDEX idx_games_start_time ON games(start_time);
CREATE INDEX idx_games_end_time ON games(end_time);
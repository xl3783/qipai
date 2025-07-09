-- ========================================
-- 棋牌游戏数据库 - PostgreSQL 完整版本
-- ========================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 创建自定义类型
CREATE TYPE game_status AS ENUM ('waiting', 'playing', 'finished', 'cancelled');
CREATE TYPE participant_status AS ENUM ('active', 'inactive', 'left', 'disconnected', 'kicked');

-- 玩家表
CREATE TABLE players (
    player_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 游戏对局表
CREATE TABLE games (
    game_id BIGSERIAL PRIMARY KEY,
    game_type VARCHAR(50) NOT NULL,
    status game_status DEFAULT 'waiting',
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    max_players SMALLINT DEFAULT 4,
    min_players SMALLINT DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 积分事务表（核心变动记录）
CREATE TABLE score_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    game_id BIGINT REFERENCES games(game_id),
    points_change INTEGER NOT NULL CHECK (points_change != 0),
    current_total INTEGER NOT NULL,
    transaction_type VARCHAR(50) DEFAULT 'game',
    related_player_id BIGINT REFERENCES players(player_id), -- 关联的另一个玩家（用于积分转移）
    description TEXT,
    event_time TIMESTAMPTZ DEFAULT NOW()
);

-- 积分转移记录表（用于房间广播）
CREATE TABLE transfer_records (
    transfer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_player_id BIGINT NOT NULL REFERENCES players(player_id),
    to_player_id BIGINT NOT NULL REFERENCES players(player_id),
    points INTEGER NOT NULL CHECK (points > 0),
    game_id BIGINT REFERENCES games(game_id),
    description TEXT,
    transfer_time TIMESTAMPTZ DEFAULT NOW(),
    from_transaction_id UUID REFERENCES score_transactions(transaction_id),
    to_transaction_id UUID REFERENCES score_transactions(transaction_id),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 当前总分表
CREATE TABLE scores (
    player_id BIGINT PRIMARY KEY REFERENCES players(player_id),
    current_total INTEGER NOT NULL DEFAULT 0, -- 移除 CHECK (current_total >= 0) 约束，允许负数
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
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
    status participant_status DEFAULT 'active', -- 参与者状态
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_game_player UNIQUE (game_id, player_id)
);

-- 创建索引以加速查询
CREATE INDEX idx_score_transactions_player_id ON score_transactions(player_id);
CREATE INDEX idx_score_transactions_game_id ON score_transactions(game_id);
CREATE INDEX idx_score_transactions_event_time ON score_transactions(event_time);
CREATE INDEX idx_score_transactions_type ON score_transactions(transaction_type);
CREATE INDEX idx_score_transactions_related_player ON score_transactions(related_player_id);
CREATE INDEX idx_transfer_records_from_player ON transfer_records(from_player_id);
CREATE INDEX idx_transfer_records_to_player ON transfer_records(to_player_id);
CREATE INDEX idx_transfer_records_game_id ON transfer_records(game_id);
CREATE INDEX idx_transfer_records_transfer_time ON transfer_records(transfer_time);
CREATE INDEX idx_transfer_records_status ON transfer_records(status);
CREATE INDEX idx_game_participants_game_id ON game_participants(game_id);
CREATE INDEX idx_game_participants_player_id ON game_participants(player_id);
CREATE INDEX idx_game_participants_status ON game_participants(status);
CREATE INDEX idx_games_start_time ON games(start_time);
CREATE INDEX idx_games_end_time ON games(end_time);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_email ON players(email);

-- 创建复合索引
CREATE INDEX idx_game_participants_game_position ON game_participants(game_id, position);
CREATE INDEX idx_game_participants_game_status ON game_participants(game_id, status);
CREATE INDEX idx_game_participants_player_status ON game_participants(player_id, status);
CREATE INDEX idx_score_transactions_player_time ON score_transactions(player_id, event_time);
CREATE INDEX idx_transfer_records_game_time ON transfer_records(game_id, transfer_time);

-- 外键约束
ALTER TABLE game_participants
    ADD CONSTRAINT fk_game_participants_game_id 
        FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_game_participants_player_id 
        FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE;

-- 游戏状态检查约束
ALTER TABLE games
    ADD CONSTRAINT valid_game_time CHECK (end_time IS NULL OR end_time >= start_time),
    ADD CONSTRAINT valid_player_count CHECK (max_players >= min_players AND min_players >= 2);

-- 参与者得分验证约束
ALTER TABLE game_participants
    ADD CONSTRAINT valid_final_score CHECK (
        final_score IS NULL OR final_score >= 0
    );

-- 创建游戏房间
CREATE OR REPLACE FUNCTION create_game_room() RETURNS BIGINT AS $$
DECLARE
    p_id BIGINT;
    current_user_id BIGINT;
BEGIN
    -- 从JWT token中获取用户ID
    current_user_id := (current_setting('request.jwt.claims', true)::json->>'user_id')::BIGINT;
    
    -- 检查是否成功获取到用户ID
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID not found in JWT token';
    END IF;

    -- 检查玩家是否存在
    IF NOT EXISTS (SELECT 1 FROM players WHERE player_id = current_user_id) THEN
        RAISE EXCEPTION 'Player with ID % does not exist', current_user_id;
    END IF;

    -- 检查玩家是否已经参与游戏
    IF EXISTS (SELECT 1 FROM game_participants WHERE player_id = current_user_id AND status = 'active') THEN
        RAISE EXCEPTION 'Player % is already participating in a game', current_user_id;
    END IF;

    -- 创建游戏
    INSERT INTO games ( game_type, status, max_players, min_players)
    VALUES ('自定义', 'waiting', 30, 2)
    RETURNING game_id INTO p_id;

    -- 加入游戏
    PERFORM join_game(p_id, current_user_id, 1);

    RETURN p_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create game: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 加入游戏函数
CREATE OR REPLACE FUNCTION join_game(
    p_game_id BIGINT,
    p_player_id BIGINT,
    p_position SMALLINT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
    cur_score INTEGER;
    p_id BIGINT;
    game_status_val game_status;
    current_players INTEGER;
    max_players_val INTEGER;
BEGIN
    -- 检查游戏是否存在
    SELECT status INTO game_status_val
    FROM games 
    WHERE game_id = p_game_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Game with ID % does not exist', p_game_id;
    END IF;
    
    -- 检查游戏状态是否允许加入（明确列出不允许的状态）
    IF game_status_val IN ('playing', 'finished', 'cancelled') THEN
        RAISE EXCEPTION 'Game % is not accepting new players (status: %)', p_game_id, game_status_val;
    END IF;
    
    -- 检查玩家是否存在
    IF NOT EXISTS (SELECT 1 FROM players WHERE player_id = p_player_id) THEN
        RAISE EXCEPTION 'Player with ID % does not exist', p_player_id;
    END IF;
    
    -- 检查玩家是否已经参与该游戏
    IF EXISTS (SELECT 1 FROM game_participants WHERE game_id = p_game_id AND player_id = p_player_id AND status = 'active') THEN
        RAISE EXCEPTION 'Player % is already participating in game %', p_player_id, p_game_id;
    END IF;
    
    -- 检查游戏是否已满（只计算活跃状态的参与者）
    SELECT COUNT(*) INTO current_players
    FROM game_participants 
    WHERE game_id = p_game_id AND status = 'active';
    
    SELECT max_players INTO max_players_val
    FROM games 
    WHERE game_id = p_game_id;
    
    IF current_players >= max_players_val THEN
        RAISE EXCEPTION 'Game % is full (max players: %)', p_game_id, max_players_val;
    END IF;
    
    -- 获取玩家当前积分
    SELECT current_total INTO cur_score
    FROM scores
    WHERE player_id = p_player_id
    FOR UPDATE;

    -- 不存在积分则初始化
    IF NOT FOUND THEN
        INSERT INTO scores(player_id, current_total)
        VALUES (p_player_id, 0)
        RETURNING current_total INTO cur_score;
    END IF;

    cur_score=0;

    -- 记录参与者
    INSERT INTO game_participants (game_id, player_id, initial_score, position)
    VALUES (p_game_id, p_player_id, cur_score, p_position)
    RETURNING participation_id INTO p_id;

    RETURN p_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to join game: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 更新玩家积分函数
CREATE OR REPLACE FUNCTION update_player_score(
    p_player_id BIGINT,
    p_game_id BIGINT,
    p_points_change INTEGER,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    transaction_uuid UUID;
    new_total INTEGER;
BEGIN
    -- 验证积分变化不为0
    IF p_points_change = 0 THEN
        RAISE EXCEPTION 'Points change cannot be zero';
    END IF;
    
    -- 更新玩家总分
    UPDATE scores 
    SET current_total = current_total + p_points_change,
        last_updated = NOW()
    WHERE player_id = p_player_id
    RETURNING current_total INTO new_total;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Player with ID % does not exist', p_player_id;
    END IF;
    
    -- 记录交易
    INSERT INTO score_transactions (
        player_id, 
        game_id, 
        points_change, 
        current_total, 
        description
    ) VALUES (
        p_player_id, 
        p_game_id, 
        p_points_change, 
        new_total, 
        p_description
    ) RETURNING transaction_id INTO transaction_uuid;
    
    RETURN transaction_uuid;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to update player score: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 玩家间积分转移函数
CREATE OR REPLACE FUNCTION transfer_points_between_players(
    p_from_player_id BIGINT,
    p_to_player_id BIGINT,
    p_points INTEGER,
    p_game_id BIGINT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    from_player_total INTEGER;
    to_player_total INTEGER;
    from_transaction_id UUID;
    to_transaction_id UUID;
    transfer_record_id UUID;
    result JSONB;
BEGIN
    -- 验证参数
    IF p_points <= 0 THEN
        RAISE EXCEPTION 'Transfer points must be positive';
    END IF;
    
    IF p_from_player_id = p_to_player_id THEN
        RAISE EXCEPTION 'Cannot transfer points to the same player';
    END IF;

    -- 检查游戏是否存在
    IF NOT EXISTS (SELECT 1 FROM games WHERE game_id = p_game_id AND status = 'playing') THEN
        RAISE EXCEPTION 'Game with ID % is not playing', p_game_id;
    END IF;

    -- 玩家必须在一个激活的游戏中
    IF NOT EXISTS (SELECT 1 FROM game_participants WHERE game_id = p_game_id AND player_id = p_from_player_id AND status = 'active') THEN
        RAISE EXCEPTION 'Player % is not participating in an active game', p_from_player_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM game_participants WHERE game_id = p_game_id AND player_id = p_to_player_id AND status = 'active') THEN
        RAISE EXCEPTION 'Player % is not participating in an active game', p_to_player_id;
    END IF;
    
    -- 检查玩家是否存在
    IF NOT EXISTS (SELECT 1 FROM players WHERE player_id = p_from_player_id) THEN
        RAISE EXCEPTION 'From player with ID % does not exist', p_from_player_id;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM players WHERE player_id = p_to_player_id) THEN
        RAISE EXCEPTION 'To player with ID % does not exist', p_to_player_id;
    END IF;
    
    -- -- 检查转出玩家积分是否足够（移除负数限制）
    -- SELECT current_total INTO from_player_total
    -- FROM scores
    -- WHERE player_id = p_from_player_id
    -- FOR UPDATE;
    
    IF NOT FOUND THEN
        -- 初始化转出玩家积分
        INSERT INTO scores(player_id, current_total)
        VALUES (p_from_player_id, 0)
        RETURNING current_total INTO from_player_total;
    END IF;
    
    -- 移除积分充足性检查，允许负积分转移
    -- IF from_player_total < p_points THEN
    --     RAISE EXCEPTION 'Player % does not have enough points (current: %, required: %)', 
    --         p_from_player_id, from_player_total, p_points;
    -- END IF;
    
    -- 获取接收玩家积分
    SELECT current_total INTO to_player_total
    FROM scores
    WHERE player_id = p_to_player_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        -- 初始化接收玩家积分
        INSERT INTO scores(player_id, current_total)
        VALUES (p_to_player_id, 0)
        RETURNING current_total INTO to_player_total;
    END IF;

    -- 更新转出玩家积分
    UPDATE game_participants
    SET initial_score = initial_score - p_points
    WHERE game_id = p_game_id AND player_id = p_from_player_id
    AND status = 'active';

    -- 更新接收玩家积分
    UPDATE game_participants
    SET initial_score = initial_score + p_points
    WHERE game_id = p_game_id AND player_id = p_to_player_id
    AND status = 'active';
    
    -- 执行积分转移（使用事务确保一致性）
    -- 扣除转出玩家积分
    UPDATE scores 
    SET current_total = current_total - p_points,
        last_updated = NOW()
    WHERE player_id = p_from_player_id;
    
    -- 增加接收玩家积分
    UPDATE scores 
    SET current_total = current_total + p_points,
        last_updated = NOW()
    WHERE player_id = p_to_player_id;
    
    -- 记录转出交易
    INSERT INTO score_transactions (
        player_id, 
        game_id, 
        points_change, 
        current_total, 
        transaction_type,
        related_player_id,
        description
    ) VALUES (
        p_from_player_id, 
        p_game_id, 
        -p_points, 
        from_player_total - p_points, 
        'transfer_out',
        p_to_player_id,
        COALESCE(p_description, 'Transfer to player ' || p_to_player_id)
    ) RETURNING transaction_id INTO from_transaction_id;
    
    -- 记录接收交易
    INSERT INTO score_transactions (
        player_id, 
        game_id, 
        points_change, 
        current_total, 
        transaction_type,
        related_player_id,
        description
    ) VALUES (
        p_to_player_id, 
        p_game_id, 
        p_points, 
        to_player_total + p_points, 
        'transfer_in',
        p_from_player_id,
        COALESCE(p_description, 'Transfer from player ' || p_from_player_id)
    ) RETURNING transaction_id INTO to_transaction_id;
    
    -- 创建转移记录（用于房间广播）
    INSERT INTO transfer_records (
        from_player_id,
        to_player_id,
        points,
        game_id,
        description,
        from_transaction_id,
        to_transaction_id
    ) VALUES (
        p_from_player_id,
        p_to_player_id,
        p_points,
        p_game_id,
        p_description,
        from_transaction_id,
        to_transaction_id
    ) RETURNING transfer_id INTO transfer_record_id;
    
    -- 返回结果
    result := jsonb_build_object(
        'success', true,
        'transfer_id', transfer_record_id,
        'from_player_id', p_from_player_id,
        'to_player_id', p_to_player_id,
        'points_transferred', p_points,
        'from_player_new_total', from_player_total - p_points,
        'to_player_new_total', to_player_total + p_points,
        'from_transaction_id', from_transaction_id,
        'to_transaction_id', to_transaction_id,
        'game_id', p_game_id,
        'description', p_description,
        'transfer_time', NOW()
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to transfer points: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 结束游戏函数
CREATE OR REPLACE FUNCTION end_game(p_game_id BIGINT) RETURNS VOID AS $$
DECLARE
    game_record RECORD;
BEGIN
    -- 获取游戏信息
    SELECT * INTO game_record
    FROM games 
    WHERE game_id = p_game_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Game with ID % does not exist', p_game_id;
    END IF;
    
    IF game_record.status = 'finished' THEN
        RAISE EXCEPTION 'Game % is already finished', p_game_id;
    END IF;
    
    -- 更新游戏状态
    UPDATE games 
    SET status = 'finished',
        end_time = NOW(),
        updated_at = NOW()
    WHERE game_id = p_game_id;
    
    -- 更新玩家游戏统计
    UPDATE scores 
    SET games_played = games_played + 1
    WHERE player_id IN (
        SELECT player_id 
        FROM game_participants 
        WHERE game_id = p_game_id
    );

    -- 更新参与者状态
    UPDATE game_participants
    SET status = 'left',
        left_at = NOW()
    WHERE game_id = p_game_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to end game: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 更新参与者状态函数
CREATE OR REPLACE FUNCTION update_participant_status(
    p_game_id BIGINT,
    p_player_id BIGINT,
    p_status participant_status,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_status participant_status;
BEGIN
    -- 检查参与者是否存在
    SELECT status INTO current_status
    FROM game_participants
    WHERE game_id = p_game_id AND player_id = p_player_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Participant not found in game % for player %', p_game_id, p_player_id;
    END IF;
    
    -- 如果状态相同，无需更新
    IF current_status = p_status THEN
        RETURN FALSE;
    END IF;
    
    -- 更新参与者状态
    UPDATE game_participants
    SET status = p_status,
        left_at = CASE WHEN p_status IN ('left', 'disconnected', 'kicked') THEN NOW() ELSE left_at END,
        updated_at = NOW()
    WHERE game_id = p_game_id AND player_id = p_player_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to update participant status: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 离开游戏函数
CREATE OR REPLACE FUNCTION leave_game(
    p_game_id BIGINT,
    p_player_id BIGINT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN update_participant_status(p_game_id, p_player_id, 'left', 'Player left the game');
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to leave game: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 踢出玩家函数
CREATE OR REPLACE FUNCTION kick_player(
    p_game_id BIGINT,
    p_player_id BIGINT,
    p_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN update_participant_status(p_game_id, p_player_id, 'kicked', COALESCE(p_reason, 'Player was kicked from the game'));
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to kick player: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 重新加入游戏函数
CREATE OR REPLACE FUNCTION rejoin_game(
    p_game_id BIGINT,
    p_player_id BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
    game_status_val game_status;
    current_players INTEGER;
    max_players_val INTEGER;
BEGIN
    -- 检查游戏状态
    SELECT status INTO game_status_val
    FROM games 
    WHERE game_id = p_game_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Game with ID % does not exist', p_game_id;
    END IF;
    
    IF game_status_val IN ('finished', 'cancelled') THEN
        RAISE EXCEPTION 'Game % is not accepting players (status: %)', p_game_id, game_status_val;
    END IF;
    
    -- 检查游戏是否已满（只计算活跃状态的参与者）
    SELECT COUNT(*) INTO current_players
    FROM game_participants 
    WHERE game_id = p_game_id AND status = 'active';
    
    SELECT max_players INTO max_players_val
    FROM games 
    WHERE game_id = p_game_id;
    
    IF current_players >= max_players_val THEN
        RAISE EXCEPTION 'Game % is full (max players: %)', p_game_id, max_players_val;
    END IF;
    
    -- 更新参与者状态为活跃
    RETURN update_participant_status(p_game_id, p_player_id, 'active', 'Player rejoined the game');
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to rejoin game: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 通知函数
CREATE OR REPLACE FUNCTION notify_participant_update()
RETURNS TRIGGER AS $$
DECLARE
    notification_data JSONB;
BEGIN
    notification_data := jsonb_build_object(
        'type', 'participant',
        'game_id', COALESCE(NEW.game_id, OLD.game_id),
        'player_id', COALESCE(NEW.player_id, OLD.player_id),
        'action', CASE
            WHEN TG_OP = 'INSERT' THEN 'join'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'leave'
        END,
        'timestamp', NOW()
    );
    
    PERFORM pg_notify('game_update', notification_data::text);
    
    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- 记录错误但不中断操作
        RAISE WARNING 'Failed to send notification: %', SQLERRM;
        RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS participant_update_notify ON game_participants;
CREATE TRIGGER participant_update_notify
    AFTER INSERT OR UPDATE OR DELETE ON game_participants
    FOR EACH ROW EXECUTE FUNCTION notify_participant_update();

-- 积分转移记录触发器函数
CREATE OR REPLACE FUNCTION log_score_transfer()
RETURNS TRIGGER AS $$
DECLARE
    transfer_record JSONB;
    notification_data JSONB;
BEGIN
    -- 只处理积分转移相关的交易
    IF NEW.transaction_type IN ('transfer_in', 'transfer_out') AND NEW.related_player_id IS NOT NULL THEN
        -- 创建转移记录
        transfer_record := jsonb_build_object(
            'transfer_id', NEW.transaction_id,
            'from_player_id', CASE 
                WHEN NEW.transaction_type = 'transfer_out' THEN NEW.player_id 
                ELSE NEW.related_player_id 
            END,
            'to_player_id', CASE 
                WHEN NEW.transaction_type = 'transfer_in' THEN NEW.player_id 
                ELSE NEW.related_player_id 
            END,
            'points', ABS(NEW.points_change),
            'game_id', NEW.game_id,
            'description', NEW.description,
            'transfer_time', NEW.event_time,
            'transaction_type', NEW.transaction_type
        );
        
        -- 发送转移通知
        notification_data := jsonb_build_object(
            'type', 'score_transfer',
            'transfer_data', transfer_record,
            'timestamp', NOW()
        );
        
        PERFORM pg_notify('score_transfer', notification_data::text);
        
        -- 记录到日志表（可选）
        -- INSERT INTO transfer_logs (transfer_data) VALUES (transfer_record);
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 记录错误但不中断操作
        RAISE WARNING 'Failed to log score transfer: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建积分转移触发器
DROP TRIGGER IF EXISTS score_transfer_log ON score_transactions;
CREATE TRIGGER score_transfer_log
    AFTER INSERT ON score_transactions
    FOR EACH ROW EXECUTE FUNCTION log_score_transfer();

-- 积分变动通知触发器函数
CREATE OR REPLACE FUNCTION notify_score_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_data JSONB;
BEGIN
    notification_data := jsonb_build_object(
        'type', 'score_change',
        'player_id', NEW.player_id,
        'points_change', NEW.points_change,
        'current_total', NEW.current_total,
        'transaction_type', NEW.transaction_type,
        'game_id', NEW.game_id,
        'related_player_id', NEW.related_player_id,
        'description', NEW.description,
        'timestamp', NEW.event_time
    );
    
    PERFORM pg_notify('score_update', notification_data::text);
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 记录错误但不中断操作
        RAISE WARNING 'Failed to send score notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建积分变动通知触发器
DROP TRIGGER IF EXISTS score_change_notify ON score_transactions;
CREATE TRIGGER score_change_notify
    AFTER INSERT ON score_transactions
    FOR EACH ROW EXECUTE FUNCTION notify_score_change();

-- 转移记录广播触发器函数
CREATE OR REPLACE FUNCTION broadcast_transfer_record()
RETURNS TRIGGER AS $$
DECLARE
    from_username VARCHAR(100);
    to_username VARCHAR(100);
    broadcast_data JSONB;
BEGIN
    -- 获取玩家用户名
    SELECT username INTO from_username
    FROM players
    WHERE player_id = NEW.from_player_id;
    
    SELECT username INTO to_username
    FROM players
    WHERE player_id = NEW.to_player_id;
    
    -- 创建广播数据
    broadcast_data := jsonb_build_object(
        'type', 'transfer_broadcast',
        'transfer_id', NEW.transfer_id,
        'from_player_id', NEW.from_player_id,
        'from_username', from_username,
        'to_player_id', NEW.to_player_id,
        'to_username', to_username,
        'points', NEW.points,
        'game_id', NEW.game_id,
        'description', NEW.description,
        'transfer_time', NEW.transfer_time,
        'status', NEW.status
    );
    
    -- 发送游戏房间广播通知
    IF NEW.game_id IS NOT NULL THEN
        PERFORM pg_notify('game_' || NEW.game_id, broadcast_data::text);
    END IF;
    
    -- 发送全局转移通知
    PERFORM pg_notify('transfer_broadcast', broadcast_data::text);
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 记录错误但不中断操作
        RAISE WARNING 'Failed to broadcast transfer record: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建转移记录广播触发器
DROP TRIGGER IF EXISTS transfer_broadcast ON transfer_records;
CREATE TRIGGER transfer_broadcast
    AFTER INSERT ON transfer_records
    FOR EACH ROW EXECUTE FUNCTION broadcast_transfer_record();

-- 添加注释
COMMENT ON TABLE players IS '玩家信息表';
COMMENT ON TABLE games IS '游戏对局表（房间）';
COMMENT ON TABLE score_transactions IS '积分交易记录表';
COMMENT ON TABLE transfer_records IS '积分转移记录表（用于游戏房间广播）';
COMMENT ON TABLE scores IS '玩家当前积分表（允许负数）';
COMMENT ON TABLE game_participants IS '游戏参与者表';

COMMENT ON COLUMN players.player_id IS '玩家ID（自增主键）';
COMMENT ON COLUMN games.status IS '游戏状态：waiting-等待中，playing-进行中，finished-已结束，cancelled-已取消';
COMMENT ON COLUMN score_transactions.transaction_type IS '交易类型：game-游戏积分，transfer_in-接收转移，transfer_out-转出转移，bonus-奖励积分，penalty-惩罚积分';
COMMENT ON COLUMN score_transactions.related_player_id IS '关联的另一个玩家ID（用于积分转移）';
COMMENT ON COLUMN scores.current_total IS '玩家当前积分（允许负数）';
COMMENT ON COLUMN transfer_records.game_id IS '游戏ID（房间ID），用于向特定游戏房间广播转移信息';
COMMENT ON COLUMN transfer_records.status IS '转移状态：pending-待处理，completed-已完成，failed-失败，cancelled-已取消';
COMMENT ON COLUMN game_participants.status IS '参与者状态：active-活跃，inactive-非活跃，left-已离开，disconnected-断开连接，kicked-被踢出';
COMMENT ON COLUMN game_participants.position IS '玩家在游戏中的位置/座位号';
COMMENT ON COLUMN game_participants.left_at IS '玩家离开时间（当状态为left/disconnected/kicked时设置）'; 
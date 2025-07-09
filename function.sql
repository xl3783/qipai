-- 加入游戏函数
CREATE OR REPLACE FUNCTION join_game(
    p_game_id BIGINT,
    p_player_id BIGINT,
    p_position SMALLINT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
    cur_score INTEGER;
    p_id BIGINT;
BEGIN
    -- 检查游戏是否存在
    IF NOT EXISTS (SELECT 1 FROM games WHERE game_id = p_game_id) THEN
        RAISE EXCEPTION 'Game with ID % does not exist', p_game_id;
    END IF;
    
    -- 检查玩家是否存在
    IF NOT EXISTS (SELECT 1 FROM players WHERE player_id = p_player_id) THEN
        RAISE EXCEPTION 'Player with ID % does not exist', p_player_id;
    END IF;
    
    -- 检查玩家是否已经参与该游戏
    IF EXISTS (SELECT 1 FROM game_participants WHERE game_id = p_game_id AND player_id = p_player_id) THEN
        RAISE EXCEPTION 'Player % is already participating in game %', p_player_id, p_game_id;
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
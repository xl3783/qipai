-- 外键约束（这些约束在DDL中已经定义，这里是额外的约束）
ALTER TABLE game_participants
    ADD CONSTRAINT fk_game_participants_game_id 
        FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_game_participants_player_id 
        FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE;

-- 游戏状态检查约束
ALTER TABLE games
    ADD CONSTRAINT valid_game_time CHECK (end_time IS NULL OR end_time >= start_time);

-- 参与者得分验证约束
ALTER TABLE game_participants
    ADD CONSTRAINT valid_final_score CHECK (
        final_score IS NULL OR final_score >= 0
    ),
    ADD CONSTRAINT score_consistency_check CHECK (
        final_score IS NULL OR (
            final_score - initial_score = (
                SELECT COALESCE(SUM(points_change), 0)
                FROM score_transactions
                WHERE player_id = game_participants.player_id
                  AND game_id = game_participants.game_id
            )
        )
    );

-- 通知函数
CREATE OR REPLACE FUNCTION notify_participant_update()
RETURNS TRIGGER AS $$
DECLARE
    notification_data JSONB;
BEGIN
    notification_data := jsonb_build_object(
        'type', 'participant',
        'game_id', NEW.game_id,
        'player_id', NEW.player_id,
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
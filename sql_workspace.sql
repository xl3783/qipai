-- =============================================
-- 棋牌游戏系统 SQL 工作区
-- 在 Cursor 中直接连接数据库进行开发
-- =============================================

-- 1. 基础查询测试
-- 测试数据库连接
SELECT 1 as test_connection;

-- 查看所有表
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. 玩家相关查询
-- 查看所有玩家
SELECT 
    player_id,
    username,
    created_at,
    COALESCE(s.current_total, 0) as current_score
FROM players p
LEFT JOIN scores s ON p.player_id = s.player_id
ORDER BY s.current_total DESC NULLS LAST;

-- 创建新玩家
-- INSERT INTO players (username, created_at) 
-- VALUES ('测试玩家', NOW()) 
-- RETURNING player_id, username, created_at;

-- 3. 游戏相关查询
-- 查看所有游戏
SELECT 
    game_id,
    game_type,
    start_time,
    end_time,
    CASE 
        WHEN end_time IS NULL THEN '进行中'
        ELSE '已结束'
    END as status
FROM games
ORDER BY start_time DESC;

-- 查看游戏参与者
SELECT 
    g.game_id,
    g.game_type,
    p.username,
    gp.initial_score,
    gp.final_score,
    gp.position,
    (gp.final_score - gp.initial_score) as score_change
FROM games g
JOIN game_participants gp ON g.game_id = gp.game_id
JOIN players p ON gp.player_id = p.player_id
WHERE g.end_time IS NOT NULL
ORDER BY g.game_id DESC, gp.position;

-- 4. 积分相关查询
-- 查看积分排行榜
SELECT 
    p.username,
    s.current_total,
    s.last_updated,
    RANK() OVER (ORDER BY s.current_total DESC) as rank
FROM scores s
JOIN players p ON s.player_id = p.player_id
ORDER BY s.current_total DESC
LIMIT 10;

-- 查看积分交易历史
SELECT 
    st.transaction_id,
    p.username,
    st.points_change,
    st.current_total,
    st.event_time,
    g.game_type,
    CASE 
        WHEN st.points_change > 0 THEN '获得'
        ELSE '扣除'
    END as transaction_type
FROM score_transactions st
JOIN players p ON st.player_id = p.player_id
LEFT JOIN games g ON st.game_id = g.game_id
ORDER BY st.event_time DESC
LIMIT 20;

-- 5. 统计查询
-- 玩家游戏统计
SELECT 
    p.username,
    COUNT(DISTINCT gp.game_id) as total_games,
    COUNT(CASE WHEN g.end_time IS NOT NULL THEN 1 END) as completed_games,
    COALESCE(s.current_total, 0) as current_score,
    AVG(gp.final_score - gp.initial_score) as avg_score_change
FROM players p
LEFT JOIN game_participants gp ON p.player_id = gp.player_id
LEFT JOIN games g ON gp.game_id = g.game_id
LEFT JOIN scores s ON p.player_id = s.player_id
GROUP BY p.player_id, p.username, s.current_total
ORDER BY current_score DESC;

-- 游戏类型统计
SELECT 
    game_type,
    COUNT(*) as total_games,
    COUNT(CASE WHEN end_time IS NOT NULL THEN 1 END) as completed_games,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time))/60) as avg_duration_minutes
FROM games
GROUP BY game_type
ORDER BY total_games DESC;

-- 6. 分区表查询（如果使用了分区）
-- 查看分区信息
SELECT 
    schemaname,
    tablename,
    partitiontablename,
    partitionname,
    partitionrangestart,
    partitionrangeend
FROM pg_partitions 
WHERE tablename = 'score_transactions'
ORDER BY partitionrangestart;

-- 查看分区数据分布
SELECT 
    schemaname,
    tablename,
    n_live_tup as live_tuples,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_stat_user_tables 
WHERE tablename LIKE 'score_transactions_%'
ORDER BY tablename;

-- 7. 性能监控查询
-- 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 8. 数据清理和维护查询
-- 查找孤立的积分记录（没有对应玩家的记录）
SELECT 
    st.transaction_id,
    st.player_id,
    st.points_change,
    st.event_time
FROM score_transactions st
LEFT JOIN players p ON st.player_id = p.player_id
WHERE p.player_id IS NULL;

-- 查找重复的用户名
SELECT 
    username,
    COUNT(*) as count
FROM players
GROUP BY username
HAVING COUNT(*) > 1;

-- 9. 复杂业务查询示例
-- 获取玩家最近7天的积分变化趋势
SELECT 
    p.username,
    DATE(st.event_time) as date,
    SUM(st.points_change) as daily_change,
    SUM(SUM(st.points_change)) OVER (
        PARTITION BY p.player_id 
        ORDER BY DATE(st.event_time)
        ROWS UNBOUNDED PRECEDING
    ) as cumulative_change
FROM score_transactions st
JOIN players p ON st.player_id = p.player_id
WHERE st.event_time >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY p.player_id, p.username, DATE(st.event_time)
ORDER BY p.username, date;

-- 获取游戏胜率统计
WITH game_results AS (
    SELECT 
        g.game_id,
        g.game_type,
        p.username,
        gp.final_score - gp.initial_score as score_change,
        ROW_NUMBER() OVER (
            PARTITION BY g.game_id 
            ORDER BY (gp.final_score - gp.initial_score) DESC
        ) as rank
    FROM games g
    JOIN game_participants gp ON g.game_id = gp.game_id
    JOIN players p ON gp.player_id = p.player_id
    WHERE g.end_time IS NOT NULL
)
SELECT 
    username,
    COUNT(*) as total_games,
    COUNT(CASE WHEN rank = 1 THEN 1 END) as wins,
    ROUND(
        COUNT(CASE WHEN rank = 1 THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as win_rate
FROM game_results
GROUP BY username
HAVING COUNT(*) >= 5
ORDER BY win_rate DESC;

-- 10. 测试数据插入（取消注释以执行）
-- 插入测试玩家
/*
INSERT INTO players (username, created_at) VALUES 
('测试玩家1', NOW()),
('测试玩家2', NOW()),
('测试玩家3', NOW())
ON CONFLICT (username) DO NOTHING;
*/

-- 插入测试游戏
/*
INSERT INTO games (game_type, start_time) VALUES 
('斗地主', NOW() - INTERVAL '1 hour'),
('麻将', NOW() - INTERVAL '30 minutes')
RETURNING game_id;
*/

-- 插入测试积分
/*
INSERT INTO scores (player_id, current_total, last_updated) VALUES 
(1, 1000, NOW()),
(2, 800, NOW()),
(3, 1200, NOW())
ON CONFLICT (player_id) DO UPDATE SET 
    current_total = EXCLUDED.current_total,
    last_updated = EXCLUDED.last_updated;
*/ 
-- 查询特定游戏的参与者信息
SELECT
    p.player_id,
    p.username,
    gp.position AS seat,
    gp.initial_score,
    gp.final_score,
    COALESCE(gp.final_score - gp.initial_score, 0) AS score_change
FROM game_participants gp
    INNER JOIN players p ON gp.player_id = p.player_id
WHERE gp.game_id = $1
ORDER BY gp.position;

-- 查询特定玩家的游戏历史
SELECT
    g.game_id,
    g.game_type,
    g.start_time,
    COUNT(*) OVER() AS player_count,
    gp.initial_score,
    gp.final_score,
    COALESCE(gp.final_score - gp.initial_score, 0) AS score_change
FROM game_participants gp
    INNER JOIN games g ON gp.game_id = g.game_id
WHERE gp.player_id = $1
ORDER BY g.start_time DESC;

-- 查询特定游戏的详细统计信息
SELECT
    p.player_id,
    p.username,
    MAX(g.start_time) AS game_start,
    MAX(g.end_time) AS game_end,
    MAX(st.event_time) AS last_update,
    COALESCE(SUM(st.points_change), 0) AS total_change,
    MAX(gp.final_score) AS final_score
FROM games g
    INNER JOIN game_participants gp ON g.game_id = gp.game_id
    INNER JOIN players p ON gp.player_id = p.player_id
    LEFT JOIN score_transactions st ON st.game_id = g.game_id AND st.player_id = p.player_id
WHERE g.game_id = $1
GROUP BY p.player_id, p.username
ORDER BY p.player_id;
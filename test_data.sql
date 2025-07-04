-- ========================================
-- 棋牌游戏数据库 - 测试数据
-- ========================================

-- 清空现有数据（可选，谨慎使用）
-- TRUNCATE TABLE transfer_records CASCADE;
-- TRUNCATE TABLE score_transactions CASCADE;
-- TRUNCATE TABLE game_participants CASCADE;
-- TRUNCATE TABLE scores CASCADE;
-- TRUNCATE TABLE games CASCADE;
-- TRUNCATE TABLE players CASCADE;

-- 插入玩家数据
INSERT INTO players (username, email, avatar_url) VALUES
('张三', 'zhangsan@example.com', 'https://example.com/avatars/zhangsan.jpg'),
('李四', 'lisi@example.com', 'https://example.com/avatars/lisi.jpg'),
('王五', 'wangwu@example.com', 'https://example.com/avatars/wangwu.jpg'),
('赵六', 'zhaoliu@example.com', 'https://example.com/avatars/zhaoliu.jpg'),
('钱七', 'qianqi@example.com', 'https://example.com/avatars/qianqi.jpg'),
('孙八', 'sunba@example.com', 'https://example.com/avatars/sunba.jpg'),
('周九', 'zhoujiu@example.com', 'https://example.com/avatars/zhoujiu.jpg'),
('吴十', 'wushi@example.com', 'https://example.com/avatars/wushi.jpg'),
('郑十一', 'zhengshiyi@example.com', 'https://example.com/avatars/zhengshiyi.jpg'),
('王十二', 'wangshier@example.com', 'https://example.com/avatars/wangshier.jpg');

-- 初始化玩家积分
INSERT INTO scores (player_id, current_total, games_played, games_won) VALUES
(1, 0, 0, 0),
(2, 0, 0, 0),
(3, 0, 0, 0),
(4, 0, 0, 0),
(5, 0, 0, 0),
(6, 0, 0, 0),
(7, 0, 0, 0),
(8, 0, 0, 0),
(9, 0, 0, 0),
(10, 0, 0, 0);

-- 创建游戏房间
INSERT INTO games (game_type, status, max_players, min_players) VALUES
('斗地主', 'waiting', 3, 3),
('麻将', 'waiting', 4, 4),
('德州扑克', 'waiting', 6, 2),
('象棋', 'waiting', 2, 2),
('围棋', 'waiting', 2, 2),
('五子棋', 'playing', 2, 2),
('军棋', 'finished', 2, 2),
('跳棋', 'cancelled', 4, 2);

-- 玩家加入游戏
-- 游戏1：斗地主
SELECT join_game(1::BIGINT, 1::BIGINT, 1::SMALLINT); -- 张三加入游戏1，位置1
SELECT join_game(1::BIGINT, 2::BIGINT, 2::SMALLINT); -- 李四加入游戏1，位置2
SELECT join_game(1::BIGINT, 3::BIGINT, 3::SMALLINT); -- 王五加入游戏1，位置3

-- 游戏2：麻将
SELECT join_game(2::BIGINT, 4::BIGINT, 1::SMALLINT); -- 赵六加入游戏2，位置1
SELECT join_game(2::BIGINT, 5::BIGINT, 2::SMALLINT); -- 钱七加入游戏2，位置2
SELECT join_game(2::BIGINT, 6::BIGINT, 3::SMALLINT); -- 孙八加入游戏2，位置3
SELECT join_game(2::BIGINT, 7::BIGINT, 4::SMALLINT); -- 周九加入游戏2，位置4

-- 游戏3：德州扑克
SELECT join_game(3::BIGINT, 8::BIGINT, 1::SMALLINT);  -- 吴十加入游戏3，位置1
SELECT join_game(3::BIGINT, 9::BIGINT, 2::SMALLINT);  -- 郑十一加入游戏3，位置2
SELECT join_game(3::BIGINT, 10::BIGINT, 3::SMALLINT); -- 王十二加入游戏3，位置3

-- 游戏4：象棋
SELECT join_game(4::BIGINT, 1::BIGINT, 1::SMALLINT); -- 张三加入游戏4，位置1
SELECT join_game(4::BIGINT, 2::BIGINT, 2::SMALLINT); -- 李四加入游戏4，位置2

-- 游戏5：围棋
SELECT join_game(5::BIGINT, 3::BIGINT, 1::SMALLINT); -- 王五加入游戏5，位置1
SELECT join_game(5::BIGINT, 4::BIGINT, 2::SMALLINT); -- 赵六加入游戏5，位置2

-- 游戏6：五子棋（进行中）
SELECT join_game(6::BIGINT, 5::BIGINT, 1::SMALLINT); -- 钱七加入游戏6，位置1
SELECT join_game(6::BIGINT, 6::BIGINT, 2::SMALLINT); -- 孙八加入游戏6，位置2

-- 游戏7：军棋（已结束）
SELECT join_game(7::BIGINT, 7::BIGINT, 1::SMALLINT); -- 周九加入游戏7，位置1
SELECT join_game(7::BIGINT, 8::BIGINT, 2::SMALLINT); -- 吴十加入游戏7，位置2

-- 游戏8：跳棋（已取消）
SELECT join_game(8::BIGINT, 9::BIGINT, 1::SMALLINT);  -- 郑十一加入游戏8，位置1
SELECT join_game(8::BIGINT, 10::BIGINT, 2::SMALLINT); -- 王十二加入游戏8，位置2

-- 模拟积分变动
-- 游戏1中的积分变动
SELECT update_player_score(1::BIGINT, 1::BIGINT, 100, '斗地主第一局胜利');
SELECT update_player_score(2::BIGINT, 1::BIGINT, -50, '斗地主第一局失败');
SELECT update_player_score(3::BIGINT, 1::BIGINT, -50, '斗地主第一局失败');

SELECT update_player_score(2::BIGINT, 1::BIGINT, 80, '斗地主第二局胜利');
SELECT update_player_score(1::BIGINT, 1::BIGINT, -40, '斗地主第二局失败');
SELECT update_player_score(3::BIGINT, 1::BIGINT, -40, '斗地主第二局失败');

-- 游戏2中的积分变动
SELECT update_player_score(4::BIGINT, 2::BIGINT, 120, '麻将第一局胜利');
SELECT update_player_score(5::BIGINT, 2::BIGINT, -40, '麻将第一局失败');
SELECT update_player_score(6::BIGINT, 2::BIGINT, -40, '麻将第一局失败');
SELECT update_player_score(7::BIGINT, 2::BIGINT, -40, '麻将第一局失败');

-- 游戏3中的积分变动
SELECT update_player_score(8::BIGINT, 3::BIGINT, 200, '德州扑克第一局胜利');
SELECT update_player_score(9::BIGINT, 3::BIGINT, -100, '德州扑克第一局失败');
SELECT update_player_score(10::BIGINT, 3::BIGINT, -100, '德州扑克第一局失败');

-- 游戏4中的积分变动
SELECT update_player_score(1::BIGINT, 4::BIGINT, 50, '象棋第一局胜利');
SELECT update_player_score(2::BIGINT, 4::BIGINT, -50, '象棋第一局失败');

-- 游戏5中的积分变动
SELECT update_player_score(3::BIGINT, 5::BIGINT, 80, '围棋第一局胜利');
SELECT update_player_score(4::BIGINT, 5::BIGINT, -80, '围棋第一局失败');

-- 游戏6中的积分变动（进行中）
SELECT update_player_score(5::BIGINT, 6::BIGINT, 30, '五子棋第一局胜利');
SELECT update_player_score(6::BIGINT, 6::BIGINT, -30, '五子棋第一局失败');

-- 游戏7中的积分变动（已结束）
SELECT update_player_score(7::BIGINT, 7::BIGINT, 60, '军棋第一局胜利');
SELECT update_player_score(8::BIGINT, 7::BIGINT, -60, '军棋第一局失败');

-- 模拟玩家间积分转移
-- 游戏1中的积分转移
SELECT transfer_points_between_players(1::BIGINT, 2::BIGINT, 50, 1::BIGINT, '斗地主游戏中的积分转移');
SELECT transfer_points_between_players(2::BIGINT, 3::BIGINT, 30, 1::BIGINT, '斗地主游戏中的积分转移');
SELECT transfer_points_between_players(3::BIGINT, 1::BIGINT, 20, 1::BIGINT, '斗地主游戏中的积分转移');

-- 游戏2中的积分转移
SELECT transfer_points_between_players(4::BIGINT, 5::BIGINT, 40, 2::BIGINT, '麻将游戏中的积分转移');
SELECT transfer_points_between_players(6::BIGINT, 7::BIGINT, 25, 2::BIGINT, '麻将游戏中的积分转移');

-- 游戏3中的积分转移
SELECT transfer_points_between_players(8::BIGINT, 9::BIGINT, 100, 3::BIGINT, '德州扑克游戏中的积分转移');
SELECT transfer_points_between_players(9::BIGINT, 10::BIGINT, 80, 3::BIGINT, '德州扑克游戏中的积分转移');

-- 游戏4中的积分转移
SELECT transfer_points_between_players(1::BIGINT, 2::BIGINT, 25, 4::BIGINT, '象棋游戏中的积分转移');

-- 游戏5中的积分转移
SELECT transfer_points_between_players(3::BIGINT, 4::BIGINT, 40, 5::BIGINT, '围棋游戏中的积分转移');

-- 游戏6中的积分转移（进行中）
SELECT transfer_points_between_players(5::BIGINT, 6::BIGINT, 15, 6::BIGINT, '五子棋游戏中的积分转移');

-- 游戏7中的积分转移（已结束）
SELECT transfer_points_between_players(7::BIGINT, 8::BIGINT, 30, 7::BIGINT, '军棋游戏中的积分转移');

-- 结束一些游戏
SELECT end_game(1::BIGINT); -- 结束斗地主游戏
SELECT end_game(2::BIGINT); -- 结束麻将游戏
SELECT end_game(4::BIGINT); -- 结束象棋游戏
SELECT end_game(5::BIGINT); -- 结束围棋游戏
SELECT end_game(7::BIGINT); -- 结束军棋游戏

-- 更新游戏参与者的最终积分
UPDATE game_participants SET final_score = 1130 WHERE game_id = 1 AND player_id = 1; -- 张三
UPDATE game_participants SET final_score = 780 WHERE game_id = 1 AND player_id = 2;  -- 李四
UPDATE game_participants SET final_score = 1120 WHERE game_id = 1 AND player_id = 3; -- 王五

UPDATE game_participants SET final_score = 1280 WHERE game_id = 2 AND player_id = 4; -- 赵六
UPDATE game_participants SET final_score = 1460 WHERE game_id = 2 AND player_id = 5; -- 钱七
UPDATE game_participants SET final_score = 885 WHERE game_id = 2 AND player_id = 6;  -- 孙八
UPDATE game_participants SET final_score = 1085 WHERE game_id = 2 AND player_id = 7; -- 周九

UPDATE game_participants SET final_score = 1200 WHERE game_id = 4 AND player_id = 1; -- 张三
UPDATE game_participants SET final_score = 725 WHERE game_id = 4 AND player_id = 2;  -- 李四

UPDATE game_participants SET final_score = 1280 WHERE game_id = 5 AND player_id = 3; -- 王五
UPDATE game_participants SET final_score = 560 WHERE game_id = 5 AND player_id = 4;  -- 赵六

UPDATE game_participants SET final_score = 1160 WHERE game_id = 7 AND player_id = 7; -- 周九
UPDATE game_participants SET final_score = 640 WHERE game_id = 7 AND player_id = 8;  -- 吴十

-- 更新游戏统计
UPDATE scores SET games_played = 2, games_won = 2 WHERE player_id = 1; -- 张三玩了2局，赢了2局
UPDATE scores SET games_played = 2, games_won = 1 WHERE player_id = 2; -- 李四玩了2局，赢了1局
UPDATE scores SET games_played = 2, games_won = 2 WHERE player_id = 3; -- 王五玩了2局，赢了2局
UPDATE scores SET games_played = 2, games_won = 1 WHERE player_id = 4; -- 赵六玩了2局，赢了1局
UPDATE scores SET games_played = 1, games_won = 0 WHERE player_id = 5; -- 钱七玩了1局，赢了0局
UPDATE scores SET games_played = 1, games_won = 0 WHERE player_id = 6; -- 孙八玩了1局，赢了0局
UPDATE scores SET games_played = 2, games_won = 1 WHERE player_id = 7; -- 周九玩了2局，赢了1局
UPDATE scores SET games_played = 2, games_won = 0 WHERE player_id = 8; -- 吴十玩了2局，赢了0局
UPDATE scores SET games_played = 1, games_won = 0 WHERE player_id = 9; -- 郑十一玩了1局，赢了0局
UPDATE scores SET games_played = 1, games_won = 0 WHERE player_id = 10; -- 王十二玩了1局，赢了0局

-- 创建一些额外的测试场景

-- 场景1：负积分测试
SELECT transfer_points_between_players(1::BIGINT, 2::BIGINT, 2000, 1::BIGINT, '大额转移测试负积分');

-- 场景2：跨游戏转移
SELECT transfer_points_between_players(3::BIGINT, 4::BIGINT, 100, NULL, '跨游戏积分转移');

-- 场景3：奖励积分
SELECT update_player_score(5::BIGINT, NULL, 200, '系统奖励积分');
SELECT update_player_score(6::BIGINT, NULL, 150, '活动奖励积分');

-- 场景4：惩罚积分
SELECT update_player_score(7::BIGINT, NULL, -100, '违规惩罚积分');
SELECT update_player_score(8::BIGINT, NULL, -50, '超时惩罚积分');

-- 创建一些新的游戏进行测试
INSERT INTO games (game_type, status, max_players, min_players) VALUES
('测试游戏1', 'waiting', 4, 2),
('测试游戏2', 'waiting', 3, 2),
('测试游戏3', 'waiting', 2, 2);

-- 加入新游戏
SELECT join_game(9::BIGINT, 1::BIGINT, 1::SMALLINT);
SELECT join_game(9::BIGINT, 2::BIGINT, 2::SMALLINT);
SELECT join_game(9::BIGINT, 3::BIGINT, 3::SMALLINT);

SELECT join_game(10::BIGINT, 4::BIGINT, 1::SMALLINT);
SELECT join_game(10::BIGINT, 5::BIGINT, 2::SMALLINT);

SELECT join_game(11::BIGINT, 6::BIGINT, 1::SMALLINT);
SELECT join_game(11::BIGINT, 7::BIGINT, 2::SMALLINT);

-- 在新游戏中进行积分变动
SELECT update_player_score(1::BIGINT, 9::BIGINT, 50, '测试游戏1第一局');
SELECT update_player_score(2::BIGINT, 9::BIGINT, -25, '测试游戏1第一局');
SELECT update_player_score(3::BIGINT, 9::BIGINT, -25, '测试游戏1第一局');

SELECT update_player_score(4::BIGINT, 10::BIGINT, 40, '测试游戏2第一局');
SELECT update_player_score(5::BIGINT, 10::BIGINT, -40, '测试游戏2第一局');

SELECT update_player_score(6::BIGINT, 11::BIGINT, 30, '测试游戏3第一局');
SELECT update_player_score(7::BIGINT, 11::BIGINT, -30, '测试游戏3第一局');

-- 在新游戏中进行积分转移
SELECT transfer_points_between_players(1::BIGINT, 2::BIGINT, 20, 9::BIGINT, '测试游戏1中的转移');
SELECT transfer_points_between_players(4::BIGINT, 5::BIGINT, 15, 10::BIGINT, '测试游戏2中的转移');
SELECT transfer_points_between_players(6::BIGINT, 7::BIGINT, 10, 11::BIGINT, '测试游戏3中的转移');

-- 结束新游戏
SELECT end_game(9::BIGINT);
SELECT end_game(10::BIGINT);
SELECT end_game(11::BIGINT);

-- 更新新游戏的最终积分
UPDATE game_participants SET final_score = 1160 WHERE game_id = 9 AND player_id = 1;
UPDATE game_participants SET final_score = 755 WHERE game_id = 9 AND player_id = 2;
UPDATE game_participants SET final_score = 1095 WHERE game_id = 9 AND player_id = 3;

UPDATE game_participants SET final_score = 1500 WHERE game_id = 10 AND player_id = 4;
UPDATE game_participants SET final_score = 1420 WHERE game_id = 10 AND player_id = 5;

UPDATE game_participants SET final_score = 1035 WHERE game_id = 11 AND player_id = 6;
UPDATE game_participants SET final_score = 1055 WHERE game_id = 11 AND player_id = 7;

-- 更新游戏统计
UPDATE scores SET games_played = games_played + 1, games_won = games_won + 1 WHERE player_id = 1;
UPDATE scores SET games_played = games_played + 1, games_won = games_won + 0 WHERE player_id = 2;
UPDATE scores SET games_played = games_played + 1, games_won = games_won + 0 WHERE player_id = 3;
UPDATE scores SET games_played = games_played + 1, games_won = games_won + 1 WHERE player_id = 4;
UPDATE scores SET games_played = games_played + 1, games_won = games_won + 0 WHERE player_id = 5;
UPDATE scores SET games_played = games_played + 1, games_won = games_won + 1 WHERE player_id = 6;
UPDATE scores SET games_played = games_played + 1, games_won = games_won + 0 WHERE player_id = 7;

-- 显示测试数据统计
SELECT '测试数据创建完成！' as message;

-- 显示玩家统计
SELECT 
    p.username,
    s.current_total,
    s.games_played,
    s.games_won,
    CASE 
        WHEN s.games_played > 0 THEN 
            ROUND((s.games_won::DECIMAL / s.games_played) * 100, 2)
        ELSE 0 
    END AS win_rate
FROM players p
LEFT JOIN scores s ON p.player_id = s.player_id
ORDER BY s.current_total DESC;

-- 显示游戏统计
SELECT 
    g.game_id,
    g.game_type,
    g.status,
    g.start_time,
    g.end_time,
    COUNT(gp.player_id) as player_count
FROM games g
LEFT JOIN game_participants gp ON g.game_id = gp.game_id
GROUP BY g.game_id, g.game_type, g.status, g.start_time, g.end_time
ORDER BY g.game_id;

-- 显示转移记录统计
SELECT 
    COUNT(*) as total_transfers,
    COUNT(DISTINCT from_player_id) as unique_from_players,
    COUNT(DISTINCT to_player_id) as unique_to_players,
    SUM(points) as total_points_transferred
FROM transfer_records; 
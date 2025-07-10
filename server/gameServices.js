function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, group) => group.toUpperCase());
  }
  
  function convertKeysToCamelCase(obj) {
    if (Array.isArray(obj)) {
      return obj.map(convertKeysToCamelCase); // 处理数组
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj = {};
      for (const key in obj) {
        const camelKey = snakeToCamel(key);
        const value = obj[key];
        
        // 检查是否为日期时间字段
        if (isDateField(key) && value) {
          newObj[camelKey] = convertToTimestamp(value);
        } else {
          newObj[camelKey] = convertKeysToCamelCase(value); // 递归处理嵌套对象
        }
      }
      return newObj;
    }
    return obj; // 基本类型直接返回
  }

  // 判断是否为日期时间字段
  function isDateField(key) {
    const dateFields = ['created_at', 'updated_at', 'start_time', 'end_time', 'left_at', 'event_time'];
    return dateFields.includes(key);
  }

  // 将日期时间转换为时间戳字符串
  function convertToTimestamp(value) {
    if (!value) return null;
    
    // 如果已经是字符串，直接返回
    if (typeof value === 'string') {
      return value;
    }
    
    // 如果是 Date 对象，转换为时间戳字符串
    if (value instanceof Date) {
      return value.getTime().toString();
    }
    
    // 如果是其他类型，尝试转换为 Date 对象
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.getTime().toString();
      }
    } catch (error) {
      console.warn('Failed to convert value to timestamp:', value);
    }
    
    return value;
  }
  


class GameServices {
    constructor(dbService) {
        this.dbService = dbService;
        this.pool = dbService.pool;
    }

    generateJapaneseMahjongName() {
        // 常见日麻役种
        const yakuNames = [
          '立直', '一发', '门前清自摸和', '平和', '断幺九', 
          '一盃口', '三色同顺', '一气通贯', '混全带幺九', 
          '七对子', '混老头', '三色同刻', '三暗刻', '小三元',
          '混一色', '清一色', '国士无双', '大三元', '四暗刻',
          '字一色', '绿一色', '清老头', '九莲宝灯', '天和', '地和'
        ];
        
        // 50%概率添加前缀
        const prefixes = ['雀', '牌', '和', '打', '役'];
        const usePrefix = Math.random() > 0.5;
        
        const yaku = yakuNames[Math.floor(Math.random() * yakuNames.length)];
        const prefix = usePrefix ? prefixes[Math.floor(Math.random() * prefixes.length)] : '';
        
        return prefix + yaku;
      }

    // 微信登录处理
    async loginWithWechat(openid, nickname = '') {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            if (nickname === '') {
                nickname = this.generateJapaneseMahjongName();
            }

            console.log(openid, nickname);
            // 查找或创建用户
            await client.query(`
        INSERT INTO players (player_id, username)
        VALUES ($1, $2)
        ON CONFLICT (player_id) DO UPDATE SET username = EXCLUDED.username, updated_at = NOW()
      `, [openid, nickname]);
      await client.query(`
        INSERT INTO scores (player_id, current_total, games_played, games_won, games_lost)
        VALUES ($1, 0, 0, 0, 0)
        ON CONFLICT (player_id)  DO NOTHING
      `, [openid]);


            await client.query('COMMIT');

            const userId = openid;
            return {
                role: 'authenticated_user',
                userId: userId.toString(),
                username: nickname,
                openid: openid
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updatePlayer(userId, username, phone, email, avatarUrl) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // 为空则不更新
            if (username === '') {
                username = null;
            }
            if (phone === '') {
                phone = null;
            }
            if (email === '') {
                email = null;
            }
            if (avatarUrl === '') {
                avatarUrl = null;
            }

            await client.query(`
                UPDATE players SET username = $1, phone = $2, email = $3, avatar_url = $4, updated_at = NOW() WHERE player_id = $5
            `, [username, phone, email, avatarUrl, userId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    }

    // 创建游戏房间
    async createGameRoom(userId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // 检查玩家是否存在
            const playerCheck = await client.query(
                'SELECT 1 FROM players WHERE player_id = $1',
                [userId]
            );

            if (playerCheck.rows.length === 0) {
                throw new Error(`Player with ID ${userId} does not exist`);
            }

            // 检查玩家是否已经参与游戏
            // const activeGameCheck = await client.query(
            //     'SELECT 1 FROM game_participants WHERE player_id = $1 AND status = $2',
            //     [userId, 'active']
            // );

            // if (activeGameCheck.rows.length > 0) {
            //     throw new Error(`Player ${userId} is already participating in a game`);
            // }

            // 生成4位房号， 如果已经存在，则重新生成
            // 游戏id 使用数字+字母，区分大小写
            let gameName = '';
            while (true) {
                let numCount = Math.floor(Math.random() * 4) + 1;
                let numStr = '';
                for (let i = 0; i < numCount; i++) {
                    numStr += Math.floor(Math.random() * 10);
                }
                let letterStr = '';
                for (let i = 0; i < 4 - numCount; i++) {
                    let isUpper = Math.random() > 0.5;
                    if (isUpper) {
                        letterStr += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
                    } else {
                        letterStr += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
                    }
                }
                gameName = numStr + letterStr;
                const gameInfo = await this._checkGameName(client, gameName);
                if (!gameInfo) {
                    break;
                }
            }

            // 创建游戏
            const gameResult = await client.query(`
        INSERT INTO games (game_type, status, max_players, min_players, game_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING game_id
      `, ['自定义', 'waiting', 30, 2, gameName]);
            const gameId = gameResult.rows[0].game_id;

            // 加入游戏
            await this._joinGame(client, gameName, userId, 1);

            await client.query('COMMIT');
            return {
                gameId: gameId,
                gameName: gameName
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async _checkGameName(client, gameName) {
        const statuses = ['finished', 'cancelled'];
        const gameCheck = await client.query(
            'SELECT * FROM games WHERE game_name = $1 and status != ALL($2::game_status[])',
            [gameName, statuses]
        );
        return gameCheck.rows.length > 0 ? gameCheck.rows[0] : null;
    }

    async _joinGame(client, gameName, playerId, position = null) {

        // 检查游戏是否存在
        const gameInfo = await this._checkGameName(client, gameName);

        if (!gameInfo) {
            throw new Error(`Game with name ${gameName} does not exist`);
        }

        const gameStatus = gameInfo.status;
        const gameId = gameInfo.game_id;

        // 检查游戏状态是否允许加入
        if (['playing', 'finished', 'cancelled'].includes(gameStatus)) {
            throw new Error(`Game ${gameId} is not accepting new players (status: ${gameStatus})`);
        }

        // 检查玩家是否存在
        const playerCheck = await client.query(
            'SELECT 1 FROM players WHERE player_id = $1',
            [playerId]
        );

        if (playerCheck.rows.length === 0) {
            throw new Error(`Player with ID ${playerId} does not exist`);
        }

        // 检查玩家是否已经参与该游戏
        const participantCheck = await client.query(
            'SELECT 1 FROM game_participants WHERE game_id = $1 AND player_id = $2',
            [gameId, playerId]
        );

        if (participantCheck.rows.length > 0) {
            if (participantCheck.rows[0].status === 'active') {
                throw new Error(`Player ${playerId} is already participating in game ${gameId}`);
            }
        }

        // 检查游戏是否已满
        const currentPlayersResult = await client.query(
            'SELECT COUNT(*) as count FROM game_participants WHERE game_id = $1 AND status = $2',
            [gameId, 'active']
        );

        const maxPlayersResult = await client.query(
            'SELECT max_players FROM games WHERE game_id = $1',
            [gameId]
        );

        const currentPlayers = parseInt(currentPlayersResult.rows[0].count);
        const maxPlayers = maxPlayersResult.rows[0].max_players;

        if (currentPlayers >= maxPlayers) {
            throw new Error(`Game ${gameId} is full (max players: ${maxPlayers})`);
        }

        //   // 获取玩家当前积分
        //   let currentScore = 0;
        //   const scoreResult = await client.query(
        //     'SELECT current_total FROM scores WHERE player_id = $1 FOR UPDATE',
        //     [playerId]
        //   );

        //   if (scoreResult.rows.length === 0) {
        //     // 不存在积分则初始化
        //     await client.query(
        //       'INSERT INTO scores(player_id, current_total) VALUES ($1, $2)',
        //       [playerId, 0]
        //     );
        //   } else {
        //     currentScore = scoreResult.rows[0].current_total;
        //   }

        // 重置为0（游戏开始时）
        let currentScore = 0;

        if (participantCheck.rows.length > 0) {
            await client.query(`
          UPDATE game_participants SET status = $1::participant_status WHERE game_id = $2 AND player_id = $3
        `, ['active', gameId, playerId]);
            return {
                participationId: participantCheck.rows[0].participation_id,
                gameId: gameId,
                gameName: gameName,
                playerId: playerId,
                position: position,
                currentScore: currentScore
            }
        }

        // 记录参与者
        const participationResult = await client.query(`
        INSERT INTO game_participants (game_id, player_id, initial_score, final_score, position)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING participation_id
      `, [gameId, playerId, currentScore, currentScore, position]);

        return {
            participationId: participationResult.rows[0].participation_id,
            gameId: gameId,
            gameName: gameName,
            playerId: playerId,
            position: position,
            currentScore: currentScore
        };
    }

    // 加入游戏
    async joinGame(gameName, playerId, position = null) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const res = await this._joinGame(client, gameName, playerId, position);
            console.log(res);
            await client.query('COMMIT');
            return res;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // 更新玩家积分
    async _updatePlayerScore(client, playerId, gameId, pointsChange, description = null) {
        // 验证积分变化不为0
        if (pointsChange === 0) {
            throw new Error('Points change cannot be zero');
        }

        // 检查玩家是否存在
        const playerCheck = await client.query(
            'SELECT 1 FROM players WHERE player_id = $1',
            [playerId]
        );

        if (playerCheck.rows.length === 0) {
            throw new Error(`Player with ID ${playerId} does not exist`);
        }

        // 获取或创建积分记录
        let currentTotal = 0;
        const scoreResult = await client.query(
            'SELECT current_total FROM scores WHERE player_id = $1 FOR UPDATE',
            [playerId]
        );

        if (scoreResult.rows.length === 0) {
            // 不存在积分记录则创建
            await client.query(
                'INSERT INTO scores(player_id, current_total) VALUES ($1, $2)',
                [playerId, 0]
            );
        } else {
            currentTotal = scoreResult.rows[0].current_total;
        }

        // 更新玩家总分
        const newTotal = currentTotal + pointsChange;
        await client.query(`
        UPDATE scores 
        SET current_total = $1,
            last_updated = NOW()
        WHERE player_id = $2
      `, [newTotal, playerId]);

        // 记录交易
        const transactionResult = await client.query(`
        INSERT INTO score_transactions (
          player_id, 
          game_id, 
          points_change, 
          current_total, 
          description
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING transaction_id
      `, [playerId, gameId, pointsChange, newTotal, description]);

        return transactionResult.rows[0].transaction_id;
    }

    // 玩家间积分转移
    async transferPointsBetweenPlayers(fromPlayerId, toPlayerId, points, gameId = null, description = null) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // 验证参数
            if (points <= 0) {
                throw new Error('Transfer points must be positive');
            }

            if (fromPlayerId === toPlayerId) {
                throw new Error('Cannot transfer points to the same player');
            }

            // 检查游戏是否存在且状态为playing
            //   if (gameId) {
            //     const gameCheck = await client.query(
            //       'SELECT 1 FROM games WHERE game_id = $1 AND status = $2',
            //       [gameId, 'playing']
            //     );

            //     if (gameCheck.rows.length === 0) {
            //       throw new Error(`Game with ID ${gameId} is not playing`);
            //     }
            //   }

            // 检查玩家是否在同一个游戏中
            if (gameId) {
                const fromParticipant = await client.query(
                    'SELECT 1 FROM game_participants WHERE game_id = $1 AND player_id = $2 AND status = $3',
                    [gameId, fromPlayerId, 'active']
                );

                const toParticipant = await client.query(
                    'SELECT 1 FROM game_participants WHERE game_id = $1 AND player_id = $2 AND status = $3',
                    [gameId, toPlayerId, 'active']
                );

                if (fromParticipant.rows.length === 0 || toParticipant.rows.length === 0) {
                    throw new Error('Both players must be active participants in the same game');
                }
            }

            // 执行积分转移
            //   const fromTransactionId = await this.updatePlayerScore(fromPlayerId, gameId, -points, description);
            //   const toTransactionId = await this.updatePlayerScore(toPlayerId, gameId, points, description);

            // final_score 是最终积分，可能为null，需要处理null的情况
            await this.updatePlayerGameScore(client, fromPlayerId, toPlayerId, points, gameId);

            // 记录转移记录
            const transferResult = await client.query(`
        INSERT INTO transfer_records (
          from_player_id, 
          to_player_id, 
          points, 
          game_id, 
          description
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING transfer_id
      `, [fromPlayerId, toPlayerId, points, gameId, description]);

            await client.query('COMMIT');

            return {
                success: true,
                transferId: transferResult.rows[0].transfer_id,
                fromPlayerId: fromPlayerId,
                toPlayerId: toPlayerId
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updatePlayerGameScore(client, fromPlayerId, toPlayerId, points, gameId) {
        let fromFinalScore = 0;
        let toFinalScore = 0;
        const fromScoreResult = await client.query(
            'SELECT final_score FROM game_participants WHERE player_id = $1 and game_id = $2',
            [fromPlayerId, gameId]
        );
        if (fromScoreResult.rows.length > 0) {
            fromFinalScore = fromScoreResult.rows[0].final_score;
        }
        const toScoreResult = await client.query(
            'SELECT final_score FROM game_participants WHERE player_id = $1 and game_id = $2',
            [toPlayerId, gameId]
        );
        if (toScoreResult.rows.length > 0) {
            toFinalScore = toScoreResult.rows[0].final_score;
        }

        const fromNewFinalScore = fromFinalScore - points;
        const toNewFinalScore = toFinalScore + points;

        await client.query(`
        UPDATE game_participants
        SET final_score = $1,
            updated_at = NOW()
        WHERE player_id = $2 and game_id = $3
      `, [fromNewFinalScore, fromPlayerId, gameId]);

        await client.query(`
        UPDATE game_participants
        SET final_score = $1,
            updated_at = NOW()
        WHERE player_id = $2 and game_id = $3
      `, [toNewFinalScore, toPlayerId, gameId]);

      // 
        await client.query(`
        UPDATE scores
        SET current_total = current_total - $1,
            last_updated = NOW()
        WHERE player_id = $2
      `, [points, fromPlayerId]);

        await client.query(`
        UPDATE scores
        SET current_total = current_total + $1,
            last_updated = NOW()
        WHERE player_id = $2
      `, [points, toPlayerId]);
    }

    // 结束游戏
    async endGame(gameId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // 获取游戏信息
            const gameResult = await client.query(
                'SELECT * FROM games WHERE game_id = $1',
                [gameId]
            );

            if (gameResult.rows.length === 0) {
                throw new Error(`Game with ID ${gameId} does not exist`);
            }

            const game = gameResult.rows[0];

            if (game.status === 'finished') {
                throw new Error(`Game ${gameId} is already finished`);
            }
            // 记录胜负， 查询所有参与者， 如果final_score > 0， 则玩家胜利， 否则失败
            const participants = await client.query(
                'SELECT player_id, final_score FROM game_participants WHERE game_id = $1',
                [gameId]
            );
            for (const participant of participants.rows) {
                if (participant.final_score > 0) {
                    await client.query(`
                        UPDATE scores
                        SET games_won = games_won + 1
                        WHERE player_id = $1
                    `, [participant.player_id]);
                } else if (participant.final_score < 0) {
                    await client.query(`
                        UPDATE scores
                        SET games_lost = games_lost + 1
                        WHERE player_id = $1
                    `, [participant.player_id]);
                }
            }

            // 更新游戏状态
            await client.query(`
        UPDATE games 
        SET status = $1,
            end_time = NOW(),
            updated_at = NOW()
        WHERE game_id = $2
      `, ['finished', gameId]);

            // 更新玩家游戏统计
            await client.query(`
        UPDATE scores 
        SET games_played = games_played + 1
        WHERE player_id IN (
          SELECT player_id 
          FROM game_participants 
          WHERE game_id = $1
        )
      `, [gameId]);

            // 更新参与者状态
            await client.query(`
        UPDATE game_participants
        SET status = $1,
            left_at = NOW()
        WHERE game_id = $2
      `, ['left', gameId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // 更新参与者状态
    async updateParticipantStatus(gameId, playerId, status, description = null) {
        const client = await this.pool.connect();
        try {
            // 检查参与者是否存在
            const participantResult = await client.query(
                'SELECT status FROM game_participants WHERE game_id = $1 AND player_id = $2',
                [gameId, playerId]
            );

            if (participantResult.rows.length === 0) {
                throw new Error(`Participant not found in game ${gameId} for player ${playerId}`);
            }

            const currentStatus = participantResult.rows[0].status;

            // 如果状态相同，无需更新
            if (currentStatus === status) {
                return false;
            }

            // 更新参与者状态
            await client.query(`
        UPDATE game_participants
        SET status = $1::participant_status,
            left_at = CASE WHEN $1 IN ('left', 'disconnected', 'kicked') THEN NOW() ELSE left_at END,
            updated_at = NOW()
        WHERE game_id = $2 AND player_id = $3
      `, [status, gameId, playerId]);

            return true;
        } finally {
            client.release();
        }
    }

    // 离开游戏
    async leaveGame(gameId, playerId) {
        return await this.updateParticipantStatus(gameId, playerId, 'left', 'Player left the game');
    }

    // 踢出玩家
    async kickPlayer(gameId, playerId, reason = null) {
        return await this.updateParticipantStatus(
            gameId,
            playerId,
            'kicked',
            reason || 'Player was kicked from the game'
        );
    }

    // 重新加入游戏
    async rejoinGame(gameId, playerId) {
        const client = await this.pool.connect();
        try {
            // 检查游戏状态
            const gameResult = await client.query(
                'SELECT status FROM games WHERE game_id = $1',
                [gameId]
            );

            if (gameResult.rows.length === 0) {
                throw new Error(`Game with ID ${gameId} does not exist`);
            }

            const gameStatus = gameResult.rows[0].status;

            if (['finished', 'cancelled'].includes(gameStatus)) {
                throw new Error(`Game ${gameId} is not accepting players (status: ${gameStatus})`);
            }

            // 检查游戏是否已满
            const currentPlayersResult = await client.query(
                'SELECT COUNT(*) as count FROM game_participants WHERE game_id = $1 AND status = $2',
                [gameId, 'active']
            );

            const maxPlayersResult = await client.query(
                'SELECT max_players FROM games WHERE game_id = $1',
                [gameId]
            );

            const currentPlayers = parseInt(currentPlayersResult.rows[0].count);
            const maxPlayers = maxPlayersResult.rows[0].max_players;

            if (currentPlayers >= maxPlayers) {
                throw new Error(`Game ${gameId} is full (max players: ${maxPlayers})`);
            }

            // 更新参与者状态为活跃
            return await this.updateParticipantStatus(gameId, playerId, 'active', 'Player rejoined the game');
        } finally {
            client.release();
        }
    }

    // 获取游戏信息
    async getGameInfo(gameId) {
        const result = await this.pool.query(`
      SELECT g.*, 
             json_agg(
               json_build_object(
                 'player_id', gp.player_id,
                 'position', gp.position,
                 'initial_score', gp.initial_score,
                 'status', gp.status,
                 'username', p.username
               )
             ) as participants
      FROM games g
      LEFT JOIN game_participants gp ON g.game_id = gp.game_id
      LEFT JOIN players p ON gp.player_id = p.player_id
      WHERE g.game_id = $1
      GROUP BY g.game_id
    `, [gameId]);

        return convertKeysToCamelCase(result.rows[0]);
    }

    // 获取玩家积分历史
    async getScoreHistory(playerId, limit = 50) {
        const result = await this.pool.query(`
      SELECT st.*, g.game_type
      FROM score_transactions st
      LEFT JOIN games g ON st.game_id = g.game_id
      WHERE st.player_id = $1
      ORDER BY st.event_time DESC
      LIMIT $2
    `, [playerId, limit]);

        return convertKeysToCamelCase(result.rows);
    }

    // 获取排行榜
    async getLeaderboard(limit = 10) {
        const result = await this.pool.query(`
      SELECT p.player_id, p.username, s.current_total as score,
             ROW_NUMBER() OVER (ORDER BY s.current_total DESC) as rank
      FROM players p
      JOIN scores s ON p.player_id = s.player_id
      ORDER BY s.current_total DESC
      LIMIT $1
    `, [limit]);

        return result.rows; 
    }

    async getGames(userId) {
        const client = await this.pool.connect();
        // 从game_participants 中获取所有游戏id， 然后查询games表， 获取游戏信息
        // 嵌套列表， 每个游戏包含一个参与者列表， 参与者列表包含玩家信息
        try {
            const result = await client.query(`
                SELECT g.game_id,
       g.game_name,
       g.status,
       g.created_at,
       g.updated_at,
       g.hosted as host_id,
       h.username as host_name,
       (SELECT json_agg(json_build_object(
               'player_id', p.player_id,
               'username', p.username,
               'final_score', gp2.final_score,
               'position', gp2.position
                        )) FROM game_participants gp2
                           join players p on gp2.player_id = p.player_id
        WHERE gp2.game_id = g.game_id) as participants
FROM games g
         left JOIN players h ON g.hosted = h.player_id
WHERE g.game_id IN (
    SELECT game_id FROM game_participants WHERE player_id = $1
)
ORDER BY g.created_at DESC
            `, [userId]);
            // 将时间类型转换为时间戳
            return convertKeysToCamelCase(result.rows);
        } finally {
            client.release();
        }
    }
}

module.exports = { GameServices, convertKeysToCamelCase }; 
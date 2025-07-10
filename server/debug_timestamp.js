const { Pool } = require('pg');
require('dotenv').config();

// 数据库连接配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function debugTimestamp() {
  try {
    // 使用与 getGames 相同的查询
    const userId = '1'; // 使用你测试的用户ID
    const result = await pool.query(`
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
    
    console.log('查询结果数量:', result.rows.length);
    
    if (result.rows.length > 0) {
      console.log('\n第一个游戏记录:');
      console.log(JSON.stringify(result.rows[0], null, 2));
      
      const row = result.rows[0];
      console.log('\n时间字段详细检查:');
      console.log('created_at:', row.created_at);
      console.log('created_at type:', typeof row.created_at);
      console.log('created_at constructor:', row.created_at?.constructor?.name);
      console.log('created_at instanceof Date:', row.created_at instanceof Date);
      
      console.log('updated_at:', row.updated_at);
      console.log('updated_at type:', typeof row.updated_at);
      console.log('updated_at constructor:', row.updated_at?.constructor?.name);
      console.log('updated_at instanceof Date:', row.updated_at instanceof Date);
      
      // 测试转换
      const { convertKeysToCamelCase } = require('./gameServices');
      const converted = convertKeysToCamelCase(row);
      console.log('\n转换后:');
      console.log(JSON.stringify(converted, null, 2));
    } else {
      console.log('没有找到游戏记录');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

debugTimestamp(); 
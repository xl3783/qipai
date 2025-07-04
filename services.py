from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from models import Player, Game, ScoreTransaction
from database_manager import db_manager
import logging

logger = logging.getLogger(__name__)

class GameService:
    """游戏服务类"""
    
    def __init__(self):
        self.db_manager = db_manager
    
    def start_new_game(self, game_type: str, player_ids: List[int], initial_scores: Optional[List[int]] = None) -> Optional[Game]:
        """开始新游戏"""
        try:
            # 创建游戏
            game = Game.create(game_type)
            if not game:
                return None
            
            # 添加参与者
            if initial_scores is None:
                initial_scores = [0] * len(player_ids)
            
            for i, player_id in enumerate(player_ids):
                position = i + 1
                initial_score = initial_scores[i] if i < len(initial_scores) else 0
                game.add_participant(player_id, initial_score, position)
            
            logger.info(f"游戏 {game.game_id} 开始，类型: {game_type}，参与者: {player_ids}")
            return game
            
        except Exception as e:
            logger.error(f"开始新游戏失败: {e}")
            return None
    
    def end_game_with_results(self, game_id: int, player_results: List[Tuple[int, int]]) -> bool:
        """结束游戏并记录结果"""
        try:
            game = Game.get_by_id(game_id)
            if not game:
                logger.error(f"游戏 {game_id} 不存在")
                return False
            
            # 结束游戏
            if not game.end_game():
                return False
            
            # 记录积分变化
            for player_id, points_change in player_results:
                ScoreTransaction.create(player_id, points_change, game_id)
            
            logger.info(f"游戏 {game_id} 结束，结果: {player_results}")
            return True
            
        except Exception as e:
            logger.error(f"结束游戏失败: {e}")
            return False
    
    def get_game_participants(self, game_id: int) -> List[Dict[str, Any]]:
        """获取游戏参与者信息"""
        query = """
        SELECT gp.participation_id, gp.player_id, p.username, gp.initial_score, 
               gp.final_score, gp.position, gp.created_at
        FROM game_participants gp
        JOIN players p ON gp.player_id = p.player_id
        WHERE gp.game_id = %s
        ORDER BY gp.position
        """
        try:
            return self.db_manager.execute_query(query, (game_id,))
        except Exception as e:
            logger.error(f"获取游戏参与者失败: {e}")
            return []

class PlayerService:
    """玩家服务类"""
    
    def __init__(self):
        self.db_manager = db_manager
    
    def register_player(self, username: str) -> Optional[Player]:
        """注册新玩家"""
        try:
            # 检查用户名是否已存在
            existing_player = Player.get_by_username(username)
            if existing_player:
                logger.warning(f"用户名 {username} 已存在")
                return None
            
            # 创建新玩家
            player = Player.create(username)
            if player:
                logger.info(f"玩家 {username} 注册成功，ID: {player.player_id}")
            return player
            
        except Exception as e:
            logger.error(f"注册玩家失败: {e}")
            return None
    
    def get_player_stats(self, player_id: int) -> Dict[str, Any]:
        """获取玩家统计信息"""
        try:
            player = Player.get_by_id(player_id)
            if not player:
                return {}
            
            # 获取当前积分
            current_score = player.get_current_score()
            
            # 获取游戏统计
            game_stats_query = """
            SELECT 
                COUNT(DISTINCT gp.game_id) as total_games,
                COUNT(CASE WHEN g.end_time IS NOT NULL THEN 1 END) as completed_games,
                AVG(gp.final_score - gp.initial_score) as avg_score_change
            FROM game_participants gp
            JOIN games g ON gp.game_id = g.game_id
            WHERE gp.player_id = %s
            """
            game_stats = self.db_manager.execute_single_query(game_stats_query, (player_id,))
            
            # 获取最近积分历史
            recent_transactions = ScoreTransaction.get_player_history(player_id, 10)
            
            return {
                'player_id': player_id,
                'username': player.username,
                'current_score': current_score,
                'total_games': game_stats['total_games'] if game_stats else 0,
                'completed_games': game_stats['completed_games'] if game_stats else 0,
                'avg_score_change': round(game_stats['avg_score_change'], 2) if game_stats and game_stats['avg_score_change'] else 0,
                'recent_transactions': [
                    {
                        'points_change': t.points_change,
                        'current_total': t.current_total,
                        'event_time': t.event_time.isoformat(),
                        'game_id': t.game_id
                    } for t in recent_transactions
                ]
            }
            
        except Exception as e:
            logger.error(f"获取玩家统计失败: {e}")
            return {}
    
    def get_leaderboard(self, limit: int = 10) -> List[Dict[str, Any]]:
        """获取积分排行榜"""
        query = """
        SELECT p.player_id, p.username, s.current_total, s.last_updated
        FROM scores s
        JOIN players p ON s.player_id = p.player_id
        ORDER BY s.current_total DESC
        LIMIT %s
        """
        try:
            return self.db_manager.execute_query(query, (limit,))
        except Exception as e:
            logger.error(f"获取排行榜失败: {e}")
            return []

class ScoreService:
    """积分服务类"""
    
    def __init__(self):
        self.db_manager = db_manager
    
    def award_points(self, player_id: int, points: int, game_id: Optional[int] = None, reason: str = "") -> bool:
        """奖励积分"""
        try:
            if points <= 0:
                logger.error("奖励积分必须为正数")
                return False
            
            transaction = ScoreTransaction.create(player_id, points, game_id)
            if transaction:
                logger.info(f"玩家 {player_id} 获得 {points} 积分，原因: {reason}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"奖励积分失败: {e}")
            return False
    
    def deduct_points(self, player_id: int, points: int, game_id: Optional[int] = None, reason: str = "") -> bool:
        """扣除积分"""
        try:
            if points <= 0:
                logger.error("扣除积分必须为正数")
                return False
            
            transaction = ScoreTransaction.create(player_id, -points, game_id)
            if transaction:
                logger.info(f"玩家 {player_id} 扣除 {points} 积分，原因: {reason}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"扣除积分失败: {e}")
            return False
    
    def get_score_history(self, player_id: int, days: int = 30) -> List[Dict[str, Any]]:
        """获取积分历史"""
        query = """
        SELECT st.transaction_id, st.points_change, st.current_total, st.event_time,
               st.game_id, g.game_type, p.username
        FROM score_transactions st
        LEFT JOIN games g ON st.game_id = g.game_id
        LEFT JOIN players p ON st.player_id = p.player_id
        WHERE st.player_id = %s AND st.event_time >= %s
        ORDER BY st.event_time DESC
        """
        try:
            start_date = datetime.now() - timedelta(days=days)
            return self.db_manager.execute_query(query, (player_id, start_date))
        except Exception as e:
            logger.error(f"获取积分历史失败: {e}")
            return []

# 全局服务实例
game_service = GameService()
player_service = PlayerService()
score_service = ScoreService() 
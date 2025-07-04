from typing import List, Dict, Any, Optional
from datetime import datetime
from database_manager import db_manager
import logging

logger = logging.getLogger(__name__)

class Player:
    """玩家模型类"""
    
    def __init__(self, player_id: Optional[int] = None, username: str = "", created_at: Optional[datetime] = None):
        self.player_id = player_id
        self.username = username
        self.created_at = created_at or datetime.now()
    
    @classmethod
    def create(cls, username: str) -> Optional['Player']:
        """创建新玩家"""
        query = """
        INSERT INTO players (username, created_at) 
        VALUES (%s, %s) 
        RETURNING player_id, username, created_at
        """
        try:
            result = db_manager.execute_single_query(query, (username, datetime.now()))
            if result:
                return cls(**result)
        except Exception as e:
            logger.error(f"创建玩家失败: {e}")
        return None
    
    @classmethod
    def get_by_id(cls, player_id: int) -> Optional['Player']:
        """根据ID获取玩家"""
        query = "SELECT player_id, username, created_at FROM players WHERE player_id = %s"
        try:
            result = db_manager.execute_single_query(query, (player_id,))
            if result:
                return cls(**result)
        except Exception as e:
            logger.error(f"获取玩家失败: {e}")
        return None
    
    @classmethod
    def get_by_username(cls, username: str) -> Optional['Player']:
        """根据用户名获取玩家"""
        query = "SELECT player_id, username, created_at FROM players WHERE username = %s"
        try:
            result = db_manager.execute_single_query(query, (username,))
            if result:
                return cls(**result)
        except Exception as e:
            logger.error(f"获取玩家失败: {e}")
        return None
    
    def get_current_score(self) -> int:
        """获取玩家当前积分"""
        query = "SELECT current_total FROM scores WHERE player_id = %s"
        try:
            result = db_manager.execute_single_query(query, (self.player_id,))
            return result['current_total'] if result else 0
        except Exception as e:
            logger.error(f"获取玩家积分失败: {e}")
            return 0

class Game:
    """游戏模型类"""
    
    def __init__(self, game_id: Optional[int] = None, game_type: str = "", 
                 start_time: Optional[datetime] = None, end_time: Optional[datetime] = None):
        self.game_id = game_id
        self.game_type = game_type
        self.start_time = start_time or datetime.now()
        self.end_time = end_time
    
    @classmethod
    def create(cls, game_type: str) -> Optional['Game']:
        """创建新游戏"""
        query = """
        INSERT INTO games (game_type, start_time) 
        VALUES (%s, %s) 
        RETURNING game_id, game_type, start_time, end_time
        """
        try:
            result = db_manager.execute_single_query(query, (game_type, datetime.now()))
            if result:
                return cls(**result)
        except Exception as e:
            logger.error(f"创建游戏失败: {e}")
        return None
    
    @classmethod
    def get_by_id(cls, game_id: int) -> Optional['Game']:
        """根据ID获取游戏"""
        query = "SELECT game_id, game_type, start_time, end_time FROM games WHERE game_id = %s"
        try:
            result = db_manager.execute_single_query(query, (game_id,))
            if result:
                return cls(**result)
        except Exception as e:
            logger.error(f"获取游戏失败: {e}")
        return None
    
    def end_game(self) -> bool:
        """结束游戏"""
        query = "UPDATE games SET end_time = %s WHERE game_id = %s"
        try:
            affected_rows = db_manager.execute_update(query, (datetime.now(), self.game_id))
            if affected_rows > 0:
                self.end_time = datetime.now()
                return True
        except Exception as e:
            logger.error(f"结束游戏失败: {e}")
        return False
    
    def add_participant(self, player_id: int, initial_score: int = 0, position: Optional[int] = None) -> bool:
        """添加游戏参与者"""
        query = """
        INSERT INTO game_participants (game_id, player_id, initial_score, position) 
        VALUES (%s, %s, %s, %s)
        """
        try:
            db_manager.execute_insert(query, (self.game_id, player_id, initial_score, position))
            return True
        except Exception as e:
            logger.error(f"添加游戏参与者失败: {e}")
            return False

class ScoreTransaction:
    """积分交易模型类"""
    
    def __init__(self, transaction_id: Optional[str] = None, player_id: int = 0, 
                 game_id: Optional[int] = None, points_change: int = 0, 
                 current_total: int = 0, event_time: Optional[datetime] = None):
        self.transaction_id = transaction_id
        self.player_id = player_id
        self.game_id = game_id
        self.points_change = points_change
        self.current_total = current_total
        self.event_time = event_time or datetime.now()
    
    @classmethod
    def create(cls, player_id: int, points_change: int, game_id: Optional[int] = None) -> Optional['ScoreTransaction']:
        """创建积分交易"""
        # 首先获取玩家当前积分
        current_score = Player.get_by_id(player_id).get_current_score() if player_id else 0
        new_total = current_score + points_change
        
        # 检查积分是否足够（如果是扣分）
        if new_total < 0:
            logger.error(f"玩家 {player_id} 积分不足，无法扣除 {points_change} 分")
            return None
        
        # 开始事务
        queries = [
            # 插入积分交易记录
            ("""
            INSERT INTO score_transactions (player_id, game_id, points_change, current_total, event_time) 
            VALUES (%s, %s, %s, %s, %s) 
            RETURNING transaction_id
            """, (player_id, game_id, points_change, new_total, datetime.now())),
            
            # 更新玩家总积分
            ("UPDATE scores SET current_total = %s, last_updated = %s WHERE player_id = %s", 
             (new_total, datetime.now(), player_id))
        ]
        
        # 如果玩家没有积分记录，先创建
        if current_score == 0:
            queries.insert(1, (
                "INSERT INTO scores (player_id, current_total, last_updated) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
                (player_id, new_total, datetime.now())
            ))
        
        try:
            if db_manager.execute_transaction(queries):
                return cls(
                    player_id=player_id,
                    game_id=game_id,
                    points_change=points_change,
                    current_total=new_total,
                    event_time=datetime.now()
                )
        except Exception as e:
            logger.error(f"创建积分交易失败: {e}")
        return None
    
    @classmethod
    def get_player_history(cls, player_id: int, limit: int = 50) -> List['ScoreTransaction']:
        """获取玩家积分历史"""
        query = """
        SELECT transaction_id, player_id, game_id, points_change, current_total, event_time 
        FROM score_transactions 
        WHERE player_id = %s 
        ORDER BY event_time DESC 
        LIMIT %s
        """
        try:
            results = db_manager.execute_query(query, (player_id, limit))
            return [cls(**result) for result in results]
        except Exception as e:
            logger.error(f"获取玩家积分历史失败: {e}")
            return [] 
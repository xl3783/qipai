import psycopg2
from psycopg2.extras import RealDictCursor, execute_values
from typing import List, Dict, Any, Optional, Tuple
import logging
from contextlib import contextmanager
from database_config import db_config

logger = logging.getLogger(__name__)

class DatabaseManager:
    """数据库管理器类，提供基础的数据库操作"""
    
    def __init__(self):
        self.config = db_config
    
    @contextmanager
    def get_connection(self):
        """获取数据库连接的上下文管理器"""
        conn = None
        try:
            conn = self.config.get_connection()
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"数据库操作失败: {e}")
            raise
        finally:
            if conn:
                self.config.return_connection(conn)
    
    def execute_query(self, query: str, params: Optional[Tuple] = None) -> List[Dict[str, Any]]:
        """执行查询语句，返回结果列表"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                return [dict(row) for row in cursor.fetchall()]
    
    def execute_single_query(self, query: str, params: Optional[Tuple] = None) -> Optional[Dict[str, Any]]:
        """执行查询语句，返回单条结果"""
        results = self.execute_query(query, params)
        return results[0] if results else None
    
    def execute_update(self, query: str, params: Optional[Tuple] = None) -> int:
        """执行更新语句，返回影响的行数"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                conn.commit()
                return cursor.rowcount
    
    def execute_insert(self, query: str, params: Optional[Tuple] = None) -> Any:
        """执行插入语句，返回插入的ID或结果"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                conn.commit()
                return cursor.fetchone()[0] if cursor.description else None
    
    def execute_batch_insert(self, query: str, params_list: List[Tuple]) -> None:
        """批量插入数据"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                execute_values(cursor, query, params_list)
                conn.commit()
    
    def execute_transaction(self, queries: List[Tuple[str, Optional[Tuple]]]) -> bool:
        """执行事务，包含多个SQL语句"""
        with self.get_connection() as conn:
            try:
                with conn.cursor() as cursor:
                    for query, params in queries:
                        cursor.execute(query, params)
                conn.commit()
                return True
            except Exception as e:
                conn.rollback()
                logger.error(f"事务执行失败: {e}")
                return False
    
    def test_connection(self) -> bool:
        """测试数据库连接"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    return True
        except Exception as e:
            logger.error(f"数据库连接测试失败: {e}")
            return False

# 全局数据库管理器实例
db_manager = DatabaseManager() 
import os
from typing import Optional
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import RealDictCursor
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConfig:
    """数据库配置类"""
    
    def __init__(self):
        # 数据库连接参数
        self.db_params = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432'),
            'database': os.getenv('DB_NAME', 'qipai'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', ''),
            'sslmode': os.getenv('DB_SSLMODE', 'prefer')
        }
        
        # 连接池配置
        self.pool_min_size = int(os.getenv('DB_POOL_MIN_SIZE', '1'))
        self.pool_max_size = int(os.getenv('DB_POOL_MAX_SIZE', '10'))
        
        # 连接池实例
        self._pool: Optional[SimpleConnectionPool] = None
    
    def get_connection_params(self) -> dict:
        """获取数据库连接参数"""
        return self.db_params.copy()
    
    def create_pool(self) -> SimpleConnectionPool:
        """创建数据库连接池"""
        if self._pool is None:
            try:
                self._pool = SimpleConnectionPool(
                    minconn=self.pool_min_size,
                    maxconn=self.pool_max_size,
                    **self.db_params
                )
                logger.info("数据库连接池创建成功")
            except Exception as e:
                logger.error(f"创建数据库连接池失败: {e}")
                raise
        return self._pool
    
    def get_connection(self):
        """从连接池获取连接"""
        if self._pool is None:
            self.create_pool()
        return self._pool.getconn()
    
    def return_connection(self, conn):
        """归还连接到连接池"""
        if self._pool:
            self._pool.putconn(conn)
    
    def close_pool(self):
        """关闭连接池"""
        if self._pool:
            self._pool.closeall()
            self._pool = None
            logger.info("数据库连接池已关闭")

# 全局数据库配置实例
db_config = DatabaseConfig() 
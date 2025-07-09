#!/usr/bin/env python3
"""
Cursor 数据库连接工具
在 Cursor 中直接连接数据库，实时执行 SQL 查询
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
import sys
from typing import List, Dict, Any, Optional
import json
from datetime import datetime

class CursorDatabaseConnection:
    """Cursor 数据库连接类"""
    
    def __init__(self, config_file: str = "db_config.json"):
        self.config_file = config_file
        self.connection = None
        self.cursor = None
        self.load_config()
    
    def load_config(self):
        """加载数据库配置"""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        else:
            # 默认配置
            self.config = {
                "host": "localhost",
                "port": 5432,
                "database": "qipai",
                "user": "postgres",
                "password": "your_password",
                "sslmode": "prefer"
            }
            self.save_config()
    
    def save_config(self):
        """保存数据库配置"""
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
    
    def connect(self) -> bool:
        """连接数据库"""
        try:
            self.connection = psycopg2.connect(**self.config)
            self.cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            print(f"✅ 成功连接到数据库: {self.config['database']}")
            return True
        except Exception as e:
            print(f"❌ 数据库连接失败: {e}")
            return False
    
    def disconnect(self):
        """断开数据库连接"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        print("🔌 数据库连接已断开")
    
    def execute_query(self, sql: str) -> Optional[List[Dict[str, Any]]]:
        """执行查询语句"""
        try:
            self.cursor.execute(sql)
            if self.cursor.description:  # 有返回结果的查询
                results = self.cursor.fetchall()
                return [dict(row) for row in results]
            else:  # 无返回结果的查询（如 INSERT, UPDATE, DELETE）
                self.connection.commit()
                return None
        except Exception as e:
            print(f"❌ SQL 执行失败: {e}")
            self.connection.rollback()
            return None
    
    def execute_file(self, file_path: str) -> bool:
        """执行 SQL 文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                sql_content = f.read()
            
            # 分割多个 SQL 语句
            statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
            
            success_count = 0
            for i, statement in enumerate(statements, 1):
                if statement.startswith('--'):  # 跳过注释
                    continue
                
                print(f"\n📝 执行第 {i} 条语句:")
                print(f"SQL: {statement[:100]}{'...' if len(statement) > 100 else ''}")
                
                result = self.execute_query(statement)
                if result is not None:
                    print(f"✅ 查询成功，返回 {len(result)} 条记录")
                    if result:
                        self.print_results(result[:5])  # 只显示前5条
                        if len(result) > 5:
                            print(f"... 还有 {len(result) - 5} 条记录")
                else:
                    print("✅ 执行成功")
                    success_count += 1
            
            print(f"\n🎉 文件执行完成，成功执行 {success_count} 条语句")
            return True
            
        except Exception as e:
            print(f"❌ 文件执行失败: {e}")
            return False
    
    def print_results(self, results: List[Dict[str, Any]]):
        """格式化打印查询结果"""
        if not results:
            print("   无数据")
            return
        
        # 获取列名
        columns = list(results[0].keys())
        
        # 计算每列的最大宽度
        col_widths = {}
        for col in columns:
            col_widths[col] = len(str(col))
            for row in results:
                col_widths[col] = max(col_widths[col], len(str(row[col])))
        
        # 打印表头
        header = " | ".join(str(col).ljust(col_widths[col]) for col in columns)
        print(f"   {header}")
        print(f"   {'-' * len(header)}")
        
        # 打印数据行
        for row in results:
            data_row = " | ".join(str(row[col]).ljust(col_widths[col]) for col in columns)
            print(f"   {data_row}")
    
    def interactive_mode(self):
        """交互式模式"""
        print("\n🎯 进入交互式 SQL 模式")
        print("输入 SQL 语句，输入 'quit' 退出，输入 'help' 查看帮助")
        
        while True:
            try:
                sql = input("\nSQL> ").strip()
                
                if sql.lower() == 'quit':
                    break
                elif sql.lower() == 'help':
                    self.show_help()
                    continue
                elif sql.lower() == 'tables':
                    self.show_tables()
                    continue
                elif sql.lower() == 'schema':
                    self.show_schema()
                    continue
                elif not sql:
                    continue
                
                # 执行 SQL
                result = self.execute_query(sql)
                if result is not None:
                    print(f"✅ 查询成功，返回 {len(result)} 条记录")
                    if result:
                        self.print_results(result)
                else:
                    print("✅ 执行成功")
                    
            except KeyboardInterrupt:
                print("\n👋 退出交互模式")
                break
            except Exception as e:
                print(f"❌ 错误: {e}")
    
    def show_help(self):
        """显示帮助信息"""
        help_text = """
📖 可用命令:
  help     - 显示此帮助信息
  tables   - 显示所有表
  schema   - 显示表结构
  quit     - 退出程序

📝 SQL 示例:
  SELECT * FROM players LIMIT 5;
  INSERT INTO players (username) VALUES ('新玩家');
  UPDATE scores SET current_total = 1000 WHERE player_id = 1;
  DELETE FROM players WHERE username = '测试玩家';
        """
        print(help_text)
    
    def show_tables(self):
        """显示所有表"""
        sql = """
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
        """
        result = self.execute_query(sql)
        if result:
            print("📋 数据库表:")
            self.print_results(result)
    
    def show_schema(self):
        """显示表结构"""
        table_name = input("请输入表名: ").strip()
        if not table_name:
            return
        
        sql = f"""
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_name = '{table_name}' AND table_schema = 'public'
        ORDER BY ordinal_position;
        """
        result = self.execute_query(sql)
        if result:
            print(f"📋 表 {table_name} 结构:")
            self.print_results(result)

def main():
    """主函数"""
    print("🎯 Cursor 数据库连接工具")
    print("=" * 50)
    
    # 创建连接实例
    db = CursorDatabaseConnection()
    
    # 连接数据库
    if not db.connect():
        print("\n💡 请检查:")
        print("   1. PostgreSQL 是否已启动")
        print("   2. 数据库配置是否正确")
        print("   3. 网络连接是否正常")
        return
    
    try:
        # 检查命令行参数
        if len(sys.argv) > 1:
            if sys.argv[1] == '--file' and len(sys.argv) > 2:
                # 执行 SQL 文件
                file_path = sys.argv[2]
                if os.path.exists(file_path):
                    db.execute_file(file_path)
                else:
                    print(f"❌ 文件不存在: {file_path}")
            elif sys.argv[1] == '--interactive':
                # 交互模式
                db.interactive_mode()
            else:
                # 执行单条 SQL
                sql = ' '.join(sys.argv[1:])
                result = db.execute_query(sql)
                if result is not None:
                    print(f"✅ 查询成功，返回 {len(result)} 条记录")
                    if result:
                        db.print_results(result)
                else:
                    print("✅ 执行成功")
        else:
            # 默认进入交互模式
            db.interactive_mode()
    
    finally:
        db.disconnect()

if __name__ == "__main__":
    main() 
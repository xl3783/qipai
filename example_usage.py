#!/usr/bin/env python3
"""
棋牌游戏系统示例应用
演示如何使用 Cursor 连接数据库进行编程
"""

import os
import sys
from datetime import datetime
from database_config import db_config
from database_manager import db_manager
from models import Player, Game, ScoreTransaction
from services import game_service, player_service, score_service

def setup_environment():
    """设置环境变量（在实际项目中应该使用 .env 文件）"""
    os.environ.setdefault('DB_HOST', 'localhost')
    os.environ.setdefault('DB_PORT', '5432')
    os.environ.setdefault('DB_NAME', 'qipai')
    os.environ.setdefault('DB_USER', 'postgres')
    os.environ.setdefault('DB_PASSWORD', 'your_password')  # 请修改为实际密码

def test_database_connection():
    """测试数据库连接"""
    print("🔍 测试数据库连接...")
    
    if db_manager.test_connection():
        print("✅ 数据库连接成功！")
        return True
    else:
        print("❌ 数据库连接失败！")
        print("请检查数据库配置和连接参数")
        return False

def demo_player_management():
    """演示玩家管理功能"""
    print("\n👥 玩家管理演示")
    print("=" * 50)
    
    # 注册新玩家
    usernames = ["张三", "李四", "王五", "赵六"]
    players = []
    
    for username in usernames:
        player = player_service.register_player(username)
        if player:
            players.append(player)
            print(f"✅ 玩家 {username} 注册成功，ID: {player.player_id}")
        else:
            print(f"❌ 玩家 {username} 注册失败")
    
    return players

def demo_game_management(players):
    """演示游戏管理功能"""
    print("\n🎮 游戏管理演示")
    print("=" * 50)
    
    if not players:
        print("❌ 没有可用玩家，跳过游戏演示")
        return None
    
    # 开始新游戏
    player_ids = [p.player_id for p in players[:3]]  # 取前3个玩家
    game = game_service.start_new_game("斗地主", player_ids)
    
    if game:
        print(f"✅ 游戏开始成功，游戏ID: {game.game_id}")
        print(f"   游戏类型: {game.game_type}")
        print(f"   参与者: {player_ids}")
        
        # 显示参与者信息
        participants = game_service.get_game_participants(game.game_id)
        print("   参与者详情:")
        for p in participants:
            print(f"     - {p['username']} (位置: {p['position']}, 初始积分: {p['initial_score']})")
        
        return game
    else:
        print("❌ 游戏开始失败")
        return None

def demo_score_management(players, game):
    """演示积分管理功能"""
    print("\n💰 积分管理演示")
    print("=" * 50)
    
    if not players:
        print("❌ 没有可用玩家，跳过积分演示")
        return
    
    # 为玩家奖励初始积分
    for player in players:
        points = 1000  # 初始积分
        if score_service.award_points(player.player_id, points, reason="新玩家奖励"):
            print(f"✅ 玩家 {player.username} 获得 {points} 积分")
        else:
            print(f"❌ 玩家 {player.username} 积分奖励失败")
    
    # 模拟游戏结果
    if game:
        print(f"\n🎯 模拟游戏 {game.game_id} 结果:")
        game_results = [
            (players[0].player_id, 150),   # 玩家1 赢得150分
            (players[1].player_id, -50),   # 玩家2 输掉50分
            (players[2].player_id, -100),  # 玩家3 输掉100分
        ]
        
        if game_service.end_game_with_results(game.game_id, game_results):
            print("✅ 游戏结果记录成功")
        else:
            print("❌ 游戏结果记录失败")

def demo_statistics_and_queries(players):
    """演示统计和查询功能"""
    print("\n📊 统计和查询演示")
    print("=" * 50)
    
    if not players:
        print("❌ 没有可用玩家，跳过统计演示")
        return
    
    # 获取玩家统计信息
    for player in players[:2]:  # 只显示前2个玩家的统计
        stats = player_service.get_player_stats(player.player_id)
        if stats:
            print(f"\n📈 玩家 {stats['username']} 统计信息:")
            print(f"   当前积分: {stats['current_score']}")
            print(f"   总游戏数: {stats['total_games']}")
            print(f"   完成游戏: {stats['completed_games']}")
            print(f"   平均积分变化: {stats['avg_score_change']}")
            
            if stats['recent_transactions']:
                print("   最近积分记录:")
                for trans in stats['recent_transactions'][:3]:  # 只显示最近3条
                    change = trans['points_change']
                    sign = "+" if change > 0 else ""
                    print(f"     {sign}{change} → {trans['current_total']} ({trans['event_time'][:19]})")
    
    # 获取排行榜
    print(f"\n🏆 积分排行榜:")
    leaderboard = player_service.get_leaderboard(5)
    for i, player in enumerate(leaderboard, 1):
        print(f"   {i}. {player['username']} - {player['current_total']} 分")

def demo_advanced_queries():
    """演示高级查询功能"""
    print("\n🔍 高级查询演示")
    print("=" * 50)
    
    # 查询今日积分变化
    today_query = """
    SELECT 
        p.username,
        SUM(st.points_change) as daily_change,
        s.current_total as current_score
    FROM score_transactions st
    JOIN players p ON st.player_id = p.player_id
    JOIN scores s ON st.player_id = s.player_id
    WHERE DATE(st.event_time) = CURRENT_DATE
    GROUP BY p.player_id, p.username, s.current_total
    ORDER BY daily_change DESC
    """
    
    try:
        daily_stats = db_manager.execute_query(today_query)
        if daily_stats:
            print("📅 今日积分变化:")
            for stat in daily_stats:
                change = stat['daily_change']
                sign = "+" if change > 0 else ""
                print(f"   {stat['username']}: {sign}{change} (当前: {stat['current_score']})")
        else:
            print("   今日暂无积分变化")
    except Exception as e:
        print(f"❌ 查询今日积分变化失败: {e}")
    
    # 查询游戏统计
    game_stats_query = """
    SELECT 
        game_type,
        COUNT(*) as total_games,
        COUNT(CASE WHEN end_time IS NOT NULL THEN 1 END) as completed_games,
        AVG(EXTRACT(EPOCH FROM (end_time - start_time))/60) as avg_duration_minutes
    FROM games
    GROUP BY game_type
    """
    
    try:
        game_stats = db_manager.execute_query(game_stats_query)
        if game_stats:
            print("\n🎮 游戏类型统计:")
            for stat in game_stats:
                duration = round(stat['avg_duration_minutes'], 1) if stat['avg_duration_minutes'] else 0
                print(f"   {stat['game_type']}: {stat['completed_games']}/{stat['total_games']} 完成 (平均时长: {duration}分钟)")
    except Exception as e:
        print(f"❌ 查询游戏统计失败: {e}")

def main():
    """主函数"""
    print("🎯 棋牌游戏系统 - 数据库编程示例")
    print("=" * 60)
    
    # 设置环境
    setup_environment()
    
    # 测试数据库连接
    if not test_database_connection():
        print("\n💡 请确保:")
        print("   1. PostgreSQL 数据库已启动")
        print("   2. 数据库 'qipai' 已创建")
        print("   3. 表结构已初始化（运行 ddl.sql）")
        print("   4. 数据库连接参数正确")
        return
    
    try:
        # 演示各种功能
        players = demo_player_management()
        game = demo_game_management(players)
        demo_score_management(players, game)
        demo_statistics_and_queries(players)
        demo_advanced_queries()
        
        print("\n🎉 演示完成！")
        print("\n💡 在 Cursor 中，您可以:")
        print("   1. 使用 Ctrl+Shift+P 打开命令面板")
        print("   2. 输入 'Python: Select Interpreter' 选择 Python 解释器")
        print("   3. 安装依赖: pip install psycopg2-binary")
        print("   4. 运行此脚本: python example_usage.py")
        
    except Exception as e:
        print(f"\n❌ 演示过程中出现错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 
-- ========================================
-- PostgreSQL 分区管理脚本
-- ========================================

-- 1. 为现有分区表添加新分区
-- 添加2024年4月的分区
CREATE TABLE score_transactions_2024_04 PARTITION OF score_transactions
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');

-- 添加2024年5月的分区
CREATE TABLE score_transactions_2024_05 PARTITION OF score_transactions
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');

-- 添加2024年6月的分区
CREATE TABLE score_transactions_2024_06 PARTITION OF score_transactions
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

-- 2. 为分区表创建索引
CREATE INDEX idx_score_transactions_2024_04_player_id ON score_transactions_2024_04(player_id);
CREATE INDEX idx_score_transactions_2024_04_game_id ON score_transactions_2024_04(game_id);
CREATE INDEX idx_score_transactions_2024_04_event_time ON score_transactions_2024_04(event_time);

CREATE INDEX idx_score_transactions_2024_05_player_id ON score_transactions_2024_05(player_id);
CREATE INDEX idx_score_transactions_2024_05_game_id ON score_transactions_2024_05(game_id);
CREATE INDEX idx_score_transactions_2024_05_event_time ON score_transactions_2024_05(event_time);

CREATE INDEX idx_score_transactions_2024_06_player_id ON score_transactions_2024_06(player_id);
CREATE INDEX idx_score_transactions_2024_06_game_id ON score_transactions_2024_06(game_id);
CREATE INDEX idx_score_transactions_2024_06_event_time ON score_transactions_2024_06(event_time);

-- 3. 自动创建分区的函数
CREATE OR REPLACE FUNCTION create_monthly_partition(
    partition_date DATE,
    table_name TEXT DEFAULT 'score_transactions'
) RETURNS TEXT AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
    sql_statement TEXT;
BEGIN
    -- 计算分区名称和日期范围
    partition_name := table_name || '_' || TO_CHAR(partition_date, 'YYYY_MM');
    start_date := DATE_TRUNC('month', partition_date);
    end_date := start_date + INTERVAL '1 month';
    
    -- 检查分区是否已存在
    IF EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = partition_name 
        AND relkind = 'r'
    ) THEN
        RETURN 'Partition ' || partition_name || ' already exists';
    END IF;
    
    -- 创建分区
    sql_statement := format(
        'CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date
    );
    
    EXECUTE sql_statement;
    
    -- 为新分区创建索引
    EXECUTE format('CREATE INDEX idx_%s_player_id ON %I(player_id)', 
                   partition_name, partition_name);
    EXECUTE format('CREATE INDEX idx_%s_game_id ON %I(game_id)', 
                   partition_name, partition_name);
    EXECUTE format('CREATE INDEX idx_%s_event_time ON %I(event_time)', 
                   partition_name, partition_name);
    
    RETURN 'Created partition ' || partition_name;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error creating partition: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 4. 批量创建未来几个月的分区
SELECT create_monthly_partition('2024-07-01');
SELECT create_monthly_partition('2024-08-01');
SELECT create_monthly_partition('2024-09-01');
SELECT create_monthly_partition('2024-10-01');
SELECT create_monthly_partition('2024-11-01');
SELECT create_monthly_partition('2024-12-01');

-- 5. 查看分区信息的函数
CREATE OR REPLACE FUNCTION list_partitions(table_name TEXT DEFAULT 'score_transactions')
RETURNS TABLE (
    partition_name TEXT,
    partition_range TEXT,
    row_count BIGINT,
    size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.relname::TEXT as partition_name,
        pg_get_expr(c.relpartbound, c.oid)::TEXT as partition_range,
        COALESCE(pg_stat_get_live_tuples(c.oid), 0)::BIGINT as row_count,
        pg_size_pretty(pg_total_relation_size(c.oid))::TEXT as size
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relispartition = true
    AND c.relname LIKE table_name || '_%'
    ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql;

-- 6. 删除旧分区的函数（谨慎使用）
CREATE OR REPLACE FUNCTION drop_old_partition(
    partition_date DATE,
    table_name TEXT DEFAULT 'score_transactions'
) RETURNS TEXT AS $$
DECLARE
    partition_name TEXT;
    sql_statement TEXT;
BEGIN
    -- 计算分区名称
    partition_name := table_name || '_' || TO_CHAR(partition_date, 'YYYY_MM');
    
    -- 检查分区是否存在
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = partition_name 
        AND relkind = 'r'
    ) THEN
        RETURN 'Partition ' || partition_name || ' does not exist';
    END IF;
    
    -- 删除分区
    sql_statement := format('DROP TABLE %I', partition_name);
    EXECUTE sql_statement;
    
    RETURN 'Dropped partition ' || partition_name;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error dropping partition: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 7. 分区维护函数
CREATE OR REPLACE FUNCTION maintain_partitions(
    months_ahead INTEGER DEFAULT 3,
    months_to_keep INTEGER DEFAULT 12
) RETURNS TEXT AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    future_date DATE;
    old_date DATE;
    result TEXT := '';
BEGIN
    -- 创建未来几个月的分区
    FOR i IN 1..months_ahead LOOP
        future_date := current_date + (i || ' months')::INTERVAL;
        result := result || create_monthly_partition(future_date) || E'\n';
    END LOOP;
    
    -- 删除过旧的分区（可选）
    -- 注意：在生产环境中要谨慎使用，确保数据已备份
    /*
    FOR i IN months_to_keep..(months_to_keep + 6) LOOP
        old_date := current_date - (i || ' months')::INTERVAL;
        result := result || drop_old_partition(old_date) || E'\n';
    END LOOP;
    */
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. 查看当前分区状态
SELECT * FROM list_partitions();

-- 9. 分区性能监控查询
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename LIKE 'score_transactions_%'
ORDER BY tablename, attname;

-- 10. 分区数据分布查询
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
WHERE tablename LIKE 'score_transactions_%'
ORDER BY tablename;

-- 使用示例：
-- 1. 创建下个月的分区
-- SELECT create_monthly_partition('2024-12-01');

-- 2. 查看所有分区
-- SELECT * FROM list_partitions();

-- 3. 维护分区（创建未来3个月的分区）
-- SELECT maintain_partitions(3);

-- 4. 删除旧分区（谨慎使用）
-- SELECT drop_old_partition('2023-01-01'); 
# SQL 到 PostgreSQL 语法转换说明

## 概述
本项目将原有的SQL文件转换为标准的PostgreSQL语法，并添加了PostgreSQL特有的功能和优化。

## 转换的文件

### 1. ddl.sql
**主要改进：**
- 添加了分区表的具体实现（按月分区）
- 改进了外键约束的语法
- 增加了更多索引以提高查询性能
- 添加了复合索引

**PostgreSQL特性：**
- 使用 `PARTITION BY RANGE` 进行表分区
- 使用 `gen_random_uuid()` 生成UUID
- 添加了 `TIMESTAMPTZ` 类型支持时区

### 2. function.sql
**主要改进：**
- 添加了完整的错误检查逻辑
- 改进了变量声明和格式化
- 添加了异常处理机制
- 增加了游戏状态和玩家数量验证

**PostgreSQL特性：**
- 使用 `RAISE EXCEPTION` 进行错误处理
- 使用 `FOR UPDATE` 进行行级锁定
- 添加了自定义枚举类型支持

### 3. query.sql
**主要改进：**
- 使用参数化查询（`$1`, `$2`）替代硬编码值
- 改进了JOIN语法，使用 `INNER JOIN` 和 `LEFT JOIN`
- 添加了 `COALESCE` 函数处理NULL值
- 改进了查询的可读性和性能

**PostgreSQL特性：**
- 使用参数化查询防止SQL注入
- 利用PostgreSQL的查询优化器

### 4. other.sql
**主要改进：**
- 改进了约束命名规范
- 增强了触发器函数的错误处理
- 添加了DELETE操作的支持
- 改进了JSONB通知功能

**PostgreSQL特性：**
- 使用 `JSONB` 类型进行结构化数据
- 使用 `pg_notify` 进行实时通知
- 添加了 `COALESCE` 函数处理NULL值

### 5. postgresql_complete.sql（新增）
**新增功能：**
- 完整的数据库架构
- 自定义枚举类型
- 扩展的玩家和游戏表结构
- 完整的函数库
- 视图和物化视图
- 完整的索引策略
- 注释和文档

**PostgreSQL特有功能：**
- 自定义枚举类型 `game_status`
- 表分区
- 物化视图
- 触发器
- 扩展支持
- 完整的约束和索引

### 6. partition_management.sql（新增）
**分区管理功能：**
- 自动创建月度分区
- 分区信息查看
- 旧分区清理
- 分区维护函数
- 性能监控查询

### 7. partition_cron_job.sql（新增）
**定时任务：**
- 自动创建新分区
- 定期检查分区状态
- 自动清理旧分区（可选）

## PostgreSQL 特有功能说明

### 1. 表分区
```sql
CREATE TABLE score_transactions (
    -- 字段定义
) PARTITION BY RANGE (event_time);

CREATE TABLE score_transactions_2024_01 PARTITION OF score_transactions
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

**后续分区管理：**
```sql
-- 手动添加新分区
CREATE TABLE score_transactions_2024_04 PARTITION OF score_transactions
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');

-- 使用函数自动创建分区
SELECT create_monthly_partition('2024-04-01');

-- 查看分区信息
SELECT * FROM list_partitions();
```

### 2. 自定义枚举类型
```sql
CREATE TYPE game_status AS ENUM ('waiting', 'playing', 'finished', 'cancelled');
```

### 3. 物化视图
```sql
CREATE MATERIALIZED VIEW game_summary AS
SELECT -- 查询定义
```

### 4. JSONB 支持
```sql
jsonb_build_object(
    'type', 'participant',
    'game_id', NEW.game_id,
    -- 更多字段
)
```

### 5. 扩展支持
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_cron";  -- 用于定时任务
```

## 分区管理详解

### 分区策略
- **按月分区**：适合时间序列数据
- **自动创建**：提前创建未来几个月的分区
- **自动清理**：删除过旧的分区（可选）

### 分区管理函数

#### 1. 创建分区
```sql
-- 创建指定月份的分区
SELECT create_monthly_partition('2024-04-01');

-- 批量创建未来几个月的分区
SELECT maintain_partitions(3);  -- 创建未来3个月的分区
```

#### 2. 查看分区
```sql
-- 查看所有分区信息
SELECT * FROM list_partitions();

-- 查看分区数据分布
SELECT 
    schemaname,
    tablename,
    n_live_tup as live_tuples,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_stat_user_tables 
WHERE tablename LIKE 'score_transactions_%';
```

#### 3. 删除分区
```sql
-- 删除指定月份的分区（谨慎使用）
SELECT drop_old_partition('2023-01-01');
```

### 定时任务管理

#### 1. 设置定时任务
```sql
-- 每月自动创建新分区
SELECT cron.schedule(
    'create-monthly-partitions',
    '0 2 1 * *',  -- 每月1号凌晨2点
    'SELECT maintain_partitions(3);'
);

-- 每周检查分区状态
SELECT cron.schedule(
    'check-partition-status',
    '0 3 * * 0',  -- 每周日凌晨3点
    'SELECT * FROM list_partitions();'
);
```

#### 2. 管理定时任务
```sql
-- 查看所有定时任务
SELECT * FROM cron.job;

-- 删除定时任务
SELECT cron.unschedule('create-monthly-partitions');
```

### 分区性能优化

#### 1. 索引策略
- 为每个分区创建相同的索引
- 使用复合索引优化查询
- 定期更新统计信息

#### 2. 查询优化
- 利用分区裁剪（Partition Pruning）
- 使用时间范围查询
- 避免跨分区的全表扫描

#### 3. 维护建议
- 定期创建新分区
- 监控分区大小和行数
- 及时清理旧分区
- 更新分区统计信息

## 性能优化

### 索引策略
- 为所有外键创建索引
- 为时间字段创建索引
- 创建复合索引优化多字段查询
- 为物化视图创建索引
- 为每个分区创建索引

### 查询优化
- 使用参数化查询
- 利用PostgreSQL的查询优化器
- 使用适当的JOIN类型
- 添加COALESCE处理NULL值
- 利用分区裁剪提高性能

## 使用建议

1. **部署前检查：**
   - 确保PostgreSQL版本 >= 12
   - 安装必要的扩展（uuid-ossp, pg_stat_statements, pg_cron）
   - 检查权限设置
   - 配置分区策略

2. **性能监控：**
   - 使用 `pg_stat_statements` 监控查询性能
   - 定期刷新物化视图
   - 监控分区表的使用情况
   - 检查分区裁剪效果

3. **维护建议：**
   - 定期创建新的分区表
   - 清理旧的分区数据
   - 更新统计信息
   - 监控分区大小和性能

4. **分区管理：**
   - 设置自动分区创建任务
   - 定期检查分区状态
   - 根据数据量调整分区策略
   - 备份重要分区数据

## 兼容性说明

- 所有SQL都兼容PostgreSQL 12+
- 使用了PostgreSQL特有的功能，不兼容其他数据库
- 分区功能需要PostgreSQL 10+
- 定时任务需要pg_cron扩展
- 建议在生产环境使用前进行充分测试

## 文件结构

```
├── ddl.sql                    # 数据定义语言（已转换）
├── function.sql               # 函数定义（已转换）
├── query.sql                  # 查询语句（已转换）
├── other.sql                  # 其他SQL（已转换）
├── postgresql_complete.sql    # 完整的PostgreSQL版本（新增）
├── partition_management.sql   # 分区管理脚本（新增）
├── partition_cron_job.sql     # 定时任务脚本（新增）
└── README_PostgreSQL_Conversion.md  # 本说明文件
```

## 快速开始

1. **创建数据库结构：**
   ```sql
   \i postgresql_complete.sql
   ```

2. **设置分区管理：**
   ```sql
   \i partition_management.sql
   ```

3. **配置定时任务（可选）：**
   ```sql
   \i partition_cron_job.sql
   ```

4. **验证分区：**
   ```sql
   SELECT * FROM list_partitions();
   ``` 
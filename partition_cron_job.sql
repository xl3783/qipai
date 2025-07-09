-- ========================================
-- PostgreSQL 分区自动管理定时任务
-- ========================================

-- 注意：需要安装 pg_cron 扩展
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. 每月自动创建新分区的任务
-- 每月1号凌晨2点执行
SELECT cron.schedule(
    'create-monthly-partitions',
    '0 2 1 * *',  -- 每月1号凌晨2点
    'SELECT maintain_partitions(3);'
);

-- 2. 每周检查分区状态的任务
-- 每周日凌晨3点执行
SELECT cron.schedule(
    'check-partition-status',
    '0 3 * * 0',  -- 每周日凌晨3点
    'SELECT * FROM list_partitions();'
);

-- 3. 每月清理旧分区的任务（谨慎使用）
-- 每月15号凌晨4点执行
-- SELECT cron.schedule(
--     'cleanup-old-partitions',
--     '0 4 15 * *',  -- 每月15号凌晨4点
--     'SELECT drop_old_partition(CURRENT_DATE - INTERVAL ''13 months'');'
-- );

-- 4. 查看所有定时任务
SELECT 
    jobid,
    schedule,
    command,
    nodename,
    nodeport,
    database,
    username,
    active
FROM cron.job;

-- 5. 删除定时任务（如果需要）
-- SELECT cron.unschedule('create-monthly-partitions');
-- SELECT cron.unschedule('check-partition-status');
-- SELECT cron.unschedule('cleanup-old-partitions');

-- 6. 手动执行分区维护
-- SELECT maintain_partitions(3);

-- 7. 查看分区状态
-- SELECT * FROM list_partitions(); 
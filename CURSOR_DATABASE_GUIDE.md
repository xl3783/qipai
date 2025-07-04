# Cursor 数据库管理指南

## 🎯 目标
在 Cursor 中获得类似 DataGrip 或 DBeaver 的数据库管理体验，包括：
- 可视化数据库连接管理
- 智能 SQL 编辑器
- 实时查询执行
- 结果集可视化
- 表结构浏览
- 数据导出功能

## 📦 安装必要的扩展

### 1. 核心扩展
在 Cursor 中安装以下扩展：

1. **SQLTools** (`mtxr.sqltools`)
   - 主要的数据库管理扩展
   - 提供连接管理、查询执行、结果查看等功能

2. **SQLTools PostgreSQL Driver** (`mtxr.sqltools-driver-pg`)
   - PostgreSQL 数据库驱动
   - 支持 PostgreSQL 特有功能

3. **PostgreSQL Formatter** (`bradymholt.pgformatter`)
   - SQL 代码格式化
   - 支持 PostgreSQL 语法高亮

### 2. 可选扩展
- **MySQL Client** (`cweijan.vscode-mysql-client2`) - MySQL 支持
- **YAML** (`redhat.vscode-yaml`) - 配置文件支持
- **JSON** (`ms-vscode.vscode-json`) - JSON 文件支持

## 🔧 配置数据库连接

### 1. 修改连接配置
编辑 `db_config.json` 文件，设置您的数据库连接参数：

```json
{
  "host": "localhost",
  "port": 5432,
  "database": "qipai",
  "user": "postgres",
  "password": "your_actual_password",
  "sslmode": "prefer"
}
```

### 2. 使用工作区配置
双击 `qipai.code-workspace` 文件打开工作区，所有配置将自动加载。

## 🚀 开始使用

### 1. 连接数据库
1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 `SQLTools: Connect` 并选择
3. 选择 "Qipai Database" 连接
4. 输入密码（如果需要）

### 2. 执行 SQL 查询
在 SQL 文件中：
1. 编写 SQL 语句
2. 使用快捷键 `Ctrl+Shift+E` 执行整个文件
3. 使用快捷键 `Ctrl+Shift+R` 执行当前选中的查询
4. 或右键选择 "Run Query"

### 3. 查看结果
- 查询结果会在新的标签页中显示
- 支持表格视图和 JSON 视图
- 可以导出为 CSV、JSON 或 XML 格式

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+E` | 执行 SQL 文件 |
| `Ctrl+Shift+R` | 执行当前查询 |
| `Ctrl+Shift+C` | 连接数据库 |
| `Ctrl+Shift+D` | 断开数据库连接 |
| `Ctrl+Shift+F` | 格式化 SQL |
| `Ctrl+Shift+S` | 保存查询结果 |
| `Ctrl+Shift+T` | 显示表列表 |
| `Ctrl+Shift+I` | 显示记录 |
| `Ctrl+Shift+H` | 显示查询历史 |

## 📝 SQL 代码片段

### 快速输入常用查询
在 SQL 文件中输入以下前缀，然后按 `Tab` 键：

| 前缀 | 功能 | 示例 |
|------|------|------|
| `sel` | 查询所有记录 | `SELECT * FROM table LIMIT 10;` |
| `selc` | 查询指定列 | `SELECT col1, col2 FROM table WHERE condition;` |
| `ins` | 插入记录 | `INSERT INTO table (col1, col2) VALUES (val1, val2);` |
| `upd` | 更新记录 | `UPDATE table SET col1 = val1 WHERE condition;` |
| `del` | 删除记录 | `DELETE FROM table WHERE condition;` |
| `join` | 表连接 | `SELECT t1.col1, t2.col1 FROM table1 t1 INNER JOIN table2 t2 ON t1.id = t2.id;` |
| `grp` | 分组查询 | `SELECT col1, COUNT(*) FROM table GROUP BY col1;` |
| `win` | 窗口函数 | `SELECT col1, ROW_NUMBER() OVER (PARTITION BY col2 ORDER BY col3);` |
| `cte` | 公共表表达式 | `WITH cte AS (SELECT col1 FROM table) SELECT * FROM cte;` |
| `player` | 玩家查询 | 查询玩家和积分信息 |
| `game` | 游戏查询 | 查询游戏状态信息 |
| `score` | 积分查询 | 查询积分交易记录 |
| `leader` | 排行榜 | 查询玩家排行榜 |

## 🗂️ 文件结构

```
qipai/
├── .vscode/                    # Cursor/VSCode 配置
│   ├── settings.json          # 数据库连接和编辑器设置
│   ├── tasks.json             # 任务配置
│   ├── keybindings.json       # 快捷键配置
│   └── sql.code-snippets      # SQL 代码片段
├── sql_workspace.sql          # SQL 工作区文件
├── cursor_db_connection.py    # 数据库连接工具
├── db_config.json             # 数据库配置
├── qipai.code-workspace       # 工作区配置
├── ddl.sql                    # 数据库结构
├── test_data.sql              # 测试数据
└── CURSOR_DATABASE_GUIDE.md   # 本指南
```

## 🔍 数据库浏览功能

### 1. 查看表结构
1. 在左侧活动栏点击 SQLTools 图标
2. 展开数据库连接
3. 展开 "Tables" 节点
4. 右键点击表名选择 "Describe Table"

### 2. 查看表数据
1. 右键点击表名
2. 选择 "Show Records"
3. 可以设置 LIMIT 和 WHERE 条件

### 3. 查看索引
1. 展开表的 "Indexes" 节点
2. 查看表的索引信息

### 4. 查看外键
1. 展开表的 "Foreign Keys" 节点
2. 查看表的外键关系

## 📊 查询结果管理

### 1. 结果视图
- **Table View**: 表格形式显示结果
- **JSON View**: JSON 格式显示结果
- **Chart View**: 图表形式显示结果（如果支持）

### 2. 结果操作
- **Export**: 导出为 CSV、JSON、XML 格式
- **Copy**: 复制结果到剪贴板
- **Save**: 保存结果到文件
- **Refresh**: 重新执行查询

### 3. 结果限制
- 默认最多显示 1000 行
- 可以在设置中调整 `sqltools.results.maxRows`

## 🛠️ 高级功能

### 1. 查询历史
- 按 `Ctrl+Shift+H` 查看查询历史
- 可以重新执行历史查询
- 支持搜索和过滤

### 2. 查询格式化
- 按 `Ctrl+Shift+F` 格式化 SQL
- 支持自定义格式化规则
- 自动格式化保存

### 3. 智能提示
- 表名自动补全
- 列名自动补全
- 函数名自动补全
- 语法错误提示

### 4. 事务管理
- 支持事务开始/提交/回滚
- 自动事务管理
- 事务状态显示

## 🚨 故障排除

### 1. 连接失败
- 检查数据库是否启动
- 验证连接参数是否正确
- 确认网络连接正常
- 检查防火墙设置

### 2. 查询执行失败
- 检查 SQL 语法
- 确认表名和列名正确
- 验证权限设置
- 查看错误日志

### 3. 扩展不工作
- 重新安装扩展
- 重启 Cursor
- 检查扩展版本兼容性
- 查看扩展日志

## 📚 最佳实践

### 1. SQL 编写
- 使用大写关键字
- 适当的缩进和换行
- 添加注释说明
- 使用参数化查询

### 2. 查询优化
- 使用适当的索引
- 避免 SELECT *
- 使用 LIMIT 限制结果
- 优化 JOIN 查询

### 3. 数据管理
- 定期备份数据
- 使用事务保证一致性
- 监控查询性能
- 清理无用数据

## 🎉 开始体验

现在您可以：
1. 打开 `qipai.code-workspace` 工作区
2. 连接数据库
3. 在 `sql_workspace.sql` 中编写和测试 SQL
4. 享受类似 DataGrip 的数据库管理体验！

## 📞 支持

如果遇到问题：
1. 查看 Cursor 的输出面板
2. 检查 SQLTools 扩展日志
3. 参考 PostgreSQL 官方文档
4. 在 GitHub 上提交问题 
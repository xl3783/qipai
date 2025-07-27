# 生产环境设置指南

## 概述
本项目已配置为支持生产环境构建，通过设置 `NODE_ENV=production` 来启用生产环境优化。

## 快速开始

### 方法1：使用脚本设置（推荐）
```bash
# 设置生产环境
source set-production.sh

# 然后运行构建命令
npm run build:h5          # 构建 H5 版本
npm run build:weapp       # 构建微信小程序
```

### 方法2：直接在命令行设置
```bash
# 设置环境变量并构建
NODE_ENV=production npm run build:h5
NODE_ENV=production npm run build:weapp
```

### 方法3：永久设置环境变量
```bash
# 在 ~/.zshrc 或 ~/.bashrc 中添加
export NODE_ENV=production
```

## 可用的构建命令

| 命令 | 说明 | 输出目录 |
|------|------|----------|
| `npm run build:h5` | 构建 H5 版本 | `dist/h5/` |
| `npm run build:weapp` | 构建微信小程序 | `dist/weapp/` |
| `npm run build:alipay` | 构建支付宝小程序 | `dist/alipay/` |
| `npm run build:tt` | 构建头条小程序 | `dist/tt/` |
| `npm run build:swan` | 构建百度小程序 | `dist/swan/` |
| `npm run build:qq` | 构建 QQ 小程序 | `dist/qq/` |
| `npm run build:jd` | 构建京东小程序 | `dist/jd/` |
| `npm run build:rn` | 构建 React Native | `dist/rn/` |
| `npm run build:quickapp` | 构建快应用 | `dist/quickapp/` |
| `npm run build:harmony-hybrid` | 构建鸿蒙应用 | `dist/harmony-hybrid/` |

## 生产环境特性

### 1. 代码优化
- 代码压缩和混淆
- 移除 console 和 debugger 语句
- 优化包体积

### 2. 性能优化
- 启用代码分割
- 文件名使用 contenthash 进行缓存优化
- CSS 文件优化

### 3. 日志配置
- 生产环境静默日志
- 移除开发环境统计信息

## 开发环境 vs 生产环境

| 特性 | 开发环境 | 生产环境 |
|------|----------|----------|
| 代码压缩 | ❌ | ✅ |
| 移除 console | ❌ | ✅ |
| 源码映射 | ✅ | ❌ |
| 热重载 | ✅ | ❌ |
| 详细日志 | ✅ | ❌ |

## 故障排除

### 1. 模块找不到错误
```bash
# 重新安装依赖
npm install
```

### 2. 构建失败
```bash
# 清理缓存并重新构建
rm -rf dist/
rm -rf node_modules/.cache/
npm run build:h5
```

### 3. 环境变量不生效
```bash
# 检查环境变量
echo $NODE_ENV

# 重新设置
export NODE_ENV=production
```

## 部署建议

1. **H5 部署**：将 `dist/h5/` 目录部署到 Web 服务器
2. **小程序部署**：将 `dist/weapp/` 目录上传到微信开发者工具
3. **CDN 配置**：建议配置 CDN 加速静态资源加载
4. **缓存策略**：利用 contenthash 文件名实现长期缓存

## 监控和分析

- 使用 webpack-bundle-analyzer 分析包体积
- 监控首屏加载时间
- 关注资源加载性能 
#!/bin/bash

# 用于从GitHub拉取代码并启动服务器

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在正确的目录
if [ ! -f "server/package.json" ]; then
    log_error "请在项目根目录下运行此脚本"
    exit 1
fi

# 检查Git是否安装
if ! command -v git &> /dev/null; then
    log_error "Git未安装，请先安装Git"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    log_error "Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    log_error "npm未安装，请先安装npm"
    exit 1
fi

log_info "开始部署流程..."

# 1. 拉取最新代码
log_info "正在从GitHub拉取最新代码..."
if git pull origin main 2>/dev/null || git pull origin master 2>/dev/null; then
    log_success "代码拉取成功"
else
    log_warning "代码拉取失败，可能没有远程仓库或网络问题"
fi

# 2. 进入server目录
log_info "进入server目录..."
cd server

# 3. 安装依赖
log_info "正在安装npm依赖..."
if npm install; then
    log_success "依赖安装成功"
else
    log_error "依赖安装失败"
    exit 1
fi

# 4. 检查环境变量文件
if [ ! -f ".env" ]; then
    log_warning "未找到.env文件，请确保环境变量已正确配置"
    log_info "可以复制config.example.js为config.js并配置相关参数"
fi

# 5. 启动服务器
log_info "正在启动服务器..."
log_info "使用命令: npm run start"
npm run start 
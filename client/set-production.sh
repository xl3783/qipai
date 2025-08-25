#!/bin/bash

# 设置生产环境变量
export NODE_ENV=production

echo "✅ 生产环境已设置"
echo "NODE_ENV = $NODE_ENV"

# 显示可用的构建命令
echo ""
echo "📋 可用的生产环境构建命令："
echo "  npm run build:h5          # 构建 H5 版本"
echo "  npm run build:weapp       # 构建微信小程序"
echo "  npm run build:alipay      # 构建支付宝小程序"
echo "  npm run build:tt          # 构建头条小程序"
echo "  npm run build:swan        # 构建百度小程序"
echo "  npm run build:qq          # 构建 QQ 小程序"
echo "  npm run build:jd          # 构建京东小程序"
echo "  npm run build:rn          # 构建 React Native"
echo "  npm run build:quickapp    # 构建快应用"
echo "  npm run build:harmony-hybrid # 构建鸿蒙应用" 
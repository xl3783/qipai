#!/bin/bash

echo "🚀 启动API集成测试..."

# 运行API集成测试
echo "🧪 运行HTTP API集成测试..."
npm test -- api-integration.test.js

echo "✅ API集成测试完成！" 
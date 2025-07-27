// 环境变量配置
export interface EnvConfig {
  // 环境标识
  NODE_ENV: 'development' | 'production' | 'test';
  
  // API配置
  API_BASE_URL: string;
  GRAPHQL_ENDPOINT: string;
  WS_ENDPOINT: string;
  
  // 微信配置
  WX_APPID?: string;
  WX_SECRET?: string;
  
  // JWT配置
  JWT_SECRET?: string;
  
  // 客户端配置
  CLIENT_URL?: string;
}

// 开发环境配置
const devEnv: EnvConfig = {
  NODE_ENV: 'development',
  API_BASE_URL: 'http://localhost:3000',
  GRAPHQL_ENDPOINT: 'http://localhost:15000/graphql',
  WS_ENDPOINT: 'ws://localhost:4000/subscriptions',
  CLIENT_URL: 'http://localhost:3000',
};

// 生产环境配置
const prodEnv: EnvConfig = {
  NODE_ENV: 'production',
  API_BASE_URL: 'http://47.113.229.69:3000',
  GRAPHQL_ENDPOINT: 'http://47.113.229.69:15000/graphql',
  WS_ENDPOINT: 'wss://47.113.229.69:4000/subscriptions',
  CLIENT_URL: 'https://your-production-domain.com',
};

// 测试环境配置
const testEnv: EnvConfig = {
  NODE_ENV: 'test',
  API_BASE_URL: 'https://api.example.com',
  GRAPHQL_ENDPOINT: 'https://api.example.com/graphql',
  WS_ENDPOINT: 'wss://api.example.com/subscriptions',
  CLIENT_URL: 'https://test.example.com',
};

// 获取环境配置
export const getEnvConfig = (): EnvConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return { ...prodEnv, ...process.env };
    case 'test':
      return { ...testEnv, ...process.env };
    case 'development':
    default:
      return { ...devEnv, ...process.env };
  }
};

// 导出当前环境配置
export const envConfig = getEnvConfig(); 
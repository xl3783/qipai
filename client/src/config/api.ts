// 简化的API配置文件
export interface ApiConfig {
  // 基础URL配置
  baseURL: string;
  graphqlURL: string;
  wsURL: string;
}

// 开发环境配置
const devConfig: ApiConfig = {
  baseURL: 'http://localhost:3000',
  graphqlURL: 'http://localhost:15000/graphql',
  wsURL: 'ws://localhost:4000/subscriptions',
};

// 生产环境配置
const prodConfig: ApiConfig = {
  baseURL: 'http://47.113.229.69:3000',
  graphqlURL: 'http://47.113.229.69:15000/graphql',
  wsURL: 'wss://47.113.229.69:4000/subscriptions',
};

// 测试环境配置
const testConfig: ApiConfig = {
  baseURL: 'https://api.example.com',
  graphqlURL: 'https://api.example.com/graphql',
  wsURL: 'wss://api.example.com/subscriptions',
};

// 根据环境变量选择配置
const getApiConfig = (): ApiConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return prodConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return devConfig;
  }
};

// 导出配置
export const apiConfig = getApiConfig();

// 导出配置获取函数
export { getApiConfig }; 
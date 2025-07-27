// 配置入口文件
import { apiConfig, getApiConfig } from './api';
import { envConfig, getEnvConfig } from './env';

export { apiConfig, getApiConfig } from './api';
export { envConfig, getEnvConfig } from './env';

// 重新导出类型
export type { ApiConfig } from './api';
export type { EnvConfig } from './env';

// 默认导出所有配置
export default {
  api: apiConfig,
  env: envConfig,
}; 
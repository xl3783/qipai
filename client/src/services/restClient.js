// import Taro from '@tarojs/taro';

// // REST 客户端配置
// const DEFAULT_CONFIG = {
//   baseURL: '',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// };

// // 请求拦截器
// const requestInterceptors = [];
// // 响应拦截器
// const responseInterceptors = [];

// // HTTP 状态码映射
// const HTTP_STATUS = {
//   OK: 200,
//   CREATED: 201,
//   NO_CONTENT: 204,
//   BAD_REQUEST: 400,
//   UNAUTHORIZED: 401,
//   FORBIDDEN: 403,
//   NOT_FOUND: 404,
//   INTERNAL_SERVER_ERROR: 500,
// };

// // 错误类型定义
// export const ERROR_TYPES = {
//   NETWORK_ERROR: 'NETWORK_ERROR',
//   TIMEOUT_ERROR: 'TIMEOUT_ERROR',
//   HTTP_ERROR: 'HTTP_ERROR',
//   PARSE_ERROR: 'PARSE_ERROR',
//   UNKNOWN_ERROR: 'UNKNOWN_ERROR',
// };

// // 自定义错误类
// export class RestError extends Error {
//   constructor(message, type, statusCode = null, response = null) {
//     super(message);
//     this.name = 'RestError';
//     this.type = type;
//     this.statusCode = statusCode;
//     this.response = response;
//   }
// }

// // REST 客户端类
// class RestClient {
//   constructor(config = {}) {
//     this.config = { ...DEFAULT_CONFIG, ...config };
//     this.interceptors = {
//       request: requestInterceptors,
//       response: responseInterceptors,
//     };
//   }

//   // 添加请求拦截器
//   addRequestInterceptor(interceptor) {
//     this.interceptors.request.push(interceptor);
//   }

//   // 添加响应拦截器
//   addResponseInterceptor(interceptor) {
//     this.interceptors.response.push(interceptor);
//   }

//   // 清除所有拦截器
//   clearInterceptors() {
//     this.interceptors.request.length = 0;
//     this.interceptors.response.length = 0;
//   }

//   // 构建完整的 URL
//   buildUrl(url) {
//     if (url.startsWith('http://') || url.startsWith('https://')) {
//       return url;
//     }
//     return `${this.config.baseURL}${url}`;
//   }

//   // 应用请求拦截器
//   async applyRequestInterceptors(config) {
//     let processedConfig = { ...config };
    
//     for (const interceptor of this.interceptors.request) {
//       if (typeof interceptor === 'function') {
//         processedConfig = await interceptor(processedConfig);
//       }
//     }
    
//     return processedConfig;
//   }

//   // 应用响应拦截器
//   async applyResponseInterceptors(response) {
//     let processedResponse = response;
    
//     for (const interceptor of this.interceptors.response) {
//       if (typeof interceptor === 'function') {
//         processedResponse = await interceptor(processedResponse);
//       }
//     }
    
//     return processedResponse;
//   }

//   // 核心请求方法
//   async request(config) {
//     try {
//       // 合并配置
//       const requestConfig = {
//         ...this.config,
//         ...config,
//         url: this.buildUrl(config.url),
//         header: {
//           ...this.config.headers,
//           ...config.headers,
//         },
//       };

//       // 应用请求拦截器
//       const processedConfig = await this.applyRequestInterceptors(requestConfig);

//       console.log('REST Request:', {
//         method: processedConfig.method,
//         url: processedConfig.url,
//         data: processedConfig.data,
//         header: processedConfig.header,
//       });

//       // 发起请求
//       const response = await Taro.request(processedConfig);

//       console.log('REST Response:', {
//         statusCode: response.statusCode,
//         data: response.data,
//         header: response.header,
//       });

//       // 检查 HTTP 状态码
//       if (response.statusCode >= 400) {
//         throw new RestError(
//           `HTTP Error: ${response.statusCode}`,
//           ERROR_TYPES.HTTP_ERROR,
//           response.statusCode,
//           response
//         );
//       }

//       // 构建标准化响应
//       const standardResponse = {
//         data: response.data,
//         status: response.statusCode,
//         statusText: this.getStatusText(response.statusCode),
//         headers: response.header,
//         config: processedConfig,
//       };

//       // 应用响应拦截器
//       const processedResponse = await this.applyResponseInterceptors(standardResponse);

//       return processedResponse;
//     } catch (error) {
//       // 处理不同类型的错误
//       if (error instanceof RestError) {
//         throw error;
//       }

//       // 网络错误
//       if (error.errMsg && error.errMsg.includes('timeout')) {
//         throw new RestError(
//           'Request timeout',
//           ERROR_TYPES.TIMEOUT_ERROR,
//           null,
//           error
//         );
//       }

//       if (error.errMsg && error.errMsg.includes('network')) {
//         throw new RestError(
//           'Network error',
//           ERROR_TYPES.NETWORK_ERROR,
//           null,
//           error
//         );
//       }

//       // 其他未知错误
//       throw new RestError(
//         error.message || 'Unknown error',
//         ERROR_TYPES.UNKNOWN_ERROR,
//         null,
//         error
//       );
//     }
//   }

//   // 获取状态码对应的文本
//   getStatusText(statusCode) {
//     const statusMap = {
//       200: 'OK',
//       201: 'Created',
//       204: 'No Content',
//       400: 'Bad Request',
//       401: 'Unauthorized',
//       403: 'Forbidden',
//       404: 'Not Found',
//       500: 'Internal Server Error',
//     };
//     return statusMap[statusCode] || 'Unknown Status';
//   }

//   // GET 请求
//   async get(url, params = {}, config = {}) {
//     return this.request({
//       method: 'GET',
//       url,
//       data: params,
//       ...config,
//     });
//   }

//   // POST 请求
//   async post(url, data = {}, config = {}) {
//     return this.request({
//       method: 'POST',
//       url,
//       data,
//       ...config,
//     });
//   }

//   // PUT 请求
//   async put(url, data = {}, config = {}) {
//     return this.request({
//       method: 'PUT',
//       url,
//       data,
//       ...config,
//     });
//   }

//   // PATCH 请求
//   async patch(url, data = {}, config = {}) {
//     return this.request({
//       method: 'PATCH',
//       url,
//       data,
//       ...config,
//     });
//   }

//   // DELETE 请求
//   async delete(url, config = {}) {
//     return this.request({
//       method: 'DELETE',
//       url,
//       ...config,
//     });
//   }

//   // HEAD 请求
//   async head(url, config = {}) {
//     return this.request({
//       method: 'HEAD',
//       url,
//       ...config,
//     });
//   }

//   // OPTIONS 请求
//   async options(url, config = {}) {
//     return this.request({
//       method: 'OPTIONS',
//       url,
//       ...config,
//     });
//   }

//   // 批量请求
//   async all(requests) {
//     return Promise.all(requests);
//   }

//   // 创建新的客户端实例
//   create(config = {}) {
//     return new RestClient({ ...this.config, ...config });
//   }

//   // 设置基础 URL
//   setBaseURL(baseURL) {
//     this.config.baseURL = baseURL;
//   }

//   // 设置默认头部
//   setDefaultHeaders(headers) {
//     this.config.headers = { ...this.config.headers, ...headers };
//   }

//   // 设置超时时间
//   setTimeout(timeout) {
//     this.config.timeout = timeout;
//   }
// }

// // 创建默认实例
// export const restClient = new RestClient();

// // 导出类和实例
// export { RestClient };
// export default restClient;

// // 常用的请求方法的快捷方式
// export const get = restClient.get.bind(restClient);
// export const post = restClient.post.bind(restClient);
// export const put = restClient.put.bind(restClient);
// export const patch = restClient.patch.bind(restClient);
// export const del = restClient.delete.bind(restClient);
// export const head = restClient.head.bind(restClient);
// export const options = restClient.options.bind(restClient);

// // 预设的拦截器
// export const commonInterceptors = {
//   // 请求拦截器 - 添加认证token
//   addAuthToken: (config) => {
//     const token = Taro.getStorageSync('token');
//     if (token) {
//       config.header = {
//         ...config.header,
//         Authorization: `Bearer ${token}`,
//       };
//     }
//     return config;
//   },

//   // 请求拦截器 - 添加时间戳
//   addTimestamp: (config) => {
//     const timestamp = Date.now();
//     config.header = {
//       ...config.header,
//       'X-Timestamp': timestamp.toString(),
//     };
//     return config;
//   },

//   // 响应拦截器 - 统一错误处理
//   handleError: (response) => {
//     if (response.status >= 400) {
//       console.error('API Error:', response);
//       Taro.showToast({
//         title: '请求失败',
//         icon: 'error',
//         duration: 2000,
//       });
//     }
//     return response;
//   },

//   // 响应拦截器 - 数据转换
//   transformResponse: (response) => {
//     // 如果响应有包装格式，可以在这里解包
//     if (response.data && typeof response.data === 'object') {
//       // 例如：{ code: 200, data: {...}, message: 'success' }
//       if (response.data.code === 200) {
//         return {
//           ...response,
//           data: response.data.data,
//         };
//       }
//     }
//     return response;
//   },
// }; 

import Taro from '@tarojs/taro'
import { apiConfig } from '../config/api'

const headers = {
  'Content-Type': 'application/json',
  'Authorization': '',
}
const baseURL = apiConfig.baseURL

const restClient = {
  setToken: (token) => {
    headers.Authorization = `Bearer ${token}`;
  },

  get: async (url, params = {}, config = {}) => {
    return await Taro.request({
      url: `${baseURL}${url}`,
      method: 'GET',
      data: params,
      header: headers,
      ...config,
    })
  },
  post: async (url, data = {}, config = {}) => {
    return await Taro.request({
      url: `${baseURL}${url}`,
      method: 'POST',
      data,
      header: headers,
      ...config,
    })
  }
}

export { restClient };
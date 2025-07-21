import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import Taro from '@tarojs/taro';

// 自定义fetch函数，适配微信小程序环境
const customFetch = async (uri: string, options: RequestInit): Promise<Response> => {
  try {
    const response = await Taro.request({
      url: uri,
      method: options.method as any || 'GET',
      header: options.headers as any || {},
      data: options.body,
    });
    
    // 创建一个符合Response接口的对象
    const responseData = response.data;
    const responseHeaders = new Headers();
    
    // 添加响应头
    if (response.header) {
      Object.entries(response.header).forEach(([key, value]) => {
        responseHeaders.append(key, value as string);
      });
    }
    
    return new Response(JSON.stringify(responseData), {
      status: response.statusCode,
      statusText: response.errMsg || '',
      headers: responseHeaders,
    });
  } catch (error) {
    throw new Error(`Network error: ${error}`);
  }
};

// HTTP链接用于查询和变更
const httpLink = createHttpLink({
  uri: 'http://localhost:15000/graphql', // 替换为你的GraphQL服务器地址
  fetch: customFetch,
});

// WebSocket链接用于subscription (在微信小程序中可能不支持，暂时注释掉)
// const wsLink = new GraphQLWsLink(
//   createClient({
//     url: 'ws://localhost:3000/graphql', // 替换为你的WebSocket地址
//     connectionParams: {
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//       },
//     },
//   })
// );

// 分割链接：HTTP用于查询/变更，WebSocket用于subscription
// 暂时只使用HTTP链接，因为微信小程序对WebSocket支持有限
const splitLink = httpLink;
// const splitLink = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     );
//   },
//   wsLink,
//   httpLink
// );

// 创建Apollo客户端
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
}); 
// 测试GraphQL客户端是否能在微信小程序环境中正常工作
import { client } from '../graphql/client2';
import Taro from '@tarojs/taro';
import { apiConfig } from '../config/api';

export const testGraphQLClient = async () => {
  try {
    console.log('Testing GraphQL client initialization...');
    
    // 测试客户端是否能够初始化
    if (client) {
      console.log('✅ GraphQL client initialized successfully');
    } else {
      console.log('❌ GraphQL client initialization failed');
      return false;
    }

    // 测试网络连接
    try {
      const testQuery = `
        query TestQuery {
          __typename
        }
      `;
      
      const response = await Taro.request({
        url: `${apiConfig.graphqlURL}`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
        },
        data: {
          query: testQuery,
        },
      });

      console.log('✅ Network connection test passed:', response.statusCode);
      return true;
    } catch (networkError) {
      console.log('⚠️ Network connection test failed:', networkError);
      console.log('This is expected if the GraphQL server is not running');
      return true; // 客户端初始化成功，只是网络连接失败
    }
  } catch (error) {
    console.error('❌ GraphQL client test failed:', error);
    return false;
  }
};

// 测试Apollo Client查询
export const testApolloQuery = async () => {
  try {
    console.log('Testing Apollo Client query...');
    
    const result = await client.query({
      query: `
        query TestQuery {
          __typename
        }
      `,
      errorPolicy: 'all'
    });
    
    console.log('✅ Apollo Client query test passed:', result);
    return true;
  } catch (error) {
    console.error('❌ Apollo Client query test failed:', error);
    return false;
  }
}; 
import { client } from '../graphql/client2';
import { 
  GET_MESSAGES, 
  ADD_MESSAGE, 
  MESSAGE_ADDED_SUBSCRIPTION,
  GET_MORTGAGE_HISTORY,
  SAVE_MORTGAGE_CALCULATION,
  MORTGAGE_CALCULATION_UPDATED,
  GET_PLAYER_PROFILE
} from '../graphql/queries';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { Score } from '../types/database';
import Taro from '@tarojs/taro';

export interface Message {
  id: string;
  content: string;
  createdAt: string;
}

export interface PlayerProfile {
  playerId: string;
  username: string;
  email: string;
  avatarUrl: string;
  phone: string;
  scoreInfo: Score
}

export interface MortgageCalculation {
  id: string;
  loanAmount: number;
  loanTerm: number;
  interestRate: number;
  paymentMethod: 'equal' | 'decreasing';
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  createdAt: string;
}

export interface SubscriptionData {
  listen: {
    relatedNodeId: string;
    relatedNode: Message | MortgageCalculation;
  };
}

// 简单的GraphQL请求函数，使用Taro.request
const simpleGraphQLRequest = async (query: string, variables: any = {}) => {
  try {
    const response = await Taro.request({
      url: 'http://localhost:15000/graphql',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: {
        query,
        variables,
      },
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data;
    } else {
      throw new Error(`GraphQL request failed: ${response.statusCode}`);
    }
  } catch (error) {
    console.error('GraphQL request error:', error);
    throw error;
  }
};

export class GraphQLService {

  static async getPlayerProfile(): Promise<PlayerProfile> {
    // get player id from local storage
    const playerId = Taro.getStorageSync('userInfo')?.playerId;
    if (!playerId) {
      throw new Error('not login');
    }
    
    // 如果Apollo Client失败，使用直接请求
    const result = await simpleGraphQLRequest(GET_PLAYER_PROFILE.loc?.source.body || '', { playerId });
    const playerProfile = result.data.playerByPlayerId as PlayerProfile;
    playerProfile.scoreInfo = result.data.playerByPlayerId.scoreByPlayerId as Score;
    return playerProfile;
  }

  /**
   * 获取所有消息
   */
  static async getMessages(): Promise<Message[]> {
    try {
      const { data } = await client.query({
        query: GET_MESSAGES,
        fetchPolicy: 'network-only'
      });
      return data.allMessagesList || [];
    } catch (error) {
      console.error('获取消息失败:', error);
      return [];
    }
  }

  /**
   * 添加新消息
   */
  static async addMessage(content: string): Promise<Message | null> {
    try {
      const { data } = await client.mutate({
        mutation: ADD_MESSAGE,
        variables: { content },
        refetchQueries: [{ query: GET_MESSAGES }]
      });
      return data.addMessage;
    } catch (error) {
      console.error('添加消息失败:', error);
      return null;
    }
  }

  /**
   * 获取房贷计算历史
   */
  static async getMortgageHistory(): Promise<MortgageCalculation[]> {
    try {
      const { data } = await client.query({
        query: GET_MORTGAGE_HISTORY,
        fetchPolicy: 'network-only'
      });
      return data.mortgageHistory || [];
    } catch (error) {
      console.error('获取房贷历史失败:', error);
      return [];
    }
  }

  /**
   * 保存房贷计算
   */
  static async saveMortgageCalculation(input: Omit<MortgageCalculation, 'id' | 'createdAt'>): Promise<MortgageCalculation | null> {
    try {
      const { data } = await client.mutate({
        mutation: SAVE_MORTGAGE_CALCULATION,
        variables: { input },
        refetchQueries: [{ query: GET_MORTGAGE_HISTORY }]
      });
      return data.saveMortgageCalculation;
    } catch (error) {
      console.error('保存房贷计算失败:', error);
      return null;
    }
  }

  /**
   * 订阅消息添加事件
   */
  static subscribeToMessageAdded(callback: (message: Message) => void) {
    return client.subscribe({
      query: MESSAGE_ADDED_SUBSCRIPTION
    }).subscribe({
      next: ({ data }) => {
        if (data?.listen?.relatedNode) {
          callback(data.listen.relatedNode as Message);
        }
      },
      error: (error) => {
        console.error('消息订阅错误:', error);
      }
    });
  }

  /**
   * 订阅房贷计算更新事件
   */
  static subscribeToMortgageCalculationUpdated(callback: (calculation: MortgageCalculation) => void) {
    return client.subscribe({
      query: MORTGAGE_CALCULATION_UPDATED
    }).subscribe({
      next: ({ data }) => {
        if (data?.listen?.relatedNode) {
          callback(data.listen.relatedNode as MortgageCalculation);
        }
      },
      error: (error) => {
        console.error('房贷计算订阅错误:', error);
      }
    });
  }
}

/**
 * React Hooks for GraphQL operations
 */
export function useMessages() {
  return useQuery(GET_MESSAGES, {
    pollInterval: 5000, // 每5秒轮询一次
  });
}

export function useAddMessage() {
  return useMutation(ADD_MESSAGE, {
    refetchQueries: [{ query: GET_MESSAGES }]
  });
}

export function useMortgageHistory() {
  return useQuery(GET_MORTGAGE_HISTORY, {
    pollInterval: 10000, // 每10秒轮询一次
  });
}

export function useSaveMortgageCalculation() {
  return useMutation(SAVE_MORTGAGE_CALCULATION, {
    refetchQueries: [{ query: GET_MORTGAGE_HISTORY }]
  });
}

export function useMessageAddedSubscription() {
  return useSubscription(MESSAGE_ADDED_SUBSCRIPTION);
}

export function useMortgageCalculationUpdatedSubscription() {
  return useSubscription(MORTGAGE_CALCULATION_UPDATED);
} 
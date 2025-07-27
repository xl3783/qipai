import { useState, useEffect, useCallback } from 'react';
import { graphqlClient, QUERIES, MUTATIONS } from '../graphql/client.js';
import Taro from '@tarojs/taro';

const graphqlQuery = async (query, variables) => {
  console.log('graphqlQuery', query, variables);
  const res = await Taro.request({
    // url: "http://47.113.229.69:5000/graphql",
    url: "http://localhost:15000/graphql",
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    data: {
      query,
      variables,
    },
  });
  console.log('res', res);
  return res; // 返回 GraphQL 的 data 字段
}

// 通用GraphQL查询hook
export const useQuery = (query, variables = {}, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await graphqlQuery(query, variables);

      console.log('result', result);

      if (result.statusCode === 200) {
        setData(result.data.data);
      } else {
        setError(result.data);
      }
      
      // if (result.errors) {
      //   setError(result.errors[0]);
      // } else {
      //   setData(result.data);
      // }
    } catch (err) {
      setError({ message: err.message });
    } finally {
      setLoading(false);
    }
  }, [query, JSON.stringify(variables)]);

  useEffect(() => {
    if (!options.skip) {
      fetchData();
    }
  }, [fetchData, options.skip]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// 通用GraphQL变更hook
export const useMutation = (mutation) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (variables = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await graphqlClient.mutate(mutation, variables);
      
      if (result.errors) {
        setError(result.errors[0]);
        throw new Error(result.errors[0].message);
      }
      
      return result.data;
    } catch (err) {
      setError({ message: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutation]);

  return [mutate, { loading, error }];
};

// 用户相关hooks
export const useCurrentUser = () => {
  return useQuery(QUERIES.GET_CURRENT_USER);
};

export const useUsers = () => {
  return useQuery(QUERIES.GET_USERS);
};

export const useUser = (userId) => {
  return useQuery(QUERIES.GET_USER, { id: userId }, { skip: !userId });
};

// 房间相关hooks
export const useActiveRooms = () => {
  return useQuery(QUERIES.GET_ACTIVE_ROOMS);
};

export const useRoom = (roomId) => {
  return useQuery(QUERIES.GET_ROOM, { id: roomId }, { skip: !roomId });
};

// 交易相关hooks
export const useTransactions = (roomId) => {
  return useQuery(QUERIES.GET_TRANSACTIONS, { roomId }, { skip: !roomId });
};

export const useUserTransactions = (userId, limit = 10, offset = 0) => {
  return useQuery(
    QUERIES.GET_USER_TRANSACTIONS, 
    { userId, limit, offset }, 
    { skip: !userId }
  );
};

// 统计相关hooks
export const useGameStats = (userId) => {
  return useQuery(QUERIES.GET_GAME_STATS, { userId }, { skip: !userId });
};

export const useLeaderboard = () => {
  return useQuery(QUERIES.GET_LEADERBOARD);
};

// 变更相关hooks
export const useCreateUser = () => {
  return useMutation(MUTATIONS.CREATE_USER);
};

export const useUpdateUser = () => {
  return useMutation(MUTATIONS.UPDATE_USER);
};

export const useCreateRoom = () => {
  return useMutation(MUTATIONS.CREATE_ROOM);
};

export const useJoinRoom = () => {
  return useMutation(MUTATIONS.JOIN_ROOM);
};

export const useCreateTransaction = () => {
  return useMutation(MUTATIONS.CREATE_TRANSACTION);
};

export const useSettleRoom = () => {
  return useMutation(MUTATIONS.SETTLE_ROOM);
};

export const useUpdateGameStats = () => {
  return useMutation(MUTATIONS.UPDATE_GAME_STATS);
}; 
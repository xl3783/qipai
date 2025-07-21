import { useState, useEffect, useCallback, useRef } from 'react';
import { restClient, RestError, ERROR_TYPES } from '../services/restClient.js';

// 通用 REST 请求 Hook
export const useRestRequest = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const {
    method = 'POST',
    params = {},
    body = null,
    headers = {},
    skip = false,
    onSuccess,
    onError,
    transform,
    ...restOptions
  } = options;

  const fetchData = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const config = {
        headers,
        ...restOptions,
      };

      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await restClient.get(url, params, config);
          break;
        case 'POST':
          response = await restClient.post(url, body || params, config);
          break;
        case 'PUT':
          response = await restClient.put(url, body || params, config);
          break;
        case 'PATCH':
          response = await restClient.patch(url, body || params, config);
          break;
        case 'DELETE':
          response = await restClient.delete(url, config);
          break;
        default:
          response = await restClient.request({ method, url, data: body || params, ...config });
      }

      // 数据转换
      const processedData = transform ? transform(response.data) : response.data;
      setData(processedData);

      // 成功回调
      if (onSuccess) {
        onSuccess(processedData, response);
      }
    } catch (err) {
      setError(err);
      
      // 错误回调
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, JSON.stringify(params), body, JSON.stringify(headers), skip, transform]);

  useEffect(() => {
    fetchData();
    
    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

// GET 请求 Hook
export const useGet = (url, params = {}, options = {}) => {
  return useRestRequest(url, {
    method: 'GET',
    params,
    ...options,
  });
};

// POST 请求 Hook
export const usePost = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = useCallback(async (data = {}, requestOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        ...options,
        ...requestOptions,
      };

      const response = await restClient.post(url, data, config);
      
      // 数据转换
      const processedData = options.transform ? options.transform(response.data) : response.data;
      
      // 成功回调
      if (options.onSuccess) {
        options.onSuccess(processedData, response);
      }
      
      return processedData;
    } catch (err) {
      setError(err);
      
      // 错误回调
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return [post, { loading, error }];
};

// PUT 请求 Hook
export const usePut = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const put = useCallback(async (data = {}, requestOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        ...options,
        ...requestOptions,
      };

      const response = await restClient.put(url, data, config);
      
      // 数据转换
      const processedData = options.transform ? options.transform(response.data) : response.data;
      
      // 成功回调
      if (options.onSuccess) {
        options.onSuccess(processedData, response);
      }
      
      return processedData;
    } catch (err) {
      setError(err);
      
      // 错误回调
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return [put, { loading, error }];
};

// PATCH 请求 Hook
export const usePatch = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const patch = useCallback(async (data = {}, requestOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        ...options,
        ...requestOptions,
      };

      const response = await restClient.patch(url, data, config);
      
      // 数据转换
      const processedData = options.transform ? options.transform(response.data) : response.data;
      
      // 成功回调
      if (options.onSuccess) {
        options.onSuccess(processedData, response);
      }
      
      return processedData;
    } catch (err) {
      setError(err);
      
      // 错误回调
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return [patch, { loading, error }];
};

// DELETE 请求 Hook
export const useDelete = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const del = useCallback(async (requestOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        ...options,
        ...requestOptions,
      };

      const response = await restClient.delete(url, config);
      
      // 数据转换
      const processedData = options.transform ? options.transform(response.data) : response.data;
      
      // 成功回调
      if (options.onSuccess) {
        options.onSuccess(processedData, response);
      }
      
      return processedData;
    } catch (err) {
      setError(err);
      
      // 错误回调
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return [del, { loading, error }];
};

// 缓存 Hook
export const useRestCache = (key, fetcher, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());

  const {
    cacheTime = 5 * 60 * 1000, // 5分钟
    staleTime = 0,
    skip = false,
  } = options;

  const getCachedData = useCallback(() => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return null;
  }, [key, cacheTime]);

  const setCachedData = useCallback((data) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, [key]);

  const fetchData = useCallback(async (force = false) => {
    if (skip) return;

    try {
      // 检查缓存
      if (!force) {
        const cached = getCachedData();
        if (cached) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      setLoading(true);
      setError(null);

      const result = await fetcher();
      setData(result);
      setCachedData(result);

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [skip, getCachedData, setCachedData, fetcher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cacheRef.current.delete(key);
  }, [key]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  };
};

// 轮询 Hook
export const usePolling = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const {
    interval = 5000,
    immediate = true,
    onSuccess,
    onError,
    ...restOptions
  } = options;

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setError(null);
      const response = await restClient.get(url, {}, restOptions);
      
      if (mountedRef.current) {
        setData(response.data);
        setLoading(false);
        
        if (onSuccess) {
          onSuccess(response.data, response);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
        
        if (onError) {
          onError(err);
        }
      }
    }
  }, [url, JSON.stringify(restOptions), onSuccess, onError]);

  const startPolling = useCallback(() => {
    if (isPolling) return;
    
    setIsPolling(true);
    intervalRef.current = setInterval(fetchData, interval);
  }, [isPolling, interval, fetchData]);

  const stopPolling = useCallback(() => {
    if (!isPolling) return;
    
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPolling]);

  useEffect(() => {
    if (immediate) {
      fetchData();
      startPolling();
    }

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [immediate, fetchData, startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refetch: fetchData,
  };
};

// 导出工具函数
export const createRestHook = (baseUrl, defaultOptions = {}) => {
  return (endpoint, options = {}) => {
    const fullUrl = `${baseUrl}${endpoint}`;
    return useRestRequest(fullUrl, { ...defaultOptions, ...options });
  };
};

// 错误处理工具
export const useErrorHandler = () => {
  const handleError = useCallback((error) => {
    if (error instanceof RestError) {
      switch (error.type) {
        case ERROR_TYPES.NETWORK_ERROR:
          console.error('Network error:', error.message);
          break;
        case ERROR_TYPES.TIMEOUT_ERROR:
          console.error('Request timeout:', error.message);
          break;
        case ERROR_TYPES.HTTP_ERROR:
          console.error('HTTP error:', error.statusCode, error.message);
          break;
        default:
          console.error('Unknown error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }, []);

  return { handleError };
}; 
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import { 
  restClient, 
  commonInterceptors,
  get, 
  post, 
  put, 
  del 
} from '../services/restClient.js';
import { 
  useGet, 
  usePost, 
  usePut, 
  useDelete, 
  useRestCache,
  usePolling,
  createRestHook
} from '../hooks/useRestClient.js';

// ============ 基础使用示例 ============

// 1. 直接使用 restClient
export const BasicUsageExample = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // GET 请求
      const response = await restClient.get('/api/users');
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      const response = await restClient.post('/api/users', {
        name: '新用户',
        email: 'user@example.com'
      });
      console.log('User created:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View>
      <Button onClick={fetchData}>
        {loading ? '加载中...' : '获取用户列表'}
      </Button>
      <Button onClick={createUser}>创建用户</Button>
      {data && <Text>{JSON.stringify(data)}</Text>}
    </View>
  );
};

// 2. 使用快捷方法
export const ShortcutMethodsExample = () => {
  const fetchUsers = async () => {
    try {
      const response = await get('/api/users');
      console.log('Users:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createUser = async () => {
    try {
      const response = await post('/api/users', {
        name: '新用户',
        email: 'user@example.com'
      });
      console.log('User created:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View>
      <Button onClick={fetchUsers}>获取用户</Button>
      <Button onClick={createUser}>创建用户</Button>
    </View>
  );
};

// ============ Hook 使用示例 ============

// 3. 使用 GET Hook
export const GetHookExample = () => {
  const { data, loading, error, refetch } = useGet('/api/users');

  if (loading) return <Text>加载中...</Text>;
  if (error) return <Text>错误: {error.message}</Text>;

  return (
    <View>
      <Button onClick={refetch}>重新获取</Button>
      {data && <Text>{JSON.stringify(data)}</Text>}
    </View>
  );
};

// 4. 使用 POST Hook
export const PostHookExample = () => {
  const [createUser, { loading, error }] = usePost('/api/users');

  const handleCreate = async () => {
    try {
      const result = await createUser({
        name: '新用户',
        email: 'user@example.com'
      });
      console.log('User created:', result);
    } catch (err) {
      console.error('Create failed:', err);
    }
  };

  return (
    <View>
      <Button 
        onClick={handleCreate} 
        disabled={loading}
      >
        {loading ? '创建中...' : '创建用户'}
      </Button>
      {error && <Text>错误: {error.message}</Text>}
    </View>
  );
};

// 5. 使用带参数的 Hook
export const ParameterizedHookExample = ({ userId }) => {
  const { data, loading, error } = useGet(`/api/users/${userId}`, {}, {
    skip: !userId, // 当 userId 为空时跳过请求
    onSuccess: (data) => {
      console.log('User loaded:', data);
    },
    onError: (error) => {
      console.error('Failed to load user:', error);
    }
  });

  if (!userId) return <Text>请选择用户</Text>;
  if (loading) return <Text>加载中...</Text>;
  if (error) return <Text>错误: {error.message}</Text>;

  return (
    <View>
      <Text>用户信息: {JSON.stringify(data)}</Text>
    </View>
  );
};

// ============ 高级功能示例 ============

// 6. 使用拦截器
export const InterceptorExample = () => {
  useEffect(() => {
    // 添加请求拦截器
    restClient.addRequestInterceptor(commonInterceptors.addAuthToken);
    restClient.addRequestInterceptor(commonInterceptors.addTimestamp);

    // 添加响应拦截器
    restClient.addResponseInterceptor(commonInterceptors.transformResponse);
    restClient.addResponseInterceptor(commonInterceptors.handleError);

    // 自定义拦截器
    restClient.addRequestInterceptor((config) => {
      console.log('Request:', config.method, config.url);
      return config;
    });

    restClient.addResponseInterceptor((response) => {
      console.log('Response:', response.status, response.data);
      return response;
    });

    return () => {
      // 清理拦截器
      restClient.clearInterceptors();
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await restClient.get('/api/users');
      console.log('Data:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View>
      <Button onClick={fetchData}>测试拦截器</Button>
    </View>
  );
};

// 7. 使用缓存 Hook
export const CacheHookExample = () => {
  const { data, loading, error, refetch, clearCache } = useRestCache(
    'users-list',
    () => restClient.get('/api/users').then(res => res.data),
    {
      cacheTime: 5 * 60 * 1000, // 5分钟缓存
      staleTime: 30 * 1000, // 30秒内被认为是新鲜的
    }
  );

  return (
    <View>
      <Button onClick={refetch}>刷新数据</Button>
      <Button onClick={clearCache}>清除缓存</Button>
      {loading && <Text>加载中...</Text>}
      {error && <Text>错误: {error.message}</Text>}
      {data && <Text>{JSON.stringify(data)}</Text>}
    </View>
  );
};

// 8. 使用轮询 Hook
export const PollingHookExample = () => {
  const { 
    data, 
    loading, 
    error, 
    isPolling, 
    startPolling, 
    stopPolling 
  } = usePolling('/api/status', {
    interval: 3000, // 3秒轮询一次
    immediate: false, // 不立即开始轮询
  });

  return (
    <View>
      <Button onClick={startPolling} disabled={isPolling}>
        开始轮询
      </Button>
      <Button onClick={stopPolling} disabled={!isPolling}>
        停止轮询
      </Button>
      <Text>轮询状态: {isPolling ? '进行中' : '已停止'}</Text>
      {loading && <Text>加载中...</Text>}
      {error && <Text>错误: {error.message}</Text>}
      {data && <Text>{JSON.stringify(data)}</Text>}
    </View>
  );
};

// 9. 创建自定义 Hook
const useApiHook = createRestHook('https://api.example.com', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

export const CustomHookExample = () => {
  const { data, loading, error } = useApiHook('/users');

  if (loading) return <Text>加载中...</Text>;
  if (error) return <Text>错误: {error.message}</Text>;

  return (
    <View>
      {data && <Text>{JSON.stringify(data)}</Text>}
    </View>
  );
};

// 10. 批量请求示例
export const BatchRequestExample = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBatchData = async () => {
    setLoading(true);
    try {
      const [users, posts, comments] = await restClient.all([
        restClient.get('/api/users'),
        restClient.get('/api/posts'),
        restClient.get('/api/comments')
      ]);

      setData({
        users: users.data,
        posts: posts.data,
        comments: comments.data
      });
    } catch (error) {
      console.error('Batch request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button onClick={fetchBatchData} disabled={loading}>
        {loading ? '加载中...' : '批量获取数据'}
      </Button>
      {data && (
        <View>
          <Text>用户数: {data.users?.length || 0}</Text>
          <Text>帖子数: {data.posts?.length || 0}</Text>
          <Text>评论数: {data.comments?.length || 0}</Text>
        </View>
      )}
    </View>
  );
};

// ============ 实际业务场景示例 ============

// 11. 用户管理示例
export const UserManagementExample = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updateUser, { loading: updateLoading }] = usePut('/api/users');
  const [deleteUser, { loading: deleteLoading }] = useDelete('/api/users');

  const { data, loading, refetch } = useGet('/api/users', {}, {
    onSuccess: (data) => setUsers(data),
  });

  const handleUpdate = async (userId, userData) => {
    try {
      await updateUser(userData, { url: `/api/users/${userId}` });
      refetch(); // 重新获取用户列表
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser({ url: `/api/users/${userId}` });
      refetch(); // 重新获取用户列表
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <View>
      <Text>用户管理</Text>
      {loading && <Text>加载中...</Text>}
      {users.map(user => (
        <View key={user.id}>
          <Text>{user.name}</Text>
          <Button onClick={() => setSelectedUser(user)}>
            编辑
          </Button>
          <Button 
            onClick={() => handleDelete(user.id)}
            disabled={deleteLoading}
          >
            删除
          </Button>
        </View>
      ))}
    </View>
  );
};

// 12. 表单提交示例
export const FormSubmissionExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const [submitForm, { loading, error }] = usePost('/api/users', {
    onSuccess: (data) => {
      console.log('Form submitted successfully:', data);
      setFormData({ name: '', email: '' }); // 清空表单
    },
    onError: (error) => {
      console.error('Form submission failed:', error);
    }
  });

  const handleSubmit = async () => {
    await submitForm(formData);
  };

  return (
    <View>
      <Text>创建用户</Text>
      <Input 
        placeholder="姓名"
        value={formData.name}
        onInput={(e) => setFormData(prev => ({ ...prev, name: e.detail.value }))}
      />
      <Input 
        placeholder="邮箱"
        value={formData.email}
        onInput={(e) => setFormData(prev => ({ ...prev, email: e.detail.value }))}
      />
      <Button 
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '提交中...' : '提交'}
      </Button>
      {error && <Text>错误: {error.message}</Text>}
    </View>
  );
};

// 13. 文件上传示例
export const FileUploadExample = () => {
  const [uploadFile, { loading, error }] = usePost('/api/upload', {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onSuccess: (data) => {
      console.log('File uploaded:', data);
    }
  });

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    await uploadFile(formData);
  };

  return (
    <View>
      <Text>文件上传</Text>
      <Button disabled={loading}>
        {loading ? '上传中...' : '选择文件'}
      </Button>
      {error && <Text>错误: {error.message}</Text>}
    </View>
  );
};

// 14. 配置示例
export const ConfigurationExample = () => {
  useEffect(() => {
    // 设置基础配置
    restClient.setBaseURL('https://api.example.com');
    restClient.setDefaultHeaders({
      'X-API-Key': 'your-api-key',
      'Accept': 'application/json'
    });
    restClient.setTimeout(15000);

    // 创建专用客户端
    const authClient = restClient.create({
      baseURL: 'https://auth.example.com',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 使用专用客户端
    const login = async () => {
      try {
        const response = await authClient.post('/login', {
          username: 'user',
          password: 'pass'
        });
        console.log('Login successful:', response.data);
      } catch (error) {
        console.error('Login failed:', error);
      }
    };

    return () => {
      // 清理配置
      restClient.clearInterceptors();
    };
  }, []);

  return (
    <View>
      <Text>配置示例</Text>
    </View>
  );
};

export default {
  BasicUsageExample,
  ShortcutMethodsExample,
  GetHookExample,
  PostHookExample,
  ParameterizedHookExample,
  InterceptorExample,
  CacheHookExample,
  PollingHookExample,
  CustomHookExample,
  BatchRequestExample,
  UserManagementExample,
  FormSubmissionExample,
  FileUploadExample,
  ConfigurationExample
}; 
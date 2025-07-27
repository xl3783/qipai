# REST 客户端使用指南

## 概述

本项目提供了一个功能完整的 REST 客户端，基于 Taro 框架构建，支持各种 HTTP 请求方法、拦截器、缓存、轮询等高级功能。

## 目录

- [安装和配置](#安装和配置)
- [基础使用](#基础使用)
- [React Hooks](#react-hooks)
- [高级功能](#高级功能)
- [API 文档](#api-文档)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)

## 安装和配置

### 导入客户端

```javascript
// 导入 REST 客户端
import { restClient, get, post, put, del } from '@/services/restClient';

// 导入 React Hooks
import { useGet, usePost, usePut, useDelete } from '@/hooks/useRestClient';
```

### 基础配置

```javascript
// 设置基础 URL
restClient.setBaseURL('https://api.example.com');

// 设置默认请求头
restClient.setDefaultHeaders({
  'Content-Type': 'application/json',
  'X-API-Key': 'your-api-key'
});

// 设置超时时间
restClient.setTimeout(15000);
```

## 基础使用

### 直接使用客户端

```javascript
// GET 请求
const response = await restClient.get('/api/users');
console.log(response.data);

// POST 请求
const user = await restClient.post('/api/users', {
  name: '张三',
  email: 'zhangsan@example.com'
});

// PUT 请求
const updated = await restClient.put('/api/users/123', {
  name: '李四'
});

// DELETE 请求
await restClient.delete('/api/users/123');
```

### 使用快捷方法

```javascript
// 更简洁的写法
const users = await get('/api/users');
const newUser = await post('/api/users', { name: '王五' });
const updatedUser = await put('/api/users/123', { name: '赵六' });
await del('/api/users/123');
```

## React Hooks

### useGet Hook

```javascript
const UserList = () => {
  const { data, loading, error, refetch } = useGet('/api/users');

  if (loading) return <Text>加载中...</Text>;
  if (error) return <Text>错误: {error.message}</Text>;

  return (
    <View>
      <Button onClick={refetch}>刷新</Button>
      {data?.map(user => (
        <Text key={user.id}>{user.name}</Text>
      ))}
    </View>
  );
};
```

### usePost Hook

```javascript
const CreateUser = () => {
  const [createUser, { loading, error }] = usePost('/api/users');

  const handleCreate = async () => {
    try {
      const result = await createUser({
        name: '新用户',
        email: 'user@example.com'
      });
      console.log('创建成功:', result);
    } catch (err) {
      console.error('创建失败:', err);
    }
  };

  return (
    <Button onClick={handleCreate} disabled={loading}>
      {loading ? '创建中...' : '创建用户'}
    </Button>
  );
};
```

### 带参数的 Hook

```javascript
const UserProfile = ({ userId }) => {
  const { data, loading, error } = useGet(`/api/users/${userId}`, {}, {
    skip: !userId, // 当 userId 为空时跳过请求
    onSuccess: (data) => console.log('用户信息加载成功:', data),
    onError: (error) => console.error('加载失败:', error)
  });

  // 组件内容...
};
```

## 高级功能

### 请求拦截器

```javascript
import { commonInterceptors } from '@/services/restClient';

// 添加认证 token
restClient.addRequestInterceptor(commonInterceptors.addAuthToken);

// 添加时间戳
restClient.addRequestInterceptor(commonInterceptors.addTimestamp);

// 自定义拦截器
restClient.addRequestInterceptor((config) => {
  console.log('发送请求:', config.method, config.url);
  
  // 可以修改请求配置
  config.headers['X-Custom-Header'] = 'custom-value';
  
  return config;
});
```

### 响应拦截器

```javascript
// 统一错误处理
restClient.addResponseInterceptor(commonInterceptors.handleError);

// 数据转换
restClient.addResponseInterceptor(commonInterceptors.transformResponse);

// 自定义响应处理
restClient.addResponseInterceptor((response) => {
  console.log('收到响应:', response.status, response.data);
  
  // 可以修改响应数据
  if (response.data.code === 200) {
    return {
      ...response,
      data: response.data.data
    };
  }
  
  return response;
});
```

### 缓存功能

```javascript
import { useRestCache } from '@/hooks/useRestClient';

const CachedUserList = () => {
  const { data, loading, error, refetch, clearCache } = useRestCache(
    'users-list', // 缓存键
    () => restClient.get('/api/users').then(res => res.data), // 获取数据的函数
    {
      cacheTime: 5 * 60 * 1000, // 缓存时间 5 分钟
      staleTime: 30 * 1000, // 过期时间 30 秒
    }
  );

  return (
    <View>
      <Button onClick={refetch}>刷新数据</Button>
      <Button onClick={clearCache}>清除缓存</Button>
      {/* 显示数据 */}
    </View>
  );
};
```

### 轮询功能

```javascript
import { usePolling } from '@/hooks/useRestClient';

const StatusMonitor = () => {
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
    onSuccess: (data) => console.log('状态更新:', data),
    onError: (error) => console.error('轮询错误:', error)
  });

  return (
    <View>
      <Button onClick={startPolling} disabled={isPolling}>
        开始监控
      </Button>
      <Button onClick={stopPolling} disabled={!isPolling}>
        停止监控
      </Button>
      <Text>监控状态: {isPolling ? '运行中' : '已停止'}</Text>
    </View>
  );
};
```

### 批量请求

```javascript
const fetchAllData = async () => {
  try {
    const [users, posts, comments] = await restClient.all([
      restClient.get('/api/users'),
      restClient.get('/api/posts'),
      restClient.get('/api/comments')
    ]);

    return {
      users: users.data,
      posts: posts.data,
      comments: comments.data
    };
  } catch (error) {
    console.error('批量请求失败:', error);
  }
};
```

### 创建专用客户端

```javascript
// 创建专用的认证客户端
const authClient = restClient.create({
  baseURL: 'https://auth.example.com',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
});

// 使用专用客户端
const login = async (credentials) => {
  const response = await authClient.post('/login', credentials);
  return response.data;
};
```

## API 文档

### RestClient 类

#### 构造函数

```javascript
const client = new RestClient(config);
```

**参数:**
- `config` (Object): 客户端配置
  - `baseURL` (String): 基础 URL
  - `timeout` (Number): 超时时间 (毫秒)
  - `headers` (Object): 默认请求头

#### 请求方法

```javascript
// GET 请求
client.get(url, params, config)

// POST 请求
client.post(url, data, config)

// PUT 请求
client.put(url, data, config)

// PATCH 请求
client.patch(url, data, config)

// DELETE 请求
client.delete(url, config)

// 通用请求方法
client.request(config)
```

#### 配置方法

```javascript
// 设置基础 URL
client.setBaseURL(baseURL)

// 设置默认请求头
client.setDefaultHeaders(headers)

// 设置超时时间
client.setTimeout(timeout)

// 添加请求拦截器
client.addRequestInterceptor(interceptor)

// 添加响应拦截器
client.addResponseInterceptor(interceptor)

// 清除所有拦截器
client.clearInterceptors()
```

### React Hooks

#### useGet(url, params, options)

**参数:**
- `url` (String): 请求地址
- `params` (Object): 查询参数
- `options` (Object): 配置选项
  - `skip` (Boolean): 是否跳过请求
  - `onSuccess` (Function): 成功回调
  - `onError` (Function): 错误回调
  - `transform` (Function): 数据转换函数

**返回值:**
- `data`: 响应数据
- `loading`: 加载状态
- `error`: 错误信息
- `refetch`: 重新请求函数

#### usePost(url, options)

**参数:**
- `url` (String): 请求地址
- `options` (Object): 配置选项

**返回值:**
- `[mutate, { loading, error }]`: 返回数组，第一个元素是请求函数，第二个是状态对象

#### usePut(url, options)

同 `usePost`

#### useDelete(url, options)

同 `usePost`

#### useRestCache(key, fetcher, options)

**参数:**
- `key` (String): 缓存键
- `fetcher` (Function): 获取数据的函数
- `options` (Object): 缓存配置
  - `cacheTime` (Number): 缓存时间
  - `staleTime` (Number): 过期时间

**返回值:**
- `data`: 缓存的数据
- `loading`: 加载状态
- `error`: 错误信息
- `refetch`: 重新获取函数
- `clearCache`: 清除缓存函数

#### usePolling(url, options)

**参数:**
- `url` (String): 轮询地址
- `options` (Object): 轮询配置
  - `interval` (Number): 轮询间隔 (毫秒)
  - `immediate` (Boolean): 是否立即开始

**返回值:**
- `data`: 轮询数据
- `loading`: 加载状态
- `error`: 错误信息
- `isPolling`: 是否正在轮询
- `startPolling`: 开始轮询函数
- `stopPolling`: 停止轮询函数

## 错误处理

### 错误类型

```javascript
import { ERROR_TYPES, RestError } from '@/services/restClient';

// 错误类型
ERROR_TYPES.NETWORK_ERROR    // 网络错误
ERROR_TYPES.TIMEOUT_ERROR    // 超时错误
ERROR_TYPES.HTTP_ERROR       // HTTP 错误
ERROR_TYPES.PARSE_ERROR      // 解析错误
ERROR_TYPES.UNKNOWN_ERROR    // 未知错误
```

### 错误处理示例

```javascript
try {
  const response = await restClient.get('/api/users');
} catch (error) {
  if (error instanceof RestError) {
    switch (error.type) {
      case ERROR_TYPES.NETWORK_ERROR:
        console.error('网络连接失败');
        break;
      case ERROR_TYPES.TIMEOUT_ERROR:
        console.error('请求超时');
        break;
      case ERROR_TYPES.HTTP_ERROR:
        console.error('HTTP 错误:', error.statusCode);
        break;
      default:
        console.error('未知错误:', error.message);
    }
  }
}
```

### 全局错误处理

```javascript
// 通过响应拦截器处理全局错误
restClient.addResponseInterceptor((response) => {
  if (response.status >= 400) {
    // 显示错误提示
    Taro.showToast({
      title: '请求失败',
      icon: 'error'
    });
  }
  return response;
});
```

## 最佳实践

### 1. 统一配置

```javascript
// 在 app.js 中统一配置
import { restClient, commonInterceptors } from '@/services/restClient';

// 设置基础配置
restClient.setBaseURL(process.env.API_BASE_URL);
restClient.addRequestInterceptor(commonInterceptors.addAuthToken);
restClient.addResponseInterceptor(commonInterceptors.handleError);
```

### 2. 创建 API 服务层

```javascript
// services/apiService.js
import { restClient } from './restClient';

export const userService = {
  getUsers: () => restClient.get('/api/users'),
  getUserById: (id) => restClient.get(`/api/users/${id}`),
  createUser: (data) => restClient.post('/api/users', data),
  updateUser: (id, data) => restClient.put(`/api/users/${id}`, data),
  deleteUser: (id) => restClient.delete(`/api/users/${id}`)
};
```

### 3. 使用 TypeScript (可选)

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const { data, loading, error } = useGet<User[]>('/api/users');
```

### 4. 环境配置

```javascript
// 根据环境设置不同的 baseURL
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://api.production.com'
  : 'https://api.dev.com';

restClient.setBaseURL(baseURL);
```

### 5. 请求取消

```javascript
const AbortController = require('abort-controller');

const controller = new AbortController();

const fetchData = async () => {
  try {
    const response = await restClient.get('/api/data', {}, {
      signal: controller.signal
    });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('请求被取消');
    }
  }
};

// 取消请求
controller.abort();
```

## 完整示例

```javascript
// 完整的用户管理组件示例
import React, { useState } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import { useGet, usePost, usePut, useDelete } from '@/hooks/useRestClient';

const UserManagement = () => {
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [editingUser, setEditingUser] = useState(null);

  // 获取用户列表
  const { data: users, loading, error, refetch } = useGet('/api/users');

  // 创建用户
  const [createUser, { loading: creating }] = usePost('/api/users', {
    onSuccess: () => {
      setNewUser({ name: '', email: '' });
      refetch();
    }
  });

  // 更新用户
  const [updateUser, { loading: updating }] = usePut('/api/users');

  // 删除用户
  const [deleteUser, { loading: deleting }] = useDelete('/api/users');

  const handleCreate = () => {
    createUser(newUser);
  };

  const handleUpdate = (id, data) => {
    updateUser(data, { url: `/api/users/${id}` })
      .then(() => {
        setEditingUser(null);
        refetch();
      });
  };

  const handleDelete = (id) => {
    deleteUser({ url: `/api/users/${id}` })
      .then(() => refetch());
  };

  if (loading) return <Text>加载中...</Text>;
  if (error) return <Text>错误: {error.message}</Text>;

  return (
    <View>
      <Text>用户管理</Text>
      
      {/* 创建用户表单 */}
      <View>
        <Input
          placeholder="姓名"
          value={newUser.name}
          onInput={(e) => setNewUser(prev => ({ ...prev, name: e.detail.value }))}
        />
        <Input
          placeholder="邮箱"
          value={newUser.email}
          onInput={(e) => setNewUser(prev => ({ ...prev, email: e.detail.value }))}
        />
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? '创建中...' : '创建用户'}
        </Button>
      </View>

      {/* 用户列表 */}
      {users?.map(user => (
        <View key={user.id}>
          <Text>{user.name} - {user.email}</Text>
          <Button onClick={() => setEditingUser(user)}>编辑</Button>
          <Button onClick={() => handleDelete(user.id)} disabled={deleting}>
            删除
          </Button>
        </View>
      ))}
    </View>
  );
};

export default UserManagement;
```

这个 REST 客户端提供了完整的 HTTP 请求功能，支持各种使用场景，能够很好地与您的 Taro 项目集成。 
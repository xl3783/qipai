# Avatar 组件

一个简易版的Radix Avatar组件，专为Taro多平台环境设计。

## 特性

- ✅ 支持多平台（小程序、H5）
- ✅ 自动fallback处理
- ✅ 状态指示器
- ✅ 头像组功能
- ✅ 多种尺寸
- ✅ 自定义样式支持
- ✅ TypeScript支持

## 基础用法

```jsx
import Avatar from './components/avatar'

// 基础用法
<Avatar src="https://example.com/avatar.jpg" alt="用户头像" />

// 带fallback
<Avatar fallback="张三" />

// 不同尺寸
<Avatar size="lg" fallback="大尺寸" />
```

## API

### Avatar Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | - | 头像图片URL |
| `alt` | `string` | - | 图片alt属性 |
| `fallback` | `string \| ReactNode` | - | 图片加载失败时的fallback |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | 头像尺寸 |
| `status` | `'online' \| 'offline' \| 'away' \| 'busy'` | - | 状态指示器 |
| `className` | `string` | - | 自定义CSS类名 |
| `onError` | `(error: any) => void` | - | 图片加载错误回调 |

### 尺寸对照表

| size | 宽度 | 高度 | 文字大小 |
|------|------|------|----------|
| xs | 24px | 24px | 12px |
| sm | 32px | 32px | 14px |
| md | 40px | 40px | 16px |
| lg | 48px | 48px | 18px |
| xl | 64px | 64px | 20px |
| 2xl | 80px | 80px | 24px |

### 状态颜色

| status | 颜色 |
|--------|------|
| online | 绿色 |
| offline | 灰色 |
| away | 黄色 |
| busy | 红色 |

## 高级用法

### 头像组

```jsx
import Avatar from './components/avatar'

<Avatar.Group max={4} spacing="md">
  <Avatar src="avatar1.jpg" />
  <Avatar fallback="张三" />
  <Avatar fallback="李四" />
  <Avatar fallback="王五" />
  <Avatar fallback="赵六" />
  <Avatar fallback="钱七" />
</Avatar.Group>
```

### 组合式用法

```jsx
<Avatar>
  <Avatar.Image src="avatar.jpg" />
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar>
```

### 自定义样式

```jsx
<Avatar 
  className="ring-2 ring-blue-500 ring-offset-2"
  fallback="自定义"
/>

<Avatar 
  className="shadow-lg border-4 border-green-500"
  fallback="边框"
/>
```

## 与现有组件集成

### 更新PlayerAvatar

```jsx
// 原来的PlayerAvatar
<PlayerAvatar name="张三" avatar="avatar.jpg" size="md" />

// 现在支持更多功能
<PlayerAvatar 
  name="张三" 
  avatar="avatar.jpg" 
  size="md"
  status="online"
  className="custom-class"
/>
```

## 注意事项

1. **图片加载**: 组件会自动处理图片加载失败的情况
2. **平台兼容**: 在小程序和H5平台都能正常工作
3. **性能优化**: 使用React.memo优化渲染性能
4. **无障碍**: 支持alt属性和键盘导航

## 示例

查看 `avatar-demo.jsx` 文件获取完整的使用示例。 
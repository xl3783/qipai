// Mock数据
export const mockUsers = [
  {
    id: '1',
    name: '肖磊',
    avatar: null,
    balance: 0,
    isHost: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'xxxx',
    avatar: null,
    balance: 0,
    isHost: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'xxx2',
    avatar: null,
    balance: 0,
    isHost: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'xxx3',
    avatar: null,
    balance: 0,
    isHost: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: '茶/饭',
    avatar: null,
    balance: 0,
    isHost: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockRooms = [
  {
    id: 'room-1',
    name: '打牌记账 jyyj 房间',
    hostId: '1',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockRoom = [
  {
    id: 'room-1',
    name: '打牌记账 jyyj 房间',
    hostId: '1',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockTransactions = [
  {
    id: 'tx-1',
    fromPlayerId: '1',
    toPlayerId: '2',
    amount: 50,
    description: '输牌赔付',
    type: 'TRANSFER',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    roomId: 'room-1',
  },
  {
    id: 'tx-2',
    fromPlayerId: '2',
    toPlayerId: '5',
    amount: 20,
    description: '茶水费',
    type: 'EXPENSE',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    roomId: 'room-1',
  },
];

export const mockGameStats = [
  {
    id: 'stats-1',
    userId: '1',
    wins: 2,
    losses: 1,
    draws: 0,
    winRate: 66.67,
    totalPoints: -3940,
    friendRanking: 0,
    updatedAt: new Date().toISOString(),
  },
];

export const mockSettlementResults = [];

// 工具函数
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const findById = (array, id) => {
  return array.find(item => item.id === id);
};

export const findByProperty = (array, property, value) => {
  return array.filter(item => item[property] === value);
};

export const updateById = (array, id, updates) => {
  const index = array.findIndex(item => item.id === id);
  if (index !== -1) {
    array[index] = { ...array[index], ...updates, updatedAt: new Date().toISOString() };
    return array[index];
  }
  return null;
};

export const removeById = (array, id) => {
  const index = array.findIndex(item => item.id === id);
  if (index !== -1) {
    return array.splice(index, 1)[0];
  }
  return null;
}; 
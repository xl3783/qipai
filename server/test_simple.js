const { RoomServices } = require('./roomServices');

// 模拟数据库服务
const mockDbService = {
  pool: {
    connect: async () => ({
      query: async (text, params) => {
        console.log('Mock query:', text, params);
        return { rows: [] };
      },
      release: () => {}
    })
  },
  query: async (text, params) => {
    console.log('Mock query:', text, params);
    return { rows: [] };
  }
};

console.log('开始测试GameServices...');

try {
  const gameServices = new RoomServices(mockDbService);
  console.log('GameServices实例创建成功');
  
  // 测试生成房间名
  const roomName = gameServices.generateJapaneseMahjongName();
  console.log('生成的房间名:', roomName);
  
  console.log('测试完成');
} catch (error) {
  console.error('测试失败:', error);
} 
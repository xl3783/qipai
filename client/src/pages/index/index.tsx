import { View, Button as TaroButton, Input, Button, Text, Image } from "@tarojs/components";
import PlayerAvatar from "../../components/player-avatar.js";
import GameStatsDisplay from "../../components/game-stats.js";
// import QRCodeModal from "../../components/qr-code-modal.js";
import { useEffect, useState, useCallback } from "react";
import Taro from "@tarojs/taro";
import { IndexPageModel } from "../../models/IndexPageModel";
import { IndexPageViewModel } from "../../viewmodels/IndexPageViewModel";
import { IndexPageState, UserInfo } from "../../types/index";

export default function Index() {
  const [ state, setState] = useState<IndexPageState>({
    userInfo: null as UserInfo | null,
    gameStats: {
      totalPoints: 0,
      wins: 0,
      losses: 0,
      winRate: '--',
      friendRanking: 0,
    },
    showQRModal: false,
    isLoggingIn: false,
    loginData: null,
    roomId: '',
  });

  const { userInfo, gameStats, isLoggingIn } = state;

  const [viewModel] = useState(() => {
    const model = new IndexPageModel();
    return new IndexPageViewModel(model, state, setState);
  });

  // 初始化
  useEffect(() => {
    viewModel.initialize();
  }, []);

  // 创建事件处理函数
  const handleGetUserProfile = useCallback(async () => {
    await viewModel.handleGetUserProfile();
  }, [viewModel]);

  const handleCreateRoom = useCallback(() => {
    viewModel.handleCreateRoom();
  }, [viewModel]);

  const handleJoinRoom = useCallback((roomName: string) => {
    viewModel.handleJoinRoom(roomName);
  }, [viewModel]);

  // const handleCloseQRModal = useCallback(() => {
  //   viewModel.handleCloseQRModal();
  // }, [viewModel]);

  // const handleQRCodeScanned = useCallback((roomId: string) => {
  //   viewModel.handleQRCodeScanned(roomId);
  // }, [viewModel]);

  const [showJoinRoomDialog, setShowJoinRoomDialog] = useState(false);
  const [roomId, setRoomId] = useState("");
  // 数据加载状态
  if (isLoggingIn) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <View className="text-lg">正在加载...</View>
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <View className="container mx-auto px-4 py-8 max-w-md">
{/* Profile Section */}
<View className="bg-white p-6 text-center flex flex-col items-center">
        <PlayerAvatar
          name={userInfo?.username || "用户"}
          avatar={userInfo?.avatarUrl}
          onClick={handleGetUserProfile}
          size="lg"
        />
        <View className="text-xl font-semibold mt-3 mb-2">
          {userInfo?.username}
        </View>
        <GameStatsDisplay stats={gameStats} />
        
        {/* Game Record */}
        <View className="flex items-center justify-center gap-4 text-sm mb-6">
          {/* 从左到右，赢，输，胜率，战绩 */}
          <View>
            赢<View className="text-orange-500 font-semibold">{gameStats.wins}</View>次
          </View>
          <View>/</View>
          <View>
            输<View className="text-orange-500 font-semibold">{gameStats.losses}</View>次
          </View>
          <View>/</View>
          <View>
            胜率<View className="text-orange-500 font-semibold">{gameStats.winRate}</View>
          </View>
          <View 
            onClick={() => Taro.navigateTo({ url: '/pages/game-history/game-history' })}
          >
            战绩 &gt;
          </View>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View className="p-4">
        <View className="flex flex-col gap-4">
          <TaroButton
            onClick={handleCreateRoom}
            className="bg-orange-500 h-12"
            hoverClass="hover-bg-orange-600"
          >
            我要开房
          </TaroButton>
          <TaroButton
            onClick={() => setShowJoinRoomDialog(true)}
            className="h-12 border-orange-500 text-orange-500"
          >
            加入房间
          </TaroButton>
          <TaroButton
            onClick={() => handleJoinRoom("jyyj")}
            className="h-12 border-orange-500 text-orange-500"
          >
            扫码进房
          </TaroButton>
        </View>
        
        {/* Bottom Navigation */}
        <View className="flex justify-center gap-4 pt-4 mt-4">
          {/* <TaroButton>客服</TaroButton> */}
          <Button
          className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg text-lg">
            获取头像昵称</Button>
          {/* <TaroButton>使用手册</TaroButton> */}
        </View>
      </View>
      </View>
      {/* <View className="bg-white border-b p-4 flex items-center justify-between">
        <View className="text-lg font-semibold">游戏记账本</View>
      </View> */}
      
      
      
      {/* QR Code Modal */}
      {/* <QRCodeModal
        isOpen={showQRModal}
        onClose={handleCloseQRModal}
        roomId="jyyj"
      /> */}
      {/* 加入房间对话框，输入房间号 */}
      {showJoinRoomDialog && (
      <View className='fixed left-0 top-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60'>
      <View className='bg-white rounded-lg p-6 w-80'>
        <Text className='block text-center text-lg font-semibold mb-4'>加入房间</Text>
        <View className='text-center flex flex-col gap-4'>
          <Text className='text-sm text-muted-foreground'>输入房间号加入房间</Text>
          <Input type="text" placeholder="请输入房间号" className="border-2 border-orange-500 rounded-md p-2" value={roomId} 
          onInput={(e) => {
            setRoomId(e.detail.value)
          }} />
          <TaroButton 
          className='w-full bg-orange-500'
          hoverClass="hover-bg-orange-600"
          onClick={() => {
            if (roomId) {
              handleJoinRoom(roomId)
              setShowJoinRoomDialog(false)
            } else {
              Taro.showToast({
                title: '请输入房间号',
                icon: 'none'
              })
            }
          }}
        >
          加入房间
        </TaroButton>
        </View>
        <TaroButton className='mt-4 w-full' onClick={() => setShowJoinRoomDialog(false)}>关闭</TaroButton>
      </View>
    </View>
      )}
    </View>
  );
} 
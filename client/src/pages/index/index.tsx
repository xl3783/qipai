import {View, Button as TaroButton, Input, Button, Text, Image} from "@tarojs/components";
import PlayerAvatar from "../../components/player-avatar.js";
// import QRCodeModal from "../../components/qr-code-modal.js";
import {useEffect, useState, useCallback} from "react";
import Taro from "@tarojs/taro";
import {IndexPageModel} from "../../models/IndexPageModel";
import {IndexPageViewModel} from "../../viewmodels/IndexPageViewModel";
import {IndexPageState, UserInfo} from "../../types/index";

export default function Index() {
    const [state, setState] = useState<IndexPageState>({
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

    const {userInfo, gameStats, isLoggingIn} = state;

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
                <View className="text-center mb-8">
                    <View className="relative inline-block mb-6">
                        <PlayerAvatar
                            name={userInfo?.username || "用户"}
                            avatar={userInfo?.avatarUrl}
                            onClick={handleGetUserProfile}
                            size="lg"
                        />
                    </View>
                    <View className="text-3xl font-bold text-gray-900 mb-2">
                        {userInfo?.username}
                    </View>
                    <View className="flex items-center justify-center gap-2 mb-6">
                        <View className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
                            总积分: {gameStats.totalPoints}
                        </View>
                    </View>
                    <View className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <View className="p-6">
                            <View className="grid grid-cols-3 gap-4 text-center">
                                <View>
                                    <View className="text-2xl font-bold text-green-600 mb-1">{gameStats.wins}</View>
                                    <View className="text-sm text-gray-600">胜场</View>
                                </View>
                                <View>
                                    <View className="text-2xl font-bold text-red-600 mb-1">{gameStats.losses}</View>
                                    <View className="text-sm text-gray-600">负场</View>
                                </View>
                                <View>
                                    <View className="text-2xl font-bold text-blue-600 mb-1">{gameStats.winRate}</View>
                                    <View className="text-sm text-gray-600">胜率</View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                <View className="space-y-4">
                    <View className="flex flex-col gap-4 text-center items-center">
                        <Button
                            onClick={handleCreateRoom}
                            className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg text-lg flex items-center justify-center"
                        >
                            开房
                        </Button>
                        <TaroButton
                            onClick={() => setShowJoinRoomDialog(true)}
                            className="w-full h-16 border-2 border-blue-200 hover:bg-blue-50 font-semibold text-lg bg-white/80 backdrop-blur-sm flex items-center justify-center"
                        >
                            加入房间
                        </TaroButton>
                        <TaroButton
                            onClick={() => handleJoinRoom("jyyj")}
                            className="w-full h-16 border-2 border-blue-200 hover:bg-blue-50 font-semibold text-lg bg-white/80 backdrop-blur-sm flex items-center justify-center"
                        >
                            扫码进房
                        </TaroButton>
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
                <View
                    className='fixed left-0 top-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60'>
                    <View className='bg-white rounded-lg p-6 w-80'>
                        <Text className='block text-center text-lg font-semibold mb-4'>加入房间</Text>
                        <View className='text-center flex flex-col gap-4'>
                            <Text className='text-sm text-muted-foreground'>输入房间号加入房间</Text>
                            <Input type="text" placeholder="请输入房间号"
                                   className="border-2 border-orange-500 rounded-md p-2" value={roomId}
                                   onInput={(e) => {
                                       setRoomId(e.detail.value)
                                   }}/>
                            <TaroButton
                                className='w-full bg-orange-500 flex items-center justify-center'
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
                        <TaroButton className='mt-4 w-full flex items-center justify-center'
                                    onClick={() => setShowJoinRoomDialog(false)}>关闭</TaroButton>
                    </View>
                </View>
            )}
        </View>
    );
} 
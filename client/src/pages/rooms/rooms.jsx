import { View, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PlayerAvatar from '../../components/player-avatar.js'
import PlayerProfileModal from '../../components/player-profile-modal.js'
import SpendingLimitModal from '../../components/spending-limit-modal.js'
import TransferModal from '../../components/transfer-modal.js'
import TransactionHistory from '../../components/transaction-history.js'
import './rooms.scss'
import { useCallback, useState, useEffect } from 'react'
import QRCodeModal from '../../components/qr-code-modal.js'
import { Icons } from '../../components/icons.jsx'
import ModalDialog from '../../components/modal-dialog.jsx'
import { AtCard } from "taro-ui"
import { restClient } from '../../services/restClient.js'

export default function Rooms() {

  const [rooms, setRooms] = useState([])

  useEffect(() => {
    const getRooms = async () => {
      const result = await restClient.get("/api/get-rooms");
      console.log('rooms', result.data);
      setRooms(result.data);
    }
    getRooms();
  }, []);

  // useEffect(() => {
  //   const eventSource = new EventSource(`${apiConfig.baseURL}/api/sse`);
  //   eventSource.onmessage = (event) => {
  //     console.log('event', event);
  //   }
  // }, []);

  const RoomCard = ({ room }) => (
    <View className="mb-4 p-4 rounded-lg shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200"
      onClick={() => {
        console.log('room', room)
        if (room.isActive) {  
          Taro.navigateTo({
            url: `/pages/room/room?roomId=${room.id}&roomName=${room.name}`
          })
        } else {
          Taro.navigateTo({
            url: `/pages/settlement/settlement?roomId=${room.id}&roomName=${room.name}`
          })
        }
      }
    }
    >
      <View className="pb-3">
        <View className="flex items-center justify-between">
          <View className="text-lg font-semibold flex items-center gap-2">
            {room.name}
            <View
              variant={room.isActive ? "default" : "secondary"}
              className={`${
                room.isActive
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              } px-2 py-1 text-xs`}
            >
              {/* {room.isActive ? <Icons.Play className="h-3 w-3 mr-1" /> : <Icons.Square className="h-3 w-3 mr-1" />}
              {room.status} */}
              {room.status}
            </View>
          </View>
          {!room.isActive && room.finalRank && (
            <View
              variant="outline"
              className={`${
                room.finalRank === 1
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : room.finalRank === 2
                    ? "bg-gray-50 text-gray-700 border-gray-200"
                    : "bg-orange-50 text-orange-700 border-orange-200"
              } px-2 py-1 text-xs font-semibold`}
            >
              第{room.finalRank}名
            </View>
          )}
        </View>
      </View>
      <View className="space-y-4">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <View>
              <View className="font-medium text-gray-900">房主: {room.host}</View>
              <View className="flex items-center gap-4 text-sm text-gray-600">
                <View className="flex items-center gap-1">
                  {/* <Users className="h-4 w-4" /> */}
                  {room.participants.length}人
                </View>
                <View className="flex items-center gap-1">
                  {/* <Calendar className="h-4 w-4" /> */}
                  {/* {room.date} */}
                </View>
              </View>
            </View>
          </View>
          <View className="text-right">
            <View className={`text-lg font-semibold ${room.myBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {room.myBalance >= 0 ? "+" : ""}¥{room.myBalance}
            </View>
          </View>
        </View>

        {/* Participants */}
        <View className="flex items-center gap-2">
          <View className="text-sm text-gray-600">成员:</View>
          <View className="flex -space-x-2">
            { room.participants.slice(0, 4).map((participant, index) => (
              <View key={index} className="h-6 w-6 ring-2 ring-white">
                <View className="bg-purple-500 text-white text-xs">{participant.charAt(0)}</View>
              </View>
            ))}
            {room.participants.length > 4 && (
              <View className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center">
                <View className="text-xs text-gray-600">+{room.participants.length - 4}</View>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )

  return (
    <View className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <View className="container mx-auto px-4 py-6 max-w-4xl">

        {/* Search */}
        {/* <View className="mb-6">
          <View className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="搜索房间..." className="pl-10 bg-white/80 backdrop-blur-sm" />
          </View>
        </View> */}

        {/* Tabs */}
        <View defaultValue="running" className="w-full">

          <View value="closed" className="space-y-4">
            {rooms.length > 0 ? (
              rooms.map((room) => <RoomCard key={room.id} room={room} />)
            ) : (
              <View className="text-center py-12">
                <View className="text-gray-400 mb-4">
                  {/* <Square className="h-16 w-16 mx-auto" /> */}
                </View>
                <View className="text-gray-500 text-lg">房间为空</View>
              </View>
            )}
          </View>
        </View>

        {/* Summary Stats */}
        {/* <View className="mt-8 shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <View className="p-6">
            <View className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <View>
                <View className="text-2xl font-bold text-blue-600 mb-1">{runningRooms.length + closedRooms.length}</View>
                <View className="text-sm text-gray-600">总房间数</View>
              </View>
              <View>
                <View className="text-2xl font-bold text-green-600 mb-1">{runningRooms.length}</View>
                <View className="text-sm text-gray-600">进行中</View>
              </View>
              <View>
                <View className="text-2xl font-bold text-gray-600 mb-1">{closedRooms.length}</View>
                <View className="text-sm text-gray-600">已关闭</View>
              </View>
              <View>
                <View className="text-2xl font-bold text-yellow-600 mb-1">
                  {closedRooms.filter((room) => room.finalRank === 1).length}
                </View>
                <View className="text-sm text-gray-600">获胜次数</View>
              </View>
            </View>
          </View>
        </View> */}
      </View>
    </View>
  )
} 
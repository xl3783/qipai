import { View, Text } from '@tarojs/components'

export default function GameStatsDisplay({ stats }) {
  return (
    <View className='grid grid-cols-1 gap-4 my-6'>
      {/* <View className='rounded-lg border bg-card text-card-foreground shadow-sm'>
        <View className='text-center p-4'>
          <Text className='text-2xl font-bold'>{stats.friendRanking}</Text>
          <Text className='text-sm text-muted-foreground'>好友排名</Text>
        </View>
      </View> */}
      <View className='rounded-lg border bg-card text-card-foreground shadow-sm'>
        <View className='text-center p-4'>
          <Text className='text-2xl font-bold text-red-500'>
            {stats.totalPoints > 0 ? '+' : ''}{stats.totalPoints}
          </Text>
          <Text className='text-sm text-muted-foreground'>总积分</Text>
        </View>
      </View>
    </View>
  )
} 
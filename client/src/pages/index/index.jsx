import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'
import MyCommonClass from '../../../shared/index.js'
export default function Index () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='index'>
      <Text>Hello world!</Text>
      <Text>{new MyCommonClass('John').greet()}</Text>
    </View>
  )
}

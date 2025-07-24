import { Component } from 'react'
import { View, Text, Input, Button, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default class Transfer extends Component {
  componentDidMount() {}

  state = {
    selectedUser: '',
    selectedUserIndex: -1,
    amount: '',
    note: '',
    roommates: [
      { id: 'zhangsan', name: '张三', balance: 150 },
      { id: 'lisi', name: '李四', balance: 80 },
      { id: 'wangwu', name: '王五', balance: 120 },
    ],
    currentUser: { name: '游客', balance: 200 }
  }

  handleUserChange = (e) => {
    const index = e.detail.value
    const selectedUser = this.state.roommates[index]
    this.setState({
      selectedUser: selectedUser.id,
      selectedUserIndex: index
    })
  }

  handleAmountChange = (e) => {
    this.setState({
      amount: e.detail.value
    })
  }

  handleNoteChange = (e) => {
    this.setState({
      note: e.detail.value
    })
  }

  setQuickAmount = (quickAmount) => {
    this.setState({
      amount: quickAmount.toString()
    })
  }

  handleTransfer = () => {
    const { selectedUser, amount, note, roommates, currentUser } = this.state

    if (!selectedUser) {
      Taro.showToast({
        title: '请选择转账对象',
        icon: 'none'
      })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      Taro.showToast({
        title: '请输入正确的金额',
        icon: 'none'
      })
      return
    }

    if (parseFloat(amount) > currentUser.balance) {
      Taro.showToast({
        title: '余额不足',
        icon: 'none'
      })
      return
    }

    const targetUser = roommates.find(r => r.id === selectedUser)
    
    Taro.showModal({
      title: '确认转账',
      content: `向${targetUser.name}转账¥${amount}${note ? `\n备注：${note}` : ''}`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({
            title: '转账中...'
          })

          setTimeout(() => {
            Taro.hideLoading()
            Taro.showToast({
              title: '转账成功',
              icon: 'success'
            })

            // 重置表单
            this.setState({
              selectedUser: '',
              selectedUserIndex: -1,
              amount: '',
              note: ''
            })
          }, 2000)
        }
      }
    })
  }

  goBack = () => {
    Taro.navigateBack()
  }

  render() {
    const { selectedUser, selectedUserIndex, amount, note, roommates, currentUser } = this.state
    const selectedUserData = roommates.find(r => r.id === selectedUser)

    return (
      <View className='transfer-container'>
        <View className='header'>
          <Button className='back-button' onClick={this.goBack}>
            <Text className='back-icon'>←</Text>
          </Button>
          <View className='header-content'>
            <Text className='title'>转账</Text>
            <Text className='subtitle'>向室友转账</Text>
          </View>
        </View>

        <View className='balance-card'>
          <View className='balance-header'>
            <Text className='wallet-icon'>💰</Text>
            <Text className='balance-label'>当前余额</Text>
          </View>
          <Text className='balance-amount'>¥{currentUser.balance}</Text>
        </View>

        <View className='form-card'>
          <View className='form-header'>
            <Text className='send-icon'>📤</Text>
            <Text className='form-title'>转账信息</Text>
          </View>

          <View className='form-content'>
            <View className='form-item'>
              <Text className='label'>转账对象</Text>
              <Picker
                mode='selector'
                range={roommates.map(r => `${r.name} (¥${r.balance})`)}
                value={selectedUserIndex}
                onChange={this.handleUserChange}
              >
                <View className='picker'>
                  <Text className={selectedUser ? 'selected' : 'placeholder'}>
                    {selectedUser ? `${selectedUserData.name} (¥${selectedUserData.balance})` : '选择室友'}
                  </Text>
                  <Text className='picker-arrow'>▼</Text>
                </View>
              </Picker>
            </View>

            <View className='form-item'>
              <Text className='label'>转账金额</Text>
              <View className='amount-input'>
                <Text className='currency'>¥</Text>
                <Input
                  type='digit'
                  placeholder='0.00'
                  value={amount}
                  onInput={this.handleAmountChange}
                  className='input'
                />
              </View>
            </View>

            <View className='form-item'>
              <Text className='label'>备注 (可选)</Text>
              <Input
                placeholder='转账备注...'
                value={note}
                onInput={this.handleNoteChange}
                className='input'
                maxlength={50}
              />
            </View>

            {selectedUser && amount && (
              <View className='transfer-preview'>
                <View className='preview-users'>
                  <View className='user'>
                    <View className='avatar current'>{currentUser.name.charAt(0)}</View>
                    <Text className='name'>{currentUser.name}</Text>
                  </View>
                  <Text className='arrow'>→</Text>
                  <View className='user'>
                    <View className='avatar target'>
                      {selectedUserData.name.charAt(0)}
                    </View>
                    <Text className='name'>{selectedUserData.name}</Text>
                  </View>
                </View>
                <View className='preview-amount'>
                  <Text className='amount'>¥{amount}</Text>
                  {note && <Text className='note'>{note}</Text>}
                </View>
              </View>
            )}
          </View>
        </View>

        <View className='quick-amounts'>
          <Text className='quick-title'>快速金额</Text>
          <View className='quick-buttons'>
            {[50, 100, 200, 500].map((quickAmount) => (
              <Button
                key={quickAmount}
                className='quick-button'
                onClick={() => this.setQuickAmount(quickAmount)}
              >
                ¥{quickAmount}
              </Button>
            ))}
          </View>
        </View>

        <Button
          className='submit-button'
          onClick={this.handleTransfer}
          disabled={!selectedUser || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentUser.balance}
        >
          <Text className='submit-icon'>📤</Text>
          <Text className='submit-text'>确认转账</Text>
        </Button>

        <View className='warning'>
          <Text className='warning-text'>
            <Text className='warning-label'>提醒：</Text>转账后无法撤销，请确认信息无误
          </Text>
        </View>
      </View>
    )
  }
}
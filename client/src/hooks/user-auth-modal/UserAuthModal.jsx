import React, { useState } from 'react'
import Taro from '@tarojs/taro'
import {View, Button} from '@tarojs/components'
import {
    AtModal,
    AtModalHeader,
    AtModalContent,
    AtModalAction,
    AtAvatar,
    AtInput
} from 'taro-ui'
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/modal.scss'
import 'taro-ui/dist/style/components/icon.scss'
import PlayerAvatar from "../../components/player-avatar";
import {updatePlayerInfo} from "../../services/api";

const UserAuthModal = (param) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [userInfo, setUserInfo] = useState(param._userInfo)
    const [weChatUserInfo, setWeChatUserInfo] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingWechat, setIsLoadingWechat] = useState(false)

    // 获取用户信息
    const handleGetUserInfo = async () => {
        try {
            setIsLoadingWechat(true)
            setIsModalOpen(true)
            // 调用微信获取用户信息接口
            const { userInfo } = await Taro.getUserProfile({
                desc: '用于完善会员资料'
            })
            console.log(userInfo)

            setWeChatUserInfo(userInfo)
            setIsLoadingWechat(false)

        } catch (error) {
            console.error('获取用户信息失败:', error)
            Taro.showToast({
                title: '获取信息失败',
                icon: 'none'
            })
        }
    }

    // 确认上传用户信息
    const handleConfirm = async () => {
        if (!userInfo) return

        setIsLoading(true)
        try {
            const response = await updatePlayerInfo(weChatUserInfo);
            if (response.statusCode === 200) {
                await Taro.showToast({
                    title: '信息上传成功',
                    icon: 'success'
                })
                setUserInfo({
                    username: weChatUserInfo.nickName,
                    avatarUrl: weChatUserInfo.avatarUrl,
                });
                setIsModalOpen(false);
            } else {
                throw new Error('上传失败')
            }


            return response.data;


        } catch (error) {
            console.error('上传用户信息失败:', error)
            Taro.showToast({
                title: '上传失败，请重试',
                icon: 'none'
            })
        } finally {
            setIsLoading(false)
        }
        setIsModalOpen(false)
    }

    // 取消操作
    const handleCancel = () => {
        setIsModalOpen(false)
        setWeChatUserInfo(null)
    }
    const handleInputNickName = (value) =>{
        setWeChatUserInfo({
            ...weChatUserInfo,
            nickName: value
        })
        // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
        return value
    }


    return (
        <View className='user-auth-container'>
            <View className="relative inline-block mb-6">
                <PlayerAvatar
                    name={userInfo?.username || "用户"}
                    avatar={userInfo?.avatarUrl}
                    onClick={handleGetUserInfo}
                    size="lg"
                />
            </View>
            <View className="text-3xl font-bold text-gray-900 mb-2 mx-auto">
                {userInfo?.username}
            </View>
            {/*<AtModal*/}
            {/*    isOpened*/}
            {/*    title='标题'*/}
            {/*    cancelText='取消'*/}
            {/*    confirmText='确认'*/}
            {/*    onClose={ this.handleClose }*/}
            {/*    onCancel={ this.handleCancel }*/}
            {/*    onConfirm={ this.handleConfirm }*/}
            {/*    content='欢迎加入京东凹凸实验室\n\r欢迎加入京东凹凸实验室'*/}
            {/*/>*/}
            <AtModal isOpened={isModalOpen}>
                <AtModalHeader>更新用户信息</AtModalHeader>
                <AtModalContent>
                    {/*{isLoadingWechat*/}
                    {/*    ? (<AtActivityIndicator content='加载中...'></AtActivityIndicator>)*/}
                    {/*    : (<View className='user-info-preview'>*/}
                    {/*    <AtAvatar image={userInfo.avatarUrl} size={"normal"} circle={true}></AtAvatar>*/}
                    {/*    <View className='user-nickname'>{userInfo.nickName}</View>*/}
                    {/*    <AtInput*/}
                    {/*        name='value'*/}
                    {/*        title='用户名'*/}
                    {/*        type='text'*/}
                    {/*        focus={true}*/}
                    {/*        value={userInfo.nickName}*/}
                    {/*        // onChange={this.handleInputNickName.bind(this)}*/}
                    {/*    />*/}
                    {/*</View>*/}

                    {/*)}*/}
                    {weChatUserInfo && (
                        <View className='user-info-preview'>
                            <View className="m-auto">
                                <AtAvatar image={weChatUserInfo.avatarUrl} size={"normal"} circle={true}
                                          className="m-auto"></AtAvatar>
                            </View>
                            <AtInput
                                name='value'
                                title='用户名'
                                type='text'
                                focus={true}
                                editable={false}
                                value={weChatUserInfo.nickName}
                                // onChange={handleInputNickName}
                            />
                        </View>
                    )}
                </AtModalContent>
                <AtModalAction>
                    <Button onClick={handleCancel} disabled={isLoading}>
                        取消
                    </Button>
                    <Button onClick={handleConfirm} loading={isLoading} >
                        {isLoading ? '上传中' : '确认'}
                    </Button>
                </AtModalAction>
            </AtModal>
        </View>
    )
}

export default UserAuthModal
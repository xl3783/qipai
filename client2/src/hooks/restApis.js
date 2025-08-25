import { useState, useEffect, useCallback } from 'react'
import { restClient } from '../services/restClient.js'
import Taro from '@tarojs/taro'

const useLogin = () => {
    const [loginCode, setLoginCode] = useState(null)
    const [isGettingCode, setIsGettingCode] = useState(false)
    const [loginData, setLoginData] = useState(null)
    const [loginLoading, setLoginLoading] = useState(false)
    const [loginError, setLoginError] = useState(null)
    const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false)

    // 获取微信登录码
    useEffect(() => {
        const getLoginCode = async () => {
            try {
                setIsGettingCode(true)
                const res = await Taro.login()
                setLoginCode(res.code)
                console.log('获取到登录码:', res.code)
            } catch (error) {
                console.error('获取登录码失败:', error)
            } finally {
                setIsGettingCode(false)
            }
        }
        
        getLoginCode()
    }, [])

    // 使用登录码进行API调用
    const doLogin = useCallback(async (code) => {
        if (!code || hasAttemptedLogin) return
        
        try {
            setLoginLoading(true)
            setLoginError(null)
            setHasAttemptedLogin(true)
            
            console.log('开始登录，code:', code)
            const response = await restClient.post("/api/wechat-login", { code })
            
            setLoginData(response.data)
            console.log('登录成功:', response.data)
        } catch (error) {
            setLoginError(error)
            console.error('登录失败:', error)
        } finally {
            setLoginLoading(false)
        }
    }, [hasAttemptedLogin])

    // 当获取到登录码时，执行登录
    useEffect(() => {
        if (loginCode && !hasAttemptedLogin) {
            doLogin(loginCode)
        }
    }, [loginCode, hasAttemptedLogin, doLogin])

    return { 
        data: loginData, 
        loading: loginLoading || isGettingCode, 
        error: loginError,
        refetch: () => {
            setHasAttemptedLogin(false)
            setLoginData(null)
            setLoginError(null)
            if (loginCode) {
                doLogin(loginCode)
            }
        }
    }
}

export { useLogin }
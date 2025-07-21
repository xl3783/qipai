import Taro from "@tarojs/taro";
import { restClient } from "../services/restClient.js";
import { LoginResponse, UserInfo, WechatUserInfo } from "../types/index";

export class IndexPageModel {
  /**
   * 微信登录
   */
  async wechatLogin(): Promise<LoginResponse> {
    try {
      // 获取微信登录码
      const res = await Taro.login();
      console.log("获取登录码:", res.code);

      // 调用登录API
      const response = await Taro.request({
        url: "http://localhost:3000/api/wechat-login",
        method: "POST",
        data: { code: res.code },
      });

      const loginResponse = response.data as LoginResponse;
      Taro.setStorageSync("token", loginResponse.token);
      // 将 LoginUser 转换为 UserInfo 格式存储
      const userInfo: UserInfo = {
        username: loginResponse.user.nickname,
        avatarUrl: "",
        playerId: loginResponse.user.id,
      };
      console.log("userInfo", userInfo);
      Taro.setStorageSync("userInfo", userInfo);

      return response.data as LoginResponse;
    } catch (error) {
      console.error("微信登录失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户档案
   */
  async getUserProfile(): Promise<UserInfo> {
    try {
      const response = await restClient.get("/api/players/profile");
      return response.data as UserInfo;
    } catch (error) {
      console.error("获取用户档案失败:", error);
      throw error;
    }
  }

  /**
   * 获取微信用户信息
   */
  async getWechatUserInfo(): Promise<WechatUserInfo> {
    return new Promise((resolve, reject) => {
      Taro.getUserProfile({
        lang: "zh_CN",
        desc: "获取你的昵称、头像、地区及性别",
        success: (response) => {
          const wxUserInfo = response.userInfo as WechatUserInfo;
          console.log("用户信息:", wxUserInfo);
          resolve(wxUserInfo);
        },
        fail: (error) => {
          console.error("用户拒绝了授权");
          reject(error);
        },
      });
    });
  }

  /**
   * 存储token
   */
  async setToken(token: string): Promise<void> {
    await Taro.setStorageSync("token", token);
  }

  /**
   * 获取token
   */
  async getToken(): Promise<string | null> {
    try {
      return await Taro.getStorageSync("token");
    } catch {
      return null;
    }
  }

  /**
   * 存储用户信息
   */
  async setUserInfo(userInfo: WechatUserInfo): Promise<void> {
    // 将 WechatUserInfo 转换为 UserInfo 格式存储
    const appUserInfo: UserInfo = {
      username: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      playerId: "unknown", // 微信用户信息中没有 playerId，需要从其他地方获取
    };
    await Taro.setStorageSync("userInfo", appUserInfo);
  }

  /**
   * 获取存储的用户信息
   */
  async getStoredUserInfo(): Promise<UserInfo | null> {
    try {
      return await Taro.getStorageSync("userInfo");
    } catch {
      return null;
    }
  }
} 
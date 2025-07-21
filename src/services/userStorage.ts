// 用户信息存储服务
import { CtpAccountConfig } from '../types/ctp';
import { CtpConfigManager } from '../config/ctpConfig';

export interface UserInfo {
  account: string;
  password: string;
  server: string;
  lastLoginTime?: string;
  isRemembered: boolean;
}

export class UserStorageService {
  private static readonly STORAGE_KEY = 'ctp_user_info';

  // 保存用户信息
  static saveUserInfo(userInfo: UserInfo): void {
    try {
      if (userInfo.isRemembered) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userInfo));
      } else {
        // 如果不记住密码，只保存账号信息
        const infoToSave = {
          ...userInfo,
          password: '',
          isRemembered: false
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(infoToSave));
      }
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  }

  // 获取用户信息
  static getUserInfo(): UserInfo | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
    return null;
  }

  // 清除用户信息
  static clearUserInfo(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('清除用户信息失败:', error);
    }
  }

  // 转换为CTP配置
  static toCtpConfig(userInfo: UserInfo): CtpAccountConfig {
    const serverConfig = CtpConfigManager.getCurrentServerConfig();
    return {
      broker_id: serverConfig.brokerId,
      account: userInfo.account,
      password: userInfo.password,
      trade_front: serverConfig.tradeFront,
      md_front: serverConfig.marketFront,
      auth_code: serverConfig.authCode || '',
      user_product_info: serverConfig.userProductInfo || 'TauriApp',
      app_id: serverConfig.appId || 'TauriApp_1.0'
    };
  }

  // 获取默认配置
  static getDefaultConfig(): CtpAccountConfig {
    const serverConfig = CtpConfigManager.getCurrentServerConfig();
    return {
      broker_id: serverConfig.brokerId,
      account: '',
      password: '',
      trade_front: serverConfig.tradeFront,
      md_front: serverConfig.marketFront,
      auth_code: serverConfig.authCode || '',
      user_product_info: serverConfig.userProductInfo || 'TauriApp',
      app_id: serverConfig.appId || 'TauriApp_1.0'
    };
  }

  // 验证用户信息
  static validateUserInfo(userInfo: Partial<UserInfo>): string[] {
    const errors: string[] = [];
    
    if (!userInfo.account || userInfo.account.trim() === '') {
      errors.push('请输入交易账号');
    }
    
    if (!userInfo.password || userInfo.password.trim() === '') {
      errors.push('请输入密码');
    }
    
    if (!userInfo.server || userInfo.server.trim() === '') {
      errors.push('请选择服务器');
    }
    
    return errors;
  }

  // 更新最后登录时间
  static updateLastLoginTime(): void {
    const userInfo = this.getUserInfo();
    if (userInfo) {
      userInfo.lastLoginTime = new Date().toISOString();
      this.saveUserInfo(userInfo);
    }
  }
}

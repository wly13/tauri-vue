// 自动重连服务 - 用于在需要时自动重新建立CTP连接
import { ctpService } from './ctpService'
import { UserStorageService } from './userStorage'
import { sessionManager } from './sessionManager'

export class AutoReconnectService {
  private static instance: AutoReconnectService | null = null
  private isReconnecting = false

  private constructor() {}

  public static getInstance(): AutoReconnectService {
    if (!AutoReconnectService.instance) {
      AutoReconnectService.instance = new AutoReconnectService()
    }
    return AutoReconnectService.instance
  }

  /**
   * 确保交易API连接可用
   * 如果没有有效连接，尝试自动重连
   */
  async ensureTraderConnection(): Promise<boolean> {
    try {
      // 检查是否正在重连中
      if (this.isReconnecting) {
        console.log('⏳ 正在重连中，请稍候...')
        return false
      }

      // 尝试获取有效的交易会话ID
      const sessionId = await ctpService.getValidTraderSessionId()
      if (sessionId) {
        console.log('✅ 交易连接已可用:', sessionId)
        return true
      }

      // 没有有效连接，尝试自动重连
      console.log('🔄 开始自动重连...')
      return await this.performAutoReconnect()

    } catch (error) {
      console.error('❌ 确保交易连接失败:', error)
      return false
    }
  }

  /**
   * 执行自动重连
   */
  private async performAutoReconnect(): Promise<boolean> {
    if (this.isReconnecting) {
      return false
    }

    this.isReconnecting = true

    try {
      // 获取用户信息
      const userInfo = UserStorageService.getUserInfo()
      if (!userInfo || !userInfo.account || !userInfo.password) {
        console.error('❌ 没有保存的用户信息，无法自动重连')
        return false
      }

      console.log('🔍 使用保存的用户信息进行自动重连...')

      // 获取CTP配置
      const ctpConfig = UserStorageService.toCtpConfig(userInfo)

      // 检查当前交易API状态
      const traderStatus = ctpService.getTraderStatus()
      
      // 如果没有创建交易API，先创建
      if (traderStatus === 'disconnected') {
        console.log('📡 创建交易API...')
        const createResult = await ctpService.createTraderApi()
        if (!createResult.success) {
          console.error('❌ 创建交易API失败:', createResult.error)
          return false
        }
      }

      // 执行交易登录
      console.log('🔐 执行交易登录...')
      const loginResult = await ctpService.traderLogin(ctpConfig)
      if (!loginResult.success) {
        console.error('❌ 交易登录失败:', loginResult.error)
        return false
      }

      console.log('✅ 自动重连成功')
      return true

    } catch (error) {
      console.error('❌ 自动重连失败:', error)
      return false
    } finally {
      this.isReconnecting = false
    }
  }

  /**
   * 检查是否正在重连
   */
  isReconnectingInProgress(): boolean {
    return this.isReconnecting
  }

  /**
   * 清除会话缓存并重置状态
   */
  clearSessionAndReset(): void {
    sessionManager.clearSessionInfo()
    this.isReconnecting = false
    console.log('🗑️ 已清除会话缓存并重置状态')
  }
}

// 导出单例实例
export const autoReconnectService = AutoReconnectService.getInstance()

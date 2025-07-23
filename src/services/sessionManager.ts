// 会话管理服务 - 用于缓存和管理CTP会话信息
import { invoke } from '@tauri-apps/api/core'

export interface SessionInfo {
  mdSessionId: string | null
  traderSessionId: string | null
  mdStatus: string
  traderStatus: string
  lastUpdateTime: string
}

export class SessionManager {
  private static instance: SessionManager | null = null
  private static readonly STORAGE_KEY = 'ctp_session_info'

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  /**
   * 保存会话信息到本地存储
   */
  saveSessionInfo(sessionInfo: SessionInfo): void {
    try {
      localStorage.setItem(SessionManager.STORAGE_KEY, JSON.stringify(sessionInfo))
      console.log('✅ 会话信息已保存:', sessionInfo)
    } catch (error) {
      console.error('❌ 保存会话信息失败:', error)
    }
  }

  /**
   * 从本地存储获取会话信息
   */
  getSessionInfo(): SessionInfo | null {
    try {
      const stored = localStorage.getItem(SessionManager.STORAGE_KEY)
      if (stored) {
        const sessionInfo = JSON.parse(stored) as SessionInfo
        console.log('📋 获取到缓存的会话信息:', sessionInfo)
        return sessionInfo
      }
    } catch (error) {
      console.error('❌ 获取会话信息失败:', error)
    }
    return null
  }

  /**
   * 清除会话信息
   */
  clearSessionInfo(): void {
    try {
      localStorage.removeItem(SessionManager.STORAGE_KEY)
      console.log('🗑️ 会话信息已清除')
    } catch (error) {
      console.error('❌ 清除会话信息失败:', error)
    }
  }

  /**
   * 验证会话是否仍然有效
   */
  async validateSession(sessionId: string): Promise<boolean> {
    try {
      // 调用后台验证会话是否存在
      const result = await invoke('validate_trader_session', { sessionId }) as { success: boolean }
      return result.success
    } catch (error) {
      console.error('❌ 验证会话失败:', error)
      return false
    }
  }

  /**
   * 检查会话是否过期（超过1小时认为过期）
   */
  isSessionExpired(sessionInfo: SessionInfo): boolean {
    const lastUpdate = new Date(sessionInfo.lastUpdateTime)
    const now = new Date()
    const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
    return diffHours > 1 // 1小时过期
  }

  /**
   * 获取有效的交易会话ID
   * 如果缓存的会话无效，返回null
   */
  async getValidTraderSessionId(): Promise<string | null> {
    const sessionInfo = this.getSessionInfo()
    
    if (!sessionInfo || !sessionInfo.traderSessionId) {
      console.log('⚠️ 没有缓存的交易会话ID')
      return null
    }

    // 检查是否过期
    if (this.isSessionExpired(sessionInfo)) {
      console.log('⚠️ 缓存的会话已过期')
      this.clearSessionInfo()
      return null
    }

    // 验证会话是否仍然有效
    const isValid = await this.validateSession(sessionInfo.traderSessionId)
    if (!isValid) {
      console.log('⚠️ 缓存的会话已失效')
      this.clearSessionInfo()
      return null
    }

    console.log('✅ 找到有效的交易会话ID:', sessionInfo.traderSessionId)
    return sessionInfo.traderSessionId
  }

  /**
   * 更新会话状态
   */
  updateSessionStatus(sessionId: string, status: string, type: 'md' | 'trader'): void {
    const sessionInfo = this.getSessionInfo() || {
      mdSessionId: null,
      traderSessionId: null,
      mdStatus: 'disconnected',
      traderStatus: 'disconnected',
      lastUpdateTime: new Date().toISOString()
    }

    if (type === 'md') {
      sessionInfo.mdSessionId = sessionId
      sessionInfo.mdStatus = status
    } else {
      sessionInfo.traderSessionId = sessionId
      sessionInfo.traderStatus = status
    }

    sessionInfo.lastUpdateTime = new Date().toISOString()
    this.saveSessionInfo(sessionInfo)
  }
}

// 导出单例实例
export const sessionManager = SessionManager.getInstance()

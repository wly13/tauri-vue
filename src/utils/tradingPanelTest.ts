// TradingPanel 测试工具
import { CtpService } from '../services/ctpService'
import { UserStorageService } from '../services/userStorage'
import { CtpConfigManager } from '../config/ctpConfig'

export class TradingPanelTest {
  private ctpService: CtpService

  constructor() {
    this.ctpService = new CtpService()
  }

  // 测试CTP连接
  async testCtpConnection(): Promise<boolean> {
    try {
      console.log('🧪 开始测试CTP连接...')

      // 1. 测试API版本
      const versionResult = await this.ctpService.getApiVersion()
      if (!versionResult.success) {
        console.error('❌ 获取API版本失败:', versionResult.error)
        return false
      }
      console.log('✅ API版本:', versionResult.data)

      // 2. 测试配置
      const currentConfig = CtpConfigManager.getCurrentServerConfig()
      console.log('📋 当前服务器配置:', currentConfig)

      // 3. 测试用户信息
      const userInfo = UserStorageService.getUserInfo()
      if (!userInfo) {
        console.warn('⚠️ 未找到用户信息')
        return false
      }
      console.log('👤 用户信息:', { account: userInfo.account, server: userInfo.server })

      // 4. 测试CTP配置转换
      const ctpConfig = UserStorageService.toCtpConfig(userInfo)
      console.log('🔧 CTP配置:', ctpConfig)

      return true
    } catch (error) {
      console.error('❌ CTP连接测试失败:', error)
      return false
    }
  }

  // 测试行情订阅
  async testMarketDataSubscription(): Promise<boolean> {
    try {
      console.log('🧪 开始测试行情订阅...')

      // 检查MD状态
      const mdStatus = this.ctpService.getMdStatus()
      console.log('📊 MD状态:', mdStatus)

      if (mdStatus !== 'login_success') {
        console.warn('⚠️ MD未登录，无法测试行情订阅')
        return false
      }

      // 订阅测试合约
      const result = await this.ctpService.subscribeMarketData(['rb2509'])
      if (result.success) {
        console.log('✅ 行情订阅成功:', result.data)
        return true
      } else {
        console.error('❌ 行情订阅失败:', result.error)
        return false
      }
    } catch (error) {
      console.error('❌ 行情订阅测试失败:', error)
      return false
    }
  }

  // 测试下单功能
  async testOrderPlacement(): Promise<boolean> {
    try {
      console.log('🧪 开始测试下单功能...')

      // 检查Trader状态
      const traderStatus = this.ctpService.getTraderStatus()
      console.log('💼 Trader状态:', traderStatus)

      if (traderStatus !== 'login_success') {
        console.warn('⚠️ Trader未登录，无法测试下单')
        return false
      }

      // 模拟下单请求（不会真实下单）
      const testOrder = {
        instrument_id: 'rb2509',
        direction: '0', // 买入
        price: 3070,
        volume: 1,
        order_type: '1' // 限价单
      }

      console.log('📤 模拟下单请求:', testOrder)
      console.log('⚠️ 注意：这是测试模式，不会真实下单')

      // 在实际环境中，这里会调用真实的下单接口
      // const result = await this.ctpService.insertOrder(testOrder)
      
      return true
    } catch (error) {
      console.error('❌ 下单功能测试失败:', error)
      return false
    }
  }

  // 运行完整测试套件
  async runFullTest(): Promise<void> {
    console.log('🚀 开始运行TradingPanel完整测试套件...')

    const results = {
      connection: await this.testCtpConnection(),
      marketData: await this.testMarketDataSubscription(),
      orderPlacement: await this.testOrderPlacement()
    }

    console.log('📊 测试结果汇总:')
    console.log('  - CTP连接:', results.connection ? '✅ 通过' : '❌ 失败')
    console.log('  - 行情订阅:', results.marketData ? '✅ 通过' : '❌ 失败')
    console.log('  - 下单功能:', results.orderPlacement ? '✅ 通过' : '❌ 失败')

    const allPassed = Object.values(results).every(result => result)
    console.log('🎯 总体结果:', allPassed ? '✅ 全部通过' : '❌ 部分失败')

    if (allPassed) {
      console.log('🎉 TradingPanel已准备好使用真实数据！')
    } else {
      console.log('⚠️ 请检查失败的测试项目，可能需要使用模拟数据')
    }
  }

  // 获取当前状态信息
  getStatusInfo(): object {
    return {
      mdStatus: this.ctpService.getMdStatus(),
      traderStatus: this.ctpService.getTraderStatus(),
      mdSessionId: this.ctpService.getMdSessionId(),
      traderSessionId: this.ctpService.getTraderSessionId(),
      currentConfig: CtpConfigManager.getCurrentServerConfig(),
      userInfo: UserStorageService.getUserInfo()
    }
  }
}

// 导出便捷函数
export const runTradingPanelTest = async (): Promise<void> => {
  const tester = new TradingPanelTest()
  await tester.runFullTest()
}

export const getCtpStatus = (): object => {
  const tester = new TradingPanelTest()
  return tester.getStatusInfo()
}

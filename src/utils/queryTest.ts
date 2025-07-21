// 查询功能测试工具
import { CtpService } from '../services/ctpService'
import { UserStorageService } from '../services/userStorage'

export class QueryTest {
  private ctpService: CtpService

  constructor() {
    this.ctpService = new CtpService()
  }

  // 测试账户查询
  async testQueryAccount(): Promise<boolean> {
    try {
      console.log('🧪 开始测试账户查询...')

      // 检查Trader状态
      const traderStatus = this.ctpService.getTraderStatus()
      console.log('💼 Trader状态:', traderStatus)

      if (traderStatus !== 'login_success') {
        console.warn('⚠️ Trader未登录，尝试登录...')
        
        const userInfo = UserStorageService.getUserInfo()
        if (!userInfo) {
          console.error('❌ 未找到用户信息')
          return false
        }

        // 创建Trader API
        const createResult = await this.ctpService.createTraderApi()
        if (!createResult.success) {
          console.error('❌ 创建Trader API失败:', createResult.error)
          return false
        }

        // 登录
        const ctpConfig = UserStorageService.toCtpConfig(userInfo)
        const loginResult = await this.ctpService.traderLogin(ctpConfig)
        if (!loginResult.success) {
          console.error('❌ Trader登录失败:', loginResult.error)
          return false
        }

        console.log('✅ Trader登录成功')
      }

      // 查询账户
      const accountResult = await this.ctpService.queryAccount()
      if (accountResult.success) {
        console.log('✅ 账户查询成功:', accountResult.data)
        console.log('💰 可用资金:', accountResult.data?.available)
        console.log('💰 账户余额:', accountResult.data?.balance)
        return true
      } else {
        console.error('❌ 账户查询失败:', accountResult.error)
        return false
      }
    } catch (error) {
      console.error('❌ 账户查询测试异常:', error)
      return false
    }
  }

  // 测试持仓查询
  async testQueryPosition(): Promise<boolean> {
    try {
      console.log('🧪 开始测试持仓查询...')

      // 检查Trader状态
      const traderStatus = this.ctpService.getTraderStatus()
      console.log('💼 Trader状态:', traderStatus)

      if (traderStatus !== 'login_success') {
        console.warn('⚠️ Trader未登录，无法查询持仓')
        return false
      }

      // 查询持仓
      const positionResult = await this.ctpService.queryPosition()
      if (positionResult.success) {
        const positions = positionResult.data || []
        console.log('✅ 持仓查询成功，共', positions.length, '个持仓')
        
        positions.forEach((pos, index) => {
          console.log(`📊 持仓${index + 1}:`, {
            合约: pos.instrument_id,
            方向: pos.posi_direction === '2' ? '多头' : '空头',
            数量: pos.position,
            今仓: pos.today_position,
            昨仓: pos.yd_position,
            持仓成本: pos.position_cost,
            持仓盈亏: pos.position_profit,
            保证金: pos.use_margin
          })
        })
        
        return true
      } else {
        console.error('❌ 持仓查询失败:', positionResult.error)
        return false
      }
    } catch (error) {
      console.error('❌ 持仓查询测试异常:', error)
      return false
    }
  }

  // 运行完整的查询测试
  async runFullQueryTest(): Promise<void> {
    console.log('🚀 开始运行查询功能完整测试...')

    const results = {
      account: await this.testQueryAccount(),
      position: await this.testQueryPosition()
    }

    console.log('📊 查询测试结果汇总:')
    console.log('  - 账户查询:', results.account ? '✅ 通过' : '❌ 失败')
    console.log('  - 持仓查询:', results.position ? '✅ 通过' : '❌ 失败')

    const allPassed = Object.values(results).every(result => result)
    console.log('🎯 总体结果:', allPassed ? '✅ 全部通过' : '❌ 部分失败')

    if (allPassed) {
      console.log('🎉 查询功能测试完成！所有功能正常')
    } else {
      console.log('⚠️ 部分查询功能测试失败，请检查CTP连接状态')
    }
  }

  // 获取查询状态信息
  getQueryStatus(): object {
    return {
      traderStatus: this.ctpService.getTraderStatus(),
      traderSessionId: this.ctpService.getTraderSessionId(),
      userInfo: UserStorageService.getUserInfo()
    }
  }
}

// 导出便捷函数
export const runQueryTest = async (): Promise<void> => {
  const tester = new QueryTest()
  await tester.runFullQueryTest()
}

export const testAccountQuery = async (): Promise<boolean> => {
  const tester = new QueryTest()
  return await tester.testQueryAccount()
}

export const testPositionQuery = async (): Promise<boolean> => {
  const tester = new QueryTest()
  return await tester.testQueryPosition()
}

export const getQueryStatus = (): object => {
  const tester = new QueryTest()
  return tester.getQueryStatus()
}

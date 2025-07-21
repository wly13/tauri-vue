// 价格更新功能测试工具
export class PriceUpdateTest {
  private intervalId: number | null = null
  private testPrices: number[] = [3065, 3068, 3072, 3075, 3071, 3069, 3073, 3076, 3074, 3070]
  private currentIndex = 0

  // 开始价格更新测试
  startPriceTest(updateCallback: (price: number) => void): void {
    console.log('🧪 开始价格更新测试...')
    
    this.intervalId = window.setInterval(() => {
      const newPrice = this.testPrices[this.currentIndex]
      console.log(`📈 测试价格更新: ${newPrice}`)
      
      updateCallback(newPrice)
      
      this.currentIndex = (this.currentIndex + 1) % this.testPrices.length
    }, 2000) // 每2秒更新一次价格
  }

  // 停止价格更新测试
  stopPriceTest(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('⏹️ 价格更新测试已停止')
    }
  }

  // 测试随机价格波动
  startRandomPriceTest(updateCallback: (price: number) => void, basePrice: number = 3070): void {
    console.log('🎲 开始随机价格波动测试...')
    
    let currentPrice = basePrice
    
    this.intervalId = window.setInterval(() => {
      // 随机价格变化 -3 到 +3
      const change = Math.floor(Math.random() * 7) - 3
      currentPrice += change
      
      // 限制价格范围
      currentPrice = Math.max(3050, Math.min(3100, currentPrice))
      
      console.log(`📊 随机价格: ${currentPrice} (变化: ${change > 0 ? '+' : ''}${change})`)
      updateCallback(currentPrice)
    }, 1500) // 每1.5秒更新一次
  }

  // 测试趋势性价格变化
  startTrendPriceTest(updateCallback: (price: number) => void, basePrice: number = 3070): void {
    console.log('📈 开始趋势价格测试...')
    
    let currentPrice = basePrice
    let trend = 1 // 1=上涨, -1=下跌
    let trendDuration = 0
    const maxTrendDuration = 5
    
    this.intervalId = window.setInterval(() => {
      // 按趋势变化价格
      const change = trend * (Math.random() > 0.3 ? 1 : 0)
      currentPrice += change
      trendDuration++
      
      // 趋势持续一定时间后反转
      if (trendDuration >= maxTrendDuration) {
        trend *= -1
        trendDuration = 0
        console.log(`🔄 趋势反转: ${trend > 0 ? '转为上涨' : '转为下跌'}`)
      }
      
      // 限制价格范围
      currentPrice = Math.max(3050, Math.min(3100, currentPrice))
      
      console.log(`📊 趋势价格: ${currentPrice} (趋势: ${trend > 0 ? '上涨' : '下跌'})`)
      updateCallback(currentPrice)
    }, 1000) // 每1秒更新一次
  }

  // 测试极端价格变化
  startExtremePriceTest(updateCallback: (price: number) => void): void {
    console.log('⚡ 开始极端价格变化测试...')
    
    const extremePrices = [3070, 3080, 3060, 3090, 3050, 3085, 3055, 3075]
    let index = 0
    
    this.intervalId = window.setInterval(() => {
      const newPrice = extremePrices[index]
      console.log(`⚡ 极端价格变化: ${newPrice}`)
      
      updateCallback(newPrice)
      index = (index + 1) % extremePrices.length
    }, 3000) // 每3秒一次大幅变化
  }

  // 获取测试状态
  isRunning(): boolean {
    return this.intervalId !== null
  }

  // 获取测试统计
  getTestStats(): object {
    return {
      isRunning: this.isRunning(),
      currentTestIndex: this.currentIndex,
      totalTestPrices: this.testPrices.length
    }
  }
}

// 导出便捷函数
export const createPriceUpdateTest = (): PriceUpdateTest => {
  return new PriceUpdateTest()
}

// 全局测试实例
let globalPriceTest: PriceUpdateTest | null = null

export const startGlobalPriceTest = (
  type: 'sequence' | 'random' | 'trend' | 'extreme',
  updateCallback: (price: number) => void,
  basePrice?: number
): void => {
  // 停止之前的测试
  if (globalPriceTest) {
    globalPriceTest.stopPriceTest()
  }
  
  globalPriceTest = new PriceUpdateTest()
  
  switch (type) {
    case 'sequence':
      globalPriceTest.startPriceTest(updateCallback)
      break
    case 'random':
      globalPriceTest.startRandomPriceTest(updateCallback, basePrice)
      break
    case 'trend':
      globalPriceTest.startTrendPriceTest(updateCallback, basePrice)
      break
    case 'extreme':
      globalPriceTest.startExtremePriceTest(updateCallback)
      break
  }
}

export const stopGlobalPriceTest = (): void => {
  if (globalPriceTest) {
    globalPriceTest.stopPriceTest()
    globalPriceTest = null
  }
}

export const getGlobalPriceTestStats = (): object => {
  return globalPriceTest ? globalPriceTest.getTestStats() : { isRunning: false }
}

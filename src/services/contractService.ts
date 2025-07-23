// 合约数据服务
import type { ContractInfo, ContractCategory } from '@/types/trading'

/**
 * 合约数据服务类
 * 负责管理和提供合约数据
 */
export class ContractService {
  private static instance: ContractService
  private contracts: ContractInfo[] = []
  private categories: ContractCategory[] = []

  private constructor() {
    this.initializeContracts()
  }

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  /**
   * 初始化合约数据
   */
  private initializeContracts() {
    // 苹果合约 (AP)
    const appleContracts: ContractInfo[] = [
      {
        code: 'AP405',
        name: '苹果5月',
        category: '苹果(AP)',
        categoryCode: 'AP',
        month: '5月',
        fullCode: 'AP2405',
        isActive: true,
        lastPrice: 8520,
        changePercent: 1.25,
        volume: 125430,
        openInterest: 45230
      },
      {
        code: 'AP410',
        name: '苹果10月',
        category: '苹果(AP)',
        categoryCode: 'AP',
        month: '10月',
        fullCode: 'AP2410',
        isActive: true,
        lastPrice: 8650,
        changePercent: -0.85,
        volume: 98760,
        openInterest: 38920
      },
      {
        code: 'AP411',
        name: '苹果11月',
        category: '苹果(AP)',
        categoryCode: 'AP',
        month: '11月',
        fullCode: 'AP2411',
        isActive: true,
        lastPrice: 8720,
        changePercent: 0.45,
        volume: 76540,
        openInterest: 29870
      },
      {
        code: 'AP412',
        name: '苹果12月',
        category: '苹果(AP)',
        categoryCode: 'AP',
        month: '12月',
        fullCode: 'AP2412',
        isActive: true,
        lastPrice: 8800,
        changePercent: 2.15,
        volume: 54320,
        openInterest: 21450
      }
    ]

    // 棉花合约 (CF)
    const cottonContracts: ContractInfo[] = [
      {
        code: 'CF405',
        name: '棉花5月',
        category: '棉花(CF)',
        categoryCode: 'CF',
        month: '5月',
        fullCode: 'CF2405',
        isActive: true,
        lastPrice: 15420,
        changePercent: -1.35,
        volume: 234560,
        openInterest: 87650
      },
      {
        code: 'CF407',
        name: '棉花7月',
        category: '棉花(CF)',
        categoryCode: 'CF',
        month: '7月',
        fullCode: 'CF2407',
        isActive: true,
        lastPrice: 15680,
        changePercent: 0.75,
        volume: 198740,
        openInterest: 76540
      },
      {
        code: 'CF409',
        name: '棉花9月',
        category: '棉花(CF)',
        categoryCode: 'CF',
        month: '9月',
        fullCode: 'CF2409',
        isActive: true,
        lastPrice: 15890,
        changePercent: 1.85,
        volume: 167890,
        openInterest: 65430
      },
      {
        code: 'CF411',
        name: '棉花11月',
        category: '棉花(CF)',
        categoryCode: 'CF',
        month: '11月',
        fullCode: 'CF2411',
        isActive: true,
        lastPrice: 16120,
        changePercent: -0.45,
        volume: 143210,
        openInterest: 54320
      }
    ]

    // 红枣合约 (CJ)
    const jujubeContracts: ContractInfo[] = [
      {
        code: 'CJ405',
        name: '红枣5月',
        category: '红枣(CJ)',
        categoryCode: 'CJ',
        month: '5月',
        fullCode: 'CJ2405',
        isActive: true,
        lastPrice: 12340,
        changePercent: 2.45,
        volume: 87650,
        openInterest: 32450
      },
      {
        code: 'CJ407',
        name: '红枣7月',
        category: '红枣(CJ)',
        categoryCode: 'CJ',
        month: '7月',
        fullCode: 'CJ2407',
        isActive: true,
        lastPrice: 12580,
        changePercent: -1.25,
        volume: 76540,
        openInterest: 28760
      },
      {
        code: 'CJ409',
        name: '红枣9月',
        category: '红枣(CJ)',
        categoryCode: 'CJ',
        month: '9月',
        fullCode: 'CJ2409',
        isActive: true,
        lastPrice: 12780,
        changePercent: 0.85,
        volume: 65430,
        openInterest: 24580
      },
      {
        code: 'CJ412',
        name: '红枣12月',
        category: '红枣(CJ)',
        categoryCode: 'CJ',
        month: '12月',
        fullCode: 'CJ2412',
        isActive: true,
        lastPrice: 13020,
        changePercent: 1.65,
        volume: 54320,
        openInterest: 20450
      }
    ]

    // 豆粕合约 (M)
    const mealContracts: ContractInfo[] = [
      {
        code: 'M405',
        name: '豆粕5月',
        category: '豆粕(M)',
        categoryCode: 'M',
        month: '5月',
        fullCode: 'M2405',
        isActive: true,
        lastPrice: 3245,
        changePercent: -0.75,
        volume: 456780,
        openInterest: 198760
      },
      {
        code: 'M407',
        name: '豆粕7月',
        category: '豆粕(M)',
        categoryCode: 'M',
        month: '7月',
        fullCode: 'M2407',
        isActive: true,
        lastPrice: 3280,
        changePercent: 1.15,
        volume: 398540,
        openInterest: 167890
      },
      {
        code: 'M409',
        name: '豆粕9月',
        category: '豆粕(M)',
        categoryCode: 'M',
        month: '9月',
        fullCode: 'M2409',
        isActive: true,
        lastPrice: 3320,
        changePercent: 0.95,
        volume: 345670,
        openInterest: 145320
      }
    ]

    // 螺纹钢合约 (RB)
    const rebarContracts: ContractInfo[] = [
      {
        code: 'RB405',
        name: '螺纹钢5月',
        category: '螺纹钢(RB)',
        categoryCode: 'RB',
        month: '5月',
        fullCode: 'RB2405',
        isActive: true,
        lastPrice: 3680,
        changePercent: -1.85,
        volume: 678900,
        openInterest: 298760
      },
      {
        code: 'RB410',
        name: '螺纹钢10月',
        category: '螺纹钢(RB)',
        categoryCode: 'RB',
        month: '10月',
        fullCode: 'RB2410',
        isActive: true,
        lastPrice: 3720,
        changePercent: 0.65,
        volume: 567890,
        openInterest: 245670
      }
    ]

    // 合并所有合约
    this.contracts = [
      ...appleContracts,
      ...cottonContracts,
      ...jujubeContracts,
      ...mealContracts,
      ...rebarContracts
    ]

    // 创建分类
    this.categories = [
      { code: 'AP', name: '苹果', contracts: appleContracts },
      { code: 'CF', name: '棉花', contracts: cottonContracts },
      { code: 'CJ', name: '红枣', contracts: jujubeContracts },
      { code: 'M', name: '豆粕', contracts: mealContracts },
      { code: 'RB', name: '螺纹钢', contracts: rebarContracts }
    ]
  }

  /**
   * 获取所有合约
   */
  public getAllContracts(): ContractInfo[] {
    return [...this.contracts]
  }

  /**
   * 获取所有分类
   */
  public getAllCategories(): ContractCategory[] {
    return [...this.categories]
  }

  /**
   * 根据关键词搜索合约
   */
  public searchContracts(keyword: string): ContractInfo[] {
    if (!keyword.trim()) {
      return this.getAllContracts()
    }

    const lowerKeyword = keyword.toLowerCase().trim()
    
    return this.contracts.filter(contract => 
      contract.code.toLowerCase().includes(lowerKeyword) ||
      contract.name.toLowerCase().includes(lowerKeyword) ||
      contract.category.toLowerCase().includes(lowerKeyword) ||
      contract.categoryCode.toLowerCase().includes(lowerKeyword) ||
      contract.fullCode.toLowerCase().includes(lowerKeyword)
    )
  }

  /**
   * 根据合约代码获取合约信息
   */
  public getContractByCode(code: string): ContractInfo | null {
    return this.contracts.find(contract => 
      contract.code === code || contract.fullCode === code
    ) || null
  }

  /**
   * 根据分类代码获取合约列表
   */
  public getContractsByCategory(categoryCode: string): ContractInfo[] {
    const category = this.categories.find(cat => cat.code === categoryCode)
    return category ? [...category.contracts] : []
  }

  /**
   * 更新合约价格数据（模拟实时数据更新）
   */
  public updateContractPrices() {
    this.contracts.forEach(contract => {
      if (contract.lastPrice) {
        // 模拟价格波动 (-2% 到 +2%)
        const changeRate = (Math.random() - 0.5) * 0.04
        const newPrice = Math.round(contract.lastPrice * (1 + changeRate))
        const changePercent = ((newPrice - contract.lastPrice) / contract.lastPrice) * 100
        
        contract.lastPrice = newPrice
        contract.changePercent = Math.round(changePercent * 100) / 100
        
        // 模拟成交量变化
        if (contract.volume) {
          contract.volume += Math.floor(Math.random() * 1000)
        }
      }
    })
  }
}

// 导出单例实例
export const contractService = ContractService.getInstance()

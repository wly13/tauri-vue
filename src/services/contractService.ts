// 合约数据服务 - 直接从 CTP API 获取真实数据
import type { ContractInfo, ContractCategory } from '@/types/trading'
import { ctpService } from './ctpService'
import { autoReconnectService } from './autoReconnectService'

/**
 * 合约数据服务类
 * 负责管理和提供合约数据 - 直接从 CTP API 获取真实数据
 */
export class ContractService {
  private static instance: ContractService
  private contracts: ContractInfo[] = []
  private categories: ContractCategory[] = []
  private isInitialized: boolean = false
  private isLoading: boolean = false

  private constructor() {
    // 不在构造函数中初始化，改为异步初始化
  }

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  /**
   * 异步初始化合约数据 - 直接从 CTP API 获取
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized || this.isLoading) {
      return
    }

    this.isLoading = true
    
    try {
      console.log('🔍 开始从 CTP API 获取合约数据...')

      // 确保交易连接可用，如果没有则自动重连
      const isConnected = await autoReconnectService.ensureTraderConnection()
      if (!isConnected) {
        throw new Error('CTP 交易 API 未连接，请先登录')
      }

      // 查询所有合约信息
      const result = await ctpService.queryInstruments()

      if (result.success && result.data) {
        console.log(`📋 获取到 ${result.data.length} 个合约信息`)
        this.processRealContractData(result.data)
        this.isInitialized = true
        console.log('✅ 合约数据初始化成功')
      } else {
        throw new Error(result.error || '查询合约信息失败')
      }
    } catch (error) {
      console.error('❌ 初始化合约数据失败:', error)
      throw error
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 处理从 CTP API 获取的合约数据
   */
  private processRealContractData(rawData: any[]): void {
    const contractMap = new Map<string, ContractInfo[]>()

    console.log('🔄 开始处理合约数据...')

    // 处理原始数据并转换为 ContractInfo 格式
    rawData.forEach(item => {
      // 只处理活跃的交易合约
      if (item.is_trading !== 1) {
        return
      }

      const contract: ContractInfo = {
        code: item.instrument_id || '',
        name: item.instrument_name || item.instrument_id || '',
        category: `${this.getCategoryName(item.product_id)}(${item.product_id})`,
        categoryCode: item.product_id || '',
        month: this.extractMonth(item.instrument_id),
        fullCode: item.instrument_id || '',
        isActive: item.is_trading === 1,
        lastPrice: 0, // 初始价格为0，后续通过行情数据更新
        changePercent: 0, // 需要通过行情数据计算
        volume: 0, // 初始成交量为0，后续通过行情数据更新
        openInterest: 0 // 初始持仓量为0，后续通过行情数据更新
      }

      const categoryCode = contract.categoryCode.toUpperCase()
      if (!contractMap.has(categoryCode)) {
        contractMap.set(categoryCode, [])
      }
      contractMap.get(categoryCode)!.push(contract)
    })

    // 转换为分类格式
    this.contracts = []
    this.categories = []

    contractMap.forEach((contracts, categoryCode) => {
      // 按合约代码排序
      contracts.sort((a, b) => a.code.localeCompare(b.code))
      
      this.contracts.push(...contracts)
      
      // 获取分类名称
      const categoryName = this.getCategoryName(categoryCode)
      
      this.categories.push({
        code: categoryCode,
        name: categoryName,
        contracts: contracts
      })
    })

    // 按分类代码排序
    this.categories.sort((a, b) => a.code.localeCompare(b.code))

    console.log(`✅ 处理完成：${this.contracts.length} 个合约，${this.categories.length} 个分类`)
    
    // 打印前几个分类的信息
    this.categories.slice(0, 5).forEach(category => {
      console.log(`📂 ${category.name}(${category.code}): ${category.contracts.length} 个合约`)
    })
  }

  /**
   * 从合约代码中提取月份信息
   */
  private extractMonth(instrumentId: string): string {
    if (!instrumentId) return ''
    
    // 提取数字部分，通常是年月格式，如 2501 表示 25年1月
    const match = instrumentId.match(/(\d{2})(\d{2})$/)
    if (match) {
      const month = parseInt(match[2])
      return `${month}月`
    }
    
    return ''
  }

  /**
   * 获取分类中文名称
   */
  private getCategoryName(categoryCode: string): string {
    const categoryNames: Record<string, string> = {
      'AP': '苹果',
      'CF': '棉花',
      'CJ': '红枣',
      'M': '豆粕',
      'RB': '螺纹钢',
      'HC': '热卷',
      'I': '铁矿石',
      'J': '焦炭',
      'JM': '焦煤',
      'A': '豆一',
      'Y': '豆油',
      'P': '棕榈油',
      'C': '玉米',
      'CS': '玉米淀粉',
      'RM': '菜粕',
      'OI': '菜油',
      'MA': '甲醇',
      'FG': '玻璃',
      'SA': '纯碱',
      'UR': '尿素',
      'ZC': '动力煤',
      'SF': '硅铁',
      'SM': '锰硅',
      'V': '铁合金',
      'PP': '聚丙烯',
      'L': '聚乙烯',
      'EB': '苯乙烯',
      'EG': '乙二醇',
      'PG': '液化石油气',
      'TA': 'PTA',
      'PF': '短纤',
      'PK': '花生',
      'LR': '晚籼稻',
      'WH': '强麦',
      'PM': '普麦',
      'RI': '早籼稻',
      'RS': '菜籽',
      'JR': '粳稻',
      'LH': '生猪',
      'NR': '20号胶',
      'RU': '天然橡胶',
      'BU': '沥青',
      'FU': '燃料油',
      'SC': '原油',
      'LU': '低硫燃料油',
      'BC': '国际铜',
      'AL': '沪铝',
      'CU': '沪铜',
      'PB': '沪铅',
      'ZN': '沪锌',
      'SN': '沪锡',
      'NI': '沪镍',
      'SS': '不锈钢',
      'AU': '沪金',
      'AG': '沪银',
      'IF': '沪深300',
      'IH': '上证50',
      'IC': '中证500',
      'IM': '中证1000',
      'TS': '2年期国债',
      'TF': '5年期国债',
      'T': '10年期国债',
      'TL': '30年期国债'
    }
    
    return categoryNames[categoryCode.toUpperCase()] || categoryCode
  }

  /**
   * 获取所有合约（异步版本，确保数据已初始化）
   */
  public async getAllContracts(): Promise<ContractInfo[]> {
    await this.initialize()
    return [...this.contracts]
  }

  /**
   * 获取所有分类（异步版本，确保数据已初始化）
   */
  public async getAllCategories(): Promise<ContractCategory[]> {
    await this.initialize()
    return [...this.categories]
  }

  /**
   * 获取所有合约（同步版本，用于已初始化的情况）
   */
  public getAllContractsSync(): ContractInfo[] {
    return [...this.contracts]
  }

  /**
   * 获取所有分类（同步版本，用于已初始化的情况）
   */
  public getAllCategoriesSync(): ContractCategory[] {
    return [...this.categories]
  }

  /**
   * 根据关键词搜索合约（异步版本）
   */
  public async searchContracts(keyword: string): Promise<ContractInfo[]> {
    await this.initialize()
    
    if (!keyword.trim()) {
      return this.getAllContractsSync()
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
   * 根据合约代码获取合约信息（异步版本）
   */
  public async getContractByCode(code: string): Promise<ContractInfo | null> {
    await this.initialize()
    return this.contracts.find(contract => 
      contract.code === code || contract.fullCode === code
    ) || null
  }

  /**
   * 更新合约价格数据 - 从 CTP API 获取实时价格
   */
  public async updateContractPrices(): Promise<void> {
    try {
      // 检查是否有合约数据
      if (this.contracts.length === 0) {
        console.log('📋 没有合约数据，跳过价格更新')
        return
      }

      // 检查行情 API 是否已连接
      const mdSessionId = ctpService.getMdSessionId()
      if (!mdSessionId) {
        console.log('📡 行情 API 未连接，跳过价格更新')
        return
      }

      // 获取前20个活跃合约的代码（避免订阅过多合约）
      const activeContracts = this.contracts.filter(contract => contract.isActive).slice(0, 20)
      const instrumentIds = activeContracts.map(contract => contract.fullCode)
      
      if (instrumentIds.length === 0) {
        console.log('📋 没有活跃合约，跳过价格更新')
        return
      }

      console.log(`📡 订阅 ${instrumentIds.length} 个合约的行情数据:`, instrumentIds.slice(0, 5))

      // 订阅行情数据
      const result = await ctpService.subscribeMarketData(instrumentIds)

      if (result.success) {
        console.log('✅ 成功订阅行情数据')
      } else {
        console.warn('⚠️ 订阅行情数据失败:', result.error)
      }
    } catch (error) {
      console.error('❌ 更新真实价格数据失败:', error)
    }
  }

  /**
   * 检查是否已初始化
   */
  public isDataInitialized(): boolean {
    return this.isInitialized
  }

  /**
   * 强制重新初始化
   */
  public async forceReinitialize(): Promise<void> {
    this.isInitialized = false
    this.contracts = []
    this.categories = []
    await this.initialize()
  }
}

// 导出单例实例
export const contractService = ContractService.getInstance()

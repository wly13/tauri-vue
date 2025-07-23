// 合约状态管理
import { ref, reactive } from 'vue'
import type { ContractInfo } from '@/types/trading'

/**
 * 合约状态管理
 * 用于在不同组件间共享当前选中的合约信息
 */
class ContractStore {
  private static instance: ContractStore

  // 当前选中的合约
  public currentContract = ref<ContractInfo | null>(null)
  
  // 合约面板映射 (panelId -> contractInfo)
  public panelContracts = reactive<Map<string, ContractInfo>>(new Map())

  private constructor() {}

  public static getInstance(): ContractStore {
    if (!ContractStore.instance) {
      ContractStore.instance = new ContractStore()
    }
    return ContractStore.instance
  }

  /**
   * 设置当前合约
   */
  setCurrentContract(contract: ContractInfo | null) {
    this.currentContract.value = contract
    console.log('设置当前合约:', contract)
  }

  /**
   * 获取当前合约
   */
  getCurrentContract(): ContractInfo | null {
    return this.currentContract.value
  }

  /**
   * 为面板设置合约
   */
  setPanelContract(panelId: string, contract: ContractInfo) {
    this.panelContracts.set(panelId, contract)
    console.log(`为面板 ${panelId} 设置合约:`, contract)
  }

  /**
   * 获取面板的合约
   */
  getPanelContract(panelId: string): ContractInfo | null {
    return this.panelContracts.get(panelId) || null
  }

  /**
   * 移除面板的合约
   */
  removePanelContract(panelId: string) {
    this.panelContracts.delete(panelId)
    console.log(`移除面板 ${panelId} 的合约`)
  }

  /**
   * 清除所有面板合约
   */
  clearAllPanelContracts() {
    this.panelContracts.clear()
    console.log('清除所有面板合约')
  }

  /**
   * 获取所有面板合约
   */
  getAllPanelContracts(): Map<string, ContractInfo> {
    return new Map(this.panelContracts)
  }
}

// 导出单例实例
export const contractStore = ContractStore.getInstance()

// 导出组合式函数
export function useContractStore() {
  const store = contractStore

  return {
    currentContract: store.currentContract,
    panelContracts: store.panelContracts,
    setCurrentContract: store.setCurrentContract.bind(store),
    getCurrentContract: store.getCurrentContract.bind(store),
    setPanelContract: store.setPanelContract.bind(store),
    getPanelContract: store.getPanelContract.bind(store),
    removePanelContract: store.removePanelContract.bind(store),
    clearAllPanelContracts: store.clearAllPanelContracts.bind(store),
    getAllPanelContracts: store.getAllPanelContracts.bind(store)
  }
}

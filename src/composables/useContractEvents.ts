// 合约事件监听组合式函数
import { onMounted, onUnmounted } from 'vue'
import { listen } from '@tauri-apps/api/event'
import { message } from 'ant-design-vue'
import type { ContractInfo } from '@/types/trading'
import { useContractStore } from '@/stores/contractStore'

export function useContractEvents(
  openTradingPanelCallback?: (setNumber: number, tradeName?: string) => Promise<void>,
  getCurrentActiveSet?: () => number
) {
  const { setCurrentContract, setPanelContract } = useContractStore()
  let unlistenContractSelected: (() => void) | null = null

  // 处理合约选择事件
  const handleContractSelected = async (contract: ContractInfo) => {
    console.log('收到合约选择事件:', contract)

    try {
      // 获取当前选中的集合编号
      const activeSetNumber = getCurrentActiveSet ? getCurrentActiveSet() : 1
      console.log(`使用当前选中的集合: ${activeSetNumber}`)

      // 设置当前选中的合约
      setCurrentContract(contract)

      // 使用合约代码作为面板标题
      const tradeName = `${contract.name} (${contract.code})`

      // 调用传入的回调函数打开交易面板，使用当前选中的集合
      if (openTradingPanelCallback) {
        await openTradingPanelCallback(activeSetNumber, tradeName)

        // 为新打开的面板设置合约信息
        const panelId = `trading-panel-${activeSetNumber}-${Date.now()}`
        setPanelContract(panelId, contract)

        message.success(`已在集合${activeSetNumber}打开 ${contract.name} 合约面板`)
      } else {
        console.warn('未提供 openTradingPanelCallback，无法打开交易面板')
        message.warning('无法打开交易面板')
      }
    } catch (error) {
      console.error('处理合约选择失败:', error)
      message.error('打开合约面板失败')
    }
  }

  // 初始化事件监听
  const initializeEventListeners = async () => {
    try {
      // 监听合约选择事件
      unlistenContractSelected = await listen('contract-selected', (event) => {
        const contract = event.payload as ContractInfo
        handleContractSelected(contract)
      })
      
      console.log('合约事件监听器已初始化')
    } catch (error) {
      console.error('初始化合约事件监听器失败:', error)
    }
  }

  // 清理事件监听
  const cleanupEventListeners = () => {
    if (unlistenContractSelected) {
      unlistenContractSelected()
      unlistenContractSelected = null
      console.log('合约事件监听器已清理')
    }
  }

  // 生命周期钩子
  onMounted(() => {
    initializeEventListeners()
  })

  onUnmounted(() => {
    cleanupEventListeners()
  })

  return {
    handleContractSelected,
    initializeEventListeners,
    cleanupEventListeners
  }
}

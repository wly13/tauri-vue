// 应用操作组合式函数

import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { Window } from '@tauri-apps/api/window'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import type { MenuAction, ContractInfo } from '@/types/trading'
import { useContractStore } from '@/stores/contractStore'

export function useAppActions(
  openTradingPanelCallback?: (setNumber: number, tradeName?: string) => Promise<void>,
  getCurrentActiveSet?: () => number
) {
  // 搜索窗口引用
  const searchWindow = ref<WebviewWindow | null>(null)

  // 合约状态管理
  const { setCurrentContract, setPanelContract } = useContractStore()

  // 搜索功能 - 创建独立的搜索窗口
  const openSearchDialog = async () => {
    try {
      console.log('创建独立的合约搜索窗口')

      // 检查是否已有搜索窗口
      if (searchWindow.value) {
        // 如果窗口已存在，聚焦到该窗口
        await searchWindow.value.setFocus()
        await searchWindow.value.unminimize()
        return
      }

      // 创建新的搜索窗口
      const windowId = `contract-search-${Date.now()}`

      const window = new WebviewWindow(windowId, {
        url: '#/contract-search',
        title: '合约订阅与管理',
        width: 800,
        height: 600,
        resizable: true,
        decorations: true,
        alwaysOnTop: true,
        center: true,
        skipTaskbar: false,
        visible: true,
        minimizable: true,
        maximizable: false,
        closable: true,
        focus: true
      })

      // 监听窗口创建成功
      window.once('tauri://created', () => {
        searchWindow.value = window
        console.log('合约搜索窗口创建成功')
      })

      // 监听窗口关闭
      window.once('tauri://close-requested', () => {
        searchWindow.value = null
        console.log('合约搜索窗口已关闭')
      })

      // 监听窗口销毁
      window.once('tauri://destroyed', () => {
        if (searchWindow.value) {
          searchWindow.value = null
          console.log('合约搜索窗口已销毁')
        }
      })

      // 监听窗口创建失败
      window.once('tauri://error', (error) => {
        console.error('创建合约搜索窗口失败:', error)
        message.error(`创建搜索窗口失败: ${error}`)
        searchWindow.value = null
      })

    } catch (error) {
      console.error('打开合约搜索窗口失败:', error)
      message.error(`打开搜索窗口失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 处理合约选择
  const handleContractSelected = async (contract: ContractInfo) => {
    console.log('选择了合约:', contract)

    try {
      // 打开合约交易面板
      await openContractTradingPanel(contract)

      message.success(`已打开 ${contract.name} 合约面板`)
    } catch (error) {
      console.error('打开合约面板失败:', error)
      message.error('打开合约面板失败')
    }
  }

  // 打开合约交易面板
  const openContractTradingPanel = async (contract: ContractInfo) => {
    console.log(`准备打开合约 ${contract.code} 的交易面板`)

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

      console.log(`已为集合${activeSetNumber}打开合约${contract.code}的交易面板`)
    } else {
      console.warn('未提供 openTradingPanelCallback，无法打开交易面板')
    }
  }

  // 同步数据
  const syncData = async () => {
    try {
      message.loading('正在同步数据...', 2)
      // TODO: 实现与服务器同步
      setTimeout(() => {
        message.success('数据同步完成')
      }, 2000)
    } catch (error) {
      console.error('同步数据失败:', error)
      message.error('同步数据失败')
    }
  }

  // 检查更新
  const checkForUpdates = async () => {
    try {
      message.loading('正在检查更新...', 2)
      // TODO: 实现版本检查
      setTimeout(() => {
        message.info('当前已是最新版本')
      }, 2000)
    } catch (error) {
      console.error('检查更新失败:', error)
      message.error('检查更新失败')
    }
  }

  // 退出应用
  const exitApplication = async (closeAllTradingPanels: () => Promise<void>) => {
    try {
      // 关闭所有交易面板
      await closeAllTradingPanels()

      // 关闭主窗口
      const mainWindow = Window.getCurrent()
      await mainWindow.close()
    } catch (error) {
      console.error('退出应用失败:', error)
    }
  }

  // 配置交易集
  const configureTradingSet = (setNumber: number) => {
    message.info(`配置交易集${setNumber}`)
    // TODO: 实现交易集配置功能
  }

  // 处理菜单操作
  const handleMenuAction = async (
    action: MenuAction,
    callbacks: {
      saveConfiguration: () => Promise<void>
      loadXMLConfiguration: () => Promise<void>
      closeAllTradingPanels: () => Promise<void>
    }
  ) => {
    switch (action) {
      case 'save':
        await callbacks.saveConfiguration()
        break
      case 'load':
        await callbacks.loadXMLConfiguration()
        break
      case 'search':
        await openSearchDialog()
        break
      case 'sync':
        await syncData()
        break
      case 'update':
        await checkForUpdates()
        break
      case 'exit':
        await exitApplication(callbacks.closeAllTradingPanels)
        break
    }
  }

  return {
    searchWindow,
    openSearchDialog,
    handleContractSelected,
    openContractTradingPanel,
    syncData,
    checkForUpdates,
    exitApplication,
    configureTradingSet,
    handleMenuAction
  }
}

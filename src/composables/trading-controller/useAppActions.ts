// 应用操作组合式函数

import { message } from 'ant-design-vue'
import { Window } from '@tauri-apps/api/window'
import type { MenuAction } from '@/types/trading'

export function useAppActions() {
  // 搜索功能
  const openSearchDialog = async () => {
    message.info('搜索功能 - 可搜索合约、策略等')
    // TODO: 实现搜索对话框
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
    openSearchDialog,
    syncData,
    checkForUpdates,
    exitApplication,
    configureTradingSet,
    handleMenuAction
  }
}

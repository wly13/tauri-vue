// 交易面板窗口管理组合式函数

import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

export function useTradingPanels() {
  // 交易面板窗口管理
  const tradingPanels = ref<Map<string, WebviewWindow>>(new Map())

  // 检查指定集合是否有活跃的窗口
  const hasActivePanels = (setNumber: number): boolean => {
    return Array.from(tradingPanels.value.keys())
      .some(id => id.startsWith(`trading-panel-${setNumber}-`))
  }

  // 获取指定集合的所有窗口
  const getSetPanels = (setNumber: number): [string, WebviewWindow][] => {
    return Array.from(tradingPanels.value.entries())
      .filter(([id]) => id.startsWith(`trading-panel-${setNumber}-`))
  }

  // 打开交易面板
  const openTradingPanel = async (setNumber: number) => {
    try {
      // 检查当前交易集是否已有面板
      const existingPanels = getSetPanels(setNumber)
      if (existingPanels.length > 0) {
        // 如果已有面板，聚焦到现有面板
        try {
          const [, existingPanel] = existingPanels[0]
          await existingPanel.setFocus()
          await existingPanel.unminimize()
          return
        } catch (error) {
          // 如果聚焦失败，可能窗口已关闭，清理并继续创建新窗口
          console.error('聚焦现有窗口失败:', error)
          const [panelId] = existingPanels[0]
          tradingPanels.value.delete(panelId)
        }
      }

      // 再次检查，确保没有重复创建
      const finalCheck = getSetPanels(setNumber)
      if (finalCheck.length > 0) {
        console.log(`集合${setNumber}已有面板，跳过创建`)
        return
      }

      // 创建新窗口
      const timestamp = Date.now()
      const panelId = `trading-panel-${setNumber}-${timestamp}`

      // 立即添加到管理列表，防止重复创建
      tradingPanels.value.set(panelId, null as any) // 临时占位

      // 计算窗口位置
      const offsetX = (setNumber - 1) * 50 // 根据集合编号偏移
      const offsetY = (setNumber - 1) * 50

      // 创建新的交易面板窗口
      const panel = new WebviewWindow(panelId, {
        url: '/trading-panel',
        title: `交易面板 - 集合${setNumber}`,
        width: 800,
        height: 600,
        resizable: true,
        decorations: true,
        alwaysOnTop: false,
        center: false,
        x: 300 + offsetX,
        y: 150 + offsetY,
        skipTaskbar: false,
        visible: true
      })

      // 监听窗口创建成功
      panel.once('tauri://created', () => {
        tradingPanels.value.set(panelId, panel) // 替换临时占位
        console.log(`交易面板创建成功: ${panelId}`)
      })

      // 监听窗口关闭
      panel.once('tauri://close-requested', () => {
        tradingPanels.value.delete(panelId)
        console.log(`交易面板已关闭: ${panelId}`)
      })

      // 监听窗口销毁（确保清理）
      panel.once('tauri://destroyed', () => {
        if (tradingPanels.value.has(panelId)) {
          tradingPanels.value.delete(panelId)
          console.log(`交易面板已销毁并清理: ${panelId}`)
        }
      })

      // 监听窗口创建失败
      panel.once('tauri://error', (error) => {
        console.error('创建交易面板失败:', error)
        message.error(`创建交易面板失败: ${error}`)
        // 清理临时占位
        tradingPanels.value.delete(panelId)
      })

    } catch (error) {
      console.error('打开交易面板失败:', error)
      message.error(`打开交易面板失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 关闭指定交易集的面板
  const closeAllPanels = async (setNumber: number) => {
    try {
      const panelsToClose = getSetPanels(setNumber)

      if (panelsToClose.length === 0) {
        message.info(`交易集${setNumber}没有打开的面板`)
        return
      }

      const [id, panel] = panelsToClose[0] // 现在每个集合只有一个面板
      await panel.close()
      tradingPanels.value.delete(id)

    } catch (error) {
      console.error('关闭面板失败:', error)
      message.error('关闭面板失败')
    }
  }

  // 关闭所有面板
  const closeAllTradingPanels = async () => {
    try {
      const panelEntries = Array.from(tradingPanels.value.entries())
      for (const [, panel] of panelEntries) {
        await panel.close()
      }
      tradingPanels.value.clear()
    } catch (error) {
      console.error('关闭所有面板失败:', error)
    }
  }

  return {
    tradingPanels,
    hasActivePanels,
    getSetPanels,
    openTradingPanel,
    closeAllPanels,
    closeAllTradingPanels
  }
}

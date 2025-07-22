// 系统原生菜单管理组合式函数

import { Menu, MenuItem, Submenu } from '@tauri-apps/api/menu'
import { LogicalPosition } from '@tauri-apps/api/dpi'
import type { MenuAction } from '@/types/trading'

export function useSystemMenu() {
  // 创建主右键菜单
  const createMainContextMenu = async (
    handleMenuAction: (action: MenuAction) => void
  ) => {
    try {
      // 创建菜单项
      const saveItem = await MenuItem.new({
        text: '💾 保存配置',
        action: () => handleMenuAction('save')
      })

      const loadItem = await MenuItem.new({
        text: '📂 加载配置',
        action: () => handleMenuAction('load')
      })

      const searchItem = await MenuItem.new({
        text: '🔍 搜索',
        action: () => handleMenuAction('search')
      })

      const exitItem = await MenuItem.new({
        text: '🚪 退出',
        action: () => handleMenuAction('exit')
      })

      // 分隔符
      const separator1 = await MenuItem.new({
        text: '',
        enabled: false
      })

      const syncItem = await MenuItem.new({
        text: '⚡ 同步（缩放）',
        action: () => handleMenuAction('sync')
      })

      const updateItem = await MenuItem.new({
        text: '⬆️ 更新',
        action: () => handleMenuAction('update')
      })

      // 创建菜单
      const menu = await Menu.new({
        items: [
          saveItem,
          loadItem,
          searchItem,
          exitItem,
          separator1,
          syncItem,
          updateItem
        ]
      })

      return menu
    } catch (error) {
      console.error('创建主菜单失败:', error)
      return null
    }
  }

  // 创建交易集右键菜单
  const createSetContextMenu = async (
    setNumber: number,
    openTradingPanel: (setNumber: number) => void,
    closeAllPanels: (setNumber: number) => void,
    configureTradingSet: (setNumber: number) => void
  ) => {
    try {
      const openItem = await MenuItem.new({
        text: '📊 打开交易面板',
        action: () => openTradingPanel(setNumber)
      })

      const closeItem = await MenuItem.new({
        text: '❌ 关闭面板',
        action: () => closeAllPanels(setNumber)
      })

      // 分隔符
      const separator = await MenuItem.new({
        text: '',
        enabled: false
      })

      const configItem = await MenuItem.new({
        text: '⚙️ 配置交易集',
        action: () => configureTradingSet(setNumber)
      })

      // 创建菜单
      const menu = await Menu.new({
        items: [
          openItem,
          closeItem,
          separator,
          configItem
        ]
      })

      return menu
    } catch (error) {
      console.error('创建交易集菜单失败:', error)
      return null
    }
  }

  // 显示主右键菜单
  const showMainContextMenu = async (
    event: MouseEvent,
    handleMenuAction: (action: MenuAction) => void
  ) => {
    event.preventDefault()

    try {
      const menu = await createMainContextMenu(handleMenuAction)
      if (menu) {
        console.log('显示主右键菜单')
        const position = new LogicalPosition(event.clientX, event.clientY)
        await menu.popup(position)
      }
    } catch (error) {
      console.error('显示主菜单失败:', error)
    }
  }

  // 显示交易集右键菜单
  const showSetContextMenu = async (
    event: MouseEvent,
    setNumber: number,
    openTradingPanel: (setNumber: number) => void,
    closeAllPanels: (setNumber: number) => void,
    configureTradingSet: (setNumber: number) => void
  ) => {
    event.preventDefault()
    
    try {
      const menu = await createSetContextMenu(
        setNumber,
        openTradingPanel,
        closeAllPanels,
        configureTradingSet
      )
      
      if (menu) {
        const position = new LogicalPosition(event.clientX, event.clientY)
        await menu.popup(position)
      }
    } catch (error) {
      console.error('显示交易集菜单失败:', error)
    }
  }

  // 创建应用菜单栏（可选）
  const createAppMenuBar = async (
    handleMenuAction: (action: MenuAction) => void
  ) => {
    try {
      // 文件菜单
      const fileSubmenu = await Submenu.new({
        text: '文件',
        items: [
          await MenuItem.new({
            text: '保存配置',
            accelerator: 'CmdOrCtrl+S',
            action: () => handleMenuAction('save')
          }),
          await MenuItem.new({
            text: '加载配置',
            accelerator: 'CmdOrCtrl+O',
            action: () => handleMenuAction('load')
          }),
          await MenuItem.new({
            text: '',
            enabled: false
          }),
          await MenuItem.new({
            text: '退出',
            accelerator: 'CmdOrCtrl+Q',
            action: () => handleMenuAction('exit')
          })
        ]
      })

      // 工具菜单
      const toolsSubmenu = await Submenu.new({
        text: '工具',
        items: [
          await MenuItem.new({
            text: '搜索',
            accelerator: 'CmdOrCtrl+F',
            action: () => handleMenuAction('search')
          }),
          await MenuItem.new({
            text: '同步',
            action: () => handleMenuAction('sync')
          }),
          await MenuItem.new({
            text: '检查更新',
            action: () => handleMenuAction('update')
          })
        ]
      })

      // 创建菜单栏
      const menuBar = await Menu.new({
        items: [fileSubmenu, toolsSubmenu]
      })

      return menuBar
    } catch (error) {
      console.error('创建菜单栏失败:', error)
      return null
    }
  }

  // 设置应用菜单栏
  const setAppMenuBar = async (
    handleMenuAction: (action: MenuAction) => void
  ) => {
    try {
      const menuBar = await createAppMenuBar(handleMenuAction)
      if (menuBar) {
        // 在 Tauri v2 中，菜单栏设置可能需要不同的方法
        // 暂时注释掉，因为 window.setMenu 在当前版本中不可用
        console.log('菜单栏创建成功，但设置功能在当前 Tauri 版本中不可用')
        // await menuBar.setAsAppMenu()  // 可能的替代方法
      }
    } catch (error) {
      console.error('设置菜单栏失败:', error)
    }
  }

  return {
    showMainContextMenu,
    showSetContextMenu,
    setAppMenuBar
  }
}

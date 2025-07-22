// 菜单相关工具函数

import type { MenuItem } from '@/types/trading'

// 创建主菜单项
export function createMainMenuItems(
  handleMenuAction: (action: any) => void
): MenuItem[] {
  return [
    {
      key: 'save',
      label: '保存配置',
      icon: '💾',
      action: () => handleMenuAction('save')
    },
    {
      key: 'load',
      label: '加载配置',
      icon: '📂',
      action: () => handleMenuAction('load')
    },
    {
      key: 'search',
      label: '搜索',
      icon: '🔍',
      action: () => handleMenuAction('search')
    },
    {
      key: 'exit',
      label: '退出',
      icon: '🚪',
      action: () => handleMenuAction('exit'),
      danger: true
    }
  ]
}

// 创建主菜单次要项
export function createMainMenuSecondaryItems(
  handleMenuAction: (action: any) => void
): MenuItem[] {
  return [
    {
      key: 'sync',
      label: '同步（缩放）',
      icon: '⚡',
      action: () => handleMenuAction('sync')
    },
    {
      key: 'update',
      label: '更新',
      icon: '⬆️',
      action: () => handleMenuAction('update')
    }
  ]
}

// 创建交易集菜单项
export function createSetMenuItems(
  selectedSet: number,
  openTradingPanel: (setNumber: number) => void,
  closeAllPanels: (setNumber: number) => void,
  configureTradingSet: (setNumber: number) => void
): MenuItem[] {
  return [
    {
      key: 'open',
      label: '打开交易面板',
      icon: '📊',
      action: () => openTradingPanel(selectedSet)
    },
    {
      key: 'close',
      label: '关闭面板',
      icon: '❌',
      action: () => closeAllPanels(selectedSet)
    },
    {
      key: 'configure',
      label: '配置交易集',
      icon: '⚙️',
      action: () => configureTradingSet(selectedSet)
    }
  ]
}

// 计算菜单位置
export function calculateMenuPosition(
  rect: DOMRect,
  menuWidth: number = 150,
  menuHeight: number = 200,
  position: 'right' | 'bottom' = 'right'
): { x: number; y: number } {
  let x: number
  let y: number

  if (position === 'right') {
    // 默认显示在元素右侧
    x = rect.right + 10
    y = rect.top

    // 如果右侧空间不够，显示在左侧
    if (x + menuWidth > window.innerWidth) {
      x = rect.left - menuWidth - 10
    }
  } else {
    // 显示在元素下方
    x = rect.left
    y = rect.bottom + 5

    // 如果右侧空间不够，向左调整
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10
    }

    // 如果下方空间不够，显示在上方
    if (y + menuHeight > window.innerHeight) {
      y = rect.top - menuHeight - 5
    }
  }

  // 如果下方空间不够，向上调整
  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - 10
  }

  // 确保不超出屏幕边界
  x = Math.max(10, Math.min(x, window.innerWidth - menuWidth - 10))
  y = Math.max(10, Math.min(y, window.innerHeight - menuHeight - 10))

  return { x, y }
}

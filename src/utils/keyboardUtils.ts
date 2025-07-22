// 键盘事件相关工具函数

// 创建键盘事件处理器
export function createKeyboardHandler(
  hideAllMenus: () => void,
  handleSetClick: (setNumber: number) => void
) {
  return (event: KeyboardEvent) => {
    // ESC键关闭菜单
    if (event.key === 'Escape') {
      hideAllMenus()
      return
    }

    // 数字键1-4快速切换交易集
    if (['1', '2', '3', '4'].includes(event.key)) {
      const setNumber = parseInt(event.key)
      handleSetClick(setNumber)
      return
    }

    // Ctrl+S 保存配置
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      // TODO: 触发保存配置
      return
    }

    // Ctrl+O 加载配置
    if (event.ctrlKey && event.key === 'o') {
      event.preventDefault()
      // TODO: 触发加载配置
      return
    }

    // Ctrl+F 搜索
    if (event.ctrlKey && event.key === 'f') {
      event.preventDefault()
      // TODO: 触发搜索
      return
    }
  }
}

// 检查是否为有效的交易集数字键
export function isValidSetNumber(key: string): boolean {
  return ['1', '2', '3', '4'].includes(key)
}

// 获取快捷键描述
export function getShortcutDescription(): Record<string, string> {
  return {
    '1-4': '快速切换交易集',
    'Esc': '关闭菜单',
    'Ctrl+S': '保存配置',
    'Ctrl+O': '加载配置',
    'Ctrl+F': '搜索'
  }
}

// 格式化快捷键显示
export function formatShortcut(keys: string[]): string {
  return keys.join(' + ')
}

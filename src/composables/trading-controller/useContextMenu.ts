// 右键菜单管理组合式函数

import { ref, onMounted, onUnmounted } from 'vue'
import type { MenuState, MenuAction } from '@/types/trading'

export function useContextMenu() {
  // 主右键菜单状态
  const contextMenu = ref<MenuState>({
    visible: false,
    x: 0,
    y: 0
  })

  // 交易集右键菜单状态
  const setContextMenu = ref<MenuState>({
    visible: false,
    x: 0,
    y: 0
  })

  // 当前选中的交易集
  const selectedSet = ref(1)

  // 显示主右键菜单
  const showContextMenu = (event: MouseEvent) => {
    // 获取面板的边界
    const panel = event.currentTarget as HTMLElement
    const rect = panel.getBoundingClientRect()

    // 将菜单定位在面板右侧或下方
    contextMenu.value.x = rect.right + 10 // 面板右侧10px
    contextMenu.value.y = rect.top

    // 如果右侧空间不够，显示在左侧
    if (contextMenu.value.x + 150 > window.innerWidth) {
      contextMenu.value.x = rect.left - 160 // 面板左侧
    }

    // 如果下方空间不够，向上调整
    if (contextMenu.value.y + 200 > window.innerHeight) {
      contextMenu.value.y = window.innerHeight - 220
    }

    contextMenu.value.visible = true
    setContextMenu.value.visible = false
  }

  // 显示交易集右键菜单
  const showSetContextMenu = (setNumber: number, event: MouseEvent) => {
    selectedSet.value = setNumber

    // 获取按钮的边界
    const button = event.currentTarget as HTMLElement
    const rect = button.getBoundingClientRect()

    // 将菜单定位在按钮下方
    setContextMenu.value.x = rect.left
    setContextMenu.value.y = rect.bottom + 5

    // 如果右侧空间不够，向左调整
    if (setContextMenu.value.x + 150 > window.innerWidth) {
      setContextMenu.value.x = window.innerWidth - 160
    }

    // 如果下方空间不够，显示在按钮上方
    if (setContextMenu.value.y + 150 > window.innerHeight) {
      setContextMenu.value.y = rect.top - 155
    }

    setContextMenu.value.visible = true
    contextMenu.value.visible = false
  }

  // 隐藏所有菜单
  const hideAllMenus = () => {
    contextMenu.value.visible = false
    setContextMenu.value.visible = false
  }

  // 键盘事件处理
  const handleKeydown = (event: KeyboardEvent) => {
    // ESC键关闭菜单
    if (event.key === 'Escape') {
      hideAllMenus()
    }
  }

  // 点击外部关闭菜单
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.context-menu')) {
      hideAllMenus()
    }
  }

  // 组件挂载时添加事件监听
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('click', handleClickOutside)
  })

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    contextMenu,
    setContextMenu,
    selectedSet,
    showContextMenu,
    showSetContextMenu,
    hideAllMenus
  }
}

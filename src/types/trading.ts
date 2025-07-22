// 交易控制器相关类型定义

import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

// 菜单操作类型
export type MenuAction = 'save' | 'load' | 'search' | 'sync' | 'update' | 'exit'

// 窗口状态
export interface WindowState {
  x: number
  y: number
  width: number
  height: number
  visible: boolean
  minimized: boolean
  maximized: boolean
}

// 交易状态
export interface TradingState {
  currentPrice: number
  fontSize: number
  cellHeight: number
  orderType: string
  lightOrderQuantity: number
  heavyOrderQuantity: number
  positionMode: string
  cancelMode: string
  maxCancelOrders: number
  currentCancelCount: number
}

// 市场数据
export interface MarketData {
  totalVolume: number
  totalPosition: number
  dailyPositionChange: number
  priceChangePercent: number
}

// 面板配置
export interface PanelConfig {
  id: string
  setNumber: number
  title: string
  window: WindowState
  tradingState: TradingState
  marketData: MarketData
  timestamp: string
}

// 配置文件头部信息
export interface ConfigHeader {
  version: string
  timestamp: string
  activeSet: number
  totalPanels: number
}

// 完整配置
export interface TradingConfiguration {
  header: ConfigHeader
  panels: PanelConfig[]
}

// 交易面板管理器
export interface TradingPanelManager {
  panels: Map<string, WebviewWindow>
  hasActivePanels: (setNumber: number) => boolean
  getSetPanels: (setNumber: number) => [string, WebviewWindow][]
  openPanel: (setNumber: number) => Promise<void>
  closeAllPanels: (setNumber: number) => Promise<void>
}

// 菜单状态
export interface MenuState {
  visible: boolean
  x: number
  y: number
}

// 右键菜单项
export interface MenuItem {
  key: string
  label: string
  icon: string
  action: () => void
  danger?: boolean
}

// 菜单组
export interface MenuGroup {
  items: MenuItem[]
  separator?: boolean
}

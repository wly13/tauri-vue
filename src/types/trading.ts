// 交易控制器相关类型定义

import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

// 菜单操作类型
export type MenuAction = 'save' | 'load' | 'search' | 'sync' | 'update' | 'exit'

// 合约信息
export interface ContractInfo {
  code: string          // 合约代码，如 AP405
  name: string          // 合约名称，如 苹果5月
  category: string      // 合约分类，如 苹果(AP)
  categoryCode: string  // 分类代码，如 AP
  month: string         // 交割月份，如 5月
  fullCode: string      // 完整代码，如 AP2405
  isActive: boolean     // 是否活跃合约
  lastPrice?: number    // 最新价格
  changePercent?: number // 涨跌幅
  volume?: number       // 成交量
  openInterest?: number // 持仓量
}

// 合约分类
export interface ContractCategory {
  code: string          // 分类代码，如 AP
  name: string          // 分类名称，如 苹果
  contracts: ContractInfo[]  // 该分类下的合约列表
}

// 搜索对话框状态
export interface SearchDialogState {
  visible: boolean
  searchKeyword: string
  selectedContract: ContractInfo | null
  filteredContracts: ContractInfo[]
}

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

// XML配置文件处理组合式函数

import { message } from 'ant-design-vue'
import type { TradingConfiguration } from '@/types/trading'

export function useXMLConfig() {
  // 自动加载XML配置（默认文件）
  const autoLoadXMLConfiguration = async (openTradingPanel: (setNumber: number) => Promise<void>) => {
    try {
      // 默认配置文件名
      const defaultFileName = 'trading_panel_config.xml'

      console.log('正在自动加载默认配置文件:', defaultFileName)

      // 读取并解析XML配置
      const config = await loadTradingPanelXML(defaultFileName)

      if (config && config.panels && config.panels.length > 0) {
        console.log('配置文件已读取:', config)
        // 恢复面板配置
        await restorePanelConfiguration(config, openTradingPanel)
        message.success(`自动加载配置成功，共恢复${config.panels.length}个面板`)
      } else {
        console.log('默认配置文件为空或不存在，跳过自动加载')
      }
    } catch (error) {
      console.warn('自动加载配置失败，可能是首次启动或配置文件不存在:', error)
      // 自动加载失败时不显示错误消息，因为这是正常情况
    }
  }

  // 手动加载XML配置（保留原有功能）
  const loadXMLConfiguration = async (openTradingPanel: (setNumber: number) => Promise<void>) => {
    try {
      // 简单的文件名输入对话框（实际项目中可以使用文件选择对话框）
      const fileName = prompt('请输入要加载的XML配置文件名（例如：trading_panel_config_2024-01-01T12-00-00.xml）:')

      if (!fileName) {
        message.info('已取消加载配置')
        return
      }

      // 读取并解析XML配置
      const config = await loadTradingPanelXML(fileName)

      if (config && config.panels && config.panels.length > 0) {
        // 恢复面板配置
        await restorePanelConfiguration(config, openTradingPanel)
        message.success(`成功加载配置，共恢复${config.panels.length}个面板`)
      } else {
        message.warning('配置文件为空或格式不正确')
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      message.error('加载配置失败')
    }
  }

  // 恢复面板配置
  const restorePanelConfiguration = async (
    config: any, 
    openTradingPanel: (setNumber: number) => Promise<void>
  ) => {
    try {
      // 恢复每个面板
      for (const panelConfig of config.panels) {
        try {
          // 创建新的交易面板窗口
          const setNumber = panelConfig.setNumber
          await openTradingPanel(setNumber)

          // 等待窗口创建完成
          await new Promise(resolve => setTimeout(resolve, 1000))

          console.log(`面板${setNumber}配置已恢复`)
        } catch (error) {
          console.error(`恢复面板${panelConfig.setNumber}失败:`, error)
        }
      }
    } catch (error) {
      console.error('恢复面板配置失败:', error)
      throw error
    }
  }

  // 读取XML配置文件
  const loadTradingPanelXML = async (filePath: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')

      // 读取XML文件内容
      const xmlContent = await invoke('read_file', { path: filePath })

      // 解析XML内容
      const config = parseXMLConfig(xmlContent as string)

      console.log('XML配置文件已读取:', config)
      return config
    } catch (error) {
      console.error('读取XML文件失败:', error)
      throw error
    }
  }

  // 简单的XML解析函数（实际项目中建议使用专业的XML解析库）
  const parseXMLConfig = (xmlContent: string) => {
    const config = {
      header: {},
      panels: []
    }

    try {
      // 提取Header信息
      const versionMatch = xmlContent.match(/<Version>(.*?)<\/Version>/)
      const timestampMatch = xmlContent.match(/<Timestamp>(.*?)<\/Timestamp>/)
      const activeSetMatch = xmlContent.match(/<ActiveSet>(.*?)<\/ActiveSet>/)
      const totalPanelsMatch = xmlContent.match(/<TotalPanels>(.*?)<\/TotalPanels>/)

      config.header = {
        version: versionMatch ? versionMatch[1] : '1.0',
        timestamp: timestampMatch ? timestampMatch[1] : '',
        activeSet: activeSetMatch ? parseInt(activeSetMatch[1]) : 1,
        totalPanels: totalPanelsMatch ? parseInt(totalPanelsMatch[1]) : 0
      }

      // 提取Panel信息
      const panelMatches = xmlContent.match(/<Panel>[\s\S]*?<\/Panel>/g)
      if (panelMatches) {
        config.panels = panelMatches.map(panelXml => {
          const extractValue = (tag: string) => {
            const match = panelXml.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`))
            return match ? match[1] : ''
          }

          return {
            id: extractValue('ID'),
            setNumber: parseInt(extractValue('SetNumber')),
            title: extractValue('Title'),
            window: {
              x: parseInt(extractValue('X')),
              y: parseInt(extractValue('Y')),
              width: parseInt(extractValue('Width')),
              height: parseInt(extractValue('Height')),
              visible: extractValue('Visible') === 'true',
              minimized: extractValue('Minimized') === 'true',
              maximized: extractValue('Maximized') === 'true'
            },
            tradingState: {
              currentPrice: parseFloat(extractValue('CurrentPrice')),
              fontSize: parseInt(extractValue('FontSize')),
              cellHeight: parseInt(extractValue('CellHeight')),
              orderType: extractValue('OrderType'),
              lightOrderQuantity: parseInt(extractValue('LightOrderQuantity')),
              heavyOrderQuantity: parseInt(extractValue('HeavyOrderQuantity')),
              positionMode: extractValue('PositionMode'),
              cancelMode: extractValue('CancelMode'),
              maxCancelOrders: parseInt(extractValue('MaxCancelOrders')),
              currentCancelCount: parseInt(extractValue('CurrentCancelCount'))
            },
            marketData: {
              totalVolume: parseInt(extractValue('TotalVolume')),
              totalPosition: parseInt(extractValue('TotalPosition')),
              dailyPositionChange: parseInt(extractValue('DailyPositionChange')),
              priceChangePercent: parseFloat(extractValue('PriceChangePercent'))
            },
            timestamp: extractValue('Timestamp')
          }
        })
      }
    } catch (error) {
      console.error('解析XML配置失败:', error)
    }

    return config
  }

  return {
    autoLoadXMLConfiguration,
    loadXMLConfiguration,
    parseXMLConfig
  }
}

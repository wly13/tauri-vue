// 配置管理组合式函数

import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TradingConfiguration, PanelConfig } from '@/types/trading'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

export function useConfigManager() {
  const activeSet = ref(1)

  // 保存配置到XML
  const saveConfiguration = async (tradingPanels: Map<string, WebviewWindow>) => {
    try {
      // 收集所有面板的窗口信息和状态
      const panelConfigs: PanelConfig[] = []

      for (const [panelId, panel] of Array.from(tradingPanels.entries())) {
        if (panel) {
          try {
            // 获取窗口位置和大小
            const position = await panel.outerPosition()
            const size = await panel.outerSize()
            const isVisible = await panel.isVisible()
            const isMinimized = await panel.isMinimized()
            const isMaximized = await panel.isMaximized()

            // 解析面板ID获取集合编号
            const setNumber = parseInt(panelId.split('-')[2])

            // 面板配置
            const panelConfig: PanelConfig = {
              id: panelId,
              setNumber: setNumber,
              title: `交易面板 - 集合${setNumber}`,
              window: {
                x: position.x,
                y: position.y,
                width: size.width,
                height: size.height,
                visible: isVisible,
                minimized: isMinimized,
                maximized: isMaximized
              },
              // 面板状态（这些是默认值，实际应该从面板获取）
              tradingState: {
                currentPrice: 3070,
                fontSize: 11,
                cellHeight: 18,
                orderType: 'A',
                lightOrderQuantity: 1,
                heavyOrderQuantity: 5,
                positionMode: 'open',
                cancelMode: 'limited',
                maxCancelOrders: 489,
                currentCancelCount: 0
              },
              marketData: {
                totalVolume: 865535,
                totalPosition: 269026,
                dailyPositionChange: 2260,
                priceChangePercent: -0.07
              },
              timestamp: new Date().toISOString()
            }

            panelConfigs.push(panelConfig)
          } catch (error) {
            console.error(`获取面板${panelId}信息失败:`, error)
          }
        }
      }

      // 生成XML内容
      const xmlContent = generateTradingPanelXML(panelConfigs)

      // 保存到文件
      await saveTradingPanelXML(xmlContent)

      // 同时保存到localStorage作为备份
      const config = {
        activeSet: activeSet.value,
        panelConfigs: panelConfigs,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('trading_controller_config', JSON.stringify(config))

      message.success('交易面板配置已保存到XML文件')
    } catch (error) {
      console.error('保存配置失败:', error)
      message.error('保存配置失败')
    }
  }

  // 生成交易面板XML内容
  const generateTradingPanelXML = (panelConfigs: PanelConfig[]) => {
    const timestamp = new Date().toISOString()

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<TradingPanelConfiguration>
  <Header>
    <Version>1.0</Version>
    <Timestamp>${timestamp}</Timestamp>
    <ActiveSet>${activeSet.value}</ActiveSet>
    <TotalPanels>${panelConfigs.length}</TotalPanels>
  </Header>
  <Panels>`

    panelConfigs.forEach(config => {
      xml += `
    <Panel>
      <ID>${config.id}</ID>
      <SetNumber>${config.setNumber}</SetNumber>
      <Title>${config.title}</Title>
      <Window>
        <Position>
          <X>${config.window.x}</X>
          <Y>${config.window.y}</Y>
        </Position>
        <Size>
          <Width>${config.window.width}</Width>
          <Height>${config.window.height}</Height>
        </Size>
        <State>
          <Visible>${config.window.visible}</Visible>
          <Minimized>${config.window.minimized}</Minimized>
          <Maximized>${config.window.maximized}</Maximized>
        </State>
      </Window>
      <TradingState>
        <CurrentPrice>${config.tradingState.currentPrice}</CurrentPrice>
        <FontSize>${config.tradingState.fontSize}</FontSize>
        <CellHeight>${config.tradingState.cellHeight}</CellHeight>
        <OrderType>${config.tradingState.orderType}</OrderType>
        <LightOrderQuantity>${config.tradingState.lightOrderQuantity}</LightOrderQuantity>
        <HeavyOrderQuantity>${config.tradingState.heavyOrderQuantity}</HeavyOrderQuantity>
        <PositionMode>${config.tradingState.positionMode}</PositionMode>
        <CancelMode>${config.tradingState.cancelMode}</CancelMode>
        <MaxCancelOrders>${config.tradingState.maxCancelOrders}</MaxCancelOrders>
        <CurrentCancelCount>${config.tradingState.currentCancelCount}</CurrentCancelCount>
      </TradingState>
      <MarketData>
        <TotalVolume>${config.marketData.totalVolume}</TotalVolume>
        <TotalPosition>${config.marketData.totalPosition}</TotalPosition>
        <DailyPositionChange>${config.marketData.dailyPositionChange}</DailyPositionChange>
        <PriceChangePercent>${config.marketData.priceChangePercent}</PriceChangePercent>
      </MarketData>
      <Timestamp>${config.timestamp}</Timestamp>
    </Panel>`
    })

    xml += `
  </Panels>
</TradingPanelConfiguration>`

    return xml
  }

  // 保存XML到文件
  const saveTradingPanelXML = async (xmlContent: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')

      // 生成默认文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const fileName = `trading_panel_config_${timestamp}.xml`

      // 使用当前工作目录保存文件
      const filePath = `./${fileName}`

      // 使用Tauri的write_file命令写入文件
      await invoke('write_file', {
        path: filePath,
        content: xmlContent
      })

      console.log('XML配置文件已保存到:', filePath)
      return filePath
    } catch (error) {
      console.error('保存XML文件失败:', error)
      throw error
    }
  }

  // 加载配置
  const loadConfiguration = () => {
    try {
      const saved = localStorage.getItem('trading_controller_config')
      if (saved) {
        const config = JSON.parse(saved)
        activeSet.value = config.activeSet || 1
        console.log('配置加载成功:', config)
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  return {
    activeSet,
    saveConfiguration,
    loadConfiguration
  }
}

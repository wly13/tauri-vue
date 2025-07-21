<template>
  <div class="trading-controller">
    <!-- 主控制面板 -->
    <div class="controller-panel" :style="{ fontSize: fontSize + 'px' }" @contextmenu.prevent="showContextMenu">
      <!-- 交易集按钮 -->
      <div class="trading-sets">
        <button v-for="setNumber in 4" :key="setNumber" class="set-button" :class="{
          active: activeSet === setNumber,
          'has-panels': hasActivePanels(setNumber)
        }" @click="handleSetClick(setNumber)" @contextmenu.prevent.stop="showSetContextMenu(setNumber, $event)"
          :title="hasActivePanels(setNumber) ? `交易集${setNumber} (已打开)` : `交易集${setNumber} (点击打开)`">
          {{ setNumber }}
          <span v-if="hasActivePanels(setNumber)" class="panel-indicator">●</span>
        </button>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenuVisible" class="context-menu" :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      @click.stop>
      <div class="menu-item" @click="handleMenuAction('save')">
        <span class="menu-icon">💾</span>
        保存配置
      </div>
      <div class="menu-item" @click="handleMenuAction('load')">
        <span class="menu-icon">📂</span>
        加载配置
      </div>
      <div class="menu-item" @click="handleMenuAction('search')">
        <span class="menu-icon">🔍</span>
        搜索
      </div>
      <div class="menu-item danger" @click="handleMenuAction('exit')">
        <span class="menu-icon">🚪</span>
        退出
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item" @click="handleMenuAction('sync')">
        <span class="menu-icon">⚡</span>
        同步（缩放）
      </div>
      <div class="menu-item" @click="handleMenuAction('update')">
        <span class="menu-icon">⬆️</span>
        更新
      </div>
    </div>

    <!-- 交易集右键菜单 -->
    <div v-if="setContextMenuVisible" class="context-menu"
      :style="{ left: setContextMenuX + 'px', top: setContextMenuY + 'px' }" @click.stop>
      <div class="menu-item" @click="openTradingPanel(selectedSet)">
        <span class="menu-icon">📊</span>
        打开交易面板
      </div>
      <div class="menu-item" @click="closeAllPanels(selectedSet)">
        <span class="menu-icon">❌</span>
        关闭面板
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item" @click="configureTradingSet(selectedSet)">
        <span class="menu-icon">⚙️</span>
        配置交易集
      </div>
    </div>

    <!-- 点击遮罩关闭菜单 -->
    <div v-if="contextMenuVisible || setContextMenuVisible" class="menu-overlay" @click="hideAllMenus"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { Window } from '@tauri-apps/api/window'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

// 响应式数据
const activeSet = ref(1)
const fontSize = ref(12)

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

// 交易集右键菜单状态
const setContextMenuVisible = ref(false)
const setContextMenuX = ref(0)
const setContextMenuY = ref(0)
const selectedSet = ref(1)

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

// 处理交易集按钮点击
const handleSetClick = async (setNumber: number) => {
  console.log(`点击交易集${setNumber}，当前面板数量:`, getSetPanels(setNumber).length)
  activeSet.value = setNumber
  // openTradingPanel 现在会自动处理聚焦或创建新窗口的逻辑
  await openTradingPanel(setNumber)
}

// 显示主右键菜单
const showContextMenu = (event: MouseEvent) => {
  // 获取面板的边界
  const panel = event.currentTarget as HTMLElement
  const rect = panel.getBoundingClientRect()

  // 将菜单定位在面板右侧或下方
  contextMenuX.value = rect.right + 10 // 面板右侧10px
  contextMenuY.value = rect.top

  // 如果右侧空间不够，显示在左侧
  if (contextMenuX.value + 150 > window.innerWidth) {
    contextMenuX.value = rect.left - 160 // 面板左侧
  }

  // 如果下方空间不够，向上调整
  if (contextMenuY.value + 200 > window.innerHeight) {
    contextMenuY.value = window.innerHeight - 220
  }

  contextMenuVisible.value = true
  setContextMenuVisible.value = false
}

// 显示交易集右键菜单
const showSetContextMenu = (setNumber: number, event: MouseEvent) => {
  selectedSet.value = setNumber

  // 获取按钮的边界
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  // 将菜单定位在按钮下方
  setContextMenuX.value = rect.left
  setContextMenuY.value = rect.bottom + 5

  // 如果右侧空间不够，向左调整
  if (setContextMenuX.value + 150 > window.innerWidth) {
    setContextMenuX.value = window.innerWidth - 160
  }

  // 如果下方空间不够，显示在按钮上方
  if (setContextMenuY.value + 150 > window.innerHeight) {
    setContextMenuY.value = rect.top - 155
  }

  setContextMenuVisible.value = true
  contextMenuVisible.value = false
}

// 隐藏所有菜单
const hideAllMenus = () => {
  contextMenuVisible.value = false
  setContextMenuVisible.value = false
}

// 处理菜单操作
const handleMenuAction = async (action: string) => {
  hideAllMenus()

  switch (action) {
    case 'save':
      await saveConfiguration()
      break
    case 'load':
      await loadXMLConfiguration()
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
      await exitApplication()
      break
  }
}

// 保存配置到XML
const saveConfiguration = async () => {
  try {
    // 收集所有面板的窗口信息和状态
    const panelConfigs = []

    for (const [panelId, panel] of Array.from(tradingPanels.value.entries())) {
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

          // 尝试获取面板内部状态（如果可能的话）
          const panelConfig = {
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
const generateTradingPanelXML = (panelConfigs: any[]) => {
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

// 加载XML配置
const loadXMLConfiguration = async () => {
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
      await restorePanelConfiguration(config)
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
const restorePanelConfiguration = async (config: any) => {
  try {
    // 设置活动集合
    if (config.header && config.header.activeSet) {
      activeSet.value = config.header.activeSet
    }

    // 恢复每个面板
    for (const panelConfig of config.panels) {
      try {
        // 创建新的交易面板窗口
        const setNumber = panelConfig.setNumber
        await openTradingPanel(setNumber)

        // 等待窗口创建完成
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 获取刚创建的面板
        const panelId = `trading-panel-${setNumber}`
        const panel = tradingPanels.value.get(panelId)

        if (panel) {
          // 恢复窗口位置和大小
          const { PhysicalPosition, PhysicalSize } = await import('@tauri-apps/api/dpi')
          await panel.setPosition(new PhysicalPosition(panelConfig.window.x, panelConfig.window.y))
          await panel.setSize(new PhysicalSize(panelConfig.window.width, panelConfig.window.height))

          // 恢复窗口状态
          if (panelConfig.window.minimized) {
            await panel.minimize()
          } else if (panelConfig.window.maximized) {
            await panel.maximize()
          }

          if (!panelConfig.window.visible) {
            await panel.hide()
          }

          console.log(`面板${setNumber}配置已恢复`)
        }
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

    // 解析XML内容（简单的字符串解析，实际项目中建议使用XML解析库）
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
        // message.info(`已聚焦到交易集${setNumber}`)
        return
      } catch (error) {
        // 如果聚焦失败，可能窗口已关闭，清理并继续创建新窗口
        console.error('聚焦现有窗口失败:', error)
        const [panelId] = existingPanels[0]
        tradingPanels.value.delete(panelId)
        // 继续执行创建新窗口的逻辑
      }
    }

    // 再次检查，确保没有重复创建
    const finalCheck = getSetPanels(setNumber)
    if (finalCheck.length > 0) {
      console.log(`集合${setNumber}已有面板，跳过创建`)
      return
    }

    // 创建新窗口（无论是首次创建还是聚焦失败后的重新创建）
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
      // message.success(`交易集${setNumber}面板已打开`)
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

// 配置交易集
const configureTradingSet = (setNumber: number) => {
  message.info(`配置交易集${setNumber}`)
  // TODO: 实现交易集配置功能
}

// 退出应用
const exitApplication = async () => {
  try {
    // 关闭所有交易面板
    const panelEntries = Array.from(tradingPanels.value.entries())
    for (const [, panel] of panelEntries) {
      await panel.close()
    }

    // 关闭主窗口
    const mainWindow = Window.getCurrent()
    await mainWindow.close()
  } catch (error) {
    console.error('退出应用失败:', error)
  }
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  // ESC键关闭菜单
  if (event.key === 'Escape') {
    hideAllMenus()
  }

  // 数字键1-4快速切换交易集
  if (['1', '2', '3', '4'].includes(event.key)) {
    const setNumber = parseInt(event.key)
    handleSetClick(setNumber)
  }
}

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.context-menu')) {
    hideAllMenus()
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

// 组件挂载
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
  loadConfiguration()
})

// 组件卸载
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.trading-controller {
  width: 200px;
  height: 50px;
  position: relative;
  user-select: none;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.controller-panel {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.controller-panel:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.trading-sets {
  display: flex;
  gap: 8px;
  align-items: center;
}

.set-button {
  width: 32px;
  height: 32px;
  border: 2px solid #fff;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.set-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.set-button.active {
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.set-button.has-panels {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.3);
}

.set-button.has-panels:hover {
  background: rgba(76, 175, 80, 0.4);
}

.panel-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 8px;
  color: #4CAF50;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  min-width: 140px;
  padding: 6px 0;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.danger {
  color: #ff4d4f;
}

.menu-item.danger:hover {
  background: #fff2f0;
}

.menu-icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.menu-separator {
  height: 1px;
  background: #e8e8e8;
  margin: 4px 0;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}
</style>

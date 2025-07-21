<template>
  <div class="trading-panel-container">
    <!-- 主交易面板 -->
    <div class="trading-panel">
      <!-- 左侧操作列 -->
      <div class="left-control-panel">
        <!-- 合约信息 -->
        <div class="contract-header">
          <div class="contract-name">rb2509</div>
          <div class="zoom-controls">
            <button @click="zoomIn" class="zoom-btn">+</button>
            <button @click="zoomOut" class="zoom-btn">-</button>
          </div>
        </div>

        <div class="time-display">{{ currentTime }}</div>

        <!-- CTP 连接状态 -->
        <div class="ctp-status">
          <div class="status-item">
            <span class="status-label">行情:</span>
            <span :class="['status-value', getStatusClass(ctpService.getMdStatus())]">
              {{ getStatusText(ctpService.getMdStatus()) }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">交易:</span>
            <span :class="['status-value', getStatusClass(ctpService.getTraderStatus())]">
              {{ getStatusText(ctpService.getTraderStatus()) }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">数据:</span>
            <span :class="['status-value', getDataSourceClass()]">
              {{ getDataSourceText() }}
            </span>
          </div>
        </div>

        <div class="price-change negative" title="价格变化百分比（相对于昨结算价）">{{ priceChangePercent }}%</div>
        <div class="volume-info" title="总成交量（手）- 当日累计成交的合约数量">{{ totalVolume }}</div>
        <div class="position-info" title="总持仓量（手）- 市场上未平仓的合约总数">{{ totalPosition }}</div>
        <div class="daily-change" title="日内持仓变化（手）- 相对于昨日的持仓量变化">{{ dailyPositionChange }}</div>

        <div class="zero-values">
          <div class="zero-value red">{{ redValue }}</div>
          <div class="zero-value blue">{{ blueValue }}</div>
        </div>

        <!-- CTP 控制按钮 -->
        <div class="ctp-controls">
          <button
            @click="reconnectCtp"
            class="ctp-btn"
            :disabled="isCtpConnected && isUsingRealData"
          >
            {{ isCtpConnected && isUsingRealData ? '已连接' : '重连CTP' }}
          </button>
          <button
            @click="toggleDataSource"
            class="ctp-btn"
          >
            {{ getToggleButtonText() }}
          </button>
          <button
            @click="runTest"
            class="ctp-btn test-btn"
          >
            测试CTP
          </button>
          <button
            @click="showFieldHelp"
            class="ctp-btn help-btn"
          >
            字段说明
          </button>
          <button
            @click="startPriceTest"
            class="ctp-btn price-test-btn"
          >
            价格测试
          </button>
        </div>

        <!-- 数据模式说明 -->
        <div class="data-mode-info">
          <div class="mode-title">当前模式: {{ getDataSourceText() }}</div>
          <div class="mode-desc">{{ getDataModeDescription() }}</div>
        </div>

        <!-- 下单控制 -->
        <div class="order-inputs">
          <input v-model="orderQuantity" type="number" class="order-input" placeholder="1"
                 title="下单数量（手）" />
          <input v-model="orderPrice" type="number" class="order-input" placeholder="20"
                 title="下单价格（点击价格档位时自动填入）" />
        </div>

        <div class="order-type-group">
          <label><input type="radio" v-model="orderType" value="A" /> Order(A)</label>
          <label><input type="radio" v-model="orderType" value="B" /> Order(B)</label>
        </div>

        <div class="order-options">
          <label><input type="checkbox" v-model="options.autoHand" /> 全手指！</label>
          <label><input type="checkbox" v-model="options.cLimit345" /> CLimit 345</label>
          <label><input type="checkbox" v-model="options.cLimit550" /> CLimit 550</label>
          <label><input type="checkbox" v-model="options.noLimit" /> No Limit</label>
          <label><input type="checkbox" v-model="options.noCombo" /> NoCombo</label>
          <label><input type="checkbox" v-model="options.upLimit" /> UpLimit</label>
        </div>

        <div class="position-info-section">
          <div title="净持仓 = 多头持仓 - 空头持仓">净仓: {{ netPosition }}</div>
          <div title="C: 平仓相关持仓, T: 今日持仓">C: {{ cPosition }} T: {{ tPosition }}</div>
          <div v-if="isUsingRealData && accountInfo">
            <div title="可用资金：可用于开新仓的资金">可用: {{ Math.round(accountInfo.available) }}</div>
            <div title="账户余额：账户总资金">余额: {{ Math.round(accountInfo.balance) }}</div>
          </div>
        </div>

        <div class="pnl-display">
          <div class="pnl-value">{{ pnlValue }}</div>
          <div class="pnl-letter">P</div>
        </div>

        <!-- 操作说明 -->
        <div class="operation-help">
          <div class="help-title">操作说明</div>
          <div class="help-text">
            <div>第1列：点击快速撤单</div>
            <div>第2列：买单(A/B模式)</div>
            <div>第3列：价位显示</div>
            <div>第4列：卖单(A/B模式)</div>
            <div>第5列：预留空列</div>
          </div>
        </div>
      </div>

      <!-- 右侧五列表格 -->
      <div class="price-table-container">
        <div class="table-header">
          <div class="col-header">撤单</div>
          <div class="col-header">买单</div>
          <div class="col-header">价位</div>
          <div class="col-header">卖单</div>
          <div class="col-header"></div>
        </div>

        <div class="price-table" ref="tableContainer">
          <!-- 卖盘数据 -->
          <div
            v-for="(item, index) in sellOrders"
            :key="`sell-${index}`"
            :class="['price-row', 'sell-row', { 'current-price-row': isCurrentPriceRow(item.price) }, getCurrentPriceDirectionClass(item.price)]"
          >
            <!-- 第一列：撤单按钮 -->
            <div
              class="cancel-col clickable"
              @click="handleCancelClick('sell', item, index)"
              :class="{ active: isSelected('sell', 'cancel', index) }"
            >
              ×
            </div>

            <!-- 第二列：买单按钮（A/B模式） -->
            <div
              class="buy-order-col clickable"
              @click="handleOrderClick('buy', item, index)"
              :class="{ active: isSelected('sell', 'buy', index) }"
            >
              {{ item.buyVolume || '' }}
            </div>

            <!-- 第三列：价位 -->
            <div class="price-col sell-price">
              {{ item.price }}
            </div>

            <!-- 第四列：卖单按钮（A/B模式） -->
            <div
              class="sell-order-col clickable"
              @click="handleOrderClick('sell', item, index)"
              :class="{ active: isSelected('sell', 'sell', index) }"
            >
              {{ item.sellVolume || '' }}
            </div>

            <!-- 第五列：空列 -->
            <div class="empty-col"></div>
          </div>

          <!-- 当前价格行 -->
          <div class="current-price-row">
            <div class="current-price-display" colspan="5">{{ currentPrice }}</div>
          </div>

          <!-- 买盘数据 -->
          <div
            v-for="(item, index) in buyOrders"
            :key="`buy-${index}`"
            :class="['price-row', 'buy-row', { 'current-price-row': isCurrentPriceRow(item.price) }, getCurrentPriceDirectionClass(item.price)]"
          >
            <!-- 第一列：撤单按钮 -->
            <div
              class="cancel-col clickable"
              @click="handleCancelClick('buy', item, index)"
              :class="{ active: isSelected('buy', 'cancel', index) }"
            >
              ×
            </div>

            <!-- 第二列：买单按钮（A/B模式） -->
            <div
              class="buy-order-col clickable"
              @click="handleOrderClick('buy', item, index)"
              :class="{ active: isSelected('buy', 'buy', index) }"
            >
              {{ item.buyVolume || '' }}
            </div>

            <!-- 第三列：价位 -->
            <div class="price-col buy-price">
              {{ item.price }}
            </div>

            <!-- 第四列：卖单按钮（A/B模式） -->
            <div
              class="sell-order-col clickable"
              @click="handleOrderClick('sell', item, index)"
              :class="{ active: isSelected('buy', 'sell', index) }"
            >
              {{ item.sellVolume || '' }}
            </div>

            <!-- 第五列：空列 -->
            <div class="empty-col"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { CtpService } from '../services/ctpService'
import { UserStorageService } from '../services/userStorage'
import { MarketDataInfo, OrderRequest, PositionInfo, AccountInfo } from '../types/ctp'
import { runTradingPanelTest } from '../utils/tradingPanelTest'
import { runQueryTest } from '../utils/queryTest'
import { startGlobalPriceTest, stopGlobalPriceTest } from '../utils/priceUpdateTest'
import { runDynamicOrdersTest } from '../utils/dynamicOrdersTest'

interface OrderData {
  price: number
  buyVolume: number
  sellVolume: number
  level: string
}

interface SelectedCell {
  type: 'sell' | 'buy'
  field: 'cancel' | 'buy' | 'sell' | 'price'
  value: number
  data: OrderData
  index: number
}

// CTP服务实例
const ctpService = new CtpService()
const marketData = ref<MarketDataInfo | null>(null)
const accountInfo = ref<AccountInfo | null>(null)
const positionInfo = ref<PositionInfo[]>([])
const isCtpConnected = ref(false)
const isUsingRealData = ref(false)

// 交易相关
const selectedCell = ref<SelectedCell | null>(null)  // 当前选中的单元格（用于下单/撤单）
const clickCount = ref(0)                           // 点击计数器
const orderQuantity = ref(1)                        // 下单数量（手）
const orderPrice = ref(20)                          // 下单价格（点击价格档位时自动填入）
const orderType = ref('A')                          // 订单类型：A=默认模式, B=特殊模式

// 交易选项配置
const options = ref({
  autoHand: false,                          // 自动手数：是否自动计算下单手数
  cLimit345: false,                         // C限制345：特定的交易限制规则
  cLimit550: false,                         // C限制550：另一种交易限制规则
  noLimit: false,                           // 无限制：取消所有交易限制
  noCombo: false,                           // 无组合：禁用组合交易功能
  upLimit: false                            // 涨停限制：涨停价格限制开关
})

// 持仓信息
const netPosition = ref(2893)               // 净持仓（多头-空头的净值）
const cPosition = ref(0)                    // C仓位（可能指Close平仓相关持仓）
const tPosition = ref(0)                    // T仓位（可能指Today今日持仓）
const pnlValue = ref(0)                     // 盈亏值（Profit and Loss）

// 界面缩放
const fontSize = ref(11)                    // 字体大小（像素）
const cellHeight = ref(18)                  // 单元格高度（像素）

// 时间显示
const currentTime = ref('')                 // 当前时间显示

// 当前价格和表格控制
const currentPrice = ref(3070)              // 当前价格/最新价
const tableContainer = ref<HTMLElement>()   // 表格容器引用
const priceDirection = ref<'up' | 'down' | 'neutral'>('neutral')  // 价格变化方向

// 市场数据
const priceChangePercent = ref(-0.07)       // 价格变化百分比（相对于昨结算价）
const totalVolume = ref(865535)             // 总成交量（手）- 当日累计成交的合约数量
const totalPosition = ref(269026)           // 总持仓量（手）- 市场上未平仓的合约总数，也称为未平仓合约数
const dailyPositionChange = ref(2260)       // 日内持仓变化（手）- 相对于昨日的持仓量变化
const redValue = ref(0)                     // 红色数值显示（用于特殊标记）
const blueValue = ref(0)                    // 蓝色数值显示（用于特殊标记）

// 交易模式和限制
const cancelMode = ref('limited')           // 撤单模式：'limited'=限制撤单次数, 'unlimited'=无限制
const positionMode = ref('open')            // 持仓模式：'open'=仅开仓, 'close'=仅平仓
const maxCancelOrders = ref(489)            // 最大撤单次数限制
const currentCancelCount = ref(0)           // 当前已撤单次数
const positionDisplay = ref('+15')          // 持仓显示（+表示多头，-表示空头）

// 界面控制
const showHelp = ref(false)

// 动态生成的卖盘数据（当前价格之上27档）
const sellOrders = ref<OrderData[]>([])

// 动态生成的买盘数据（当前价格之下27档）
const buyOrders = ref<OrderData[]>([])

// 价格档位配置
const PRICE_LEVELS = {
  SELL_LEVELS: 27,  // 卖盘档位数（当前价格之上）
  BUY_LEVELS: 27,   // 买盘档位数（当前价格之下）
  PRICE_STEP: 1     // 价格步长
}

// 存储真实行情数据的映射表（价格 -> 买卖量）
const marketDataMap = ref<Map<number, { bidVolume: number, askVolume: number }>>(new Map())

// 数据更新锁，防止并发修改
let isUpdatingOrders = false

// 安全的数据更新函数
const safeUpdateOrderVolumes = () => {
  if (isUpdatingOrders) return

  try {
    // 安全地更新卖盘数据
    for (let i = 0; i < sellOrders.value.length; i++) {
      const order = sellOrders.value[i]
      if (order && typeof order.price === 'number') {
        const marketData = marketDataMap.value.get(order.price)
        if (marketData) {
          order.sellVolume = marketData.askVolume
        }
      }
    }

    // 安全地更新买盘数据
    for (let i = 0; i < buyOrders.value.length; i++) {
      const order = buyOrders.value[i]
      if (order && typeof order.price === 'number') {
        const marketData = marketDataMap.value.get(order.price)
        if (marketData) {
          order.buyVolume = marketData.bidVolume
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ 安全更新数据时出错:', error)
  }
}

// 根据当前价格动态生成价格档位数据
const generatePriceOrders = (centerPrice: number) => {
  if (isUpdatingOrders) {
    console.log('⚠️ 正在更新档位数据，跳过重复生成')
    return
  }

  isUpdatingOrders = true
  console.log('🔄 根据当前价格生成档位数据:', centerPrice)

  try {
    // 生成卖盘数据（当前价格之上）
    const newSellOrders: OrderData[] = []
    for (let i = PRICE_LEVELS.SELL_LEVELS; i >= 1; i--) {
      const price = centerPrice + i * PRICE_LEVELS.PRICE_STEP
      const marketData = marketDataMap.value.get(price)

      newSellOrders.push({
        price: price,
        buyVolume: 0,
        sellVolume: marketData?.askVolume || 0,
        level: i.toString()
      })
    }

    // 生成买盘数据（当前价格之下）
    const newBuyOrders: OrderData[] = []
    for (let i = 1; i <= PRICE_LEVELS.BUY_LEVELS; i++) {
      const price = centerPrice - i * PRICE_LEVELS.PRICE_STEP
      const marketData = marketDataMap.value.get(price)

      newBuyOrders.push({
        price: price,
        buyVolume: marketData?.bidVolume || 0,
        sellVolume: 0,
        level: i.toString()
      })
    }

    // 原子性更新数据
    sellOrders.value = newSellOrders
    buyOrders.value = newBuyOrders

    console.log('✅ 档位数据生成完成:', {
      卖盘档位: newSellOrders.length,
      买盘档位: newBuyOrders.length,
      价格范围: `${newBuyOrders[newBuyOrders.length - 1]?.price} - ${newSellOrders[0]?.price}`
    })
  } finally {
    isUpdatingOrders = false
  }
}

// 移除登录功能

// 缩放功能
const zoomIn = () => {
  fontSize.value = Math.min(fontSize.value + 1, 20)
  cellHeight.value = Math.min(cellHeight.value + 2, 30)
}

const zoomOut = () => {
  fontSize.value = Math.max(fontSize.value - 1, 8)
  cellHeight.value = Math.max(cellHeight.value - 2, 12)
}

// 时间更新
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 判断是否选中
const isSelected = (type: 'sell' | 'buy', field: 'cancel' | 'buy' | 'sell' | 'price', index: number) => {
  return selectedCell.value?.type === type &&
         selectedCell.value?.field === field &&
         selectedCell.value?.index === index
}

// 处理撤单点击
const handleCancelClick = (type: 'sell' | 'buy', data: OrderData, index: number) => {
  clickCount.value++

  selectedCell.value = {
    type,
    field: 'cancel',
    value: data.price,
    data,
    index
  }

  console.log('点击撤单:', {
    type: type === 'sell' ? '卖盘' : '买盘',
    price: data.price,
    level: data.level
  })

  // 执行撤单操作
  cancelOrder()
}

// 处理下单点击
const handleOrderClick = (orderType: 'buy' | 'sell', data: OrderData, index: number) => {
  clickCount.value++

  selectedCell.value = {
    type: orderType,
    field: orderType,
    value: data.price,
    data,
    index
  }

  // 自动填入价格
  orderPrice.value = data.price

  console.log('点击下单:', {
    orderType: orderType === 'buy' ? '买单' : '卖单',
    price: data.price,
    level: data.level,
    mode: orderType
  })

  // 执行下单操作
  placeOrder()
}

// 下单操作
const placeOrder = async () => {
  if (!selectedCell.value) return

  const { type, field, value, data } = selectedCell.value

  try {
    // 检查CTP连接状态
    if (!isCtpConnected.value) {
      message.error('CTP未连接，无法下单')
      return
    }

    // 检查撤单限制
    if (cancelMode.value === 'limited' && currentCancelCount.value >= maxCancelOrders.value) {
      message.error('已达到最大撤单限制！')
      return
    }

    // 构建订单请求
    const orderRequest: OrderRequest = {
      instrument_id: 'rb2509', // 当前合约
      direction: type === 'buy' ? '0' : '1', // 0=买入, 1=卖出
      price: orderPrice.value,
      volume: orderQuantity.value,
      order_type: '1' // 1=限价单
    }

    console.log('📤 发送下单请求:', orderRequest)

    // 发送下单请求
    const result = await ctpService.insertOrder(orderRequest)

    if (result.success) {
      message.success(`下单成功: ${type === 'buy' ? '买入' : '卖出'} ${orderQuantity.value}手 @${orderPrice.value}`)
      console.log('✅ 下单成功:', result.data)

      // 清除选择
      clearSelection()

      // 刷新持仓数据
      await loadAccountAndPositionData()
    } else {
      message.error(`下单失败: ${result.error}`)
      console.error('❌ 下单失败:', result.error)
    }

  } catch (error) {
    console.error('❌ 下单异常:', error)
    message.error(`下单异常: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 撤单操作
const cancelOrder = async () => {
  if (!selectedCell.value) return

  const { type, data } = selectedCell.value

  try {
    // 检查CTP连接状态
    if (!isCtpConnected.value) {
      message.error('CTP未连接，无法撤单')
      return
    }

    // 检查撤单限制
    if (cancelMode.value === 'limited' && currentCancelCount.value >= maxCancelOrders.value) {
      message.error(`撤单限制: 已达到最大撤单数量 ${maxCancelOrders.value} 手`)
      return
    }

    // 注意：这里需要有实际的订单引用号才能撤单
    // 在真实场景中，应该从订单列表中获取要撤销的订单引用号
    const orderRef = `order_${Date.now()}` // 临时的订单引用号，实际应该从订单管理中获取

    console.log('📤 发送撤单请求:', { orderRef, type, level: data.level })

    // 发送撤单请求
    const result = await ctpService.cancelOrder(orderRef)

    if (result.success) {
      currentCancelCount.value++
      message.success(`撤单成功: ${type === 'sell' ? '卖盘' : '买盘'} 档位${data.level}`)
      console.log('✅ 撤单成功:', result.data)

      // 清除选择
      clearSelection()

      // 刷新持仓数据
      await loadAccountAndPositionData()
    } else {
      message.error(`撤单失败: ${result.error}`)
      console.error('❌ 撤单失败:', result.error)
    }

  } catch (error) {
    console.error('❌ 撤单异常:', error)
    message.error(`撤单异常: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 清除选择
const clearSelection = () => {
  selectedCell.value = null
}

// 滚动到当前价格行，使其居中显示
const scrollToCurrentPrice = () => {
  if (!tableContainer.value) return

  const currentPriceValue = currentPrice.value
  const sellOrdersLength = sellOrders.value.length
  const buyOrdersLength = buyOrders.value.length

  // 由于数据是动态生成的，当前价格应该在卖盘和买盘的交界处
  // 卖盘是从高到低排列，买盘是从高到低排列
  // 当前价格应该在卖盘的最后一行和买盘的第一行之间

  let targetRowIndex = -1

  // 在动态生成的数据中，当前价格位于：
  // - 卖盘最后一档（价格 = currentPrice + 1）
  // - 买盘第一档（价格 = currentPrice - 1）
  // 所以当前价格行应该在卖盘结束的位置

  // 查找最接近当前价格的行
  let minDiff = Infinity
  let bestIndex = -1

  // 在卖盘中查找
  for (let i = 0; i < sellOrdersLength; i++) {
    const diff = Math.abs(sellOrders.value[i].price - currentPriceValue)
    if (diff < minDiff) {
      minDiff = diff
      bestIndex = i
    }
  }

  // 在买盘中查找
  for (let i = 0; i < buyOrdersLength; i++) {
    const diff = Math.abs(buyOrders.value[i].price - currentPriceValue)
    if (diff < minDiff) {
      minDiff = diff
      bestIndex = sellOrdersLength + i
    }
  }

  targetRowIndex = bestIndex

  // 如果没有找到精确匹配，使用卖盘和买盘的交界处
  if (targetRowIndex === -1) {
    targetRowIndex = sellOrdersLength // 卖盘结束的位置
  }

  // 滚动到目标位置
  if (targetRowIndex !== -1) {
    const rowHeight = cellHeight.value
    const containerHeight = tableContainer.value.clientHeight
    const targetScrollTop = (targetRowIndex * rowHeight) - (containerHeight / 2) + (rowHeight / 2)

    // 平滑滚动到目标位置
    tableContainer.value.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth'
    })

    console.log('📍 滚动到当前价格:', {
      currentPrice: currentPriceValue,
      targetRowIndex,
      targetScrollTop: Math.max(0, targetScrollTop),
      sellOrdersLength,
      buyOrdersLength
    })
  }
}

// 实时更新当前价格并滚动到中心
const updateCurrentPriceAndScroll = (newPrice: number) => {
  const oldPrice = currentPrice.value
  const newPriceRounded = Math.round(newPrice)

  // 更新价格方向
  if (newPriceRounded > oldPrice) {
    priceDirection.value = 'up'
  } else if (newPriceRounded < oldPrice) {
    priceDirection.value = 'down'
  } else {
    priceDirection.value = 'neutral'
  }

  currentPrice.value = newPriceRounded

  // 如果价格发生变化，重新生成档位数据
  if (Math.abs(oldPrice - currentPrice.value) >= 1) {
    console.log('💹 价格变化:', {
      从: oldPrice,
      到: currentPrice.value,
      方向: priceDirection.value === 'up' ? '上涨' : priceDirection.value === 'down' ? '下跌' : '持平'
    })

    // 重新生成以新价格为中心的档位数据
    generatePriceOrders(currentPrice.value)

    // 延迟一点时间确保DOM更新完成后滚动
    setTimeout(() => {
      scrollToCurrentPrice()
    }, 100)
  }

  // 3秒后重置方向为中性
  setTimeout(() => {
    priceDirection.value = 'neutral'
  }, 3000)
}

// 重新连接CTP
const reconnectCtp = async () => {
  try {
    message.info('正在重新连接CTP...')
    isCtpConnected.value = false
    isUsingRealData.value = false

    // 重新初始化CTP连接
    await initMarketData()
  } catch (error) {
    console.error('❌ 重连CTP失败:', error)
    message.error('重连CTP失败')
  }
}

// 切换数据源
const toggleDataSource = () => {
  if (isUsingRealData.value) {
    // 从真实数据切换到增强模拟
    message.info('切换到增强模拟数据')
    isUsingRealData.value = false
    isCtpConnected.value = true
    startEnhancedMockData()
  } else if (isCtpConnected.value) {
    // 从增强模拟切换到基础模拟
    message.info('切换到基础模拟数据')
    isCtpConnected.value = false
    startMockMarketData()
  } else {
    // 从基础模拟尝试切换到真实数据
    message.info('尝试连接真实数据...')
    initMarketData()
  }
}

// 运行CTP测试
const runTest = async () => {
  try {
    message.info('开始运行CTP测试...')

    // 1. 测试API版本
    console.log('🧪 测试1: 获取CTP API版本')
    const versionResult = await ctpService.getApiVersion()
    if (versionResult.success) {
      console.log('✅ API版本:', versionResult.data)
      message.success(`API版本: ${versionResult.data}`)
    } else {
      console.error('❌ 获取API版本失败:', versionResult.error)
      message.error('获取API版本失败')
      return
    }

    // 2. 检查当前状态
    console.log('🧪 测试2: 检查当前CTP状态')
    const mdStatus = ctpService.getMdStatus()
    const traderStatus = ctpService.getTraderStatus()
    console.log('📊 当前状态 - MD:', mdStatus, 'Trader:', traderStatus)

    // 3. 如果没有连接，尝试建立连接
    if (mdStatus === 'disconnected') {
      console.log('🧪 测试3: 尝试建立MD连接')

      const userInfo = UserStorageService.getUserInfo()
      if (!userInfo) {
        message.error('未找到用户登录信息，请先登录')
        return
      }

      // 创建MD API
      const createResult = await ctpService.createMdApi()
      if (!createResult.success) {
        console.error('❌ 创建MD API失败:', createResult.error)
        message.error(`创建MD API失败: ${createResult.error}`)
        return
      }
      console.log('✅ MD API创建成功')

      // 尝试登录
      const ctpConfig = UserStorageService.toCtpConfig(userInfo)
      const loginResult = await ctpService.mdLogin(ctpConfig)
      if (!loginResult.success) {
        console.error('❌ MD登录失败:', loginResult.error)
        message.error(`MD登录失败: ${loginResult.error}`)
        return
      }
      console.log('✅ MD登录成功')
    }

    // 4. 测试行情订阅
    console.log('🧪 测试4: 测试行情订阅')
    const subscribeResult = await ctpService.subscribeMarketData(['rb2509'])
    if (subscribeResult.success) {
      console.log('✅ 行情订阅成功:', subscribeResult.data)
      message.success('CTP测试完成！所有功能正常')
    } else {
      console.error('❌ 行情订阅失败:', subscribeResult.error)
      message.warning(`行情订阅失败: ${subscribeResult.error}`)
    }

    // 运行完整测试
    await runTradingPanelTest()

    // 运行查询测试
    console.log('🧪 测试5: 运行查询功能测试')
    await runQueryTest()

    // 运行动态档位测试
    console.log('🧪 测试6: 运行动态档位数据测试')
    runDynamicOrdersTest()

  } catch (error) {
    console.error('❌ CTP测试失败:', error)
    message.error(`CTP测试失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 模拟价格更新 - 简化版本，避免所有数组访问问题
const updatePrices = () => {
  // 只更新市场统计数据和价格，不直接修改档位数据

  // 随机更新当前价格
  if (Math.random() > 0.8) {
    const change = Math.random() > 0.5 ? 1 : -1
    const newPrice = currentPrice.value + change
    updateCurrentPriceAndScroll(newPrice)

    // 更新价格变化百分比
    priceChangePercent.value = Number((priceChangePercent.value + (change * 0.01)).toFixed(2))
  }

  // 随机更新市场数据
  if (Math.random() > 0.9) {
    totalVolume.value += Math.floor(Math.random() * 1000)
    totalPosition.value += Math.floor(Math.random() * 100) - 50
    dailyPositionChange.value += Math.floor(Math.random() * 10) - 5
  }

  // 偶尔更新市场深度数据（频率较低，避免冲突）
  if (Math.random() > 0.95) {
    const currentPriceValue = currentPrice.value
    const priceRange = 5 // 较小的范围

    // 只更新市场数据映射表，不立即同步到显示
    for (let i = 0; i < 2; i++) {
      const randomOffset = Math.floor(Math.random() * priceRange * 2) - priceRange
      const targetPrice = currentPriceValue + randomOffset

      const newBidVolume = targetPrice < currentPriceValue ? Math.floor(Math.random() * 50) : 0
      const newAskVolume = targetPrice > currentPriceValue ? Math.floor(Math.random() * 50) : 0

      marketDataMap.value.set(targetPrice, {
        bidVolume: newBidVolume,
        askVolume: newAskVolume
      })
    }

    // 延迟更新显示数据，降低冲突概率
    setTimeout(() => {
      if (!isUpdatingOrders) {
        safeUpdateOrderVolumes()
      }
    }, 50)
  }
}

// 定时器引用，用于在组件卸载时清理
let priceUpdateInterval: number | null = null
let timeUpdateInterval: number | null = null

// 键盘快捷键处理
const handleKeydown = (event: KeyboardEvent) => {

  switch (event.key) {
    case '+':
    case '=':
      event.preventDefault()
      zoomIn()
      break
    case '-':
      event.preventDefault()
      zoomOut()
      break
    case 'Escape':
      event.preventDefault()
      clearSelection()
      break
    case 'Enter':
      if (selectedCell.value) {
        event.preventDefault()
        placeOrder()
      }
      break
    case 'Delete':
    case 'Backspace':
      if (selectedCell.value) {
        event.preventDefault()
        cancelOrder()
      }
      break
    case 'p':
    case 'P':
      event.preventDefault()
      positionMode.value = positionMode.value === 'open' ? 'close' : 'open'
      break
    case 'k':
    case 'K':
      event.preventDefault()
      positionMode.value = 'open'
      break
  }
}

// 初始化 CTP 连接和行情数据
const initMarketData = async () => {
  try {
    console.log('🔍 开始初始化 CTP 服务...')

    // 1. 检查用户登录状态
    const userInfo = UserStorageService.getUserInfo()
    if (!userInfo) {
      console.warn('⚠️ 未找到用户登录信息，使用模拟数据')
      startMockMarketData()
      return
    }

    // 2. 尝试真实CTP连接
    console.log('🔧 尝试建立真实CTP连接...')
    const realConnectionSuccess = await attemptRealCtpConnection()

    if (realConnectionSuccess) {
      console.log('✅ 真实CTP连接成功')
      isCtpConnected.value = true
      isUsingRealData.value = true
      message.success('已连接到真实CTP服务，正在使用真实数据')

      // 启动真实数据流
      startRealMarketData()
    } else {
      console.log('⚠️ 真实CTP连接失败，启用增强模拟模式')
      isCtpConnected.value = false
      isUsingRealData.value = false
      message.warning('CTP连接失败，使用增强模拟数据（模拟真实交易行为）')

      // 启动增强模拟数据
      startEnhancedMockData()
    }

  } catch (error) {
    console.error('❌ 初始化CTP服务失败:', error)
    message.error(`CTP初始化失败: ${error instanceof Error ? error.message : '未知错误'}`)
    // 启动基础模拟数据作为最后备选方案
    startMockMarketData()
  }
}

// 尝试真实CTP连接
const attemptRealCtpConnection = async (): Promise<boolean> => {
  try {
    const userInfo = UserStorageService.getUserInfo()
    if (!userInfo) return false

    const ctpConfig = UserStorageService.toCtpConfig(userInfo)
    console.log('使用CTP配置:', ctpConfig)

    // 1. 测试API版本
    const versionResult = await ctpService.getApiVersion()
    if (!versionResult.success) {
      console.error('❌ 无法获取CTP API版本')
      return false
    }
    console.log('✅ CTP API版本:', versionResult.data)

    // 2. 创建MD API
    const createMdResult = await ctpService.createMdApi()
    if (!createMdResult.success) {
      console.error('❌ 创建MD API失败:', createMdResult.error)
      return false
    }
    console.log('✅ MD API创建成功')

    // 3. MD登录
    const mdLoginResult = await ctpService.mdLogin(ctpConfig)
    if (!mdLoginResult.success) {
      console.error('❌ MD登录失败:', mdLoginResult.error)
      return false
    }
    console.log('✅ MD登录成功')

    // 4. 创建Trader API
    const createTraderResult = await ctpService.createTraderApi()
    if (!createTraderResult.success) {
      console.error('❌ 创建Trader API失败:', createTraderResult.error)
      return false
    }
    console.log('✅ Trader API创建成功')

    // 5. Trader登录
    const traderLoginResult = await ctpService.traderLogin(ctpConfig)
    if (!traderLoginResult.success) {
      console.error('❌ Trader登录失败:', traderLoginResult.error)
      return false
    }
    console.log('✅ Trader登录成功')

    return true
  } catch (error) {
    console.error('❌ 真实CTP连接过程中发生异常:', error)
    return false
  }
}

// 启动真实行情数据
const startRealMarketData = async () => {
  try {
    // 订阅行情数据
    const subscribeResult = await ctpService.subscribeMarketData(['rb2509'])
    if (subscribeResult.success) {
      console.log('✅ 订阅真实行情成功:', subscribeResult.data)

      // 监听行情数据更新
      ctpService.on('market_data', (data: MarketDataInfo) => {
        if (data.instrument_id === 'rb2509') {
          console.log('📈 收到真实行情数据:', data)
          marketData.value = data
          updatePricesFromMarketData(data)
        }
      })

      // 获取账户和持仓信息
      await loadAccountAndPositionData()
    } else {
      console.error('❌ 订阅真实行情失败:', subscribeResult.error)
      throw new Error(`订阅行情失败: ${subscribeResult.error}`)
    }
  } catch (error) {
    console.error('❌ 启动真实行情数据失败:', error)
    // 降级到增强模拟模式
    startEnhancedMockData()
  }
}

// 加载账户和持仓数据
const loadAccountAndPositionData = async () => {
  try {
    console.log('📊 加载账户和持仓数据...')

    // 注意：这里需要根据实际的CTP API实现来调用
    // 由于当前的ctpService可能还没有实现查询功能，我们先模拟

    // TODO: 实现真实的账户查询
    const accountResult = await ctpService.queryAccount()
    if (accountResult.success) {
      console.log('📊 账户数据:', accountResult.data)
      accountInfo.value = accountResult.data
    }

    // TODO: 实现真实的持仓查询
    const positionResult = await ctpService.queryPosition()
    if (positionResult.success) {
      console.log('📊 持仓数据:', positionResult.data)
      positionInfo.value = positionResult.data
    }

    console.log('📊 账户和持仓数据加载完成')
  } catch (error) {
    console.error('❌ 加载账户和持仓数据失败:', error)
  }
}

// 模拟行情数据（当真实行情不可用时）
const startMockMarketData = () => {
  console.log('🎭 启动模拟行情数据')
  isUsingRealData.value = false
  isCtpConnected.value = false

  message.warning('使用模拟数据，请检查CTP连接')

  const updateMockData = () => {
    const basePrice = 3070 // 使用更接近真实的基准价格
    const variation = (Math.random() - 0.5) * 10 // 减小价格波动范围
    const currentPriceValue = basePrice + variation

    const mockData: MarketDataInfo = {
      instrument_id: 'rb2509',
      last_price: currentPriceValue,
      volume: Math.floor(Math.random() * 10000) + 865535,
      turnover: currentPriceValue * (Math.floor(Math.random() * 10000) + 1000),
      open_interest: Math.floor(Math.random() * 1000) + 269026,
      pre_close_price: basePrice - 2,
      pre_settlement_price: basePrice - 1,
      pre_open_interest: 266766,
      open_price: basePrice + (Math.random() - 0.5) * 5,
      highest_price: currentPriceValue + Math.random() * 5,
      lowest_price: currentPriceValue - Math.random() * 5,
      upper_limit_price: basePrice + 200,
      lower_limit_price: basePrice - 200,
      settlement_price: currentPriceValue,
      currency_id: 'CNY',
      bid_price1: Math.round(currentPriceValue - 1),
      bid_volume1: Math.floor(Math.random() * 50) + 10,
      ask_price1: Math.round(currentPriceValue + 1),
      ask_volume1: Math.floor(Math.random() * 50) + 10,
      update_time: new Date().toLocaleTimeString(),
      update_millisec: Date.now() % 1000,
      action_day: new Date().toISOString().split('T')[0].replace(/-/g, '')
    }

    marketData.value = mockData
    updatePricesFromMarketData(mockData)
  }

  // 每2秒更新一次模拟数据，模拟真实行情的更新频率
  const mockInterval = setInterval(updateMockData, 2000)
  updateMockData() // 立即更新一次

  // 存储interval ID以便后续清理
  return mockInterval
}

// 增强模拟数据（模拟真实CTP行为）
const startEnhancedMockData = () => {
  console.log('🎭 启动增强模拟数据（模拟真实CTP行为）')
  isUsingRealData.value = false
  isCtpConnected.value = true // 模拟已连接状态

  message.info('使用增强模拟数据，模拟真实交易环境')

  // 模拟更真实的价格波动
  let basePrice = 3070
  let trend = 0 // 价格趋势：-1下跌，0震荡，1上涨
  let tickCount = 0

  const updateEnhancedMockData = () => {
    tickCount++

    // 每30秒随机改变趋势
    if (tickCount % 30 === 0) {
      trend = Math.random() > 0.5 ? (Math.random() > 0.5 ? 1 : -1) : 0
      console.log('🔄 趋势变化:', trend === 1 ? '上涨' : trend === -1 ? '下跌' : '震荡')
    }

    // 根据趋势调整价格
    let priceChange = 0
    if (trend === 1) { // 上涨趋势
      priceChange = Math.random() * 2 - 0.3 // 偏向上涨
    } else if (trend === -1) { // 下跌趋势
      priceChange = Math.random() * 2 - 1.7 // 偏向下跌
    } else { // 震荡
      priceChange = (Math.random() - 0.5) * 2 // 随机震荡
    }

    basePrice += priceChange
    basePrice = Math.max(3000, Math.min(3200, basePrice)) // 限制价格范围

    // 模拟真实的买卖盘深度 - 更新市场数据映射表
    const currentPriceValue = Math.round(basePrice)

    // 清除旧的市场数据
    marketDataMap.value.clear()

    // 为当前价格附近的档位生成随机深度数据
    for (let i = -5; i <= 5; i++) {
      const price = currentPriceValue + i
      const bidVolume = i <= 0 ? Math.floor(Math.random() * 50) + 5 : 0
      const askVolume = i >= 0 ? Math.floor(Math.random() * 50) + 5 : 0

      marketDataMap.value.set(price, { bidVolume, askVolume })
    }

    const mockData: MarketDataInfo = {
      instrument_id: 'rb2509',
      last_price: Math.round(basePrice),
      volume: Math.floor(Math.random() * 5000) + 865535,
      turnover: basePrice * (Math.floor(Math.random() * 5000) + 1000),
      open_interest: Math.floor(Math.random() * 500) + 269026,
      pre_close_price: 3072,
      pre_settlement_price: 3071,
      pre_open_interest: 266766,
      open_price: 3069 + Math.random() * 6,
      highest_price: Math.round(basePrice + Math.random() * 5),
      lowest_price: Math.round(basePrice - Math.random() * 5),
      upper_limit_price: 3378, // 涨停价
      lower_limit_price: 2764, // 跌停价
      settlement_price: Math.round(basePrice),
      currency_id: 'CNY',
      bid_price1: Math.round(basePrice - 1),
      bid_volume1: marketDataMap.value.get(Math.round(basePrice - 1))?.bidVolume || Math.floor(Math.random() * 50) + 10,
      ask_price1: Math.round(basePrice + 1),
      ask_volume1: marketDataMap.value.get(Math.round(basePrice + 1))?.askVolume || Math.floor(Math.random() * 50) + 10,
      update_time: new Date().toLocaleTimeString(),
      update_millisec: Date.now() % 1000,
      action_day: new Date().toISOString().split('T')[0].replace(/-/g, '')
    }

    marketData.value = mockData
    updatePricesFromMarketData(mockData)

    // 模拟交易回报
    if (tickCount % 10 === 0) {
      console.log('📊 [增强模拟] 价格更新:', {
        price: mockData.last_price,
        trend: trend === 1 ? '上涨' : trend === -1 ? '下跌' : '震荡',
        volume: mockData.volume,
        bidAsk: `${mockData.bid_price1}/${mockData.ask_price1}`
      })
    }
  }

  // 每秒更新一次，模拟真实行情频率
  const enhancedInterval = setInterval(updateEnhancedMockData, 1000)
  updateEnhancedMockData() // 立即更新一次

  return enhancedInterval
}

// CTP 状态处理函数
const getStatusText = (status: string) => {
  switch (status) {
    case 'disconnected': return '未连接'
    case 'connecting': return '连接中'
    case 'connected': return '已连接'
    case 'login_success': return '已登录'
    case 'login_failed': return '登录失败'
    case 'error': return '错误'
    default: return '未知'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'login_success': return 'status-success'
    case 'connected': return 'status-warning'
    case 'connecting': return 'status-info'
    case 'login_failed':
    case 'error': return 'status-error'
    default: return 'status-default'
  }
}

// 获取数据源显示文本
const getDataSourceText = () => {
  if (isUsingRealData.value) {
    return '真实'
  } else if (isCtpConnected.value) {
    return '增强模拟'
  } else {
    return '基础模拟'
  }
}

// 获取数据源样式类
const getDataSourceClass = () => {
  if (isUsingRealData.value) {
    return 'status-success'
  } else if (isCtpConnected.value) {
    return 'status-warning'
  } else {
    return 'status-info'
  }
}

// 获取切换按钮文本
const getToggleButtonText = () => {
  if (isUsingRealData.value) {
    return '→增强模拟'
  } else if (isCtpConnected.value) {
    return '→基础模拟'
  } else {
    return '→尝试真实'
  }
}

// 判断是否为当前价格行
const isCurrentPriceRow = (price: number) => {
  return Math.abs(price - currentPrice.value) < 0.5
}

// 获取当前价格行的方向样式类
const getCurrentPriceDirectionClass = (price: number) => {
  if (!isCurrentPriceRow(price)) return ''

  switch (priceDirection.value) {
    case 'up': return 'price-up'
    case 'down': return 'price-down'
    default: return ''
  }
}

// 获取数据模式描述
const getDataModeDescription = () => {
  if (isUsingRealData.value) {
    return '连接真实CTP服务器，使用真实行情和交易'
  } else if (isCtpConnected.value) {
    return '模拟真实交易环境，包含趋势和深度'
  } else {
    return '基础模拟数据，用于界面测试'
  }
}

// 显示字段说明
const showFieldHelp = () => {
  const helpText = `
TradingPanel 字段说明：

【市场数据】
• 总成交量: ${totalVolume.value} - 当日累计成交的合约数量
• 总持仓量: ${totalPosition.value} - 市场上未平仓的合约总数
• 日内持仓变化: ${dailyPositionChange.value} - 相对于昨日的持仓量变化
• 价格变化: ${priceChangePercent.value}% - 相对于昨结算价的涨跌幅

【持仓信息】
• 净仓: ${netPosition.value} - 多头持仓减去空头持仓的净值
• C仓: ${cPosition.value} - 平仓相关持仓
• T仓: ${tPosition.value} - 今日持仓

【交易控制】
• 下单数量: ${orderQuantity.value}手 - 每次下单的手数
• 下单价格: ${orderPrice.value} - 下单价格（点击档位自动填入）
• 订单类型: ${orderType.value} - A=默认模式, B=特殊模式

【交易模式】
• 撤单模式: ${cancelMode.value} - limited=限制次数, unlimited=无限制
• 持仓模式: ${positionMode.value} - open=仅开仓, close=仅平仓
• 撤单限制: ${currentCancelCount.value}/${maxCancelOrders.value} - 已撤单/最大撤单次数

【连接状态】
• 数据源: ${getDataSourceText()} - 当前使用的数据类型
• 行情状态: ${ctpService.getMdStatus()} - 行情API连接状态
• 交易状态: ${ctpService.getTraderStatus()} - 交易API连接状态

点击界面上的字段可以查看详细说明。
  `

  alert(helpText)
}

// 开始价格测试
const startPriceTest = () => {
  const testTypes = ['sequence', 'random', 'trend', 'extreme'] as const
  const selectedType = testTypes[Math.floor(Math.random() * testTypes.length)]

  message.info(`开始${selectedType}价格测试，观察价格变化和滚动效果`)

  // 停止之前的测试
  stopGlobalPriceTest()

  // 开始新的测试
  startGlobalPriceTest(selectedType, (newPrice: number) => {
    updateCurrentPriceAndScroll(newPrice)
  }, currentPrice.value)

  console.log(`🧪 开始价格测试 - 类型: ${selectedType}`)
}

// 根据行情数据更新价格
const updatePricesFromMarketData = (data: MarketDataInfo) => {
  if (!data) return

  console.log('📊 更新价格数据:', {
    instrument: data.instrument_id,
    lastPrice: data.last_price,
    bidPrice: data.bid_price1,
    askPrice: data.ask_price1,
    bidVolume: data.bid_volume1,
    askVolume: data.ask_volume1,
    volume: data.volume
  })

  // 更新市场数据映射表
  if (data.bid_price1 && data.bid_volume1) {
    marketDataMap.value.set(data.bid_price1, {
      bidVolume: data.bid_volume1,
      askVolume: marketDataMap.value.get(data.bid_price1)?.askVolume || 0
    })
  }

  if (data.ask_price1 && data.ask_volume1) {
    const existing = marketDataMap.value.get(data.ask_price1)
    marketDataMap.value.set(data.ask_price1, {
      bidVolume: existing?.bidVolume || 0,
      askVolume: data.ask_volume1
    })
  }

  // 更新当前价格并重新生成档位数据
  updateCurrentPriceAndScroll(data.last_price)

  // 计算价格变化百分比
  if (data.pre_settlement_price && data.pre_settlement_price > 0) {
    const changePercent = ((data.last_price - data.pre_settlement_price) / data.pre_settlement_price) * 100
    priceChangePercent.value = Number(changePercent.toFixed(2))
  }

  // 更新市场统计数据
  totalVolume.value = data.volume
  totalPosition.value = data.open_interest

  // 计算日内持仓变化
  if (data.pre_open_interest && data.pre_open_interest > 0) {
    dailyPositionChange.value = data.open_interest - data.pre_open_interest
  }

  console.log('✅ 价格数据更新完成')
}

// 组件挂载和卸载时的事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  updateTime() // 组件挂载时开始更新时间

  // 初始化价格档位数据
  generatePriceOrders(currentPrice.value)

  // 初始化行情数据
  initMarketData()

  // 启动定时器（在数据初始化完成后）
  priceUpdateInterval = window.setInterval(updatePrices, 2000)
  timeUpdateInterval = window.setInterval(updateTime, 1000)

  // 延迟滚动到当前价格，确保DOM渲染完成
  setTimeout(() => {
    scrollToCurrentPrice()
  }, 1000)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)

  // 清理定时器
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval)
    priceUpdateInterval = null
  }
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }

  // 取消订阅行情数据
  ctpService.unsubscribeMarketData(['rb2509']).catch(error => {
    console.error('取消订阅行情失败:', error)
  })

  // 停止价格测试
  stopGlobalPriceTest()
})
</script>

<style scoped>
.trading-panel-container {
  padding: 10px;
  width: 100%;
  height: 100vh;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background: #f0f0f0;
}

/* 主交易面板样式 */
.trading-panel {
  display: flex;
  gap: 5px;
  background: #f0f0f0;
  border: 2px solid #000;
  padding: 5px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  height: calc(100vh - 20px);
  width: 100%;
  box-sizing: border-box;
}

/* 左侧操作列 */
.left-control-panel {
  width: 180px;
  min-width: 180px;
  max-width: 180px;
  background: #e0e0e0;
  border: 1px solid #000;
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
  flex-shrink: 0;
}

.contract-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 3px;
  border: 1px solid #000;
}

.contract-name {
  font-size: 12px;
  font-weight: bold;
}

.zoom-controls {
  display: flex;
  gap: 2px;
}

.zoom-btn {
  width: 18px;
  height: 18px;
  border: 1px solid #666;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
}

.time-display, .price-change, .volume-info, .position-info, .daily-change {
  font-size: 10px;
  text-align: center;
  padding: 2px;
  background: white;
  border: 1px solid #ccc;
}

.price-change.negative {
  color: red;
}

.zero-values {
  display: flex;
  gap: 2px;
}

.zero-value {
  flex: 1;
  text-align: center;
  padding: 2px;
  color: white;
  font-size: 10px;
}

.zero-value.red {
  background: red;
}

.zero-value.blue {
  background: blue;
}

.order-inputs {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-input {
  padding: 2px;
  border: 1px solid #ccc;
  text-align: center;
  font-size: 10px;
}

/* 去掉input number类型的上下箭头 */
.order-input::-webkit-outer-spin-button,
.order-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox浏览器去掉上下箭头 */
.order-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.order-type-group, .order-options {
  font-size: 9px;
}

.order-type-group label, .order-options label {
  display: block;
  margin-bottom: 2px;
}

.position-info-section {
  font-size: 9px;
  text-align: center;
}

.pnl-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: white;
  padding: 5px;
  border: 1px solid #000;
}

.pnl-value {
  font-size: 14px;
  font-weight: bold;
}

.pnl-letter {
  font-size: 16px;
  font-weight: bold;
}

.operation-help {
  background: white;
  border: 1px solid #000;
  padding: 5px;
  margin-top: 5px;
}

.help-title {
  font-size: 10px;
  font-weight: bold;
  text-align: center;
  background: #e0e0e0;
  padding: 2px;
  margin-bottom: 3px;
}

.help-text {
  font-size: 8px;
  line-height: 1.2;
}

.help-text > div {
  margin-bottom: 1px;
}

/* CTP 控制按钮样式 */
.ctp-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 8px 0;
}

.ctp-btn {
  padding: 4px 8px;
  border: 1px solid #666;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 10px;
  border-radius: 3px;
  transition: all 0.2s;
}

.ctp-btn:hover:not(:disabled) {
  background: #e0e0e0;
  border-color: #333;
}

.ctp-btn:disabled {
  background: #d0d0d0;
  color: #666;
  cursor: not-allowed;
}

.test-btn {
  background: #e6f7ff !important;
  border-color: #1890ff !important;
  color: #1890ff !important;
}

.test-btn:hover:not(:disabled) {
  background: #bae7ff !important;
  border-color: #40a9ff !important;
}

.help-btn {
  background: #f6ffed !important;
  border-color: #52c41a !important;
  color: #52c41a !important;
}

.help-btn:hover:not(:disabled) {
  background: #d9f7be !important;
  border-color: #73d13d !important;
}

.price-test-btn {
  background: #f0f5ff !important;
  border-color: #722ed1 !important;
  color: #722ed1 !important;
}

.price-test-btn:hover:not(:disabled) {
  background: #d6e4ff !important;
  border-color: #9254de !important;
}

/* 数据模式说明样式 */
.data-mode-info {
  margin: 8px 0;
  padding: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 10px;
}

.mode-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.mode-desc {
  color: #666;
  line-height: 1.2;
}

/* 右侧表格区域 */
.price-table-container {
  flex: 1;
  background: white;
  border: 1px solid #000;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 确保flex子项可以收缩 */
  max-width: 140px; /* 设置表格最大宽度为140px */
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr 1fr 1fr;
  background: #d0d0d0;
  border-bottom: 2px solid #000;
}

.col-header {
  text-align: center;
  padding: 3px;
  border-right: 1px solid #000;
  font-weight: bold;
  font-size: 9px;
}

.price-table {
  flex: 1;
  overflow-y: auto;
  background: white;
  scroll-behavior: smooth;
  position: relative;
  border: 1px solid #ccc;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr 1fr 1fr;
  border-bottom: 1px solid #ccc;
  font-size: v-bind(fontSize + 'px');
  height: v-bind(cellHeight + 'px');
  line-height: v-bind(cellHeight + 'px');
  transition: all 0.3s ease;
}

.price-row:hover {
  background-color: #f0f8ff;
}

/* 当前价格行高亮 */
.current-price-row {
  background-color: #fff3cd !important;
  border: 2px solid #ffc107 !important;
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(255, 193, 7, 0.4);
  position: relative;
  z-index: 10;
  animation: currentPricePulse 2s infinite;
}

.current-price-row:hover {
  background-color: #fff3cd !important;
}

/* 当前价格行的价格列特殊样式 */
.current-price-row .price-col {
  font-weight: bold;
  color: #856404 !important;
  background-color: #ffc107 !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* 当前价格行脉冲动画 */
@keyframes currentPricePulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(255, 193, 7, 0.4);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.7);
  }
}

/* 价格上涨动画 */
.price-up {
  animation: priceUpFlash 3s ease-out;
}

@keyframes priceUpFlash {
  0% {
    background-color: #d4edda !important;
    border-color: #28a745 !important;
    box-shadow: 0 0 15px rgba(40, 167, 69, 0.6);
  }
  100% {
    background-color: #fff3cd !important;
    border-color: #ffc107 !important;
    box-shadow: 0 0 8px rgba(255, 193, 7, 0.4);
  }
}

/* 价格下跌动画 */
.price-down {
  animation: priceDownFlash 3s ease-out;
}

@keyframes priceDownFlash {
  0% {
    background-color: #f8d7da !important;
    border-color: #dc3545 !important;
    box-shadow: 0 0 15px rgba(220, 53, 69, 0.6);
  }
  100% {
    background-color: #fff3cd !important;
    border-color: #ffc107 !important;
    box-shadow: 0 0 8px rgba(255, 193, 7, 0.4);
  }
}

/* 表格列样式 */
.cancel-col {
  text-align: center;
  border-right: 1px solid #ccc;
  background: #ffcccc;
  cursor: pointer;
  font-weight: bold;
  color: red;
  padding: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cancel-col:hover {
  background: #ff9999;
}

.buy-order-col {
  text-align: center;
  border-right: 1px solid #ccc;
  background: #ccccff;
  cursor: pointer;
  color: blue;
  padding: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.buy-order-col:hover {
  background: #9999ff;
  color: white;
}

.price-col {
  text-align: center;
  border-right: 1px solid #ccc;
  font-weight: bold;
  color: #000;
  padding: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sell-order-col {
  text-align: center;
  border-right: 1px solid #ccc;
  background: #ffcccc;
  cursor: pointer;
  color: red;
  padding: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sell-order-col:hover {
  background: #ff9999;
  color: white;
}

.empty-col {
  text-align: center;
  background: #f0f0f0;
  padding: 2px;
}

.sell-row {
  background: #ffe0e0;
}

.sell-row .sell-price {
  background: #ff6666;
  color: white;
}

.buy-row {
  background: #e0f0ff;
}

.buy-row .buy-price {
  background: #6666ff;
  color: white;
}

.current-price-row {
  background: #ffff99;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  height: 24px;
  line-height: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr 1fr 1fr;
}

.current-price-display {
  grid-column: 1 / -1;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #000;
}

.clickable {
  cursor: pointer;
  transition: all 0.1s ease;
}

.clickable.active {
  background: #006600 !important;
  color: white !important;
  font-weight: bold;
}

/* CTP 状态样式 */
.ctp-status {
  margin: 8px 0;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  color: #666;
  font-weight: normal;
}

.status-value {
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.status-success {
  background: #d4edda;
  color: #155724;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
}

.status-info {
  background: #d1ecf1;
  color: #0c5460;
}

.status-error {
  background: #f8d7da;
  color: #721c24;
}

.status-default {
  background: #e2e3e5;
  color: #383d41;
}



/* 滚动条样式 */
.price-table::-webkit-scrollbar,
.left-control-panel::-webkit-scrollbar {
  width: 5px;
}

.price-table::-webkit-scrollbar-track,
.left-control-panel::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.price-table::-webkit-scrollbar-thumb,
.left-control-panel::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.price-table::-webkit-scrollbar-thumb:hover,
.left-control-panel::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

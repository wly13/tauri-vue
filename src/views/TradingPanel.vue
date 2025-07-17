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
        </div>

        <div class="price-change negative">{{ priceChangePercent }}%</div>
        <div class="volume-info">{{ totalVolume }}</div>
        <div class="position-info">{{ totalPosition }}</div>
        <div class="daily-change">{{ dailyPositionChange }}</div>

        <div class="zero-values">
          <div class="zero-value red">{{ redValue }}</div>
          <div class="zero-value blue">{{ blueValue }}</div>
        </div>

        <!-- 下单控制 -->
        <div class="order-inputs">
          <input v-model="orderQuantity" type="number" class="order-input" placeholder="1" />
          <input v-model="orderPrice" type="number" class="order-input" placeholder="20" />
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
          <div>净仓: {{ netPosition }}</div>
          <div>C: {{ cPosition }} T: {{ tPosition }}</div>
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

        <div class="price-table">
          <!-- 卖盘数据 -->
          <div
            v-for="(item, index) in sellOrders"
            :key="`sell-${index}`"
            class="price-row sell-row"
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
            class="price-row buy-row"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CtpService } from '../services/ctpService'
import { UserStorageService } from '../services/userStorage'
import { MarketDataInfo } from '../types/ctp'

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

// 交易相关
const selectedCell = ref<SelectedCell | null>(null)
const clickCount = ref(0)
const orderQuantity = ref(1)
const orderPrice = ref(20)
const orderType = ref('A')

// 选项
const options = ref({
  autoHand: false,
  cLimit345: false,
  cLimit550: false,
  noLimit: false,
  noCombo: false,
  upLimit: false
})

// 持仓信息
const netPosition = ref(2893)
const cPosition = ref(0)
const tPosition = ref(0)
const pnlValue = ref(0)

// 界面缩放
const fontSize = ref(11)
const cellHeight = ref(18)

// 时间显示
const currentTime = ref('')

// 市场数据
const priceChangePercent = ref(-0.07)
const totalVolume = ref(865535)
const totalPosition = ref(269026)
const dailyPositionChange = ref(2260)
const redValue = ref(0)
const blueValue = ref(0)

// 交易模式和限制
const cancelMode = ref('limited')
const positionMode = ref('open')
const maxCancelOrders = ref(489)
const currentCancelCount = ref(0)
const positionDisplay = ref('+15')

// 界面控制
const showHelp = ref(false)

// 卖盘数据 - 根据图片显示的价格
const sellOrders = ref<OrderData[]>([
  { price: 3097, buyVolume: 0, sellVolume: 0, level: '16' },
  { price: 3096, buyVolume: 0, sellVolume: 0, level: '15' },
  { price: 3095, buyVolume: 0, sellVolume: 0, level: '14' },
  { price: 3094, buyVolume: 0, sellVolume: 0, level: '13' },
  { price: 3093, buyVolume: 0, sellVolume: 0, level: '12' },
  { price: 3092, buyVolume: 0, sellVolume: 0, level: '11' },
  { price: 3091, buyVolume: 0, sellVolume: 0, level: '10' },
  { price: 3090, buyVolume: 0, sellVolume: 0, level: '9' },
  { price: 3089, buyVolume: 0, sellVolume: 0, level: '8' },
  { price: 3088, buyVolume: 0, sellVolume: 0, level: '7' },
  { price: 3087, buyVolume: 0, sellVolume: 0, level: '6' },
  { price: 3086, buyVolume: 0, sellVolume: 0, level: '5' },
  { price: 3085, buyVolume: 0, sellVolume: 0, level: '4' },
  { price: 3084, buyVolume: 0, sellVolume: 0, level: '3' },
  { price: 3083, buyVolume: 0, sellVolume: 0, level: '2' },
  { price: 3082, buyVolume: 0, sellVolume: 0, level: '1' },
  { price: 3081, buyVolume: 0, sellVolume: 0, level: '0' },
  { price: 3080, buyVolume: 0, sellVolume: 0, level: '-1' },
  { price: 3079, buyVolume: 0, sellVolume: 0, level: '-2' },
  { price: 3078, buyVolume: 0, sellVolume: 0, level: '-3' },
  { price: 3077, buyVolume: 0, sellVolume: 0, level: '-4' },
  { price: 3076, buyVolume: 12, sellVolume: 48, level: '-5' },
  { price: 3075, buyVolume: 8, sellVolume: 32, level: '-6' },
  { price: 3074, buyVolume: 15, sellVolume: 50, level: '-7' },
  { price: 3073, buyVolume: 22, sellVolume: 68, level: '-8' },
  { price: 3072, buyVolume: 18, sellVolume: 61, level: '-9' },
  { price: 3071, buyVolume: 5, sellVolume: 19, level: '-10' },
])

// 更新当前价格为图片中显示的价格
const currentPrice = ref(3070)

// 买盘数据 - 根据图片显示的价格
const buyOrders = ref<OrderData[]>([
  { price: 3069, buyVolume: 25, sellVolume: 8, level: '1' },
  { price: 3068, buyVolume: 16, sellVolume: 12, level: '2' },
  { price: 3067, buyVolume: 18, sellVolume: 6, level: '3' },
  { price: 3066, buyVolume: 16, sellVolume: 9, level: '4' },
  { price: 3065, buyVolume: 95, sellVolume: 15, level: '5' },
  { price: 3064, buyVolume: 0, sellVolume: 0, level: '6' },
  { price: 3063, buyVolume: 0, sellVolume: 0, level: '7' },
  { price: 3062, buyVolume: 0, sellVolume: 0, level: '8' },
  { price: 3061, buyVolume: 0, sellVolume: 0, level: '9' },
  { price: 3060, buyVolume: 0, sellVolume: 0, level: '10' },
  { price: 3059, buyVolume: 0, sellVolume: 0, level: '11' },
  { price: 3058, buyVolume: 0, sellVolume: 0, level: '12' },
  { price: 3057, buyVolume: 0, sellVolume: 0, level: '13' },
  { price: 3056, buyVolume: 0, sellVolume: 0, level: '14' },
  { price: 3055, buyVolume: 0, sellVolume: 0, level: '15' },
  { price: 3054, buyVolume: 0, sellVolume: 0, level: '16' },
  { price: 3053, buyVolume: 0, sellVolume: 0, level: '17' },
  { price: 3052, buyVolume: 0, sellVolume: 0, level: '18' },
  { price: 3051, buyVolume: 0, sellVolume: 0, level: '19' },
  { price: 3050, buyVolume: 0, sellVolume: 0, level: '20' },
  { price: 3049, buyVolume: 0, sellVolume: 0, level: '21' },
  { price: 3048, buyVolume: 0, sellVolume: 0, level: '22' },
  { price: 3047, buyVolume: 0, sellVolume: 0, level: '23' },
  { price: 3046, buyVolume: 0, sellVolume: 0, level: '24' },
  { price: 3045, buyVolume: 0, sellVolume: 0, level: '25' },
  { price: 3044, buyVolume: 0, sellVolume: 0, level: '26' },
  { price: 3043, buyVolume: 0, sellVolume: 0, level: '27' },
  { price: 3042, buyVolume: 0, sellVolume: 0, level: '28' },
])

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
const placeOrder = () => {
  if (!selectedCell.value) return

  const { type, field, value, data } = selectedCell.value

  // 根据A/B模式执行不同的下单逻辑
  let orderInfo = `下单操作:\n类型: ${type === 'sell' ? '卖盘' : '买盘'}\n${field === 'price' ? '价格' : '数量'}: ${value}\n档位: ${data.level}\n数量: ${orderQuantity.value}\n价格: ${orderPrice.value}\n模式: ${orderType.value}`

  if (orderType.value === 'A') {
    orderInfo += '\nA模式: 默认A模式状态'
  } else {
    orderInfo += '\nB模式: 默认B模式状态，后期制作需与撤单限制功能对换位置'
  }

  // 检查撤单限制
  if (cancelMode.value === 'limited' && currentCancelCount.value >= maxCancelOrders.value) {
    alert('已达到最大撤单限制！')
    return
  }

  // 检查开仓平仓模式
  if (positionMode.value === 'open') {
    orderInfo += '\n仅开仓模式'
  } else {
    orderInfo += '\n仅平仓模式'
  }

  alert(orderInfo)
}

// 撤单操作
const cancelOrder = () => {
  if (!selectedCell.value) return

  const { type, data } = selectedCell.value

  // 检查撤单限制
  if (cancelMode.value === 'limited' && currentCancelCount.value >= maxCancelOrders.value) {
    alert(`撤单限制: 已达到最大撤单数量 ${maxCancelOrders.value} 手`)
    return
  }

  // 执行撤单
  currentCancelCount.value++

  alert(`撤单操作:\n类型: ${type === 'sell' ? '卖盘' : '买盘'}\n档位: ${data.level}\n当前撤单总数: ${currentCancelCount.value}`)
}

// 清除选择
const clearSelection = () => {
  selectedCell.value = null
}

// 模拟价格更新
const updatePrices = () => {
  // 随机更新一些价格和数量，模拟实时行情
  const randomSellIndex = Math.floor(Math.random() * sellOrders.value.length)
  const randomBuyIndex = Math.floor(Math.random() * buyOrders.value.length)

  if (Math.random() > 0.7) {
    sellOrders.value[randomSellIndex].sellVolume = Math.floor(Math.random() * 100)
  }
  if (Math.random() > 0.7) {
    buyOrders.value[randomBuyIndex].buyVolume = Math.floor(Math.random() * 100)
  }

  // 随机更新当前价格
  if (Math.random() > 0.8) {
    const change = Math.random() > 0.5 ? 1 : -1
    currentPrice.value += change

    // 更新价格变化百分比
    priceChangePercent.value = Number((priceChangePercent.value + (change * 0.01)).toFixed(2))
  }

  // 随机更新市场数据
  if (Math.random() > 0.9) {
    totalVolume.value += Math.floor(Math.random() * 1000)
    totalPosition.value += Math.floor(Math.random() * 100) - 50
    dailyPositionChange.value += Math.floor(Math.random() * 10) - 5
  }
}

// 定时更新价格（模拟实时数据）
setInterval(updatePrices, 2000)

// 定时更新时间
setInterval(updateTime, 1000)

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
    console.log('🔍 开始初始化 CTP 行情服务...')

    // 1. 检查 MD API 状态
    const mdStatus = ctpService.getMdStatus()
    console.log('当前 MD 状态:', mdStatus)

    if (mdStatus === 'disconnected') {
      console.log('🔧 创建 MD API...')
      // 创建 MD API
      const createResult = await ctpService.createMdApi()
      if (!createResult.success) {
        console.error('❌ 创建 MD API 失败:', createResult.error)
        startMockMarketData()
        return
      }
      console.log('✅ MD API 创建成功')
    }

    // 2. 订阅行情数据
    console.log('🔧 订阅 rb2509 合约行情...')
    const result = await ctpService.subscribeMarketData(['rb2509'])
    if (result.success) {
      console.log('✅ 订阅行情成功:', result.data)
    } else {
      console.error('❌ 订阅行情失败:', result.error)
      // 如果订阅失败，使用模拟数据
      console.log('🔄 使用模拟行情数据')
      startMockMarketData()
      return
    }

    // 3. 监听行情数据更新
    ctpService.on('market_data', (data: MarketDataInfo) => {
      if (data.instrument_id === 'rb2509') {
        console.log('📈 收到行情数据:', data)
        marketData.value = data
        updatePricesFromMarketData(data)
      }
    })

  } catch (error) {
    console.error('❌ 初始化行情数据失败:', error)
    // 启动模拟数据作为备选方案
    startMockMarketData()
  }
}

// 模拟行情数据（当真实行情不可用时）
const startMockMarketData = () => {
  console.log('🎭 启动模拟行情数据')

  const updateMockData = () => {
    const basePrice = 3500
    const variation = (Math.random() - 0.5) * 20
    const currentPrice = basePrice + variation

    const mockData: MarketDataInfo = {
      instrument_id: 'rb2509',
      last_price: currentPrice,
      volume: Math.floor(Math.random() * 10000) + 1000,
      turnover: currentPrice * (Math.floor(Math.random() * 10000) + 1000),
      open_interest: Math.floor(Math.random() * 100000) + 50000,
      pre_close_price: basePrice - 10,
      pre_settlement_price: basePrice - 5,
      pre_open_interest: 45000,
      open_price: basePrice + (Math.random() - 0.5) * 10,
      highest_price: currentPrice + Math.random() * 10,
      lowest_price: currentPrice - Math.random() * 10,
      upper_limit_price: basePrice + 200,
      lower_limit_price: basePrice - 200,
      settlement_price: currentPrice,
      currency_id: 'CNY',
      bid_price1: currentPrice - 1,
      bid_volume1: Math.floor(Math.random() * 100) + 10,
      ask_price1: currentPrice + 1,
      ask_volume1: Math.floor(Math.random() * 100) + 10,
      update_time: new Date().toLocaleTimeString(),
      update_millisec: Date.now() % 1000,
      action_day: new Date().toISOString().split('T')[0].replace(/-/g, '')
    }

    marketData.value = mockData
    updatePricesFromMarketData(mockData)
  }

  // 每秒更新一次模拟数据
  setInterval(updateMockData, 1000)
  updateMockData() // 立即更新一次
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

// 根据行情数据更新价格
const updatePricesFromMarketData = (data: MarketDataInfo) => {
  if (!data) return

  // 更新当前价格
  currentPrice.value = data.last_price

  // 更新买盘数据
  if (data.bid_price1 && data.bid_volume1) {
    const bidIndex = buyOrders.value.findIndex((item: OrderData) => Math.abs(item.price - data.bid_price1) < 0.01)
    if (bidIndex !== -1) {
      buyOrders.value[bidIndex].buyVolume = data.bid_volume1
    }
  }

  // 更新卖盘数据
  if (data.ask_price1 && data.ask_volume1) {
    const askIndex = sellOrders.value.findIndex((item: OrderData) => Math.abs(item.price - data.ask_price1) < 0.01)
    if (askIndex !== -1) {
      sellOrders.value[askIndex].sellVolume = data.ask_volume1
    }
  }

  // 更新成交量和持仓量
  totalVolume.value = data.volume
  totalPosition.value = data.open_interest
}

// 组件挂载和卸载时的事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  updateTime() // 组件挂载时开始更新时间

  // 初始化行情数据
  initMarketData()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)

  // 取消订阅行情数据
  ctpService.unsubscribeMarketData(['rb2509']).catch(error => {
    console.error('取消订阅行情失败:', error)
  })
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
}

.price-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr 1fr 1fr;
  border-bottom: 1px solid #ccc;
  font-size: v-bind(fontSize + 'px');
  height: v-bind(cellHeight + 'px');
  line-height: v-bind(cellHeight + 'px');
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

# 动态价格档位生成功能指南

## 功能概述

TradingPanel现在支持根据当前价格动态生成价格档位数据，而不是使用固定的硬编码数据。表格会根据`currentPrice`实时生成上下各27条价格档位数据。

## 核心改进

### 1. 从固定数据到动态生成

**之前的实现**:
```typescript
// 硬编码的固定数据
const sellOrders = ref([
  { price: 3087, buyVolume: 0, sellVolume: 1, level: '16' },
  { price: 3086, buyVolume: 0, sellVolume: 2, level: '15' },
  // ... 更多固定数据
])
```

**现在的实现**:
```typescript
// 动态生成的数据
const sellOrders = ref<OrderData[]>([])
const buyOrders = ref<OrderData[]>([])

// 根据当前价格动态生成
const generatePriceOrders = (centerPrice: number) => {
  // 生成以centerPrice为中心的上下27档数据
}
```

### 2. 配置化的档位设置

```typescript
const PRICE_LEVELS = {
  SELL_LEVELS: 27,  // 卖盘档位数（当前价格之上）
  BUY_LEVELS: 27,   // 买盘档位数（当前价格之下）
  PRICE_STEP: 1     // 价格步长
}
```

## 技术实现

### 1. 动态数据生成算法

```typescript
const generatePriceOrders = (centerPrice: number) => {
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
  
  sellOrders.value = newSellOrders
  buyOrders.value = newBuyOrders
}
```

### 2. 市场数据映射表

```typescript
// 存储真实行情数据的映射表（价格 -> 买卖量）
const marketDataMap = ref<Map<number, { bidVolume: number, askVolume: number }>>(new Map())
```

**用途**:
- 存储每个价格档位的真实买卖量数据
- 在生成档位数据时提供真实的深度信息
- 支持行情数据的增量更新

### 3. 价格变化触发重新生成

```typescript
const updateCurrentPriceAndScroll = (newPrice: number) => {
  const oldPrice = currentPrice.value
  const newPriceRounded = Math.round(newPrice)
  
  currentPrice.value = newPriceRounded
  
  // 如果价格发生变化，重新生成档位数据
  if (Math.abs(oldPrice - currentPrice.value) >= 1) {
    generatePriceOrders(currentPrice.value)
    
    setTimeout(() => {
      scrollToCurrentPrice()
    }, 100)
  }
}
```

## 数据结构

### 档位数据结构
```typescript
interface OrderData {
  price: number      // 价格
  buyVolume: number  // 买量
  sellVolume: number // 卖量
  level: string      // 档位级别
}
```

### 价格范围计算
- **卖盘价格范围**: `currentPrice + 1` 到 `currentPrice + 27`
- **买盘价格范围**: `currentPrice - 1` 到 `currentPrice - 27`
- **总价格跨度**: 54个价格档位

## 使用场景

### 1. 真实行情数据

当接收到CTP行情数据时：
```typescript
const updatePricesFromMarketData = (data: MarketDataInfo) => {
  // 更新市场数据映射表
  if (data.bid_price1 && data.bid_volume1) {
    marketDataMap.value.set(data.bid_price1, {
      bidVolume: data.bid_volume1,
      askVolume: marketDataMap.value.get(data.bid_price1)?.askVolume || 0
    })
  }
  
  // 更新当前价格并重新生成档位数据
  updateCurrentPriceAndScroll(data.last_price)
}
```

### 2. 模拟数据

在模拟模式下：
```typescript
// 清除旧的市场数据
marketDataMap.value.clear()

// 为当前价格附近的档位生成随机深度数据
for (let i = -5; i <= 5; i++) {
  const price = currentPriceValue + i
  const bidVolume = i <= 0 ? Math.floor(Math.random() * 50) + 5 : 0
  const askVolume = i >= 0 ? Math.floor(Math.random() * 50) + 5 : 0
  
  marketDataMap.value.set(price, { bidVolume, askVolume })
}
```

## 优势特点

### 1. 灵活性
- 可以轻松调整档位数量（修改PRICE_LEVELS配置）
- 支持不同的价格步长
- 适应任何价格范围

### 2. 性能优化
- 只生成需要显示的数据
- 避免存储大量无用的固定数据
- 内存使用更高效

### 3. 真实性
- 基于真实的当前价格生成
- 集成真实的市场深度数据
- 支持实时数据更新

### 4. 可维护性
- 代码更简洁，无需维护大量硬编码数据
- 配置化的参数设置
- 易于扩展和修改

## 滚动定位优化

### 智能定位算法
```typescript
// 查找最接近当前价格的行
let minDiff = Infinity
let bestIndex = -1

// 在卖盘和买盘中查找最接近的价格
for (let i = 0; i < sellOrdersLength; i++) {
  const diff = Math.abs(sellOrders.value[i].price - currentPriceValue)
  if (diff < minDiff) {
    minDiff = diff
    bestIndex = i
  }
}
```

### 居中显示
- 当前价格行始终位于表格视窗中心
- 价格变化时平滑滚动到新位置
- 支持大幅价格跳动的快速定位

## 配置选项

### 档位数量配置
```typescript
const PRICE_LEVELS = {
  SELL_LEVELS: 27,  // 可调整为任意数量
  BUY_LEVELS: 27,   // 可调整为任意数量
  PRICE_STEP: 1     // 可调整价格步长
}
```

### 价格步长配置
- **股票**: 0.01
- **期货**: 1
- **外汇**: 0.0001
- **数字货币**: 可变

## 测试验证

### 价格跳动测试
```typescript
// 测试大幅价格变化
updateCurrentPriceAndScroll(3100) // 从3070跳到3100
// 应该重新生成3073-3127的档位数据

// 测试小幅价格变化
updateCurrentPriceAndScroll(3071) // 从3070到3071
// 应该重新生成3044-3098的档位数据
```

### 数据一致性验证
- 检查生成的档位数量是否正确
- 验证价格序列是否连续
- 确认市场深度数据是否正确映射

## 未来扩展

### 计划功能
1. **多合约支持**: 不同合约使用不同的价格步长
2. **自适应档位**: 根据价格波动自动调整档位数量
3. **历史数据缓存**: 缓存历史价格的深度数据
4. **性能监控**: 监控数据生成和更新的性能

---

**总结**: 动态价格档位生成功能使TradingPanel更加灵活和高效，能够适应任何价格范围和市场条件，提供更真实的交易体验。

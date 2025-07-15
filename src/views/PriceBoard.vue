<template>
  <div class="price-board-container">
    <div class="price-board">
      <!-- 价格表格 -->
      <div class="price-table">
        <!-- 卖盘区域 -->
        <div v-for="(item, index) in sellData" :key="`sell-${index}`" class="price-row sell-row">
          <div 
            class="col-1 clickable" 
            @click="handleClick('sell', 'volume', item.price, index)"
            :class="{ active: isActive('sell', 'volume', index) }"
          >
            {{ item.volume || '' }}
          </div>
          <div 
            class="col-2 clickable price-cell" 
            @click="handleClick('sell', 'price', item.price, index)"
            :class="{ active: isActive('sell', 'price', index) }"
          >
            {{ item.price }}
          </div>
          <div class="col-3 level-cell">{{ index + 1 }}</div>
          <div class="col-4 disabled"></div>
          <div class="col-5 disabled"></div>
        </div>

        <!-- 当前价格分隔线 -->
        <div class="current-price-separator">
          <div class="separator-line"></div>
          <div class="current-price">{{ currentPrice }}</div>
          <div class="separator-line"></div>
        </div>

        <!-- 买盘区域 -->
        <div v-for="(item, index) in buyData" :key="`buy-${index}`" class="price-row buy-row">
          <div class="col-1 disabled"></div>
          <div class="col-2 disabled"></div>
          <div class="col-3 level-cell">{{ index + 1 }}</div>
          <div 
            class="col-4 clickable price-cell" 
            @click="handleClick('buy', 'price', item.price, index)"
            :class="{ active: isActive('buy', 'price', index) }"
          >
            {{ item.price }}
          </div>
          <div 
            class="col-5 clickable" 
            @click="handleClick('buy', 'volume', item.price, index)"
            :class="{ active: isActive('buy', 'volume', index) }"
          >
            {{ item.volume || '' }}
          </div>
        </div>
      </div>

      <!-- 状态栏 -->
      <div class="status-bar">
        <span v-if="selectedInfo">
          已选择: {{ selectedInfo }}
        </span>
        <span v-else>
          点击价格或数量进行操作
        </span>
        <span>点击: {{ clickCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface PriceData {
  price: number
  volume: number
}

interface SelectedState {
  type: 'sell' | 'buy'
  field: 'price' | 'volume'
  index: number
}

// 响应式数据
const selectedState = ref<SelectedState | null>(null)
const clickCount = ref(0)
const currentPrice = ref(1599)
const selectedInfo = ref('')

// 卖盘数据 (从高到低)
const sellData = ref<PriceData[]>([
  { price: 1605, volume: 0 },
  { price: 1604, volume: 0 },
  { price: 1603, volume: 0 },
  { price: 1602, volume: 0 },
  { price: 1601, volume: 0 },
  { price: 1600, volume: 0 },
])

// 买盘数据 (从高到低)
const buyData = ref<PriceData[]>([
  { price: 1598, volume: 0 },
  { price: 1597, volume: 0 },
  { price: 1596, volume: 0 },
  { price: 1595, volume: 0 },
  { price: 1594, volume: 0 },
  { price: 1593, volume: 0 },
  { price: 1592, volume: 0 },
  { price: 1591, volume: 0 },
  { price: 1590, volume: 0 },
  { price: 1589, volume: 0 },
  { price: 1588, volume: 0 },
  { price: 1587, volume: 0 },
  { price: 1586, volume: 0 },
  { price: 1585, volume: 0 },
  { price: 1584, volume: 0 },
  { price: 1583, volume: 0 },
  { price: 1582, volume: 0 },
  { price: 1581, volume: 0 },
  { price: 1580, volume: 0 },
  { price: 1579, volume: 0 },
  { price: 1578, volume: 0 },
  { price: 1577, volume: 0 },
  { price: 1576, volume: 0 },
  { price: 1575, volume: 0 },
  { price: 1574, volume: 0 },
  { price: 1573, volume: 0 },
  { price: 1572, volume: 0 },
  { price: 1571, volume: 0 },
  { price: 1570, volume: 0 },
  { price: 1569, volume: 0 },
  { price: 1568, volume: 0 },
  { price: 1567, volume: 0 },
  { price: 1566, volume: 0 },
  { price: 1565, volume: 0 },
  { price: 1564, volume: 0 },
  { price: 1563, volume: 0 },
  { price: 1562, volume: 0 },
  { price: 1561, volume: 0 },
  { price: 1560, volume: 0 },
])

// 处理点击事件
const handleClick = (type: 'sell' | 'buy', field: 'price' | 'volume', price: number, index: number) => {
  clickCount.value++
  
  selectedState.value = { type, field, index }
  
  const typeText = type === 'sell' ? '卖' : '买'
  const fieldText = field === 'price' ? '价' : '量'
  selectedInfo.value = `${typeText}${fieldText} ${price} (档位${index + 1})`
  
  console.log(`点击了 ${typeText}${fieldText}: ${price}, 档位: ${index + 1}`)
}

// 检查是否为激活状态
const isActive = (type: 'sell' | 'buy', field: 'price' | 'volume', index: number): boolean => {
  if (!selectedState.value) return false
  return selectedState.value.type === type && 
         selectedState.value.field === field && 
         selectedState.value.index === index
}
</script>

<style scoped>
.price-board-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.price-board {
  width: 300px;
  border: 2px solid #000;
  background: #f0f0f0;
  font-family: 'Courier New', monospace;
}

.price-table {
  background: white;
  height: 600px;
  overflow-y: auto;
}

.price-row {
  display: grid;
  grid-template-columns: 50px 50px 25px 50px 50px;
  height: 14px;
  border-bottom: 1px solid #ccc;
  font-size: 10px;
}

.price-row > div {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ccc;
  padding: 0 2px;
}

.price-row > div:last-child {
  border-right: none;
}

/* 卖盘样式 */
.sell-row {
  background: #ffeeee;
}

.sell-row .price-cell {
  background: #ffcccc;
  font-weight: bold;
}

/* 买盘样式 */
.buy-row {
  background: #eeffee;
}

.buy-row .price-cell {
  background: #ccffcc;
  font-weight: bold;
}

/* 档位列样式 */
.level-cell {
  background: #e0e0e0;
  font-size: 8px;
  color: #666;
}

/* 当前价格分隔线 */
.current-price-separator {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 20px;
  background: #ffffcc;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
}

.separator-line {
  height: 1px;
  background: #000;
  margin: 0 5px;
}

.current-price {
  font-weight: bold;
  font-size: 12px;
  color: #000;
  padding: 0 10px;
}

/* 可点击元素样式 */
.clickable {
  cursor: pointer;
  transition: all 0.1s ease;
}

.clickable:hover {
  background: #0066ff !important;
  color: white !important;
  border: 1px solid #0044cc;
  z-index: 10;
  position: relative;
}

.clickable.active {
  background: #006600 !important;
  color: white !important;
  font-weight: bold;
  border: 1px solid #004400;
  z-index: 10;
  position: relative;
}

.disabled {
  background: #f8f8f8 !important;
  color: #ccc;
}

/* 状态栏 */
.status-bar {
  padding: 5px 10px;
  background: #d0d0d0;
  border-top: 1px solid #000;
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  font-family: 'Courier New', monospace;
}

/* 滚动条样式 */
.price-table::-webkit-scrollbar {
  width: 8px;
}

.price-table::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.price-table::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.price-table::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

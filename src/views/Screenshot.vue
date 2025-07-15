<template>
  <div class="screenshot-container">
    <div class="header">
      <h2>截图功能</h2>
      <div class="controls">
        <button @click="captureScreen" class="capture-btn" :disabled="isCapturing">
          {{ isCapturing ? '截图中...' : '截图' }}
        </button>
        <button @click="captureArea" class="capture-area-btn" :disabled="isCapturing">
          区域截图
        </button>
        <button @click="clearScreenshots" class="clear-btn">
          清空截图
        </button>
      </div>
    </div>

    <!-- 交易界面模拟 -->
    <div class="trading-interface" ref="tradingInterface">
      <div class="trading-panel">
        <div class="info-section">
          <div class="info-row">
            <span class="label">合约名称</span>
            <span class="value">bu2508</span>
          </div>
          <div class="info-row">
            <span class="label">页面缓存时间</span>
            <span class="value">16 - 15:06:02</span>
          </div>
          <div class="info-row">
            <span class="label">涨跌比</span>
            <span class="value negative">-0.22%</span>
          </div>
          <div class="info-row">
            <span class="label">交易量</span>
            <span class="value">13029</span>
          </div>
          <div class="info-row">
            <span class="label">持仓量</span>
            <span class="value">27849</span>
          </div>
          <div class="info-row">
            <span class="label">增减仓量</span>
            <span class="value">-1275</span>
          </div>
        </div>

        <div class="order-section">
          <div class="order-row">
            <span class="label">买入后持空单数量</span>
            <span class="value red-bg">0</span>
          </div>
          <div class="order-row">
            <span class="label">买入后持多单数量</span>
            <span class="value blue-bg">0</span>
          </div>
          <div class="order-row">
            <span class="label">最标左键下单数量</span>
            <span class="value">2</span>
          </div>
          <div class="order-row">
            <span class="label">最标右键下单数量</span>
            <span class="value">25</span>
          </div>
        </div>

        <div class="mode-section">
          <div class="mode-group">
            <span class="label">A模式多点位主单</span>
            <input type="radio" name="mode" value="A" checked>
            <label>Order(A)</label>
          </div>
          <div class="mode-group">
            <span class="label">B模式多点位主单</span>
            <input type="radio" name="mode" value="B">
            <label>Order(B)</label>
          </div>
        </div>

        <div class="limit-section">
          <div class="limit-group">
            <input type="checkbox" id="oneKey">
            <label for="oneKey">一键撤单</label>
          </div>
          <div class="limit-options">
            <input type="radio" name="limit" value="345" checked>
            <label>CLimit 345</label>
            <input type="radio" name="limit" value="650">
            <label>CLimit 650</label>
            <input type="radio" name="limit" value="noLimit">
            <label>No Limit</label>
          </div>
        </div>

        <div class="price-display">
          <div class="price-info">
            <div class="price-label">张跌停价位</div>
            <div class="price-value">3975</div>
            <div class="price-label">涨停价位</div>
            <div class="price-value">3318</div>
            <div class="price-summary">C: 50 T: 94</div>
          </div>
          <div class="position-info">
            <div class="position-label">买入后持仓数量</div>
            <div class="position-value">0</div>
            <div class="position-indicator">P</div>
          </div>
        </div>
      </div>

      <!-- 价格列表 -->
      <div class="price-list">
        <div v-for="price in priceData" :key="price.value" 
             :class="['price-item', price.type]">
          {{ price.value }}
        </div>
      </div>
    </div>

    <!-- 截图预览区域 -->
    <div class="screenshots-preview" v-if="screenshots.length > 0">
      <h3>截图预览</h3>
      <div class="screenshots-grid">
        <div v-for="(screenshot, index) in screenshots" :key="index" class="screenshot-item">
          <img :src="screenshot.dataUrl" :alt="`截图 ${index + 1}`" />
          <div class="screenshot-info">
            <span>{{ screenshot.timestamp }}</span>
            <button @click="downloadScreenshot(screenshot)" class="download-btn">
              下载
            </button>
            <button @click="removeScreenshot(index)" class="remove-btn">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Screenshot {
  dataUrl: string
  timestamp: string
  filename: string
}

const isCapturing = ref(false)
const screenshots = ref<Screenshot[]>([])
const tradingInterface = ref<HTMLElement>()

// 模拟价格数据
const priceData = ref([
  { value: '1605', type: 'sell' },
  { value: '1604', type: 'sell' },
  { value: '1603', type: 'sell' },
  { value: '1602', type: 'sell' },
  { value: '1601', type: 'sell' },
  { value: '1600', type: 'sell' },
  { value: '1599', type: 'current' },
  { value: '1598', type: 'buy' },
  { value: '1597', type: 'buy' },
  { value: '1596', type: 'buy' },
  { value: '1595', type: 'buy' },
  { value: '1594', type: 'buy' },
])

// 全屏截图
const captureScreen = async () => {
  try {
    isCapturing.value = true

    // 动态导入 html2canvas
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      backgroundColor: '#ffffff',
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: 0,
      scrollY: 0
    })

    const dataUrl = canvas.toDataURL('image/png', 0.9)
    const timestamp = new Date().toLocaleString()
    const filename = `screenshot_${Date.now()}.png`

    screenshots.value.push({
      dataUrl,
      timestamp,
      filename
    })

    // 显示成功提示
    alert('截图成功！')

  } catch (error) {
    console.error('截图失败:', error)
    alert('截图失败: ' + error.message)
  } finally {
    isCapturing.value = false
  }
}

// 区域截图（截取交易界面）
const captureArea = async () => {
  if (!tradingInterface.value) return

  try {
    isCapturing.value = true

    // 动态导入 html2canvas
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(tradingInterface.value, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      backgroundColor: '#ffffff',
      logging: false
    })

    const dataUrl = canvas.toDataURL('image/png', 0.9)
    const timestamp = new Date().toLocaleString()
    const filename = `area_screenshot_${Date.now()}.png`

    screenshots.value.push({
      dataUrl,
      timestamp,
      filename
    })

    // 显示成功提示
    alert('区域截图成功！')

  } catch (error) {
    console.error('区域截图失败:', error)
    alert('区域截图失败: ' + error.message)
  } finally {
    isCapturing.value = false
  }
}

// 下载截图
const downloadScreenshot = (screenshot: Screenshot) => {
  const link = document.createElement('a')
  link.download = screenshot.filename
  link.href = screenshot.dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 删除截图
const removeScreenshot = (index: number) => {
  screenshots.value.splice(index, 1)
}

// 清空所有截图
const clearScreenshots = () => {
  screenshots.value = []
}

onMounted(() => {
  console.log('截图组件已加载')
})
</script>

<style scoped>
.screenshot-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.controls {
  display: flex;
  gap: 10px;
}

.capture-btn, .capture-area-btn, .clear-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.capture-btn {
  background: #007bff;
  color: white;
}

.capture-btn:hover:not(:disabled) {
  background: #0056b3;
}

.capture-area-btn {
  background: #28a745;
  color: white;
}

.capture-area-btn:hover:not(:disabled) {
  background: #1e7e34;
}

.clear-btn {
  background: #dc3545;
  color: white;
}

.clear-btn:hover {
  background: #c82333;
}

.capture-btn:disabled, .capture-area-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 交易界面样式 */
.trading-interface {
  display: flex;
  border: 2px solid #333;
  background: #f0f0f0;
  margin-bottom: 30px;
}

.trading-panel {
  flex: 1;
  padding: 15px;
  background: white;
}

.info-section, .order-section, .mode-section, .limit-section {
  margin-bottom: 15px;
}

.info-row, .order-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  border-bottom: 1px solid #eee;
}

.label {
  font-size: 12px;
  color: #333;
}

.value {
  font-size: 12px;
  font-weight: bold;
}

.negative {
  color: #dc3545;
}

.red-bg {
  background: #ff4444;
  color: white;
  padding: 2px 8px;
  border-radius: 2px;
}

.blue-bg {
  background: #4444ff;
  color: white;
  padding: 2px 8px;
  border-radius: 2px;
}

.mode-group, .limit-group {
  margin: 8px 0;
  font-size: 12px;
}

.limit-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
}

.price-display {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.price-info, .position-info {
  text-align: center;
  font-size: 11px;
}

.price-value, .position-value {
  font-size: 16px;
  font-weight: bold;
  margin: 5px 0;
}

.position-indicator {
  font-size: 24px;
  color: #666;
  margin-top: 10px;
}

/* 价格列表样式 */
.price-list {
  width: 80px;
  background: #333;
  display: flex;
  flex-direction: column;
}

.price-item {
  padding: 3px 8px;
  font-size: 11px;
  text-align: center;
  color: white;
}

.price-item.sell {
  background: #ff6b6b;
}

.price-item.buy {
  background: #51cf66;
}

.price-item.current {
  background: #ffd43b;
  color: #333;
  font-weight: bold;
}

/* 截图预览样式 */
.screenshots-preview {
  margin-top: 30px;
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.screenshot-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.screenshot-item img {
  width: 100%;
  height: 200px;
  object-fit: contain;
  background: #f8f9fa;
}

.screenshot-info {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.download-btn, .remove-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}

.download-btn {
  background: #007bff;
  color: white;
  margin-right: 5px;
}

.remove-btn {
  background: #dc3545;
  color: white;
}
</style>

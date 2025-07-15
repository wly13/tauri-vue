<template>
  <div class="ctp-container">
    <h1>CTP 期货交易接口</h1>
    
    <!-- 环境检查 -->
    <div class="section">
      <h2>环境检查</h2>
      <p>Tauri 环境: <span :class="isTauriEnv ? 'success' : 'error'">{{ isTauriEnv ? '正常' : '未检测到' }}</span></p>
      <p v-if="!isTauriEnv" class="error">请在 Tauri 应用中运行，而不是在浏览器中直接访问</p>
    </div>

    <!-- API 版本信息 -->
    <div class="section">
      <h2>API 信息</h2>
      <button @click="getApiVersion" :disabled="loading || !isTauriEnv">获取 API 版本</button>
      <p v-if="apiVersion">API 版本: {{ apiVersion }}</p>
    </div>

    <!-- 账户配置 -->
    <div class="section">
      <h2>账户配置</h2>
      <form @submit.prevent="saveConfig">
        <div class="form-group">
          <label>经纪商ID:</label>
          <input v-model="config.broker_id" type="text" placeholder="9999" />
        </div>
        <div class="form-group">
          <label>账户:</label>
          <input v-model="config.account" type="text" placeholder="账户名" />
        </div>
        <div class="form-group">
          <label>密码:</label>
          <input v-model="config.password" type="password" placeholder="密码" />
        </div>
        <div class="form-group">
          <label>交易前置:</label>
          <input v-model="config.trade_front" type="text" placeholder="tcp://180.168.146.187:10201" />
        </div>
        <div class="form-group">
          <label>行情前置:</label>
          <input v-model="config.md_front" type="text" placeholder="tcp://180.168.146.187:10211" />
        </div>
        <div class="form-group">
          <label>授权码:</label>
          <input v-model="config.auth_code" type="text" placeholder="0000000000000000" />
        </div>
        <div class="form-group">
          <label>产品信息:</label>
          <input v-model="config.user_product_info" type="text" placeholder="产品信息" />
        </div>
        <div class="form-group">
          <label>应用ID:</label>
          <input v-model="config.app_id" type="text" placeholder="simnow_client_test" />
        </div>
        <button type="submit" :disabled="loading">保存配置</button>
      </form>
    </div>

    <!-- 行情API操作 -->
    <div class="section">
      <h2>行情 API</h2>
      <div class="button-group">
        <button @click="createMdApi" :disabled="loading">创建行情API</button>
        <button @click="mdLogin" :disabled="loading || mdStatus === ConnectionStatus.Disconnected">行情登录</button>
      </div>
      <p>行情状态: <span :class="['status', mdStatus]">{{ mdStatus }}</span></p>
      
      <div class="form-group">
        <label>订阅合约 (逗号分隔):</label>
        <input v-model="subscribeInstruments" type="text" placeholder="rb2501,hc2501" />
        <button @click="subscribeMarketData" :disabled="loading || mdStatus !== ConnectionStatus.LoginSuccess">订阅行情</button>
        <button @click="unsubscribeMarketData" :disabled="loading || mdStatus !== ConnectionStatus.LoginSuccess">取消订阅</button>
      </div>
    </div>

    <!-- 交易API操作 -->
    <div class="section">
      <h2>交易 API</h2>
      <div class="button-group">
        <button @click="createTraderApi" :disabled="loading">创建交易API</button>
        <button @click="traderLogin" :disabled="loading || traderStatus === ConnectionStatus.Disconnected">交易登录</button>
      </div>
      <p>交易状态: <span :class="['status', traderStatus]">{{ traderStatus }}</span></p>
      
      <!-- 下单表单 -->
      <div class="order-form">
        <h3>下单</h3>
        <div class="form-group">
          <label>合约代码:</label>
          <input v-model="orderForm.instrument_id" type="text" placeholder="rb2501" />
        </div>
        <div class="form-group">
          <label>方向:</label>
          <select v-model="orderForm.direction">
            <option value="0">买入</option>
            <option value="1">卖出</option>
          </select>
        </div>
        <div class="form-group">
          <label>价格:</label>
          <input v-model.number="orderForm.price" type="number" step="0.01" placeholder="3500.00" />
        </div>
        <div class="form-group">
          <label>数量:</label>
          <input v-model.number="orderForm.volume" type="number" placeholder="1" />
        </div>
        <button @click="insertOrder" :disabled="loading || traderStatus !== ConnectionStatus.LoginSuccess">下单</button>
      </div>
    </div>

    <!-- 操作日志 -->
    <div class="section">
      <h2>操作日志</h2>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.level]">
          <span class="timestamp">{{ new Date(log.timestamp).toLocaleTimeString() }}</span>
          <span class="level">[{{ log.level.toUpperCase() }}]</span>
          <span class="message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ctpService } from '../services/ctpService'
import type { CtpAccountConfig, LogEntry } from '../types/ctp'
import { ConnectionStatus } from '../types/ctp'

// 响应式数据
const loading = ref(false)
const apiVersion = ref('')
const mdStatus = ref<ConnectionStatus>(ConnectionStatus.Disconnected)
const traderStatus = ref<ConnectionStatus>(ConnectionStatus.Disconnected)
const subscribeInstruments = ref('rb2501,hc2501')
const isTauriEnv = ref(false)

// 配置信息
const config = reactive<CtpAccountConfig>({
  broker_id: '9999',
  account: '',
  password: '',
  trade_front: 'tcp://180.168.146.187:10201',
  md_front: 'tcp://180.168.146.187:10211',
  auth_code: '0000000000000000',
  user_product_info: '',
  app_id: 'simnow_client_test'
})

// 下单表单
const orderForm = reactive({
  instrument_id: 'rb2501',
  direction: '0',
  price: 3500.00,
  volume: 1,
  order_type: '1'
})

// 日志
const logs = ref<LogEntry[]>([])

// 生命周期钩子
onMounted(() => {
  // 检查 Tauri 环境
  isTauriEnv.value = typeof window !== 'undefined' &&
                     typeof (window as any).__TAURI__ !== 'undefined'

  // 监听服务事件
  ctpService.on('log', (logEntry: LogEntry) => {
    logs.value.unshift(logEntry)
    if (logs.value.length > 100) {
      logs.value.pop()
    }
  })

  ctpService.on('md_status_change', (status: ConnectionStatus) => {
    mdStatus.value = status
  })

  ctpService.on('trader_status_change', (status: ConnectionStatus) => {
    traderStatus.value = status
  })

  // 初始化状态
  mdStatus.value = ctpService.getMdStatus()
  traderStatus.value = ctpService.getTraderStatus()
  logs.value = ctpService.getLogs()
})

onUnmounted(() => {
  // 清理事件监听器
  ctpService.off('log', () => {})
  ctpService.off('md_status_change', () => {})
  ctpService.off('trader_status_change', () => {})
})

// API 方法
const getApiVersion = async () => {
  loading.value = true
  try {
    const result = await ctpService.getApiVersion()
    if (result.success && result.data) {
      apiVersion.value = result.data
    }
  } finally {
    loading.value = false
  }
}

const createMdApi = async () => {
  loading.value = true
  try {
    const flowPath = `./cache/md_${config.broker_id}_${config.account}/`
    await ctpService.createMdApi(flowPath)
  } finally {
    loading.value = false
  }
}

const createTraderApi = async () => {
  loading.value = true
  try {
    const flowPath = `./cache/trader_${config.broker_id}_${config.account}/`
    await ctpService.createTraderApi(flowPath)
  } finally {
    loading.value = false
  }
}

const mdLogin = async () => {
  loading.value = true
  try {
    await ctpService.mdLogin(config)
  } finally {
    loading.value = false
  }
}

const traderLogin = async () => {
  loading.value = true
  try {
    await ctpService.traderLogin(config)
  } finally {
    loading.value = false
  }
}

const subscribeMarketData = async () => {
  loading.value = true
  try {
    const instrumentIds = subscribeInstruments.value.split(',').map(s => s.trim()).filter(s => s)
    await ctpService.subscribeMarketData(instrumentIds)
  } finally {
    loading.value = false
  }
}

const unsubscribeMarketData = async () => {
  loading.value = true
  try {
    const instrumentIds = subscribeInstruments.value.split(',').map(s => s.trim()).filter(s => s)
    await ctpService.unsubscribeMarketData(instrumentIds)
  } finally {
    loading.value = false
  }
}

const insertOrder = async () => {
  loading.value = true
  try {
    await ctpService.insertOrder(orderForm)
  } finally {
    loading.value = false
  }
}

const saveConfig = () => {
  // 这里可以添加保存配置到本地存储的逻辑
  console.log('配置已保存', config)
}
</script>

<style scoped>
.ctp-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: inline-block;
  width: 120px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 300px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button-group {
  margin-bottom: 15px;
}

.button-group button {
  margin-right: 10px;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

.order-form {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
}

.log-item {
  padding: 8px;
  border-bottom: 1px solid #eee;
  font-family: monospace;
  font-size: 12px;
}

.log-item.info {
  color: #333;
}

.log-item.warning {
  color: #ffc107;
}

.log-item.error {
  color: #dc3545;
}

.log-item.debug {
  color: #6c757d;
}

.timestamp {
  color: #666;
  margin-right: 10px;
}

.level {
  font-weight: bold;
  margin-right: 10px;
  min-width: 60px;
  display: inline-block;
}

.status {
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status.disconnected {
  background: #dc3545;
  color: white;
}

.status.connecting {
  background: #ffc107;
  color: black;
}

.status.connected {
  background: #17a2b8;
  color: white;
}

.status.login_success {
  background: #28a745;
  color: white;
}

.status.login_failed {
  background: #dc3545;
  color: white;
}

.status.error {
  background: #dc3545;
  color: white;
}
</style>

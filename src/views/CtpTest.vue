<template>
  <div class="ctp-test-container">
    <div class="test-panel">
      <h2>CTP连接测试</h2>
      
      <!-- 连接状态 -->
      <div class="status-section">
        <h3>连接状态</h3>
        <div class="status-item">
          <span>行情API状态:</span>
          <span :class="['status', mdStatus]">{{ mdStatusText }}</span>
        </div>
        <div class="status-item">
          <span>交易API状态:</span>
          <span :class="['status', traderStatus]">{{ traderStatusText }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <h3>操作</h3>
        <div class="button-group">
          <button @click="testConnection" :disabled="testing">
            {{ testing ? '测试中...' : '测试连接' }}
          </button>
          <button @click="runQuickTest" :disabled="testing">
            {{ testing ? '测试中...' : '快速测试' }}
          </button>
          <button @click="subscribeMarketData" :disabled="!canSubscribe">
            订阅rb2509行情
          </button>
          <button @click="clearLogs">清除日志</button>
        </div>
      </div>

      <!-- 行情数据 -->
      <div class="market-data-section" v-if="marketData">
        <h3>行情数据 (rb2509)</h3>
        <div class="market-data">
          <div class="data-item">
            <span>最新价:</span>
            <span>{{ marketData.last_price }}</span>
          </div>
          <div class="data-item">
            <span>成交量:</span>
            <span>{{ marketData.volume }}</span>
          </div>
          <div class="data-item">
            <span>持仓量:</span>
            <span>{{ marketData.open_interest }}</span>
          </div>
          <div class="data-item">
            <span>买一价:</span>
            <span>{{ marketData.bid_price1 }}</span>
          </div>
          <div class="data-item">
            <span>买一量:</span>
            <span>{{ marketData.bid_volume1 }}</span>
          </div>
          <div class="data-item">
            <span>卖一价:</span>
            <span>{{ marketData.ask_price1 }}</span>
          </div>
          <div class="data-item">
            <span>卖一量:</span>
            <span>{{ marketData.ask_volume1 }}</span>
          </div>
        </div>
      </div>

      <!-- 日志 -->
      <div class="log-section">
        <h3>日志</h3>
        <div class="log-container">
          <div 
            v-for="log in logs" 
            :key="log.timestamp"
            :class="['log-item', log.level]"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-level">[{{ log.level.toUpperCase() }}]</span>
            <span class="log-message">{{ log.message }}</span>
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
import { ConnectionStatus, LogEntry, MarketDataInfo } from '../types/ctp'
import { CtpTestHelper, TestResult } from '../utils/ctpTestHelper'

const ctpService = new CtpService()

const mdStatus = ref<ConnectionStatus>('disconnected' as ConnectionStatus)
const traderStatus = ref<ConnectionStatus>('disconnected' as ConnectionStatus)
const testing = ref(false)
const logs = ref<LogEntry[]>([])
const marketData = ref<MarketDataInfo | null>(null)

const mdStatusText = computed(() => {
  const statusMap = {
    'disconnected': '未连接',
    'connecting': '连接中',
    'connected': '已连接',
    'login_success': '登录成功',
    'login_failed': '登录失败',
    'error': '错误'
  }
  return statusMap[mdStatus.value] || mdStatus.value
})

const traderStatusText = computed(() => {
  const statusMap = {
    'disconnected': '未连接',
    'connecting': '连接中',
    'connected': '已连接',
    'login_success': '登录成功',
    'login_failed': '登录失败',
    'error': '错误'
  }
  return statusMap[traderStatus.value] || traderStatus.value
})

const canSubscribe = computed(() => {
  return mdStatus.value === 'login_success'
})

const testConnection = async () => {
  testing.value = true
  try {
    // 获取默认配置
    const config = UserStorageService.getDefaultConfig()

    // 创建行情API
    const mdResult = await ctpService.createMdApi()
    if (mdResult.success) {
      addLog('创建行情API成功', 'info')
    } else {
      addLog(`创建行情API失败: ${mdResult.error}`, 'error')
      return
    }

    // 创建交易API
    const traderResult = await ctpService.createTraderApi()
    if (traderResult.success) {
      addLog('创建交易API成功', 'info')
    } else {
      addLog(`创建交易API失败: ${traderResult.error}`, 'error')
      return
    }

    // 行情登录
    const mdLoginResult = await ctpService.mdLogin(config)
    if (mdLoginResult.success) {
      addLog('行情登录成功', 'info')
    } else {
      addLog(`行情登录失败: ${mdLoginResult.error}`, 'error')
    }

    // 交易登录
    const traderLoginResult = await ctpService.traderLogin(config)
    if (traderLoginResult.success) {
      addLog('交易登录成功', 'info')
    } else {
      addLog(`交易登录失败: ${traderLoginResult.error}`, 'error')
    }

  } catch (error) {
    addLog(`测试连接异常: ${error}`, 'error')
  } finally {
    testing.value = false
  }
}

const runQuickTest = async () => {
  testing.value = true
  try {
    addLog('开始快速测试...', 'info')

    const testHelper = new CtpTestHelper()
    const results = await testHelper.runFullTest()
    const summary = testHelper.getTestSummary()

    addLog(`测试完成: 总计${summary.total}, 通过${summary.passed}, 失败${summary.failed}, 通过率${summary.passRate}`, 'info')

    // 显示详细结果
    results.forEach((result: TestResult) => {
      const level = result.success ? 'info' : 'error'
      const duration = result.duration ? ` (${result.duration}ms)` : ''
      addLog(`${result.success ? '✓' : '✗'} ${result.message}${duration}`, level)
    })

    const failedTests = testHelper.getFailedTests()
    if (failedTests.length > 0) {
      addLog(`发现${failedTests.length}个失败的测试，请检查详细日志`, 'warning')
    }

  } catch (error) {
    addLog(`快速测试异常: ${error}`, 'error')
  } finally {
    testing.value = false
  }
}

const subscribeMarketData = async () => {
  try {
    const result = await ctpService.subscribeMarketData(['rb2509'])
    if (result.success) {
      addLog('订阅rb2509行情成功', 'info')
    } else {
      addLog(`订阅行情失败: ${result.error}`, 'error')
    }
  } catch (error) {
    addLog(`订阅行情异常: ${error}`, 'error')
  }
}

const addLog = (message: string, level: string) => {
  const log: LogEntry = {
    timestamp: new Date().toISOString(),
    level: level as any,
    message
  }
  logs.value.unshift(log)
  if (logs.value.length > 100) {
    logs.value.pop()
  }
}

const clearLogs = () => {
  logs.value = []
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

onMounted(() => {
  // 监听状态变化
  ctpService.on('md_status_change', (status: ConnectionStatus) => {
    mdStatus.value = status
  })
  
  ctpService.on('trader_status_change', (status: ConnectionStatus) => {
    traderStatus.value = status
  })
  
  ctpService.on('log', (log: LogEntry) => {
    logs.value.unshift(log)
    if (logs.value.length > 100) {
      logs.value.pop()
    }
  })
  
  ctpService.on('market_data', (data: MarketDataInfo) => {
    if (data.instrument_id === 'rb2509') {
      marketData.value = data
      addLog(`收到rb2509行情: 价格=${data.last_price}, 成交量=${data.volume}`, 'info')
    }
  })
})

onUnmounted(() => {
  // 清理事件监听器
  ctpService.off('md_status_change', () => {})
  ctpService.off('trader_status_change', () => {})
  ctpService.off('log', () => {})
  ctpService.off('market_data', () => {})
})
</script>

<style scoped>
.ctp-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-panel {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-panel h2 {
  margin-top: 0;
  color: #333;
}

.test-panel h3 {
  color: #666;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.status-section, .action-section, .market-data-section, .log-section {
  margin-bottom: 30px;
}

.status-item, .data-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status.disconnected { background: #f5f5f5; color: #999; }
.status.connecting { background: #fff7e6; color: #fa8c16; }
.status.connected { background: #f6ffed; color: #52c41a; }
.status.login_success { background: #f6ffed; color: #52c41a; }
.status.login_failed { background: #fff2f0; color: #ff4d4f; }
.status.error { background: #fff2f0; color: #ff4d4f; }

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.button-group button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.button-group button:hover:not(:disabled) {
  border-color: #40a9ff;
  color: #40a9ff;
}

.button-group button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.market-data {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 10px;
  background: #fafafa;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-time {
  color: #999;
  min-width: 80px;
}

.log-level {
  min-width: 60px;
  font-weight: bold;
}

.log-level.info { color: #1890ff; }
.log-level.warning { color: #fa8c16; }
.log-level.error { color: #ff4d4f; }
.log-level.debug { color: #999; }

.log-message {
  flex: 1;
}
</style>

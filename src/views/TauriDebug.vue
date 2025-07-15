<template>
  <div class="tauri-debug">
    <h1>Tauri 2.0 环境调试</h1>
    
    <div class="debug-section">
      <h2>环境检测结果</h2>
      <div class="status-grid">
        <div class="status-item">
          <label>Tauri 环境:</label>
          <span :class="status.isTauri ? 'success' : 'error'">
            {{ status.isTauri ? '✓ 检测到' : '✗ 未检测到' }}
          </span>
        </div>
        <div class="status-item">
          <label>window.__TAURI__:</label>
          <span :class="status.hasWindowTauri ? 'success' : 'warning'">
            {{ status.hasWindowTauri ? '✓ 存在' : '✗ 不存在 (正常)' }}
          </span>
        </div>
        <div class="status-item">
          <label>API 导入:</label>
          <span :class="status.canImportApi ? 'success' : 'error'">
            {{ status.canImportApi ? '✓ 成功' : '✗ 失败' }}
          </span>
        </div>
        <div class="status-item">
          <label>命令调用:</label>
          <span :class="status.canInvoke ? 'success' : 'error'">
            {{ status.canInvoke ? '✓ 成功' : '✗ 失败' }}
          </span>
        </div>
      </div>
    </div>

    <div class="debug-section">
      <h2>API 测试</h2>
      <div class="button-group">
        <button @click="testApiVersion" :disabled="loading">测试 API 版本</button>
        <button @click="testFileRead" :disabled="loading">测试文件读取</button>
        <button @click="testAppInfo" :disabled="loading">测试应用信息</button>
      </div>
      
      <div v-if="testResult" class="test-result">
        <h3>测试结果:</h3>
        <pre>{{ testResult }}</pre>
      </div>
    </div>

    <div class="debug-section">
      <h2>详细调试信息</h2>
      <pre class="debug-info">{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(false)
const testResult = ref('')
const debugInfo = ref('')

const status = ref({
  isTauri: false,
  hasWindowTauri: false,
  canImportApi: false,
  canInvoke: false
})

// 检测环境
const detectEnvironment = async () => {
  const info: any = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    location: window.location.href,
    windowTauri: typeof (window as any).__TAURI__,
  }

  // 检查 window.__TAURI__
  status.value.hasWindowTauri = typeof (window as any).__TAURI__ !== 'undefined'
  if (status.value.hasWindowTauri) {
    info.windowTauriContent = Object.keys((window as any).__TAURI__ || {})
  }

  // 尝试导入 API
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    status.value.canImportApi = true
    info.apiImport = 'success'
    
    // 尝试调用命令
    try {
      const result = await invoke('get_api_version')
      status.value.canInvoke = true
      status.value.isTauri = true
      info.invokeTest = { success: true, result }
    } catch (invokeError) {
      info.invokeTest = { 
        success: false, 
        error: invokeError instanceof Error ? invokeError.message : String(invokeError) 
      }
    }
  } catch (importError) {
    info.apiImport = { 
      success: false, 
      error: importError instanceof Error ? importError.message : String(importError) 
    }
  }

  debugInfo.value = JSON.stringify(info, null, 2)
}

// 测试 API 版本
const testApiVersion = async () => {
  loading.value = true
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const result = await invoke('get_api_version')
    testResult.value = `API 版本测试成功:\n${JSON.stringify(result, null, 2)}`
  } catch (error) {
    testResult.value = `API 版本测试失败:\n${error instanceof Error ? error.message : String(error)}`
  } finally {
    loading.value = false
  }
}

// 测试文件读取
const testFileRead = async () => {
  loading.value = true
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const result = await invoke('read_file', { path: 'test.txt' })
    testResult.value = `文件读取测试成功:\n${JSON.stringify(result, null, 2)}`
  } catch (error) {
    testResult.value = `文件读取测试失败:\n${error instanceof Error ? error.message : String(error)}`
  } finally {
    loading.value = false
  }
}

// 测试应用信息
const testAppInfo = async () => {
  loading.value = true
  try {
    const { getName, getVersion } = await import('@tauri-apps/api/app')
    const name = await getName()
    const version = await getVersion()
    testResult.value = `应用信息测试成功:\n应用名称: ${name}\n应用版本: ${version}`
  } catch (error) {
    testResult.value = `应用信息测试失败:\n${error instanceof Error ? error.message : String(error)}`
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await detectEnvironment()
})
</script>

<style scoped>
.tauri-debug {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.debug-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.status-item label {
  font-weight: 500;
  color: #333;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

.test-result {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.debug-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
  max-height: 400px;
  overflow-y: auto;
}

.success {
  color: #28a745;
  font-weight: bold;
}

.error {
  color: #dc3545;
  font-weight: bold;
}

.warning {
  color: #ffc107;
  font-weight: bold;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #555;
  margin-bottom: 15px;
  font-size: 18px;
}

h3 {
  color: #666;
  margin-bottom: 10px;
  font-size: 16px;
}
</style>

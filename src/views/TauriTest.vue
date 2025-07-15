<template>
  <div class="tauri-test">
    <h1>Tauri 环境测试</h1>
    
    <div class="test-section">
      <h2>环境检查</h2>
      <p>是否在 Tauri 环境中: <span :class="isTauri ? 'success' : 'error'">{{ isTauri ? '是' : '否' }}</span></p>
      <p>Tauri 版本: <span>{{ tauriVersion || '未知' }}</span></p>
      <p>平台: <span>{{ platform || '未知' }}</span></p>
    </div>

    <div class="test-section">
      <h2>基础 API 测试</h2>
      <button @click="testFileApi" :disabled="loading">测试文件 API</button>
      <button @click="testCtpApi" :disabled="loading">测试 CTP API</button>
      <p v-if="testResult" :class="testResult.success ? 'success' : 'error'">
        {{ testResult.message }}
      </p>
    </div>

    <div class="test-section">
      <h2>调试信息</h2>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isTauri = ref(false)
const tauriVersion = ref('')
const platform = ref('')
const loading = ref(false)
const testResult = ref<{success: boolean, message: string} | null>(null)
const debugInfo = ref('')

// 检查 Tauri 环境
const checkTauriEnvironment = async () => {
  try {
    // Tauri 2.0 推荐的检测方式：尝试导入 Tauri API
    const { invoke } = await import('@tauri-apps/api/core')

    // 如果能成功导入并调用，说明在 Tauri 环境中
    await invoke('get_api_version') // 测试调用一个已知的命令
    isTauri.value = true

    debugInfo.value = JSON.stringify({
      environment: 'Tauri 2.0',
      apiAvailable: true,
      detectionMethod: 'ES Module Import',
      note: 'Using @tauri-apps/api instead of window.__TAURI__',
      windowTauriExists: typeof window !== 'undefined' && typeof (window as any).__TAURI__ !== 'undefined'
    }, null, 2)
  } catch (error) {
    // 如果导入失败或调用失败，可能不在 Tauri 环境中
    isTauri.value = false
    debugInfo.value = JSON.stringify({
      environment: 'Not Tauri or Tauri API unavailable',
      error: error instanceof Error ? error.message : String(error),
      detectionMethod: 'ES Module Import Failed',
      windowTauriExists: typeof window !== 'undefined' && typeof (window as any).__TAURI__ !== 'undefined'
    }, null, 2)
  }
}

// 测试文件 API
const testFileApi = async () => {
  loading.value = true
  testResult.value = null
  
  try {
    if (!isTauri.value) {
      throw new Error('Not in Tauri environment')
    }

    // 动态导入 Tauri API
    const { invoke } = await import('@tauri-apps/api/core')
    
    const result = await invoke('read_file', { path: 'test.txt' })
    testResult.value = {
      success: true,
      message: `文件 API 测试成功: ${typeof result}`
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: `文件 API 测试失败: ${error.message || error}`
    }
  } finally {
    loading.value = false
  }
}

// 测试 CTP API
const testCtpApi = async () => {
  loading.value = true
  testResult.value = null
  
  try {
    if (!isTauri.value) {
      throw new Error('Not in Tauri environment')
    }

    // 动态导入 Tauri API
    const { invoke } = await import('@tauri-apps/api/core')
    
    const result = await invoke('get_api_version')
    testResult.value = {
      success: true,
      message: `CTP API 测试成功: ${JSON.stringify(result)}`
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: `CTP API 测试失败: ${error.message || error}`
    }
  } finally {
    loading.value = false
  }
}

// 获取平台信息
const getPlatformInfo = async () => {
  try {
    // 使用浏览器 API 检测平台
    if ('userAgentData' in navigator && (navigator as any).userAgentData) {
      platform.value = (navigator as any).userAgentData.platform || 'Unknown'
    } else {
      // 后备到传统方法
      platform.value = navigator.userAgent.includes('Win') ? 'Windows' :
                       navigator.userAgent.includes('Mac') ? 'macOS' :
                       navigator.userAgent.includes('Linux') ? 'Linux' : 'Unknown'
    }
  } catch (error) {
    platform.value = 'Unknown'
    console.log('无法获取平台信息:', error)
  }
}

// 获取 Tauri 版本
const getTauriVersion = async () => {
  try {
    if (isTauri.value) {
      const { getVersion } = await import('@tauri-apps/api/app')
      tauriVersion.value = await getVersion()
    }
  } catch (error) {
    console.log('无法获取 Tauri 版本:', error)
  }
}

onMounted(async () => {
  await checkTauriEnvironment()
  await getPlatformInfo()
  await getTauriVersion()
})
</script>

<style scoped>
.tauri-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

button {
  padding: 10px 20px;
  margin-right: 10px;
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

.success {
  color: #28a745;
  font-weight: bold;
}

.error {
  color: #dc3545;
  font-weight: bold;
}

pre {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>

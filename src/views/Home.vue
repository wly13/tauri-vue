<template>
  <div>
    <h1>Tauri Vue CTP 应用</h1>

    <div class="navigation">
      <h2>页面导航</h2>
      <div class="nav-links">
        <router-link to="/tauri-test" class="nav-link">Tauri 环境测试</router-link>
        <router-link to="/tauri-debug" class="nav-link">Tauri 调试工具</router-link>
        <router-link to="/ctp" class="nav-link">CTP 交易接口</router-link>
        <router-link to="/login" class="nav-link">登录页面</router-link>
        <router-link to="/contract" class="nav-link">合约页面</router-link>
        <router-link to="/screenshot" class="nav-link">截图功能</router-link>
        <router-link to="/trading-panel" class="nav-link">交易面板</router-link>
        <router-link to="/price-board" class="nav-link">价格面板</router-link>
        <router-link to="/about" class="nav-link">关于页面</router-link>
      </div>
    </div>

    <div class="window-demo">
      <h2>窗口演示</h2>
      <div v-for="(item, index) in 5" :key="index" @click="openWindow(index)" class="window-item">
        打开窗口 {{ index }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isTauri = ref(false)

// 检查 Tauri 环境
const checkTauriEnvironment = async () => {
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('get_api_version')
    isTauri.value = true
  } catch (error) {
    isTauri.value = false
    console.log('Not in Tauri environment:', error)
  }
}

const openWindow = async (index: number) => {
  if (!isTauri.value) {
    alert('窗口功能仅在 Tauri 应用中可用')
    return
  }

  try {
    const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')

    const window = new WebviewWindow(`window-${index}`, {
      title: `窗口${index}`,
      url: `/#/about`,
      width: 200,
      height: 200,
      x: 100,
      y: 100,
    });

    window.once("tauri://created", () => {
      console.log("窗口创建成功");
    });
    window.once("tauri://error", (event) => {
      console.log("窗口创建失败", event);
    });
    window.once("tauri://close", () => {
      console.log("窗口关闭");
    });
    window.once("tauri://focus", () => {
      console.log("窗口聚焦");
    });
    window.once("tauri://blur", () => {
      console.log("窗口失去焦点");
    });
  } catch (error) {
    console.error('创建窗口失败:', error)
    alert('创建窗口失败')
  }
};

// 在组件挂载时检查环境
checkTauriEnvironment()
</script>

<style scoped>
.navigation {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.nav-links {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.nav-link {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav-link:hover {
  background: #0056b3;
}

.nav-link.router-link-active {
  background: #28a745;
}

.window-demo {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.window-item {
  padding: 10px;
  margin: 5px 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.window-item:hover {
  background: #e9ecef;
}
</style>

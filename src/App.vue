<template>
  <StyleProvider>
    <router-view></router-view>
  </StyleProvider>
</template>
<script setup lang="ts">
import { StyleProvider } from "ant-design-vue";
import { onMounted, onUnmounted } from 'vue';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useTradingPanels } from '@/composables/trading-controller/useTradingPanels';

// 使用交易面板管理组合式函数
const { closeAllTradingPanels } = useTradingPanels();

let unlistenCloseRequested: (() => void) | null = null;

// 监听主窗口关闭事件
onMounted(async () => {
  try {
    const mainWindow = getCurrentWindow();

    // 监听窗口关闭请求事件
    unlistenCloseRequested = await mainWindow.onCloseRequested(async (event) => {
      console.log('主窗口关闭请求，开始关闭所有交易面板...');

      try {
        // 关闭所有交易面板
        await closeAllTradingPanels();
        console.log('所有交易面板已关闭');
      } catch (error) {
        console.error('关闭交易面板时出错:', error);
      }

      // 允许主窗口关闭
      // 注意：不需要调用 event.preventDefault()，让窗口正常关闭
    });

    console.log('主窗口关闭事件监听器已设置');
  } catch (error) {
    console.error('设置主窗口关闭监听器失败:', error);
  }
});

// 组件卸载时清理监听器
onUnmounted(() => {
  if (unlistenCloseRequested) {
    unlistenCloseRequested();
    unlistenCloseRequested = null;
  }
});
</script>

<style>
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

div,
span,
p {
  margin: 0;
  padding: 0;
}

#app {
  height: 100%;
  width: 100%;
}
</style>

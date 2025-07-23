<template>
  <div
    class="controller-panel"
    :style="{ fontSize: fontSize + 'px' }"
    @contextmenu.prevent="$emit('contextmenu', $event)"
    data-tauri-drag-region
  >
    <!-- 交易集按钮 -->
    <div class="trading-sets">
      <TradingSetButton
        v-for="setNumber in 4"
        :key="setNumber"
        :set-number="setNumber"
        :is-active="activeSet === setNumber"
        :has-panels="hasActivePanels(setNumber)"
        @click="$emit('set-click', setNumber)"
        @contextmenu="$emit('set-contextmenu', setNumber, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import TradingSetButton from './TradingSetButton.vue'

interface Props {
  activeSet: number
  fontSize: number
  hasActivePanels: (setNumber: number) => boolean
}

defineProps<Props>()

defineEmits<{
  contextmenu: [event: MouseEvent]
  'set-click': [setNumber: number]
  'set-contextmenu': [setNumber: number, event: MouseEvent]
}>()
</script>

<style scoped>
.controller-panel {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.controller-panel:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.trading-sets {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>

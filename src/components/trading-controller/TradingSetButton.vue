<template>
  <button 
    class="set-button" 
    :class="{
      active: isActive,
      'has-panels': hasPanels
    }" 
    @click="$emit('click', setNumber)" 
    @contextmenu.prevent.stop="$emit('contextmenu', setNumber, $event)"
    :title="hasPanels ? `交易集${setNumber} (已打开)` : `交易集${setNumber} (点击打开)`"
  >
    {{ setNumber }}
    <span v-if="hasPanels" class="panel-indicator">●</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  setNumber: number
  isActive: boolean
  hasPanels: boolean
}

defineProps<Props>()

defineEmits<{
  click: [setNumber: number]
  contextmenu: [setNumber: number, event: MouseEvent]
}>()
</script>

<style scoped>
.set-button {
  width: 32px;
  height: 32px;
  border: 2px solid #fff;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.set-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.set-button.active {
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.set-button.has-panels {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.3);
}

.set-button.has-panels:hover {
  background: rgba(76, 175, 80, 0.4);
}

.panel-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 8px;
  color: #4CAF50;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}
</style>

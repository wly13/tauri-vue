<template>
  <div 
    v-if="visible" 
    class="context-menu" 
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <div 
      v-for="(item, index) in menuItems" 
      :key="index"
      class="menu-item" 
      :class="{ danger: item.danger }"
      @click="item.action"
    >
      <span class="menu-icon">{{ item.icon }}</span>
      {{ item.label }}
    </div>
    
    <div v-if="showSeparator" class="menu-separator"></div>
    
    <div 
      v-for="(item, index) in secondaryItems" 
      :key="`secondary-${index}`"
      class="menu-item"
      @click="item.action"
    >
      <span class="menu-icon">{{ item.icon }}</span>
      {{ item.label }}
    </div>
  </div>
  
  <!-- 点击遮罩关闭菜单 -->
  <div v-if="visible" class="menu-overlay" @click="$emit('close')"></div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types/trading'

interface Props {
  visible: boolean
  x: number
  y: number
  menuItems: MenuItem[]
  secondaryItems?: MenuItem[]
  showSeparator?: boolean
}

defineProps<Props>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  min-width: 140px;
  padding: 6px 0;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.danger {
  color: #ff4d4f;
}

.menu-item.danger:hover {
  background: #fff2f0;
}

.menu-icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.menu-separator {
  height: 1px;
  background: #e8e8e8;
  margin: 4px 0;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}
</style>

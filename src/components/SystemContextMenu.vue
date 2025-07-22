<template>
  <!-- 系统级右键菜单组件 -->
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="system-context-menu-overlay" 
      @click="close" 
      @contextmenu.prevent="close"
    >
      <div 
        class="system-context-menu" 
        :style="{ left: x + 'px', top: y + 'px' }"
        @click.stop
      >
        <div 
          v-for="(item, index) in menuItems" 
          :key="index"
          :class="['menu-item', { 'danger': item.danger }]"
          @click="handleItemClick(item)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-text">{{ item.text }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue'

interface MenuItem {
  icon: string
  text: string
  action: string
  danger?: boolean
}

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  menuItems: MenuItem[]
}>()

const emit = defineEmits<{
  close: []
  action: [action: string]
}>()

const handleItemClick = (item: MenuItem) => {
  emit('action', item.action)
  emit('close')
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
/* 系统级右键菜单样式 */
.system-context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999;
  background: transparent;
  pointer-events: auto;
}

.system-context-menu {
  position: absolute;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.15), 
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(20px);
  min-width: 180px;
  padding: 8px 0;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  animation: systemMenuAppear 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: top left;
}

@keyframes systemMenuAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-8px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  color: #333;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin: 0 6px;
  border-radius: 4px;
  position: relative;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 120, 215, 0.1), rgba(0, 120, 215, 0.05));
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.menu-item:hover::before {
  opacity: 1;
}

.menu-item:hover {
  color: #0078d4;
  transform: translateX(2px);
}

.menu-item:active {
  transform: translateX(2px) scale(0.98);
}

.menu-item.danger {
  color: #d13438;
}

.menu-item.danger::before {
  background: linear-gradient(135deg, rgba(209, 52, 56, 0.1), rgba(209, 52, 56, 0.05));
}

.menu-item.danger:hover {
  color: #d13438;
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
  opacity: 0.8;
  transition: all 0.15s ease;
  z-index: 1;
  position: relative;
}

.menu-item:hover .menu-icon {
  opacity: 1;
  transform: scale(1.1);
}

.menu-text {
  font-weight: 500;
  z-index: 1;
  position: relative;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-context-menu {
    min-width: 160px;
  }
  
  .menu-item {
    padding: 10px 16px;
    font-size: 13px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .system-context-menu {
    background: rgba(30, 30, 30, 0.98);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .menu-item {
    color: #e0e0e0;
  }
  
  .menu-item:hover {
    color: #4cc2ff;
  }
  
  .menu-item::before {
    background: linear-gradient(135deg, rgba(76, 194, 255, 0.1), rgba(76, 194, 255, 0.05));
  }
}
</style>

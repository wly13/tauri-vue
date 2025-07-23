<template>
  <Modal
    v-model:open="visible"
    title="需要重新连接"
    :closable="false"
    :maskClosable="false"
    :footer="null"
    width="400px"
  >
    <div class="reconnect-dialog">
      <div class="status-section">
        <div class="status-icon">
          <ExclamationCircleOutlined v-if="status === 'disconnected'" style="color: #faad14; font-size: 24px;" />
          <LoadingOutlined v-else-if="status === 'reconnecting'" style="color: #1890ff; font-size: 24px;" />
          <CheckCircleOutlined v-else-if="status === 'success'" style="color: #52c41a; font-size: 24px;" />
          <CloseCircleOutlined v-else-if="status === 'failed'" style="color: #ff4d4f; font-size: 24px;" />
        </div>
        <div class="status-text">
          <h3>{{ statusTitle }}</h3>
          <p>{{ statusMessage }}</p>
        </div>
      </div>

      <div class="action-section">
        <Space>
          <Button 
            v-if="status === 'disconnected' || status === 'failed'"
            type="primary" 
            @click="handleReconnect"
            :loading="status === 'reconnecting'"
          >
            {{ status === 'failed' ? '重试连接' : '自动重连' }}
          </Button>
          <Button 
            v-if="status === 'disconnected' || status === 'failed'"
            @click="handleManualLogin"
          >
            手动登录
          </Button>
          <Button 
            v-if="status === 'success'"
            type="primary" 
            @click="handleClose"
          >
            确定
          </Button>
        </Space>
      </div>

      <div v-if="errorMessage" class="error-section">
        <Alert :message="errorMessage" type="error" show-icon />
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Modal, Button, Space, Alert, message } from 'ant-design-vue'
import { 
  ExclamationCircleOutlined, 
  LoadingOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons-vue'
import { autoReconnectService } from '@/services/autoReconnectService'
import { useRouter } from 'vue-router'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'reconnected'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const status = ref<'disconnected' | 'reconnecting' | 'success' | 'failed'>('disconnected')
const errorMessage = ref<string>('')

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const statusTitle = computed(() => {
  switch (status.value) {
    case 'disconnected':
      return 'CTP连接已断开'
    case 'reconnecting':
      return '正在重新连接...'
    case 'success':
      return '连接成功'
    case 'failed':
      return '连接失败'
    default:
      return ''
  }
})

const statusMessage = computed(() => {
  switch (status.value) {
    case 'disconnected':
      return '检测到CTP交易连接已断开，需要重新建立连接才能继续使用。'
    case 'reconnecting':
      return '正在使用保存的账户信息自动重新连接，请稍候...'
    case 'success':
      return 'CTP连接已成功建立，可以继续使用交易功能。'
    case 'failed':
      return '自动重连失败，请检查网络连接或手动重新登录。'
    default:
      return ''
  }
})

const handleReconnect = async () => {
  status.value = 'reconnecting'
  errorMessage.value = ''

  try {
    const success = await autoReconnectService.ensureTraderConnection()
    
    if (success) {
      status.value = 'success'
      message.success('重连成功！')
      
      // 延迟关闭对话框并触发重连成功事件
      setTimeout(() => {
        handleClose()
        emit('reconnected')
      }, 1500)
    } else {
      status.value = 'failed'
      errorMessage.value = '自动重连失败，可能是账户信息过期或网络问题'
    }
  } catch (error) {
    status.value = 'failed'
    errorMessage.value = error instanceof Error ? error.message : '重连过程中发生未知错误'
    console.error('重连失败:', error)
  }
}

const handleManualLogin = () => {
  // 关闭对话框并跳转到登录页面
  visible.value = false
  router.push('/login')
}

const handleClose = () => {
  visible.value = false
  status.value = 'disconnected'
  errorMessage.value = ''
}

// 当对话框显示时重置状态
const resetStatus = () => {
  status.value = 'disconnected'
  errorMessage.value = ''
}

// 监听visible变化
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    resetStatus()
  }
})
</script>

<style scoped>
.reconnect-dialog {
  padding: 16px 0;
}

.status-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
}

.status-icon {
  margin-right: 12px;
  margin-top: 4px;
}

.status-text h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.status-text p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.action-section {
  text-align: center;
  margin-bottom: 16px;
}

.error-section {
  margin-top: 16px;
}
</style>

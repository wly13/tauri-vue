<template>
  <div class="server-config">
    <a-card title="CTP服务器配置" class="config-card">
      <div class="config-section">
        <h3>选择服务器</h3>
        <a-radio-group v-model:value="selectedServer" @change="onServerChange">
          <a-radio-button 
            v-for="(config, key) in availableServers" 
            :key="key" 
            :value="key"
          >
            {{ config.name }}
          </a-radio-button>
        </a-radio-group>
      </div>

      <div class="config-section">
        <h3>服务器详细配置</h3>
        <a-form 
          :model="currentConfig" 
          layout="vertical"
          :disabled="selectedServer !== 'custom'"
        >
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="配置名称">
                <a-input v-model:value="currentConfig.name" placeholder="请输入配置名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="期货公司代码">
                <a-input v-model:value="currentConfig.brokerId" placeholder="如: 9999" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="交易前置地址">
                <a-input v-model:value="currentConfig.tradeFront" placeholder="tcp://ip:port" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="行情前置地址">
                <a-input v-model:value="currentConfig.marketFront" placeholder="tcp://ip:port" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="认证码">
                <a-input v-model:value="currentConfig.authCode" placeholder="可选" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="用户产品信息">
                <a-input v-model:value="currentConfig.userProductInfo" placeholder="TauriApp" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="应用标识">
                <a-input v-model:value="currentConfig.appId" placeholder="TauriApp_1.0" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="config-section">
        <a-space>
          <a-button 
            type="primary" 
            @click="saveConfig"
            :disabled="selectedServer !== 'custom'"
          >
            保存自定义配置
          </a-button>
          <a-button @click="testConnection" :loading="testing">
            测试连接
          </a-button>
          <a-button @click="resetConfig" :disabled="selectedServer !== 'custom'">
            重置配置
          </a-button>
        </a-space>
      </div>

      <div class="config-section" v-if="validationErrors.length > 0">
        <a-alert
          message="配置验证失败"
          type="error"
          show-icon
        >
          <template #description>
            <ul>
              <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            </ul>
          </template>
        </a-alert>
      </div>

      <div class="config-section">
        <h3>连接状态</h3>
        <a-descriptions bordered size="small">
          <a-descriptions-item label="当前服务器">
            {{ currentConfig.name }}
          </a-descriptions-item>
          <a-descriptions-item label="期货公司">
            {{ currentConfig.brokerId }}
          </a-descriptions-item>
          <a-descriptions-item label="交易前置">
            {{ currentConfig.tradeFront }}
          </a-descriptions-item>
          <a-descriptions-item label="行情前置">
            {{ currentConfig.marketFront }}
          </a-descriptions-item>
          <a-descriptions-item label="连接状态">
            <a-tag :color="connectionStatus === 'connected' ? 'green' : 'red'">
              {{ connectionStatusText }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import { CtpConfigManager, type CtpServerConfig } from '../config/ctpConfig';

// 响应式数据
const selectedServer = ref<string>('current');
const currentConfig = reactive<CtpServerConfig>({
  name: '',
  brokerId: '',
  tradeFront: '',
  marketFront: '',
  authCode: '',
  userProductInfo: 'TauriApp',
  appId: 'TauriApp_1.0'
});

const testing = ref(false);
const connectionStatus = ref<'connected' | 'disconnected' | 'testing'>('disconnected');
const validationErrors = ref<string[]>([]);

// 计算属性
const availableServers = computed(() => CtpConfigManager.getAllServers());

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected': return '已连接';
    case 'testing': return '测试中...';
    default: return '未连接';
  }
});

// 方法
const loadCurrentConfig = () => {
  selectedServer.value = CtpConfigManager.getSelectedServer();
  const config = CtpConfigManager.getCurrentServerConfig();
  Object.assign(currentConfig, config);
};

const onServerChange = () => {
  CtpConfigManager.setSelectedServer(selectedServer.value);
  const config = availableServers.value[selectedServer.value];
  if (config) {
    Object.assign(currentConfig, config);
  }
  validateConfig();
};

const saveConfig = () => {
  if (selectedServer.value !== 'custom') {
    message.warning('只能保存自定义配置');
    return;
  }

  const errors = CtpConfigManager.validateConfig(currentConfig);
  if (errors.length > 0) {
    validationErrors.value = errors;
    message.error('配置验证失败，请检查输入');
    return;
  }

  try {
    CtpConfigManager.saveCustomConfig(currentConfig);
    message.success('自定义配置保存成功');
    validationErrors.value = [];
  } catch (error) {
    message.error('保存配置失败: ' + error);
  }
};

const testConnection = async () => {
  testing.value = true;
  connectionStatus.value = 'testing';
  
  try {
    const result = await CtpConfigManager.testConnection(currentConfig);
    connectionStatus.value = result ? 'connected' : 'disconnected';
    message[result ? 'success' : 'error'](
      result ? '连接测试成功' : '连接测试失败'
    );
  } catch (error) {
    connectionStatus.value = 'disconnected';
    message.error('连接测试异常: ' + error);
  } finally {
    testing.value = false;
  }
};

const resetConfig = () => {
  if (selectedServer.value === 'custom') {
    Object.assign(currentConfig, {
      name: '自定义配置',
      brokerId: '',
      tradeFront: '',
      marketFront: '',
      authCode: '',
      userProductInfo: 'TauriApp',
      appId: 'TauriApp_1.0'
    });
    validationErrors.value = [];
  }
};

const validateConfig = () => {
  validationErrors.value = CtpConfigManager.validateConfig(currentConfig);
};

// 监听配置变化
watch(currentConfig, validateConfig, { deep: true });

// 生命周期
onMounted(() => {
  loadCurrentConfig();
  validateConfig();
});
</script>

<style scoped>
.server-config {
  padding: 20px;
}

.config-card {
  max-width: 1200px;
  margin: 0 auto;
}

.config-section {
  margin-bottom: 24px;
}

.config-section h3 {
  margin-bottom: 16px;
  color: #1890ff;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.ant-radio-group {
  width: 100%;
}

.ant-radio-button-wrapper {
  margin-bottom: 8px;
}
</style>

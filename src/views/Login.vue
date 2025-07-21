<template>
  <div class="login-bg">
    <div class="login-mask"></div>
    <Card class="login-card" :bordered="false">
      <h2 class="login-title">账户登录</h2>
      <Form :model="form" class="login-form">
        <Form.Item>
          <Select
            v-model:value="form.server"
            placeholder="选择CTP服务器"
            class="login-select"
            :dropdown-style="{ borderRadius: '8px' }"
            @change="onServerChange"
          >
            <Select.Option
              v-for="(config, key) in availableServers"
              :key="key"
              :value="key"
            >
              {{ config.name }}
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Input
            v-model:value="form.account"
            placeholder="请输入您的交易账号"
            class="login-input"
          />
        </Form.Item>
        <Form.Item>
          <InputPassword
            v-model:value="form.password"
            placeholder="请输入密码"
            class="login-input"
          />
        </Form.Item>
        <Form.Item class="login-remember-row">
          <Checkbox v-model:checked="form.remember">记住密码</Checkbox>
        </Form.Item>

        <!-- 服务器配置信息显示 -->
        <div class="server-info" v-if="currentServerConfig">
          <div class="server-info-title">当前服务器配置</div>
          <div class="server-info-content">
            <div class="info-item">
              <span class="info-label">期货公司:</span>
              <span class="info-value">{{ currentServerConfig.brokerId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">交易前置:</span>
              <span class="info-value">{{ currentServerConfig.tradeFront }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">行情前置:</span>
              <span class="info-value">{{ currentServerConfig.marketFront }}</span>
            </div>
          </div>
        </div>
        <Form.Item>
          <div class="login-buttons">
            <Button
              type="default"
              class="test-btn"
              @click="testConnection"
              :loading="testLoading"
              :disabled="testLoading || loginLoading"
            >
              {{ testLoading ? '测试中...' : '测试连接' }}
            </Button>
            <Button
              type="primary"
              class="login-btn"
              @click="onLogin"
              :loading="loginLoading"
              :disabled="loginLoading"
            >
              {{ loginLoading ? '登录中...' : '登 录' }}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  Card,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  InputPassword,
  message,
} from "ant-design-vue";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Window,
  LogicalPosition,
  LogicalSize,
} from "@tauri-apps/api/window";
import { CtpService } from "../services/ctpService";
import { UserStorageService, UserInfo } from "../services/userStorage";
import { CtpConfigManager } from "../config/ctpConfig";

const router = useRouter();
const ctpService = new CtpService();

const form = ref({
  server: "current",
  account: "",
  password: "",
  remember: false,
});

const loginLoading = ref(false);
const testLoading = ref(false);

// 计算属性：获取可用的服务器配置
const availableServers = computed(() => CtpConfigManager.getAllServers());

// 计算属性：获取当前选中的服务器配置
const currentServerConfig = computed(() => {
  const serverKey = form.value.server;
  return availableServers.value[serverKey] || null;
});

// 服务器切换处理
const onServerChange = (serverKey: string) => {
  CtpConfigManager.setSelectedServer(serverKey);
  console.log(`切换到服务器: ${serverKey}`, CtpConfigManager.getCurrentServerConfig());
};

// 组件挂载时加载保存的用户信息
onMounted(() => {
  // 首先设置默认服务器为current
  form.value.server = CtpConfigManager.getSelectedServer();

  const savedUserInfo = UserStorageService.getUserInfo();
  if (savedUserInfo) {
    form.value.account = savedUserInfo.account;
    form.value.password = savedUserInfo.password;
    form.value.remember = savedUserInfo.isRemembered;
    // 如果有保存的服务器配置，使用保存的，否则使用current
    if (savedUserInfo.server && availableServers.value[savedUserInfo.server]) {
      form.value.server = savedUserInfo.server;
      CtpConfigManager.setSelectedServer(savedUserInfo.server);
    }
  }

  console.log('当前服务器配置:', CtpConfigManager.getCurrentServerConfig());
});

// 测试连接功能
const testConnection = async () => {
  try {
    testLoading.value = true;

    // 获取当前服务器配置
    const serverConfig = CtpConfigManager.getCurrentServerConfig();
    console.log('测试连接配置:', serverConfig);

    message.info(`正在测试连接到: ${serverConfig.name}`);

    // 创建临时的CTP配置用于测试
    const testConfig = UserStorageService.getDefaultConfig();
    console.log('CTP测试配置:', testConfig);

    // 测试API版本获取
    const versionResult = await ctpService.getApiVersion();
    if (!versionResult.success) {
      throw new Error('无法获取CTP API版本');
    }

    console.log('CTP API版本:', versionResult.data);

    // 尝试创建行情API进行连接测试
    const mdResult = await ctpService.createMdApi();
    if (!mdResult.success) {
      throw new Error(mdResult.error || '创建行情API失败');
    }

    console.log('行情API创建成功:', mdResult.data);

    // 清理测试资源
    await ctpService.releaseMdApi();

    message.success(`连接测试成功！服务器: ${serverConfig.name}`);

  } catch (error) {
    console.error('连接测试失败:', error);
    const errorMsg = error instanceof Error ? error.message : '连接测试失败';
    message.error(`连接测试失败: ${errorMsg}`);
  } finally {
    testLoading.value = false;
  }
};

const onLogin = async () => {
  try {
    // 验证表单
    const errors = UserStorageService.validateUserInfo(form.value);
    if (errors.length > 0) {
      message.error(errors[0]);
      return;
    }

    loginLoading.value = true;

    // 保存用户信息
    const userInfo: UserInfo = {
      account: form.value.account,
      password: form.value.password,
      server: form.value.server,
      isRemembered: form.value.remember,
      lastLoginTime: new Date().toISOString()
    };
    UserStorageService.saveUserInfo(userInfo);

    // 获取CTP配置
    const ctpConfig = UserStorageService.toCtpConfig(userInfo);

    // 创建行情API
    const mdResult = await ctpService.createMdApi();
    if (!mdResult.success) {
      throw new Error(mdResult.error || '创建行情API失败');
    }

    // 创建交易API
    const traderResult = await ctpService.createTraderApi();
    if (!traderResult.success) {
      throw new Error(traderResult.error || '创建交易API失败');
    }

    // 行情登录
    const mdLoginResult = await ctpService.mdLogin(ctpConfig);
    if (!mdLoginResult.success) {
      throw new Error(mdLoginResult.error || '行情登录失败');
    }

    // 交易登录
    const traderLoginResult = await ctpService.traderLogin(ctpConfig);
    if (!traderLoginResult.success) {
      throw new Error(traderLoginResult.error || '交易登录失败');
    }

    // 更新最后登录时间
    UserStorageService.updateLastLoginTime();

    message.success('登录成功！');

    // 调整窗口大小和位置
    const curWindow = Window.getCurrent();
    curWindow.setSize(new LogicalSize(500, 600));
    curWindow.setPosition(new LogicalPosition(100, 100));
    curWindow.setResizable(false);
    curWindow.setTitle("CTP交易系统");

    // 跳转到交易面板
     router.push('/trading-panel');

  } catch (error) {
    console.error('登录失败:', error);
    message.error(error instanceof Error ? error.message : '登录失败，请检查网络连接和账号信息');
  } finally {
    loginLoading.value = false;
  }
};
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  width: 100vw;
  position: relative;
  /* background: #0a1830 url("/your-bg-image.jpg") center/cover no-repeat; */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.login-mask {
  position: absolute;
  inset: 0;
  background: rgba(10, 24, 48, 0.7);
  z-index: 1;
}
.login-card {
  position: relative;
  z-index: 2;
  width: 420px;
  border-radius: 20px;
  background: rgba(20, 30, 50, 0.88);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  padding: 36px 32px 28px 32px;
  border: none;
}
.login-title {
  color: #fff;
  text-align: center;
  margin-bottom: 32px;
  font-size: 30px;
  font-weight: 500;
  letter-spacing: 2px;
}
.login-form .ant-form-item {
  margin-bottom: 20px;
}
.login-select .ant-select-selector,
.login-input .ant-input,
.login-input .ant-input-password {
  border-radius: 8px !important;
  border: 1.5px solid #e2b23c !important;
  background: transparent !important;
  color: #fff !important;
  font-size: 16px;
  height: 44px;
}
.login-select .ant-select-selector {
  color: #fff !important;
}
.login-input .ant-input,
.login-input .ant-input-password input {
  color: #fff !important;
  background: transparent !important;
}
.login-input .ant-input::placeholder,
.login-input .ant-input-password input::placeholder {
  color: #bbb !important;
}
.login-form .ant-checkbox-inner {
  border-radius: 4px;
  border: 1.5px solid #e2b23c;
  background: transparent;
}
.login-form .ant-checkbox-checked .ant-checkbox-inner {
  background-color: #e2b23c;
  border-color: #e2b23c;
}
.login-remember-row {
  margin-bottom: 10px;
}
.server-info {
  margin: 16px 0;
  padding: 12px;
  background: rgba(226, 178, 60, 0.1);
  border: 1px solid rgba(226, 178, 60, 0.3);
  border-radius: 8px;
}
.server-info-title {
  color: #e2b23c;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}
.server-info-content {
  font-size: 12px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.info-label {
  color: #bbb;
}
.info-value {
  color: #fff;
  font-family: monospace;
}
.login-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.test-btn {
  flex: 1;
  background: transparent !important;
  color: #e2b23c !important;
  font-weight: bold;
  font-size: 16px;
  border: 1.5px solid #e2b23c !important;
  border-radius: 8px;
  height: 48px;
  box-shadow: 0 2px 8px rgba(226, 178, 60, 0.15);
}
.test-btn:hover,
.test-btn:focus {
  background: rgba(226, 178, 60, 0.1) !important;
  color: #ffd666 !important;
  border-color: #ffd666 !important;
}
.login-btn {
  flex: 2;
  background: #e2b23c !important;
  color: #222 !important;
  font-weight: bold;
  font-size: 20px;
  letter-spacing: 4px;
  border-radius: 8px;
  border: none;
  height: 48px;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(226, 178, 60, 0.15);
}
.login-btn:hover,
.login-btn:focus {
  background: #ffd666 !important;
  color: #222 !important;
}
</style>

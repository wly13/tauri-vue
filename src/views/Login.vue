<template>
  <div class="login-bg">
    <div class="login-mask"></div>
    <Card class="login-card" bordered="false">
      <h2 class="login-title">账户登录</h2>
      <Form :model="form" class="login-form">
        <Form.Item>
          <Select
            v-model:value="form.server"
            placeholder="CTP 主服务器"
            class="login-select"
            :dropdown-style="{ borderRadius: '8px' }"
          >
            <Select.Option value="ctp">CTP 主服务器</Select.Option>
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
        <!-- <Form.Item class="login-remember-row">
          <Checkbox v-model:checked="form.remember">记住密码</Checkbox>
        </Form.Item> -->
        <Form.Item>
          <Button type="primary" block class="login-btn" @click="onLogin"
            >登 录</Button
          >
        </Form.Item>
      </Form>
    </Card>
  </div>
</template>

<script setup>
import {
  Card,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  InputPassword,
} from "ant-design-vue";
import { ref } from "vue";
import {
  Window,
  PhysicalPosition,
  PhysicalSize,
  LogicalPosition,
  LogicalSize,
} from "@tauri-apps/api/window";
const form = ref({
  server: "ctp",
  account: "",
  password: "",
  remember: false,
});
const onLogin = async () => {
  const curWindow = await Window.getCurrent();
  console.log(curWindow);
  curWindow.setSize(new LogicalSize(500, 60));
  curWindow.setPosition(new LogicalPosition(100, 100));
  //   curWindow.setDecorations(false);
  curWindow.setResizable(false);
  curWindow.setTitle("登录");
  //   curWindow.setDecorations(false);
  //   curWindow.setAlwaysOnTop(true);
  //   curWindow.setFullscreen(false);
  // 登录逻辑
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
.login-btn {
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

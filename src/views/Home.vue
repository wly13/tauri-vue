<template>
  <div>
    <h1>Home</h1>
    <div v-for="(item, index) in 10" :key="index" @click="openWindow(index)">
      打开{{ index }} 窗口
    </div>
  </div>
</template>

<script setup lang="ts">
import { invoke } from "@tauri-apps/api/core";
import {
  WebviewWindow,
  getAllWebviewWindows,
} from "@tauri-apps/api/webviewWindow";

const openWindow = async (index: number) => {
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
};
</script>

<style scoped></style>

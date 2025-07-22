<template>
  <div class="trading-controller">
    <!-- 主控制面板 -->
    <ControllerPanel
      :active-set="activeSet"
      :font-size="fontSize"
      :has-active-panels="hasActivePanels"
      @contextmenu="handleMainContextMenu"
      @set-click="handleSetClick"
      @set-contextmenu="handleSetContextMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import ControllerPanel from "@/components/trading-controller/ControllerPanel.vue";
import { useTradingPanels } from "@/composables/trading-controller/useTradingPanels";
import { useConfigManager } from "@/composables/trading-controller/useConfigManager";
import { useXMLConfig } from "@/composables/trading-controller/useXMLConfig";
import { useAppActions } from "@/composables/trading-controller/useAppActions";
import { useSystemMenu } from "@/composables/trading-controller/useSystemMenu";
import { createKeyboardHandler } from "@/utils/keyboardUtils";
import type { MenuAction } from "@/types/trading";

// 响应式数据
const fontSize = ref(12);

// 使用组合式函数
const {
  tradingPanels,
  hasActivePanels,
  openTradingPanel,
  closeAllPanels,
  closeAllTradingPanels,
} = useTradingPanels();

const { activeSet, saveConfiguration, loadConfiguration } = useConfigManager();

const { autoLoadXMLConfiguration, loadXMLConfiguration } = useXMLConfig();

const { configureTradingSet, handleMenuAction } = useAppActions();

const { showMainContextMenu, showSetContextMenu } = useSystemMenu();

// 处理交易集按钮点击
const handleSetClick = async (setNumber: number) => {
  console.log(`点击交易集${setNumber}`);
  activeSet.value = setNumber;
  await openTradingPanel(setNumber);
};

// 菜单操作处理
const handleMenuActionWrapper = (action: MenuAction) => {
  handleMenuAction(action, {
    saveConfiguration: () => saveConfiguration(tradingPanels.value),
    loadXMLConfiguration: () => loadXMLConfiguration(openTradingPanel),
    closeAllTradingPanels,
  });
};

// 主右键菜单处理
const handleMainContextMenu = async (event: MouseEvent) => {
  await showMainContextMenu(event, handleMenuActionWrapper);
};

// 交易集右键菜单处理
const handleSetContextMenu = async (setNumber: number, event: MouseEvent) => {
  await showSetContextMenu(
    event,
    setNumber,
    openTradingPanel,
    closeAllPanels,
    configureTradingSet
  );
};

// 键盘事件处理
const keyboardHandler = createKeyboardHandler(() => {}, handleSetClick);

// 组件挂载
onMounted(async () => {
  document.addEventListener("keydown", keyboardHandler);

  // 自动加载默认XML配置文件
  await autoLoadXMLConfiguration(openTradingPanel);
});
</script>

<style scoped>
.trading-controller {
  width: 200px;
  height: 50px;
  position: relative;
  user-select: none;
  font-family: "Microsoft YaHei", Arial, sans-serif;
}
</style>

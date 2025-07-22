<template>
  <div class="trading-controller">
    <!-- 主控制面板 -->
    <ControllerPanel
      :active-set="activeSet"
      :font-size="fontSize"
      :has-active-panels="hasActivePanels"
      @contextmenu="showContextMenu"
      @set-click="handleSetClick"
      @set-contextmenu="showSetContextMenu"
    />

    <!-- 主右键菜单 -->
    <ContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :menu-items="mainMenuItems"
      :secondary-items="mainMenuSecondaryItems"
      :show-separator="true"
      @close="hideAllMenus"
    />

    <!-- 交易集右键菜单 -->
    <ContextMenu
      :visible="setContextMenu.visible"
      :x="setContextMenu.x"
      :y="setContextMenu.y"
      :menu-items="setMenuItems"
      @close="hideAllMenus"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import ControllerPanel from "@/components/trading-controller/ControllerPanel.vue";
import ContextMenu from "@/components/trading-controller/ContextMenu.vue";
import { useContextMenu } from "@/composables/trading-controller/useContextMenu";
import { useTradingPanels } from "@/composables/trading-controller/useTradingPanels";
import { useConfigManager } from "@/composables/trading-controller/useConfigManager";
import { useXMLConfig } from "@/composables/trading-controller/useXMLConfig";
import { useAppActions } from "@/composables/trading-controller/useAppActions";
import { createKeyboardHandler } from "@/utils/keyboardUtils";
import {
  createMainMenuItems,
  createMainMenuSecondaryItems,
  createSetMenuItems,
} from "@/utils/menuUtils";

// 响应式数据
const fontSize = ref(12);

// 使用组合式函数
const {
  contextMenu,
  setContextMenu,
  selectedSet,
  showContextMenu,
  showSetContextMenu,
  hideAllMenus,
} = useContextMenu();

const {
  tradingPanels,
  hasActivePanels,
  openTradingPanel,
  closeAllPanels,
  closeAllTradingPanels,
} = useTradingPanels();

const { activeSet, saveConfiguration, loadConfiguration } = useConfigManager();

const { loadXMLConfiguration } = useXMLConfig();

const { configureTradingSet, handleMenuAction } = useAppActions();

// 处理交易集按钮点击
const handleSetClick = async (setNumber: number) => {
  console.log(`点击交易集${setNumber}`);
  activeSet.value = setNumber;
  await openTradingPanel(setNumber);
};

// 创建菜单项
const mainMenuItems = computed(() =>
  createMainMenuItems((action) => {
    hideAllMenus();
    handleMenuAction(action, {
      saveConfiguration: () => saveConfiguration(tradingPanels.value),
      loadXMLConfiguration: () => loadXMLConfiguration(openTradingPanel),
      closeAllTradingPanels,
    });
  })
);

const mainMenuSecondaryItems = computed(() =>
  createMainMenuSecondaryItems((action) => {
    hideAllMenus();
    handleMenuAction(action, {
      saveConfiguration: () => saveConfiguration(tradingPanels.value),
      loadXMLConfiguration: () => loadXMLConfiguration(openTradingPanel),
      closeAllTradingPanels,
    });
  })
);

const setMenuItems = computed(() =>
  createSetMenuItems(
    selectedSet.value,
    openTradingPanel,
    closeAllPanels,
    configureTradingSet
  )
);

// 键盘事件处理
const keyboardHandler = createKeyboardHandler(hideAllMenus, handleSetClick);

// 组件挂载
onMounted(() => {
  document.addEventListener("keydown", keyboardHandler);
  loadConfiguration();
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

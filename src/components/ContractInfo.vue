<template>
  <Card size="small" title="合约信息" :bordered="false">
    <!-- 缩放 -->
    <div>16 <span>-</span><span>+</span></div>
    <!-- 涨跌比 -->
    <div>{{ info.changeRatio }}%</div>
    <!-- 成交量 -->
    <div>{{ info.volume }}</div>
    <!-- 持仓量 -->
    <div>{{ info.position }}</div>
    <!-- 增减仓量 -->
    <div>{{ info.positionChange }}</div>
  </Card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { Card } from "ant-design-vue";
defineProps({
  info: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.card {
  background: #f8f8f8;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  color: #222;
  min-width: 180px;
}
.ant-descriptions-item-label {
  color: #888;
  font-size: 13px;
  padding-right: 8px;
}
.ant-descriptions-item-content {
  font-weight: bold;
  font-size: 15px;
}
.change-ratio {
  font-size: 16px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}
</style>

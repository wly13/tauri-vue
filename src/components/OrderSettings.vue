<template>
  <Card size="small" title="下单设置" :bordered="false" style="margin-top: 8px">
    <div>{{ settings.buyOrderCount || 0 }}</div>
    <div>{{ settings.buyOrderBatch || 0 }}</div>
    <InputNumber
      class="no-spin"
      v-model:value="settings.leftClickCount"
      :min="1"
    />
    <InputNumber
      class="no-spin"
      v-model:value="settings.rightClickCount"
      :min="1"
    />
    <RadioGroup v-model:value="settings.modeA">
      <Radio value="A">A模式单点位挂单</Radio>
      <Radio value="B">B模式多点位挂单</Radio>
    </RadioGroup>
    <Checkbox v-model:checked="settings.isAutoRun" /> 金
  </Card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import {
  Card,
  Form,
  InputNumber,
  Button,
  FormItem,
  RadioGroup,
  Radio,
  Checkbox,
} from "ant-design-vue";
defineProps({
  settings: {
    type: Object,
    required: true,
  },
});
</script>
<style scoped lang="less">
.no-spin {
  :deep(.ant-input-number-handler-wrap) {
    display: none;
  }
}
</style>

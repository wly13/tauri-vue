<template>
  <Card size="small" title="风控与限制" :bordered="false" style="margin-top: 8px;">
    <Form layout="vertical">
      <FormItem label="撤单上限">
        <InputNumber v-model:value="risk.cancelLimit" :min="0" />
      </FormItem>
      <FormItem label="防连点">
        <Switch v-model:checked="risk.preventRapidOrder" />
        <span style="margin-left: 8px;">（一秒内无法连续下单）</span>
      </FormItem>
      <FormItem label="涨跌停锁">
        <Switch v-model:checked="risk.lockLimit" />
      </FormItem>
      <FormItem label="涨跌停价位">
        <InputNumber v-model:value="risk.limitPrice" :min="0" />
      </FormItem>
    </Form>
  </Card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { Form, InputNumber, Switch, Card } from "ant-design-vue";
defineProps({
  risk: {
    type: Object,
    required: true
  }
});
</script>

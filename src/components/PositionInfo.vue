<template>
  <Card size="small" title="持仓信息" :bordered="false" style="margin-top: 8px">
    <Descriptions :column="1" size="small">
      <DescriptionsItem label="买入后持仓数量">{{
        position.count
      }}</DescriptionsItem>
      <DescriptionsItem label="状态">{{ position.status }}</DescriptionsItem>
    </Descriptions>
  </Card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { Card, Descriptions, DescriptionsItem } from "ant-design-vue";
defineProps({
  position: {
    type: Object,
    required: true,
  },
});
</script>

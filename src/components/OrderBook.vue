<template>
  <Card size="small" title="盘口" :bordered="false">
    <Table
      :columns="columns"
      :dataSource="orderBook"
      size="small"
      :pagination="false"
      bordered
      rowKey="key"
    />
  </Card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { Card, Table } from "ant-design-vue";
defineProps({
  orderBook: {
    type: Array,
    required: true,
  },
});

const columns = [
  { title: "买价", dataIndex: "buy", width: 60 },
  { title: "买量", dataIndex: "buyVolume", width: 60 },
  { title: "卖价", dataIndex: "sell", width: 60 },
  { title: "卖量", dataIndex: "sellVolume", width: 60 },
];
</script>

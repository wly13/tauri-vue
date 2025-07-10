<template>
  <Row gutter="16">
    <Col :span="6">
      <div>
        <!-- 缩放 -->
        <div>16 <span>-</span><span>+</span></div>
        <!-- 涨跌比 -->
        <div>{{ contractInfo.changeRatio }}%</div>
        <!-- 成交量 -->
        <div>{{ contractInfo.volume }}</div>
        <!-- 持仓量 -->
        <div>{{ contractInfo.position }}</div>
        <!-- 增减仓量 -->
        <div>{{ contractInfo.positionChange }}</div>
      </div>
      <div>
        <!-- 买入后持空单数量 -->
        <div>{{ orderSettings.buyOrderCount || 0 }}</div>
        <!-- 买入后持多单数量 -->
        <div>{{ orderSettings.buyOrderBatch || 0 }}</div>
        <!-- 鼠标左键下单数量 -->
        <InputNumber
          class="no-spin"
          v-model:value="orderSettings.leftClickCount"
          :min="1"
        />
        <!-- 鼠标右键下单数量 -->
        <InputNumber
          class="no-spin"
          v-model:value="orderSettings.rightClickCount"
          :min="1"
        />
        <!-- 下单模式 -->
        <RadioGroup v-model:value="orderSettings.modeA">
          <Radio value="A">A模式单点位挂单</Radio>
          <Radio value="B">B模式多点位挂单</Radio>
        </RadioGroup>
      </div>
      <div>
        <!-- 一键跑单 -->
        <Checkbox v-model:checked="orderSettings.isAutoRun" /> 金
        <!-- 撤单上限 -->
        <RadioGroup v-model:value="orderSettings.limit">
          <Radio value="1">CLimit 345</Radio>
          <Radio value="0">CLimit 550</Radio>
          <Radio value="2">no limit</Radio>
        </RadioGroup>
        <!-- 防连点 -->
        <div>
          <Checkbox v-model:checked="orderSettings.preventRapidOrder"
            >No Combo</Checkbox
          >
        </div>
        <!-- 涨跌停锁 -->
        <div>
          <Checkbox v-model:checked="orderSettings.lockLimit" /> Lock Limit
        </div>
        <!-- 涨跌停价位 -->
        <div>涨停：0</div>
        <div>跌停：0</div>
        <!-- C 为撤单数，T 为下单数 -->
        <div>C：0 T:0</div>
      </div>
      <div>
        <div>0</div>
        <strong>P</strong>
      </div>
    </Col>
    <Col :span="18">
      <Table :columns="columns" :data="data" />
    </Col>
  </Row>
</template>

<script setup>
import { ref } from "vue";
import {
  Row,
  Col,
  InputNumber,
  RadioGroup,
  Radio,
  Checkbox,
} from "ant-design-vue";

const data = ref([]);
const columns = ref([]);

// 这里填充你的数据
const contractInfo = ref({
  /* ... */
});
const orderSettings = ref({
  /* ... */
});
const riskControl = ref({
  /* ... */
});
const orderBook = ref([]);
const positionInfo = ref({
  /* ... */
});
</script>

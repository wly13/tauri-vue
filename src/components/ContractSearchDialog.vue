<template>
  <a-modal
    v-model:open="visible"
    title="合约订阅与管理"
    width="800px"
    :footer="null"
    :mask-closable="false"
    class="contract-search-dialog"
  >
    <!-- 搜索框 -->
    <div class="search-container">
      <a-input
        v-model:value="searchKeyword"
        placeholder="搜索合约代码或名称..."
        size="large"
        class="search-input"
        @input="handleSearch"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input>
    </div>

    <!-- 合约列表 -->
    <div class="contract-list-container">
      <div class="contract-header">
        <div class="header-item contract-code">合约代码</div>
        <div class="header-item contract-name">合约名称</div>
        <div class="header-item contract-price">最新价</div>
        <div class="header-item contract-change">涨跌幅</div>
        <div class="header-item contract-volume">成交量</div>
      </div>

      <div class="contract-content">
        <!-- 按分类显示合约 -->
        <div
          v-for="category in filteredCategories"
          :key="category.code"
          class="contract-category"
        >
          <div class="category-header">
            <span class="category-name">{{ category.name }}({{ category.code }})</span>
            <span class="category-count">{{ category.contracts.length }}个合约</span>
          </div>

          <div class="category-contracts">
            <div
              v-for="contract in category.contracts"
              :key="contract.code"
              class="contract-item"
              :class="{ 'selected': selectedContract?.code === contract.code }"
              @click="selectContract(contract)"
              @dblclick="openContractPanel(contract)"
            >
              <div class="contract-checkbox">
                <a-checkbox
                  :checked="selectedContract?.code === contract.code"
                  @click.stop="selectContract(contract)"
                />
              </div>
              <div class="contract-code">{{ contract.code }}</div>
              <div class="contract-name">{{ contract.name }}</div>
              <div class="contract-price">
                {{ contract.lastPrice ? formatPrice(contract.lastPrice) : '--' }}
              </div>
              <div class="contract-change" :class="getChangeClass(contract.changePercent)">
                {{ contract.changePercent ? formatPercent(contract.changePercent) : '--' }}
              </div>
              <div class="contract-volume">
                {{ contract.volume ? formatVolume(contract.volume) : '--' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 无搜索结果 -->
        <div v-if="filteredCategories.length === 0" class="no-results">
          <a-empty description="未找到匹配的合约" />
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="dialog-footer">
      <div class="footer-info">
        <span v-if="selectedContract">
          已选择: {{ selectedContract.name }} ({{ selectedContract.code }})
        </span>
      </div>
      <div class="footer-actions">
        <a-button @click="closeDialog">取消</a-button>
        <a-button
          type="primary"
          :disabled="!selectedContract"
          @click="openContractPanel(selectedContract)"
        >
          打开合约面板
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { ContractInfo, ContractCategory } from '@/types/trading'
import { contractService } from '@/services/contractService'

// Props
interface Props {
  visible: boolean
}

// Emits
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'contract-selected', contract: ContractInfo): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const searchKeyword = ref('')
const selectedContract = ref<ContractInfo | null>(null)
const allCategories = ref<ContractCategory[]>([])
const priceUpdateInterval = ref<number | null>(null)

// 计算属性
const filteredCategories = computed(() => {
  if (!searchKeyword.value.trim()) {
    return allCategories.value
  }

  const keyword = searchKeyword.value.toLowerCase().trim()
  
  return allCategories.value
    .map(category => ({
      ...category,
      contracts: category.contracts.filter(contract =>
        contract.code.toLowerCase().includes(keyword) ||
        contract.name.toLowerCase().includes(keyword) ||
        contract.category.toLowerCase().includes(keyword) ||
        contract.categoryCode.toLowerCase().includes(keyword) ||
        contract.fullCode.toLowerCase().includes(keyword)
      )
    }))
    .filter(category => category.contracts.length > 0)
})

// 方法
const handleSearch = () => {
  // 搜索时清除选择
  selectedContract.value = null
}

const selectContract = (contract: ContractInfo) => {
  selectedContract.value = contract
}

const openContractPanel = (contract: ContractInfo | null) => {
  if (!contract) {
    message.warning('请先选择一个合约')
    return
  }

  console.log('打开合约面板:', contract)
  
  // 发射合约选择事件
  emit('contract-selected', contract)
  
  // 关闭对话框
  closeDialog()
  
  message.success(`正在打开 ${contract.name} 合约面板`)
}

const closeDialog = () => {
  visible.value = false
  searchKeyword.value = ''
  selectedContract.value = null
}

// 格式化函数
const formatPrice = (price: number): string => {
  return price.toLocaleString()
}

const formatPercent = (percent: number): string => {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

const formatVolume = (volume: number): string => {
  if (volume >= 10000) {
    return `${(volume / 10000).toFixed(1)}万`
  }
  return volume.toLocaleString()
}

const getChangeClass = (changePercent?: number): string => {
  if (!changePercent) return ''
  if (changePercent > 0) return 'positive'
  if (changePercent < 0) return 'negative'
  return 'neutral'
}

// 更新价格数据
const updatePrices = () => {
  contractService.updateContractPrices()
  allCategories.value = contractService.getAllCategories()
}

// 生命周期
onMounted(() => {
  // 初始化数据
  allCategories.value = contractService.getAllCategories()
  
  // 启动价格更新定时器
  priceUpdateInterval.value = window.setInterval(updatePrices, 3000)
})

onUnmounted(() => {
  // 清理定时器
  if (priceUpdateInterval.value) {
    clearInterval(priceUpdateInterval.value)
    priceUpdateInterval.value = null
  }
})

// 监听对话框显示状态
watch(visible, (newVisible) => {
  if (newVisible) {
    // 对话框打开时刷新数据
    allCategories.value = contractService.getAllCategories()
    searchKeyword.value = ''
    selectedContract.value = null
  }
})
</script>

<style scoped>
.contract-search-dialog {
  .search-container {
    margin-bottom: 16px;
    
    .search-input {
      border-radius: 6px;
    }
  }

  .contract-list-container {
    height: 500px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    overflow: hidden;

    .contract-header {
      display: flex;
      background: #fafafa;
      border-bottom: 1px solid #d9d9d9;
      padding: 12px 16px;
      font-weight: 600;
      color: #262626;

      .header-item {
        &.contract-code { width: 100px; }
        &.contract-name { width: 120px; }
        &.contract-price { width: 100px; text-align: right; }
        &.contract-change { width: 100px; text-align: right; }
        &.contract-volume { width: 100px; text-align: right; }
      }
    }

    .contract-content {
      height: calc(100% - 49px);
      overflow-y: auto;

      .contract-category {
        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: #f0f0f0;
          border-bottom: 1px solid #d9d9d9;
          font-weight: 500;
          color: #595959;

          .category-name {
            font-size: 14px;
          }

          .category-count {
            font-size: 12px;
            color: #8c8c8c;
          }
        }

        .category-contracts {
          .contract-item {
            display: flex;
            align-items: center;
            padding: 8px 16px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: #f5f5f5;
            }

            &.selected {
              background: #e6f7ff;
              border-color: #91d5ff;
            }

            .contract-checkbox {
              width: 20px;
              margin-right: 8px;
            }

            .contract-code {
              width: 80px;
              font-family: 'Courier New', monospace;
              font-weight: 500;
            }

            .contract-name {
              width: 120px;
              color: #262626;
            }

            .contract-price {
              width: 100px;
              text-align: right;
              font-family: 'Courier New', monospace;
              font-weight: 500;
            }

            .contract-change {
              width: 100px;
              text-align: right;
              font-family: 'Courier New', monospace;
              font-weight: 500;

              &.positive { color: #cf1322; }
              &.negative { color: #389e0d; }
              &.neutral { color: #8c8c8c; }
            }

            .contract-volume {
              width: 100px;
              text-align: right;
              font-size: 12px;
              color: #8c8c8c;
            }
          }
        }
      }

      .no-results {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .footer-info {
      color: #595959;
      font-size: 14px;
    }

    .footer-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>

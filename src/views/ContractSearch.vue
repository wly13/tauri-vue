<template>
  <div class="contract-search-window">
    <!-- 搜索框 -->
    <div class="search-container">
      <Input
        v-model:value="searchKeyword"
        placeholder="搜索合约代码或名称..."
        size="large"
        class="search-input"
        @input="handleSearch"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </Input>
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
              <!-- <div class="contract-checkbox">
                <Checkbox
                  :checked="selectedContract?.code === contract.code"
                  @click.stop="selectContract(contract)"
                />
              </div> -->
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
          <Empty description="未找到匹配的合约" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { Button, Checkbox, Empty, Input, message } from 'ant-design-vue'
import { emit } from '@tauri-apps/api/event'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { ContractInfo, ContractCategory } from '@/types/trading'
import { contractService } from '@/services/contractService'
import { useContractStore } from '@/stores/contractStore'

// 响应式数据
const searchKeyword = ref('')
const selectedContract = ref<ContractInfo | null>(null)
const allCategories = ref<ContractCategory[]>([])
const priceUpdateInterval = ref<number | null>(null)

// 合约状态管理
const { setCurrentContract, setPanelContract } = useContractStore()

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
  openContractPanel(contract)
}

const openContractPanel = async (contract: ContractInfo | null) => {
  if (!contract) {
    message.warning('请先选择一个合约')
    return
  }

  console.log('打开合约面板:', contract)
  
  try {
    // 设置当前选中的合约
    setCurrentContract(contract)
    
    // 发送合约选择事件到主窗口
    await emit('contract-selected', contract)
    
    // 关闭搜索窗口
    closeWindow()
    
    message.success(`正在打开 ${contract.name} 合约面板`)
  } catch (error) {
    console.error('打开合约面板失败:', error)
    message.error('打开合约面板失败')
  }
}

const closeWindow = async () => {
  try {
    const currentWindow = getCurrentWindow()
    await currentWindow.close()
  } catch (error) {
    console.error('关闭窗口失败:', error)
  }
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
onMounted(async () => {
  // 初始化数据
  allCategories.value = contractService.getAllCategories()

  // 启动价格更新定时器
  priceUpdateInterval.value = window.setInterval(updatePrices, 3000)

  // 监听窗口失去焦点事件，失去焦点时关闭窗口
  const currentWindow = getCurrentWindow()

  // 监听窗口失去焦点
  const unlistenBlur = await currentWindow.listen('tauri://blur', () => {
    console.log('搜索窗口失去焦点，准备关闭')
    // 延迟一点时间关闭，避免点击窗口内元素时立即关闭
    setTimeout(() => {
      closeWindow()
    }, 100)
  })

  // 存储取消监听函数，在组件卸载时清理
  ;(window as any).__unlistenBlur = unlistenBlur
})

onUnmounted(() => {
  // 清理定时器
  if (priceUpdateInterval.value) {
    clearInterval(priceUpdateInterval.value)
    priceUpdateInterval.value = null
  }

  // 清理窗口事件监听器
  const unlistenBlur = (window as any).__unlistenBlur
  if (unlistenBlur && typeof unlistenBlur === 'function') {
    unlistenBlur()
    delete (window as any).__unlistenBlur
  }
})
</script>

<style scoped>
.contract-search-window {
  padding: 16px;
  background-color: #0d1117;
  color: #c9d1d9;
  height: 100vh;
  display: flex;
  flex-direction: column;
  
  .search-container {
    margin-bottom: 16px;
    
    .search-input {
      border-radius: 6px;
      background-color: #161b22;
      border-color: #30363d;
      color: #c9d1d9;
      
      :deep(.ant-input) {
        background-color: #161b22;
        color: #c9d1d9;
      }
      
      :deep(.ant-input-prefix) {
        color: #8b949e;
      }
    }
  }

  .contract-list-container {
    flex: 1;
    border: 1px solid #30363d;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .contract-header {
      display: flex;
      background: #161b22;
      border-bottom: 1px solid #30363d;
      padding: 12px 16px;
      font-weight: 600;
      color: #c9d1d9;

      .header-item {
        &.contract-code { width: 100px; }
        &.contract-name { width: 120px; }
        &.contract-price { width: 100px; text-align: right; }
        &.contract-change { width: 100px; text-align: right; }
        &.contract-volume { width: 100px; text-align: right; }
      }
    }

    .contract-content {
      flex: 1;
      overflow-y: auto;
      background-color: #0d1117;

      .contract-category {
        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: #161b22;
          border-bottom: 1px solid #30363d;
          font-weight: 500;
          color: #8b949e;

          .category-name {
            font-size: 14px;
          }

          .category-count {
            font-size: 12px;
            color: #8b949e;
          }
        }

        .category-contracts {
          .contract-item {
            display: flex;
            align-items: center;
            padding: 8px 16px;
            border-bottom: 1px solid #21262d;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: #161b22;
            }

            &.selected {
              background: #1f6feb33;
              border-color: #1f6feb;
            }

            .contract-checkbox {
              width: 20px;
              margin-right: 8px;
            }

            .contract-code {
              width: 80px;
              font-family: 'Courier New', monospace;
              font-weight: 500;
              color: #c9d1d9;
            }

            .contract-name {
              width: 120px;
              color: #c9d1d9;
            }

            .contract-price {
              width: 100px;
              text-align: right;
              font-family: 'Courier New', monospace;
              font-weight: 500;
              color: #c9d1d9;
            }

            .contract-change {
              width: 100px;
              text-align: right;
              font-family: 'Courier New', monospace;
              font-weight: 500;

              &.positive { color: #f85149; }
              &.negative { color: #7ee787; }
              &.neutral { color: #8b949e; }
            }

            .contract-volume {
              width: 100px;
              text-align: right;
              font-size: 12px;
              color: #8b949e;
            }
          }
        }
      }

      .no-results {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        color: #8b949e;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #30363d;

    .footer-info {
      color: #8b949e;
      font-size: 14px;
    }

    .footer-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>

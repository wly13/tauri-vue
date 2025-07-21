# CTP查询功能使用指南

## 概述

现在已经实现了 `queryAccount` 和 `queryPosition` 功能，可以查询账户资金和持仓信息。

## 功能说明

### 1. 账户资金查询 (queryAccount)

**功能**: 查询当前账户的资金状况

**返回信息**:
- 可用资金 (available)
- 账户余额 (balance) 
- 保证金占用 (curr_margin)
- 冻结资金 (frozen_cash)
- 持仓盈亏 (position_profit)
- 平仓盈亏 (close_profit)
- 手续费 (commission)

**使用方法**:
```typescript
const accountResult = await ctpService.queryAccount()
if (accountResult.success) {
  console.log('可用资金:', accountResult.data.available)
  console.log('账户余额:', accountResult.data.balance)
} else {
  console.error('查询失败:', accountResult.error)
}
```

### 2. 持仓信息查询 (queryPosition)

**功能**: 查询当前所有持仓

**返回信息**:
- 合约代码 (instrument_id)
- 持仓方向 (posi_direction): "2"=多头, "3"=空头
- 持仓数量 (position)
- 今日持仓 (today_position)
- 昨日持仓 (yd_position)
- 持仓成本 (position_cost)
- 持仓盈亏 (position_profit)
- 占用保证金 (use_margin)

**使用方法**:
```typescript
const positionResult = await ctpService.queryPosition()
if (positionResult.success) {
  const positions = positionResult.data || []
  positions.forEach(pos => {
    console.log(`${pos.instrument_id}: ${pos.posi_direction === '2' ? '多' : '空'} ${pos.position}手`)
  })
} else {
  console.error('查询失败:', positionResult.error)
}
```

## 在TradingPanel中的集成

### 自动查询

TradingPanel在初始化时会自动调用查询功能：

```typescript
// 在 loadAccountAndPositionData 函数中
const accountResult = await ctpService.queryAccount()
if (accountResult.success) {
  accountInfo.value = accountResult.data
}

const positionResult = await ctpService.queryPosition()
if (positionResult.success) {
  positionInfo.value = positionResult.data
}
```

### 界面显示

账户信息会显示在交易面板的持仓信息区域：

```vue
<div v-if="isUsingRealData && accountInfo">
  <div>可用: {{ Math.round(accountInfo.available) }}</div>
  <div>余额: {{ Math.round(accountInfo.balance) }}</div>
</div>
```

## 测试功能

### 使用测试工具

可以使用内置的测试工具验证查询功能：

```typescript
import { runQueryTest, testAccountQuery, testPositionQuery } from '../utils/queryTest'

// 运行完整查询测试
await runQueryTest()

// 单独测试账户查询
const accountOk = await testAccountQuery()

// 单独测试持仓查询
const positionOk = await testPositionQuery()
```

### 在TradingPanel中测试

1. 打开TradingPanel页面
2. 确保已经登录CTP
3. 点击"测试CTP"按钮
4. 查看控制台输出的查询结果

## 当前实现状态

### ✅ 已实现

1. **前端接口**: 
   - `ctpService.queryAccount()`
   - `ctpService.queryPosition()`

2. **后端命令**:
   - `query_account`
   - `query_position`

3. **数据结构**:
   - `AccountInfo` 完整的账户信息结构
   - `PositionInfo` 完整的持仓信息结构

4. **测试工具**:
   - 独立的查询测试模块
   - 集成到TradingPanel的测试功能

### 🔄 当前使用模拟数据

由于CTP的异步特性，当前后端返回的是模拟数据：

**模拟账户数据**:
- 账户余额: 100,000
- 可用资金: 95,000
- 期货公司: 9999

**模拟持仓数据**:
- 合约: rb2509
- 方向: 多头
- 数量: 2手
- 持仓盈亏: -40

### 🎯 真实数据集成计划

要使用真实的CTP查询数据，需要：

1. **完善CTP回调处理**:
   - 实现 `OnRspQryTradingAccount` 回调
   - 实现 `OnRspQryInvestorPosition` 回调

2. **异步查询机制**:
   - 发送查询请求
   - 等待CTP回调
   - 返回真实数据

3. **错误处理**:
   - 查询失败处理
   - 超时处理
   - 重试机制

## 使用注意事项

### 前置条件

1. **CTP连接**: 必须先建立CTP连接
2. **交易登录**: 必须完成Trader API登录
3. **网络稳定**: 确保网络连接稳定

### 调用频率

- 账户查询: 建议每30秒查询一次
- 持仓查询: 建议在交易后或每分钟查询一次
- 避免频繁查询以免触发CTP限流

### 错误处理

```typescript
try {
  const result = await ctpService.queryAccount()
  if (!result.success) {
    console.error('查询失败:', result.error)
    // 处理查询失败的情况
  }
} catch (error) {
  console.error('查询异常:', error)
  // 处理网络或其他异常
}
```

## 示例代码

### 完整的查询示例

```typescript
async function updateAccountAndPosition() {
  try {
    // 查询账户
    const accountResult = await ctpService.queryAccount()
    if (accountResult.success) {
      const account = accountResult.data
      console.log('账户信息更新:', {
        可用资金: account.available,
        账户余额: account.balance,
        持仓盈亏: account.position_profit
      })
    }

    // 查询持仓
    const positionResult = await ctpService.queryPosition()
    if (positionResult.success) {
      const positions = positionResult.data || []
      console.log('持仓信息更新:', positions.map(pos => ({
        合约: pos.instrument_id,
        方向: pos.posi_direction === '2' ? '多' : '空',
        数量: pos.position,
        盈亏: pos.position_profit
      })))
    }
  } catch (error) {
    console.error('查询更新失败:', error)
  }
}
```

---

**注意**: 当前版本使用模拟数据进行功能验证，后续版本将集成真实的CTP查询数据。

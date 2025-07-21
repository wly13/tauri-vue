# 实时行情更新和价格居中功能指南

## 功能概述

TradingPanel现在支持实时更新行情数据，并且当前价格所在的行会始终居于表格中间，同时具有特殊的高亮显示效果。

## 新增功能

### 1. 实时价格更新

**功能描述**:
- 当接收到新的行情数据时，自动更新当前价格
- 支持真实CTP数据和模拟数据两种模式
- 价格变化时会触发表格滚动

**实现方式**:
```typescript
// 实时更新当前价格并滚动到中心
const updateCurrentPriceAndScroll = (newPrice: number) => {
  const oldPrice = currentPrice.value
  currentPrice.value = Math.round(newPrice)
  
  // 如果价格发生变化，滚动到新位置
  if (Math.abs(oldPrice - currentPrice.value) >= 1) {
    setTimeout(() => {
      scrollToCurrentPrice()
    }, 100)
  }
}
```

### 2. 价格行居中显示

**功能描述**:
- 当前价格所在的行始终保持在表格视窗的中间位置
- 价格变化时平滑滚动到新位置
- 支持自动查找价格在买盘或卖盘中的位置

**滚动算法**:
```typescript
const scrollToCurrentPrice = () => {
  // 1. 查找当前价格在数据中的位置
  // 2. 计算目标滚动位置（居中显示）
  // 3. 平滑滚动到目标位置
  
  const targetScrollTop = (targetRowIndex * rowHeight) - (containerHeight / 2) + (rowHeight / 2)
  tableContainer.value.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth'
  })
}
```

### 3. 当前价格行高亮

**视觉效果**:
- 当前价格行具有金黄色背景和边框
- 价格列有特殊的高亮样式
- 带有脉冲动画效果，增强视觉识别

**CSS样式**:
```css
.current-price-row {
  background-color: #fff3cd !important;
  border: 2px solid #ffc107 !important;
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(255, 193, 7, 0.4);
  animation: currentPricePulse 2s infinite;
}

.current-price-row .price-col {
  font-weight: bold;
  color: #856404 !important;
  background-color: #ffc107 !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
```

## 使用场景

### 1. 真实数据模式

当连接到真实CTP服务器时：
- 接收真实行情推送
- 价格变化时自动更新和滚动
- 提供最准确的市场信息

### 2. 增强模拟模式

在增强模拟模式下：
- 模拟真实的价格波动趋势
- 包含上涨、下跌、震荡等不同趋势
- 价格变化更加真实

### 3. 基础模拟模式

在基础模拟模式下：
- 简单的随机价格变化
- 用于界面功能测试
- 价格变化频率较低

## 技术实现

### 数据流程

```
行情数据源 → updatePricesFromMarketData() → updateCurrentPriceAndScroll() → scrollToCurrentPrice()
     ↓                    ↓                           ↓                         ↓
  CTP/模拟数据        更新价格显示              判断是否需要滚动            执行平滑滚动
```

### 关键函数

1. **updateCurrentPriceAndScroll()**
   - 更新当前价格
   - 判断是否需要滚动
   - 触发滚动动作

2. **scrollToCurrentPrice()**
   - 查找当前价格在表格中的位置
   - 计算居中滚动位置
   - 执行平滑滚动

3. **isCurrentPriceRow()**
   - 判断某行是否为当前价格行
   - 用于应用高亮样式
   - 支持价格匹配容差

### 性能优化

1. **滚动节流**:
   - 价格变化小于1时不触发滚动
   - 避免频繁的滚动操作

2. **延迟执行**:
   - DOM更新后再执行滚动
   - 确保滚动位置准确

3. **平滑动画**:
   - 使用CSS transition和animation
   - 提供良好的视觉体验

## 配置选项

### 滚动行为配置

```typescript
// 可以调整的参数
const scrollBehavior = 'smooth'  // 'smooth' | 'auto'
const priceMatchTolerance = 0.5  // 价格匹配容差
const scrollDelay = 100          // 滚动延迟（毫秒）
```

### 样式配置

```css
/* 可以自定义的样式变量 */
--current-price-bg: #fff3cd;
--current-price-border: #ffc107;
--current-price-shadow: rgba(255, 193, 7, 0.4);
--animation-duration: 2s;
```

## 使用示例

### 手动触发滚动

```typescript
// 在任何时候手动滚动到当前价格
scrollToCurrentPrice()
```

### 更新价格并滚动

```typescript
// 更新价格并自动滚动
updateCurrentPriceAndScroll(3075)
```

### 检查是否为当前价格行

```typescript
// 在模板中使用
:class="{ 'current-price-row': isCurrentPriceRow(item.price) }"
```

## 故障排除

### 常见问题

1. **滚动不生效**
   - 检查tableContainer是否正确绑定
   - 确认DOM已完全渲染
   - 验证价格数据是否正确

2. **高亮显示异常**
   - 检查isCurrentPriceRow函数逻辑
   - 确认价格匹配容差设置
   - 验证CSS样式是否正确加载

3. **性能问题**
   - 减少价格更新频率
   - 增加滚动节流时间
   - 优化动画效果

### 调试方法

```typescript
// 开启调试日志
console.log('📍 滚动到当前价格:', {
  currentPrice: currentPriceValue,
  targetRowIndex,
  targetScrollTop
})
```

## 未来改进

### 计划功能

1. **多合约支持**
   - 支持多个合约的价格跟踪
   - 切换合约时自动滚动

2. **自定义滚动行为**
   - 用户可选择滚动模式
   - 支持关闭自动滚动

3. **价格预警**
   - 价格到达指定位置时提醒
   - 支持声音和视觉提醒

4. **历史价格轨迹**
   - 显示价格变化轨迹
   - 支持价格走势分析

---

**总结**: 新的实时价格更新和居中显示功能大大提升了交易界面的用户体验，让用户能够更直观地跟踪价格变化，提高交易效率。

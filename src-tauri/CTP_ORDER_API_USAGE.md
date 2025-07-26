# CTP 下单和撤单接口使用说明

## 概述

本文档描述了如何使用封装好的CTP下单和撤单接口。

## 接口说明

### 1. 下单接口 (insert_order)

#### 函数签名
```rust
pub fn insert_order(session_id: String, order: OrderRequest) -> ApiResponse<String>
```

#### 参数说明

**OrderRequest 结构体：**
```rust
pub struct OrderRequest {
    pub instrument_id: String,        // 合约代码，如 "rb2501"
    pub direction: String,            // 买卖方向："0"=买入, "1"=卖出
    pub price: f64,                   // 价格
    pub volume: i32,                  // 数量
    pub order_type: String,           // 报单类型："1"=市价单, "2"=限价单
    pub offset_flag: Option<String>,  // 开平标志："0"=开仓, "1"=平仓
    pub hedge_flag: Option<String>,   // 投机套保："1"=投机, "2"=套利, "3"=套保
    pub time_condition: Option<String>, // 有效期类型："1"=IOC, "3"=当日有效
    pub volume_condition: Option<String>, // 成交量类型："1"=任何数量
}
```

#### 使用示例

**JavaScript/TypeScript 调用：**
```javascript
import { invoke } from '@tauri-apps/api/tauri';

// 下单示例
async function placeOrder() {
    try {
        const orderRequest = {
            instrument_id: "rb2501",     // 螺纹钢2501合约
            direction: "0",              // 买入
            price: 3500.0,               // 价格3500
            volume: 1,                   // 1手
            order_type: "2",             // 限价单
            offset_flag: "0",            // 开仓
            hedge_flag: "1",             // 投机
            time_condition: "3",         // 当日有效
            volume_condition: "1"        // 任何数量
        };

        const result = await invoke('insert_order', {
            sessionId: 'your_session_id',
            order: orderRequest
        });

        if (result.success) {
            console.log('下单成功:', result.data);
        } else {
            console.error('下单失败:', result.error);
        }
    } catch (error) {
        console.error('调用失败:', error);
    }
}
```

### 2. 撤单接口 (cancel_order)

#### 函数签名
```rust
pub fn cancel_order(session_id: String, cancel_request: CancelOrderRequest) -> ApiResponse<String>
```

#### 参数说明

**CancelOrderRequest 结构体：**
```rust
pub struct CancelOrderRequest {
    pub order_ref: String,              // 报单引用（必填）
    pub front_id: Option<i32>,          // 前置编号（可选）
    pub session_id: Option<i32>,        // 会话编号（可选）
    pub exchange_id: Option<String>,    // 交易所代码（可选）
    pub order_sys_id: Option<String>,   // 报单编号（可选）
    pub instrument_id: String,          // 合约代码（必填）
}
```

#### 使用示例

**JavaScript/TypeScript 调用：**
```javascript
// 撤单示例
async function cancelOrder() {
    try {
        const cancelRequest = {
            order_ref: "123",            // 订单引用（从下单返回结果中获取）
            instrument_id: "rb2501",     // 合约代码
            front_id: 1,                 // 前置编号（可选）
            session_id: 12345,           // 会话编号（可选）
            exchange_id: "SHFE",         // 交易所代码（可选）
            order_sys_id: "987654"       // 报单编号（可选）
        };

        const result = await invoke('cancel_order', {
            sessionId: 'your_session_id',
            cancelRequest: cancelRequest
        });

        if (result.success) {
            console.log('撤单成功:', result.data);
        } else {
            console.error('撤单失败:', result.error);
        }
    } catch (error) {
        console.error('调用失败:', error);
    }
}
```

## 常用参数值说明

### 买卖方向 (direction)
- "0": 买入
- "1": 卖出

### 报单类型 (order_type)
- "1": 市价单
- "2": 限价单

### 开平标志 (offset_flag)
- "0": 开仓
- "1": 平仓
- "3": 强平
- "4": 平今

### 投机套保标志 (hedge_flag)
- "1": 投机
- "2": 套利
- "3": 套保

### 有效期类型 (time_condition)
- "1": 立即完成，否则撤销(IOC)
- "3": 当日有效(GFD)
- "4": 指定日期前有效(GTD)

### 成交量类型 (volume_condition)
- "1": 任何数量
- "2": 最小数量
- "3": 全部数量

## 注意事项

1. **登录状态**: 调用下单和撤单接口前，必须先调用 `trader_login` 接口登录交易系统。

2. **会话管理**: `session_id` 必须与登录时使用的会话ID一致。

3. **订单引用**: 下单成功后会返回订单引用，撤单时需要使用这个引用。

4. **错误处理**: 所有接口都返回 `ApiResponse<String>` 结构，需要检查 `success` 字段判断是否成功。

5. **合约代码**: 确保使用正确的合约代码格式，如 "rb2501"（螺纹钢2025年1月合约）。

6. **价格精度**: 不同合约的价格精度可能不同，请根据交易所规则设置合适的价格。

## 完整示例

```javascript
// 完整的下单和撤单流程示例
async function tradingExample() {
    const sessionId = 'your_session_id';
    
    try {
        // 1. 先确保已登录
        // await invoke('trader_login', { sessionId, config: loginConfig });
        
        // 2. 下单
        const orderRequest = {
            instrument_id: "rb2501",
            direction: "0",              // 买入
            price: 3500.0,
            volume: 1,
            order_type: "2",             // 限价单
            offset_flag: "0",            // 开仓
            hedge_flag: "1"              // 投机
        };
        
        const orderResult = await invoke('insert_order', {
            sessionId,
            order: orderRequest
        });
        
        if (orderResult.success) {
            console.log('下单成功:', orderResult.data);
            
            // 从返回消息中提取订单引用
            const orderRef = extractOrderRef(orderResult.data);
            
            // 3. 如果需要撤单
            setTimeout(async () => {
                const cancelRequest = {
                    order_ref: orderRef,
                    instrument_id: "rb2501"
                };
                
                const cancelResult = await invoke('cancel_order', {
                    sessionId,
                    cancelRequest
                });
                
                if (cancelResult.success) {
                    console.log('撤单成功:', cancelResult.data);
                } else {
                    console.error('撤单失败:', cancelResult.error);
                }
            }, 5000); // 5秒后撤单
            
        } else {
            console.error('下单失败:', orderResult.error);
        }
        
    } catch (error) {
        console.error('交易操作失败:', error);
    }
}

// 从返回消息中提取订单引用的辅助函数
function extractOrderRef(message) {
    const match = message.match(/订单引用:\s*(\d+)/);
    return match ? match[1] : null;
}
```

## API 响应格式

所有接口都返回统一的响应格式：

```rust
pub struct ApiResponse<T> {
    pub success: bool,      // 是否成功
    pub data: Option<T>,    // 成功时的数据
    pub error: Option<String>, // 失败时的错误信息
}
```

成功示例：
```json
{
    "success": true,
    "data": "订单已提交，订单引用: 123",
    "error": null
}
```

失败示例：
```json
{
    "success": false,
    "data": null,
    "error": "CTP 交易 API 未连接，请先登录"
}
```

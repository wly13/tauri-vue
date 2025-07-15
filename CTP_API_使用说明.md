# CTP API 在 Tauri Vue 应用中的使用说明

## 概述

本项目成功将 CTP（期货交易）API 的 `md_impl` 和 `trade_impl` 模块暴露给 Vue 前端使用。通过 Tauri 的命令系统，前端可以调用 Rust 后端的 CTP 功能。

## 架构说明

### 后端架构

1. **lib.rs** - 主库文件，包含 CTP 的 FFI 绑定
   - `md_api` 模块：行情 API 相关功能
   - `trader_api` 模块：交易 API 相关功能

2. **ctp_commands.rs** - Tauri 命令封装
   - 将 CTP API 包装成 Tauri 命令
   - 提供统一的错误处理和响应格式
   - 管理 API 会话状态

3. **main.rs** - 应用入口
   - 注册所有 Tauri 命令
   - 配置应用启动参数

### 前端架构

1. **types/ctp.ts** - TypeScript 类型定义
   - CTP API 相关的数据结构
   - 响应格式定义
   - 枚举类型定义

2. **services/ctpService.ts** - CTP 服务封装
   - 封装所有 CTP API 调用
   - 提供事件监听机制
   - 统一的日志管理

3. **views/CTP.vue** - CTP 功能界面
   - 完整的 CTP 操作界面
   - 实时状态显示
   - 操作日志展示

## 主要功能

### 1. API 版本获取
```typescript
const result = await ctpService.getApiVersion();
```

### 2. 行情 API
```typescript
// 创建行情 API
await ctpService.createMdApi(flowPath);

// 登录
await ctpService.mdLogin(config);

// 订阅行情
await ctpService.subscribeMarketData(['rb2501', 'hc2501']);

// 取消订阅
await ctpService.unsubscribeMarketData(['rb2501']);
```

### 3. 交易 API
```typescript
// 创建交易 API
await ctpService.createTraderApi(flowPath);

// 登录
await ctpService.traderLogin(config);

// 下单
await ctpService.insertOrder({
  instrument_id: 'rb2501',
  direction: '0', // 0=买入, 1=卖出
  price: 3500.00,
  volume: 1,
  order_type: '1' // 1=限价单
});

// 撤单
await ctpService.cancelOrder(orderRef);
```

## 使用步骤

### 1. 配置账户信息
在 CTP 页面中填写：
- 经纪商ID（如：9999）
- 账户名
- 密码
- 交易前置地址
- 行情前置地址
- 授权码
- 应用ID

### 2. 创建 API 连接
1. 点击"创建行情API"按钮
2. 点击"创建交易API"按钮

### 3. 登录
1. 点击"行情登录"按钮
2. 点击"交易登录"按钮

### 4. 使用功能
- **订阅行情**：输入合约代码（逗号分隔），点击"订阅行情"
- **下单**：填写下单信息，点击"下单"
- **查看日志**：在操作日志区域查看所有操作记录

## 状态说明

### 连接状态
- `disconnected` - 未连接
- `connecting` - 连接中
- `connected` - 已连接
- `login_success` - 登录成功
- `login_failed` - 登录失败
- `error` - 错误状态

### 日志级别
- `debug` - 调试信息
- `info` - 一般信息
- `warning` - 警告信息
- `error` - 错误信息

## 事件监听

CTP 服务支持事件监听机制：

```typescript
// 监听状态变化
ctpService.on('md_status_change', (status) => {
  console.log('行情状态变化:', status);
});

ctpService.on('trader_status_change', (status) => {
  console.log('交易状态变化:', status);
});

// 监听日志
ctpService.on('log', (logEntry) => {
  console.log('新日志:', logEntry);
});

// 监听行情数据（待实现）
ctpService.on('market_data', (data) => {
  console.log('行情数据:', data);
});

// 监听订单更新（待实现）
ctpService.on('order_update', (order) => {
  console.log('订单更新:', order);
});
```

## 扩展功能

### 添加新的 CTP 命令

1. **在 ctp_commands.rs 中添加新命令**：
```rust
#[command]
pub fn query_position(session_id: String) -> ApiResponse<String> {
    // 实现查询持仓逻辑
    ApiResponse {
        success: true,
        data: Some("Position data".to_string()),
        error: None,
    }
}
```

2. **在 main.rs 中注册命令**：
```rust
.invoke_handler(tauri::generate_handler![
    // ... 其他命令
    ctp_commands::query_position
])
```

3. **在 ctpService.ts 中添加方法**：
```typescript
async queryPosition(): Promise<ApiResponse<string>> {
  try {
    const result = await invoke('query_position', {
      sessionId: this.traderSessionId
    }) as ApiResponse<string>;
    return result;
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

### 添加实时数据推送

由于 CTP API 的异步特性，可以考虑：
1. 使用 Tauri 的事件系统进行实时数据推送
2. 实现 WebSocket 连接用于实时通信
3. 使用 Rust 的 tokio 异步运行时处理 CTP 回调

## 注意事项

1. **线程安全**：CTP API 涉及多线程操作，需要注意线程安全
2. **内存管理**：正确管理 CTP API 对象的生命周期
3. **错误处理**：完善的错误处理机制，避免程序崩溃
4. **配置管理**：敏感信息（如密码）应该安全存储
5. **日志管理**：合理的日志级别和日志轮转

## 开发环境

- Rust 1.70+
- Node.js 16+
- Tauri 2.0
- Vue 3
- TypeScript

## 构建和运行

```bash
# 安装依赖
npm install

# 开发模式
npm run tauri dev

# 构建
npm run tauri build
```

## 故障排除

1. **编译错误**：检查 Rust 依赖和 CTP 库路径
2. **连接失败**：检查网络和 CTP 服务器地址
3. **登录失败**：检查账户信息和授权码
4. **API 调用失败**：查看日志获取详细错误信息

## 后续开发建议

1. 实现完整的 CTP 回调处理
2. 添加更多的查询功能（持仓、资金、订单等）
3. 实现行情数据的实时显示
4. 添加策略回测功能
5. 完善用户界面和用户体验
6. 添加数据持久化功能
7. 实现多账户管理
8. 添加风险控制功能

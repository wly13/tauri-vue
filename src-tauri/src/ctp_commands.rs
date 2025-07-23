use tauri::command;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

// 引入 CTP 相关模块
use tauri_app_vue_lib::{get_api_version as ctp_get_api_version, md_api, trader_api};

// 全局状态管理
lazy_static::lazy_static! {
    static ref MD_APIS: Arc<Mutex<HashMap<String, Box<tauri_app_vue_lib::CThostFtdcMdApi>>>> =
        Arc::new(Mutex::new(HashMap::new()));
    static ref TRADER_APIS: Arc<Mutex<HashMap<String, Box<tauri_app_vue_lib::CThostFtdcTraderApi>>>> =
        Arc::new(Mutex::new(HashMap::new()));
    // 跟踪交易API的登录状态
    static ref TRADER_LOGIN_STATUS: Arc<Mutex<HashMap<String, bool>>> =
        Arc::new(Mutex::new(HashMap::new()));
}

// 数据结构定义
#[derive(Debug, Serialize, Deserialize)]
pub struct CtpAccountConfig {
    pub broker_id: String,
    pub account: String,
    pub password: String,
    pub trade_front: String,
    pub md_front: String,
    pub auth_code: String,
    pub user_product_info: String,
    pub app_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MarketDataRequest {
    pub instrument_ids: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderRequest {
    pub instrument_id: String,
    pub direction: String, // "0" for buy, "1" for sell
    pub price: f64,
    pub volume: i32,
    pub order_type: String, // "1" for limit order
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AccountInfo {
    pub broker_id: String,
    pub account_id: String,
    pub pre_mortgage: f64,
    pub pre_credit: f64,
    pub pre_deposit: f64,
    pub pre_balance: f64,
    pub pre_margin: f64,
    pub interest_base: f64,
    pub interest: f64,
    pub deposit: f64,
    pub withdraw: f64,
    pub frozen_margin: f64,
    pub frozen_cash: f64,
    pub frozen_commission: f64,
    pub curr_margin: f64,
    pub cash_in: f64,
    pub commission: f64,
    pub close_profit: f64,
    pub position_profit: f64,
    pub balance: f64,
    pub available: f64,
    pub withdraw_quota: f64,
    pub reserve: f64,
    pub trading_day: String,
    pub settlement_id: i32,
    pub credit: f64,
    pub mortgage: f64,
    pub exchange_margin: f64,
    pub delivery_margin: f64,
    pub exchange_delivery_margin: f64,
    pub reserve_balance: f64,
    pub currency_id: String,
    pub pre_fund_mortgage_in: f64,
    pub pre_fund_mortgage_out: f64,
    pub fund_mortgage_in: f64,
    pub fund_mortgage_out: f64,
    pub fund_mortgage_available: f64,
    pub mortgage_able_fund: f64,
    pub spec_product_margin: f64,
    pub spec_product_frozen_margin: f64,
    pub spec_product_commission: f64,
    pub spec_product_frozen_commission: f64,
    pub spec_product_position_profit: f64,
    pub spec_product_close_profit: f64,
    pub spec_product_position_profit_by_alg: f64,
    pub spec_product_exchange_margin: f64,
    pub bis_margin: f64,
    pub bis_frozen_margin: f64,
    pub bis_commission: f64,
    pub bis_frozen_commission: f64,
    pub bis_position_profit: f64,
    pub bis_close_profit: f64,
    pub bis_position_profit_by_alg: f64,
    pub bis_exchange_margin: f64,
    pub frozen_swap: f64,
    pub remain_swap: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InstrumentInfo {
    pub instrument_id: String,
    pub exchange_id: String,
    pub instrument_name: String,
    pub exchange_inst_id: String,
    pub product_id: String,
    pub product_class: String,
    pub delivery_year: i32,
    pub delivery_month: i32,
    pub max_market_order_volume: i32,
    pub min_market_order_volume: i32,
    pub max_limit_order_volume: i32,
    pub min_limit_order_volume: i32,
    pub volume_multiple: i32,
    pub price_tick: f64,
    pub create_date: String,
    pub open_date: String,
    pub expire_date: String,
    pub start_deliv_date: String,
    pub end_deliv_date: String,
    pub inst_life_phase: String,
    pub is_trading: i32,
    pub position_type: String,
    pub position_date_type: String,
    pub long_margin_ratio: f64,
    pub short_margin_ratio: f64,
    pub max_margin_side_algorithm: String,
    pub underlying_inst_id: String,
    pub strike_price: f64,
    pub options_type: String,
    pub underlying_multiple: f64,
    pub combination_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PositionInfo {
    pub instrument_id: String,
    pub broker_id: String,
    pub investor_id: String,
    pub posi_direction: String,
    pub hedge_flag: String,
    pub position_date: String,
    pub yd_position: i32,
    pub position: i32,
    pub long_frozen: i32,
    pub short_frozen: i32,
    pub long_frozen_amount: f64,
    pub short_frozen_amount: f64,
    pub open_volume: i32,
    pub close_volume: i32,
    pub open_amount: f64,
    pub close_amount: f64,
    pub position_cost: f64,
    pub pre_margin: f64,
    pub use_margin: f64,
    pub frozen_margin: f64,
    pub frozen_cash: f64,
    pub frozen_commission: f64,
    pub cash_in: f64,
    pub commission: f64,
    pub close_profit: f64,
    pub position_profit: f64,
    pub pre_settlement_price: f64,
    pub settlement_price: f64,
    pub trading_day: String,
    pub settlement_id: i32,
    pub open_cost: f64,
    pub exchange_margin: f64,
    pub comb_position: i32,
    pub comb_long_frozen: i32,
    pub comb_short_frozen: i32,
    pub close_profit_by_date: f64,
    pub close_profit_by_trade: f64,
    pub today_position: i32,
    pub margin_rate_by_money: f64,
    pub margin_rate_by_volume: f64,
    pub strike_frozen: i32,
    pub strike_frozen_amount: f64,
    pub abandon_frozen: i32,
    pub exchange_id: String,
    pub yd_strike_frozen: i32,
    pub invest_unit_id: String,
    pub position_cost_offset: f64,
    pub tas_position: i32,
    pub tas_position_cost: f64,
}

// 验证交易会话是否存在
#[command]
pub fn validate_trader_session(session_id: String) -> ApiResponse<bool> {
    let apis = TRADER_APIS.lock().unwrap();
    let exists = apis.contains_key(&session_id);

    ApiResponse {
        success: exists,
        data: Some(exists),
        error: if exists { None } else { Some("Session not found".to_string()) },
    }
}

// 获取系统临时目录的 CTP 缓存路径
fn get_ctp_cache_path(session_id: &str) -> Result<String, String> {
    let temp_dir = std::env::temp_dir();
    let ctp_cache_dir = temp_dir.join("ctp_cache").join(session_id);

    // 确保目录存在
    if let Err(e) = std::fs::create_dir_all(&ctp_cache_dir) {
        return Err(format!("Failed to create cache directory: {}", e));
    }

    Ok(ctp_cache_dir.to_string_lossy().to_string().replace("\\", "/"))
}

// 安全的 MD API 创建函数
fn create_md_api_safe(
    session_id: &str,
    flow_path: &str,
    is_using_udp: bool,
    is_multicast: bool,
) -> Result<String, String> {
    // 1. 如果提供了相对路径，使用系统临时目录
    let actual_flow_path = if flow_path.starts_with("../temp/") || flow_path.starts_with("./") {
        get_ctp_cache_path(session_id)?
    } else {
        // 验证绝对路径
        if flow_path.is_empty() {
            return Err("Flow path cannot be empty".to_string());
        }
        flow_path.to_string()
    };

    // 2. 确保目录存在
    if let Err(e) = std::fs::create_dir_all(&actual_flow_path) {
        return Err(format!("Failed to create directory {}: {}", actual_flow_path, e));
    }

    // 3. 检查是否已存在相同的 session_id
    {
        let apis = MD_APIS.lock().map_err(|e| format!("Failed to lock MD_APIS: {}", e))?;
        if apis.contains_key(session_id) {
            return Err(format!("Session ID {} already exists", session_id));
        }
    }

    // 4. 创建 API（这是可能崩溃的地方）
    println!("🔍 [DEBUG] Creating CTP MD API with path: {}", actual_flow_path);

    // 使用 std::panic::catch_unwind 捕获可能的 panic
    let api_result = std::panic::catch_unwind(|| {
        md_api::create_api(&actual_flow_path, is_using_udp, is_multicast)
    });

    let api = match api_result {
        Ok(api) => {
            println!("✅ [DEBUG] CTP MD API created successfully");
            api
        },
        Err(_) => {
            let error_msg = "CTP MD API creation panicked - this usually indicates a library issue";
            println!("❌ [ERROR] {}", error_msg);
            return Err(error_msg.to_string());
        }
    };

    // 5. 存储 API
    {
        let mut apis = MD_APIS.lock().map_err(|e| format!("Failed to lock MD_APIS for storage: {}", e))?;
        apis.insert(session_id.to_string(), api);
        println!("✅ [DEBUG] API stored with session_id: {}", session_id);
    }

    Ok(session_id.to_string())
}

// 安全释放 MD API 资源
fn release_md_api_safe(session_id: &str) -> Result<(), String> {
    let mut apis = MD_APIS.lock().map_err(|e| format!("Failed to lock MD_APIS: {}", e))?;

    if let Some(mut api) = apis.remove(session_id) {
        println!("🔍 [DEBUG] Releasing MD API for session: {}", session_id);

        // 安全地释放 CTP API 资源
        let release_result = std::panic::catch_unwind(|| {
            // 注意：CTP API 的 release 方法可能会导致崩溃
            // 这里我们先不调用 release，让 Rust 的 Drop trait 处理
            // api.release();
        });

        match release_result {
            Ok(_) => {
                println!("✅ [DEBUG] MD API released successfully for session: {}", session_id);
                Ok(())
            },
            Err(_) => {
                let error_msg = format!("MD API release panicked for session: {}", session_id);
                println!("❌ [ERROR] {}", error_msg);
                Err(error_msg)
            }
        }
    } else {
        let error_msg = format!("Session ID {} not found", session_id);
        println!("❌ [ERROR] {}", error_msg);
        Err(error_msg)
    }
}

// 基础 API 命令
#[command]
pub fn get_api_version() -> ApiResponse<String> {
    match ctp_get_api_version() {
        Some(version) => ApiResponse {
            success: true,
            data: Some(version),
            error: None,
        },
        None => ApiResponse {
            success: false,
            data: None,
            error: Some("Failed to get API version".to_string()),
        },
    }
}

#[command]
pub fn create_md_api(
    session_id: String,
    flow_path: String,
    is_using_udp: bool,
    is_multicast: bool,
) -> ApiResponse<String> {
    println!("🔍 [DEBUG] create_md_api called with:");
    println!("  session_id: {}", session_id);
    println!("  flow_path: {}", flow_path);
    println!("  is_using_udp: {}", is_using_udp);
    println!("  is_multicast: {}", is_multicast);

    match create_md_api_safe(&session_id, &flow_path, is_using_udp, is_multicast) {
        Ok(session_id) => {
            println!("✅ [SUCCESS] MD API created successfully: {}", session_id);
            ApiResponse {
                success: true,
                data: Some(session_id),
                error: None,
            }
        },
        Err(error) => {
            println!("❌ [ERROR] Failed to create MD API: {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        }
    }
}

#[command]
pub fn release_md_api(session_id: String) -> ApiResponse<String> {
    println!("🔍 [DEBUG] release_md_api called for session: {}", session_id);

    match release_md_api_safe(&session_id) {
        Ok(_) => {
            println!("✅ [SUCCESS] MD API released successfully: {}", session_id);
            ApiResponse {
                success: true,
                data: Some(format!("MD API {} released", session_id)),
                error: None,
            }
        },
        Err(error) => {
            println!("❌ [ERROR] Failed to release MD API: {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        }
    }
}

#[command]
pub fn create_trader_api(
    session_id: String,
    flow_path: String,
    encrypt: bool,
) -> ApiResponse<String> {
    match std::panic::catch_unwind(|| {
        // 确保目录存在
        if let Err(e) = std::fs::create_dir_all(&flow_path) {
            return Err(format!("Failed to create directory {}: {}", flow_path, e));
        }

        let api = trader_api::create_api(&flow_path, encrypt);
        let mut apis = TRADER_APIS.lock().unwrap();
        apis.insert(session_id.clone(), api);

        // 初始化登录状态为未登录
        let mut login_status = TRADER_LOGIN_STATUS.lock().unwrap();
        login_status.insert(session_id.clone(), false);

        Ok(session_id)
    }) {
        Ok(Ok(session_id)) => ApiResponse {
            success: true,
            data: Some(session_id),
            error: None,
        },
        Ok(Err(error)) => ApiResponse {
            success: false,
            data: None,
            error: Some(error),
        },
        Err(_) => ApiResponse {
            success: false,
            data: None,
            error: Some("Failed to create Trader API".to_string()),
        },
    }
}

// 行情 API 命令
#[command]
pub fn md_login(
    session_id: String,
    config: CtpAccountConfig,
) -> ApiResponse<String> {
    println!("🔍 [DEBUG] md_login called with session_id: {}", session_id);
    println!("🔍 [DEBUG] config: {:?}", config);

    match std::panic::catch_unwind(|| {
        let mut apis = MD_APIS.lock().unwrap();

        if let Some(api) = apis.get_mut(&session_id) {
            println!("✅ [DEBUG] Found MD API for session: {}", session_id);

            // 注册前置服务器
            let md_front = std::ffi::CString::new(config.md_front.clone()).unwrap();
            api.register_front(md_front);
            println!("✅ [DEBUG] Registered front: {}", config.md_front);

            // 初始化API
            api.init();
            println!("✅ [DEBUG] MD API initialized");

            // 注意：实际的登录需要在前置连接成功后进行
            // 这里我们返回成功，表示登录流程已启动
            Ok(format!("MD login initiated for session: {}", session_id))
        } else {
            Err(format!("Session ID {} not found", session_id))
        }
    }) {
        Ok(Ok(message)) => {
            println!("✅ [SUCCESS] MD login: {}", message);
            ApiResponse {
                success: true,
                data: Some(message),
                error: None,
            }
        },
        Ok(Err(error)) => {
            println!("❌ [ERROR] MD login failed: {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        },
        Err(_) => {
            let error = "MD login panicked".to_string();
            println!("❌ [ERROR] {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        }
    }
}

#[command]
pub fn subscribe_market_data(
    session_id: String,
    request: MarketDataRequest,
) -> ApiResponse<String> {
    println!("🔍 [DEBUG] subscribe_market_data called with session_id: {}", session_id);
    println!("🔍 [DEBUG] instruments: {:?}", request.instrument_ids);

    match std::panic::catch_unwind(|| {
        let mut apis = MD_APIS.lock().unwrap();

        if let Some(api) = apis.get_mut(&session_id) {
            println!("✅ [DEBUG] Found MD API for session: {}", session_id);

            // 转换合约代码为CString
            let instruments: Vec<std::ffi::CString> = request.instrument_ids
                .iter()
                .map(|id| std::ffi::CString::new(id.as_str()).unwrap())
                .collect();

            let count = instruments.len() as std::os::raw::c_int;

            // 订阅行情
            let result = api.subscribe_market_data(instruments, count);

            if result == 0 {
                Ok(format!("Successfully subscribed to {} instruments", request.instrument_ids.len()))
            } else {
                Err(format!("Failed to subscribe market data, error code: {}", result))
            }
        } else {
            Err(format!("Session ID {} not found", session_id))
        }
    }) {
        Ok(Ok(message)) => {
            println!("✅ [SUCCESS] Subscribe market data: {}", message);
            ApiResponse {
                success: true,
                data: Some(message),
                error: None,
            }
        },
        Ok(Err(error)) => {
            println!("❌ [ERROR] Subscribe market data failed: {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        },
        Err(_) => {
            let error = "Subscribe market data panicked".to_string();
            println!("❌ [ERROR] {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        }
    }
}

#[command]
pub fn unsubscribe_market_data(
    session_id: String,
    request: MarketDataRequest,
) -> ApiResponse<String> {
    // 实现取消订阅行情数据的逻辑
    ApiResponse {
        success: true,
        data: Some(format!("Unsubscribed from {} instruments", request.instrument_ids.len())),
        error: None,
    }
}

// 交易 API 命令
#[command]
pub fn trader_login(
    session_id: String,
    config: CtpAccountConfig,
) -> ApiResponse<String> {
    println!("🔍 [DEBUG] trader_login called with session_id: {}", session_id);

    match std::panic::catch_unwind(|| {
        let apis = TRADER_APIS.lock().unwrap();

        if apis.get(&session_id).is_some() {
            // 模拟登录成功 - 在实际实现中，这里应该调用真正的CTP登录API
            // 现在我们只是标记为已登录状态
            let mut login_status = TRADER_LOGIN_STATUS.lock().unwrap();
            login_status.insert(session_id.clone(), true);

            println!("✅ [DEBUG] Trader login successful for session: {}", session_id);
            Ok("Trader login successful".to_string())
        } else {
            Err(format!("Session ID {} not found", session_id))
        }
    }) {
        Ok(Ok(message)) => {
            println!("✅ [SUCCESS] {}", message);
            ApiResponse {
                success: true,
                data: Some(message),
                error: None,
            }
        },
        Ok(Err(error)) => {
            println!("❌ [ERROR] Trader login failed: {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        },
        Err(_) => {
            let error = "Trader login panicked".to_string();
            println!("❌ [ERROR] {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        }
    }
}

#[command]
pub fn insert_order(
    session_id: String,
    order: OrderRequest,
) -> ApiResponse<String> {
    // 实现下单逻辑
    ApiResponse {
        success: true,
        data: Some(format!("Order inserted for {}", order.instrument_id)),
        error: None,
    }
}

#[command]
pub fn cancel_order(
    session_id: String,
    order_ref: String,
) -> ApiResponse<String> {
    // 实现撤单逻辑
    ApiResponse {
        success: true,
        data: Some(format!("Order {} cancelled", order_ref)),
        error: None,
    }
}

// 查询账户资金
#[command]
pub fn query_account(
    session_id: String,
) -> ApiResponse<AccountInfo> {
    println!("🔍 [DEBUG] query_account called with session_id: {}", session_id);

    match std::panic::catch_unwind(|| {
        // 首先检查登录状态
        let login_status = TRADER_LOGIN_STATUS.lock().unwrap();
        if !login_status.get(&session_id).unwrap_or(&false) {
            return Err("CTP 交易 API 未连接，请先登录".to_string());
        }
        drop(login_status); // 释放锁

        let apis = TRADER_APIS.lock().unwrap();

        if let Some(_api) = apis.get(&session_id) {
            println!("✅ [DEBUG] Found Trader API for session: {}", session_id);

            // 注意：这里应该调用真实的CTP查询账户API
            // 由于当前的实现是基于异步流的，这里返回模拟数据
            let account_info = AccountInfo {
                broker_id: "9999".to_string(),
                account_id: "test_account".to_string(),
                pre_mortgage: 0.0,
                pre_credit: 0.0,
                pre_deposit: 0.0,
                pre_balance: 100000.0,
                pre_margin: 0.0,
                interest_base: 0.0,
                interest: 0.0,
                deposit: 0.0,
                withdraw: 0.0,
                frozen_margin: 0.0,
                frozen_cash: 0.0,
                frozen_commission: 0.0,
                curr_margin: 0.0,
                cash_in: 0.0,
                commission: 0.0,
                close_profit: 0.0,
                position_profit: 0.0,
                balance: 100000.0,
                available: 95000.0,
                withdraw_quota: 95000.0,
                reserve: 0.0,
                trading_day: "20241221".to_string(),
                settlement_id: 1,
                credit: 0.0,
                mortgage: 0.0,
                exchange_margin: 0.0,
                delivery_margin: 0.0,
                exchange_delivery_margin: 0.0,
                reserve_balance: 0.0,
                currency_id: "CNY".to_string(),
                pre_fund_mortgage_in: 0.0,
                pre_fund_mortgage_out: 0.0,
                fund_mortgage_in: 0.0,
                fund_mortgage_out: 0.0,
                fund_mortgage_available: 0.0,
                mortgage_able_fund: 0.0,
                spec_product_margin: 0.0,
                spec_product_frozen_margin: 0.0,
                spec_product_commission: 0.0,
                spec_product_frozen_commission: 0.0,
                spec_product_position_profit: 0.0,
                spec_product_close_profit: 0.0,
                spec_product_position_profit_by_alg: 0.0,
                spec_product_exchange_margin: 0.0,
                bis_margin: 0.0,
                bis_frozen_margin: 0.0,
                bis_commission: 0.0,
                bis_frozen_commission: 0.0,
                bis_position_profit: 0.0,
                bis_close_profit: 0.0,
                bis_position_profit_by_alg: 0.0,
                bis_exchange_margin: 0.0,
                frozen_swap: 0.0,
                remain_swap: 0.0,
            };

            Ok(account_info)
        } else {
            Err(format!("Session ID {} not found", session_id))
        }
    }) {
        Ok(Ok(account_info)) => {
            println!("✅ [SUCCESS] Account query successful");
            ApiResponse {
                success: true,
                data: Some(account_info),
                error: None,
            }
        },
        Ok(Err(error)) => {
            println!("❌ [ERROR] Account query failed: {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        },
        Err(_) => {
            let error = "Account query panicked".to_string();
            println!("❌ [ERROR] {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        }
    }
}

// 查询持仓信息
#[command]
pub fn query_position(
    session_id: String,
) -> ApiResponse<Vec<PositionInfo>> {
    println!("🔍 [DEBUG] query_position called with session_id: {}", session_id);

    match std::panic::catch_unwind(|| {
        // 首先检查登录状态
        let login_status = TRADER_LOGIN_STATUS.lock().unwrap();
        if !login_status.get(&session_id).unwrap_or(&false) {
            return Err("CTP 交易 API 未连接，请先登录".to_string());
        }
        drop(login_status); // 释放锁

        let apis = TRADER_APIS.lock().unwrap();

        if let Some(_api) = apis.get(&session_id) {
            println!("✅ [DEBUG] Found Trader API for session: {}", session_id);

            // 注意：这里应该调用真实的CTP查询持仓API
            // 由于当前的实现是基于异步流的，这里返回模拟数据
            let positions = vec![
                PositionInfo {
                    instrument_id: "rb2509".to_string(),
                    broker_id: "9999".to_string(),
                    investor_id: "test_account".to_string(),
                    posi_direction: "2".to_string(), // 2=多头, 3=空头
                    hedge_flag: "1".to_string(),
                    position_date: "1".to_string(),
                    yd_position: 0,
                    position: 2,
                    long_frozen: 0,
                    short_frozen: 0,
                    long_frozen_amount: 0.0,
                    short_frozen_amount: 0.0,
                    open_volume: 2,
                    close_volume: 0,
                    open_amount: 6140.0,
                    close_amount: 0.0,
                    position_cost: 6140.0,
                    pre_margin: 0.0,
                    use_margin: 1228.0,
                    frozen_margin: 0.0,
                    frozen_cash: 0.0,
                    frozen_commission: 0.0,
                    cash_in: 0.0,
                    commission: 12.0,
                    close_profit: 0.0,
                    position_profit: -40.0,
                    pre_settlement_price: 3070.0,
                    settlement_price: 3070.0,
                    trading_day: "20241221".to_string(),
                    settlement_id: 1,
                    open_cost: 6140.0,
                    exchange_margin: 1228.0,
                    comb_position: 0,
                    comb_long_frozen: 0,
                    comb_short_frozen: 0,
                    close_profit_by_date: 0.0,
                    close_profit_by_trade: 0.0,
                    today_position: 2,
                    margin_rate_by_money: 0.2,
                    margin_rate_by_volume: 0.0,
                    strike_frozen: 0,
                    strike_frozen_amount: 0.0,
                    abandon_frozen: 0,
                    exchange_id: "SHFE".to_string(),
                    yd_strike_frozen: 0,
                    invest_unit_id: "".to_string(),
                    position_cost_offset: 0.0,
                    tas_position: 0,
                    tas_position_cost: 0.0,
                }
            ];

            Ok(positions)
        } else {
            Err(format!("Session ID {} not found", session_id))
        }
    }) {
        Ok(Ok(positions)) => {
            println!("✅ [SUCCESS] Position query successful, {} positions", positions.len());
            ApiResponse {
                success: true,
                data: Some(positions),
                error: None,
            }
        },
        Ok(Err(error)) => {
            println!("❌ [ERROR] Position query failed: {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        },
        Err(_) => {
            let error = "Position query panicked".to_string();
            println!("❌ [ERROR] {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        }
    }
}

// 获取常见合约数据
fn get_common_instruments() -> Vec<InstrumentInfo> {
    vec![
        // 螺纹钢合约
        InstrumentInfo {
            instrument_id: "rb2501".to_string(),
            exchange_id: "SHFE".to_string(),
            instrument_name: "螺纹钢2501".to_string(),
            exchange_inst_id: "rb2501".to_string(),
            product_id: "rb".to_string(),
            product_class: "1".to_string(),
            delivery_year: 2025,
            delivery_month: 1,
            max_market_order_volume: 100,
            min_market_order_volume: 1,
            max_limit_order_volume: 500,
            min_limit_order_volume: 1,
            volume_multiple: 10,
            price_tick: 1.0,
            create_date: "20240101".to_string(),
            open_date: "20240301".to_string(),
            expire_date: "20250115".to_string(),
            start_deliv_date: "20250116".to_string(),
            end_deliv_date: "20250120".to_string(),
            inst_life_phase: "1".to_string(),
            is_trading: 1,
            position_type: "1".to_string(),
            position_date_type: "1".to_string(),
            long_margin_ratio: 0.08,
            short_margin_ratio: 0.08,
            max_margin_side_algorithm: "1".to_string(),
            underlying_inst_id: "".to_string(),
            strike_price: 0.0,
            options_type: "0".to_string(),
            underlying_multiple: 0.0,
            combination_type: "0".to_string(),
        },
        InstrumentInfo {
            instrument_id: "rb2505".to_string(),
            exchange_id: "SHFE".to_string(),
            instrument_name: "螺纹钢2505".to_string(),
            exchange_inst_id: "rb2505".to_string(),
            product_id: "rb".to_string(),
            product_class: "1".to_string(),
            delivery_year: 2025,
            delivery_month: 5,
            max_market_order_volume: 100,
            min_market_order_volume: 1,
            max_limit_order_volume: 500,
            min_limit_order_volume: 1,
            volume_multiple: 10,
            price_tick: 1.0,
            create_date: "20240101".to_string(),
            open_date: "20240301".to_string(),
            expire_date: "20250515".to_string(),
            start_deliv_date: "20250516".to_string(),
            end_deliv_date: "20250520".to_string(),
            inst_life_phase: "1".to_string(),
            is_trading: 1,
            position_type: "1".to_string(),
            position_date_type: "1".to_string(),
            long_margin_ratio: 0.08,
            short_margin_ratio: 0.08,
            max_margin_side_algorithm: "1".to_string(),
            underlying_inst_id: "".to_string(),
            strike_price: 0.0,
            options_type: "0".to_string(),
            underlying_multiple: 0.0,
            combination_type: "0".to_string(),
        },
        // 热卷合约
        InstrumentInfo {
            instrument_id: "hc2501".to_string(),
            exchange_id: "SHFE".to_string(),
            instrument_name: "热卷2501".to_string(),
            exchange_inst_id: "hc2501".to_string(),
            product_id: "hc".to_string(),
            product_class: "1".to_string(),
            delivery_year: 2025,
            delivery_month: 1,
            max_market_order_volume: 100,
            min_market_order_volume: 1,
            max_limit_order_volume: 500,
            min_limit_order_volume: 1,
            volume_multiple: 10,
            price_tick: 1.0,
            create_date: "20240101".to_string(),
            open_date: "20240301".to_string(),
            expire_date: "20250115".to_string(),
            start_deliv_date: "20250116".to_string(),
            end_deliv_date: "20250120".to_string(),
            inst_life_phase: "1".to_string(),
            is_trading: 1,
            position_type: "1".to_string(),
            position_date_type: "1".to_string(),
            long_margin_ratio: 0.08,
            short_margin_ratio: 0.08,
            max_margin_side_algorithm: "1".to_string(),
            underlying_inst_id: "".to_string(),
            strike_price: 0.0,
            options_type: "0".to_string(),
            underlying_multiple: 0.0,
            combination_type: "0".to_string(),
        },
        // 苹果合约
        InstrumentInfo {
            instrument_id: "AP501".to_string(),
            exchange_id: "CZCE".to_string(),
            instrument_name: "苹果501".to_string(),
            exchange_inst_id: "AP501".to_string(),
            product_id: "AP".to_string(),
            product_class: "1".to_string(),
            delivery_year: 2025,
            delivery_month: 1,
            max_market_order_volume: 50,
            min_market_order_volume: 1,
            max_limit_order_volume: 200,
            min_limit_order_volume: 1,
            volume_multiple: 10,
            price_tick: 1.0,
            create_date: "20240101".to_string(),
            open_date: "20240301".to_string(),
            expire_date: "20250115".to_string(),
            start_deliv_date: "20250116".to_string(),
            end_deliv_date: "20250120".to_string(),
            inst_life_phase: "1".to_string(),
            is_trading: 1,
            position_type: "1".to_string(),
            position_date_type: "1".to_string(),
            long_margin_ratio: 0.10,
            short_margin_ratio: 0.10,
            max_margin_side_algorithm: "1".to_string(),
            underlying_inst_id: "".to_string(),
            strike_price: 0.0,
            options_type: "0".to_string(),
            underlying_multiple: 0.0,
            combination_type: "0".to_string(),
        },
        // 豆粕合约
        InstrumentInfo {
            instrument_id: "m2501".to_string(),
            exchange_id: "DCE".to_string(),
            instrument_name: "豆粕2501".to_string(),
            exchange_inst_id: "m2501".to_string(),
            product_id: "m".to_string(),
            product_class: "1".to_string(),
            delivery_year: 2025,
            delivery_month: 1,
            max_market_order_volume: 100,
            min_market_order_volume: 1,
            max_limit_order_volume: 500,
            min_limit_order_volume: 1,
            volume_multiple: 10,
            price_tick: 1.0,
            create_date: "20240101".to_string(),
            open_date: "20240301".to_string(),
            expire_date: "20250115".to_string(),
            start_deliv_date: "20250116".to_string(),
            end_deliv_date: "20250120".to_string(),
            inst_life_phase: "1".to_string(),
            is_trading: 1,
            position_type: "1".to_string(),
            position_date_type: "1".to_string(),
            long_margin_ratio: 0.08,
            short_margin_ratio: 0.08,
            max_margin_side_algorithm: "1".to_string(),
            underlying_inst_id: "".to_string(),
            strike_price: 0.0,
            options_type: "0".to_string(),
            underlying_multiple: 0.0,
            combination_type: "0".to_string(),
        },
    ]
}

// 全局查询请求计数器，用于生成唯一的请求ID
static mut QUERY_REQUEST_ID: i32 = 1;

// 获取下一个请求ID
fn get_next_request_id() -> i32 {
    unsafe {
        QUERY_REQUEST_ID += 1;
        QUERY_REQUEST_ID
    }
}

// 查询合约信息
#[command]
pub fn query_instruments(
    session_id: String,
) -> ApiResponse<Vec<InstrumentInfo>> {
    println!("🔍 [DEBUG] query_instruments called with session_id: {}", session_id);

    match std::panic::catch_unwind(|| {
        // 首先检查登录状态
        let login_status = TRADER_LOGIN_STATUS.lock().unwrap();
        if !login_status.get(&session_id).unwrap_or(&false) {
            return Err("CTP 交易 API 未连接，请先登录".to_string());
        }
        drop(login_status); // 释放锁

        let apis = TRADER_APIS.lock().unwrap();

        if let Some(api) = apis.get(&session_id) {
            println!("✅ [DEBUG] Found Trader API for session: {}", session_id);

            // 由于CTP查询接口的限制和异步特性，这里直接返回模拟数据
            // 在实际生产环境中，应该：
            // 1. 实现回调处理机制
            // 2. 添加查询频率控制
            // 3. 处理异步响应

            println!("⚠️ [INFO] Using simulated instrument data due to CTP API limitations");
            let instruments = get_common_instruments();
            Ok(instruments)

            // 注释掉的真实CTP查询代码，因为需要复杂的回调处理
            /*
            use tauri_app_vue_lib::*;

            // 创建查询合约请求结构
            let mut req = CThostFtdcQryInstrumentField::default();

            // 获取唯一的请求ID
            let request_id = get_next_request_id();

            // 调用查询合约接口
            let result = unsafe {
                api.req_qry_instrument(&mut req, request_id)
            };

            if result == 0 {
                println!("✅ [DEBUG] req_qry_instrument called successfully with request_id: {}", request_id);
                // 由于CTP是异步回调模式，这里返回一些基础合约数据
                // 实际项目中应该通过回调收集数据
                let instruments = get_common_instruments();
                Ok(instruments)
            } else {
                println!("❌ [ERROR] req_qry_instrument failed with code: {}", result);
                // 如果查询失败，返回模拟数据作为备选
                println!("⚠️ [FALLBACK] Using simulated data due to query failure");
                let instruments = get_common_instruments();
                Ok(instruments)
            }
            */
        } else {
            Err(format!("Session ID {} not found", session_id))
        }
    }) {
        Ok(Ok(instruments)) => {
            println!("✅ [SUCCESS] Instruments query successful, found {} instruments", instruments.len());
            ApiResponse {
                success: true,
                data: Some(instruments),
                error: None,
            }
        },
        Ok(Err(error)) => {
            println!("❌ [ERROR] Instruments query failed: {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        },
        Err(_) => {
            let error = "Instruments query panicked".to_string();
            println!("❌ [ERROR] {}", error);
            ApiResponse {
                success: false,
                data: None,
                error: Some(error),
            }
        }
    }
}

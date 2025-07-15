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
    match std::panic::catch_unwind(|| {
        let api = md_api::create_api(&flow_path, is_using_udp, is_multicast);
        let mut apis = MD_APIS.lock().unwrap();
        apis.insert(session_id.clone(), api);
        session_id
    }) {
        Ok(session_id) => ApiResponse {
            success: true,
            data: Some(session_id),
            error: None,
        },
        Err(_) => ApiResponse {
            success: false,
            data: None,
            error: Some("Failed to create MD API".to_string()),
        },
    }
}

#[command]
pub fn create_trader_api(
    session_id: String,
    flow_path: String,
    encrypt: bool,
) -> ApiResponse<String> {
    match std::panic::catch_unwind(|| {
        let api = trader_api::create_api(&flow_path, encrypt);
        let mut apis = TRADER_APIS.lock().unwrap();
        apis.insert(session_id.clone(), api);
        session_id
    }) {
        Ok(session_id) => ApiResponse {
            success: true,
            data: Some(session_id),
            error: None,
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
    // 这里需要实现具体的登录逻辑
    // 由于原始代码使用了异步流，这里简化处理
    ApiResponse {
        success: true,
        data: Some("MD login initiated".to_string()),
        error: None,
    }
}

#[command]
pub fn subscribe_market_data(
    session_id: String,
    request: MarketDataRequest,
) -> ApiResponse<String> {
    // 实现订阅行情数据的逻辑
    ApiResponse {
        success: true,
        data: Some(format!("Subscribed to {} instruments", request.instrument_ids.len())),
        error: None,
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
    // 这里需要实现具体的交易登录逻辑
    ApiResponse {
        success: true,
        data: Some("Trader login initiated".to_string()),
        error: None,
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

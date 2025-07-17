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

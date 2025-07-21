use std::ffi::CStr;

use tauri_app_vue_lib::CThostFtdcMdApi;

// 高层的 API，获取版本，一般应该出现在另一个 crate
pub fn get_api_version() -> Option<String> {
    unsafe {
        if let Ok(version) = CStr::from_ptr(CThostFtdcMdApi::GetApiVersion()).to_str() {
            return Some(version.to_string());
        }
    }
    None
}

fn main() {
    println!("版本：{:?}", get_api_version().unwrap());
}

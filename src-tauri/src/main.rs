// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod file_io;
mod ctp_commands;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            file_io::read_file,
            file_io::write_file,
            ctp_commands::get_api_version,
            ctp_commands::create_md_api,
            ctp_commands::release_md_api,
            ctp_commands::create_trader_api,
            ctp_commands::md_login,
            ctp_commands::trader_login,
            ctp_commands::subscribe_market_data,
            ctp_commands::unsubscribe_market_data,
            ctp_commands::insert_order,
            ctp_commands::cancel_order,
            ctp_commands::query_account,
            ctp_commands::query_position,
            ctp_commands::query_instruments,
            ctp_commands::validate_trader_session,
            ctp_commands::test_order_interface
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod file_io;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            file_io::read_file,
            file_io::write_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

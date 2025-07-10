use std::fs;
use std::io::{self, Write};
use tauri::command;

#[command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    fs::File::create(&path)
        .and_then(|mut file| file.write_all(content.as_bytes()))
        .map_err(|e| e.to_string())
}

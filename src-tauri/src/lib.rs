mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::check_config,
            commands::generate_default_config,
            commands::run_cleaner,
            commands::list_templates,
            commands::apply_template,
            commands::save_as_template,
            commands::delete_template,
            commands::get_template_rules,
            commands::save_template_content,
            commands::rename_template,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

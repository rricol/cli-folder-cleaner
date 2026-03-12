mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            commands::seed_templates(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::check_update,
            commands::install_update,
            commands::open_folder,
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
            commands::get_folder_config_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

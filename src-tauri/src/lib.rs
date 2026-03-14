mod commands;

use tauri::Manager;

#[cfg(target_os = "macos")]
use tauri::{
    menu::{IsMenuItem, Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

const TRAY_ID: &str = "main";

// ── macOS tray helpers ────────────────────────────────────────────────────────

/// Returns the list of favorite folders that have a linked template, as (path, template_name).
#[cfg(target_os = "macos")]
fn favorites_with_templates(app: &tauri::AppHandle) -> Vec<(String, String)> {
    use std::collections::HashMap;

    let data_dir = match app.path().app_data_dir() {
        Ok(d) => d,
        Err(_) => return vec![],
    };

    let favs: Vec<String> = std::fs::read_to_string(data_dir.join("favorites.json"))
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default();

    let assocs: HashMap<String, String> = std::fs::read_to_string(data_dir.join("associations.json"))
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default();

    favs.into_iter()
        .filter_map(|path| assocs.get(&path).cloned().map(|tmpl| (path, tmpl)))
        .collect()
}

/// Build the tray menu from the current favorites + associations state.
#[cfg(target_os = "macos")]
fn build_tray_menu(app: &tauri::AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
    let show = MenuItem::with_id(app, "show", "Open Drust Cleaner", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Drust Cleaner", true, None::<&str>)?;
    let sep_run = PredefinedMenuItem::separator(app)?;
    let sep_bottom = PredefinedMenuItem::separator(app)?;

    let pairs = favorites_with_templates(app);
    let run_items = pairs
        .iter()
        .map(|(path, tmpl)| {
            let name = std::path::Path::new(path)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or(path.as_str());
            MenuItem::with_id(
                app,
                format!("run:{path}"),
                format!("▶  {name}  —  {tmpl}"),
                true,
                None::<&str>,
            )
        })
        .collect::<tauri::Result<Vec<MenuItem<tauri::Wry>>>>()?;

    let mut items: Vec<&dyn IsMenuItem<tauri::Wry>> = vec![&show];
    if !run_items.is_empty() {
        items.push(&sep_run);
        for item in &run_items {
            items.push(item);
        }
    }
    items.push(&sep_bottom);
    items.push(&quit);

    Menu::with_items(app, &items)
}

/// Replace the current tray menu with a freshly built one.
#[cfg(target_os = "macos")]
fn rebuild_tray(app: &tauri::AppHandle) {
    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        if let Ok(menu) = build_tray_menu(app) {
            let _ = tray.set_menu(Some(menu));
        }
    }
}

/// Run the sort for a favorite folder in a background thread, then send a
/// macOS notification with the result.
#[cfg(target_os = "macos")]
fn run_favorite_async(app: tauri::AppHandle, folder_path: String) {
    std::thread::spawn(move || {
        let data_dir = match app.path().app_data_dir() {
            Ok(d) => d,
            Err(_) => return,
        };

        let assocs: std::collections::HashMap<String, String> =
            std::fs::read_to_string(data_dir.join("associations.json"))
                .ok()
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default();

        let Some(template_name) = assocs.get(&folder_path).cloned() else {
            return;
        };

        let template_path = data_dir
            .join("templates")
            .join(format!("{template_name}.toml"));

        let cfg = match cleaner_core::config::load_config(&template_path) {
            Ok(c) => c,
            Err(_) => return,
        };

        let target = std::path::PathBuf::from(&folder_path);
        let folder_name = target
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or(&folder_path)
            .to_string();

        let msg = match cleaner_core::engine::run(&target, &cfg, "cleaner.toml", false) {
            Ok(summary) => {
                let count = summary.moved + summary.deleted;
                if summary.errors > 0 {
                    format!("{count} file(s) sorted, {} error(s)", summary.errors)
                } else if count == 0 {
                    "Nothing to sort.".to_string()
                } else {
                    format!("{count} file(s) sorted")
                }
            }
            Err(e) => format!("Error: {e}"),
        };

        // Escape double quotes for AppleScript string literals.
        let msg_esc = msg.replace('"', "\\\"");
        let name_esc = folder_name.replace('"', "\\\"");
        let _ = std::process::Command::new("osascript")
            .args([
                "-e",
                &format!(
                    r#"display notification "{msg_esc}" with title "Drust Cleaner" subtitle "{name_esc}""#,
                ),
            ])
            .spawn();
    });
}

// ── Tauri command ─────────────────────────────────────────────────────────────

/// Called from the frontend whenever favorites or associations change so the
/// tray menu stays in sync. No-op on non-macOS.
#[tauri::command]
fn refresh_tray_menu(app: tauri::AppHandle) {
    #[cfg(target_os = "macos")]
    rebuild_tray(&app);
}

// ── App entry point ───────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            commands::seed_templates(app.handle());

            #[cfg(target_os = "macos")]
            {
                let initial_menu = build_tray_menu(app.handle())?;

                TrayIconBuilder::with_id(TRAY_ID)
                    .icon(tauri::include_image!("icons/tray-icon.png"))
                    .icon_as_template(true)
                    .tooltip("Drust Cleaner")
                    .menu(&initial_menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id.as_ref() {
                        "show" => {
                            if let Some(w) = app.get_webview_window("main") {
                                let _ = w.show();
                                let _ = w.set_focus();
                            }
                        }
                        "quit" => app.exit(0),
                        id if id.starts_with("run:") => {
                            let folder_path = id["run:".len()..].to_string();
                            run_favorite_async(app.clone(), folder_path);
                        }
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            let app = tray.app_handle();
                            if let Some(w) = app.get_webview_window("main") {
                                let _ = w.show();
                                let _ = w.set_focus();
                            }
                        }
                    })
                    .build(app)?;
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            #[cfg(target_os = "macos")]
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                window.hide().unwrap();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            refresh_tray_menu,
            commands::get_app_version,
            commands::check_update,
            commands::install_update,
            commands::open_folder,
            commands::open_url,
            commands::get_favorites,
            commands::add_favorite,
            commands::remove_favorite,
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
            commands::get_folder_association,
            commands::set_folder_association,
            commands::remove_folder_association,
            commands::run_with_template,
            commands::get_run_history,
            commands::clear_run_history,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

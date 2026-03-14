use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri_plugin_updater::UpdaterExt;

use cleaner_core::{config, engine};

/// A single file move record for undo support.
#[derive(Serialize, Deserialize, Clone)]
pub struct MoveRecord {
    pub src: String,
    pub dst: String,
}

/// One entry in the persistent run history.
#[derive(Serialize, Deserialize, Clone)]
pub struct RunHistoryEntry {
    pub id: u64,
    pub folder_path: String,
    pub template_name: String,
    pub moved: usize,
    pub deleted: usize,
    pub errors: usize,
    pub unmatched: usize,
    pub messages: Vec<String>,
    #[serde(default)]
    pub moves: Vec<MoveRecord>,
    #[serde(default)]
    pub undone: bool,
}

const MAX_HISTORY: usize = 100;

fn history_path(data_dir: &std::path::Path) -> std::path::PathBuf {
    data_dir.join("run_history.json")
}

fn load_history(data_dir: &std::path::Path) -> Vec<RunHistoryEntry> {
    std::fs::read_to_string(history_path(data_dir))
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn save_history(data_dir: &std::path::Path, entries: &[RunHistoryEntry]) {
    if let Ok(json) = serde_json::to_string(entries) {
        let _ = std::fs::write(history_path(data_dir), json);
    }
}

/// Result returned to the frontend after a run.
#[derive(Serialize, Deserialize)]
pub struct CleanResult {
    pub messages: Vec<String>,
    pub moved: usize,
    pub deleted: usize,
    pub errors: usize,
    pub unmatched: usize,
    /// History entry id for real runs (None for dry runs).
    pub run_id: Option<u64>,
}

/// Info about an available update returned to the frontend.
#[derive(Serialize)]
pub struct UpdateInfo {
    pub version: String,
    pub body: Option<String>,
}

/// Return the current app version from tauri.conf.json.
#[tauri::command]
pub fn get_app_version(app: tauri::AppHandle) -> String {
    app.package_info().version.to_string()
}

/// Check whether a newer version is available.
/// Returns Some(UpdateInfo) if an update exists, None if already up to date.
#[tauri::command]
pub async fn check_update(app: tauri::AppHandle) -> Result<Option<UpdateInfo>, String> {
    let update = app
        .updater()
        .map_err(|e| e.to_string())?
        .check()
        .await
        .map_err(|e| e.to_string())?;

    Ok(update.map(|u| UpdateInfo {
        version: u.version.clone(),
        body: u.body.clone(),
    }))
}

/// Download and install the latest update, then restart the app.
#[tauri::command]
pub async fn install_update(app: tauri::AppHandle) -> Result<(), String> {
    let update = app
        .updater()
        .map_err(|e| e.to_string())?
        .check()
        .await
        .map_err(|e| e.to_string())?;

    if let Some(update) = update {
        update
            .download_and_install(|_, _| {}, || {})
            .await
            .map_err(|e| e.to_string())?;
        app.restart();
    }
    Ok(())
}

/// Open `folder_path` in the system file manager (Finder / Explorer / xdg-open).
#[tauri::command]
pub fn open_folder(folder_path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    let cmd = "open";
    #[cfg(target_os = "windows")]
    let cmd = "explorer";
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    let cmd = "xdg-open";

    std::process::Command::new(cmd)
        .arg(&folder_path)
        .spawn()
        .map_err(|e| format!("Failed to open folder: {e}"))?;
    Ok(())
}

#[tauri::command]
pub fn open_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    let cmd = "open";
    #[cfg(target_os = "windows")]
    let cmd = "start";
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    let cmd = "xdg-open";

    std::process::Command::new(cmd)
        .arg(&url)
        .spawn()
        .map_err(|e| format!("Failed to open URL: {e}"))?;
    Ok(())
}

/// Return true if `cleaner.toml` exists inside the given folder.
#[tauri::command]
pub fn check_config(folder_path: String) -> bool {
    PathBuf::from(&folder_path).join("cleaner.toml").exists()
}

/// Write a sensible default `cleaner.toml` into `folder_path`.
#[tauri::command]
pub fn generate_default_config(folder_path: String) -> Result<(), String> {
    let dest = PathBuf::from(&folder_path).join("cleaner.toml");
    fs::write(&dest, DEFAULT_CONFIG_TEMPLATE)
        .map_err(|e| format!("Failed to write cleaner.toml: {e}"))
}

/// Run (or dry-run) the cleaner engine and return log messages + summary.
#[tauri::command]
pub fn run_cleaner(folder_path: String, dry_run: bool) -> Result<CleanResult, String> {
    let target = PathBuf::from(&folder_path);
    let config_path = target.join("cleaner.toml");

    let cfg = config::load_config(&config_path).map_err(|e| e.to_string())?;

    let summary = engine::run(&target, &cfg, "cleaner.toml", dry_run)
        .map_err(|e| e.to_string())?;

    Ok(CleanResult {
        messages: summary.messages,
        moved: summary.moved,
        deleted: summary.deleted,
        errors: summary.errors,
        unmatched: summary.unmatched,
        run_id: None,
    })
}

// ── Template data types ───────────────────────────────────────────────────────

#[derive(Serialize)]
pub struct TemplateRule {
    pub name: String,
    pub destination: String,
    pub delete: bool,
    pub extensions: Vec<String>,
    pub name_pattern: Option<String>,
    pub min_size_mb: Option<f64>,
    pub max_size_mb: Option<f64>,
    pub ignore: Vec<String>,
}

#[derive(Serialize)]
pub struct TemplateInfo {
    pub recursive: bool,
    pub unmatched_destination: Option<String>,
    pub ignore_hidden: bool,
    pub delete_empty_dirs: bool,
    pub keep_dirs: Vec<String>,
    pub rules: Vec<TemplateRule>,
}

// ── Template helpers ──────────────────────────────────────────────────────────

fn templates_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|d| d.join("templates"))
        .map_err(|e| e.to_string())
}

/// Seed the templates directory with built-in defaults on first launch.
/// Does nothing if the directory already contains at least one `.toml` file.
pub fn seed_templates(app: &tauri::AppHandle) {
    let dir = match templates_dir(app) {
        Ok(d) => d,
        Err(_) => return,
    };
    let is_empty = !dir.exists()
        || fs::read_dir(&dir)
            .map(|mut d| d.next().is_none())
            .unwrap_or(true);
    if is_empty {
        let _ = fs::create_dir_all(&dir);
        let _ = fs::write(dir.join("Default.toml"), DEFAULT_CONFIG_TEMPLATE);
    }
}

/// Return sorted list of template names (filenames without `.toml` extension).
#[tauri::command]
pub fn list_templates(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let dir = templates_dir(&app)?;
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut names: Vec<String> = fs::read_dir(&dir)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let name = entry.file_name();
            let s = name.to_string_lossy();
            if s.ends_with(".toml") {
                Some(s[..s.len() - 5].to_string())
            } else {
                None
            }
        })
        .collect();
    names.sort();
    Ok(names)
}

/// Copy `templates/<name>.toml` → `<folder_path>/cleaner.toml`.
#[tauri::command]
pub fn apply_template(
    app: tauri::AppHandle,
    template_name: String,
    folder_path: String,
) -> Result<(), String> {
    let src = templates_dir(&app)?.join(format!("{template_name}.toml"));
    let dst = PathBuf::from(&folder_path).join("cleaner.toml");
    fs::copy(&src, &dst).map_err(|e| format!("Failed to apply template: {e}"))?;
    Ok(())
}

/// Copy `<folder_path>/cleaner.toml` → `templates/<name>.toml` (creates dir if needed).
#[tauri::command]
pub fn save_as_template(
    app: tauri::AppHandle,
    folder_path: String,
    template_name: String,
) -> Result<(), String> {
    let dir = templates_dir(&app)?;
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create templates dir: {e}"))?;
    let src = PathBuf::from(&folder_path).join("cleaner.toml");
    let dst = dir.join(format!("{template_name}.toml"));
    fs::copy(&src, &dst).map_err(|e| format!("Failed to save template: {e}"))?;
    Ok(())
}

/// Remove `templates/<name>.toml`.
#[tauri::command]
pub fn delete_template(app: tauri::AppHandle, template_name: String) -> Result<(), String> {
    let path = templates_dir(&app)?.join(format!("{template_name}.toml"));
    fs::remove_file(&path).map_err(|e| format!("Failed to delete template: {e}"))?;
    Ok(())
}

/// Write arbitrary TOML content to a template file (create or overwrite).
/// Validates that the content is syntactically valid TOML before writing.
#[tauri::command]
pub fn save_template_content(
    app: tauri::AppHandle,
    template_name: String,
    content: String,
) -> Result<(), String> {
    // Validate TOML syntax
    toml::from_str::<toml::Value>(&content)
        .map_err(|e| format!("Invalid TOML: {e}"))?;
    let dir = templates_dir(&app)?;
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create templates dir: {e}"))?;
    let path = dir.join(format!("{template_name}.toml"));
    fs::write(&path, content).map_err(|e| format!("Failed to write template: {e}"))?;
    Ok(())
}

/// Rename a template file.
#[tauri::command]
pub fn rename_template(
    app: tauri::AppHandle,
    old_name: String,
    new_name: String,
) -> Result<(), String> {
    let dir = templates_dir(&app)?;
    let old_path = dir.join(format!("{old_name}.toml"));
    let new_path = dir.join(format!("{new_name}.toml"));
    fs::rename(&old_path, &new_path).map_err(|e| format!("Failed to rename template: {e}"))?;
    Ok(())
}

/// Read the local `cleaner.toml` from a folder and return its settings + rules.
#[tauri::command]
pub fn get_folder_config_info(folder_path: String) -> Result<TemplateInfo, String> {
    let path = PathBuf::from(&folder_path).join("cleaner.toml");
    let cfg = config::load_config(&path).map_err(|e| e.to_string())?;
    Ok(TemplateInfo {
        recursive: cfg.settings.recursive,
        unmatched_destination: cfg.settings.unmatched_destination,
        ignore_hidden: cfg.settings.ignore_hidden,
        delete_empty_dirs: cfg.settings.delete_empty_dirs,
        keep_dirs: cfg.settings.keep_dirs,
        rules: cfg
            .rules
            .into_iter()
            .map(|r| TemplateRule {
                name: r.name,
                destination: r.destination,
                delete: r.delete,
                extensions: r.extensions,
                name_pattern: r.name_pattern,
                min_size_mb: r.min_size_mb,
                max_size_mb: r.max_size_mb,
                ignore: r.ignore,
            })
            .collect(),
    })
}

/// Parse a template and return its settings + rules for display.
#[tauri::command]
pub fn get_template_rules(
    app: tauri::AppHandle,
    template_name: String,
) -> Result<TemplateInfo, String> {
    let path = templates_dir(&app)?.join(format!("{template_name}.toml"));
    let cfg = config::load_config(&path).map_err(|e| e.to_string())?;
    Ok(TemplateInfo {
        recursive: cfg.settings.recursive,
        unmatched_destination: cfg.settings.unmatched_destination,
        ignore_hidden: cfg.settings.ignore_hidden,
        delete_empty_dirs: cfg.settings.delete_empty_dirs,
        keep_dirs: cfg.settings.keep_dirs,
        rules: cfg
            .rules
            .into_iter()
            .map(|r| TemplateRule {
                name: r.name,
                destination: r.destination,
                delete: r.delete,
                extensions: r.extensions,
                name_pattern: r.name_pattern,
                min_size_mb: r.min_size_mb,
                max_size_mb: r.max_size_mb,
                ignore: r.ignore,
            })
            .collect(),
    })
}

// ── Folder favorites ──────────────────────────────────────────────────────────

fn favorites_file(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|d| d.join("favorites.json"))
        .map_err(|e| e.to_string())
}

fn load_favorites(app: &tauri::AppHandle) -> Result<Vec<String>, String> {
    let path = favorites_file(app)?;
    if !path.exists() {
        return Ok(Vec::new());
    }
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

fn save_favorites(app: &tauri::AppHandle, favorites: &[String]) -> Result<(), String> {
    let path = favorites_file(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(favorites).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_favorites(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    load_favorites(&app)
}

#[tauri::command]
pub fn add_favorite(app: tauri::AppHandle, folder_path: String) -> Result<(), String> {
    let mut favs = load_favorites(&app)?;
    if !favs.contains(&folder_path) {
        favs.push(folder_path);
        save_favorites(&app, &favs)?;
    }
    Ok(())
}

#[tauri::command]
pub fn remove_favorite(app: tauri::AppHandle, folder_path: String) -> Result<(), String> {
    let mut favs = load_favorites(&app)?;
    favs.retain(|f| f != &folder_path);
    save_favorites(&app, &favs)
}

// ── Folder-template associations ──────────────────────────────────────────────

fn associations_file(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|d| d.join("associations.json"))
        .map_err(|e| e.to_string())
}

fn load_associations(app: &tauri::AppHandle) -> Result<HashMap<String, String>, String> {
    let path = associations_file(app)?;
    if !path.exists() {
        return Ok(HashMap::new());
    }
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

fn save_associations(app: &tauri::AppHandle, map: &HashMap<String, String>) -> Result<(), String> {
    let path = associations_file(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(map).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())
}

/// Return the template name linked to a folder, or None if unlinked.
#[tauri::command]
pub async fn get_folder_association(
    app: tauri::AppHandle,
    folder_path: String,
) -> Result<Option<String>, String> {
    let map = load_associations(&app)?;
    Ok(map.get(&folder_path).cloned())
}

/// Persist a folder → template association.
#[tauri::command]
pub async fn set_folder_association(
    app: tauri::AppHandle,
    folder_path: String,
    template_name: String,
) -> Result<(), String> {
    let mut map = load_associations(&app)?;
    map.insert(folder_path, template_name);
    save_associations(&app, &map)
}

/// Remove the association for a folder.
#[tauri::command]
pub async fn remove_folder_association(
    app: tauri::AppHandle,
    folder_path: String,
) -> Result<(), String> {
    let mut map = load_associations(&app)?;
    map.remove(&folder_path);
    save_associations(&app, &map)
}

/// Run (or dry-run) using a named template from app data dir.
#[tauri::command]
pub fn run_with_template(
    app: tauri::AppHandle,
    folder_path: String,
    template_name: String,
    dry_run: bool,
) -> Result<CleanResult, String> {
    let target = PathBuf::from(&folder_path);
    let template_path = templates_dir(&app)?.join(format!("{template_name}.toml"));
    let cfg = config::load_config(&template_path).map_err(|e| e.to_string())?;
    let summary = engine::run(&target, &cfg, "cleaner.toml", dry_run).map_err(|e| e.to_string())?;
    let mut result = CleanResult {
        messages: summary.messages,
        moved: summary.moved,
        deleted: summary.deleted,
        errors: summary.errors,
        unmatched: summary.unmatched,
        run_id: None,
    };
    if !dry_run {
        let data_dir = app.path().app_data_dir().unwrap_or_default();
        let mut history = load_history(&data_dir);
        let id = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        history.insert(0, RunHistoryEntry {
            id,
            folder_path: folder_path.clone(),
            template_name: template_name.clone(),
            moved: result.moved,
            deleted: result.deleted,
            errors: result.errors,
            unmatched: result.unmatched,
            messages: result.messages.clone(),
            moves: summary.moves.iter().map(|(s, d)| MoveRecord {
                src: s.to_string_lossy().into_owned(),
                dst: d.to_string_lossy().into_owned(),
            }).collect(),
            undone: false,
        });
        history.truncate(MAX_HISTORY);
        save_history(&data_dir, &history);
        result.run_id = Some(id);
    }
    Ok(result)
}

#[tauri::command]
pub fn get_run_history(app: tauri::AppHandle) -> Vec<RunHistoryEntry> {
    let data_dir = app.path().app_data_dir().unwrap_or_default();
    load_history(&data_dir)
}

#[tauri::command]
pub fn clear_run_history(app: tauri::AppHandle) -> Result<(), String> {
    let data_dir = app.path().app_data_dir().unwrap_or_default();
    save_history(&data_dir, &[]);
    Ok(())
}

#[tauri::command]
pub fn undo_run(app: tauri::AppHandle, id: u64) -> Result<CleanResult, String> {
    let data_dir = app.path().app_data_dir().unwrap_or_default();
    let mut history = load_history(&data_dir);
    let entry = history
        .iter_mut()
        .find(|e| e.id == id)
        .ok_or_else(|| "Run not found".to_string())?;

    let mut moved = 0usize;
    let mut errors = 0usize;
    let mut messages = Vec::new();

    let moves: Vec<MoveRecord> = entry.moves.clone();
    for record in moves.iter().rev() {
        let src = std::path::Path::new(&record.src);
        let dst = std::path::Path::new(&record.dst);
        if !dst.exists() {
            messages.push(format!("SKIP (not found) {}", dst.display()));
            errors += 1;
            continue;
        }
        if let Some(parent) = src.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let result = std::fs::rename(dst, src).or_else(|_| {
            std::fs::copy(dst, src)
                .map(|_| ())
                .and_then(|_| std::fs::remove_file(dst))
        });
        match result {
            Ok(()) => {
                messages.push(format!(
                    "RESTORED {} → {}",
                    dst.display(),
                    src.display()
                ));
                moved += 1;
            }
            Err(e) => {
                messages.push(format!("ERROR {}: {}", dst.display(), e));
                errors += 1;
            }
        }
    }

    // Clean up empty destination directories created during the run.
    // Walk up from each dst's parent to (but not including) the target root,
    // collect all candidate dirs, then try removing deepest-first.
    let target = std::path::Path::new(&entry.folder_path);
    let mut dirs: std::collections::BTreeSet<std::path::PathBuf> = std::collections::BTreeSet::new();
    for record in &entry.moves {
        let mut current = std::path::Path::new(&record.dst).parent();
        while let Some(dir) = current {
            if dir == target || !dir.starts_with(target) {
                break;
            }
            dirs.insert(dir.to_path_buf());
            current = dir.parent();
        }
    }
    let mut dirs_vec: Vec<_> = dirs.into_iter().collect();
    dirs_vec.sort_by(|a, b| b.components().count().cmp(&a.components().count()));
    for dir in &dirs_vec {
        if std::fs::remove_dir(dir).is_ok() {
            messages.push(format!("REMOVED empty dir {}", dir.display()));
        }
    }

    entry.undone = true;
    save_history(&data_dir, &history);

    Ok(CleanResult {
        messages,
        moved,
        deleted: 0,
        errors,
        unmatched: 0,
        run_id: None,
    })
}

const DEFAULT_CONFIG_TEMPLATE: &str = r#"# cleaner.toml — generated by Folder Cleaner GUI
# Rules are evaluated top-to-bottom; the first matching rule wins.

[settings]
recursive = false
# unmatched_destination = "Other"

[[rules]]
name = "Images"
destination = "Images"
extensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "heic", "avif"]

[[rules]]
name = "Videos"
destination = "Videos"
extensions = ["mp4", "mov", "avi", "mkv", "wmv", "flv", "webm", "m4v", "mpg", "mpeg"]

[[rules]]
name = "Audio"
destination = "Audio"
extensions = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a", "opus", "aiff"]

[[rules]]
name = "Documents"
destination = "Documents"
extensions = ["pdf", "doc", "docx", "txt", "rtf", "odt", "pages", "md"]

[[rules]]
name = "Spreadsheets"
destination = "Spreadsheets"
extensions = ["xls", "xlsx", "csv", "ods", "numbers"]

[[rules]]
name = "Presentations"
destination = "Presentations"
extensions = ["ppt", "pptx", "odp", "key"]

[[rules]]
name = "Archives"
destination = "Archives"
extensions = ["zip", "tar", "gz", "rar", "7z", "bz2", "xz", "dmg", "iso"]

[[rules]]
name = "Code"
destination = "Code"
extensions = ["rs", "py", "js", "ts", "go", "java", "c", "cpp", "h", "hpp", "sh", "rb", "php", "swift", "kt"]
"#;

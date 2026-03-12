use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;

use cleaner_core::{config, engine};

/// Result returned to the frontend after a run.
#[derive(Serialize, Deserialize)]
pub struct CleanResult {
    pub messages: Vec<String>,
    pub moved: usize,
    pub errors: usize,
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
        errors: summary.errors,
    })
}

// ── Template data types ───────────────────────────────────────────────────────

#[derive(Serialize)]
pub struct TemplateRule {
    pub name: String,
    pub destination: String,
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
    pub rules: Vec<TemplateRule>,
}

// ── Template helpers ──────────────────────────────────────────────────────────

fn templates_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|d| d.join("templates"))
        .map_err(|e| e.to_string())
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
        rules: cfg
            .rules
            .into_iter()
            .map(|r| TemplateRule {
                name: r.name,
                destination: r.destination,
                extensions: r.extensions,
                name_pattern: r.name_pattern,
                min_size_mb: r.min_size_mb,
                max_size_mb: r.max_size_mb,
                ignore: r.ignore,
            })
            .collect(),
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

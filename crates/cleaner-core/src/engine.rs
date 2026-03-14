use std::fs;
use std::path::{Path, PathBuf};

use chrono::{DateTime, Local};

use glob::Pattern;
use walkdir::WalkDir;

use crate::config::{Config, Rule, Settings};

fn is_ignored(file_name: &str, ignore_list: &[String]) -> bool {
    ignore_list.iter().any(|pattern| {
        match glob::Pattern::new(pattern) {
            Ok(p) => p.matches(file_name),
            Err(_) => file_name == pattern,
        }
    })
}

const MB: f64 = 1024.0 * 1024.0;

/// Summary of a completed (or simulated) run.
#[derive(Debug, Default)]
pub struct RunSummary {
    pub moved: usize,
    pub skipped: usize,
    pub errors: usize,
    /// Files trashed by delete-mode rules.
    pub deleted: usize,
    /// Files that didn't match any rule and weren't moved to an unmatched destination.
    pub unmatched: usize,
    /// Log messages produced during the run (plain text, no ANSI codes).
    pub messages: Vec<String>,
    /// (src, dst) for each successfully moved file (excludes trashed files).
    pub moves: Vec<(PathBuf, PathBuf)>,
}

/// A single planned file operation.
#[derive(Debug)]
pub struct FileAction {
    pub source: PathBuf,
    pub destination: PathBuf,
    pub rule_name: String,
    /// When true, the file should be trashed instead of moved.
    pub delete: bool,
}

/// Run the engine against `target_dir` using the given `config`.
///
/// - `dry_run = true`  → collect planned actions as messages, move nothing.
/// - `dry_run = false` → execute moves, collect results as messages.
pub fn run(
    target_dir: &Path,
    config: &Config,
    config_file_name: &str,
    dry_run: bool,
) -> anyhow::Result<RunSummary> {
    let (actions, unmatched_paths) = collect_actions(target_dir, config, config_file_name)?;

    let mut summary = RunSummary::default();

    // Process matched files
    for action in &actions {
        if action.delete {
            if dry_run {
                summary.messages.push(format!(
                    "[DRY-RUN] TRASH {}  (rule: {})",
                    action.source.display(),
                    action.rule_name,
                ));
                summary.deleted += 1;
            } else {
                match trash::delete(&action.source) {
                    Ok(()) => {
                        summary.messages.push(format!(
                            "TRASHED {}  (rule: {})",
                            action.source.display(),
                            action.rule_name,
                        ));
                        summary.deleted += 1;
                    }
                    Err(e) => {
                        summary.messages.push(format!(
                            "ERROR {}: {}",
                            action.source.display(),
                            e,
                        ));
                        summary.errors += 1;
                    }
                }
            }
        } else if dry_run {
            summary.messages.push(format!(
                "[DRY-RUN] {} → {}  (rule: {})",
                action.source.display(),
                action.destination.display(),
                action.rule_name,
            ));
            summary.moved += 1;
        } else {
            match execute_move(action) {
                Ok(()) => {
                    summary.messages.push(format!(
                        "MOVED {} → {}  (rule: {})",
                        action.source.display(),
                        action.destination.display(),
                        action.rule_name,
                    ));
                    summary.moves.push((action.source.clone(), action.destination.clone()));
                    summary.moved += 1;
                }
                Err(e) => {
                    summary.messages.push(format!(
                        "ERROR {}: {}",
                        action.source.display(),
                        e,
                    ));
                    summary.errors += 1;
                }
            }
        }
    }

    // Process unmatched files
    if let Some(dest_name) = &config.settings.unmatched_destination {
        for file in &unmatched_paths {
            let dest = build_destination(target_dir, file, dest_name)?;
            // Skip files already in the unmatched destination folder
            if file.parent() == dest.parent() {
                continue;
            }
            if dry_run {
                summary.messages.push(format!(
                    "[DRY-RUN] {} → {}  (rule: <unmatched>)",
                    file.display(),
                    dest.display(),
                ));
                summary.moved += 1;
            } else {
                let action = FileAction {
                    source: file.clone(),
                    destination: dest,
                    rule_name: "<unmatched>".to_string(),
                    delete: false,
                };
                match execute_move(&action) {
                    Ok(()) => {
                        summary.messages.push(format!(
                            "MOVED (unmatched) {} → {}",
                            action.source.display(),
                            action.destination.display(),
                        ));
                        summary.moves.push((action.source.clone(), action.destination.clone()));
                        summary.moved += 1;
                    }
                    Err(e) => {
                        summary.messages.push(format!(
                            "ERROR {}: {}",
                            action.source.display(),
                            e,
                        ));
                        summary.errors += 1;
                    }
                }
            }
        }
        summary.unmatched = 0;
    } else {
        // No catch-all: count and log unmatched files
        summary.unmatched = unmatched_paths.len();
        for path in &unmatched_paths {
            summary.messages.push(format!("UNMATCHED {}", path.display()));
        }
    }

    if actions.is_empty() && unmatched_paths.is_empty() {
        summary.messages.push("No files found.".to_string());
    }

    if config.settings.delete_empty_dirs && !dry_run {
        cleanup_empty_dirs(target_dir, &config.settings.keep_dirs, config.settings.ignore_hidden, &mut summary);
    }

    Ok(summary)
}

fn cleanup_empty_dirs(target_dir: &Path, keep_dirs: &[String], ignore_hidden: bool, summary: &mut RunSummary) {
    // contents_first = post-order: children yielded before their parent, so we
    // can remove empty leaves and then check if their parent became empty too.
    let entries: Vec<_> = WalkDir::new(target_dir)
        .contents_first(true)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_dir())
        .collect();

    for entry in entries {
        let path = entry.path();
        if path == target_dir {
            continue;
        }
        let dir_name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
        if is_ignored(dir_name, keep_dirs) {
            continue;
        }

        // When ignore_hidden is set, hidden files (e.g. macOS .DS_Store) don't
        // count as real content — remove them first so the dir can be deleted.
        let has_real_content = match fs::read_dir(path) {
            Err(_) => continue,
            Ok(d) => d
                .filter_map(|e| e.ok())
                .any(|e| {
                    !ignore_hidden || !e.file_name().to_string_lossy().starts_with('.')
                }),
        };

        if !has_real_content {
            // Purge any leftover hidden files before calling remove_dir.
            if ignore_hidden {
                if let Ok(d) = fs::read_dir(path) {
                    for e in d.filter_map(|e| e.ok()) {
                        if e.file_name().to_string_lossy().starts_with('.') {
                            let _ = fs::remove_file(e.path());
                        }
                    }
                }
            }
            match fs::remove_dir(path) {
                Ok(()) => {
                    summary
                        .messages
                        .push(format!("REMOVED empty dir {}", path.display()));
                }
                Err(e) => {
                    summary.messages.push(format!(
                        "ERROR removing dir {}: {}",
                        path.display(),
                        e
                    ));
                    summary.errors += 1;
                }
            }
        }
    }
}

fn collect_actions(
    target_dir: &Path,
    config: &Config,
    config_file_name: &str,
) -> anyhow::Result<(Vec<FileAction>, Vec<PathBuf>)> {
    let files = collect_files(target_dir, &config.settings);
    let mut actions: Vec<FileAction> = Vec::new();
    let mut unmatched: Vec<PathBuf> = Vec::new();

    'file: for file_path in files {
        let file_name = file_path.file_name().and_then(|n| n.to_str()).unwrap_or("");

        if file_name == config_file_name {
            continue;
        }

        if config.settings.ignore_hidden && file_name.starts_with('.') {
            continue;
        }

        if is_ignored(file_name, &config.settings.ignore) {
            continue;
        }

        let metadata = match fs::metadata(&file_path) {
            Ok(m) => m,
            Err(_) => continue,
        };

        for rule in &config.rules {
            if matches_rule(rule, &file_path, &metadata) {
                if rule.delete {
                    actions.push(FileAction {
                        source: file_path,
                        destination: PathBuf::new(),
                        rule_name: rule.name.clone(),
                        delete: true,
                    });
                    continue 'file;
                }
                let resolved = resolve_date_placeholders(&rule.destination, &metadata);
                let destination = build_destination(target_dir, &file_path, &resolved)?;
                if file_path.parent() == destination.parent() {
                    continue 'file;
                }
                actions.push(FileAction {
                    source: file_path,
                    destination,
                    rule_name: rule.name.clone(),
                    delete: false,
                });
                continue 'file;
            }
        }

        unmatched.push(file_path);
    }

    Ok((actions, unmatched))
}

fn collect_files(target_dir: &Path, settings: &Settings) -> Vec<PathBuf> {
    let depth = if settings.recursive { usize::MAX } else { 1 };

    WalkDir::new(target_dir)
        .max_depth(depth)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.file_type().is_file())
        .map(|entry| entry.into_path())
        .collect()
}

fn matches_rule(rule: &Rule, file_path: &Path, metadata: &fs::Metadata) -> bool {
    let file_name = file_path.file_name().and_then(|n| n.to_str()).unwrap_or("");
    if is_ignored(file_name, &rule.ignore) {
        return false;
    }

    if !rule.extensions.is_empty() {
        let file_ext = file_path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();
        if !rule.extensions.iter().any(|ext| ext.to_lowercase() == file_ext) {
            return false;
        }
    }

    if let Some(ref pattern_str) = rule.name_pattern {
        let file_name = file_path.file_name().and_then(|n| n.to_str()).unwrap_or("");
        match Pattern::new(pattern_str) {
            Ok(pattern) => {
                if !pattern.matches(file_name) {
                    return false;
                }
            }
            Err(_) => return false,
        }
    }

    let file_size_mb = metadata.len() as f64 / MB;
    if let Some(min) = rule.min_size_mb {
        if file_size_mb < min {
            return false;
        }
    }
    if let Some(max) = rule.max_size_mb {
        if file_size_mb > max {
            return false;
        }
    }

    true
}

/// Resolve `{year}`, `{month}`, `{month_num}`, `{day}` placeholders in a
/// destination path using the file's modification date (falls back to creation
/// date, then to the current time).
fn resolve_date_placeholders(destination: &str, metadata: &fs::Metadata) -> String {
    if !destination.contains('{') {
        return destination.to_string();
    }

    let system_time = metadata
        .modified()
        .or_else(|_| metadata.created())
        .unwrap_or(std::time::SystemTime::now());

    let dt: DateTime<Local> = system_time.into();

    destination
        .replace("{year}", &dt.format("%Y").to_string())
        .replace("{month}", &dt.format("%B").to_string())
        .replace("{month_num}", &dt.format("%m").to_string())
        .replace("{day}", &dt.format("%d").to_string())
}

fn build_destination(
    target_dir: &Path,
    file_path: &Path,
    destination_folder: &str,
) -> anyhow::Result<PathBuf> {
    let file_name = file_path
        .file_name()
        .ok_or_else(|| anyhow::anyhow!("File has no name: {}", file_path.display()))?;
    Ok(target_dir.join(destination_folder).join(file_name))
}

fn execute_move(action: &FileAction) -> anyhow::Result<()> {
    let dest_dir = action
        .destination
        .parent()
        .ok_or_else(|| anyhow::anyhow!("Destination has no parent directory"))?;

    fs::create_dir_all(dest_dir)
        .map_err(|e| anyhow::anyhow!("Could not create directory '{}': {}", dest_dir.display(), e))?;

    if fs::rename(&action.source, &action.destination).is_err() {
        fs::copy(&action.source, &action.destination).map_err(|e| {
            anyhow::anyhow!(
                "Failed to copy '{}' to '{}': {}",
                action.source.display(),
                action.destination.display(),
                e
            )
        })?;
        fs::remove_file(&action.source).map_err(|e| {
            anyhow::anyhow!(
                "Copied file but failed to remove source '{}': {}",
                action.source.display(),
                e
            )
        })?;
    }

    Ok(())
}

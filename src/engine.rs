use std::fs;
use std::path::{Path, PathBuf};

use colored::Colorize;
use glob::Pattern;
use walkdir::WalkDir;

use crate::config::{Config, Rule, Settings};

/// Check whether a filename matches any entry in an ignore list.
/// Each entry is treated as a glob pattern; plain filenames like "cleaner.toml"
/// are valid globs that only match exactly that name.
fn is_ignored(file_name: &str, ignore_list: &[String]) -> bool {
    ignore_list.iter().any(|pattern| {
        match glob::Pattern::new(pattern) {
            Ok(p) => p.matches(file_name),
            Err(_) => file_name == pattern, // fall back to exact match on bad pattern
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
}

/// A single planned file operation.
#[derive(Debug)]
pub struct FileAction {
    pub source: PathBuf,
    pub destination: PathBuf,
    pub rule_name: String,
}

/// Run the engine against `target_dir` using the given `config`.
///
/// - `dry_run = true`  → print planned actions, move nothing.
/// - `dry_run = false` → execute moves, print results.
pub fn run(
    target_dir: &Path,
    config: &Config,
    config_file_name: &str,
    dry_run: bool,
) -> anyhow::Result<RunSummary> {
    let actions = collect_actions(target_dir, config, config_file_name)?;

    if actions.is_empty() {
        println!("{}", "No files matched any rule.".yellow());
        return Ok(RunSummary::default());
    }

    let mut summary = RunSummary::default();

    for action in &actions {
        if dry_run {
            println!(
                "{} {} → {}  {}",
                "[DRY-RUN]".cyan().bold(),
                action.source.display().to_string().white(),
                action.destination.display().to_string().green(),
                format!("(rule: {})", action.rule_name).dimmed(),
            );
            summary.moved += 1;
        } else {
            match execute_move(action) {
                Ok(()) => {
                    println!(
                        "{} {} → {}  {}",
                        "MOVED".green().bold(),
                        action.source.display().to_string().white(),
                        action.destination.display().to_string().green(),
                        format!("(rule: {})", action.rule_name).dimmed(),
                    );
                    summary.moved += 1;
                }
                Err(e) => {
                    eprintln!(
                        "{} {}: {}",
                        "ERROR".red().bold(),
                        action.source.display(),
                        e,
                    );
                    summary.errors += 1;
                }
            }
        }
    }

    // Report unmatched files if requested
    if config.settings.unmatched_destination.is_some() && !dry_run {
        let matched_sources: std::collections::HashSet<&PathBuf> =
            actions.iter().map(|a| &a.source).collect();

        let unmatched = collect_files(target_dir, &config.settings)
            .into_iter()
            .filter(|p| {
                if matched_sources.contains(p) {
                    return false;
                }
                let file_name = p.file_name().and_then(|n| n.to_str()).unwrap_or("");
                // Respect the global ignore list for unmatched files too
                !is_ignored(file_name, &config.settings.ignore) && file_name != config_file_name
            })
            .collect::<Vec<_>>();

        let dest_name = config.settings.unmatched_destination.as_deref().unwrap();
        for file in unmatched {
            let dest = build_destination(target_dir, &file, dest_name)?;
            let action = FileAction {
                source: file,
                destination: dest,
                rule_name: "<unmatched>".to_string(),
            };
            match execute_move(&action) {
                Ok(()) => {
                    println!(
                        "{} {} → {}",
                        "MOVED (unmatched)".yellow().bold(),
                        action.source.display(),
                        action.destination.display(),
                    );
                    summary.moved += 1;
                }
                Err(e) => {
                    eprintln!(
                        "{} {}: {}",
                        "ERROR".red().bold(),
                        action.source.display(),
                        e,
                    );
                    summary.errors += 1;
                }
            }
        }
    }

    Ok(summary)
}

/// Walk `target_dir` and, for each file, find the first matching rule and build
/// a [`FileAction`]. Returns a list of all planned moves.
fn collect_actions(
    target_dir: &Path,
    config: &Config,
    config_file_name: &str,
) -> anyhow::Result<Vec<FileAction>> {
    let files = collect_files(target_dir, &config.settings);
    let mut actions: Vec<FileAction> = Vec::new();

    'file: for file_path in files {
        let file_name = file_path.file_name().and_then(|n| n.to_str()).unwrap_or("");

        // Always skip the config file itself.
        if file_name == config_file_name {
            continue;
        }

        // Skip files matched by the global ignore list.
        if is_ignored(file_name, &config.settings.ignore) {
            continue;
        }

        let metadata = match fs::metadata(&file_path) {
            Ok(m) => m,
            Err(e) => {
                eprintln!(
                    "{} Could not read metadata for {}: {}",
                    "WARN".yellow().bold(),
                    file_path.display(),
                    e
                );
                continue;
            }
        };

        for rule in &config.rules {
            if matches_rule(rule, &file_path, &metadata) {
                let destination = build_destination(target_dir, &file_path, &rule.destination)?;
                // Skip if the file is already in its target destination.
                if file_path.parent() == destination.parent() {
                    continue 'file;
                }
                actions.push(FileAction {
                    source: file_path,
                    destination,
                    rule_name: rule.name.clone(),
                });
                continue 'file;
            }
        }
    }

    Ok(actions)
}

/// Collect all candidate files from `target_dir` respecting the recursive setting.
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

/// Check whether `file_path` with its `metadata` satisfies all conditions in
/// `rule`. All specified conditions must match (logical AND).
fn matches_rule(rule: &Rule, file_path: &Path, metadata: &fs::Metadata) -> bool {
    // --- Per-rule ignore list check ---
    let file_name = file_path.file_name().and_then(|n| n.to_str()).unwrap_or("");
    if is_ignored(file_name, &rule.ignore) {
        return false;
    }

    // --- Extension check ---
    if !rule.extensions.is_empty() {
        let file_ext = file_path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();

        let matched = rule
            .extensions
            .iter()
            .any(|ext| ext.to_lowercase() == file_ext);

        if !matched {
            return false;
        }
    }

    // --- Name pattern check ---
    if let Some(ref pattern_str) = rule.name_pattern {
        let file_name = file_path.file_name().and_then(|n| n.to_str()).unwrap_or("");

        match Pattern::new(pattern_str) {
            Ok(pattern) => {
                if !pattern.matches(file_name) {
                    return false;
                }
            }
            Err(e) => {
                eprintln!(
                    "{} Invalid glob pattern '{}' in rule '{}': {}",
                    "WARN".yellow().bold(),
                    pattern_str,
                    rule.name,
                    e
                );
                return false;
            }
        }
    }

    // --- Size checks ---
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

/// Build the full destination path for a file being moved.
///
/// The destination folder is resolved relative to `target_dir`.
/// The file's own name is preserved.
fn build_destination(
    target_dir: &Path,
    file_path: &Path,
    destination_folder: &str,
) -> anyhow::Result<PathBuf> {
    let file_name = file_path
        .file_name()
        .ok_or_else(|| anyhow::anyhow!("File has no name: {}", file_path.display()))?;

    let dest_dir = target_dir.join(destination_folder);
    Ok(dest_dir.join(file_name))
}

/// Execute a single file move, creating the destination directory if needed.
fn execute_move(action: &FileAction) -> anyhow::Result<()> {
    let dest_dir = action
        .destination
        .parent()
        .ok_or_else(|| anyhow::anyhow!("Destination has no parent directory"))?;

    fs::create_dir_all(dest_dir).map_err(|e| {
        anyhow::anyhow!("Could not create directory '{}': {}", dest_dir.display(), e)
    })?;

    // Attempt a cheap rename first; fall back to copy+delete for cross-device moves.
    if let Err(_) = fs::rename(&action.source, &action.destination) {
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

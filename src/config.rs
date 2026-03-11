use serde::Deserialize;
use std::fs;
use std::path::Path;

/// Top-level configuration file structure.
///
/// Example `cleaner.toml`:
/// ```toml
/// [[rules]]
/// name = "Images"
/// destination = "Images"
/// extensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"]
///
/// [[rules]]
/// name = "Large Videos"
/// destination = "Videos/Large"
/// extensions = ["mp4", "mkv", "mov"]
/// min_size_mb = 100.0
///
/// [[rules]]
/// name = "Invoices"
/// destination = "Documents/Invoices"
/// name_pattern = "invoice_*"
/// ```
#[derive(Debug, Deserialize)]
pub struct Config {
    /// Optional global settings.
    #[serde(default)]
    pub settings: Settings,

    /// Ordered list of rules. Rules are evaluated top-to-bottom; the first
    /// matching rule wins.
    pub rules: Vec<Rule>,
}

/// Global settings that apply to the whole run.
#[derive(Debug, Deserialize, Default)]
pub struct Settings {
    /// When true, recurse into sub-directories when scanning for files.
    /// Defaults to false (flat scan of the target directory only).
    #[serde(default)]
    pub recursive: bool,

    /// When true, skip files that are currently open / locked.
    /// Defaults to false (the engine will still attempt the move and surface the error).
    #[serde(default)]
    pub skip_locked: bool,

    /// If set, files that don't match any rule are moved into this folder.
    pub unmatched_destination: Option<String>,

    /// Global ignore list: exact filenames or glob patterns (matched against the
    /// filename only) that are excluded from every rule.
    /// The config file itself is always ignored automatically by the engine,
    /// but you can add additional entries here, e.g.:
    ///   ignore = [".DS_Store", "Thumbs.db", "*.tmp"]
    #[serde(default)]
    pub ignore: Vec<String>,
}

/// A single organisation rule.
#[derive(Debug, Deserialize)]
pub struct Rule {
    /// Human-readable label used in log output.
    pub name: String,

    /// Destination folder path, relative to the target directory being cleaned
    /// (e.g. `"Images"` or `"Documents/PDFs"`).
    pub destination: String,

    // ── Conditions ────────────────────────────────────────────────────────────
    // All specified conditions must match for the rule to apply (logical AND).
    /// List of file extensions to match, without the leading dot
    /// (e.g. `["jpg", "png"]`). Case-insensitive.
    #[serde(default)]
    pub extensions: Vec<String>,

    /// Glob pattern matched against the file name only (not the full path),
    /// e.g. `"invoice_*"` or `"report_202?_*"`.
    pub name_pattern: Option<String>,

    /// Minimum file size in megabytes (inclusive).
    pub min_size_mb: Option<f64>,

    /// Maximum file size in megabytes (inclusive).
    pub max_size_mb: Option<f64>,

    // ── Exclusions ────────────────────────────────────────────────────────────
    /// Per-rule ignore list: exact filenames or glob patterns (matched against
    /// the filename only) that prevent this rule from applying to a file, even
    /// if all other conditions match.
    /// E.g. `ignore = ["cleaner.toml", "*.bak", "README.*"]`
    #[serde(default)]
    pub ignore: Vec<String>,
}

impl Rule {
    /// Returns true if at least one condition is specified on this rule.
    /// A rule with no conditions would match every file, which is almost
    /// certainly a misconfiguration.
    pub fn has_conditions(&self) -> bool {
        !self.extensions.is_empty()
            || self.name_pattern.is_some()
            || self.min_size_mb.is_some()
            || self.max_size_mb.is_some()
    }
}

/// Load and parse a TOML config file from `path`.
pub fn load_config(path: &Path) -> anyhow::Result<Config> {
    let raw = fs::read_to_string(path)
        .map_err(|e| anyhow::anyhow!("Cannot read config file '{}': {}", path.display(), e))?;

    let config: Config = toml::from_str(&raw)
        .map_err(|e| anyhow::anyhow!("Failed to parse config file '{}': {}", path.display(), e))?;

    validate_config(&config)?;

    Ok(config)
}

/// Perform basic sanity checks on the parsed config.
fn validate_config(config: &Config) -> anyhow::Result<()> {
    if config.rules.is_empty() {
        anyhow::bail!("Config file contains no rules.");
    }

    for (i, rule) in config.rules.iter().enumerate() {
        if rule.name.trim().is_empty() {
            anyhow::bail!("Rule #{} has an empty 'name' field.", i + 1);
        }
        if rule.destination.trim().is_empty() {
            anyhow::bail!("Rule '{}' has an empty 'destination' field.", rule.name);
        }
        if !rule.has_conditions() {
            anyhow::bail!(
                "Rule '{}' has no conditions (extensions, name_pattern, min_size_mb, \
                 max_size_mb). This would match every file. Please add at least one condition.",
                rule.name
            );
        }
        if let (Some(min), Some(max)) = (rule.min_size_mb, rule.max_size_mb) {
            if min > max {
                anyhow::bail!(
                    "Rule '{}': min_size_mb ({}) is greater than max_size_mb ({}).",
                    rule.name,
                    min,
                    max
                );
            }
        }
    }

    Ok(())
}

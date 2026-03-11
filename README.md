# cli-folder-cleaner

A fast, rule-driven CLI tool written in Rust that organises files in a directory by moving them into sub-folders according to rules you define in a TOML configuration file.

---

## Features

- **Rule-based organisation** — define as many rules as you need in a simple TOML file
- **Multiple match conditions** — filter by file extension, filename glob pattern, and/or file size range
- **First-match-wins** — rules are evaluated top-to-bottom; the first matching rule applies
- **Dry-run mode** — preview every planned move before committing to it
- **Recursive scanning** — optionally descend into sub-directories
- **Unmatched file catch-all** — optionally funnel files that matched no rule into a dedicated folder
- **Nested destinations** — destination paths like `Documents/PDFs` are created automatically
- **Cross-device safe** — falls back to copy + delete when a simple rename would fail
- **Coloured output** — clear, colour-coded terminal feedback at a glance

---

## Installation

### From source (requires [Rust](https://rustup.rs))

```cli-folder-cleaner/README.md#L1-1
git clone https://github.com/rricol/cli-folder-cleaner.git
cd cli-folder-cleaner
cargo build --release
```

The compiled binary will be at `target/release/cli-folder-cleaner`.

To install it into your Cargo bin directory so it is available system-wide:

```cli-folder-cleaner/README.md#L1-1
cargo install --path .
```

---

## Quick Start

1. Copy `cleaner.toml.example` to the directory you want to clean and rename it `cleaner.toml`.
2. Edit the rules to match your needs.
3. Run a dry-run first to preview what would happen:

```cli-folder-cleaner/README.md#L1-1
cli-folder-cleaner --target ~/Downloads --dry-run --verbose
```

4. If everything looks right, run it for real:

```cli-folder-cleaner/README.md#L1-1
cli-folder-cleaner --target ~/Downloads
```

---

## Usage

```cli-folder-cleaner/README.md#L1-1
cli-folder-cleaner [OPTIONS]

Options:
  -t, --target <DIR>    Directory to clean [default: current working directory]
  -c, --config <FILE>   Path to the rules file [default: <target>/cleaner.toml]
  -d, --dry-run         Preview actions without moving any files
  -v, --verbose         Print target path, config path, and rule count
  -h, --help            Print help
  -V, --version         Print version
```

### Examples

```cli-folder-cleaner/README.md#L1-1
# Clean the current directory using ./cleaner.toml
cli-folder-cleaner

# Clean a specific directory
cli-folder-cleaner --target ~/Downloads

# Use a config file stored elsewhere
cli-folder-cleaner --target ~/Downloads --config ~/.config/cleaner.toml

# Dry-run with verbose output
cli-folder-cleaner --target ~/Downloads --dry-run --verbose
```

---

## Configuration File

By default the tool looks for a file named `cleaner.toml` inside the target directory. You can override this with `--config`.

The file has two sections: an optional `[settings]` block and one or more `[[rules]]` blocks.

### Global Settings

```cli-folder-cleaner/cleaner.toml.example#L10-16
[settings]

# Set to true to also scan sub-directories (default: false).
recursive = false

# Any file that does not match any rule will be moved here (relative to the
# target directory). Comment out or remove to leave unmatched files in place.
# unmatched_destination = "_Unsorted"
```

| Key | Type | Default | Description |
|---|---|---|---|
| `recursive` | bool | `false` | Recurse into sub-directories when scanning |
| `unmatched_destination` | string | — | Folder for files that matched no rule. Omit to leave them in place. |
| `ignore` | string list | `[]` | Filenames or glob patterns skipped by **every** rule. The config file itself (`cleaner.toml`) is always ignored automatically, even without this setting. |

### Rules

Each `[[rules]]` block defines one rule. Rules are evaluated **top-to-bottom**; the **first matching rule wins**.

```cli-folder-cleaner/cleaner.toml.example#L28-32
[[rules]]
name        = "Images"
destination = "Images"
extensions  = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "tif", "svg", "ico", "heic", "heif"]
```

#### Rule Fields

| Field | Required | Description |
|---|---|---|
| `name` | ✅ | Human-readable label shown in CLI output |
| `destination` | ✅ | Target sub-folder relative to the target directory. Nested paths (e.g. `Documents/PDFs`) are supported and created automatically. |
| `extensions` | ✴️ | List of file extensions to match, without the leading dot. Case-insensitive. E.g. `["jpg", "PNG"]`. |
| `name_pattern` | ✴️ | Glob pattern matched against the **filename only**. Supports `*` (any characters) and `?` (single character). E.g. `"invoice_*"`. |
| `min_size_mb` | ✴️ | Minimum file size in megabytes (inclusive). |
| `max_size_mb` | ✴️ | Maximum file size in megabytes (inclusive). |
| `ignore` | string list | `[]` | Filenames or glob patterns that prevent this rule from matching, even if all other conditions pass. Useful to carve out exceptions within a rule. |

✴️ At least one condition field is required per rule. All specified conditions are combined with **logical AND**.

#### Condition Logic

- If a rule specifies both `extensions` and `name_pattern`, a file must satisfy **both** to match.
- If a rule specifies both `min_size_mb` and `max_size_mb`, the file size must fall within that range.
- Combining all four conditions is valid — all must hold.

#### Ignore Lists

There are two levels of ignore, both accepting exact filenames or glob patterns (matched against the filename only):

| Level | Where | Effect |
|---|---|---|
| **Global** | `[settings] ignore = [...]` | Skips the listed files before any rule is even checked. The config file (e.g. `cleaner.toml`) is always implicitly in this list. |
| **Per-rule** | `[[rules]] ignore = [...]` | Skips the listed files for that specific rule only. The file can still be picked up by a later rule. |

Example:

```cli-folder-cleaner/cleaner.toml.example#L9-9
[settings]
# Skip these files globally — no rule will ever touch them
ignore = ["README.md", ".DS_Store", "Thumbs.db", "*.lnk"]

[[rules]]
name        = "Text documents"
destination = "Documents"
extensions  = ["txt", "md"]
# Keep .bak and changelog files in place even though they match the extension
ignore      = ["*.bak", "CHANGELOG.md"]
```

---

## Example Configuration

```cli-folder-cleaner/cleaner.toml.example#L9-161
[settings]
recursive = false
# unmatched_destination = "_Unsorted"

# Images — matched by extension
[[rules]]
name        = "Images"
destination = "Images"
extensions  = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]

# Invoices — matched by filename pattern (place BEFORE the generic PDFs rule)
[[rules]]
name         = "Invoices"
destination  = "Documents/Invoices"
name_pattern = "invoice_*"

# PDFs — matched by extension
[[rules]]
name        = "PDFs"
destination = "Documents/PDFs"
extensions  = ["pdf"]

# Large videos — matched by extension AND minimum size
[[rules]]
name        = "Large Videos"
destination = "Videos/Large"
extensions  = ["mp4", "mkv", "mov"]
min_size_mb = 500.0

# Videos — matched by extension (catches everything not caught above)
[[rules]]
name        = "Videos"
destination = "Videos"
extensions  = ["mp4", "mkv", "mov", "avi", "wmv", "webm"]

# Archives
[[rules]]
name        = "Archives"
destination = "Archives"
extensions  = ["zip", "tar", "gz", "7z", "rar"]
```

> **Tip — rule ordering matters.** Because the first matching rule wins, always place more specific rules (e.g. `invoice_*` PDFs) *before* more general ones (e.g. all PDFs). The same applies to size-filtered rules: put the large-file variant above the catch-all variant.

---

## Output

### Dry-run

```cli-folder-cleaner/README.md#L1-1
INFO  Target : /Users/you/Downloads
INFO  Config : /Users/you/Downloads/cleaner.toml
Dry-run mode — no files will be moved.

INFO  Loaded 8 rule(s).

[DRY-RUN] /Users/you/Downloads/photo.jpg → /Users/you/Downloads/Images/photo.jpg  (rule: Images)
[DRY-RUN] /Users/you/Downloads/invoice_2024_01.pdf → /Users/you/Downloads/Documents/Invoices/invoice_2024_01.pdf  (rule: Invoices)
[DRY-RUN] /Users/you/Downloads/archive.zip → /Users/you/Downloads/Archives/archive.zip  (rule: Archives)

──────────────────────────────────────────────────
SUMMARY 3 file(s) would be moved.
```

### Live run

```cli-folder-cleaner/README.md#L1-1
MOVED /Users/you/Downloads/photo.jpg → /Users/you/Downloads/Images/photo.jpg  (rule: Images)
MOVED /Users/you/Downloads/invoice_2024_01.pdf → /Users/you/Downloads/Documents/Invoices/invoice_2024_01.pdf  (rule: Invoices)
MOVED /Users/you/Downloads/archive.zip → /Users/you/Downloads/Archives/archive.zip  (rule: Archives)

──────────────────────────────────────────────────
SUMMARY 3 file(s) moved, 0 error(s).
```

### Exit codes

| Code | Meaning |
|---|---|
| `0` | Success — all matched files moved (or dry-run completed) |
| `1` | Fatal error (bad arguments, config not found, parse failure) |
| `2` | Run completed but one or more files could not be moved |

---

## Project Structure

```cli-folder-cleaner/README.md#L1-1
cli-folder-cleaner/
├── src/
│   ├── main.rs        # CLI argument parsing and entry point (clap)
│   ├── config.rs      # TOML config structs, loading, and validation
│   └── engine.rs      # File scanning, rule matching, and move execution
├── cleaner.toml.example  # Fully-commented example configuration
├── Cargo.toml
└── README.md
```

---

## Dependencies

| Crate | Purpose |
|---|---|
| [`clap`](https://crates.io/crates/clap) | CLI argument parsing |
| [`serde`](https://crates.io/crates/serde) + [`toml`](https://crates.io/crates/toml) | TOML deserialisation |
| [`glob`](https://crates.io/crates/glob) | Glob pattern matching for `name_pattern` |
| [`walkdir`](https://crates.io/crates/walkdir) | Recursive directory traversal |
| [`colored`](https://crates.io/crates/colored) | Coloured terminal output |
| [`anyhow`](https://crates.io/crates/anyhow) | Ergonomic error propagation |

---

## License

MIT

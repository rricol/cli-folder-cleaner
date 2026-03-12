# Drust Cleaner

A rule-driven file organiser written in Rust, available as both a **CLI tool** and a **desktop GUI app**. Point it at a directory, define rules in a TOML file, and it moves files into sub-folders automatically.

---

## Features

- **Rule-based organisation** — define as many rules as you need in a simple TOML file
- **Multiple match conditions** — filter by file extension, filename glob pattern, and/or file size range
- **Per-rule exclude lists** — skip specific files or glob patterns within a rule
- **Global ignore list** — skip files before any rule is checked
- **First-match-wins** — rules are evaluated top-to-bottom; the first matching rule applies
- **Dry-run mode** — preview every planned move before committing
- **Recursive scanning** — optionally descend into sub-directories
- **Unmatched catch-all** — funnel files that matched no rule into a dedicated folder
- **Nested destinations** — paths like `Documents/PDFs` are created automatically
- **Cross-device safe** — falls back to copy + delete when a simple rename would fail
- **Desktop GUI** — native app with a visual rule editor and template management

---

## Desktop GUI

The GUI is built with [Tauri](https://tauri.app) and ships as a native desktop application. It wraps the same `cleaner-core` engine as the CLI.

### Building

Requires [Rust](https://rustup.rs) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your platform.

```sh
cargo tauri dev        # run in development mode
cargo tauri build      # produce a release bundle
```

Or build just the binary:

```sh
cargo build -p cleaner-gui --release
./target/release/cleaner-gui
```

### Cleaner tab

- Pick a target folder — the app detects whether a `cleaner.toml` is already present
- **Generate Default Config** — writes a sensible starter config if none exists
- **Dry Run** — shows every planned move in the output log without touching any file
- **Run Now** — executes the moves and displays a summary (files moved / errors)
- **Templates card** — save the current folder's config as a named template, or apply / view / delete existing ones

### Templates tab

A dedicated page for creating and managing reusable configurations.

**Sidebar** lists all saved templates. Each row shows:
- Click the name to open it in the editor
- **⧉** — duplicate the template (saved as `"<name> copy"`)
- **×** — delete the template

**Editor panel** lets you build a template visually:

| Section | Fields |
|---|---|
| Name | Editable at the top; changing it renames the file on Save |
| Settings | Recursive toggle, Unmatched destination folder |
| Rules | One card per rule — see below |

Each **rule card** contains:
- **Name** and **Destination** folder
- **Extensions** — chip input; type an extension and press Enter or comma to add, click a chip to remove
- **Exclude** — chip input for filenames or glob patterns to skip within this rule (e.g. `*.bak`, `draft_*`)
- **Optional filters** (collapsed) — name pattern (glob), min/max size in MB
- **↑ / ↓** chevron buttons to reorder rules
- **×** to delete the rule

A yellow dot appears next to the Save button whenever there are unsaved changes. The editor validates that every rule has a name, a destination, and at least one condition before saving.

**Templates are stored at:**

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/com.folder-cleaner.app/templates/` |
| Linux | `~/.local/share/com.folder-cleaner.app/templates/` |
| Windows | `%APPDATA%\com.folder-cleaner.app\templates\` |

Each template is a standard `cleaner.toml`-compatible TOML file and can be edited by hand.

---

## CLI

### Installation

```sh
git clone https://github.com/rricol/cli-folder-cleaner.git
cd cli-folder-cleaner
cargo install --path crates/cleaner-cli
```

### Usage

```
cleaner-cli [OPTIONS]

Options:
  -t, --target <DIR>    Directory to clean [default: current working directory]
  -c, --config <FILE>   Path to the rules file [default: <target>/cleaner.toml]
  -d, --dry-run         Preview actions without moving any files
  -v, --verbose         Print target path, config path, and rule count
  -h, --help            Print help
  -V, --version         Print version
```

### Examples

```sh
# Clean the current directory using ./cleaner.toml
cleaner-cli

# Clean a specific directory
cleaner-cli --target ~/Downloads

# Use a config file stored elsewhere
cleaner-cli --target ~/Downloads --config ~/.config/cleaner.toml

# Dry-run with verbose output
cleaner-cli --target ~/Downloads --dry-run --verbose
```

### Output

**Dry-run**
```
[DRY-RUN] /Users/you/Downloads/photo.jpg → /Users/you/Downloads/Images/photo.jpg  (rule: Images)
[DRY-RUN] /Users/you/Downloads/invoice_2024_01.pdf → /Users/you/Downloads/Documents/Invoices/invoice_2024_01.pdf  (rule: Invoices)

SUMMARY  2 file(s) would be moved.
```

**Live run**
```
MOVED /Users/you/Downloads/photo.jpg → /Users/you/Downloads/Images/photo.jpg  (rule: Images)
MOVED /Users/you/Downloads/invoice_2024_01.pdf → /Users/you/Downloads/Documents/Invoices/invoice_2024_01.pdf  (rule: Invoices)

SUMMARY  2 file(s) moved, 0 error(s).
```

### Exit codes

| Code | Meaning |
|---|---|
| `0` | Success (or dry-run completed) |
| `1` | Fatal error (bad arguments, config not found, parse failure) |
| `2` | Run completed but one or more files could not be moved |

---

## Configuration File

By default the tool looks for `cleaner.toml` inside the target directory. Override with `--config`.

### Global settings

```toml
[settings]
recursive = false
# unmatched_destination = "_Unsorted"
# ignore = [".DS_Store", "Thumbs.db", "*.lnk"]
```

| Key | Type | Default | Description |
|---|---|---|---|
| `recursive` | bool | `false` | Recurse into sub-directories |
| `unmatched_destination` | string | — | Folder for files that matched no rule. Omit to leave them in place. |
| `ignore` | string list | `[]` | Filenames or glob patterns skipped globally before any rule is checked. `cleaner.toml` itself is always ignored automatically. |

### Rules

Each `[[rules]]` block defines one rule. Rules are evaluated **top-to-bottom**; the **first matching rule wins**.

```toml
[[rules]]
name        = "Images"
destination = "Images"
extensions  = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "svg"]
```

#### Rule fields

| Field | Required | Description |
|---|---|---|
| `name` | ✅ | Human-readable label shown in output |
| `destination` | ✅ | Target sub-folder relative to the target directory. Nested paths are created automatically. |
| `extensions` | ✴️ | Extensions to match, no leading dot, case-insensitive. |
| `name_pattern` | ✴️ | Glob matched against the filename only (`*`, `?`). |
| `min_size_mb` | ✴️ | Minimum file size in MB (inclusive). |
| `max_size_mb` | ✴️ | Maximum file size in MB (inclusive). |
| `ignore` | — | Filenames or globs that prevent this rule from matching. The file can still be picked up by a later rule. |

✴️ At least one condition is required. All specified conditions are combined with **AND**.

### Example configuration

```toml
[settings]
recursive = false
# unmatched_destination = "_Unsorted"

[[rules]]
name        = "Images"
destination = "Images"
extensions  = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]

[[rules]]
name         = "Invoices"        # more specific — must come before generic PDFs
destination  = "Documents/Invoices"
name_pattern = "invoice_*"

[[rules]]
name        = "PDFs"
destination = "Documents/PDFs"
extensions  = ["pdf"]

[[rules]]
name        = "Large Videos"     # size-filtered variant before the catch-all
destination = "Videos/Large"
extensions  = ["mp4", "mkv", "mov"]
min_size_mb = 500.0

[[rules]]
name        = "Videos"
destination = "Videos"
extensions  = ["mp4", "mkv", "mov", "avi", "wmv", "webm"]

[[rules]]
name        = "Archives"
destination = "Archives"
extensions  = ["zip", "tar", "gz", "7z", "rar"]
ignore      = ["backup_*.zip"]   # keep backup archives in place
```

> **Rule ordering matters.** Place more specific rules (e.g. `invoice_*` PDFs) *before* broader ones (e.g. all PDFs). Place size-filtered variants before their catch-all counterparts.

---

## Project Structure

```
cli-folder-cleaner/
├── crates/
│   ├── cleaner-core/          # shared engine (config, rule matching, file moves)
│   │   └── src/
│   │       ├── config.rs
│   │       └── engine.rs
│   └── cleaner-cli/           # CLI front-end (clap)
│       └── src/main.rs
├── src-tauri/                 # Tauri desktop GUI back-end
│   └── src/
│       ├── commands.rs        # Tauri commands (run, config, templates)
│       └── lib.rs
├── dist/
│   └── index.html             # GUI front-end (single-file, vanilla JS)
├── cleaner.toml.example
├── Cargo.toml                 # workspace
└── README.md
```

---

## Dependencies

| Crate | Purpose |
|---|---|
| [`clap`](https://crates.io/crates/clap) | CLI argument parsing |
| [`serde`](https://crates.io/crates/serde) + [`toml`](https://crates.io/crates/toml) | TOML deserialisation and validation |
| [`glob`](https://crates.io/crates/glob) | Glob pattern matching |
| [`walkdir`](https://crates.io/crates/walkdir) | Recursive directory traversal |
| [`colored`](https://crates.io/crates/colored) | Coloured terminal output |
| [`anyhow`](https://crates.io/crates/anyhow) | Error propagation |
| [`tauri`](https://crates.io/crates/tauri) | Desktop app framework (GUI only) |

---

## License

MIT

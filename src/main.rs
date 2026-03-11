use std::path::PathBuf;
use std::process;

use clap::Parser;
use colored::Colorize;

mod config;
mod engine;

/// A CLI tool that organises files in a directory according to rules defined
/// in a TOML configuration file.
#[derive(Parser, Debug)]
#[command(
    name = "cli-folder-cleaner",
    version,
    about = "Organise files into folders according to rules defined in a TOML config file.",
    long_about = None
)]
struct Cli {
    /// Directory to clean. Defaults to the current working directory.
    #[arg(short, long, value_name = "DIR")]
    target: Option<PathBuf>,

    /// Path to the rules file. Defaults to `cleaner.toml` in the target directory.
    #[arg(short, long, value_name = "FILE")]
    config: Option<PathBuf>,

    /// Preview what would happen without moving any files.
    #[arg(short, long, default_value_t = false)]
    dry_run: bool,

    /// Print extra information during the run.
    #[arg(short, long, default_value_t = false)]
    verbose: bool,
}

fn main() {
    let cli = Cli::parse();

    // Resolve the target directory.
    let target_dir = match cli.target {
        Some(ref p) => p.clone(),
        None => std::env::current_dir().unwrap_or_else(|e| {
            eprintln!(
                "{} Could not determine current directory: {}",
                "ERROR".red().bold(),
                e
            );
            process::exit(1);
        }),
    };

    if !target_dir.exists() {
        eprintln!(
            "{} Target directory '{}' does not exist.",
            "ERROR".red().bold(),
            target_dir.display()
        );
        process::exit(1);
    }

    if !target_dir.is_dir() {
        eprintln!(
            "{} '{}' is not a directory.",
            "ERROR".red().bold(),
            target_dir.display()
        );
        process::exit(1);
    }

    // Resolve the config file path.
    let config_path = match cli.config {
        Some(ref p) => p.clone(),
        None => target_dir.join("cleaner.toml"),
    };

    if !config_path.exists() {
        eprintln!(
            "{} Config file '{}' not found.\n\
             Hint: create a 'cleaner.toml' in the target directory, or pass --config <FILE>.",
            "ERROR".red().bold(),
            config_path.display()
        );
        process::exit(1);
    }

    if cli.verbose || cli.dry_run {
        println!(
            "{} Target : {}",
            "INFO".cyan().bold(),
            target_dir.display().to_string().white()
        );
        println!(
            "{} Config : {}",
            "INFO".cyan().bold(),
            config_path.display().to_string().white()
        );
        if cli.dry_run {
            println!(
                "{}",
                "Dry-run mode — no files will be moved.".yellow().bold()
            );
        }
        println!();
    }

    // Load and validate the config.
    let config = match config::load_config(&config_path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("{} {}", "ERROR".red().bold(), e);
            process::exit(1);
        }
    };

    if cli.verbose {
        println!(
            "{} Loaded {} rule(s).\n",
            "INFO".cyan().bold(),
            config.rules.len()
        );
    }

    // Run the engine.
    let config_file_name = config_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("cleaner.toml")
        .to_string();

    match engine::run(&target_dir, &config, &config_file_name, cli.dry_run) {
        Ok(summary) => {
            println!();
            println!("{}", "─".repeat(50).dimmed());
            if cli.dry_run {
                println!(
                    "{} {} file(s) would be moved.",
                    "SUMMARY".cyan().bold(),
                    summary.moved
                );
            } else {
                println!(
                    "{} {} file(s) moved, {} error(s).",
                    "SUMMARY".green().bold(),
                    summary.moved,
                    summary.errors
                );
            }

            if summary.errors > 0 {
                process::exit(2);
            }
        }
        Err(e) => {
            eprintln!("{} {}", "ERROR".red().bold(), e);
            process::exit(1);
        }
    }
}

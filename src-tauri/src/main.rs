#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::{DateTime, Datelike, Local};
use mime_guess::from_path;
use serde::{Deserialize, Serialize};
use std::{
  collections::HashMap,
  fs,
  path::{Path, PathBuf},
  time::{SystemTime, UNIX_EPOCH},
};
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct FileEntry {
  path: String,
  name: String,
  extension: String,
  size: u64,
  created_at: u64,
  modified_at: u64,
  mime_type: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
enum RuleType {
  ByType,
  ByDate,
  Combined,
  Custom,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
enum DateField {
  Created,
  Modified,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
enum CombinedOrder {
  DateType,
  TypeDate,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct RuleOptions {
  date_field: DateField,
  combined_order: CombinedOrder,
  custom_mappings: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct OrganizeRule {
  r#type: RuleType,
  options: RuleOptions,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
enum DuplicateHandling {
  Skip,
  Rename,
  Overwrite,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct OrganizeRules {
  root_path: String,
  rule: OrganizeRule,
  duplicate_handling: DuplicateHandling,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct FileMove {
  from: String,
  to: String,
  timestamp: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct OrganizeResult {
  moved: Vec<FileMove>,
  skipped: Vec<FileEntry>,
  errors: Vec<String>,
  is_dry_run: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct FileContext {
  path: String,
  extension: String,
  mime_type: String,
  file_category: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct UndoResult {
  restored: Vec<FileMove>,
  errors: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct OperationLog {
  moved: Vec<FileMove>,
  created_at: u64,
}

fn system_time_to_epoch_millis(input: Option<SystemTime>) -> u64 {
  input
    .and_then(|value| value.duration_since(UNIX_EPOCH).ok())
    .map(|duration| duration.as_millis() as u64)
    .unwrap_or(0)
}

fn detect_category(extension: &str, mime_type: &str) -> &'static str {
  let ext = extension.to_ascii_lowercase();
  let image = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic", "tiff"];
  let documents = [
    "pdf", "doc", "docx", "txt", "rtf", "md", "xls", "xlsx", "ppt", "pptx",
  ];
  let videos = ["mp4", "mov", "avi", "mkv", "webm", "wmv", "m4v"];
  let audio = ["mp3", "wav", "aac", "flac", "ogg", "m4a"];
  let code = [
    "ts", "tsx", "js", "jsx", "rs", "py", "go", "java", "c", "cpp", "h", "hpp", "cs", "json",
    "yaml", "yml", "toml", "html", "css", "scss",
  ];
  let archives = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"];

  if image.contains(&ext.as_str()) || mime_type.starts_with("image/") {
    "Images"
  } else if documents.contains(&ext.as_str()) {
    "Documents"
  } else if videos.contains(&ext.as_str()) || mime_type.starts_with("video/") {
    "Videos"
  } else if audio.contains(&ext.as_str()) || mime_type.starts_with("audio/") {
    "Audio"
  } else if code.contains(&ext.as_str()) {
    "Code"
  } else if archives.contains(&ext.as_str()) {
    "Archives"
  } else {
    "Other"
  }
}

fn entry_from_path(path: &Path) -> Option<FileEntry> {
  let metadata = fs::metadata(path).ok()?;
  let name = path.file_name()?.to_string_lossy().to_string();
  let extension = path
    .extension()
    .map(|value| value.to_string_lossy().to_string())
    .unwrap_or_default();
  let mime_type = from_path(path).first_or_octet_stream().to_string();
  Some(FileEntry {
    path: path.to_string_lossy().to_string(),
    name,
    extension,
    size: metadata.len(),
    created_at: system_time_to_epoch_millis(metadata.created().ok()),
    modified_at: system_time_to_epoch_millis(metadata.modified().ok()),
    mime_type,
  })
}

fn file_time_parts(entry: &FileEntry, field: &DateField) -> (String, String) {
  let timestamp = match field {
    DateField::Created => entry.created_at,
    DateField::Modified => entry.modified_at,
  };

  let datetime: DateTime<Local> = DateTime::from(
    UNIX_EPOCH + std::time::Duration::from_millis(if timestamp == 0 { 0 } else { timestamp }),
  );
  (
    datetime.year().to_string(),
    format!("{:02}", datetime.month()),
  )
}

fn clean_extension(extension: &str) -> String {
  extension.trim_start_matches('.').to_ascii_lowercase()
}

fn target_segment(entry: &FileEntry, rule: &OrganizeRule) -> Vec<String> {
  let extension = clean_extension(&entry.extension);
  if let Some(folder) = rule.options.custom_mappings.get(&extension) {
    return vec![folder.to_string()];
  }

  let category = detect_category(&extension, &entry.mime_type).to_string();
  let (year, month) = file_time_parts(entry, &rule.options.date_field);
  match rule.r#type {
    RuleType::ByType => vec![category],
    RuleType::ByDate => vec![year, month],
    RuleType::Combined => match rule.options.combined_order {
      CombinedOrder::DateType => vec![year, month, category],
      CombinedOrder::TypeDate => vec![category, year, month],
    },
    RuleType::Custom => vec![
      rule
        .options
        .custom_mappings
        .get(&extension)
        .cloned()
        .unwrap_or_else(|| category),
    ],
  }
}

fn ensure_parent(path: &Path) -> Result<(), String> {
  let parent = path
    .parent()
    .ok_or_else(|| format!("Could not resolve parent for {}", path.display()))?;
  fs::create_dir_all(parent).map_err(|error| error.to_string())
}

fn move_file(from: &Path, to: &Path, duplicate_handling: &DuplicateHandling) -> Result<(), String> {
  ensure_parent(to)?;
  if matches!(duplicate_handling, DuplicateHandling::Overwrite) && to.exists() {
    fs::remove_file(to).map_err(|error| error.to_string())?;
  }
  match fs::rename(from, to) {
    Ok(_) => Ok(()),
    Err(_) => {
      fs::copy(from, to).map_err(|error| error.to_string())?;
      fs::remove_file(from).map_err(|error| error.to_string())?;
      Ok(())
    }
  }
}

fn resolve_duplicate_target(
  initial_target: PathBuf,
  duplicate_handling: &DuplicateHandling,
) -> Option<PathBuf> {
  if !initial_target.exists() {
    return Some(initial_target);
  }

  match duplicate_handling {
    DuplicateHandling::Skip => None,
    DuplicateHandling::Overwrite => Some(initial_target),
    DuplicateHandling::Rename => {
      let stem = initial_target.file_stem()?.to_string_lossy().to_string();
      let ext = initial_target.extension().map(|value| value.to_string_lossy().to_string());
      let parent = initial_target.parent()?.to_path_buf();
      for index in 1..=10_000 {
        let candidate_name = match ext.as_ref() {
          Some(value) => format!("{stem}_{index}.{value}"),
          None => format!("{stem}_{index}"),
        };
        let candidate = parent.join(candidate_name);
        if !candidate.exists() {
          return Some(candidate);
        }
      }
      None
    }
  }
}

fn operation_log_path(root_path: &str) -> PathBuf {
  PathBuf::from(root_path)
    .join(".tidyflow")
    .join("last-operation.json")
}

#[tauri::command]
fn scan_folder(path: String) -> Vec<FileEntry> {
  WalkDir::new(path)
    .into_iter()
    .filter_map(Result::ok)
    .filter(|entry| entry.file_type().is_file())
    .filter_map(|entry| entry_from_path(entry.path()))
    .collect()
}

#[tauri::command]
fn get_file_context(path: String) -> FileContext {
  let source = PathBuf::from(path.clone());
  let extension = source
    .extension()
    .map(|value| value.to_string_lossy().to_string())
    .unwrap_or_default();
  let mime_type = from_path(&source).first_or_octet_stream().to_string();
  let file_category = detect_category(&extension, &mime_type).to_string();

  FileContext {
    path,
    extension,
    mime_type,
    file_category,
  }
}

#[tauri::command]
fn organize_files(rules: OrganizeRules, dry_run: bool) -> OrganizeResult {
  let root_path = PathBuf::from(&rules.root_path);
  let mut moved: Vec<FileMove> = Vec::new();
  let mut skipped: Vec<FileEntry> = Vec::new();
  let mut errors: Vec<String> = Vec::new();
  let scanned_entries = scan_folder(rules.root_path.clone());

  for entry in scanned_entries {
    if entry.path.contains(".tidyflow") {
      continue;
    }

    let source_path = PathBuf::from(&entry.path);
    let segments = target_segment(&entry, &rules.rule);
    let target_dir = segments.iter().fold(root_path.clone(), |acc, segment| acc.join(segment));
    let initial_target = target_dir.join(&entry.name);
    let target_path = match resolve_duplicate_target(initial_target, &rules.duplicate_handling) {
      Some(path) => path,
      None => {
        skipped.push(entry.clone());
        continue;
      }
    };

    if source_path == target_path {
      skipped.push(entry.clone());
      continue;
    }

    let move_record = FileMove {
      from: source_path.to_string_lossy().to_string(),
      to: target_path.to_string_lossy().to_string(),
      timestamp: system_time_to_epoch_millis(Some(SystemTime::now())),
    };

    if dry_run {
      moved.push(move_record);
      continue;
    }

    if let Err(error) = move_file(&source_path, &target_path, &rules.duplicate_handling) {
      errors.push(format!("{} -> {}: {error}", source_path.display(), target_path.display()));
    } else {
      moved.push(move_record);
    }
  }

  if !dry_run {
    let log = OperationLog {
      moved: moved.clone(),
      created_at: system_time_to_epoch_millis(Some(SystemTime::now())),
    };
    let log_path = operation_log_path(&rules.root_path);
    if let Some(parent) = log_path.parent() {
      if let Err(error) = fs::create_dir_all(parent) {
        errors.push(error.to_string());
      }
    }
    if let Ok(payload) = serde_json::to_string_pretty(&log) {
      if let Err(error) = fs::write(&log_path, payload) {
        errors.push(error.to_string());
      }
    }
  }

  OrganizeResult {
    moved,
    skipped,
    errors,
    is_dry_run: dry_run,
  }
}

#[tauri::command]
fn undo_last_operation(log_path: String) -> Result<UndoResult, String> {
  let payload = fs::read_to_string(&log_path).map_err(|error| error.to_string())?;
  let operation: OperationLog = serde_json::from_str(&payload).map_err(|error| error.to_string())?;

  let mut restored = Vec::<FileMove>::new();
  let mut errors = Vec::<String>::new();

  for file_move in operation.moved.iter().rev() {
    let from = PathBuf::from(&file_move.from);
    let to = PathBuf::from(&file_move.to);
    if !to.exists() {
      errors.push(format!("Missing file for rollback: {}", to.display()));
      continue;
    }

    if let Err(error) = ensure_parent(&from) {
      errors.push(error);
      continue;
    }

    if let Err(error) = fs::rename(&to, &from) {
      errors.push(format!("{} -> {}: {error}", to.display(), from.display()));
      continue;
    }

    restored.push(FileMove {
      from: to.to_string_lossy().to_string(),
      to: from.to_string_lossy().to_string(),
      timestamp: system_time_to_epoch_millis(Some(SystemTime::now())),
    });
  }

  let cleared_log = OperationLog {
    moved: Vec::new(),
    created_at: system_time_to_epoch_millis(Some(SystemTime::now())),
  };
  if let Ok(serialized) = serde_json::to_string_pretty(&cleared_log) {
    let _ = fs::write(log_path, serialized);
  }

  Ok(UndoResult { restored, errors })
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .build(),
    )
    .invoke_handler(tauri::generate_handler![
      scan_folder,
      organize_files,
      undo_last_operation,
      get_file_context
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

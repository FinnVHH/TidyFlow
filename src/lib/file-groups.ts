import type { FileCategory } from "@/types/organizer";

export const CATEGORY_EXTENSIONS: Record<FileCategory, string[]> = {
  Images: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic", "tiff"],
  Documents: [
    "pdf",
    "doc",
    "docx",
    "txt",
    "rtf",
    "md",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
  ],
  Videos: ["mp4", "mov", "avi", "mkv", "webm", "wmv", "m4v"],
  Audio: ["mp3", "wav", "aac", "flac", "ogg", "m4a"],
  Code: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "rs",
    "py",
    "go",
    "java",
    "c",
    "cpp",
    "h",
    "hpp",
    "cs",
    "json",
    "yaml",
    "yml",
    "toml",
    "html",
    "css",
    "scss",
  ],
  Archives: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"],
  Other: [],
};

export function normalizeExtension(extension: string): string {
  return extension.replace(/^\./, "").trim().toLowerCase();
}

export function detectCategoryByExtension(extension: string): FileCategory {
  const normalized = normalizeExtension(extension);

  for (const [category, extensions] of Object.entries(CATEGORY_EXTENSIONS)) {
    if (extensions.includes(normalized)) {
      return category as FileCategory;
    }
  }

  return "Other";
}

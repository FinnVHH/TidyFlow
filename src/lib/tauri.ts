"use client";

import { invoke } from "@tauri-apps/api/core";

import type {
  FileContext,
  FileEntry,
  OrganizeResult,
  OrganizeRules,
  UndoResult,
} from "@/types/organizer";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && Boolean(window.__TAURI_INTERNALS__);
}

export async function scanFolder(path: string): Promise<FileEntry[]> {
  return invoke<FileEntry[]>("scan_folder", { path });
}

export async function getFileContext(path: string): Promise<FileContext> {
  return invoke<FileContext>("get_file_context", { path });
}

export async function organizeFiles(
  rules: OrganizeRules,
  dryRun: boolean,
): Promise<OrganizeResult> {
  return invoke<OrganizeResult>("organize_files", { rules, dryRun });
}

export async function undoLastOperation(logPath: string): Promise<UndoResult> {
  return invoke<UndoResult>("undo_last_operation", { logPath });
}

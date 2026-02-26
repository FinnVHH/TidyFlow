"use client";

import { useMemo, useState } from "react";

import { organizeFiles, scanFolder, undoLastOperation } from "@/lib/tauri";
import type {
  DuplicateHandling,
  FileEntry,
  OrganizeResult,
  OrganizeRule,
} from "@/types/organizer";

const DEFAULT_RULE: OrganizeRule = {
  type: "combined",
  options: {
    dateField: "modified",
    combinedOrder: "date_type",
    customMappings: {},
  },
};

export function useOrganizer() {
  const [folderPath, setFolderPath] = useState("");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [rule, setRule] = useState<OrganizeRule>(DEFAULT_RULE);
  const [duplicateHandling, setDuplicateHandling] =
    useState<DuplicateHandling>("rename");
  const [previewResult, setPreviewResult] = useState<OrganizeResult | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const logPath = useMemo(() => {
    if (!folderPath) return "";
    return `${folderPath}${folderPath.endsWith("\\") ? "" : "\\"}.tidyflow\\last-operation.json`;
  }, [folderPath]);

  async function selectFolder(path: string) {
    setFolderPath(path);
    setLastError(null);
    setPreviewResult(null);
    const scanned = await scanFolder(path);
    setEntries(scanned);
  }

  async function runPreview() {
    if (!folderPath) return null;
    setIsWorking(true);
    setLastError(null);
    try {
      const result = await organizeFiles(
        {
          rootPath: folderPath,
          rule,
          duplicateHandling,
        },
        true,
      );
      setPreviewResult(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to preview operation";
      setLastError(message);
      throw error;
    } finally {
      setIsWorking(false);
    }
  }

  async function runApply() {
    if (!folderPath) return null;
    setIsWorking(true);
    setLastError(null);
    try {
      const result = await organizeFiles(
        {
          rootPath: folderPath,
          rule,
          duplicateHandling,
        },
        false,
      );
      setPreviewResult(result);
      const rescanned = await scanFolder(folderPath);
      setEntries(rescanned);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to apply organization";
      setLastError(message);
      throw error;
    } finally {
      setIsWorking(false);
    }
  }

  async function runUndo() {
    if (!logPath) return null;
    setIsWorking(true);
    setLastError(null);
    try {
      const result = await undoLastOperation(logPath);
      if (folderPath) {
        const rescanned = await scanFolder(folderPath);
        setEntries(rescanned);
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to rollback operation";
      setLastError(message);
      throw error;
    } finally {
      setIsWorking(false);
    }
  }

  return {
    folderPath,
    entries,
    rule,
    duplicateHandling,
    previewResult,
    isWorking,
    lastError,
    setRule,
    setDuplicateHandling,
    selectFolder,
    runPreview,
    runApply,
    runUndo,
  };
}

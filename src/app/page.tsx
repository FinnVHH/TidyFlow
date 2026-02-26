"use client";

import { toast } from "sonner";

import { FolderPicker } from "@/components/features/folder-picker";
import { OperationToolbar } from "@/components/features/operation-toolbar";
import { PreviewPane } from "@/components/features/preview-pane";
import { RuleBuilder } from "@/components/features/rule-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatBytes } from "@/lib/format";
import { isTauriRuntime } from "@/lib/tauri";
import { useOrganizer } from "@/hooks/use-organizer";

export default function HomePage() {
  const {
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
  } = useOrganizer();

  async function handlePreview() {
    try {
      const result = await runPreview();
      if (result) {
        toast.success(`Preview ready: ${result.moved.length} moves planned.`);
      }
    } catch {
      toast.error("Failed to generate preview.");
    }
  }

  async function handleApply() {
    try {
      const result = await runApply();
      if (result) {
        toast.success(`Organized ${result.moved.length} files.`);
      }
    } catch {
      toast.error("Organization failed.");
    }
  }

  async function handleUndo() {
    try {
      const result = await runUndo();
      if (result) {
        toast.success(`Rollback complete: ${result.restored.length} files restored.`);
      }
    } catch {
      toast.error("Undo failed.");
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>TidyFlow Organizer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FolderPicker
            folderPath={folderPath}
            onFolderSelected={selectFolder}
            disabled={isWorking}
          />
          {!isTauriRuntime() && (
            <p className="text-sm text-destructive">
              Folder selection requires the Tauri desktop runtime.
            </p>
          )}
          {lastError && <p className="text-sm text-destructive">{lastError}</p>}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
        <div className="space-y-6">
          <RuleBuilder
            rule={rule}
            duplicateHandling={duplicateHandling}
            onRuleChange={setRule}
            onDuplicateHandlingChange={setDuplicateHandling}
          />
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OperationToolbar
                isWorking={isWorking}
                canPreview={Boolean(folderPath)}
                canApply={Boolean(folderPath)}
                onPreview={handlePreview}
                onApply={handleApply}
                onUndo={handleUndo}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Folder Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {entries.length} files scanned, total size{" "}
                {formatBytes(entries.reduce((sum, file) => sum + file.size, 0))}
              </p>
              <Separator />
              <div className="max-h-60 space-y-2 overflow-auto text-sm">
                {entries.slice(0, 40).map((entry) => (
                  <div key={entry.path} className="rounded-md border px-3 py-2">
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.path}</p>
                  </div>
                ))}
                {entries.length > 40 && (
                  <p className="text-xs text-muted-foreground">
                    Showing first 40 files.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <PreviewPane result={previewResult} />
        </div>
      </div>
    </div>
  );
}

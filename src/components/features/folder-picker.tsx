"use client";

import { FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isTauriRuntime } from "@/lib/tauri";

interface FolderPickerProps {
  folderPath: string;
  onFolderSelected: (path: string) => void;
  disabled?: boolean;
}

export function FolderPicker({ folderPath, onFolderSelected, disabled }: FolderPickerProps) {
  async function pickFolder() {
    if (!isTauriRuntime()) return;
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (typeof selected === "string") {
      onFolderSelected(selected);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input readOnly value={folderPath} placeholder="Select a folder to organize" />
      <Button onClick={pickFolder} disabled={disabled || !isTauriRuntime()}>
        <FolderOpen className="h-4 w-4" />
        Browse
      </Button>
    </div>
  );
}

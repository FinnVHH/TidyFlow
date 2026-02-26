"use client";

import { Minus, Square, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { isTauriRuntime } from "@/lib/tauri";
import { cn } from "@/lib/utils";

const CONTROL_BUTTON_CLASS =
  "inline-flex h-8 w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

export function Titlebar() {
  async function minimize() {
    if (!isTauriRuntime()) return;
    await getCurrentWindow().minimize();
  }

  async function maximize() {
    if (!isTauriRuntime()) return;
    const appWindow = getCurrentWindow();
    const maximized = await appWindow.isMaximized();
    if (maximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  }

  async function close() {
    if (!isTauriRuntime()) return;
    await getCurrentWindow().close();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div data-tauri-drag-region className="flex h-11 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium tracking-wide">TidyFlow</span>
        </div>
        <div className="flex items-center gap-1" data-tauri-drag-region={false}>
          <button aria-label="Minimize" className={CONTROL_BUTTON_CLASS} onClick={minimize}>
            <Minus className="h-4 w-4" />
          </button>
          <button aria-label="Maximize" className={CONTROL_BUTTON_CLASS} onClick={maximize}>
            <Square className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Close"
            className={cn(CONTROL_BUTTON_CLASS, "hover:bg-red-600 hover:text-white")}
            onClick={close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

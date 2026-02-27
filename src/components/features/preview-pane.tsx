"use client";

import { AlertTriangle, ArrowRight, FileWarning, MoveRight } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import type { OrganizeResult } from "@/types/organizer";

interface PreviewPaneProps {
  result: OrganizeResult | null;
}

const MAX_RENDER_ITEMS = 200;

export function PreviewPane({ result }: PreviewPaneProps) {
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        Run preview to inspect the tree diff before applying any move operation.
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">Dry Run Preview</h3>
        <span className="text-xs text-muted-foreground">
          {result.moved.length} planned moves
        </span>
      </div>
      <Separator />
      <ScrollArea className="h-[340px]">
        <div className="space-y-5 p-4">
          <section className="space-y-2">
            <h4 className="inline-flex items-center gap-2 text-sm font-medium">
              <MoveRight className="h-4 w-4" />
              Moves
            </h4>
            <div className="space-y-2">
              {result.moved.slice(0, MAX_RENDER_ITEMS).map((move) => (
                <div
                  key={`${move.from}-${move.to}-${move.timestamp}`}
                  className="rounded-md border bg-card p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5">{move.from}</code>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <code className="rounded bg-muted px-1.5 py-0.5">{move.to}</code>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Planned: {formatDate(move.timestamp)}
                  </p>
                </div>
              ))}
              {result.moved.length > MAX_RENDER_ITEMS && (
                <p className="text-xs text-muted-foreground">
                  Showing first {MAX_RENDER_ITEMS} of {result.moved.length} moves.
                </p>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="inline-flex items-center gap-2 text-sm font-medium">
              <FileWarning className="h-4 w-4" />
              Skipped
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {result.skipped.length === 0 ? (
                <p>No skipped files.</p>
              ) : (
                result.skipped
                  .slice(0, MAX_RENDER_ITEMS)
                  .map((item) => <p key={item.path}>{item.path}</p>)
              )}
              {result.skipped.length > MAX_RENDER_ITEMS && (
                <p className="text-xs">Showing first {MAX_RENDER_ITEMS} skipped items.</p>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="inline-flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              Errors
            </h4>
            <div className="space-y-2 text-sm text-destructive">
              {result.errors.length === 0 ? (
                <p className="text-muted-foreground">No errors.</p>
              ) : (
                result.errors
                  .slice(0, MAX_RENDER_ITEMS)
                  .map((error, index) => <p key={`${error}-${index}`}>{error}</p>)
              )}
              {result.errors.length > MAX_RENDER_ITEMS && (
                <p className="text-xs text-muted-foreground">
                  Showing first {MAX_RENDER_ITEMS} errors.
                </p>
              )}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

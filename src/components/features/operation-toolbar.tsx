"use client";

import { Loader2, RotateCcw, Sparkles, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface OperationToolbarProps {
  isWorking: boolean;
  canPreview: boolean;
  canApply: boolean;
  onPreview: () => void;
  onApply: () => void;
  onUndo: () => void;
}

export function OperationToolbar({
  isWorking,
  canPreview,
  canApply,
  onPreview,
  onApply,
  onUndo,
}: OperationToolbarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onPreview} disabled={!canPreview || isWorking}>
        {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Dry Run
      </Button>
      <Button onClick={onApply} variant="secondary" disabled={!canApply || isWorking}>
        <WandSparkles className="h-4 w-4" />
        Apply & Organize
      </Button>
      <Button onClick={onUndo} variant="outline" disabled={isWorking}>
        <RotateCcw className="h-4 w-4" />
        Undo Last Operation
      </Button>
    </div>
  );
}

"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CombinedOrder,
  DateField,
  DuplicateHandling,
  OrganizeRule,
  RuleType,
} from "@/types/organizer";

interface RuleBuilderProps {
  rule: OrganizeRule;
  duplicateHandling: DuplicateHandling;
  onRuleChange: (rule: OrganizeRule) => void;
  onDuplicateHandlingChange: (value: DuplicateHandling) => void;
}

export function RuleBuilder({
  rule,
  duplicateHandling,
  onRuleChange,
  onDuplicateHandlingChange,
}: RuleBuilderProps) {
  function setRuleType(type: RuleType) {
    onRuleChange({ ...rule, type });
  }

  function setDateField(dateField: DateField) {
    onRuleChange({ ...rule, options: { ...rule.options, dateField } });
  }

  function setCombinedOrder(combinedOrder: CombinedOrder) {
    onRuleChange({ ...rule, options: { ...rule.options, combinedOrder } });
  }

  function addCustomRule() {
    const next = { ...rule.options.customMappings };
    next["ext"] = "Custom";
    onRuleChange({ ...rule, options: { ...rule.options, customMappings: next } });
  }

  function removeCustomRule(extension: string) {
    const next = { ...rule.options.customMappings };
    delete next[extension];
    onRuleChange({ ...rule, options: { ...rule.options, customMappings: next } });
  }

  function updateCustomRule(
    previousExtension: string,
    nextExtension: string,
    nextFolder: string,
  ) {
    const next = { ...rule.options.customMappings };
    delete next[previousExtension];
    next[nextExtension.toLowerCase()] = nextFolder;
    onRuleChange({ ...rule, options: { ...rule.options, customMappings: next } });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Strategy</span>
          <Select value={rule.type} onValueChange={(v) => setRuleType(v as RuleType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="by_type">By file type</SelectItem>
              <SelectItem value="by_date">By date</SelectItem>
              <SelectItem value="combined">Combined (Date + Type)</SelectItem>
              <SelectItem value="custom">Custom mappings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(rule.type === "by_date" || rule.type === "combined") && (
          <div className="grid gap-2">
            <span className="text-sm text-muted-foreground">Date Source</span>
            <Select value={rule.options.dateField} onValueChange={(v) => setDateField(v as DateField)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Created date</SelectItem>
                <SelectItem value="modified">Modified date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {rule.type === "combined" && (
          <div className="grid gap-2">
            <span className="text-sm text-muted-foreground">Combined Order</span>
            <Select
              value={rule.options.combinedOrder}
              onValueChange={(v) => setCombinedOrder(v as CombinedOrder)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_type">Date &gt; Type</SelectItem>
                <SelectItem value="type_date">Type &gt; Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Duplicate Handling</span>
          <Select
            value={duplicateHandling}
            onValueChange={(v) => onDuplicateHandlingChange(v as DuplicateHandling)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">Skip existing files</SelectItem>
              <SelectItem value="rename">Rename with suffix (_1, _2)</SelectItem>
              <SelectItem value="overwrite">Overwrite existing files</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Custom Extension Rules</span>
            <Button type="button" size="sm" variant="secondary" onClick={addCustomRule}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {Object.entries(rule.options.customMappings).map(([extension, folderName]) => (
              <div key={extension} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  value={extension}
                  onChange={(event) =>
                    updateCustomRule(extension, event.target.value, folderName)
                  }
                  placeholder="ext"
                />
                <Input
                  value={folderName}
                  onChange={(event) =>
                    updateCustomRule(extension, extension, event.target.value)
                  }
                  placeholder="Folder name"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeCustomRule(extension)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

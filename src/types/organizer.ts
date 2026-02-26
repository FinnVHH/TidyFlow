export type FileCategory =
  | "Images"
  | "Documents"
  | "Videos"
  | "Audio"
  | "Code"
  | "Archives"
  | "Other";

export type RuleType = "by_type" | "by_date" | "combined" | "custom";
export type DuplicateHandling = "skip" | "rename" | "overwrite";
export type DateField = "created" | "modified";
export type CombinedOrder = "date_type" | "type_date";

export interface FileEntry {
  path: string;
  name: string;
  extension: string;
  size: number;
  createdAt: number;
  modifiedAt: number;
  mimeType: string;
}

export interface RuleOptions {
  dateField: DateField;
  combinedOrder: CombinedOrder;
  customMappings: Record<string, string>;
}

export interface OrganizeRule {
  type: RuleType;
  options: RuleOptions;
}

export interface OrganizeRules {
  rootPath: string;
  rule: OrganizeRule;
  duplicateHandling: DuplicateHandling;
}

export interface FileMove {
  from: string;
  to: string;
  timestamp: number;
}

export interface OrganizeResult {
  moved: FileMove[];
  skipped: FileEntry[];
  errors: string[];
  isDryRun: boolean;
}

export interface FileContext {
  path: string;
  extension: string;
  mimeType: string;
  fileCategory: FileCategory;
}

export interface UndoResult {
  restored: FileMove[];
  errors: string[];
}

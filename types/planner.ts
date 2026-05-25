export type DeskTheme = "oak" | "walnut" | "white" | "graphite";

export type DeskItemType =
  | "monitor-24"
  | "monitor-27"
  | "monitor-32"
  | "laptop-14"
  | "laptop-16"
  | "keyboard-full"
  | "keyboard-tkl"
  | "keyboard-65"
  | "mouse"
  | "mousepad-medium"
  | "mousepad-xl"
  | "speaker-pair"
  | "desk-lamp"
  | "pc-case"
  | "headphone-stand"
  | "desk-shelf";

export type DeskConfig = {
  widthCm: number;
  depthCm: number;
  theme: DeskTheme;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSizeCm: number;
};

export type DeskItem = {
  id: string;
  type: DeskItemType;
  name: string;
  widthCm: number;
  depthCm: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  locked: boolean;
  resizable: boolean;
};

export type DeskItemDefinition = Omit<DeskItem, "id" | "x" | "y" | "rotation" | "locked"> & {
  description: string;
};

export type ValidationSeverity = "info" | "warning" | "danger";

export type ValidationWarning = {
  id: string;
  itemIds: string[];
  severity: ValidationSeverity;
  message: string;
};

export type FitValidationResult = {
  fitScore: number;
  usedAreaPct: number;
  remainingAreaCm2: number;
  outsideItemIds: string[];
  overlappingItemIds: string[];
  overlapCount: number;
  warnings: ValidationWarning[];
  feedback: string[];
};

export type TemplateItemPlacement = {
  type: DeskItemType;
  x: number;
  y: number;
  rotation?: number;
  widthCm?: number;
  depthCm?: number;
};

export type DeskTemplate = {
  id: string;
  name: string;
  description: string;
  desk: Pick<DeskConfig, "widthCm" | "depthCm" | "theme">;
  items: TemplateItemPlacement[];
};

export type PlannerSnapshot = {
  version: 1;
  desk: DeskConfig;
  items: DeskItem[];
};

import type { DeskItem, DeskItemDefinition, DeskItemType } from "@/types/planner";

export const ITEM_DEFINITIONS: DeskItemDefinition[] = [
  {
    type: "monitor-24",
    name: "Monitor 24 inch",
    description: "Compact external display",
    widthCm: 54,
    depthCm: 18,
    heightCm: 38,
    color: "#1f2937",
    resizable: true
  },
  {
    type: "monitor-27",
    name: "Monitor 27 inch",
    description: "Popular single-monitor size",
    widthCm: 61,
    depthCm: 20,
    heightCm: 42,
    color: "#111827",
    resizable: true
  },
  {
    type: "monitor-32",
    name: "Monitor 32 inch",
    description: "Large productivity display",
    widthCm: 72,
    depthCm: 24,
    heightCm: 48,
    color: "#0f172a",
    resizable: true
  },
  {
    type: "laptop-14",
    name: "Laptop 14 inch",
    description: "Portable laptop footprint",
    widthCm: 32,
    depthCm: 22,
    heightCm: 2,
    color: "#e5e7eb",
    resizable: false
  },
  {
    type: "laptop-16",
    name: "Laptop 16 inch",
    description: "Large laptop footprint",
    widthCm: 36,
    depthCm: 25,
    heightCm: 2,
    color: "#d1d5db",
    resizable: false
  },
  {
    type: "keyboard-full",
    name: "Keyboard Full-size",
    description: "Full keyboard with numpad",
    widthCm: 44,
    depthCm: 14,
    heightCm: 3,
    color: "#334155",
    resizable: false
  },
  {
    type: "keyboard-tkl",
    name: "Keyboard TKL",
    description: "Tenkeyless keyboard",
    widthCm: 36,
    depthCm: 14,
    heightCm: 3,
    color: "#475569",
    resizable: false
  },
  {
    type: "keyboard-65",
    name: "Keyboard 65%",
    description: "Compact keyboard",
    widthCm: 31,
    depthCm: 12,
    heightCm: 3,
    color: "#64748b",
    resizable: false
  },
  {
    type: "mouse",
    name: "Mouse",
    description: "Standard mouse",
    widthCm: 7,
    depthCm: 12,
    heightCm: 4,
    color: "#e5e7eb",
    resizable: false
  },
  {
    type: "mousepad-medium",
    name: "Mousepad Medium",
    description: "Medium mousepad",
    widthCm: 35,
    depthCm: 28,
    heightCm: 0.8,
    color: "#99f6e4",
    resizable: true
  },
  {
    type: "mousepad-xl",
    name: "Mousepad XL",
    description: "Large desk mat",
    widthCm: 90,
    depthCm: 40,
    heightCm: 0.8,
    color: "#111827",
    resizable: true
  },
  {
    type: "speaker-pair",
    name: "Speaker Pair",
    description: "Stereo speakers as one footprint",
    widthCm: 34,
    depthCm: 18,
    heightCm: 22,
    color: "#111827",
    resizable: true
  },
  {
    type: "desk-lamp",
    name: "Desk Lamp",
    description: "Lamp base",
    widthCm: 16,
    depthCm: 16,
    heightCm: 38,
    color: "#facc15",
    resizable: true
  },
  {
    type: "pc-case",
    name: "PC Case",
    description: "Desktop tower",
    widthCm: 24,
    depthCm: 45,
    heightCm: 48,
    color: "#171717",
    resizable: true
  },
  {
    type: "headphone-stand",
    name: "Headphone Stand",
    description: "Small accessory stand",
    widthCm: 15,
    depthCm: 15,
    heightCm: 28,
    color: "#c084fc",
    resizable: true
  },
  {
    type: "desk-shelf",
    name: "Desk Shelf",
    description: "Raised shelf or monitor riser",
    widthCm: 100,
    depthCm: 22,
    heightCm: 10,
    color: "#b45309",
    resizable: true
  }
];

export const getItemDefinition = (type: DeskItemType) => {
  const definition = ITEM_DEFINITIONS.find((item) => item.type === type);
  if (!definition) {
    throw new Error(`Unknown desk item type: ${type}`);
  }

  return definition;
};

export const createDeskItem = (
  type: DeskItemType,
  id: string,
  x: number,
  y: number,
  overrides: Partial<Pick<DeskItem, "widthCm" | "depthCm" | "heightCm" | "rotation" | "color" | "locked">> = {}
): DeskItem => {
  const definition = getItemDefinition(type);

  return {
    id,
    type,
    name: definition.name,
    widthCm: overrides.widthCm ?? definition.widthCm,
    depthCm: overrides.depthCm ?? definition.depthCm,
    heightCm: overrides.heightCm ?? definition.heightCm,
    x,
    y,
    rotation: overrides.rotation ?? 0,
    color: overrides.color ?? definition.color,
    locked: overrides.locked ?? false,
    resizable: definition.resizable
  };
};

export const normalizeDeskItem = (item: DeskItem): DeskItem => {
  const definition = getItemDefinition(item.type);

  return {
    ...item,
    heightCm: item.heightCm ?? definition.heightCm,
    resizable: item.resizable ?? definition.resizable
  };
};

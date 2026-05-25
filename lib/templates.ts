import type { DeskTemplate } from "@/types/planner";

export const DESK_TEMPLATES: DeskTemplate[] = [
  {
    id: "minimal-dev",
    name: "Minimal Developer Setup",
    description: "Single monitor, compact keyboard, roomy mouse area.",
    desk: { widthCm: 140, depthCm: 70, theme: "oak" },
    items: [
      { type: "monitor-27", x: 70, y: 16 },
      { type: "keyboard-tkl", x: 62, y: 50 },
      { type: "mousepad-medium", x: 101, y: 50 },
      { type: "mouse", x: 102, y: 50 },
      { type: "desk-lamp", x: 123, y: 18 }
    ]
  },
  {
    id: "gaming",
    name: "Gaming Setup",
    description: "Large desk mat, full keyboard, PC tower, and speakers.",
    desk: { widthCm: 160, depthCm: 80, theme: "graphite" },
    items: [
      { type: "monitor-32", x: 80, y: 18 },
      { type: "mousepad-xl", x: 77, y: 57 },
      { type: "keyboard-full", x: 63, y: 57 },
      { type: "mouse", x: 102, y: 57 },
      { type: "pc-case", x: 142, y: 51 },
      { type: "speaker-pair", x: 80, y: 21 },
      { type: "headphone-stand", x: 18, y: 57 }
    ]
  },
  {
    id: "dual-monitor",
    name: "Dual Monitor Setup",
    description: "Two 27 inch displays with centered controls.",
    desk: { widthCm: 180, depthCm: 75, theme: "walnut" },
    items: [
      { type: "monitor-27", x: 58, y: 17, rotation: -8 },
      { type: "monitor-27", x: 122, y: 17, rotation: 8 },
      { type: "keyboard-tkl", x: 84, y: 53 },
      { type: "mousepad-medium", x: 124, y: 53 },
      { type: "mouse", x: 125, y: 53 },
      { type: "speaker-pair", x: 90, y: 24 },
      { type: "desk-lamp", x: 164, y: 21 }
    ]
  },
  {
    id: "laptop-monitor",
    name: "Laptop + Monitor Setup",
    description: "External monitor with laptop parked nearby.",
    desk: { widthCm: 150, depthCm: 70, theme: "white" },
    items: [
      { type: "monitor-27", x: 63, y: 17 },
      { type: "laptop-14", x: 112, y: 23, rotation: -8 },
      { type: "keyboard-65", x: 62, y: 52 },
      { type: "mousepad-medium", x: 101, y: 52 },
      { type: "mouse", x: 101, y: 52 },
      { type: "desk-lamp", x: 132, y: 18 }
    ]
  },
  {
    id: "small-desk",
    name: "Small Desk Setup",
    description: "Compact laptop-first layout for tight spaces.",
    desk: { widthCm: 100, depthCm: 60, theme: "oak" },
    items: [
      { type: "laptop-14", x: 35, y: 20 },
      { type: "keyboard-65", x: 39, y: 45 },
      { type: "mousepad-medium", x: 74, y: 43, widthCm: 28, depthCm: 24 },
      { type: "mouse", x: 74, y: 43 },
      { type: "desk-lamp", x: 85, y: 16 }
    ]
  }
];

export const getDeskTemplate = (templateId: string) => DESK_TEMPLATES.find((template) => template.id === templateId);

"use client";

import { create } from "zustand";
import { createDeskItem } from "@/lib/deskItems";
import { clearPlannerSnapshot, loadPlannerSnapshot, savePlannerSnapshot } from "@/lib/storage";
import { getDeskTemplate } from "@/lib/templates";
import type { DeskConfig, DeskItem, DeskItemType, DeskTheme, PlannerSnapshot } from "@/types/planner";

const defaultDesk: DeskConfig = {
  widthCm: 140,
  depthCm: 70,
  theme: "oak",
  showGrid: true,
  snapToGrid: true,
  gridSizeCm: 5
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const snap = (value: number, gridSize: number) => Math.round(value / gridSize) * gridSize;

type PlannerStore = {
  desk: DeskConfig;
  items: DeskItem[];
  selectedItemId: string | null;
  storageMessage: string | null;
  canvasExporter: (() => void) | null;
  setDeskSize: (widthCm: number, depthCm: number) => void;
  setDeskTheme: (theme: DeskTheme) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  addItem: (type: DeskItemType) => void;
  selectItem: (itemId: string | null) => void;
  updateItem: (itemId: string, updates: Partial<DeskItem>) => void;
  deleteItem: (itemId: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  rotateSelected: (delta: number) => void;
  toggleSelectedLock: () => void;
  applyTemplate: (templateId: string) => void;
  saveSetup: () => void;
  loadSetup: () => void;
  resetSetup: () => void;
  registerCanvasExporter: (exporter: (() => void) | null) => void;
  requestCanvasExport: () => void;
};

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  desk: defaultDesk,
  items: [],
  selectedItemId: null,
  storageMessage: null,
  canvasExporter: null,

  setDeskSize: (widthCm, depthCm) =>
    set((state) => ({
      desk: {
        ...state.desk,
        widthCm: clamp(Math.round(widthCm), 60, 240),
        depthCm: clamp(Math.round(depthCm), 40, 120)
      },
      storageMessage: null
    })),

  setDeskTheme: (theme) =>
    set((state) => ({
      desk: { ...state.desk, theme },
      storageMessage: null
    })),

  toggleGrid: () =>
    set((state) => ({
      desk: { ...state.desk, showGrid: !state.desk.showGrid }
    })),

  toggleSnap: () =>
    set((state) => ({
      desk: { ...state.desk, snapToGrid: !state.desk.snapToGrid }
    })),

  addItem: (type) =>
    set((state) => {
      const offset = (state.items.length % 5) * 4;
      const item = createDeskItem(type, createId(), state.desk.widthCm / 2 + offset, state.desk.depthCm / 2 + offset);

      return {
        items: [...state.items, item],
        selectedItemId: item.id,
        storageMessage: null
      };
    }),

  selectItem: (itemId) => set({ selectedItemId: itemId }),

  updateItem: (itemId, updates) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== itemId) return item;

        const x = updates.x ?? item.x;
        const y = updates.y ?? item.y;
        const nextX = state.desk.snapToGrid && "x" in updates ? snap(x, state.desk.gridSizeCm) : x;
        const nextY = state.desk.snapToGrid && "y" in updates ? snap(y, state.desk.gridSizeCm) : y;

        return {
          ...item,
          ...updates,
          x: nextX,
          y: nextY,
          widthCm: updates.widthCm ? Math.max(4, Math.round(updates.widthCm * 10) / 10) : item.widthCm,
          depthCm: updates.depthCm ? Math.max(4, Math.round(updates.depthCm * 10) / 10) : item.depthCm,
          rotation:
            updates.rotation === undefined
              ? item.rotation
              : Math.round((((updates.rotation % 360) + 360) % 360) * 10) / 10
        };
      }),
      storageMessage: null
    })),

  deleteItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
      selectedItemId: state.selectedItemId === itemId ? null : state.selectedItemId,
      storageMessage: null
    })),

  deleteSelected: () => {
    const selectedItemId = get().selectedItemId;
    if (selectedItemId) {
      get().deleteItem(selectedItemId);
    }
  },

  duplicateSelected: () =>
    set((state) => {
      const selected = state.items.find((item) => item.id === state.selectedItemId);
      if (!selected) return state;

      const duplicate: DeskItem = {
        ...selected,
        id: createId(),
        name: `${selected.name} copy`,
        x: clamp(selected.x + state.desk.gridSizeCm, 0, state.desk.widthCm),
        y: clamp(selected.y + state.desk.gridSizeCm, 0, state.desk.depthCm),
        locked: false
      };

      return {
        items: [...state.items, duplicate],
        selectedItemId: duplicate.id,
        storageMessage: null
      };
    }),

  rotateSelected: (delta) => {
    const selectedItemId = get().selectedItemId;
    if (!selectedItemId) return;
    const selected = get().items.find((item) => item.id === selectedItemId);
    if (!selected || selected.locked) return;
    get().updateItem(selectedItemId, { rotation: selected.rotation + delta });
  },

  toggleSelectedLock: () => {
    const selectedItemId = get().selectedItemId;
    if (!selectedItemId) return;
    const selected = get().items.find((item) => item.id === selectedItemId);
    if (!selected) return;
    get().updateItem(selectedItemId, { locked: !selected.locked });
  },

  applyTemplate: (templateId) =>
    set((state) => {
      const template = getDeskTemplate(templateId);
      if (!template) return state;

      const items = template.items.map((placement) =>
        createDeskItem(placement.type, createId(), placement.x, placement.y, {
          rotation: placement.rotation,
          widthCm: placement.widthCm,
          depthCm: placement.depthCm
        })
      );

      return {
        desk: {
          ...state.desk,
          widthCm: template.desk.widthCm,
          depthCm: template.desk.depthCm,
          theme: template.desk.theme
        },
        items,
        selectedItemId: null,
        storageMessage: `${template.name} loaded.`
      };
    }),

  saveSetup: () => {
    const snapshot: PlannerSnapshot = {
      version: 1,
      desk: get().desk,
      items: get().items
    };
    savePlannerSnapshot(snapshot);
    set({ storageMessage: "Setup saved locally." });
  },

  loadSetup: () => {
    const snapshot = loadPlannerSnapshot();
    if (!snapshot) {
      set({ storageMessage: "No saved setup found." });
      return;
    }

    set({
      desk: snapshot.desk,
      items: snapshot.items,
      selectedItemId: null,
      storageMessage: "Saved setup loaded."
    });
  },

  resetSetup: () => {
    clearPlannerSnapshot();
    set({
      desk: defaultDesk,
      items: [],
      selectedItemId: null,
      storageMessage: "Setup reset."
    });
  },

  registerCanvasExporter: (exporter) => set({ canvasExporter: exporter }),

  requestCanvasExport: () => {
    const exporter = get().canvasExporter;
    if (exporter) {
      exporter();
      return;
    }

    set({ storageMessage: "Canvas is still loading." });
  }
}));

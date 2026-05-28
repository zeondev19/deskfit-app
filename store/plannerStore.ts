"use client";

import { create } from "zustand";
import { createDeskItem, normalizeDeskItem } from "@/lib/deskItems";
import {
  clearPlannerSnapshot,
  deleteSavedSetup as removeSavedSetup,
  duplicateSavedSetup as cloneSavedSetup,
  getSavedSetup,
  listSavedSetups,
  loadPlannerSnapshot,
  parsePlannerSnapshot,
  savePlannerSnapshot,
  upsertSavedSetup
} from "@/lib/storage";
import { getDeskTemplate } from "@/lib/templates";
import type { DeskConfig, DeskItem, DeskItemType, DeskTheme, PlannerSnapshot, SavedPlannerSetup } from "@/types/planner";

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

const HISTORY_LIMIT = 50;

type PlannerHistoryEntry = {
  desk: DeskConfig;
  items: DeskItem[];
  selectedItemId: string | null;
};

type PlannerStateShape = {
  desk: DeskConfig;
  items: DeskItem[];
  selectedItemId: string | null;
};

type PlannerStateChanges = Partial<PlannerStateShape> & {
  storageMessage?: string | null;
  savedSetups?: SavedPlannerSetup[];
  activeSetupId?: string | null;
};

const cloneDesk = (desk: DeskConfig): DeskConfig => ({ ...desk });

const cloneItems = (items: DeskItem[]): DeskItem[] => items.map((item) => ({ ...item }));

const createHistoryEntry = (state: PlannerStateShape): PlannerHistoryEntry => ({
  desk: cloneDesk(state.desk),
  items: cloneItems(state.items),
  selectedItemId: state.selectedItemId
});

const createSnapshot = (desk: DeskConfig, items: DeskItem[]): PlannerSnapshot => ({
  version: 1,
  desk: cloneDesk(desk),
  items: cloneItems(items)
});

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "deskfit-setup";

const downloadSetupJson = (setup: SavedPlannerSetup) => {
  const blob = new Blob([JSON.stringify(setup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(setup.name)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const withHistory = <T extends PlannerStateChanges>(
  state: PlannerStateShape & { historyPast: PlannerHistoryEntry[] },
  changes: T
) => ({
  ...changes,
  historyPast: [...state.historyPast, createHistoryEntry(state)].slice(-HISTORY_LIMIT),
  historyFuture: []
});

type PlannerStore = {
  desk: DeskConfig;
  items: DeskItem[];
  selectedItemId: string | null;
  storageMessage: string | null;
  savedSetups: SavedPlannerSetup[];
  activeSetupId: string | null;
  historyPast: PlannerHistoryEntry[];
  historyFuture: PlannerHistoryEntry[];
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
  undo: () => void;
  redo: () => void;
  refreshSavedSetups: () => void;
  saveNamedSetup: (name: string) => void;
  loadSavedSetup: (setupId: string) => void;
  deleteSavedSetup: (setupId: string) => void;
  duplicateSavedSetup: (setupId: string) => void;
  exportCurrentSetup: (name?: string) => void;
  exportSavedSetup: (setupId: string) => void;
  importSetupFromJson: (raw: string, fallbackName?: string) => void;
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
  savedSetups: [],
  activeSetupId: null,
  historyPast: [],
  historyFuture: [],
  canvasExporter: null,

  setDeskSize: (widthCm, depthCm) =>
    set((state) =>
      withHistory(state, {
        desk: {
          ...state.desk,
          widthCm: clamp(Math.round(widthCm), 60, 240),
          depthCm: clamp(Math.round(depthCm), 40, 120)
        },
        storageMessage: null
      })
    ),

  setDeskTheme: (theme) =>
    set((state) =>
      withHistory(state, {
        desk: { ...state.desk, theme },
        storageMessage: null
      })
    ),

  toggleGrid: () =>
    set((state) =>
      withHistory(state, {
        desk: { ...state.desk, showGrid: !state.desk.showGrid },
        storageMessage: null
      })
    ),

  toggleSnap: () =>
    set((state) =>
      withHistory(state, {
        desk: { ...state.desk, snapToGrid: !state.desk.snapToGrid },
        storageMessage: null
      })
    ),

  addItem: (type) =>
    set((state) => {
      const offset = (state.items.length % 5) * 4;
      const item = createDeskItem(type, createId(), state.desk.widthCm / 2 + offset, state.desk.depthCm / 2 + offset);

      return withHistory(state, {
        items: [...state.items, item],
        selectedItemId: item.id,
        storageMessage: null
      });
    }),

  selectItem: (itemId) => set({ selectedItemId: itemId }),

  updateItem: (itemId, updates) =>
    set((state) => {
      if (!state.items.some((item) => item.id === itemId)) return state;

      return withHistory(state, {
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
            widthCm: updates.widthCm === undefined ? item.widthCm : Math.max(4, Math.round(updates.widthCm * 10) / 10),
            depthCm: updates.depthCm === undefined ? item.depthCm : Math.max(4, Math.round(updates.depthCm * 10) / 10),
            heightCm: updates.heightCm === undefined ? item.heightCm : Math.max(0.5, Math.round(updates.heightCm * 10) / 10),
            rotation:
              updates.rotation === undefined
                ? item.rotation
                : Math.round((((updates.rotation % 360) + 360) % 360) * 10) / 10
          };
        }),
        storageMessage: null
      });
    }),

  deleteItem: (itemId) =>
    set((state) => {
      if (!state.items.some((item) => item.id === itemId)) return state;

      return withHistory(state, {
        items: state.items.filter((item) => item.id !== itemId),
        selectedItemId: state.selectedItemId === itemId ? null : state.selectedItemId,
        storageMessage: null
      });
    }),

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

      return withHistory(state, {
        items: [...state.items, duplicate],
        selectedItemId: duplicate.id,
        storageMessage: null
      });
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
          depthCm: placement.depthCm,
          heightCm: placement.heightCm
        })
      );

      return withHistory(state, {
        desk: {
          ...state.desk,
          widthCm: template.desk.widthCm,
          depthCm: template.desk.depthCm,
          theme: template.desk.theme
        },
        items,
        selectedItemId: null,
        activeSetupId: null,
        storageMessage: `${template.name} loaded.`
      });
    }),

  undo: () =>
    set((state) => {
      const previous = state.historyPast[state.historyPast.length - 1];
      if (!previous) return state;

      return {
        desk: cloneDesk(previous.desk),
        items: cloneItems(previous.items),
        selectedItemId: previous.selectedItemId,
        historyPast: state.historyPast.slice(0, -1),
        historyFuture: [createHistoryEntry(state), ...state.historyFuture].slice(0, HISTORY_LIMIT),
        storageMessage: "Undone."
      };
    }),

  redo: () =>
    set((state) => {
      const next = state.historyFuture[0];
      if (!next) return state;

      return {
        desk: cloneDesk(next.desk),
        items: cloneItems(next.items),
        selectedItemId: next.selectedItemId,
        historyPast: [...state.historyPast, createHistoryEntry(state)].slice(-HISTORY_LIMIT),
        historyFuture: state.historyFuture.slice(1),
        storageMessage: "Redone."
      };
    }),

  refreshSavedSetups: () => set({ savedSetups: listSavedSetups() }),

  saveNamedSetup: (name) => {
    const snapshot = createSnapshot(get().desk, get().items);
    const saved = upsertSavedSetup(name, snapshot, get().activeSetupId);
    savePlannerSnapshot(snapshot);

    set({
      savedSetups: listSavedSetups(),
      activeSetupId: saved.id,
      storageMessage: `${saved.name} saved.`
    });
  },

  loadSavedSetup: (setupId) => {
    const setup = getSavedSetup(setupId);
    if (!setup) {
      set({ savedSetups: listSavedSetups(), storageMessage: "Saved setup not found." });
      return;
    }

    set((state) =>
      withHistory(state, {
        desk: setup.snapshot.desk,
        items: setup.snapshot.items.map(normalizeDeskItem),
        selectedItemId: null,
        activeSetupId: setup.id,
        savedSetups: listSavedSetups(),
        storageMessage: `${setup.name} loaded.`
      })
    );
  },

  deleteSavedSetup: (setupId) => {
    const setup = getSavedSetup(setupId);
    removeSavedSetup(setupId);
    set((state) => ({
      savedSetups: listSavedSetups(),
      activeSetupId: state.activeSetupId === setupId ? null : state.activeSetupId,
      storageMessage: setup ? `${setup.name} deleted.` : "Setup deleted."
    }));
  },

  duplicateSavedSetup: (setupId) => {
    const duplicated = cloneSavedSetup(setupId);
    set({
      savedSetups: listSavedSetups(),
      storageMessage: duplicated ? `${duplicated.name} created.` : "Setup could not be duplicated."
    });
  },

  exportCurrentSetup: (name) => {
    if (typeof document === "undefined") return;

    const activeSetup = get().activeSetupId ? getSavedSetup(get().activeSetupId as string) : null;
    const exportedName = (name?.trim() || activeSetup?.name || "DeskFit setup").trim();
    const now = new Date().toISOString();
    const payload: SavedPlannerSetup = {
      id: activeSetup?.id ?? `export-${Date.now()}`,
      name: exportedName,
      createdAt: activeSetup?.createdAt ?? now,
      updatedAt: now,
      snapshot: createSnapshot(get().desk, get().items)
    };
    downloadSetupJson(payload);
    set({ storageMessage: `${exportedName} exported as JSON.` });
  },

  exportSavedSetup: (setupId) => {
    if (typeof document === "undefined") return;

    const setup = getSavedSetup(setupId);
    if (!setup) {
      set({ savedSetups: listSavedSetups(), storageMessage: "Saved setup not found." });
      return;
    }

    downloadSetupJson(setup);
    set({ storageMessage: `${setup.name} exported as JSON.` });
  },

  importSetupFromJson: (raw, fallbackName) => {
    const snapshot = parsePlannerSnapshot(raw);
    if (!snapshot) {
      set({ storageMessage: "Import failed. The JSON file is not a DeskFit setup." });
      return;
    }

    let importedName = fallbackName?.replace(/\.json$/i, "").trim() || "Imported setup";

    try {
      const parsed = JSON.parse(raw) as Partial<SavedPlannerSetup>;
      if (typeof parsed.name === "string" && parsed.name.trim()) {
        importedName = parsed.name.trim();
      }
    } catch {
      // The snapshot already parsed successfully, so the fallback name is enough.
    }

    const normalizedSnapshot: PlannerSnapshot = {
      ...snapshot,
      items: snapshot.items.map(normalizeDeskItem)
    };
    const saved = upsertSavedSetup(importedName, normalizedSnapshot, null);

    set((state) =>
      withHistory(state, {
        desk: normalizedSnapshot.desk,
        items: normalizedSnapshot.items,
        selectedItemId: null,
        activeSetupId: saved.id,
        savedSetups: listSavedSetups(),
        storageMessage: `${saved.name} imported.`
      })
    );
  },

  saveSetup: () => {
    const activeSetup = get().activeSetupId ? getSavedSetup(get().activeSetupId as string) : null;
    const snapshot = createSnapshot(get().desk, get().items);
    savePlannerSnapshot(snapshot);
    const saved = upsertSavedSetup(activeSetup?.name ?? "Quick Save", snapshot, activeSetup?.id ?? null);
    set({
      savedSetups: listSavedSetups(),
      activeSetupId: saved.id,
      storageMessage: `${saved.name} saved.`
    });
  },

  loadSetup: () => {
    const snapshot = loadPlannerSnapshot();
    if (!snapshot) {
      set({ storageMessage: "No saved setup found." });
      return;
    }

    set((state) =>
      withHistory(state, {
        desk: snapshot.desk,
        items: snapshot.items.map(normalizeDeskItem),
        selectedItemId: null,
        activeSetupId: null,
        storageMessage: "Saved setup loaded."
      })
    );
  },

  resetSetup: () => {
    clearPlannerSnapshot();
    set((state) =>
      withHistory(state, {
        desk: defaultDesk,
        items: [],
        selectedItemId: null,
        activeSetupId: null,
        storageMessage: "Setup reset."
      })
    );
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

import { ITEM_DEFINITIONS } from "@/lib/deskItems";
import type { PlannerSnapshot, SavedPlannerSetup } from "@/types/planner";

const STORAGE_KEY = "deskfit.planner.v1";
const SETUPS_STORAGE_KEY = "deskfit.setups.v1";

const isBrowser = () => typeof window !== "undefined";
const validItemTypes = new Set(ITEM_DEFINITIONS.map((item) => item.type));
const validThemes = new Set(["oak", "walnut", "white", "graphite"]);

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const isDeskConfigLike = (value: unknown) => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as PlannerSnapshot["desk"];
  return (
    isFiniteNumber(candidate.widthCm) &&
    isFiniteNumber(candidate.depthCm) &&
    validThemes.has(candidate.theme) &&
    typeof candidate.showGrid === "boolean" &&
    typeof candidate.snapToGrid === "boolean" &&
    isFiniteNumber(candidate.gridSizeCm)
  );
};

const isDeskItemLike = (value: unknown) => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as PlannerSnapshot["items"][number];
  return (
    typeof candidate.id === "string" &&
    validItemTypes.has(candidate.type) &&
    typeof candidate.name === "string" &&
    isFiniteNumber(candidate.widthCm) &&
    isFiniteNumber(candidate.depthCm) &&
    isFiniteNumber(candidate.x) &&
    isFiniteNumber(candidate.y) &&
    isFiniteNumber(candidate.rotation) &&
    typeof candidate.color === "string" &&
    typeof candidate.locked === "boolean"
  );
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `setup-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const isPlannerSnapshot = (value: unknown): value is PlannerSnapshot => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as PlannerSnapshot;
  return candidate.version === 1 && isDeskConfigLike(candidate.desk) && Array.isArray(candidate.items) && candidate.items.every(isDeskItemLike);
};

export const parsePlannerSnapshot = (raw: string): PlannerSnapshot | null => {
  try {
    const parsed = JSON.parse(raw) as unknown;

    if (isPlannerSnapshot(parsed)) {
      return parsed;
    }

    if (parsed && typeof parsed === "object" && "snapshot" in parsed) {
      const candidate = parsed as { snapshot?: unknown };
      return isPlannerSnapshot(candidate.snapshot) ? candidate.snapshot : null;
    }

    return null;
  } catch {
    return null;
  }
};

const sortSetups = (setups: SavedPlannerSetup[]) =>
  [...setups].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export const savePlannerSnapshot = (snapshot: PlannerSnapshot) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

export const loadPlannerSnapshot = (): PlannerSnapshot | null => {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isPlannerSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const clearPlannerSnapshot = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const listSavedSetups = (): SavedPlannerSetup[] => {
  if (!isBrowser()) return [];

  const raw = window.localStorage.getItem(SETUPS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return sortSetups(
      parsed.filter((setup): setup is SavedPlannerSetup => {
        if (!setup || typeof setup !== "object") return false;
        const candidate = setup as SavedPlannerSetup;
        return Boolean(candidate.id && candidate.name && candidate.createdAt && candidate.updatedAt && isPlannerSnapshot(candidate.snapshot));
      })
    );
  } catch {
    return [];
  }
};

const writeSavedSetups = (setups: SavedPlannerSetup[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(SETUPS_STORAGE_KEY, JSON.stringify(sortSetups(setups)));
};

export const upsertSavedSetup = (name: string, snapshot: PlannerSnapshot, setupId?: string | null): SavedPlannerSetup => {
  const now = new Date().toISOString();
  const trimmedName = name.trim() || "Untitled setup";
  const existing = listSavedSetups();
  const current = setupId ? existing.find((setup) => setup.id === setupId) : undefined;
  const saved: SavedPlannerSetup = {
    id: current?.id ?? createId(),
    name: trimmedName,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    snapshot
  };

  writeSavedSetups([saved, ...existing.filter((setup) => setup.id !== saved.id)]);
  return saved;
};

export const getSavedSetup = (setupId: string): SavedPlannerSetup | null => listSavedSetups().find((setup) => setup.id === setupId) ?? null;

export const deleteSavedSetup = (setupId: string) => {
  writeSavedSetups(listSavedSetups().filter((setup) => setup.id !== setupId));
};

export const duplicateSavedSetup = (setupId: string): SavedPlannerSetup | null => {
  const setup = getSavedSetup(setupId);
  if (!setup) return null;

  return upsertSavedSetup(`${setup.name} copy`, setup.snapshot, null);
};

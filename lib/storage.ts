import type { PlannerSnapshot } from "@/types/planner";

const STORAGE_KEY = "deskfit.planner.v1";

const isBrowser = () => typeof window !== "undefined";

export const savePlannerSnapshot = (snapshot: PlannerSnapshot) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

export const loadPlannerSnapshot = (): PlannerSnapshot | null => {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PlannerSnapshot;
    if (parsed.version !== 1 || !parsed.desk || !Array.isArray(parsed.items)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const clearPlannerSnapshot = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
};

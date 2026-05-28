"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, FolderOpen, HardDriveDownload, RefreshCcw, Save, Trash2, Upload } from "lucide-react";
import { usePlannerStore } from "@/store/plannerStore";

const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

export default function MySetupsPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [setupName, setSetupName] = useState("Desk setup");

  const desk = usePlannerStore((state) => state.desk);
  const storageMessage = usePlannerStore((state) => state.storageMessage);
  const savedSetups = usePlannerStore((state) => state.savedSetups);
  const activeSetupId = usePlannerStore((state) => state.activeSetupId);
  const refreshSavedSetups = usePlannerStore((state) => state.refreshSavedSetups);
  const saveNamedSetup = usePlannerStore((state) => state.saveNamedSetup);
  const loadSavedSetup = usePlannerStore((state) => state.loadSavedSetup);
  const deleteSavedSetup = usePlannerStore((state) => state.deleteSavedSetup);
  const duplicateSavedSetup = usePlannerStore((state) => state.duplicateSavedSetup);
  const exportCurrentSetup = usePlannerStore((state) => state.exportCurrentSetup);
  const exportSavedSetup = usePlannerStore((state) => state.exportSavedSetup);
  const importSetupFromJson = usePlannerStore((state) => state.importSetupFromJson);
  const resetSetup = usePlannerStore((state) => state.resetSetup);

  const activeSetup = useMemo(
    () => savedSetups.find((setup) => setup.id === activeSetupId) ?? null,
    [activeSetupId, savedSetups]
  );

  useEffect(() => {
    refreshSavedSetups();
  }, [refreshSavedSetups]);

  useEffect(() => {
    if (activeSetup?.name) {
      setSetupName(activeSetup.name);
    }
  }, [activeSetup?.name]);

  const handleSave = () => {
    saveNamedSetup(setupName);
  };

  const handleReset = () => {
    resetSetup();
    setSetupName("Desk setup");
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const raw = await file.text();
    importSetupFromJson(raw, file.name);
    input.value = "";
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <HardDriveDownload size={18} className="text-teal-700" aria-hidden />
        <h2 className="text-sm font-bold text-slate-950">My Setups</h2>
      </div>

      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Setup name
        <input
          type="text"
          value={setupName}
          onChange={(event) => setSetupName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder="Desk setup"
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleSave}
          title="Save current setup"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Save size={16} aria-hidden />
          Save
        </button>
        <button
          type="button"
          onClick={() => exportCurrentSetup(setupName)}
          title="Export current setup as JSON"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
        >
          <Download size={16} aria-hidden />
          JSON
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Import a DeskFit JSON setup"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
        >
          <Upload size={16} aria-hidden />
          Import
        </button>
        <button
          type="button"
          onClick={handleReset}
          title="Reset the current canvas"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <RefreshCcw size={16} aria-hidden />
          Reset
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />

      {storageMessage ? (
        <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{storageMessage}</p>
      ) : null}

      <div className="mt-4 space-y-2">
        {savedSetups.length > 0 ? (
          savedSetups.map((setup) => {
            const isActive = setup.id === activeSetupId;
            return (
              <article
                key={setup.id}
                className={`rounded-lg border px-3 py-2.5 ${
                  isActive ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">{setup.name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {setup.snapshot.desk.widthCm} x {setup.snapshot.desk.depthCm} cm | {setup.snapshot.items.length} items
                    </p>
                    <p className="text-xs leading-5 text-slate-500">Updated {formatUpdatedAt(setup.updatedAt)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => loadSavedSetup(setup.id)}
                      title="Load setup"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                    >
                      <FolderOpen size={15} aria-hidden />
                      <span className="sr-only">Load setup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateSavedSetup(setup.id)}
                      title="Duplicate setup"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                    >
                      <Copy size={15} aria-hidden />
                      <span className="sr-only">Duplicate setup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportSavedSetup(setup.id)}
                      title="Export saved setup"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                    >
                      <Download size={15} aria-hidden />
                      <span className="sr-only">Export saved setup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSavedSetup(setup.id)}
                      title="Delete setup"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-700 transition hover:bg-rose-50"
                    >
                      <Trash2 size={15} aria-hidden />
                      <span className="sr-only">Delete setup</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-500">
            Save this {desk.widthCm} x {desk.depthCm} cm setup to keep versions here.
          </div>
        )}
      </div>
    </section>
  );
}

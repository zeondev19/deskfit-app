"use client";

import { Copy, Download, Lock, Redo2, RotateCcw, RotateCw, Trash2, Undo2, Unlock } from "lucide-react";
import { usePlannerStore } from "@/store/plannerStore";

export default function ItemToolbar() {
  const selectedItemId = usePlannerStore((state) => state.selectedItemId);
  const selectedItem = usePlannerStore((state) => state.items.find((item) => item.id === state.selectedItemId));
  const canUndo = usePlannerStore((state) => state.historyPast.length > 0);
  const canRedo = usePlannerStore((state) => state.historyFuture.length > 0);
  const undo = usePlannerStore((state) => state.undo);
  const redo = usePlannerStore((state) => state.redo);
  const duplicateSelected = usePlannerStore((state) => state.duplicateSelected);
  const deleteSelected = usePlannerStore((state) => state.deleteSelected);
  const rotateSelected = usePlannerStore((state) => state.rotateSelected);
  const toggleSelectedLock = usePlannerStore((state) => state.toggleSelectedLock);
  const requestCanvasExport = usePlannerStore((state) => state.requestCanvasExport);

  const disabled = !selectedItemId || selectedItem?.locked;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur">
      <div>
        <p className="text-sm font-bold text-slate-950">{selectedItem ? selectedItem.name : "Desk planner"}</p>
        <p className="text-xs text-slate-500">
          {selectedItem
            ? `${selectedItem.widthCm} x ${selectedItem.depthCm} cm, ${Math.round(selectedItem.rotation)} deg`
            : "Drag items, select to edit, export when ready."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 size={17} aria-hidden />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Redo2 size={17} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => rotateSelected(-15)}
          disabled={disabled}
          title="Rotate left"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={17} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => rotateSelected(15)}
          disabled={disabled}
          title="Rotate right"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCw size={17} aria-hidden />
        </button>
        <button
          type="button"
          onClick={duplicateSelected}
          disabled={!selectedItemId}
          title="Duplicate item"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Copy size={17} aria-hidden />
        </button>
        <button
          type="button"
          onClick={toggleSelectedLock}
          disabled={!selectedItemId}
          title={selectedItem?.locked ? "Unlock item" : "Lock item"}
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selectedItem?.locked ? <Lock size={17} aria-hidden /> : <Unlock size={17} aria-hidden />}
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          disabled={!selectedItemId}
          title="Delete item"
          className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={17} aria-hidden />
        </button>
        <button
          type="button"
          onClick={requestCanvasExport}
          title="Export PNG"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
        >
          <Download size={17} aria-hidden />
          Export PNG
        </button>
      </div>
    </div>
  );
}

"use client";

import { Lock, Move, Palette, Ruler, RotateCw, Trash2, Unlock } from "lucide-react";
import { usePlannerStore } from "@/store/plannerStore";
import FitScorePanel from "./FitScorePanel";

export default function ItemPropertiesPanel() {
  const selectedItem = usePlannerStore((state) => state.items.find((item) => item.id === state.selectedItemId));
  const updateItem = usePlannerStore((state) => state.updateItem);
  const deleteItem = usePlannerStore((state) => state.deleteItem);
  const toggleSelectedLock = usePlannerStore((state) => state.toggleSelectedLock);

  return (
    <aside className="thin-scrollbar flex h-full flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-white/80 p-4 backdrop-blur lg:w-[330px] lg:shrink-0">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-950">Properties</h2>
            <p className="mt-1 text-xs text-slate-500">{selectedItem ? "Selected item dimensions and placement" : "Select an item on the canvas"}</p>
          </div>
          {selectedItem ? (
            <button
              type="button"
              onClick={toggleSelectedLock}
              title={selectedItem.locked ? "Unlock item" : "Lock item"}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              {selectedItem.locked ? <Lock size={16} aria-hidden /> : <Unlock size={16} aria-hidden />}
            </button>
          ) : null}
        </div>

        {selectedItem ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-base font-black text-slate-950">{selectedItem.name}</p>
              <p className="mt-1 text-xs text-slate-500">{selectedItem.type}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                X center
                <input
                  type="number"
                  value={Math.round(selectedItem.x * 10) / 10}
                  disabled={selectedItem.locked}
                  onChange={(event) => updateItem(selectedItem.id, { x: Number(event.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Y center
                <input
                  type="number"
                  value={Math.round(selectedItem.y * 10) / 10}
                  disabled={selectedItem.locked}
                  onChange={(event) => updateItem(selectedItem.id, { y: Number(event.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </label>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Ruler size={14} aria-hidden />
                Size
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="text-xs font-semibold text-slate-500">
                  Width cm
                  <input
                    type="number"
                    value={selectedItem.widthCm}
                    disabled={selectedItem.locked || !selectedItem.resizable}
                    onChange={(event) => updateItem(selectedItem.id, { widthCm: Number(event.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Depth cm
                  <input
                    type="number"
                    value={selectedItem.depthCm}
                    disabled={selectedItem.locked || !selectedItem.resizable}
                    onChange={(event) => updateItem(selectedItem.id, { depthCm: Number(event.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Height cm
                  <input
                    type="number"
                    value={selectedItem.heightCm}
                    disabled={selectedItem.locked || !selectedItem.resizable}
                    onChange={(event) => updateItem(selectedItem.id, { heightCm: Number(event.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </label>
              </div>
              {!selectedItem.resizable ? <p className="text-xs text-slate-500">This item uses a fixed typical footprint.</p> : null}
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span className="flex items-center gap-2">
                <RotateCw size={14} aria-hidden />
                Rotation
              </span>
              <input
                type="range"
                min={0}
                max={359}
                value={selectedItem.rotation}
                disabled={selectedItem.locked}
                onChange={(event) => updateItem(selectedItem.id, { rotation: Number(event.target.value) })}
                className="mt-3 w-full"
              />
              <span className="mt-1 block text-sm font-bold text-slate-900">{Math.round(selectedItem.rotation)} deg</span>
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span className="flex items-center gap-2">
                <Palette size={14} aria-hidden />
                Color
              </span>
              <input
                type="color"
                value={selectedItem.color}
                disabled={selectedItem.locked}
                onChange={(event) => updateItem(selectedItem.id, { color: event.target.value })}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white p-1 disabled:opacity-45"
              />
            </label>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Move size={15} className="mr-2 inline text-slate-500" aria-hidden />
              Canvas uses centimeters. X/Y are the item center point.
            </div>

            <button
              type="button"
              onClick={() => deleteItem(selectedItem.id)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <Trash2 size={16} aria-hidden />
              Delete Item
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Add a desk item, then select it to edit position, size, rotation, color, lock state, or delete it.
          </div>
        )}
      </section>

      <FitScorePanel />
    </aside>
  );
}

"use client";

import { Grid3X3, MousePointer2, Plus, Ruler } from "lucide-react";
import { ITEM_DEFINITIONS } from "@/lib/deskItems";
import { usePlannerStore } from "@/store/plannerStore";
import type { DeskTheme } from "@/types/planner";
import MySetupsPanel from "./MySetupsPanel";
import TemplateSelector from "./TemplateSelector";

const themes: Array<{ id: DeskTheme; label: string; className: string }> = [
  { id: "oak", label: "Oak", className: "bg-[#d8bd93]" },
  { id: "walnut", label: "Walnut", className: "bg-[#8a5f3d]" },
  { id: "white", label: "White", className: "bg-[#f8fafc]" },
  { id: "graphite", label: "Graphite", className: "bg-[#34383e]" }
];

export default function PlannerSidebar() {
  const desk = usePlannerStore((state) => state.desk);
  const setDeskSize = usePlannerStore((state) => state.setDeskSize);
  const setDeskTheme = usePlannerStore((state) => state.setDeskTheme);
  const toggleGrid = usePlannerStore((state) => state.toggleGrid);
  const toggleSnap = usePlannerStore((state) => state.toggleSnap);
  const addItem = usePlannerStore((state) => state.addItem);

  return (
    <aside id="planner-setup" className="thin-scrollbar order-2 flex h-auto scroll-mt-32 flex-col gap-4 overflow-visible border-b border-slate-200 bg-white/80 p-4 backdrop-blur lg:order-none lg:h-full lg:w-[310px] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Ruler size={18} className="text-teal-700" aria-hidden />
          <h2 className="text-sm font-bold text-slate-950">Desk</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Width
            <input
              type="number"
              min={60}
              max={240}
              value={desk.widthCm}
              onChange={(event) => setDeskSize(Number(event.target.value), desk.depthCm)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Depth
            <input
              type="number"
              min={40}
              max={120}
              value={desk.depthCm}
              onChange={(event) => setDeskSize(desk.widthCm, Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Theme</p>
          <div className="grid grid-cols-4 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                title={theme.label}
                onClick={() => setDeskTheme(theme.id)}
                className={`h-9 rounded-lg border ${theme.className} ${
                  desk.theme === theme.id ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200"
                }`}
              >
                <span className="sr-only">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={toggleGrid}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              desk.showGrid ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <Grid3X3 size={16} aria-hidden />
            Grid
          </button>
          <button
            type="button"
            onClick={toggleSnap}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              desk.snapToGrid ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <MousePointer2 size={16} aria-hidden />
            Snap
          </button>
        </div>
      </section>

      <TemplateSelector />

      <MySetupsPanel />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Plus size={18} className="text-teal-700" aria-hidden />
          <h2 className="text-sm font-bold text-slate-950">Add Items</h2>
        </div>
        <div className="grid gap-2">
          {ITEM_DEFINITIONS.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => addItem(item.type)}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-teal-300 hover:bg-teal-50"
            >
              <span>
                <span className="block text-sm font-bold text-slate-900">{item.name}</span>
                <span className="block text-xs text-slate-500">
                  {item.widthCm} x {item.depthCm} cm
                </span>
              </span>
              <Plus size={16} className="shrink-0 text-slate-500" aria-hidden />
            </button>
          ))}
        </div>
      </section>

    </aside>
  );
}

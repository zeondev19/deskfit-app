"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Box, PanelTop } from "lucide-react";
import { useState } from "react";
import ItemPropertiesPanel from "./ItemPropertiesPanel";
import ItemToolbar from "./ItemToolbar";
import PlannerSidebar from "./PlannerSidebar";

const DeskCanvas = dynamic(() => import("./DeskCanvas"), {
  ssr: false,
  loading: () => <div className="grid h-full min-h-[520px] place-items-center bg-[#f6f5f1] text-sm font-semibold text-slate-500">Loading planner...</div>
});

const Desk3DPreview = dynamic(() => import("./Desk3DPreview"), {
  ssr: false,
  loading: () => <div className="grid h-full min-h-[520px] place-items-center bg-[#eef2f0] text-sm font-semibold text-slate-500">Loading 3D preview...</div>
});

export default function PlannerWorkspace() {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            title="Back to landing"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
          >
            <ArrowLeft size={17} aria-hidden />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-950">DeskFit Planner</h1>
            <p className="text-xs text-slate-500">2D top-view desk setup planning in centimeters</p>
          </div>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setViewMode("2d")}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-bold transition ${
              viewMode === "2d" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <PanelTop size={16} aria-hidden />
            2D
          </button>
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-bold transition ${
              viewMode === "3d" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Box size={16} aria-hidden />
            3D
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[310px_minmax(0,1fr)_330px]">
        <PlannerSidebar />
        <section className="flex min-h-[620px] min-w-0 flex-1 flex-col overflow-hidden">
          <ItemToolbar />
          <div className="min-h-[520px] flex-1">
            {viewMode === "2d" ? <DeskCanvas /> : <Desk3DPreview />}
          </div>
        </section>
        <ItemPropertiesPanel />
      </div>
    </main>
  );
}

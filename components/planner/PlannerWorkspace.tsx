"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ItemPropertiesPanel from "./ItemPropertiesPanel";
import ItemToolbar from "./ItemToolbar";
import PlannerSidebar from "./PlannerSidebar";

const DeskCanvas = dynamic(() => import("./DeskCanvas"), {
  ssr: false,
  loading: () => <div className="grid h-full min-h-[520px] place-items-center bg-[#f6f5f1] text-sm font-semibold text-slate-500">Loading planner...</div>
});

export default function PlannerWorkspace() {
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
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[310px_minmax(0,1fr)_330px]">
        <PlannerSidebar />
        <section className="flex min-h-[620px] min-w-0 flex-1 flex-col overflow-hidden">
          <ItemToolbar />
          <div className="min-h-[520px] flex-1">
            <DeskCanvas />
          </div>
        </section>
        <ItemPropertiesPanel />
      </div>
    </main>
  );
}

"use client";

import { LayoutTemplate } from "lucide-react";
import { DESK_TEMPLATES } from "@/lib/templates";
import { usePlannerStore } from "@/store/plannerStore";

export default function TemplateSelector() {
  const applyTemplate = usePlannerStore((state) => state.applyTemplate);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <LayoutTemplate size={18} className="text-teal-700" aria-hidden />
        <h2 className="text-sm font-bold text-slate-950">Templates</h2>
      </div>
      <div className="space-y-2">
        {DESK_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => applyTemplate(template.id)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-teal-300 hover:bg-teal-50"
          >
            <span className="block text-sm font-bold text-slate-900">{template.name}</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">{template.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

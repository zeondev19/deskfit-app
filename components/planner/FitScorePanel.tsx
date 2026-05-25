"use client";

import { AlertTriangle, CheckCircle2, Gauge, Info } from "lucide-react";
import { validateFit } from "@/lib/fitValidation";
import { usePlannerStore } from "@/store/plannerStore";

const scoreTone = (score: number) => {
  if (score >= 85) return "text-teal-700 bg-teal-50 border-teal-200";
  if (score >= 65) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
};

const warningIcon = (severity: string) => {
  if (severity === "danger") return AlertTriangle;
  if (severity === "warning") return AlertTriangle;
  return Info;
};

export default function FitScorePanel() {
  const desk = usePlannerStore((state) => state.desk);
  const items = usePlannerStore((state) => state.items);
  const validation = validateFit(desk, items);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gauge size={18} className="text-teal-700" aria-hidden />
          <h2 className="text-sm font-bold text-slate-950">Desk Fit Score</h2>
        </div>
        <div className={`rounded-full border px-3 py-1 text-sm font-black ${scoreTone(validation.fitScore)}`}>
          {validation.fitScore}/100
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Used area</p>
          <p className="mt-1 text-xl font-black text-slate-950">{validation.usedAreaPct}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Free estimate</p>
          <p className="mt-1 text-xl font-black text-slate-950">{validation.remainingAreaCm2.toLocaleString()} cm²</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {validation.feedback.map((feedback) => (
          <div key={feedback} className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-700" aria-hidden />
            <span>{feedback}</span>
          </div>
        ))}
      </div>

      {validation.warnings.length > 0 ? (
        <div className="mt-4 space-y-2">
          {validation.warnings.map((warning) => {
            const Icon = warningIcon(warning.severity);
            return (
              <div
                key={warning.id}
                className={`flex gap-2 rounded-lg border px-3 py-2 text-sm ${
                  warning.severity === "danger"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : warning.severity === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-sky-200 bg-sky-50 text-sky-800"
                }`}
              >
                <Icon size={16} className="mt-0.5 shrink-0" aria-hidden />
                <span>{warning.message}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

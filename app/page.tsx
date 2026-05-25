import Link from "next/link";
import { ArrowRight, CheckCircle2, Grid3X3, MonitorSmartphone, Ruler, Share2 } from "lucide-react";

const features = [
  {
    icon: Ruler,
    title: "Customize desk size",
    description: "Set real-world width and depth in centimeters before you arrange anything."
  },
  {
    icon: MonitorSmartphone,
    title: "Add common gear",
    description: "Drop in monitors, keyboards, laptops, mousepads, speakers, lamps, shelves, and more."
  },
  {
    icon: Grid3X3,
    title: "Check whether it fits",
    description: "Use grid snapping, overlap warnings, boundary checks, and a practical Desk Fit Score."
  },
  {
    icon: Share2,
    title: "Save, export, share later",
    description: "Save locally now, export PNGs today, and leave room for Supabase-backed sharing later."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-700 text-sm font-black text-white shadow-soft">
              DF
            </div>
            <span className="text-lg font-bold tracking-tight">DeskFit</span>
          </div>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800"
          >
            Start Planning
            <ArrowRight size={16} aria-hidden />
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-12">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full border border-teal-200 bg-white/75 px-3 py-1 text-sm font-medium text-teal-800 shadow-sm">
              2D desk planning for real-world setups
            </p>
            <h1 className="text-5xl font-black leading-tight tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
              DeskFit
            </h1>
            <p className="mt-5 text-xl leading-8 text-slate-700">
              Plan your desk setup before buying anything. Customize your desk, arrange your gear, and spot space issues while changes are still easy.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/planner"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 py-3.5 text-base font-bold text-white shadow-soft transition hover:bg-teal-800"
              >
                Start Planning
                <ArrowRight size={18} aria-hidden />
              </Link>
              <div className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                <CheckCircle2 size={17} className="text-teal-700" aria-hidden />
                No account needed for MVP
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">140 x 70 cm</p>
                  <p className="text-xs text-slate-500">Minimal developer setup</p>
                </div>
                <div className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-800">92/100</div>
              </div>
              <div className="relative aspect-[2/1] overflow-hidden rounded-lg border border-stone-300 bg-[#d8bd93] shadow-inner">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.28)_1px,transparent_1px)] bg-[size:28px_28px]" />
                <div className="absolute left-[28%] top-[12%] h-[20%] w-[36%] rounded bg-slate-900 shadow-md" />
                <div className="absolute left-[42%] top-[32%] h-[8%] w-[8%] rounded bg-slate-700" />
                <div className="absolute left-[31%] top-[54%] h-[17%] w-[38%] rounded bg-zinc-800 shadow-md" />
                <div className="absolute left-[72%] top-[47%] h-[34%] w-[17%] rounded bg-emerald-200/90 shadow-md" />
                <div className="absolute left-[74%] top-[55%] h-[13%] w-[6%] rounded-full bg-slate-700" />
                <div className="absolute left-[10%] top-[16%] h-[24%] w-[14%] rounded bg-neutral-100 shadow-md" />
                <div className="absolute bottom-4 left-5 right-5 flex justify-between text-[11px] font-semibold text-slate-800/70">
                  <span>Grid on</span>
                  <span>All items fit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 pb-2 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-slate-200 bg-white/82 p-5 shadow-sm">
              <feature.icon size={22} className="mb-4 text-teal-700" aria-hidden />
              <h2 className="text-base font-bold text-slate-950">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

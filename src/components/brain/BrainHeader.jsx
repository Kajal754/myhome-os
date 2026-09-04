import {
  Brain,
  Sparkles,
} from "lucide-react";

function BrainHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#eef2ff] via-white to-[#f5f3ff] p-6 shadow-sm dark:border-white/10 dark:from-[#111936] dark:via-[#0d172d] dark:to-[#17102e] sm:p-8">

      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div className="max-w-2xl">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-violet-700 shadow-sm dark:border-violet-400/20 dark:bg-white/5 dark:text-violet-300">
            <Brain size={14} />
            Your Personal Intelligence Layer
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Second Brain
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-[15px]">
            Store your important knowledge, documents and notes in one
            intelligent place. Your home remembers what you don't have to.
          </p>

        </div>

        <div className="hidden lg:flex">

          <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-violet-200 bg-white/80 shadow-xl shadow-violet-200/30 dark:border-violet-400/20 dark:bg-white/5 dark:shadow-violet-950/30">

            <div className="absolute inset-3 rounded-[1.5rem] border border-violet-300/40" />

            <Brain
              size={54}
              strokeWidth={1.3}
              className="text-violet-600 dark:text-violet-300"
            />

            <Sparkles
              size={18}
              className="absolute right-5 top-5 text-yellow-500"
            />

          </div>

        </div>

      </div>
    </section>
  );
}

export default BrainHeader;
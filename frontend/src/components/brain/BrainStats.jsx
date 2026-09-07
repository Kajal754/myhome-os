import {
  Database,
  FileText,
  StickyNote,
  ShieldCheck,
} from "lucide-react";

function BrainStats({ items = [] }) {
  const documents = items.filter(
    (item) => item.type === "document"
  ).length;

  const notes = items.filter(
    (item) => item.type === "note"
  ).length;

  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/70">

        <Database
          size={20}
          className="text-violet-500"
        />

        <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          {items.length}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Knowledge Items
        </p>

      </div>


      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/70">

        <FileText
          size={20}
          className="text-blue-500"
        />

        <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          {documents}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Documents
        </p>

      </div>


      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/70">

        <StickyNote
          size={20}
          className="text-amber-500"
        />

        <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          {notes}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Notes
        </p>

      </div>


      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/70">

        <ShieldCheck
          size={20}
          className="text-emerald-500"
        />

        <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Protected
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Knowledge security
        </p>

      </div>

    </section>
  );
}

export default BrainStats;
import {
  FileText,
  StickyNote,
  Clock3,
} from "lucide-react";

function KnowledgeCard({ item }) {
  const isDocument = item.type === "document";

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/70">

      <div className="flex items-start justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isDocument
              ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
              : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
          }`}
        >
          {isDocument ? (
            <FileText size={19} />
          ) : (
            <StickyNote size={19} />
          )}
        </div>

        <span className="text-[10px] text-slate-400">
          {item.date}
        </span>

      </div>

      <h3 className="mt-4 line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">
        {item.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {item.text}
      </p>

      <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        <Clock3 size={12} />

        {isDocument
          ? "Knowledge Document"
          : "Personal Note"}
      </div>

    </div>
  );
}

export default KnowledgeCard;
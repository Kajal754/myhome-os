import {
  Search,
  Sparkles,
} from "lucide-react";

function SmartSearch({
  search,
  setSearch,
  activeTab,
  setActiveTab,
  onAsk,
  knowledge = [],
}) {
  const items = Array.isArray(knowledge) ? knowledge : [];

  const filters = [
    {
      id: "all",
      label: "Everything",
      count: items.length,
    },
    {
      id: "note",
      label: "Notes",
      count: items.filter((item) => item.type === "Note").length,
    },
    {
      id: "document",
      label: "Documents",
      count: items.filter((item) => item.type === "Document").length,
    },
    {
      id: "upload",
      label: "Uploads",
      count: items.filter((item) => item.tag === "Uploaded").length,
    },
  ];

  return (
    <section className="mt-8">

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

          <div className="flex-1">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your knowledge, notes and documents..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />

            </div>

          </div>

          <button
            onClick={onAsk}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
          >
            <Sparkles size={16} />
            Ask My Life
          </button>

        </div>

        <div className="mt-4 flex flex-wrap gap-2">

          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveTab(filter.id)}
              type="button"
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeTab === filter.id
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
              }`}
            >
              {filter.label}
              <span className="ml-1 opacity-70">({filter.count})</span>
            </button>
          ))}

        </div>

        {items.length === 0 && (
          <p className="mt-4 text-xs text-slate-500">
            No saved items yet. Add a note or upload a document to search it here.
          </p>
        )}

      </div>

    </section>
  );
}

export default SmartSearch;
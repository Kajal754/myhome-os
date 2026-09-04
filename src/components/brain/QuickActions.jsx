import {
  BookOpen,
  Upload,
  StickyNote,
  MessageCircleQuestion,
  ArrowUpRight,
  Plus,
  Sparkles,
} from "lucide-react";

function QuickActions({
  onKnowledge,
  onUpload,
  onNote,
  onAsk,
}) {
  const actions = [
    {
      title: "My Knowledge",
      description: "Browse everything your home knows.",
      icon: BookOpen,
      color:
        "bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
      action: onKnowledge,
    },
    {
      title: "Upload Document",
      description: "Add PDFs, receipts, policies and important files.",
      icon: Upload,
      color:
        "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
      action: onUpload,
    },
    {
      title: "Create Note",
      description: "Capture ideas, instructions and important memories.",
      icon: StickyNote,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
      action: onNote,
    },
    {
      title: "Ask My Life",
      description: "Ask questions about your stored information.",
      icon: MessageCircleQuestion,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
      action: onAsk,
    },
  ];

  return (
    <section className="mt-6">

      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Quick Actions
        </h2>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Add something to your second brain
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              onClick={item.action}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/70"
            >

              <div className="flex items-start justify-between">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon size={21} />
                </div>

                {item.title === "Create Note" ? (
                  <Plus
                    size={17}
                    className="text-slate-400 transition group-hover:rotate-90"
                  />
                ) : (
                  <ArrowUpRight
                    size={17}
                    className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                )}

              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {item.description}
              </p>

            </button>
          );
        })}

      </div>

    </section>
  );
}

export default QuickActions;
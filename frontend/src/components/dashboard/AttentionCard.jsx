import {
  AlertTriangle,
  ShieldAlert,
  Wrench,
  ArrowRight,
} from "lucide-react";

const attentionItems = [
  {
    type: "maintenance",
    title: "AC service is due",
    description: "Your LG AC is due for maintenance tomorrow.",
    date: "Tomorrow",
  },
  {
    type: "warranty",
    title: "TV warranty expiring",
    description: "Samsung TV warranty expires in 12 days.",
    date: "12 days",
  },
  {
    type: "insurance",
    title: "Bike insurance renewal",
    description: "Your bike insurance expires in 24 days.",
    date: "24 days",
  },
];

function getIcon(type) {
  if (type === "maintenance") return Wrench;
  if (type === "warranty") return ShieldAlert;

  return AlertTriangle;
}

function AttentionCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Needs your attention
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Important things you may want to handle.
          </p>
        </div>

        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
          3 items
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {attentionItems.map((item) => {
          const Icon = getIcon(item.type);

          return (
            <div
              key={item.title}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <Icon size={18} className="text-slate-700" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {item.description}
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium text-slate-700">
                  {item.date}
                </p>
              </div>

              <button
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={`Open ${item.title}`}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AttentionCard;
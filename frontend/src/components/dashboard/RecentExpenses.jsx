import {
  Wrench,
  Bike,
  Droplets,
  Zap,
  ChevronRight,
} from "lucide-react";

const expenses = [
  {
    title: "AC Service",
    category: "Maintenance",
    date: "Today",
    amount: "₹600",
    icon: Wrench,
  },
  {
    title: "Bike Service",
    category: "Vehicle",
    date: "Yesterday",
    amount: "₹1,200",
    icon: Bike,
  },
  {
    title: "Plumbing Repair",
    category: "Home Repair",
    date: "08 Aug",
    amount: "₹450",
    icon: Droplets,
  },
  {
    title: "Electricity",
    category: "Utilities",
    date: "05 Aug",
    amount: "₹2,340",
    icon: Zap,
  },
];

function RecentExpenses() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Recent expenses
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your latest home spending.
          </p>
        </div>

        <button className="text-xs font-medium text-slate-600 hover:text-slate-900">
          View all
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {expenses.map((expense) => {
          const Icon = expense.icon;

          return (
            <div
              key={`${expense.title}-${expense.date}`}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Icon size={18} className="text-slate-700" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {expense.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {expense.category} · {expense.date}
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-900">
                {expense.amount}
              </p>

              <ChevronRight size={15} className="text-slate-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentExpenses;
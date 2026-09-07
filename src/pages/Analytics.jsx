import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Wrench,
  ShieldCheck,
  Receipt,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const categoryMeta = [
  { name: "Maintenance", amount: 1800, percent: 39, icon: Wrench },
  { name: "Utilities", amount: 2340, percent: 51, icon: Receipt },
  { name: "Vehicle", amount: 450, percent: 10, icon: CalendarDays },
];

function Analytics() {
  const storedUser = localStorage.getItem("myhomeUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;
  const [expenses, setExpenses] = useState([]);
  const [assets, setAssets] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    setExpenses([]);
    setAssets([]);
    setMaintenanceRecords([]);
    setReminders([]);
    if (!userId) return;

    Promise.all([
      fetch(`http://localhost:5000/api/expenses?user_id=${userId}`),
      fetch(`http://localhost:5000/api/assets?user_id=${userId}`),
      fetch(`http://localhost:5000/api/maintenance?user_id=${userId}`),
      fetch(`http://localhost:5000/api/reminders?user_id=${userId}`),
    ])
      .then((responses) => Promise.all(responses.map((response) => response.json())))
      .then(([expenseData, assetData, maintenanceData, reminderData]) => {
        if (expenseData.success) setExpenses(expenseData.expenses || []);
        if (assetData.success) setAssets(assetData.assets || []);
        if (maintenanceData.success) setMaintenanceRecords(maintenanceData.records || []);
        if (reminderData.success) setReminders(reminderData.reminders || []);
      })
      .catch((error) => console.error("LOAD analytics data error:", error));
  }, [userId]);

  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );
  const maintenanceTotal = useMemo(
    () => expenses
      .filter((item) => item.category === "Maintenance")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );
  const warrantyStats = useMemo(() => {
    const today = new Date();
    const active = assets.filter((asset) => asset.warranty && new Date(asset.warranty) >= today).length;
    const expiring = assets.filter((asset) => {
      if (!asset.warranty) return false;
      const days = (new Date(asset.warranty) - today) / 86400000;
      return days >= 0 && days <= 90;
    }).length;
    return { active, expiring };
  }, [assets]);
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const amount = expenses
        .filter((item) => {
          const expenseDate = new Date(item.date);
          return expenseDate.getFullYear() === date.getFullYear() && expenseDate.getMonth() === date.getMonth();
        })
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      return { name: date.toLocaleDateString("en-IN", { month: "short" }), amount };
    });
  }, [expenses]);
  const categories = useMemo(() => categoryMeta.map((item) => {
    const amount = expenses
      .filter((expense) => expense.category === item.name)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    return { ...item, amount, percent: total ? Math.round((amount / total) * 100) : 0 };
  }), [expenses, total]);
  const max = Math.max(...months.map((item) => item.amount), 1);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-indigo-100 blur-3xl dark:bg-indigo-500/10" />
        <div className="relative grid gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <BarChart3 size={14} />
              HOME INSIGHTS
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Understand your home better.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              A simple overview of spending, maintenance and warranty activity
              across your home.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
            <p className="text-xs font-medium text-slate-400">This year</p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              ₹{total.toLocaleString("en-IN")}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingDown size={14} />
              {expenses.length} saved expense records
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total spending", `₹${total.toLocaleString("en-IN")}`, Wallet, "Saved expenses", "emerald"],
          ["This month", `₹${total.toLocaleString("en-IN")}`, TrendingUp, "Current records", "blue"],
          ["Maintenance", `₹${maintenanceTotal.toLocaleString("en-IN")}`, Wrench, `${maintenanceRecords.length} records`, "amber"],
          ["Active warranties", warrantyStats.active, ShieldCheck, `${warrantyStats.expiring} expiring soon`, "violet"],
        ].map(([label, value, Icon, note, tone]) => (
          <div
            key={label}
            className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              tone === "emerald" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" :
              tone === "blue" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" :
              tone === "amber" ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" :
              "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"
            }`}>
              <Icon size={19} />
            </div>
            <p className="mt-4 text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Monthly spending</h2>
              <p className="mt-1 text-xs text-slate-400">Last 6 months</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <BarChart3 size={18} />
            </div>
          </div>

          <div className="mt-8 flex h-64 items-end gap-3 sm:gap-5">
            {months.map((item) => (
              <div key={item.name} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-bold text-slate-400">
                  ₹{(item.amount / 1000).toFixed(1)}k
                </span>
                <div className="flex h-[78%] w-full items-end rounded-xl bg-slate-50 dark:bg-slate-950/60">
                  <div
                    className="w-full rounded-xl bg-indigo-600 transition-all dark:bg-indigo-500"
                    style={{ height: `${(item.amount / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h2 className="font-bold text-slate-900 dark:text-white">Where money goes</h2>
          <p className="mt-1 text-xs text-slate-400">August breakdown</p>

          <div className="mt-6 space-y-5">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          ₹{item.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <TrendingDown size={14} />
              Spending is under control
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Your August spending is 8% lower than last month.
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Home health snapshot</h2>
            <p className="mt-1 text-xs text-slate-400">A quick look at what needs attention.</p>
          </div>
          <ArrowUpRight size={18} className="text-slate-300" />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ["Warranty health", `${warrantyStats.active} active`, `${warrantyStats.expiring} expiring soon`, ShieldCheck],
                ["Maintenance", `${maintenanceRecords.length} records`, `${maintenanceRecords.filter((item) => item.status !== "completed").length} upcoming`, Wrench],
                ["Budget trend", `₹${total.toLocaleString("en-IN")}`, `${reminders.filter((item) => !item.completed).length} active reminders`, Wallet],
              ].map(([title, value, note, Icon]) => (
            <div key={title} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Icon size={17} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{title}</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">{note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Analytics;
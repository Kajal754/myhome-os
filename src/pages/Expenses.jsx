import { useState, useMemo, useEffect } from "react";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Wrench,
  Car,
  Home,
  Zap,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  ShoppingBag,
  MoreHorizontal,
} from "lucide-react";


const initialExpenses = [
  {
    id: 1,
    title: "AC Service",
    category: "Maintenance",
    date: "11 Aug 2026",
    amount: 600,
    icon: Wrench,
  },
  {
    id: 2,
    title: "Bike Service",
    category: "Vehicle",
    date: "09 Aug 2026",
    amount: 1200,
    icon: Car,
  },
  {
    id: 3,
    title: "Plumbing Repair",
    category: "Home Repair",
    date: "08 Aug 2026",
    amount: 450,
    icon: Home,
  },
  {
    id: 4,
    title: "Electricity Bill",
    category: "Utilities",
    date: "05 Aug 2026",
    amount: 2340,
    icon: Zap,
  },
];

const categoryMeta = {
  Maintenance: {
    icon: Wrench,
    color: "blue",
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    iconBox:
      "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  Vehicle: {
    icon: Car,
    color: "violet",
    badge:
      "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    iconBox:
      "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  },
  "Home Repair": {
    icon: Home,
    color: "orange",
    badge:
      "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    iconBox:
      "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
  },
  Utilities: {
    icon: Zap,
    color: "emerald",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    iconBox:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  },
};

const chartData = [
  ["Mar", 48],
  ["Apr", 64],
  ["May", 52],
  ["Jun", 78],
  ["Jul", 62],
  ["Aug", 88],
];

function Expenses() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );

  const maintenanceTotal = useMemo(
    () =>
      expenses
        .filter((expense) => expense.category === "Maintenance")
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );

  const categories = useMemo(
    () => ["All", ...new Set(expenses.map((expense) => expense.category))],
    [expenses]
  );

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !query ||
        expense.title.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.date.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || expense.category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [expenses, search, filter]);

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const getMeta = (category) =>
    categoryMeta[category] || {
      icon: Receipt,
      color: "slate",
      badge:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      iconBox:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    };

  const deleteExpense = () => {
    if (!deleteTarget) return;

    setExpenses((current) =>
      current.filter((expense) => expense.id !== deleteTarget.id)
    );

    setDeleteTarget(null);
  };

  const saveEdit = (event) => {
    event.preventDefault();

    setExpenses((current) =>
      current.map((expense) =>
        expense.id === editingExpense.id
          ? {
              ...editingExpense,
              amount: Number(editingExpense.amount || 0),
            }
          : expense
      )
    );

    setEditingExpense(null);
  };

  const addExpense = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const title = form.get("title")?.toString().trim();
    const category = form.get("category")?.toString() || "Other";
    const date = form.get("date")?.toString().trim();
    const amount = Number(form.get("amount") || 0);

    if (!title || !date) return;

    const newExpense = {
      id: Date.now(),
      title,
      category,
      date,
      amount,
      icon:
        category === "Maintenance"
          ? Wrench
          : category === "Vehicle"
          ? Car
          : category === "Utilities"
          ? Zap
          : category === "Home Repair"
          ? Home
          : ShoppingBag,
    };

    setExpenses((current) => [newExpense, ...current]);
    setShowAdd(false);
  };

  return (
    <div className="space-y-7">

      {/* =========================================================
          FINANCE HERO
      ========================================================= */}
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">

          <div className="relative overflow-hidden p-7 sm:p-9">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10" />
            <div className="absolute -bottom-32 left-20 h-72 w-72 rounded-full bg-blue-500/10" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Wallet size={13} />
                HOME FINANCES
              </div>

              <h1 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Know where your
                <br />
                money is going.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Keep every home expense organized, compare your spending,
                and quickly understand the biggest areas consuming your budget.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  <Plus size={16} />
                  Add expense
                </button>

                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                  <Receipt size={15} />
                  {expenses.length} transactions
                </div>
              </div>
            </div>
          </div>

          {/* Spending spotlight */}
          <div className="relative min-h-[330px] overflow-hidden bg-slate-950 p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,.30),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,.30),transparent_38%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                    Spending Spotlight
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    August 2026
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 text-emerald-200 backdrop-blur">
                  <TrendingUp size={20} />
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400">Total spent</p>

                <p className="mt-2 text-4xl font-black text-white">
                  {formatMoney(total)}
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                    <TrendingDown size={12} />
                    8% lower
                  </span>

                  <span className="text-[10px] text-slate-500">
                    than last month
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    Maintenance
                  </p>
                  <p className="mt-1 text-lg font-black text-blue-300">
                    {formatMoney(maintenanceTotal)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    Avg. transaction
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    {formatMoney(expenses.length ? total / expenses.length : 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MONEY STATS
      ========================================================= */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Wallet size={20} />
          </div>
          <p className="mt-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            This month
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {formatMoney(total)}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Total home spending
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Wrench size={20} />
          </div>
          <p className="mt-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Maintenance
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {formatMoney(maintenanceTotal)}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Service & repair spending
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <Receipt size={20} />
          </div>
          <p className="mt-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Transactions
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {expenses.length}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Recorded this month
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <TrendingDown size={20} />
          </div>
          <p className="mt-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Compared to last month
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            -8%
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Spending is trending lower
          </p>
        </div>
      </section>

      {/* =========================================================
          CHART + CATEGORY BREAKDOWN
      ========================================================= */}
      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">

        {/* Chart */}
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">
                Spending trend
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                Monthly spending
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Your home expenses over the last 6 months.
              </p>
            </div>

            <span className="rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              2026
            </span>
          </div>

          <div className="mt-8 flex h-56 items-end gap-3 sm:gap-5">
            {chartData.map(([month, height], index) => (
              <div
                key={month}
                className="flex h-full flex-1 flex-col items-center justify-end gap-3"
              >
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className={`w-full max-w-14 rounded-t-xl transition-all duration-500 ${
                      index === chartData.length - 1
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>

                <span className="text-[10px] font-semibold text-slate-400">
                  {month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
              Where it goes
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">
              Category breakdown
            </h2>
          </div>

          <div className="mt-6 space-y-5">
            {categories
              .filter((category) => category !== "All")
              .map((category) => {
                const amount = expenses
                  .filter((expense) => expense.category === category)
                  .reduce((sum, expense) => sum + expense.amount, 0);

                const percentage = total
                  ? Math.round((amount / total) * 100)
                  : 0;

                const meta = getMeta(category);
                const Icon = meta.icon;

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.iconBox}`}
                        >
                          <Icon size={15} />
                        </div>

                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {category}
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-slate-800 dark:text-white">
                          {formatMoney(amount)}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          meta.color === "blue"
                            ? "bg-blue-500"
                            : meta.color === "violet"
                            ? "bg-violet-500"
                            : meta.color === "orange"
                            ? "bg-orange-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* =========================================================
          SEARCH + FILTER
      ========================================================= */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search expenses, categories or dates..."
              className="
                h-12 w-full rounded-xl border border-slate-200
                bg-slate-50 pl-11 pr-4 text-sm text-slate-700
                outline-none transition
                focus:border-emerald-400 focus:bg-white
                focus:ring-4 focus:ring-emerald-50

                dark:border-slate-700
                dark:bg-slate-950
                dark:text-slate-100
                dark:placeholder:text-slate-500
                dark:focus:border-emerald-500
                dark:focus:bg-slate-950
                dark:focus:ring-emerald-950
              "
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                className={`
                  whitespace-nowrap rounded-xl px-4 py-3
                  text-xs font-bold transition
                  ${
                    filter === category
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          TRANSACTIONS
      ========================================================= */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">
              Transaction ledger
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              Recent expenses
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredExpenses.length} transaction
              {filteredExpenses.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 sm:inline-flex dark:bg-white dark:text-slate-950"
          >
            <Plus size={15} />
            Add expense
          </button>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <Receipt
              size={42}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <h3 className="mt-4 font-bold text-slate-700 dark:text-slate-200">
              No expenses found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            {/* Desktop header */}
            <div className="hidden grid-cols-[1.5fr_1fr_1fr_.7fr_auto] items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950 md:grid">
              <span>Expense</span>
              <span>Category</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((expense) => {
                const meta = getMeta(expense.category);
                const Icon = expense.icon || meta.icon;

                return (
                  <div
                    key={expense.id}
                    className="group grid gap-4 px-5 py-5 transition hover:bg-slate-50/70 md:grid-cols-[1.5fr_1fr_1fr_.7fr_auto] md:items-center md:px-6 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.iconBox}`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                          {expense.title}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400 md:hidden">
                          {expense.category} · {expense.date}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.badge}`}
                    >
                      {expense.category}
                    </span>

                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {expense.date}
                    </span>

                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {formatMoney(expense.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedExpense(expense)}
                        title="View"
                        className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingExpense({ ...expense })
                        }
                        title="Edit"
                        className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(expense)}
                        title="Delete"
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          VIEW MODAL
      ========================================================= */}
      {selectedExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  Expense details
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  {selectedExpense.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2">
              {[
                ["Category", selectedExpense.category],
                ["Date", selectedExpense.date],
                ["Amount", formatMoney(selectedExpense.amount)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          EDIT MODAL
      ========================================================= */}
      {editingExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveEdit}
            className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                  Edit expense
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  Update transaction
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Expense title
                </span>

                <input
                  value={editingExpense.title}
                  onChange={(event) =>
                    setEditingExpense((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Category
                </span>

                <select
                  value={editingExpense.category}
                  onChange={(event) =>
                    setEditingExpense((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option>Maintenance</option>
                  <option>Vehicle</option>
                  <option>Home Repair</option>
                  <option>Utilities</option>
                  <option>Other</option>
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Date
                  </span>

                  <input
                    value={editingExpense.date}
                    onChange={(event) =>
                      setEditingExpense((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Amount
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={editingExpense.amount}
                    onChange={(event) =>
                      setEditingExpense((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 p-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          ADD MODAL
      ========================================================= */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <form
            onSubmit={addExpense}
            className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  New transaction
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  Add expense
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Expense title
                </span>

                <input
                  name="title"
                  required
                  placeholder="e.g. Refrigerator repair"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Category
                </span>

                <select
                  name="category"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option>Maintenance</option>
                  <option>Vehicle</option>
                  <option>Home Repair</option>
                  <option>Utilities</option>
                  <option>Other</option>
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Date
                  </span>

                  <input
                    name="date"
                    required
                    placeholder="11 Aug 2026"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Amount
                  </span>

                  <input
                    name="amount"
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 p-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Add expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          DELETE CONFIRMATION
      ========================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/50">
              <Trash2 size={21} />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
              Delete this expense?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to remove{" "}
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {deleteTarget.title}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteExpense}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;
import {
  Wrench,
  Search,
  CalendarDays,
  User,
  IndianRupee,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Activity,
  PackageCheck,
} from "lucide-react";

import { useMemo, useState } from "react";

const initialRecords = [
  {
    id: 1,
    asset: "LG Split AC",
    service: "General Service",
    provider: "Rahul AC Services",
    date: "02 Aug 2026",
    cost: 600,
    status: "completed",
    category: "Appliances",
    progress: 100,
  },
  {
    id: 2,
    asset: "Honda City",
    service: "Regular Service",
    provider: "Mohan Auto Works",
    date: "18 Aug 2026",
    cost: 1200,
    status: "upcoming",
    category: "Vehicle",
    progress: 72,
  },
  {
    id: 3,
    asset: "Samsung Smart TV",
    service: "Screen Inspection",
    provider: "Self",
    date: "20 Jul 2026",
    cost: 0,
    status: "completed",
    category: "Electronics",
    progress: 100,
  },
  {
    id: 4,
    asset: "Washing Machine",
    service: "Drum Cleaning",
    provider: "LG Service Center",
    date: "15 Jul 2026",
    cost: 450,
    status: "completed",
    category: "Appliances",
    progress: 100,
  },
  {
    id: 5,
    asset: "Voltas Air Cooler",
    service: "Filter Cleaning",
    provider: "Self",
    date: "24 Aug 2026",
    cost: 0,
    status: "scheduled",
    category: "Appliances",
    progress: 48,
  },
  {
    id: 6,
    asset: "Kitchen Chimney",
    service: "Deep Cleaning",
    provider: "Home Care Services",
    date: "28 Aug 2026",
    cost: 850,
    status: "scheduled",
    category: "Appliances",
    progress: 35,
  },
];

function Maintenance() {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const stats = useMemo(() => {
    const completed = records.filter(
      (item) => item.status === "completed"
    ).length;

    const upcoming = records.filter(
      (item) => item.status === "upcoming"
    ).length;

    const scheduled = records.filter(
      (item) => item.status === "scheduled"
    ).length;

    const spending = records.reduce(
      (total, item) => total + Number(item.cost || 0),
      0
    );

    return {
      completed,
      upcoming,
      scheduled,
      total: records.length,
      spending,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const value = search.trim().toLowerCase();

    return records.filter((item) => {
      const matchesSearch =
        !value ||
        item.asset.toLowerCase().includes(value) ||
        item.service.toLowerCase().includes(value) ||
        item.provider.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value);

      const matchesFilter =
        filter === "all" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [records, search, filter]);

  const getStatus = (status) => {
    if (status === "completed") {
      return {
        label: "Completed",
        icon: CheckCircle2,
        badge:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
        iconBox:
          "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
        bar: "bg-emerald-500",
      };
    }

    if (status === "upcoming") {
      return {
        label: "Upcoming",
        icon: AlertTriangle,
        badge:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
        iconBox:
          "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
        bar: "bg-amber-500",
      };
    }

    return {
      label: "Scheduled",
      icon: Clock3,
      badge:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
      iconBox:
        "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
      bar: "bg-blue-500",
    };
  };

  const deleteRecord = () => {
    if (!deleteTarget) return;

    setRecords((current) =>
      current.filter((item) => item.id !== deleteTarget.id)
    );

    setDeleteTarget(null);
  };

  const saveEdit = (event) => {
    event.preventDefault();

    setRecords((current) =>
      current.map((item) =>
        item.id === editingRecord.id
          ? {
              ...editingRecord,
              cost: Number(editingRecord.cost || 0),
            }
          : item
      )
    );

    setEditingRecord(null);
  };

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-7">

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="grid lg:grid-cols-[1.25fr_.75fr]">

          {/* Hero content */}

          <div className="relative overflow-hidden p-7 sm:p-9">

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10" />

            <div className="absolute -bottom-32 left-16 h-72 w-72 rounded-full bg-emerald-500/10" />

            <div className="relative z-10">

              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">

                <Sparkles size={13} />

                MAINTENANCE CENTER

              </div>

              <h1 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Keep everything
                <br />
                running smoothly.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Track servicing, repairs and upcoming maintenance for
                everything you own — all in one organized place.
              </p>

              <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-500"
                  />

                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Completed
                  </p>

                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {stats.completed}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <AlertTriangle
                    size={18}
                    className="text-amber-500"
                  />

                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Upcoming
                  </p>

                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {stats.upcoming}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <IndianRupee
                    size={18}
                    className="text-blue-500"
                  />

                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Spending
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                    {formatMoney(stats.spending)}
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* Maintenance Health */}

          <div className="relative min-h-[330px] overflow-hidden bg-slate-950 p-7">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,.35),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,.25),transparent_36%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">
                    Maintenance Health
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Overall service activity
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 text-blue-200 backdrop-blur">
                  <Activity size={20} />
                </div>

              </div>

              <div className="flex items-center justify-center py-5">

                <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">

                  <div className="absolute inset-3 rounded-full border border-blue-400/10" />

                  <div className="absolute inset-6 rounded-full border border-emerald-400/10" />

                  <div className="text-center">

                    <p className="text-4xl font-black text-white">
                      {stats.total
                        ? Math.round(
                            (stats.completed / stats.total) * 100
                          )
                        : 0}
                      %
                    </p>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                      Maintained
                    </p>

                  </div>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    Completed
                  </p>

                  <p className="mt-1 text-lg font-black text-emerald-300">
                    {stats.completed}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    Upcoming
                  </p>

                  <p className="mt-1 text-lg font-black text-amber-300">
                    {stats.upcoming + stats.scheduled}
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          STAT CARDS
      ========================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[
          [
            "all",
            "Total records",
            stats.total,
            Wrench,
            "blue",
            "All maintenance",
          ],
          [
            "completed",
            "Completed",
            stats.completed,
            CheckCircle2,
            "emerald",
            "Successfully serviced",
          ],
          [
            "upcoming",
            "Upcoming",
            stats.upcoming,
            AlertTriangle,
            "amber",
            "Needs attention",
          ],
          [
            "scheduled",
            "Scheduled",
            stats.scheduled,
            CalendarDays,
            "purple",
            "Planned services",
          ],
        ].map(
          ([key, title, value, Icon, color, note]) => {

            const colors = {
              blue:
                "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",

              emerald:
                "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",

              amber:
                "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",

              purple:
                "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
            };

            const selected = filter === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`
                  group rounded-2xl border p-5 text-left shadow-sm
                  transition duration-300
                  hover:-translate-y-1 hover:shadow-xl
                  ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  }
                `}
              >

                <div className="flex items-center justify-between">

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      selected
                        ? "bg-white/10 dark:bg-slate-900/10"
                        : colors[color]
                    }`}
                  >
                    <Icon size={21} />
                  </div>

                  <ChevronRight
                    size={17}
                    className={
                      selected
                        ? "opacity-70"
                        : "text-slate-300 transition group-hover:translate-x-1 dark:text-slate-600"
                    }
                  />

                </div>

                <p
                  className={`mt-5 text-xs font-semibold ${
                    selected
                      ? "opacity-70"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {title}
                </p>

                <p className="mt-1 text-3xl font-black">
                  {value}
                </p>

                <p
                  className={`mt-1 text-[11px] ${
                    selected ? "opacity-70" : "text-slate-400"
                  }`}
                >
                  {note}
                </p>

              </button>
            );
          }
        )}

      </section>

      {/* =========================================================
          UPCOMING ALERT
      ========================================================= */}

      {(stats.upcoming + stats.scheduled) > 0 && (

        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-white dark:border-amber-900/60 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900">

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <AlertTriangle size={21} />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-sm font-black text-amber-950 dark:text-amber-200">
                    Maintenance needs attention
                  </h2>

                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white">
                    UPCOMING
                  </span>

                </div>

                <p className="mt-1 text-xs text-amber-800/70 dark:text-amber-300/70">
                  You have {stats.upcoming + stats.scheduled} maintenance
                  activities coming up.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() => setFilter("upcoming")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600"
            >
              Review now
              <ArrowUpRight size={14} />
            </button>

          </div>

        </section>
      )}

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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search asset, service, provider or category..."
              className="
                h-12 w-full rounded-xl border border-slate-200
                bg-slate-50 pl-11 pr-4 text-sm text-slate-700
                outline-none transition
                focus:border-blue-400 focus:bg-white
                focus:ring-4 focus:ring-blue-50

                dark:border-slate-700
                dark:bg-slate-950
                dark:text-slate-100
                dark:placeholder:text-slate-500
                dark:focus:border-blue-500
                dark:focus:bg-slate-950
                dark:focus:ring-blue-950
              "
            />

          </div>

          <div className="flex gap-2 overflow-x-auto">

            {[
              ["all", "All"],
              ["completed", "Completed"],
              ["upcoming", "Upcoming"],
              ["scheduled", "Scheduled"],
            ].map(([value, label]) => (

              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`
                  whitespace-nowrap rounded-xl px-4 py-3
                  text-xs font-bold transition
                  ${
                    filter === value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }
                `}
              >
                {label}
              </button>

            ))}

          </div>

        </div>

      </section>

      {/* =========================================================
          RECORDS
      ========================================================= */}

      <section>

        <div className="mb-4 flex items-end justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
              Service history
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              Maintenance portfolio
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredRecords.length} record
              {filteredRecords.length !== 1 ? "s" : ""}
            </p>

          </div>

        </div>

        {filteredRecords.length === 0 ? (

          <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">

            <PackageCheck
              size={42}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <h3 className="mt-4 font-bold text-slate-700 dark:text-slate-200">
              No maintenance records found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Try another search or filter.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 xl:grid-cols-2">

            {filteredRecords.map((record) => {

              const status = getStatus(record.status);

              const StatusIcon = status.icon;

              return (

                <article
                  key={record.id}
                  className="
                    group overflow-hidden rounded-[26px]
                    border border-slate-200 bg-white shadow-sm
                    transition duration-300
                    hover:-translate-y-1 hover:shadow-2xl
                    dark:border-slate-800 dark:bg-slate-900
                  "
                >

                  <div className={`h-1.5 w-full ${status.bar}`} />

                  <div className="p-5 sm:p-6">

                    {/* Header */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-4">

                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${status.iconBox}`}
                        >
                          <Wrench size={27} />
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${status.badge}`}
                            >
                              <StatusIcon size={11} />
                              {status.label}
                            </span>

                            <span className="text-[10px] text-slate-400">
                              {record.category}
                            </span>

                          </div>

                          <h3 className="mt-2 truncate text-lg font-black text-slate-900 dark:text-white">
                            {record.asset}
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {record.service}
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedRecord(record)}
                        className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        title="View maintenance"
                      >
                        <Eye size={18} />
                      </button>

                    </div>

                    {/* Progress */}

                    <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Service timeline
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {record.status === "completed"
                              ? "Service completed"
                              : `Scheduled for ${record.date}`}
                          </p>

                        </div>

                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                          {record.progress}%
                        </p>

                      </div>

                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">

                        <div
                          className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
                          style={{
                            width: `${record.progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* Details */}

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Service date
                        </p>

                        <div className="mt-2 flex items-center gap-2">

                          <CalendarDays
                            size={15}
                            className="text-blue-500"
                          />

                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {record.date}
                          </p>

                        </div>

                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Cost
                        </p>

                        <div className="mt-2 flex items-center gap-2">

                          <IndianRupee
                            size={15}
                            className="text-emerald-500"
                          />

                          <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                            {formatMoney(record.cost)}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* Provider */}

                    <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">

                      <User
                        size={15}
                        className="text-slate-400"
                      />

                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Service provider:
                      </span>

                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {record.provider}
                      </span>

                    </div>

                  </div>

                  {/* Actions */}

                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/50">

                    <span className="text-[10px] text-slate-400">
                      {record.status === "completed"
                        ? "Maintenance completed"
                        : "Keep this service on your radar"}
                    </span>

                    <div className="flex items-center gap-1">

                      <button
                        type="button"
                        onClick={() => setSelectedRecord(record)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingRecord({ ...record })
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-amber-600 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget(record)
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

      {/* =========================================================
          VIEW MODAL
      ========================================================= */}

      {selectedRecord && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-slate-900">

            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                  Maintenance details
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  {selectedRecord.asset}
                </h3>

              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>

            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2">

              {[
                ["Service", selectedRecord.service],
                ["Category", selectedRecord.category],
                ["Provider", selectedRecord.provider],
                ["Date", selectedRecord.date],
                ["Cost", formatMoney(selectedRecord.cost)],
                [
                  "Status",
                  getStatus(selectedRecord.status).label,
                ],
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

      {editingRecord && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">

          <form
            onSubmit={saveEdit}
            className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-slate-900"
          >

            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                  Edit maintenance
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  Update service details
                </h3>

              </div>

              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>

            </div>

            <div className="space-y-4 p-6">

              {[
                ["asset", "Asset"],
                ["service", "Service"],
                ["provider", "Provider"],
                ["date", "Service date"],
                ["cost", "Cost"],
              ].map(([field, label]) => (

                <label key={field} className="block">

                  <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    {label}
                  </span>

                  <input
                    value={editingRecord[field] ?? ""}
                    onChange={(e) =>
                      setEditingRecord((current) => ({
                        ...current,
                        [field]: e.target.value,
                      }))
                    }
                    className="
                      h-11 w-full rounded-xl border
                      border-slate-200 bg-slate-50 px-4
                      text-sm text-slate-700 outline-none
                      focus:border-blue-400
                      focus:ring-4 focus:ring-blue-50

                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-slate-100
                      dark:focus:border-blue-500
                      dark:focus:ring-blue-950
                    "
                  />

                </label>

              ))}

            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 p-5 dark:border-slate-800">

              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
              >
                Save changes
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =========================================================
          DELETE MODAL
      ========================================================= */}

      {deleteTarget && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/50">
              <Trash2 size={21} />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
              Delete maintenance record?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">

              Are you sure you want to remove the maintenance record for{" "}

              <span className="font-bold text-slate-700 dark:text-slate-200">
                {deleteTarget.asset}
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
                onClick={deleteRecord}
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

export default Maintenance;
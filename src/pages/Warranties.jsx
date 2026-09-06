import {
  ShieldCheck,
  AlertTriangle,
  Search,
  CalendarDays,
  Clock3,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Eye,
  Pencil,
  Trash2,
  X,
  PackageCheck,
  ArrowUpRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const initialWarranties = [
  {
    id: 1,
    product: "Samsung Smart TV",
    category: "Electronics",
    brand: "Samsung",
    model: "Crystal UHD",
    expires: "12 Aug 2027",
    remaining: "12 months",
    status: "active",
    progress: 82,
  },
  {
    id: 2,
    product: "LG Split AC",
    category: "Appliances",
    brand: "LG",
    model: "Dual Inverter",
    expires: "10 May 2027",
    remaining: "9 months",
    status: "active",
    progress: 68,
  },
  {
    id: 3,
    product: "Dell Laptop",
    category: "Electronics",
    brand: "Dell",
    model: "Inspiron 15",
    expires: "20 Sep 2026",
    remaining: "40 days",
    status: "expiring",
    progress: 22,
  },
  {
    id: 4,
    product: "Washing Machine",
    category: "Appliances",
    brand: "Samsung",
    model: "EcoBubble",
    expires: "01 Jun 2026",
    remaining: "Expired",
    status: "expired",
    progress: 100,
  },
];

function Warranties() {
  const storedUser = localStorage.getItem("myhomeUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;
  const [warranties, setWarranties] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [editingWarranty, setEditingWarranty] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadWarranties = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/assets?user_id=${userId}`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load warranties");
        }

        const today = new Date();
        const records = (data.assets || [])
          .filter((asset) => asset.warranty)
          .map((asset) => {
            const expiryDate = new Date(asset.warranty);
            const daysRemaining = Math.ceil(
              (expiryDate - today) / (1000 * 60 * 60 * 24)
            );
            const status = daysRemaining < 0
              ? "expired"
              : daysRemaining <= 90
              ? "expiring"
              : "active";

            return {
              id: asset.id,
              assetId: asset.id,
              product: asset.name,
              category: asset.category || "Other",
              brand: asset.brand || "-",
              model: asset.model || "-",
              expires: asset.warranty,
              remaining: daysRemaining < 0 ? "Expired" : `${daysRemaining} days`,
              status,
              progress: Math.max(0, Math.min(100, 100 - daysRemaining / 7)),
              sourceAsset: asset,
            };
          });

        setWarranties(records);
      } catch (error) {
        console.error("LOAD warranties error:", error);
      }
    };

    loadWarranties();
  }, [userId]);

  const stats = useMemo(
    () => ({
      active: warranties.filter((item) => item.status === "active").length,
      expiring: warranties.filter((item) => item.status === "expiring").length,
      expired: warranties.filter((item) => item.status === "expired").length,
      total: warranties.length,
    }),
    [warranties]
  );

  const filteredWarranties = useMemo(() => {
    const value = search.trim().toLowerCase();

    return warranties.filter((item) => {
      const matchesSearch =
        !value ||
        item.product.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value) ||
        item.brand.toLowerCase().includes(value) ||
        item.model.toLowerCase().includes(value);

      return matchesSearch && (filter === "all" || item.status === filter);
    });
  }, [warranties, search, filter]);

  const getStatus = (status) => {
    if (status === "active") {
      return {
        label: "Active",
        icon: CheckCircle2,
        badge:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
        iconBox:
          "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
        bar: "bg-emerald-500",
      };
    }

    if (status === "expiring") {
      return {
        label: "Expiring Soon",
        icon: AlertTriangle,
        badge:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
        iconBox:
          "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
        bar: "bg-amber-500",
      };
    }

    return {
      label: "Expired",
      icon: XCircle,
      badge:
        "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
      iconBox:
        "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
      bar: "bg-red-500",
    };
  };

  const deleteWarranty = async () => {
    if (!deleteTarget) return;

    const asset = deleteTarget.sourceAsset;
    try {
      const response = await fetch(
        `http://localhost:5000/api/assets/${deleteTarget.assetId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...asset,
            user_id: userId,
            warranty: null,
            purchase_date: asset.purchase_date,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);

      setWarranties((current) => current.filter((item) => item.id !== deleteTarget.id));
    } catch (error) {
      console.error("DELETE warranty error:", error);
      alert("Could not remove warranty from database.");
      return;
    }

    setDeleteTarget(null);
  };

  const saveEdit = async (event) => {
    event.preventDefault();

    const asset = editingWarranty.sourceAsset;
    try {
      const response = await fetch(
        `http://localhost:5000/api/assets/${editingWarranty.assetId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...asset,
            user_id: userId,
            name: editingWarranty.product,
            category: editingWarranty.category,
            brand: editingWarranty.brand,
            model: editingWarranty.model,
            warranty: editingWarranty.expires,
            purchase_date: asset.purchase_date,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);

      const updatedAsset = data.asset;
      setWarranties((current) => current.map((item) =>
        item.id === editingWarranty.id
          ? { ...editingWarranty, sourceAsset: updatedAsset }
          : item
      ));
    } catch (error) {
      console.error("UPDATE warranty error:", error);
      alert("Could not update warranty in database.");
      return;
    }

    setEditingWarranty(null);
  };

  return (
    <div className="space-y-7">

      {/* =========================================================
          1. WARRANTY CENTER HERO + RIGHT PREMIUM VISUAL PANEL
         ========================================================= */}
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">

          {/* Hero content */}
          <div className="relative overflow-hidden p-7 sm:p-9">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10" />
            <div className="absolute -bottom-32 left-16 h-72 w-72 rounded-full bg-violet-500/10" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                <Sparkles size={13} />
                WARRANTY CENTER
              </div>

              <h1 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Protect what you own.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Stay ahead of expiry dates, keep your important purchases
                protected, and quickly find the warranties that need attention.
              </p>

              <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Protected
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {stats.active}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Attention
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {stats.expiring}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <CalendarDays size={18} className="text-blue-500" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tracked
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium visual / Warranty Health */}
          <div className="relative min-h-[330px] overflow-hidden bg-slate-950 p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,.35),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(139,92,246,.28),transparent_36%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">
                    Warranty Health
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Overall protection status
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 text-blue-200 backdrop-blur">
                  <ShieldCheck size={20} />
                </div>
              </div>

              <div className="flex items-center justify-center py-5">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
                  <div className="absolute inset-3 rounded-full border border-blue-400/10" />
                  <div className="absolute inset-6 rounded-full border border-blue-400/10" />

                  <div className="text-center">
                    <p className="text-4xl font-black text-white">
                      {stats.total
                        ? Math.round(
                            ((stats.active + stats.expiring) / stats.total) *
                              100
                          )
                        : 0}
                      %
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                      Protected
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    Active
                  </p>
                  <p className="mt-1 text-lg font-black text-emerald-300">
                    {stats.active}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    Expired
                  </p>
                  <p className="mt-1 text-lg font-black text-red-300">
                    {stats.expired}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. FOUR INTERACTIVE STATUS CARDS
         ========================================================= */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["all", "Total tracked", stats.total, CalendarDays, "blue", "All warranties"],
          ["active", "Active warranties", stats.active, ShieldCheck, "emerald", "Currently protected"],
          ["expiring", "Expiring soon", stats.expiring, AlertTriangle, "amber", "Needs attention"],
          ["expired", "Expired", stats.expired, Clock3, "red", "Review required"],
        ].map(([key, title, value, Icon, color, note]) => {
          const colors = {
            blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
            emerald:
              "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
            amber:
              "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
            red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
          };

          const selected = filter === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`
                group rounded-2xl border p-5 text-left shadow-sm transition
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
                  selected ? "opacity-70" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {title}
              </p>

              <p className="mt-1 text-3xl font-black">{value}</p>

              <p
                className={`mt-1 text-[11px] ${
                  selected ? "opacity-70" : "text-slate-400"
                }`}
              >
                {note}
              </p>
            </button>
          );
        })}
      </section>

      {/* =========================================================
          3. PROMINENT EXPIRING ALERT
         ========================================================= */}
      {stats.expiring > 0 && (
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-white dark:border-amber-900/60 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <AlertTriangle size={21} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black text-amber-950 dark:text-amber-200">
                    Warranty expiry alert
                  </h2>
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white">
                    ACTION NEEDED
                  </span>
                </div>

                <p className="mt-1 text-xs text-amber-800/70 dark:text-amber-300/70">
                  {stats.expiring} warranty
                  {stats.expiring !== 1 ? "ies are" : " is"} approaching expiry.
                  Review them before protection ends.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFilter("expiring")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600"
            >
              Review now
              <ArrowUpRight size={14} />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================
          4. SEARCH + FILTERS
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
              placeholder="Search product, brand, model or category..."
              className="
                h-12 w-full rounded-xl border border-slate-200
                bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none
                transition
                focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50
                dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100
                dark:focus:border-blue-500 dark:focus:bg-slate-950 dark:focus:ring-blue-950
              "
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              ["all", "All"],
              ["active", "Active"],
              ["expiring", "Expiring"],
              ["expired", "Expired"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`
                  whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold transition
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
          5. 2-COLUMN PREMIUM WARRANTY CARDS
         ========================================================= */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
              Your collection
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              Warranty portfolio
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {filteredWarranties.length} result
              {filteredWarranties.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {filteredWarranties.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <PackageCheck
              size={42}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />
            <h3 className="mt-4 font-bold text-slate-700 dark:text-slate-200">
              No warranties found
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Try another search or filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredWarranties.map((warranty) => {
              const status = getStatus(warranty.status);
              const StatusIcon = status.icon;

              return (
                <article
                  key={warranty.id}
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${status.iconBox}`}
                        >
                          <ShieldCheck size={27} />
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
                              {warranty.category}
                            </span>
                          </div>

                          <h3 className="mt-2 truncate text-lg font-black text-slate-900 dark:text-white">
                            {warranty.product}
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {warranty.brand} • {warranty.model}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedWarranty(warranty)}
                        className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        title="View warranty"
                      >
                        <Eye size={18} />
                      </button>
                    </div>

                    {/* Warranty timeline/progress */}
                    <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Coverage timeline
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {warranty.remaining}
                          </p>
                        </div>

                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                          {warranty.progress}%
                        </p>
                      </div>

                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
                          style={{ width: `${warranty.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Expiry date
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <CalendarDays size={15} className="text-blue-500" />
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {warranty.expires}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Status
                        </p>
                        <p
                          className={`mt-2 text-sm font-black ${
                            warranty.status === "expired"
                              ? "text-red-500"
                              : warranty.status === "expiring"
                              ? "text-amber-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {warranty.remaining}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <span className="text-[10px] text-slate-400">
                      {warranty.status === "expired"
                        ? "Warranty has ended"
                        : warranty.status === "expiring"
                        ? "Review this warranty soon"
                        : "Warranty protection is active"}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedWarranty(warranty)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingWarranty({ ...warranty })
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-amber-600 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(warranty)}
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
          6. DETAIL MODAL
         ========================================================= */}
      {selectedWarranty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                  Warranty details
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  {selectedWarranty.product}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedWarranty(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2">
              {[
                ["Category", selectedWarranty.category],
                ["Brand", selectedWarranty.brand],
                ["Model", selectedWarranty.model],
                ["Expiry", selectedWarranty.expires],
                ["Remaining", selectedWarranty.remaining],
                ["Status", getStatus(selectedWarranty.status).label],
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
          7. EDIT MODAL
         ========================================================= */}
      {editingWarranty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveEdit}
            className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                  Edit warranty
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  Update details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEditingWarranty(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {[
                ["product", "Product"],
                ["brand", "Brand"],
                ["model", "Model"],
                ["expires", "Expiry date"],
                ["remaining", "Remaining"],
              ].map(([field, label]) => (
                <label key={field} className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    {label}
                  </span>

                  <input
                    value={editingWarranty[field] || ""}
                    onChange={(e) =>
                      setEditingWarranty((current) => ({
                        ...current,
                        [field]: e.target.value,
                      }))
                    }
                    className="
                      h-11 w-full rounded-xl border border-slate-200
                      bg-slate-50 px-4 text-sm text-slate-700 outline-none
                      focus:border-blue-400 focus:ring-4 focus:ring-blue-50
                      dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100
                      dark:focus:border-blue-500 dark:focus:ring-blue-950
                    "
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 p-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingWarranty(null)}
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
          8. DELETE CONFIRMATION
         ========================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/50">
              <Trash2 size={21} />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
              Delete warranty?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to remove the warranty for{" "}
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {deleteTarget.product}
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
                onClick={deleteWarranty}
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

export default Warranties;
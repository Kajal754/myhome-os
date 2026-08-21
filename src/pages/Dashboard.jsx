import {
  Package,
  ShieldCheck,
  WalletCards,
  Bell,
  Wrench,
  Bike,
  FileText,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Users,
  ChevronRight,
  Upload,
  BellRing,
  BarChart3,
  Home,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  assets,
  reminders,
  expenses,
} from "../data/homeData";

function Dashboard() {
  return (
    <div className="space-y-6">

      {/* ================= HERO ================= */}

      <section className="relative min-h-[290px] overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-r from-[#dceeff] via-[#edf5ff] to-white px-6 py-7 shadow-sm sm:px-8">

        <div className="relative z-20 max-w-[510px]">

          <div className="flex flex-wrap gap-2">

            <Pill text="4 Family Members" />
            <Pill text="12 Assets" />
            <Pill text="3 Reminders" />

          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Your Home Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#07172f] sm:text-4xl">
            Welcome back,
            <br />
            Miss Kajal! 👋
          </h1>

          <p className="mt-3 max-w-[390px] text-sm leading-6 text-slate-500">
            Here's everything happening with your home today.
            Keep your assets, expenses and maintenance under control.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">

            <Link
              to="/assets"
              className="inline-flex items-center gap-2 rounded-xl bg-[#07172f] px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-950"
            >
              <Package size={15} />
              View My Assets
            </Link>

            <Link
              to="/reminders"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5"
            >
              <Bell size={15} />
              View Reminders
            </Link>

          </div>

        </div>

        {/* BIG HOUSE */}

        <div className="absolute bottom-0 right-0 block h-full w-full md:right-[-30px] md:w-[55%] lg:w-[50%]">

          <div className="absolute bottom-[-20px] right-[4%] h-[290px] w-[500px] animate-[float_5s_ease-in-out_infinite]">

            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=90"
              alt="Modern home"
              className="h-full w-full rounded-t-[45px] object-cover object-center shadow-2xl"
            />

          </div>

          {/* floating badge */}

          <div className="absolute right-[35%] top-[30px] flex animate-[float_4s_ease-in-out_infinite] items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-xl backdrop-blur">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={19} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-900">
                Home Secure
              </p>

              <p className="text-[9px] text-slate-400">
                Everything looks good
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Stat
          icon={Package}
          title="Total Assets"
          value="12"
          text="2 new this month"
          iconClass="bg-blue-50 text-blue-600"
          textClass="text-blue-600"
          icon2={ArrowUpRight}
        />

        <Stat
          icon={ShieldCheck}
          title="Active Warranties"
          value="5"
          text="3 expiring soon"
          iconClass="bg-emerald-50 text-emerald-600"
          textClass="text-emerald-600"
        />

        <Stat
          icon={WalletCards}
          title="Monthly Expenses"
          value="₹24,590"
          text="8% vs last month"
          iconClass="bg-violet-50 text-violet-600"
          textClass="text-violet-600"
          icon2={ArrowDownRight}
        />

        <Stat
          icon={Bell}
          title="Upcoming Reminders"
          value="3"
          text="Needs attention"
          iconClass="bg-orange-50 text-orange-500"
          textClass="text-orange-500"
        />

      </div>

      {/* ================= MAIN ================= */}

      <div className="grid gap-5 xl:grid-cols-3">

        {/* REMINDERS */}

        <Card title="Upcoming Reminders" link="/reminders">

          {reminders.map((item) => (
            <Link
              to="/reminders"
              key={item.id}
              className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                {item.type === "Maintenance" && (
                  <Wrench size={17} />
                )}

                {item.type === "Warranty" && (
                  <ShieldCheck size={17} />
                )}

                {item.type === "Insurance" && (
                  <FileText size={17} />
                )}
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {item.title}
                </p>

                <p className="truncate text-[10px] text-slate-400 sm:text-xs">
                  {item.description}
                </p>

              </div>

              <span className="rounded-lg bg-orange-50 px-2 py-1.5 text-[9px] font-bold text-orange-500">
                {item.date}
              </span>

            </Link>
          ))}

        </Card>

        {/* EXPENSES */}

        <Card title="Recent Expenses" link="/expenses">

          {expenses.slice(0, 4).map((item) => (
            <Link
              to="/expenses"
              key={item.id}
              className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50"
            >

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <WalletCards size={16} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-bold text-slate-800">
                  {item.title}
                </p>

                <p className="text-[10px] text-slate-400">
                  {item.category}
                </p>

              </div>

              <div className="text-right">

                <p className="text-xs font-bold text-slate-800">
                  ₹{item.amount.toLocaleString("en-IN")}
                </p>

                <p className="text-[9px] text-slate-400">
                  {item.date.split(" ")[0]} {item.date.split(" ")[1]}
                </p>

              </div>

            </Link>
          ))}

        </Card>

        {/* ASSETS */}

        <Card title="My Assets" link="/assets">

          {assets.slice(0, 4).map((asset) => (
            <Link
              to={`/assets/${asset.id}`}
              key={asset.id}
              className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50"
            >

              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                <img
                  src={asset.image}
                  alt={asset.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                />

              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {asset.name}
                </p>

                <p className="text-[10px] text-slate-400">
                  {asset.category}
                </p>

              </div>

              <span
                className={`hidden rounded-lg px-2 py-1.5 text-[8px] font-bold sm:block ${
                  asset.statusType === "danger"
                    ? "bg-red-50 text-red-500"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {asset.status}
              </span>

              <ChevronRight
                size={14}
                className="text-slate-300 transition group-hover:translate-x-1"
              />

            </Link>
          ))}

        </Card>

      </div>

      {/* ================= ANALYTICS ================= */}

      <div className="grid gap-5 lg:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">
              Expense Breakdown
            </h2>

            <BarChart3
              size={17}
              className="text-slate-400"
            />
          </div>

          <div className="mt-5 flex items-center justify-center gap-8">

            <div className="relative h-36 w-36">

              <div
                className="h-full w-full rounded-full"
                style={{
                  background:
                    "conic-gradient(#2563eb 0 32%, #10b981 32% 60%, #8b5cf6 60% 80%, #f97316 80% 92%, #ec4899 92% 100%)",
                }}
              />

              <div className="absolute inset-[24px] flex flex-col items-center justify-center rounded-full bg-white">
                <strong className="text-sm">
                  ₹24,590
                </strong>

                <span className="text-[9px] text-slate-400">
                  This Month
                </span>
              </div>

            </div>

            <div className="space-y-2.5">

              <Legend color="bg-blue-600" text="Maintenance" value="32%" />
              <Legend color="bg-emerald-500" text="Vehicle" value="28%" />
              <Legend color="bg-violet-500" text="Utilities" value="20%" />
              <Legend color="bg-orange-500" text="Repairs" value="12%" />
              <Legend color="bg-pink-500" text="Others" value="8%" />

            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">
              Monthly Expense Trend
            </h2>

            <span className="rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-600">
              2026
            </span>
          </div>

          <div className="mt-6 h-[170px]">

            <svg
              viewBox="0 0 600 180"
              className="h-full w-full"
            >

              <defs>

                <linearGradient
                  id="area"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#2563eb"
                    stopOpacity=".25"
                  />

                  <stop
                    offset="100%"
                    stopColor="#2563eb"
                    stopOpacity="0"
                  />

                </linearGradient>

              </defs>

              <path
                d="M20 145 L130 120 L240 105 L350 82 L460 50 L570 25 L570 170 L20 170Z"
                fill="url(#area)"
              />

              <path
                d="M20 145 L130 120 L240 105 L350 82 L460 50 L570 25"
                fill="none"
                stroke="#2563eb"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {[
                [20, 145],
                [130, 120],
                [240, 105],
                [350, 82],
                [460, 50],
                [570, 25],
              ].map(([x, y]) => (
                <circle
                  key={`${x}-${y}`}
                  cx={x}
                  cy={y}
                  r="5"
                  fill="white"
                  stroke="#2563eb"
                  strokeWidth="3"
                />
              ))}

            </svg>

          </div>

          <div className="flex justify-between text-[9px] text-slate-400">
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
          </div>

        </div>

      </div>

      {/* ================= QUICK ACTIONS ================= */}

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">

        <div className="rounded-2xl border border-slate-200 bg-white p-5">

          <h2 className="text-sm font-bold">
            Quick Actions
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3">

            <Quick
              to="/assets"
              icon={Package}
              title="Add Asset"
              color="bg-blue-600"
            />

            <Quick
              to="/documents"
              icon={Upload}
              title="Upload Document"
              color="bg-emerald-500"
            />

            <Quick
              to="/expenses"
              icon={WalletCards}
              title="Add Expense"
              color="bg-violet-500"
            />

            <Quick
              to="/reminders"
              icon={BellRing}
              title="Set Reminder"
              color="bg-orange-500"
            />

          </div>

        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e7efff] to-[#f5f0ff] p-6">

          <div className="relative z-10 max-w-[55%]">

            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
              MyHome OS
            </p>

            <h2 className="mt-2 text-xl font-extrabold text-[#07172f]">
              Keep your home running smoothly ✨
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Track your assets, warranties, expenses and
              maintenance from one beautiful dashboard.
            </p>

            <Link
              to="/assets"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#07172f] px-4 py-2.5 text-[10px] font-bold text-white"
            >
              <Plus size={14} />
              Add New Asset
            </Link>

          </div>

          <div className="absolute bottom-0 right-0 hidden h-full w-[45%] md:block">

            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85"
              alt="Beautiful home interior"
              className="h-full w-full object-cover opacity-90"
            />

          </div>

        </div>

      </div>

    </div>
  );
}


/* ================= COMPONENTS ================= */

function Pill({ text }) {
  return (
    <div className="rounded-full bg-white/80 px-3 py-1.5 text-[9px] font-semibold text-slate-600 shadow-sm backdrop-blur">
      {text}
    </div>
  );
}

function Stat({
  icon: Icon,
  title,
  value,
  text,
  iconClass,
  textClass,
  icon2: Icon2,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon size={20} />
      </div>

      <p className="mt-4 text-[10px] font-medium text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>

      <p className={`mt-2 flex items-center gap-1 text-[10px] font-semibold ${textClass}`}>
        {Icon2 && <Icon2 size={12} />}
        {text}
      </p>

    </div>
  );
}

function Card({ title, link, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

      <div className="mb-3 flex items-center justify-between">

        <h2 className="text-sm font-bold text-slate-900">
          {title}
        </h2>

        <Link
          to={link}
          className="text-[10px] font-bold text-blue-600"
        >
          View all →
        </Link>

      </div>

      {children}

    </div>
  );
}

function Legend({ color, text, value }) {
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="flex-1 text-[10px] text-slate-500">
        {text}
      </span>
      <strong className="text-[10px]">
        {value}
      </strong>
    </div>
  );
}

function Quick({
  to,
  icon: Icon,
  title,
  color,
}) {
  return (
    <Link
      to={to}
      className={`flex min-h-[75px] flex-col justify-between rounded-xl p-3 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${color}`}
    >
      <Icon size={18} />

      <span className="text-[10px] font-bold">
        {title}
      </span>
    </Link>
  );
}

export default Dashboard;
import { useEffect, useState } from "react";
import {
  Activity,
  FileText,
  Home,
  Wallet,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Bell,
  RefreshCw,
} from "lucide-react";

const API = "http://localhost:5000";

function getScoreLabel(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Attention";
  return "Critical";
}

function getIcon(name) {
  switch (name) {
    case "Documents":
      return FileText;

    case "Home":
      return Home;

    case "Money":
      return Wallet;

    case "Maintenance":
      return Wrench;

    case "Warranties":
      return ShieldCheck;

    case "Reminders":
      return Bell;

    default:
      return Activity;
  }
}

export default function LifeRadar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLifeRadar = async () => {
    try {
      setLoading(true);
      setError("");

      const savedUser =
        localStorage.getItem("myhomeUser");

      if (!savedUser) {
        setError("Please login to view your Life Radar.");
        return;
      }

      const user = JSON.parse(savedUser);

      const userId = user?.id;

      if (!userId) {
        setError("User ID not found.");
        return;
      }

      const response = await fetch(
        `${API}/api/life-radar?user_id=${userId}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load Life Radar"
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "Life Radar frontend error:",
        err
      );

      setError(
        err.message ||
          "Failed to load Life Radar."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLifeRadar();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-slate-700"
            />

            <p className="mt-4 text-sm text-slate-500">
              Analyzing your life data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <AlertTriangle
              size={35}
              className="mx-auto text-slate-500"
            />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Life Radar unavailable
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              onClick={loadLifeRadar}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const average = data.score;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Activity size={21} />
            </div>

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Intelligence
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Life Radar
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                A live health score calculated from your
                actual MYHOME OS data.
              </p>
            </div>

            <button
              onClick={loadLifeRadar}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* =====================================
            SCORE + RADAR
        ====================================== */}

        <div className="mb-6 grid gap-5 lg:grid-cols-[340px_1fr]">

          {/* Overall Score */}

          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                Overall Life Score
              </span>

              <TrendingUp size={20} />
            </div>

            <div className="mt-8 text-center">

              <div className="text-7xl font-bold tracking-tight">
                {average}
              </div>

              <div className="mt-2 text-sm text-slate-300">
                out of 100
              </div>

              <div className="mx-auto mt-6 h-3 max-w-xs overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{
                    width: `${average}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-sm text-slate-300">
                {getScoreLabel(average)} overall health
              </p>

            </div>
          </div>

          {/* Radar */}

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="absolute right-6 top-6 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              LIVE ANALYSIS
            </div>

            <div className="flex min-h-[320px] items-center justify-center">

              <div className="relative h-64 w-64">

                <div className="absolute inset-0 rounded-full border border-slate-200" />

                <div className="absolute inset-8 rounded-full border border-slate-200" />

                <div className="absolute inset-16 rounded-full border border-slate-200" />

                <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 bg-slate-200" />

                <div className="absolute left-1/2 top-1/2 h-full w-px -translate-y-1/2 bg-slate-200" />

                {/* Dynamic Radar Shape */}

                <div
                  className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-slate-900 bg-slate-900/10"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    transform: `translate(-50%, -50%) rotate(45deg) scale(${Math.max(
                      average / 100,
                      0.45
                    )})`,
                  }}
                />

                <div className="absolute left-1/2 top-[-25px] -translate-x-1/2 text-xs font-semibold text-slate-500">
                  Documents
                </div>

                <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500">
                  Reminders
                </div>

                <div className="absolute left-[-45px] top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                  Money
                </div>

                <div className="absolute right-[-55px] top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                  Home
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            AREAS
        ====================================== */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {data.areas.map((area) => {
            const Icon = getIcon(area.name);

            return (
              <div
                key={area.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon size={20} />
                  </div>

                  <span className="text-2xl font-bold text-slate-900">
                    {area.score}
                  </span>

                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  {area.name}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {area.description}
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-700"
                    style={{
                      width: `${area.score}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>
                    {getScoreLabel(area.score)}
                  </span>

                  <span>
                    {area.score}/100
                  </span>
                </div>

              </div>
            );
          })}

        </div>

        {/* =====================================
            INSIGHT
        ====================================== */}

        <div className="mt-6 flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <AlertTriangle size={19} />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              Radar Insight
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {data.insight}
            </p>
          </div>

        </div>

        {/* =====================================
            DATA SUMMARY
        ====================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Documents
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {data.stats.documents}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Assets
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {data.stats.assets}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Monthly Spend
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              ₹{Number(
                data.stats.monthlySpend || 0
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Reminders
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {data.stats.pendingReminders}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
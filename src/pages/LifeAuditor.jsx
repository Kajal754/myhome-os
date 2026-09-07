import { useEffect, useState } from "react";
import {
  SearchCheck,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  ShieldAlert,
  WalletCards,
  Car,
  RefreshCw,
  Loader2,
} from "lucide-react";

const iconMap = {
  documents: FileWarning,
  warranties: ShieldAlert,
  assets: ShieldAlert,
  maintenance: Car,
  expenses: WalletCards,
};

function getScoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs Attention";
  return "Critical";
}

function getSeverityClass(severity) {
  if (severity === "high") {
    return "bg-red-600 text-white";
  }

  if (severity === "warning") {
    return "bg-amber-500 text-white";
  }

  return "bg-slate-200 text-slate-700";
}

function getIconBoxClass(severity) {
  if (severity === "high") {
    return "bg-red-50 text-red-600";
  }

  if (severity === "warning") {
    return "bg-amber-50 text-amber-600";
  }

  return "bg-slate-100 text-slate-700";
}

function formatDate(date) {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function LifeAuditor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLifeAuditor() {
    try {
      setLoading(true);
      setError("");

      const savedUser = localStorage.getItem("myhomeUser");

      if (!savedUser) {
        throw new Error("User is not logged in.");
      }

      const currentUser = JSON.parse(savedUser);
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error("User ID not found.");
      }

      console.log("LIFE AUDITOR USER ID:", userId);

      const response = await fetch(
        `http://localhost:5000/api/life-auditor?user_id=${userId}`
      );

      const result = await response.json();

      console.log("LIFE AUDITOR RESPONSE:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load Life Auditor."
        );
      }

      setData(result);
    } catch (err) {
      console.error("LIFE AUDITOR ERROR:", err);
      setError(err.message || "Failed to load Life Auditor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLifeAuditor();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Loader2 size={26} className="animate-spin" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Analyzing your data...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Life Auditor is checking your MYHOME OS records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={26} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Unable to load Life Auditor
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              onClick={loadLifeAuditor}
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

  const summary = data?.summary || {};
  const auditItems = Array.isArray(data?.auditItems)
    ? data.auditItems
    : [];
  const stats = data?.stats || {};

  const score = Number(summary.score || 0);
  const issuesFound = Number(summary.issuesFound || 0);
  const highPriority = Number(summary.highPriority || 0);
  const healthy = Number(summary.healthy || 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <SearchCheck size={21} />
            </div>

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Intelligence
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Life Auditor
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                MYHOME OS checks your saved data for risks,
                missing information and upcoming problems.
              </p>
            </div>

            <button
              onClick={loadLifeAuditor}
              className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Issues Found"
            value={issuesFound}
            description={
              issuesFound > 0
                ? "Needs attention"
                : "Everything looks good"
            }
          />

          <SummaryCard
            title="High Priority"
            value={highPriority}
            description={
              highPriority > 0
                ? "Requires action"
                : "No critical issues"
            }
          />

          <SummaryCard
            title="Healthy"
            value={healthy}
            description="No issue detected"
          />
        </div>

        {/* LIFE SCORE */}
        <div className="mb-6 rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Overall Life Health
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {getScoreLabel(score)}
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Your Life Health score is calculated from your
                actual MYHOME OS records.
              </p>
            </div>

            <div className="text-center">
              <div className="text-6xl font-bold">
                {score}
              </div>

              <div className="text-sm text-slate-400">
                out of 100
              </div>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{
                width: `${Math.min(Math.max(score, 0), 100)}%`,
              }}
            />
          </div>
        </div>

        {/* AUDIT RESULTS */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Audit Results
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest analysis of your MYHOME OS data.
            </p>
          </div>

          {auditItems.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <CheckCircle2 size={26} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No issues detected
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your saved MYHOME OS data currently looks healthy.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {auditItems.map((item, index) => {
                const Icon =
                  iconMap[item.type] || AlertTriangle;

                return (
                  <div
                    key={`${item.title}-${index}`}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start"
                  >
                    {/* ICON */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getIconBoxClass(
                        item.severity
                      )}`}
                    >
                      <Icon size={21} />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">
                          {item.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getSeverityClass(
                            item.severity
                          )}`}
                        >
                          {item.count} issue
                          {item.count !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>

                      {/* RECORDS */}
                      {Array.isArray(item.records) &&
                        item.records.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {item.records.map(
                              (record, recordIndex) => (
                                <div
                                  key={
                                    record.id ||
                                    recordIndex
                                  }
                                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                >
                                  <p className="font-semibold text-slate-900">
                                    {record.name ||
                                      record.asset ||
                                      record.title ||
                                      "Record"}
                                  </p>

                                  {record.warranty && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      Warranty:{" "}
                                      {formatDate(
                                        record.warranty
                                      )}
                                    </p>
                                  )}

                                  {record.expiry && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      Expiry:{" "}
                                      {formatDate(
                                        record.expiry
                                      )}
                                    </p>
                                  )}

                                  {record.status && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      Status:{" "}
                                      {record.status}
                                    </p>
                                  )}

                                  {record.location && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      Location:{" "}
                                      {record.location}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DATA OVERVIEW */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            title="Documents"
            value={stats.documents}
          />

          <StatCard
            title="Assets"
            value={stats.assets}
          />

          <StatCard
            title="Warranties"
            value={stats.warranties}
          />

          <StatCard
            title="Expenses"
            value={stats.expenses}
          />

          <StatCard
            title="Maintenance"
            value={stats.maintenance}
          />
        </div>

        {/* MONITORING */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Your system is being monitored
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Life Auditor is connected to your PostgreSQL
                data and analyzes records belonging to your
                logged-in account.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// SUMMARY CARD
// ==========================================

function SummaryCard({
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value ?? 0}
      </p>
    </div>
  );
}
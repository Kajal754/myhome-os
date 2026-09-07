import { useEffect, useState } from "react";
import {
  Bell,
  CalendarClock,
  FileWarning,
  ShieldCheck,
  CheckCircle2,
  Settings2,
  Trash2,
  AlertTriangle,
} from "lucide-react";

// ==========================================
// ALERT STYLE
// ==========================================

function alertStyle(type) {
  if (type === "urgent") {
    return {
      icon: "bg-red-50 text-red-600",
      badge: "bg-red-600 text-white",
    };
  }

  if (type === "warning") {
    return {
      icon: "bg-amber-50 text-amber-600",
      badge: "bg-amber-500 text-white",
    };
  }

  return {
    icon: "bg-green-50 text-green-600",
    badge: "bg-green-100 text-green-700",
  };
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function SmartAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("myhomeUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user?.id) return;

    const loadAlerts = async () => {
      try {
        const [assetsResponse, documentsResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/assets?user_id=${user.id}`),
          fetch(`http://localhost:5000/api/documents?user_id=${user.id}`),
        ]);

        const assetsPayload = assetsResponse.ok
          ? await assetsResponse.json()
          : {};
        const documentsPayload = documentsResponse.ok
          ? await documentsResponse.json()
          : {};

        const today = new Date();
        const getDaysRemaining = (value) => {
          if (!value || String(value).toLowerCase() === "no expiry") {
            return null;
          }

          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return null;

          return Math.ceil(
            (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
        };

        const formatRemaining = (days) =>
          days < 0
            ? `${Math.abs(days)} days overdue`
            : `${days} days remaining`;

        const nextAlerts = [
          ...(assetsPayload.assets || []).flatMap((asset) => {
            const days = getDaysRemaining(asset.warranty);
            if (days === null || days > 60) return [];

            return [{
              id: `warranty-${asset.id}`,
              title: `${asset.name || "Asset"} warranty reminder`,
              description: `${asset.name || "This asset"} warranty requires review.`,
              date: formatRemaining(days),
              type: days <= 7 ? "urgent" : days <= 30 ? "warning" : "normal",
              icon: ShieldCheck,
            }];
          }),
          ...(documentsPayload.documents || []).flatMap((document) => {
            const days = getDaysRemaining(document.expiry);
            if (days === null || days > 60) return [];

            return [{
              id: `document-${document.id}`,
              title: `${document.name || "Document"} renewal`,
              description: `${document.name || "This document"} is approaching its expiry date.`,
              date: formatRemaining(days),
              type: days <= 7 ? "urgent" : days <= 30 ? "warning" : "normal",
              icon: FileWarning,
            }];
          }),
        ];

        setAlerts(nextAlerts);
      } catch (error) {
        console.error("LOAD SMART ALERTS ERROR:", error);
        setAlerts([]);
      }
    };

    loadAlerts();
  }, []);

  // ========================================
  // DISMISS ALERT
  // ========================================

  const dismissAlert = (id) => {
    setAlerts((prev) =>
      prev.filter((alert) => alert.id !== id)
    );
  };

  // ========================================
  // STATS
  // ========================================

  const activeAlerts = alerts.length;

  const thisWeek = alerts.filter(
    (alert) =>
      alert.date.includes("7") ||
      alert.date.includes("15")
  ).length;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Bell size={21} />
              </div>

              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Intelligence
              </span>

            </div>

            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Smart Alerts
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Important reminders generated from your personal MYHOME OS
              data.
            </p>
          </div>

          <button
            type="button"
            className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <Settings2 size={17} />
            Alert Settings
          </button>

        </div>

        {/* ==================================
            STATS
        ================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <Stat
            icon={Bell}
            title="Active Alerts"
            value={activeAlerts}
          />

          <Stat
            icon={CalendarClock}
            title="This Week"
            value={thisWeek}
          />

          <Stat
            icon={CheckCircle2}
            title="Completed"
            value="18"
          />

        </div>

        {/* ==================================
            ALERT LIST
        ================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-5">

            <h2 className="text-lg font-bold text-slate-900">
              Upcoming Alerts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Stay ahead of important dates and renewals.
            </p>

          </div>

          {/* =================================
              NO ALERTS
          ================================= */}

          {alerts.length === 0 ? (

            <div className="p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <CheckCircle2 size={27} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No active alerts
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You are all caught up. There are no pending alerts right now.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {alerts.map((alert) => {

                const Icon = alert.icon;

                const styles = alertStyle(alert.type);

                return (
                  <div
                    key={alert.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center"
                  >

                    {/* =========================
                        ICON
                    ========================== */}

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
                    >
                      <Icon size={21} />
                    </div>

                    {/* =========================
                        CONTENT
                    ========================== */}

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-bold text-slate-900">
                          {alert.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles.badge}`}
                        >
                          {alert.date}
                        </span>

                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {alert.description}
                      </p>

                    </div>

                    {/* =========================
                        DISMISS
                    ========================== */}

                    <button
                      type="button"
                      onClick={() => dismissAlert(alert.id)}
                      className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      Dismiss
                    </button>

                  </div>
                );
              })}

            </div>

          )}

        </div>

        {/* ==================================
            INFORMATION CARD
        ================================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <AlertTriangle size={21} />
            </div>

            <div>

              <h3 className="font-bold text-slate-900">
                Smart alerts are ready
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Alerts are generated from your saved document expiry dates and
                asset warranty dates.
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function Stat({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <span className="text-sm text-slate-500">
          {title}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Icon size={17} />
        </div>

      </div>

      <div className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </div>

    </div>
  );
}
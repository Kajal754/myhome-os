import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Wrench,
  ShieldCheck,
  Receipt,
  Bell,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

const schedule = [
  {
    id: 1,
    title: "AC Service",
    date: "2026-08-18",
    time: "10:00 AM",
    type: "maintenance",
    subtitle: "LG Split AC",
  },
  {
    id: 2,
    title: "Electricity Bill",
    date: "2026-08-22",
    time: "Due date",
    type: "bill",
    subtitle: "Home utilities",
  },
  {
    id: 3,
    title: "TV Warranty",
    date: "2026-08-27",
    time: "Expiry",
    type: "warranty",
    subtitle: "Samsung Smart TV",
  },
  {
    id: 4,
    title: "Home Cleaning",
    date: "2026-08-30",
    time: "9:00 AM",
    type: "reminder",
    subtitle: "Household",
  },
];

const typeInfo = {
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  warranty: {
    label: "Warranty",
    icon: ShieldCheck,
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  bill: {
    label: "Bills",
    icon: Receipt,
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  reminder: {
    label: "Reminders",
    icon: Bell,
    badge:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    dot: "bg-violet-500",
  },
};

const pad = (value) => String(value).padStart(2, "0");

function makeDate(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const previousTotal = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    cells.push({
      day: previousTotal - i,
      date: null,
      current: false,
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({
      day,
      date: makeDate(year, month, day),
      current: true,
    });
  }

  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({
      day: nextDay,
      date: null,
      current: false,
    });
    nextDay += 1;
  }

  return cells;
}

function Calendar() {
  const today = new Date();
  const todayKey = makeDate(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const calendar = useMemo(
    () => buildCalendar(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const monthTitle = viewDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const monthEvents = schedule.filter((item) => {
    const [year, month] = item.date.split("-").map(Number);
    return (
      year === viewDate.getFullYear() &&
      month === viewDate.getMonth() + 1
    );
  });

  const selectedEvents = schedule.filter(
    (item) => item.date === selectedDate
  );

  const upcoming = [...schedule]
    .filter((item) => item.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date));

  const moveMonth = (amount) => {
    setViewDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1)
    );
  };

  const goToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayKey);
  };

  const formatDate = (date) =>
    new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-100 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-100 blur-3xl dark:bg-blue-500/10" />

        <div className="relative grid gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <CalendarDays size={14} />
              HOME SCHEDULE
            </div>

            <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Everything important,
              <span className="text-indigo-600 dark:text-indigo-400">
                {" "}right on time.
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              See your home maintenance, warranties, bills and reminders
              together so nothing important gets missed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            {[
              ["This month", monthEvents.length],
              ["Maintenance", monthEvents.filter((e) => e.type === "maintenance").length],
              ["Warranties", monthEvents.filter((e) => e.type === "warranty").length],
              ["Reminders", monthEvents.filter((e) => e.type === "reminder").length],
            ].map(([label, value]) => (
              <div
                key={label}
                className="min-w-[115px] rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/50"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main calendar */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <CalendarDays size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Your schedule
                </p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {monthTitle}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToday}
                className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Today
              </button>

              <button
                onClick={() => moveMonth(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => moveMonth(1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-xs"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendar.map((cell, index) => {
              const events = cell.date
                ? schedule.filter((event) => event.date === cell.date)
                : [];

              const selected = cell.date === selectedDate;
              const todayCell = cell.date === todayKey;

              return (
                <button
                  key={`${cell.date || "empty"}-${index}`}
                  onClick={() => cell.date && setSelectedDate(cell.date)}
                  className={`min-h-[96px] border-b border-r border-slate-100 p-2 text-left transition hover:bg-slate-50 sm:min-h-[125px] sm:p-3 dark:border-slate-800 dark:hover:bg-slate-800/50 ${
                    !cell.current ? "bg-slate-50/40 dark:bg-slate-950/30" : ""
                  } ${selected ? "bg-indigo-50/60 dark:bg-indigo-500/5" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        todayCell
                          ? "bg-indigo-600 text-white shadow-sm"
                          : selected
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                          : cell.current
                          ? "text-slate-700 dark:text-slate-200"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    >
                      {cell.day}
                    </span>

                    {events.length > 0 && (
                      <span className="text-[9px] font-bold text-slate-400">
                        {events.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {events.slice(0, 2).map((event) => {
                      const info = typeInfo[event.type];

                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-1.5 truncate"
                        >
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${info.dot}`} />
                          <span className="truncate text-[9px] font-semibold text-slate-600 dark:text-slate-300 sm:text-[10px]">
                            {event.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
            {Object.entries(typeInfo).map(([key, info]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${info.dot}`} />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {info.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Selected date / upcoming */}
        <aside className="space-y-5">
          <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Selected day
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                    "en-IN",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    }
                  )}
                </h3>
              </div>

              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <CalendarDays size={18} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selectedEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
                  <CheckCircle2
                    size={22}
                    className="mx-auto text-emerald-500"
                  />
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No events today
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Your schedule is clear.
                  </p>
                </div>
              ) : (
                selectedEvents.map((event) => {
                  const info = typeInfo[event.type];
                  const Icon = info.icon;

                  return (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${info.badge}`}
                        >
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                              {event.title}
                            </p>
                            <ArrowUpRight
                              size={14}
                              className="shrink-0 text-slate-300"
                            />
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {event.subtitle}
                          </p>

                          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <Clock3 size={13} />
                            {event.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Coming up
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Your next important dates
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {upcoming.slice(0, 4).map((event) => {
                const info = typeInfo[event.type];
                const Icon = info.icon;

                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedDate(event.date)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm dark:bg-slate-900"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${info.badge}`}
                    >
                      <Icon size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                        {event.title}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {event.subtitle}
                      </p>
                    </div>

                    <span className="shrink-0 text-[10px] font-bold text-slate-400">
                      {formatDate(event.date)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Calendar;
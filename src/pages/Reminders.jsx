import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Bell,
  Wrench,
  ShieldCheck,
  FileText,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  ArrowRight,
  Check,
} from "lucide-react";


const typeConfig = {
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    color: "violet",
  },
  warranty: {
    label: "Warranty",
    icon: ShieldCheck,
    color: "blue",
  },
  document: {
    label: "Document",
    icon: FileText,
    color: "emerald",
  },
  other: {
    label: "Other",
    icon: Bell,
    color: "amber",
  },
};

const priorityConfig = {
  High: {
    label: "High",
    className:
      "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300",
    dot: "bg-red-500",
  },
  Medium: {
    label: "Medium",
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  Low: {
    label: "Low",
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

function Reminders() {
  const storedUser = localStorage.getItem("myhomeUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;

  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const markNotificationsSeen = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notifications/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) throw new Error("Failed to mark notifications as read");
      setNotifications([]);
      window.dispatchEvent(new Event("myhome-notifications-change"));
    } catch (error) {
      console.error("MARK notifications read error:", error);
    }
  };

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showAdd, setShowAdd] = useState(false);
  const [viewReminder, setViewReminder] = useState(null);
  const [editReminder, setEditReminder] = useState(null);
  const [deleteReminder, setDeleteReminder] = useState(null);

  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    date: "",
    type: "maintenance",
    priority: "Medium",
  });

  useEffect(() => {
    if (!userId) return;

    const loadReminders = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/reminders?user_id=${userId}`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load reminders");
        }

        setReminders(data.reminders || []);
      } catch (error) {
        console.error("LOAD reminders error:", error);
      }
    };

    loadReminders();
  }, [userId]);

  // 👇 ISKE JUST BAAD PASTE KARO

  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/notifications?user_id=${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load notifications");
        }

        setNotifications(data || []);
      } catch (error) {
        console.error("LOAD notifications error:", error);
      }
    };

    loadNotifications();
  }, [userId]);

  // 👆 YAHAN TAK

  const activeReminders = reminders.filter(
    (item) => !item.completed
  );

  const completedReminders = reminders.filter(
    (item) => item.completed
  );

  const highPriority = activeReminders.filter(
    (item) => item.priority === "High"
  );

  const filteredReminders = useMemo(() => {
    const query = search.toLowerCase().trim();

    return activeReminders.filter((reminder) => {
      const matchesSearch =
        !query ||
        reminder.title.toLowerCase().includes(query) ||
        reminder.description.toLowerCase().includes(query) ||
        reminder.type.toLowerCase().includes(query) ||
        reminder.priority.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" ||
        reminder.type === filter ||
        reminder.priority === filter;

      return matchesSearch && matchesFilter;
    });
  }, [activeReminders, search, filter]);

  const completeReminder = async (id) => {
    const reminder = reminders.find((item) => item.id === id);
    if (!reminder) return;

    try {
      const response = await fetch(`http://localhost:5000/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reminder, user_id: userId, completed: true }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setReminders((current) => current.map((item) => item.id === id ? { ...item, completed: true } : item));
    } catch (error) {
      console.error("COMPLETE reminder error:", error);
    }
  };

  const handleAddReminder = async (event) => {
    event.preventDefault();

    if (!newReminder.title.trim() || !newReminder.date) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newReminder, user_id: userId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);

      setReminders((current) => [{ ...data.reminder, date: newReminder.date, dueIn: "Upcoming" }, ...current]);
    } catch (error) {
      console.error("ADD reminder error:", error);
      alert("Could not save reminder.");
      return;
    }

    setNewReminder({
      title: "",
      description: "",
      date: "",
      type: "maintenance",
      priority: "Medium",
    });

    setShowAdd(false);
  };

  const handleEditReminder = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/api/reminders/${editReminder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editReminder, user_id: userId, date: editReminder.date }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setReminders((current) => current.map((reminder) => reminder.id === editReminder.id ? { ...editReminder } : reminder));
    } catch (error) {
      console.error("EDIT reminder error:", error);
      alert("Could not update reminder.");
      return;
    }

    setEditReminder(null);
  };

  const handleDeleteReminder = async () => {
    if (!deleteReminder) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/reminders/${deleteReminder.id}?user_id=${userId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setReminders((current) => current.filter((reminder) => reminder.id !== deleteReminder.id));
    } catch (error) {
      console.error("DELETE reminder error:", error);
      alert("Could not delete reminder.");
      return;
    }

    setDeleteReminder(null);
  };

  return (
    <div className="space-y-7">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="grid lg:grid-cols-[1.15fr_.85fr]">

          <div className="relative overflow-hidden p-7 sm:p-10">

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10" />

            <div className="absolute -bottom-28 left-20 h-72 w-72 rounded-full bg-blue-500/10" />

            <div className="relative">

              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                <Bell size={13} />
                HOME REMINDER CENTER
              </div>

              <h1 className="mt-5 max-w-xl text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Never miss
                <br />
                an important task.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Keep your home maintenance, warranty,
                document and other important deadlines
                organized in one simple place.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <button
                  onClick={() => setShowAdd(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <Plus size={16} />
                  Add reminder
                </button>

                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  <Clock3 size={15} />
                  {activeReminders.length} pending
                </div>

              </div>

            </div>
          </div>

          {/* HERO RIGHT */}

          <div className="relative min-h-[310px] overflow-hidden bg-slate-950 p-7">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,.35),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,.30),transparent_38%)]" />

            <div className="relative flex h-full flex-col justify-between">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
                    Reminder health
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your current attention level
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
                  <Bell size={20} />
                </div>

              </div>

              <div className="py-7">

                <div className="flex items-end gap-3">

                  <span className="text-6xl font-black text-white">
                    {activeReminders.length}
                  </span>

                  <span className="pb-2 text-sm font-semibold text-slate-400">
                    active
                  </span>

                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 to-blue-400 transition-all"
                    style={{
                      width: `${
                        reminders.length
                          ? Math.max(
                              12,
                              (completedReminders.length /
                                reminders.length) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />

                </div>

                <p className="mt-3 text-[10px] text-slate-500">
                  {completedReminders.length} completed out of{" "}
                  {reminders.length} total reminders
                </p>

              </div>

              <div className="grid grid-cols-3 gap-2">

                <MiniStat
                  value={highPriority.length}
                  label="High"
                />

                <MiniStat
                  value={activeReminders.length}
                  label="Pending"
                />

                <MiniStat
                  value={completedReminders.length}
                  label="Done"
                />

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Bell size={20} />}
          title="Total reminders"
          value={reminders.length}
          subtitle="All reminders"
          iconClass="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
        />

        <StatCard
          icon={<Clock3 size={20} />}
          title="Upcoming"
          value={activeReminders.length}
          subtitle="Need attention"
          iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="High priority"
          value={highPriority.length}
          subtitle="Important tasks"
          iconClass="bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          title="Completed"
          value={completedReminders.length}
          subtitle="Finished tasks"
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
        />

      </div>

      {/* =====================================================
          HIGH PRIORITY ALERT
      ===================================================== */}

      {highPriority.length > 0 && (
        <section className="overflow-hidden rounded-[24px] border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 dark:border-red-950 dark:from-red-950/30 dark:to-orange-950/20">

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm dark:bg-slate-900">
                <AlertTriangle size={21} />
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                  Needs attention
                </p>

                <h2 className="mt-1 text-base font-black text-slate-900 dark:text-white">
                  You have {highPriority.length} high-priority reminder
                  {highPriority.length !== 1 ? "s" : ""}.
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Take care of these important tasks first.
                </p>

              </div>

            </div>

            <button
              onClick={() => setFilter("High")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-600"
            >
              View priority
              <ArrowRight size={14} />
            </button>

          </div>
        </section>
      )}

      {/* =====================================================
          SEARCH + FILTERS
      ===================================================== */}

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search reminders..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-violet-950"
            />

          </div>

          <div className="flex gap-2 overflow-x-auto">

            {[
              "All",
              "maintenance",
              "warranty",
              "document",
              "High",
              "Medium",
              "Low",
            ].map((item) => (

              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold capitalize transition ${
                  filter === item
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {item === "All" ? "All" : item}
              </button>

            ))}

          </div>

        </div>
      </section>
      {/* =====================================================
    SMART ALERTS
===================================================== */}

{notifications.length > 0 && (
  <section className="mb-7">
    <div className="mb-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
        Smart alerts
      </p>

      <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
        Important notifications
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        Automatic alerts related to your saved data.
      </p>
      <button
        type="button"
        onClick={markNotificationsSeen}
        className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Mark all as seen
      </button>
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      {notifications.map((notification) => (
        <article
          key={notification.id}
          className="overflow-hidden rounded-[26px] border border-blue-100 bg-white shadow-sm dark:border-blue-950 dark:bg-slate-900"
        >
          <div className="h-1.5 bg-blue-500" />

          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <Bell size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                  {notification.type || "Notification"}
                </p>

                <h3 className="mt-1 text-base font-black text-slate-900 dark:text-white">
                  {notification.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {notification.message}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Automatic alert
              </span>

              <span className="text-[10px] font-bold text-blue-500">
                {notification.is_read ? "READ" : "NEW"}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
)}

      {/* =====================================================
          REMINDER LIST
      ===================================================== */}

      <section>

        <div className="mb-5 flex items-end justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">
              Your schedule
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              Upcoming reminders
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredReminders.length} reminder
              {filteredReminders.length !== 1 ? "s" : ""} shown
            </p>

          </div>

          <button
            onClick={() => {
              setSearch("");
              setFilter("All");
            }}
            className="hidden text-xs font-bold text-violet-600 hover:text-violet-700 sm:block"
          >
            Clear filters
          </button>

        </div>

        {filteredReminders.length === 0 ? (

          <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 dark:bg-violet-950">
              <Bell size={24} />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-800 dark:text-white">
              No reminders found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Try another search or filter.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-2">

            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={completeReminder}
                onView={setViewReminder}
                onEdit={setEditReminder}
                onDelete={setDeleteReminder}
              />
            ))}

          </div>

        )}

      </section>

      {/* =====================================================
          COMPLETED
      ===================================================== */}

      {completedReminders.length > 0 && (
        <section className="rounded-[26px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                Done
              </p>

              <h2 className="mt-1 font-black text-slate-900 dark:text-white">
                Completed reminders
              </h2>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950">
              <Check size={17} />
            </div>

          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">

            {completedReminders.map((reminder) => (

              <div
                key={reminder.id}
                className="flex items-center gap-4 p-5 opacity-60"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                  <CheckCircle2 size={18} />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-bold text-slate-800 line-through dark:text-slate-200">
                    {reminder.title}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-400">
                    {reminder.description}
                  </p>

                </div>

                <span className="hidden text-[10px] font-bold text-emerald-500 sm:block">
                  COMPLETED
                </span>

              </div>

            ))}

          </div>
        </section>
      )}

      {/* =====================================================
          ADD MODAL
      ===================================================== */}

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>

          <ModalHeader
            eyebrow="Create reminder"
            title="Add a new reminder"
            onClose={() => setShowAdd(false)}
          />

          <form
            onSubmit={handleAddReminder}
            className="space-y-5 p-6"
          >

            <Input
              label="Reminder title"
              value={newReminder.title}
              onChange={(event) =>
                setNewReminder({
                  ...newReminder,
                  title: event.target.value,
                })
              }
              placeholder="e.g. AC Service"
              required
            />

            <div>

              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Description
              </label>

              <textarea
                rows="3"
                value={newReminder.description}
                onChange={(event) =>
                  setNewReminder({
                    ...newReminder,
                    description: event.target.value,
                  })
                }
                placeholder="Add some details..."
                className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <Input
                label="Due date"
                type="date"
                value={newReminder.date}
                onChange={(event) =>
                  setNewReminder({
                    ...newReminder,
                    date: event.target.value,
                  })
                }
                required
              />

              <SelectInput
                label="Type"
                value={newReminder.type}
                onChange={(event) =>
                  setNewReminder({
                    ...newReminder,
                    type: event.target.value,
                  })
                }
                options={[
                  ["maintenance", "Maintenance"],
                  ["warranty", "Warranty"],
                  ["document", "Document"],
                  ["other", "Other"],
                ]}
              />

            </div>

            <SelectInput
              label="Priority"
              value={newReminder.priority}
              onChange={(event) =>
                setNewReminder({
                  ...newReminder,
                  priority: event.target.value,
                })
              }
              options={[
                ["High", "High"],
                ["Medium", "Medium"],
                ["Low", "Low"],
              ]}
            />

            <ModalFooter
              onCancel={() => setShowAdd(false)}
              submitText="Create reminder"
            />

          </form>

        </Modal>
      )}

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {viewReminder && (
        <Modal
          onClose={() => setViewReminder(null)}
        >

          <ModalHeader
            eyebrow="Reminder details"
            title={viewReminder.title}
            onClose={() => setViewReminder(null)}
          />

          <div className="space-y-5 p-6">

            <div className="flex items-start gap-4 rounded-2xl bg-violet-50 p-5 dark:bg-violet-950/40">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-300">
                {(() => {
                  const Icon =
                    typeConfig[viewReminder.type]?.icon ||
                    Bell;

                  return <Icon size={22} />;
                })()}
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                  {typeConfig[viewReminder.type]?.label}
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                  {viewReminder.description ||
                    "No description added."}
                </p>

              </div>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              <Detail
                label="Due date"
                value={viewReminder.date}
              />

              <Detail
                label="Due"
                value={viewReminder.dueIn}
              />

              <Detail
                label="Priority"
                value={viewReminder.priority}
              />

              <Detail
                label="Status"
                value={
                  viewReminder.completed
                    ? "Completed"
                    : "Pending"
                }
              />

            </div>

          </div>

        </Modal>
      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editReminder && (
        <Modal
          onClose={() => setEditReminder(null)}
        >

          <ModalHeader
            eyebrow="Edit reminder"
            title="Update reminder"
            onClose={() => setEditReminder(null)}
          />

          <form
            onSubmit={handleEditReminder}
            className="space-y-5 p-6"
          >

            <Input
              label="Reminder title"
              value={editReminder.title}
              onChange={(event) =>
                setEditReminder({
                  ...editReminder,
                  title: event.target.value,
                })
              }
              required
            />

            <div>

              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Description
              </label>

              <textarea
                rows="3"
                value={editReminder.description}
                onChange={(event) =>
                  setEditReminder({
                    ...editReminder,
                    description: event.target.value,
                  })
                }
                className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <Input
                label="Due date"
                type="text"
                value={editReminder.date}
                onChange={(event) =>
                  setEditReminder({
                    ...editReminder,
                    date: event.target.value,
                  })
                }
              />

              <SelectInput
                label="Priority"
                value={editReminder.priority}
                onChange={(event) =>
                  setEditReminder({
                    ...editReminder,
                    priority: event.target.value,
                  })
                }
                options={[
                  ["High", "High"],
                  ["Medium", "Medium"],
                  ["Low", "Low"],
                ]}
              />

            </div>

            <ModalFooter
              onCancel={() => setEditReminder(null)}
              submitText="Save changes"
            />

          </form>

        </Modal>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteReminder && (
        <Modal
          onClose={() => setDeleteReminder(null)}
        >

          <div className="p-7">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/50">
              <Trash2 size={21} />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
              Delete this reminder?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              This will permanently remove{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {deleteReminder.title}
              </strong>{" "}
              from your reminders.
            </p>

            <div className="mt-6 flex justify-end gap-2">

              <button
                onClick={() =>
                  setDeleteReminder(null)
                }
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteReminder}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-600"
              >
                Delete reminder
              </button>

            </div>

          </div>

        </Modal>
      )}

    </div>
  );
}


/* =========================================================
   REMINDER CARD
========================================================= */

function ReminderCard({
  reminder,
  onComplete,
  onView,
  onEdit,
  onDelete,
}) {
  const config =
    typeConfig[reminder.type] || typeConfig.other;

  const Icon = config.icon;

  const priority =
    priorityConfig[reminder.priority] ||
    priorityConfig.Medium;

  return (
    <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">

      <div
        className={`h-1.5 ${
          reminder.priority === "High"
            ? "bg-red-500"
            : reminder.priority === "Medium"
            ? "bg-amber-400"
            : "bg-emerald-500"
        }`}
      />

      <div className="p-5">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
              <Icon size={21} />
            </div>

            <div className="min-w-0">

              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                {config.label}
              </p>

              <h3 className="mt-1 truncate text-base font-black text-slate-900 dark:text-white">
                {reminder.title}
              </h3>

            </div>

          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ${priority.className}`}
          >
            {priority.label}
          </span>

        </div>

        <p className="mt-5 min-h-[40px] text-xs leading-5 text-slate-500 dark:text-slate-400">
          {reminder.description ||
            "No description added for this reminder."}
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <CalendarDays
                size={15}
                className="text-violet-500"
              />

              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {reminder.date}
              </span>

            </div>

            <span className="text-xs font-bold text-amber-500">
              {reminder.dueIn}
            </span>

          </div>

        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">

          <button
            onClick={() => onView(reminder)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Eye size={13} />
            View
          </button>

          <button
            onClick={() => onEdit({ ...reminder })}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Pencil size={13} />
            Edit
          </button>

          <button
            onClick={() => onComplete(reminder.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-[10px] font-bold text-white transition hover:bg-emerald-600"
          >
            <Check size={13} />
            Done
          </button>

        </div>

        <button
          onClick={() => onDelete(reminder)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
        >
          <Trash2 size={12} />
          Delete reminder
        </button>

      </div>

    </article>
  );
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatCard({
  icon,
  title,
  value,
  subtitle,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}


function MiniStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">

      <p className="text-lg font-black text-white">
        {value}
      </p>

      <p className="text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </p>

    </div>
  );
}


function Modal({
  children,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-2xl dark:bg-slate-900">
        {children}
      </div>

    </div>
  );
}


function ModalHeader({
  eyebrow,
  title,
  onClose,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">

      <div>

        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-500">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
          {title}
        </h2>

      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <X size={18} />
      </button>

    </div>
  );
}


function ModalFooter({
  onCancel,
  submitText,
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">

      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-700"
      >
        {submitText}
      </button>

    </div>
  );
}


function Input({
  label,
  ...props
}) {
  return (
    <label className="block">

      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <input
        {...props}
        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-violet-950"
      />

    </label>
  );
}


function SelectInput({
  label,
  options,
  ...props
}) {
  return (
    <label className="block">

      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <select
        {...props}
        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      >
        {options.map(([value, labelText]) => (
          <option
            key={value}
            value={value}
          >
            {labelText}
          </option>
        ))}
      </select>

    </label>
  );
}


function Detail({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
        {value}
      </p>

    </div>
  );
}


export default Reminders;
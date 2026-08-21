import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  ShieldCheck,
  ChevronRight,
  Check,
  Moon,
  Sun,
  X,
  Save,
  Lock,
  Mail,
  Eye,
  Trash2,
} from "lucide-react";

const DEFAULT_PROFILE = {
  name: "Miss Kajal",
  email: "kajal@example.com",
};

function Settings() {
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem("myhome-notifications") !== "false"
  );
  const [warrantyAlerts, setWarrantyAlerts] = useState(
    () => localStorage.getItem("myhome-warranty-alerts") !== "false"
  );
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(
    () => localStorage.getItem("myhome-maintenance-alerts") !== "false"
  );

  const [profile, setProfile] = useState(() => ({

  name: localStorage.getItem("myhome-name") || DEFAULT_PROFILE.name,
  email: localStorage.getItem("myhome-email") || DEFAULT_PROFILE.email,
  photo: localStorage.getItem("myhome-photo") || "",
}));
useEffect(() => {
  const loadSettings = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/settings");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load settings");
      }

      const settings = data.settings;

      setProfile({
        name: settings.name || DEFAULT_PROFILE.name,
        email: settings.email || DEFAULT_PROFILE.email,
        photo: settings.photo || "",
      });

      setNotifications(settings.notifications ?? true);
      setWarrantyAlerts(settings.warranty_alerts ?? true);
      setMaintenanceAlerts(settings.maintenance_alerts ?? true);
      setTheme(settings.theme || "light");

    } catch (error) {
      console.error("LOAD SETTINGS ERROR:", error);
    }
  };

  loadSettings();
}, []);

  const [theme, setTheme] = useState(() =>
    localStorage.getItem("myhome-theme") === "dark" ? "dark" : "light"
  );

  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState(profile);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("myhome-notifications", String(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("myhome-warranty-alerts", String(warrantyAlerts));
  }, [warrantyAlerts]);

  useEffect(() => {
    localStorage.setItem("myhome-maintenance-alerts", String(maintenanceAlerts));
  }, [maintenanceAlerts]);

  useEffect(() => {
  localStorage.setItem("myhome-name", profile.name);
  localStorage.setItem("myhome-email", profile.email);
  localStorage.setItem("myhome-photo", profile.photo || "");
}, [profile]);

  useEffect(() => {
    const syncTheme = () => {
      const next =
        localStorage.getItem("myhome-theme") === "dark" ? "dark" : "light";
      setTheme(next);
    };

    window.addEventListener("myhome-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("myhome-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const notify = (text) => {
    setMessage(text);
    window.clearTimeout(window.__myhomeSettingsTimer);
    window.__myhomeSettingsTimer = window.setTimeout(() => setMessage(""), 1800);
  };

  const changeTheme = (nextTheme) => {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.body.classList.toggle("dark", nextTheme === "dark");

    const root = document.getElementById("root");
    if (root) root.classList.toggle("dark", nextTheme === "dark");

    document.documentElement.style.backgroundColor =
      nextTheme === "dark" ? "#020617" : "#f8fafc";
    document.body.style.backgroundColor =
      nextTheme === "dark" ? "#020617" : "#f8fafc";
    document.body.style.color =
      nextTheme === "dark" ? "#f8fafc" : "#0f172a";

    localStorage.setItem("myhome-theme", nextTheme);
    setTheme(nextTheme);

    window.dispatchEvent(
      new CustomEvent("myhome-theme-change", { detail: nextTheme })
    );

    notify(nextTheme === "dark" ? "Dark mode enabled" : "Light mode enabled");
    setModal(null);
  };

  const openProfile = () => {
    setDraft({ ...profile });
    setModal("profile");
  };

  const saveProfile = async () => {
  const name = draft.name.trim();
  const email = draft.email.trim();

  if (!name || !email) {
    notify("Name and email are required");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        photo: draft.photo || "",
        notifications,
        warranty_alerts: warrantyAlerts,
        maintenance_alerts: maintenanceAlerts,
        theme,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to save settings");
    }

    setProfile({
      name,
      email,
      photo: draft.photo || "",
    });

    localStorage.setItem("myhome-name", name);
    localStorage.setItem("myhome-email", email);
    localStorage.setItem("myhome-photo", draft.photo || "");

    window.dispatchEvent(
      new Event("myhome-profile-photo-change")
    );

    setModal(null);
    notify("Profile saved successfully");

  } catch (error) {
    console.error("SAVE SETTINGS ERROR:", error);
    notify("Failed to save settings");
  }
};

  const resetSettings = () => {
    const confirmed = window.confirm(
      "Reset local MyHome settings? Profile, alerts and theme will return to default."
    );

    if (!confirmed) return;

    localStorage.removeItem("myhome-name");
    localStorage.removeItem("myhome-email");
    localStorage.removeItem("myhome-notifications");
    localStorage.removeItem("myhome-warranty-alerts");
    localStorage.removeItem("myhome-maintenance-alerts");

    setProfile({ ...DEFAULT_PROFILE });
    setDraft({ ...DEFAULT_PROFILE });
    setNotifications(true);
    setWarrantyAlerts(true);
    setMaintenanceAlerts(true);
    changeTheme("light");
    setModal(null);
    notify("Settings reset");
  };

  const sections = [
    {
      title: "Account",
      description: "Your profile and personal information",
      icon: User,
      items: [
        {
          title: "Profile",
          description: `${profile.name} · Home Owner`,
          button: "Edit",
          onClick: openProfile,
        },
        {
          title: "Email",
          description: profile.email,
          button: "Manage",
          onClick: openProfile,
        },
      ],
    },
    {
      title: "Notifications",
      description: "Choose what MyHome should remind you about",
      icon: Bell,
      items: [
        {
          title: "Notifications",
          description: "Receive important home updates",
          value: notifications,
          onClick: () => {
            setNotifications((v) => !v);
            notify(!notifications ? "Notifications enabled" : "Notifications disabled");
          },
        },
        {
          title: "Warranty alerts",
          description: "Get notified before warranties expire",
          value: warrantyAlerts,
          onClick: () => {
            setWarrantyAlerts((v) => !v);
            notify(!warrantyAlerts ? "Warranty alerts enabled" : "Warranty alerts disabled");
          },
        },
        {
          title: "Maintenance alerts",
          description: "Stay on top of upcoming servicing",
          value: maintenanceAlerts,
          onClick: () => {
            setMaintenanceAlerts((v) => !v);
            notify(!maintenanceAlerts ? "Maintenance alerts enabled" : "Maintenance alerts disabled");
          },
        },
      ],
    },
    {
      title: "Appearance",
      description: "Control how MyHome looks",
      icon: Palette,
      items: [
        {
          title: "Theme",
          description: `Currently using ${theme === "dark" ? "Dark" : "Light"} mode`,
          button: "Change",
          onClick: () => setModal("theme"),
        },
      ],
    },
    {
      title: "Privacy & Security",
      description: "Manage protection and local app data",
      icon: ShieldCheck,
      items: [
        {
          title: "Account security",
          description: "Review your security status",
          button: "Manage",
          onClick: () => setModal("security"),
        },
        {
          title: "Data & privacy",
          description: "View and control data stored in this browser",
          button: "Review",
          onClick: () => setModal("privacy"),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-100 blur-3xl dark:bg-indigo-500/10" />
        <div className="relative p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <SettingsIcon size={22} />
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Personalize MyHome, manage alerts, change the theme and control
            your account preferences.
          </p>
        </div>
      </section>

      {message && (
        <div className="fixed right-5 top-5 z-[100] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl dark:bg-white dark:text-slate-900">
          <Check size={16} />
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <section
                key={section.title}
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon size={18} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">
                      {section.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {section.items.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-4 p-5 sm:p-6"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {item.description}
                        </p>
                      </div>

                      {typeof item.value === "boolean" ? (
                        <button
                          type="button"
                          onClick={item.onClick}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                            item.value
                              ? "bg-indigo-600"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                              item.value ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={item.onClick}
                          className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {item.button}
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="space-y-5">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              {profile.photo ? (
  <img
    src={profile.photo}
    alt={profile.name}
    className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-lg"
  />
) : (
  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-blue-300 text-sm font-bold text-slate-800">
    {profile.name.charAt(0).toUpperCase()}
  </div>
)}

              <div className="min-w-0">
                <p className="truncate font-bold text-slate-900 dark:text-white">
                  {profile.name}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {profile.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openProfile}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              <User size={14} />
              Edit Profile
            </button>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <Check size={14} />
                Settings saved automatically
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Preferences are saved in this browser.
              </p>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick controls
            </p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setModal("theme")}
                className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left dark:bg-slate-900"
              >
                {theme === "dark" ? (
                  <Moon size={16} className="text-indigo-500" />
                ) : (
                  <Sun size={16} className="text-amber-500" />
                )}
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Theme
                </span>
                <span className="ml-auto text-[10px] text-indigo-500">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModal("privacy")}
                className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left dark:bg-slate-900"
              >
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Privacy
                </span>
                <span className="ml-auto text-[10px] text-slate-400">
                  Manage
                </span>
              </button>
            </div>
          </section>
        </aside>
      </div>

      {modal === "profile" && (
        <Modal title="Edit Profile" icon={User} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
  <p className="mb-1.5 text-xs font-semibold text-slate-500">
    Profile Photo
  </p>

  <div className="flex items-center gap-4">
    {draft.photo ? (
      <img
        src={draft.photo}
        alt="Profile"
        className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-lg"
      />
    ) : (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white shadow-lg">
        {draft.name?.charAt(0)?.toUpperCase() || "K"}
      </div>
    )}

    <label className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
      Choose Photo

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (!file) return;

          const reader = new FileReader();

          reader.onloadend = () => {
            setDraft({
              ...draft,
              photo: reader.result,
            });
          };

          reader.readAsDataURL(file);
        }}
      />
    </label>
  </div>
</div>
            <Field
              label="Name"
              value={draft.name}
              onChange={(value) => setDraft({ ...draft, name: value })}
            />
            <Field
              label="Email"
              type="email"
              value={draft.email}
              onChange={(value) => setDraft({ ...draft, email: value })}
            />

            <button
              type="button"
              onClick={saveProfile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {modal === "theme" && (
        <Modal
          title="Appearance"
          icon={Palette}
          onClose={() => setModal(null)}
        >
          <p className="mb-4 text-xs text-slate-400">
            Choose the theme for the entire MyHome application.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <ThemeButton
              label="Light Mode"
              icon={Sun}
              active={theme === "light"}
              onClick={() => changeTheme("light")}
            />
            <ThemeButton
              label="Dark Mode"
              icon={Moon}
              active={theme === "dark"}
              onClick={() => changeTheme("dark")}
            />
          </div>
        </Modal>
      )}

      {modal === "security" && (
        <Modal
          title="Account Security"
          icon={Lock}
          onClose={() => setModal(null)}
        >
          <div className="space-y-3">
            <ActionRow
              icon={Lock}
              title="Password protection"
              text="Your account is protected by your existing sign-in method."
            />
            <ActionRow
              icon={Mail}
              title="Account email"
              text={profile.email}
            />

            <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Security status: Good
              </p>
              <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-300/70">
                This frontend does not have a real password backend, so no
                fake password change is claimed here.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setModal(null);
                notify("Security details checked");
              }}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {modal === "privacy" && (
        <Modal
          title="Data & Privacy"
          icon={ShieldCheck}
          onClose={() => setModal(null)}
        >
          <div className="space-y-3">
            <ActionRow
              icon={Eye}
              title="Browser storage"
              text="Profile, notification preferences and theme are stored locally in this browser."
            />
            <ActionRow
              icon={ShieldCheck}
              title="Your control"
              text="You can reset these local preferences at any time."
            />

            <button
              type="button"
              onClick={resetSettings}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-500/10"
            >
              <Trash2 size={16} />
              Reset Local Settings
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </label>
  );
}

function ActionRow({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function ThemeButton({ label, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border p-5 text-sm font-semibold transition ${
        active
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300"
          : "border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      <Icon size={24} />
      {label}
      {active && <Check size={16} />}
    </button>
  );
}

function Modal({ title, icon: Icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Icon size={18} />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white">
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

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export default Settings;
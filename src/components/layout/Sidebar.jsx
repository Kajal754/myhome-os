import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Package,
  FileText,
  ShieldCheck,
  Wrench,
  WalletCards,
  UsersRound,
  Bell,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  Crown,
  ChevronRight,
  X,
  Check,
  Sparkles,
  Brain,
  Radar,
  SearchCheck,
  BellRing,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { getDisplayName } from "../../utils/helpers";

const mainMenu = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Assets",
    path: "/assets",
    icon: Package,
  },
  {
    name: "Documents",
    path: "/documents",
    icon: FileText,
  },
  {
    name: "Warranties",
    path: "/warranties",
    icon: ShieldCheck,
  },
  {
    name: "Maintenance",
    path: "/maintenance",
    icon: Wrench,
  },
  {
    name: "Expenses",
    path: "/expenses",
    icon: WalletCards,
  },
  {
    name: "Service Providers",
    path: "/service-providers",
    icon: UsersRound,
  },
  {
    name: "Reminders",
    path: "/reminders",
    icon: Bell,
  },
  {
    name: "Family",
    path: "/family",
    icon: Users,
  },
  {
    name: "Calendar",
    path: "/calendar",
    icon: CalendarDays,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
];
const intelligenceMenu = [
  {
    name: "Second Brain",
    path: "/second-brain",
    icon: Brain,
  },
  {
    name: "Life Radar",
    path: "/life-radar",
    icon: Radar,
  },
  {
    name: "Life Auditor",
    path: "/life-auditor",
    icon: SearchCheck,
  },
  {
    name: "Smart Alerts",
    path: "/smart-alerts",
    icon: BellRing,
  },
];

function Sidebar({ mobile = false }) {
  const [showPremium, setShowPremium] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [profileName, setProfileName] = useState(() => {
    const savedUser = localStorage.getItem("myhomeUser");
    const user = savedUser ? JSON.parse(savedUser) : null;
    return getDisplayName(user);
  });

  useEffect(() => {
    const loadUnreadNotifications = async () => {
      const savedUser = localStorage.getItem("myhomeUser");
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (!user?.id) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/notifications?user_id=${user.id}`
        );
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setUnreadNotifications(data.length);
        }
      } catch (error) {
        console.error("LOAD notification badge error:", error);
      }
    };

    loadUnreadNotifications();
    window.addEventListener("myhome-notifications-change", loadUnreadNotifications);

    return () => {
      window.removeEventListener("myhome-notifications-change", loadUnreadNotifications);
    };
  }, []);

  useEffect(() => {
    const updateProfileName = () => {
      const savedUser = localStorage.getItem("myhomeUser");
      const user = savedUser ? JSON.parse(savedUser) : null;
      setProfileName(getDisplayName(user));
    };

    window.addEventListener("myhome-profile-change", updateProfileName);

    return () => {
      window.removeEventListener("myhome-profile-change", updateProfileName);
    };
  }, []);

  return (
    <>
      <aside
        className={`${
          mobile ? "flex" : "hidden lg:flex"
        } h-full w-[255px] shrink-0 flex-col bg-[#06172f] text-white`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg">
            <span className="text-xl">🏠</span>
          </div>

          <div>
            <h1 className="text-[17px] font-bold tracking-tight">
              MyHome OS
            </h1>

            <p className="text-[10px] text-blue-200/60">
              Smart Home Management
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200/40">
            Workspace
          </p>

          <nav className="space-y-1">
            {mainMenu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/30"
                        : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.9} />

                  <span className="flex-1 text-[12px] font-medium">
                    {item.name}
                  </span>

                  {(item.badge || (item.name === "Reminders" && unreadNotifications > 0)) && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold">
                      {item.badge || unreadNotifications}
                    </span>
                  )}

                  <ChevronRight
                    size={13}
                    className="opacity-0 transition group-hover:opacity-40"
                  />
                </NavLink>
              );
            })}
         </nav>


{/* ================= INTELLIGENCE ================= */}

<div className="my-5 h-px bg-white/10" />

<p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200/40">
  Intelligence
</p>

<nav className="space-y-1">

  {intelligenceMenu.map((item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
            isActive
              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-950/30"
              : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
          }`
        }
      >
        <Icon size={18} strokeWidth={1.9} />

        <span className="flex-1 text-[12px] font-medium">
          {item.name}
        </span>

        <ChevronRight
          size={13}
          className="opacity-0 transition group-hover:opacity-40"
        />
      </NavLink>
    );
  })}

</nav>


{/* ================= SYSTEM ================= */}

<div className="my-5 h-px bg-white/10" />

<p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200/40">
  System
</p>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-medium ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/[0.07]"
              }`
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>
        </div>

        {/* Premium */}
        <div className="px-3 pb-3">
          <div className="overflow-hidden rounded-2xl border border-blue-400/10 bg-gradient-to-br from-[#102a55] to-[#101e49] p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-300 to-orange-500">
              <Crown size={15} className="text-white" />
            </div>

            <h3 className="mt-3 text-sm font-bold">
              Go Premium
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-blue-100/60">
              Unlock advanced features and manage your home like a pro.
            </p>

            <button
              onClick={() => setShowPremium(true)}
              className="mt-3 w-full rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 py-2.5 text-[10px] font-bold shadow-lg shadow-blue-950/30 transition hover:scale-[1.02]"
            >
              Upgrade Now
            </button>
          </div>
        </div>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-blue-400 text-xs font-bold">
              {profileName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold">
                {profileName}
              </p>

              <p className="text-[10px] text-slate-400">
                Home Owner
              </p>
            </div>

            <ChevronRight
              size={14}
              className="text-slate-500"
            />
          </div>
        </div>
      </aside>

      {/* PREMIUM MODAL */}
      {showPremium && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b1730] p-6 text-white shadow-2xl">

            {/* Close */}
            <button
              onClick={() => setShowPremium(false)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 to-orange-500">
                <Crown size={24} />
              </div>

              <h2 className="text-2xl font-bold">
                Upgrade MyHome OS
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Choose the perfect plan to manage your home smarter.
              </p>
            </div>

            {/* Plans */}
            <div className="grid gap-5 md:grid-cols-3">

              {/* FREE */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-bold">
                  Free
                </h3>

                <div className="mt-3">
                  <span className="text-3xl font-bold">
                    ₹0
                  </span>

                  <span className="text-sm text-slate-400">
                    /forever
                  </span>
                </div>

                <div className="my-5 h-px bg-white/10" />

                <div className="space-y-3 text-sm text-slate-300">
                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Up to 15 Assets
                  </p>

                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Basic Warranty Tracking
                  </p>

                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Basic Dashboard
                  </p>
                </div>

                <button
                  onClick={() => setShowPremium(false)}
                  className="mt-6 w-full rounded-xl border border-white/10 py-3 text-sm font-semibold hover:bg-white/5"
                >
                  Current Plan
                </button>
              </div>

              {/* PRO */}
              <div className="relative rounded-2xl border border-blue-500/50 bg-gradient-to-b from-blue-600/20 to-indigo-900/20 p-5 shadow-xl shadow-blue-950/30">

                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-1 text-[10px] font-bold uppercase">
                  Most Popular
                </div>

                <h3 className="text-lg font-bold">
                  Pro
                </h3>

                <div className="mt-3">
                  <span className="text-3xl font-bold">
                    ₹299
                  </span>

                  <span className="text-sm text-slate-400">
                    /month
                  </span>
                </div>

                <div className="my-5 h-px bg-white/10" />

                <div className="space-y-3 text-sm text-slate-300">
                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Unlimited Assets
                  </p>

                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Warranty Reminders
                  </p>

                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Expense Reports
                  </p>

                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Advanced Analytics
                  </p>
                </div>

                <button
                  onClick={() =>
                    alert("Razorpay payment will be connected here.")
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3 text-sm font-bold shadow-lg transition hover:scale-[1.02]"
                >
                  <Sparkles size={16} />
                  Choose Pro
                </button>
              </div>

              {/* FAMILY */}
              <div className="rounded-2xl border border-purple-400/20 bg-white/[0.04] p-5">
                <h3 className="text-lg font-bold">
                  Family
                </h3>

                <div className="mt-3">
                  <span className="text-3xl font-bold">
                    ₹699
                  </span>

                  <span className="text-sm text-slate-400">
                    /month
                  </span>
                </div>

                <div className="my-5 h-px bg-white/10" />

                <div className="space-y-3 text-sm text-slate-300">
                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Everything in Pro
                  </p>

                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Multiple Family Members
                  </p>

                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Cloud Backup
                  </p>

                  <p className="flex gap-2">
                    <Check size={16} className="text-green-400" />
                    Priority Support
                  </p>
                </div>

                <button
                  onClick={() =>
                    alert("Razorpay payment will be connected here.")
                  }
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-bold shadow-lg transition hover:scale-[1.02]"
                >
                  Choose Family
                </button>
              </div>

            </div>

            {/* Bottom */}
            <p className="mt-6 text-center text-[11px] text-slate-500">
              Cancel anytime • Secure payment • No hidden charges
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
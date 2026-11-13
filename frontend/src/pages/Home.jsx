
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Package,
  FileText,
  Wrench,
  Receipt,
  Users,
  CalendarDays,
  Bell,
  BarChart3,
  Brain,
  Radar,
  ClipboardCheck,
  CheckCircle2,
  LayoutDashboard,
  Heart,
  Clock3,
  Wallet,
  ChevronRight,
  Zap,
  LockKeyhole,
} from "lucide-react";

function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const closeMenu = () => setMobileMenu(false);

  const features = [
    {
      icon: Package,
      title: "Smart Asset Management",
      description:
        "Keep all your home assets, appliances and important belongings organized in one place.",
      color: "indigo",
    },
    {
      icon: FileText,
      title: "Documents & Records",
      description:
        "Store and manage your important home documents and records with ease.",
      color: "violet",
    },
    {
      icon: ShieldCheck,
      title: "Warranty Tracking",
      description:
        "Keep track of warranties and never miss an important expiry date.",
      color: "emerald",
    },
    {
      icon: Wrench,
      title: "Maintenance Management",
      description:
        "Plan repairs, track services and keep your home running smoothly.",
      color: "orange",
    },
    {
      icon: Receipt,
      title: "Expense Tracking",
      description:
        "Manage your home expenses and understand where your money goes.",
      color: "pink",
    },
    {
      icon: Users,
      title: "Family Management",
      description:
        "Bring your household responsibilities and family information together.",
      color: "blue",
    },
  ];

  const smartFeatures = [
    {
      icon: Brain,
      title: "Second Brain",
      label: "Your personal knowledge space",
      description:
        "Keep your important thoughts, notes and information organized and accessible.",
      color: "violet",
    },
    {
      icon: Radar,
      title: "Life Radar",
      label: "See the bigger picture",
      description:
        "Get a clear overview of important areas of your home and everyday life.",
      color: "indigo",
    },
    {
      icon: ClipboardCheck,
      title: "Life Auditor",
      label: "Stay organized and aware",
      description:
        "Review your important responsibilities and identify things that need attention.",
      color: "emerald",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      label: "Stay one step ahead",
      description:
        "Keep important reminders and alerts close so nothing gets overlooked.",
      color: "orange",
    },
  ];

  const colorStyles = {
    indigo: {
      icon: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
      glow: "hover:border-indigo-300 dark:hover:border-indigo-400/40",
    },
    violet: {
      icon: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
      glow: "hover:border-violet-300 dark:hover:border-violet-400/40",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      glow: "hover:border-emerald-300 dark:hover:border-emerald-400/40",
    },
    orange: {
      icon: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
      glow: "hover:border-orange-300 dark:hover:border-orange-400/40",
    },
    pink: {
      icon: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
      glow: "hover:border-pink-300 dark:hover:border-pink-400/40",
    },
    blue: {
      icon: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
      glow: "hover:border-blue-300 dark:hover:border-blue-400/40",
    },
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fafbff] text-slate-900 transition-colors duration-300 dark:bg-[#090b12] dark:text-white">

      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-2xl dark:border-white/[0.07] dark:bg-[#090b12]/90">
        <nav className="mx-auto flex h-[76px] max-w-[1450px] items-center justify-between px-5 sm:px-8 lg:px-12">

          <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Home size={23} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                MyHome <span className="text-indigo-600 dark:text-indigo-400">OS</span>
              </h1>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Smart Living Platform
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <a href="#home" className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">Home</a>
            <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">Features</a>
            <a href="#smart-tools" className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">Smart Tools</a>
            <a href="#about" className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">About</a>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link to="/login" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5">
              Login
            </Link>

            <Link to="/register" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-700">
              Get Started
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 dark:border-white/10 dark:text-white sm:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>

        {mobileMenu && (
          <div className="border-t border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#10131e] sm:hidden">
            <div className="flex flex-col gap-4">
              <a href="#home" onClick={closeMenu} className="text-sm font-medium">Home</a>
              <a href="#features" onClick={closeMenu} className="text-sm font-medium">Features</a>
              <a href="#smart-tools" onClick={closeMenu} className="text-sm font-medium">Smart Tools</a>
              <a href="#about" onClick={closeMenu} className="text-sm font-medium">About</a>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
                <Link to="/login" onClick={closeMenu} className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold dark:border-white/10">
                  Login
                </Link>
                <Link to="/register" onClick={closeMenu} className="rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white">
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>

        {/* ================= HERO ================= */}

        <section id="home" className="relative px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:px-12">
          <div className="pointer-events-none absolute -left-40 top-10 h-[450px] w-[450px] rounded-full bg-indigo-400/10 blur-[120px] dark:bg-indigo-600/15" />
          <div className="pointer-events-none absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-violet-400/10 blur-[120px] dark:bg-violet-600/15" />

          <div className="relative mx-auto grid max-w-[1350px] items-center gap-16 lg:grid-cols-[1fr_1.05fr]">

            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Sparkles size={14} />
                Your Home. Your Life. One Smart Platform.
              </div>

              <h2 className="max-w-2xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-[62px]">
                Everything Your Home Needs,
                <span className="mt-2 block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
                  In One Place.
                </span>
              </h2>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-400 sm:text-lg">
                Meet a smarter way to manage your home and everyday life.
                Organize assets, track maintenance, manage expenses,
                protect important documents and stay on top of everything.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="flex items-center justify-center gap-3 rounded-xl bg-indigo-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition hover:-translate-y-1 hover:bg-indigo-700">
                  Start Managing Your Home
                  <ArrowRight size={18} />
                </Link>

                <a href="#features" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-indigo-400/40 dark:hover:text-indigo-400">
                  Explore Features
                  <ChevronRight size={17} />
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-500" />All-in-one management</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-500" />Easy to use</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-500" />Smart organization</span>
              </div>
            </div>

            {/* Dashboard Preview */}

            <div className="relative mx-auto w-full max-w-[590px]">
              <div className="absolute -inset-5 rounded-[40px] bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-2xl" />

              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl shadow-indigo-950/10 dark:border-white/10 dark:bg-[#111522] dark:shadow-black/30 sm:p-6">

                <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <LayoutDashboard size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">MyHome Dashboard</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Your home overview</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    SMART SPACE
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Welcome to your smart space</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Your Home at a Glance</h3>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: Package, label: "Assets", value: "Manage", color: "indigo" },
                    { icon: FileText, label: "Documents", value: "Organize", color: "violet" },
                    { icon: Wrench, label: "Maintenance", value: "Track", color: "orange" },
                    { icon: Wallet, label: "Expenses", value: "Monitor", color: "emerald" },
                  ].map((item) => {
                    const Icon = item.icon;
                    const colors = {
                      indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
                      violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
                      orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
                      emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
                    };

                    return (
                      <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-white/[0.06] dark:bg-white/[0.035] sm:p-4">
                        <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${colors[item.color]}`}>
                          <Icon size={18} />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.label}</p>
                        <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">{item.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-100 p-4 dark:border-white/[0.07] sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Your Smart Tools</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Everything working together</p>
                    </div>
                    <Sparkles size={18} className="text-indigo-500" />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      { icon: Brain, name: "Second Brain", color: "violet" },
                      { icon: Radar, name: "Life Radar", color: "indigo" },
                      { icon: ClipboardCheck, name: "Life Auditor", color: "emerald" },
                      { icon: Bell, name: "Smart Alerts", color: "orange" },
                    ].map((item) => {
                      const Icon = item.icon;
                      const colors = {
                        violet: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400",
                        indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400",
                        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
                        orange: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400",
                      };

                      return (
                        <div key={item.name} className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors[item.color]}`}>
                            <Icon size={16} />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-500/[0.09]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <Zap size={19} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">One platform. More control.</p>
                    <p className="mt-1 text-[10px] text-indigo-700/80 dark:text-indigo-300/70">A smarter way to stay organized.</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-5 top-24 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#171c2b] sm:flex lg:-left-12">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold">Stay Protected</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Track your warranties</p>
                </div>
              </div>

              <div className="absolute -right-4 bottom-20 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#171c2b] sm:flex lg:-right-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold">Stay Organized</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Plan everyday tasks</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= INTRO STRIP ================= */}

        <section className="border-y border-slate-200/70 bg-white/70 py-9 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-5 text-center sm:grid-cols-4 sm:px-8">
            {[
              { icon: Home, title: "One Platform", desc: "For your entire home" },
              { icon: LockKeyhole, title: "Organized", desc: "Your information together" },
              { icon: Clock3, title: "Stay Ahead", desc: "Never miss important tasks" },
              { icon: Sparkles, title: "Smart Living", desc: "Simplify everyday life" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col items-center">
                  <Icon size={22} className="mb-3 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold">{item.title}</h3>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= FEATURES ================= */}

        <section id="features" className="px-5 py-24 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1250px]">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Everything in one place
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Your Home, <span className="text-indigo-600 dark:text-indigo-400">Under Control.</span>
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                From everyday management to important records,
                MyHome OS brings your household essentials into one
                simple and organized workspace.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                const style = colorStyles[feature.color];

                return (
                  <div key={feature.title} className={`group rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-950/[0.06] dark:border-white/[0.07] dark:bg-white/[0.025] dark:hover:shadow-black/20 ${style.glow}`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.icon}`}>
                      <Icon size={23} />
                    </div>

                    <h3 className="mt-6 text-lg font-bold">{feature.title}</h3>
                    <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>

                    <Link to="/register" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition-all group-hover:gap-3 dark:text-indigo-400">
                      Get Started
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= SMART TOOLS ================= */}

        <section id="smart-tools" className="relative overflow-hidden bg-[#f0f1ff] px-5 py-24 dark:bg-[#101322] sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-violet-400/15 blur-[100px]" />

          <div className="relative mx-auto max-w-[1250px]">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Beyond Home Management
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Meet Your <span className="text-indigo-600 dark:text-indigo-400">Smart Tools.</span>
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                More than a home management platform.
                Discover intelligent tools that help you stay aware,
                organized and in control.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {smartFeatures.map((feature) => {
                const Icon = feature.icon;
                const style = colorStyles[feature.color];

                return (
                  <div key={feature.title} className={`group flex flex-col gap-5 rounded-3xl border border-white/80 bg-white/80 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/[0.07] dark:bg-white/[0.035] sm:flex-row sm:p-8 ${style.glow}`}>
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
                      <Icon size={27} />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {feature.label}
                      </span>
                      <h3 className="mt-2 text-xl font-bold">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}

        <section id="about" className="px-5 py-24 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-2">

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Designed for everyday life
              </span>

              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Less Chaos.
                <span className="block text-indigo-600 dark:text-indigo-400">
                  More Clarity.
                </span>
              </h2>

              <p className="mt-6 text-sm leading-8 text-slate-600 dark:text-slate-400 sm:text-base">
                Managing a home involves many little responsibilities.
                Documents, maintenance, expenses, warranties, schedules
                and family needs can quickly become difficult to track.
              </p>

              <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-400 sm:text-base">
                MyHome OS brings these everyday essentials together
                in one organized platform, helping you manage your
                home with more clarity and confidence.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Keep important information organized",
                  "Manage everyday home responsibilities",
                  "Track important dates and reminders",
                  "Bring your household essentials together",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={19} className="shrink-0 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[35px] bg-gradient-to-br from-indigo-500/15 to-violet-500/15 blur-2xl" />

              <div className="relative rounded-[30px] border border-slate-200 bg-white p-7 shadow-xl dark:border-white/10 dark:bg-[#111522] sm:p-9">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                    <Home size={25} />
                  </div>
                  <Sparkles size={22} className="text-violet-500" />
                </div>

                <h3 className="mt-8 text-2xl font-extrabold">
                  A Smarter Way to Live.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Bring your home management, personal organization
                  and everyday planning into one simple experience.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    { icon: LayoutDashboard, title: "One organized dashboard", desc: "Your home overview in one place" },
                    { icon: CalendarDays, title: "Better everyday planning", desc: "Keep track of important tasks" },
                    { icon: BarChart3, title: "Clearer home insights", desc: "Understand your home at a glance" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 dark:border-white/[0.06]">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                          <Icon size={19} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">{item.title}</h4>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link to="/register" className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-indigo-700">
                  Create Your Account
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}

        <section className="px-5 pb-24 sm:px-8 lg:px-12">
          <div className="relative mx-auto max-w-[1250px] overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 px-7 py-16 text-center text-white shadow-2xl shadow-indigo-900/20 sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border-[45px] border-white/[0.07]" />
            <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full border-[50px] border-white/[0.07]" />

            <div className="relative mx-auto max-w-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <Sparkles size={27} />
              </div>

              <h2 className="mt-7 text-3xl font-extrabold leading-tight sm:text-4xl">
                Ready to Make Your Home Smarter?
              </h2>

              <p className="mt-5 text-sm leading-7 text-indigo-100 sm:text-base">
                Start bringing your home, responsibilities and everyday
                organization together with MyHome OS.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/register" className="flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-indigo-700 shadow-xl transition hover:-translate-y-1 hover:bg-indigo-50">
                  Get Started Today
                  <ArrowRight size={17} />
                </Link>

                <Link to="/login" className="flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/20">
                  Already a Member? Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className="relative overflow-hidden border-t border-white/10 bg-[#050505] px-5 py-12 text-white sm:px-8 lg:px-12">

        {/* Golden background glow */}
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1350px]">

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div className="group rounded-[28px] border border-white/10 bg-[#151515] p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-amber-500/10">

              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-lg shadow-amber-500/20">
                  <Home size={22} />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold">
                    MyHome <span className="text-amber-400">OS</span>
                  </h3>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Smart Living Platform
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-xs text-sm leading-7 text-slate-300">
                Your home, your responsibilities and your everyday
                life — organized in one smart platform.
              </p>

              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-400">
                <Heart size={14} className="text-rose-400" />
                Built for smarter homes
              </div>
            </div>

            {/* Explore */}
            <div className="group rounded-[28px] border border-white/10 bg-[#151515] p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-amber-500/10">

              <h4 className="text-xl font-bold text-amber-400">
                Explore
              </h4>

              <div className="mt-6 space-y-4">
                {[
                  ["Home", "#home"],
                  ["Features", "#features"],
                  ["Smart Tools", "#smart-tools"],
                  ["About", "#about"],
                ].map(([name, path]) => (
                  <a
                    key={name}
                    href={path}
                    className="flex items-center gap-3 text-sm text-slate-300 transition-all hover:translate-x-1 hover:text-amber-400"
                  >
                    <ArrowUpRight size={15} className="text-amber-400" />
                    {name}
                  </a>
                ))}
              </div>
            </div>

            {/* Workspace */}
            <div className="group rounded-[28px] border border-white/10 bg-[#151515] p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-amber-500/10">

              <h4 className="text-xl font-bold text-amber-400">
                Your Workspace
              </h4>

              <div className="mt-6 space-y-4">
                <Link to="/login" className="flex items-center gap-3 text-sm text-slate-300 transition hover:text-amber-400">
                  <LockKeyhole size={16} className="text-amber-400" />
                  Login
                </Link>

                <Link to="/register" className="flex items-center gap-3 text-sm text-slate-300 transition hover:text-amber-400">
                  <Users size={16} className="text-amber-400" />
                  Create Account
                </Link>
              </div>

              <div className="mt-7 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                  <ShieldCheck size={16} />
                  Your home, organized
                </div>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                  A simple space for a smarter everyday experience.
                </p>
              </div>
            </div>

            {/* Smart Living */}
            <div className="group rounded-[28px] border border-white/10 bg-[#151515] p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-amber-500/10">

              <h4 className="text-xl font-bold text-amber-400">
                Built for Smarter Living
              </h4>

              <p className="mt-6 text-sm leading-7 text-slate-300">
                One organized space for assets, maintenance,
                documents, expenses and smart everyday tools.
              </p>

              <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-slate-300">
                <Heart size={15} className="text-rose-400" />
                Made for better living
              </div>

              <Link to="/register" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-amber-400 transition-all hover:gap-3">
                Join MyHome OS
                <ArrowRight size={17} />
              </Link>
            </div>

          </div>

          {/* Footer Bottom */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-center sm:flex-row sm:text-left">

            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-white">MyHome OS</span>
              {" "} | All Rights Reserved
            </p>

            <p className="text-xs text-slate-400">
              Smart Home Management
              <span className="mx-2 text-amber-400">•</span>
              Made with care
            </p>

          </div>
        </div>
      </footer>

    </div>
  );
}

export default HomePage;

import {
  Home,
  LayoutDashboard,
  Package,
  FileText,
  ShieldCheck,
  Wrench,
  Receipt,
  Users,
  Bell,
  CalendarDays,
  BarChart3,
  Settings,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Heart,
} from "lucide-react";

function Footer() {
  const quickLinks = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Assets", path: "/assets", icon: Package },
    { name: "Documents", path: "/documents", icon: FileText },
    { name: "Warranties", path: "/warranties", icon: ShieldCheck },
    { name: "Maintenance", path: "/maintenance", icon: Wrench },
    { name: "Expenses", path: "/expenses", icon: Receipt },
    { name: "Family", path: "/family", icon: Users },
    { name: "Reminders", path: "/reminders", icon: Bell },
    { name: "Calendar", path: "/calendar", icon: CalendarDays },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <footer className="relative mt-12 overflow-hidden bg-[#050505] text-white">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1450px] px-5 py-14 sm:px-8 lg:px-10">
        {/* Top heading */}
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20">
            <Home size={26} />
          </div>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
            MyHome OS
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Your smart home management space for assets, maintenance,
            documents, expenses and everything that keeps your home organized.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {/* Brand */}
          <div className="group rounded-[28px] border border-white/10 bg-[#151515] p-7 shadow-2xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-amber-500/10">
            <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
              <Home size={23} />
            </div>

            <h3 className="text-2xl font-bold text-amber-400">
              MyHome OS
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Manage your home smarter. Keep your assets, family,
              maintenance, warranties, documents and expenses organized
              in one beautiful place.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Heart size={14} className="text-rose-400" />
              Built for smarter homes
            </div>
          </div>

          {/* Quick Links */}
          <div className="group rounded-[28px] border border-white/10 bg-[#151515] p-7 shadow-2xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-amber-500/10">
            <h3 className="text-xl font-bold text-amber-400">
              Quick Links
            </h3>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <a
                    key={link.name}
                    href={link.path}
                    className="group/link flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition-all duration-200 hover:bg-white/5 hover:text-white"
                  >
                    <Icon
                      size={14}
                      className="text-slate-500 transition-colors group-hover/link:text-amber-400"
                    />

                    <span>{link.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Home Management */}
          <div className="group rounded-[28px] border border-white/10 bg-[#151515] p-7 shadow-2xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-amber-500/10">
            <h3 className="text-xl font-bold text-amber-400">
              Home Management
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Package size={17} className="text-indigo-400" />
                <span>Manage your home assets</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Wrench size={17} className="text-indigo-400" />
                <span>Track maintenance & services</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck size={17} className="text-indigo-400" />
                <span>Never miss warranty expiry</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Receipt size={17} className="text-indigo-400" />
                <span>Keep expenses organized</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Users size={17} className="text-indigo-400" />
                <span>Manage your family members</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CalendarDays size={17} className="text-indigo-400" />
                <span>Plan important home events</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="group rounded-[28px] border border-white/10 bg-[#151515] p-7 shadow-2xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-amber-500/10">
            <h3 className="text-xl font-bold text-amber-400">
              Contact
            </h3>

            <div className="mt-6 space-y-5">
              <a
                href="mailto:support@myhomeos.com"
                className="flex items-start gap-3 text-sm text-slate-300 transition-colors hover:text-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Mail size={16} className="text-indigo-400" />
                </span>

                <span className="pt-2">kajalkumai9898@gmail.com</span>
              </a>

              <a
                href="tel:+919876543210"
                className="flex items-start gap-3 text-sm text-slate-300 transition-colors hover:text-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Phone size={16} className="text-indigo-400" />
                </span>

                <span className="pt-2">+91 7451965832</span>
              </a>

              <div className="flex items-start gap-3 text-sm text-slate-300">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <MapPin size={16} className="text-indigo-400" />
                </span>

                <span className="pt-2">Moradabad, India</span>
              </div>
            </div>

            {/* Contact buttons */}
            <div className="mt-7 flex gap-3">
              <a
                href="mailto:support@myhomeos.com"
                title="Email us"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400"
              >
                <Mail size={17} />
              </a>

              <a
                href="tel:+919876543210"
                title="Call us"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400"
              >
                <Phone size={17} />
              </a>

              <a
                href="/settings"
                title="Settings"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400"
              >
                <Settings size={17} />
              </a>

              <a
                href="/dashboard"
                title="Dashboard"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400"
              >
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-white/10 pt-7">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-slate-200">
                MyHome OS
              </span>{" "}
              | All Rights Reserved
            </p>

            <p className="text-xs text-slate-500">
              Smart Home Management • Made with care
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
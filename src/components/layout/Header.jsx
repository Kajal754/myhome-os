import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

function Header({ onMenuClick }) {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("myhome-theme") === "dark"
  );
  const [profilePhoto, setProfilePhoto] = useState(
    () => localStorage.getItem("myhome-photo") || ""
  );

  useEffect(() => {
    const updateProfilePhoto = () => {
      setProfilePhoto(localStorage.getItem("myhome-photo") || "");
    };

    window.addEventListener(
      "myhome-profile-photo-change",
      updateProfilePhoto
    );

    window.removeEventListener(
      "myhome-profile-photo-change",
      updateProfilePhoto
    );
  }, []);

  useEffect(() => {
    const applyTheme = (isDark) => {
      const html = document.documentElement;
      const body = document.body;
      const root = document.getElementById("root");

      html.classList.toggle("dark", isDark);
      body.classList.toggle("dark", isDark);
      if (root) root.classList.toggle("dark", isDark);

      html.style.backgroundColor = isDark ? "#020617" : "#f8fafc";
      body.style.backgroundColor = isDark ? "#020617" : "#f8fafc";
      body.style.color = isDark ? "#f8fafc" : "#0f172a";

      localStorage.setItem("myhome-theme", isDark ? "dark" : "light");
    };

    applyTheme(darkMode);
  }, [darkMode]);

  // Settings page can change the theme too.
  useEffect(() => {
    const handleThemeChange = (event) => {
      const nextTheme =
        event.detail ||
        (localStorage.getItem("myhome-theme") === "dark" ? "dark" : "light");

      setDarkMode(nextTheme === "dark");
    };

    window.addEventListener("myhome-theme-change", handleThemeChange);

    return () => {
      window.removeEventListener("myhome-theme-change", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const pages = [
    { name: "Dashboard", path: "/", keywords: ["dashboard", "home", "overview"] },
    { name: "Assets", path: "/assets", keywords: ["asset", "assets", "items", "inventory"] },
    { name: "Documents", path: "/documents", keywords: ["document", "documents", "file", "files"] },
    { name: "Warranties", path: "/warranties", keywords: ["warranty", "warranties", "guarantee"] },
    { name: "Maintenance", path: "/maintenance", keywords: ["maintenance", "repair", "repairs", "service"] },
    { name: "Expenses", path: "/expenses", keywords: ["expense", "expenses", "money", "payment", "payments"] },
    { name: "Service Providers", path: "/service-providers", keywords: ["service", "provider", "providers", "vendor", "vendors"] },
    { name: "Reminders", path: "/reminders", keywords: ["reminder", "reminders", "notification", "notifications"] },
    { name: "Settings", path: "/settings", keywords: ["setting", "settings", "account", "profile"] },
  ];

  const filteredPages = pages.filter((page) => {
    const value = search.trim().toLowerCase();
    if (!value) return false;

    return (
      page.name.toLowerCase().includes(value) ||
      page.keywords.some((keyword) => keyword.toLowerCase().includes(value))
    );
  });

  const openPage = (path) => {
    setSearch("");
    setShowSearch(false);
    window.location.href = path;
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      setSearch("");
      setShowSearch(false);
      return;
    }

    if (event.key === "Enter" && filteredPages.length > 0) {
      openPage(filteredPages[0].path);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-[76px] border-b border-slate-100 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex h-full items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 lg:hidden dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Menu size={19} />
        </button>

        <div ref={searchRef} className="relative w-full max-w-[450px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowSearch(true);
            }}
            onFocus={() => search.trim() && setShowSearch(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search assets, documents, warranties..."
            className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50/80 pl-11 pr-12 text-xs text-slate-700 outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900 dark:focus:ring-blue-950"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setShowSearch(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X size={15} />
            </button>
          )}

          {showSearch && search.trim() && (
            <div className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              {filteredPages.length > 0 ? (
                <div className="p-2">
                  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pages
                  </p>

                  {filteredPages.map((page) => (
                    <button
                      key={page.path}
                      type="button"
                      onClick={() => openPage(page.path)}
                      className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Search size={15} className="mr-3 text-blue-500" />
                      <span className="font-medium">{page.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <Search size={22} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No page found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Try Assets, Documents, Warranty, Maintenance or Reminders
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => openPage("/reminders")}
            title="Open Reminders"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
              3
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 dark:text-yellow-300 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <div className="mx-1 hidden h-7 w-px bg-slate-100 sm:block dark:bg-slate-800" />

          <button
            type="button"
            onClick={() => openPage("/settings")}
            className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Miss Kajal"
                className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-blue-300 text-xs font-bold text-slate-800">
                K
              </div>
            )}

            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Miss Kajal
              </p>
              <p className="text-[10px] text-slate-400">Home Owner</p>
            </div>

            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
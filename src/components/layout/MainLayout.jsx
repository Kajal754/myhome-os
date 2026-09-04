import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

function MainLayout({ children }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("myhome-theme");
    const isDark = savedTheme === "dark";

    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark", isDark);

    const root = document.getElementById("root");

    if (root) {
      root.classList.toggle("dark", isDark);
    }
  }, []);

  return (
    <div
      className="
        min-h-screen
        bg-[#f8fafc]
        text-slate-900
        transition-colors
        duration-200
        dark:bg-slate-950
        dark:text-slate-100
      "
    >
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar mobile />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileMenu(false)}
          />

          <div
            className="
              relative h-full w-[255px]
              bg-white shadow-2xl
              dark:bg-slate-900
            "
          >
            <button
              type="button"
              onClick={() => setMobileMenu(false)}
              className="
                absolute right-3 top-3 z-50
                flex h-8 w-8 items-center justify-center
                rounded-lg bg-slate-900 text-white
              "
            >
              <X size={16} />
            </button>

            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Website Area */}
      <div
        className="
          min-h-screen
          flex flex-col
          bg-[#f8fafc]
          transition-colors duration-200
          dark:bg-slate-950
          lg:ml-[255px]
        "
      >
        {/* Header */}
        <Header
          onMenuClick={() => setMobileMenu(true)}
        />

        {/* Page Content */}
        <main
          className="
            flex-1
            px-4 py-5
            sm:px-6 sm:py-7
            lg:px-8 lg:py-8
            dark:bg-slate-950
          "
        >
          <div className="mx-auto max-w-[1450px]">
            {children}
          </div>
        </main>

        {/* ⭐ GLOBAL FOOTER ⭐ */}
        <Footer />
      </div>
    </div>
  );
}

export default MainLayout;
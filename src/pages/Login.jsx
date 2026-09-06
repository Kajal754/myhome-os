import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("isLoggedIn", "true");

     console.log("LOGGED IN USER:", data.user);

localStorage.setItem(
  "myhomeUser",
  JSON.stringify(data.user)
);

      if (remember) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert("Server se connection nahi ho pa raha.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1eb] flex items-center justify-center px-4 py-8">

      {/* MAIN CARD */}
      <div className="w-full max-w-5xl bg-white rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(32,32,29,0.10)] grid lg:grid-cols-[0.88fr_1.12fr]">

        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <div className="hidden lg:flex relative overflow-hidden bg-[#20201d] text-white px-10 py-10 flex-col justify-between min-h-[600px]">

          {/* Decorative Glow */}
          <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-[#c9a86a]/15 blur-3xl" />

          <div className="absolute -bottom-40 -right-32 w-80 h-80 rounded-full bg-[#8c9b7b]/15 blur-3xl" />


          {/* LOGO */}
          <div className="relative z-10 flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center">
              <Home size={19} />
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                MyHome
              </h1>

              <p className="text-[9px] uppercase tracking-[0.25em] text-white/40">
                Home Management
              </p>
            </div>

          </div>


          {/* CENTER CONTENT */}
          <div className="relative z-10 max-w-sm">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-[11px] text-white/65 mb-6">

              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a86a]" />

              Your home, organized.

            </div>


            {/* Heading */}
            <h2 className="text-4xl xl:text-5xl font-light leading-[1.08] tracking-tight">

              Everything
              <br />

              <span className="text-[#d4b77c]">
                your home
              </span>

              <br />

              needs.

            </h2>


            {/* Description */}
            <p className="mt-6 text-white/45 leading-relaxed text-[13px] max-w-xs">

              Keep your assets, documents, maintenance,
              expenses and important reminders beautifully
              organized in one place.

            </p>


            {/* MINI CARDS */}
            <div className="flex gap-3 mt-7">

              {/* Card 1 */}
              <div className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10">

                <p className="text-lg font-semibold">
                  100%
                </p>

                <p className="text-[10px] text-white/35 mt-0.5">
                  Organized
                </p>

              </div>


              {/* Card 2 */}
              <div className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10">

                <p className="text-lg font-semibold">
                  24/7
                </p>

                <p className="text-[10px] text-white/35 mt-0.5">
                  Accessible
                </p>

              </div>

            </div>

          </div>


          {/* BOTTOM */}
          <div className="relative z-10 text-[10px] text-white/25">

            © 2026 MyHome. Your personal home management space.

          </div>

        </div>


        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <div className="flex items-center justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">

          <div className="w-full max-w-[390px]">


            {/* MOBILE LOGO */}
            <div className="lg:hidden flex items-center gap-3 mb-8">

              <div className="w-10 h-10 rounded-xl bg-[#20201d] text-white flex items-center justify-center">
                <Home size={19} />
              </div>

              <div>

                <h1 className="text-lg font-semibold">
                  MyHome
                </h1>

                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
                  Home Management
                </p>

              </div>

            </div>


            {/* ================================================= */}
            {/* HEADING */}
            {/* ================================================= */}

            <div className="mb-7">

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a78b55] mb-2.5">
                Welcome back
              </p>

              <h2 className="text-3xl sm:text-[34px] font-semibold text-[#20201d] tracking-tight leading-[1.08]">

                Sign in to
                <br />

                your home.

              </h2>

              <p className="text-[13px] text-gray-500 mt-3 leading-relaxed">

                Access your MyHome dashboard and keep everything organized.

              </p>

            </div>


            {/* ================================================= */}
            {/* GOOGLE BUTTON */}
            {/* ================================================= */}

            <button
              type="button"
              className="w-full h-11 rounded-xl border border-gray-200 flex items-center justify-center gap-3 text-[13px] font-medium text-[#20201d] hover:bg-[#fafaf8] hover:border-gray-300 transition"
            >

              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                G
              </div>

              Continue with Google

            </button>


            {/* ================================================= */}
            {/* DIVIDER */}
            {/* ================================================= */}

            <div className="flex items-center gap-3 my-6">

              <div className="h-px bg-gray-200 flex-1" />

              <span className="text-[9px] tracking-[0.12em] text-gray-400 whitespace-nowrap">
                OR CONTINUE WITH EMAIL
              </span>

              <div className="h-px bg-gray-200 flex-1" />

            </div>


            {/* ================================================= */}
            {/* LOGIN FORM */}
            {/* ================================================= */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >


              {/* EMAIL */}
              <div>

                <label className="block text-[13px] font-medium text-[#20201d] mb-1.5">
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    className="w-full h-11 pl-10.5 pr-4 rounded-xl border border-gray-200 bg-[#fafaf8] outline-none text-[13px] text-[#20201d] placeholder:text-gray-400 focus:border-[#a78b55] focus:ring-4 focus:ring-[#a78b55]/10 transition"
                  />

                </div>

              </div>


              {/* PASSWORD */}
              <div>

                <div className="flex items-center justify-between mb-1.5">

                  <label className="text-[13px] font-medium text-[#20201d]">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[11px] font-medium text-[#9a7d48] hover:underline"
                  >
                    Forgot password?
                  </button>

                </div>


                <div className="relative">

                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />


                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    className="w-full h-11 pl-10.5 pr-11 rounded-xl border border-gray-200 bg-[#fafaf8] outline-none text-[13px] text-[#20201d] placeholder:text-gray-400 focus:border-[#a78b55] focus:ring-4 focus:ring-[#a78b55]/10 transition"
                  />


                  {/* SHOW / HIDE PASSWORD */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#20201d] transition"
                  >

                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}

                  </button>

                </div>

              </div>


              {/* ================================================= */}
              {/* REMEMBER ME */}
              {/* ================================================= */}

              <label className="flex items-center gap-2.5 cursor-pointer select-none">

                <div
                  onClick={() =>
                    setRemember(!remember)
                  }
                  className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition ${
                    remember
                      ? "bg-[#20201d] border-[#20201d]"
                      : "border-gray-300"
                  }`}
                >

                  {remember && (
                    <Check
                      size={12}
                      className="text-white"
                    />
                  )}

                </div>

                <span className="text-[12px] text-gray-500">
                  Remember me
                </span>

              </label>


              {/* ================================================= */}
              {/* LOGIN BUTTON */}
              {/* ================================================= */}

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#20201d] text-white flex items-center justify-center gap-2.5 text-[13px] font-medium hover:bg-[#33332f] active:scale-[0.99] transition shadow-[0_8px_20px_rgba(32,32,29,0.14)]"
              >

                Sign in

                <ArrowRight size={17} />

              </button>

            </form>


            {/* ================================================= */}
            {/* REGISTER */}
            {/* ================================================= */}

            <div className="text-center mt-7">

              <p className="text-[12px] text-gray-500">

                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="font-semibold text-[#20201d] hover:text-[#a78b55] transition"
                >
                  Create an account
                </Link>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
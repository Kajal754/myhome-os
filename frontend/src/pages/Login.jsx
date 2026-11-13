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

async function readApiResponse(response) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    if (body.trimStart().startsWith("<!DOCTYPE") || body.trimStart().startsWith("<html")) {
      throw new Error("Password reset service is not deployed on the backend yet. Please try again after the backend is updated.");
    }
    throw new Error("The server returned an invalid response. Please try again later.");
  }
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "https://myhome-os-backend.vercel.app";

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthMessage("");
    setAuthError(false);
    try {
      const response = await fetch(`${apiBase}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Could not send reset email.");
      setAuthMessage(data.message);
      setOtpSent(true);
    } catch (error) {
      setAuthMessage(error.message || "Could not send reset email.");
      setAuthError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const otp = String(form.get("otp") || "");
    const newPassword = String(form.get("newPassword") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (newPassword.length < 8) {
      setAuthMessage("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setAuthMessage("");
    setAuthError(false);
    try {
      const response = await fetch(`${apiBase}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password: newPassword }),
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Could not reset password.");
      setResetComplete(true);
      setAuthMessage(data.message);
    } catch (error) {
      setAuthMessage(error.message || "Could not reset password.");
      setAuthError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${apiBase}/api/auth/login`,
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

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-[#f3f1eb] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-[0_20px_60px_rgba(32,32,29,0.10)] sm:p-10">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#20201d] text-white"><Home size={19} /></div>
            <div><h1 className="text-lg font-semibold">MyHome</h1><p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">Home Management</p></div>
          </div>

          <h2 className="text-2xl font-semibold text-[#20201d]">
            {otpSent ? "Verify code and reset password" : "Forgot your password?"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {otpSent ? `Enter the 6-digit code sent to ${email}, then choose a new password.` : "Enter your account email and we’ll send you a password reset code."}
          </p>

          {resetComplete ? (
            <div className="mt-6 space-y-5">
              <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{authMessage}</p>
              <button type="button" onClick={() => { setIsForgotPassword(false); setOtpSent(false); setAuthMessage(""); }} className="w-full rounded-xl bg-[#20201d] py-3 text-sm font-medium text-white">Return to sign in</button>
            </div>
          ) : otpSent ? (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-[#20201d]">Email verification code
                <input name="otp" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-[#fafaf8] px-3 text-sm tracking-[0.25em] outline-none focus:border-[#a78b55]" />
              </label>
              <label className="block text-sm font-medium text-[#20201d]">New password
                <input name="newPassword" type="password" minLength={8} required autoComplete="new-password" className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-[#fafaf8] px-3 text-sm outline-none focus:border-[#a78b55]" />
              </label>
              <label className="block text-sm font-medium text-[#20201d]">Confirm new password
                <input name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-[#fafaf8] px-3 text-sm outline-none focus:border-[#a78b55]" />
              </label>
              {authMessage && <p role={authError ? "alert" : "status"} className={`text-sm ${authError ? "text-red-600" : "text-[#5b684f]"}`}>{authMessage}</p>}
              <button disabled={isSubmitting} type="submit" className="w-full rounded-xl bg-[#20201d] py-3 text-sm font-medium text-white disabled:opacity-60">{isSubmitting ? "Saving..." : "Reset password"}</button>
              <button type="button" onClick={() => { setOtpSent(false); setAuthMessage(""); }} className="w-full text-sm font-medium text-[#9a7d48] hover:underline">Send another code</button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-[#20201d]">Email address
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-[#fafaf8] px-3 text-sm outline-none focus:border-[#a78b55]" />
              </label>
              {authMessage && <p role={authError ? "alert" : "status"} className={`text-sm ${authError ? "text-red-600" : "text-[#5b684f]"}`}>{authMessage}</p>}
              <button disabled={isSubmitting} type="submit" className="w-full rounded-xl bg-[#20201d] py-3 text-sm font-medium text-white disabled:opacity-60">{isSubmitting ? "Sending..." : "Send OTP"}</button>
            </form>
          )}

          {!resetComplete && <button type="button" onClick={() => { setIsForgotPassword(false); setOtpSent(false); setAuthMessage(""); }} className="mt-5 text-sm font-medium text-[#9a7d48] hover:underline">Back to sign in</button>}
        </div>
      </div>
    );
  }

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
                    onClick={() => { setIsForgotPassword(true); setAuthMessage(""); }}
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

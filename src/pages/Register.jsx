import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [gender, setGender] = useState("");

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  const otpRefs = useRef([]);

  const navigate = useNavigate();

  // ============================
  // SEND OTP
  // ============================

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!name || !email || !password) {
      setMessage("Name, email and password are required");
      return;
    }
    if (!gender) {
  setMessage("Please select Male or Female.");
  return;
}

    if (password !== confirmPassword) {
      setMessage("Passwords doesnot match.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password minimum 8 characters ka hona chahiye.");
      return;
    }

    try {
      setSendingOtp(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            gender,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "OTP send nahi hua.");
        return;
      }

      setMessage("OTP aapke email par bhej diya gaya.");
      setShowOtp(true);

    } catch (error) {
      console.error(error);
      setMessage("Backend se connection nahi ho raha.");
    } finally {
      setSendingOtp(false);
    }
  };


  // ============================
  // OTP INPUT
  // ============================

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };


  const handleOtpKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }
  };


  // ============================
  // VERIFY OTP
  // ============================

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setMessage("Please 6 digit OTP enter karein.");
      return;
    }

    try {
      setVerifyingOtp(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            gender,
            otp: enteredOtp,

          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP.");
      }

      alert("Email verified successfully!");

      navigate("/login");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setVerifyingOtp(false);
    }
  };


  // ============================
  // RESEND OTP
  // ============================

  const handleResendOtp = async () => {
    try {
      setResending(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP resend nahi hua.");
      }

      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();

      setMessage("New OTP email par bhej diya gaya.");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setResending(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#f3f1eb] flex items-center justify-center px-4 py-7">

      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="absolute w-[420px] h-[420px] rounded-full bg-[#d7c59d]/20 blur-3xl -top-40 -left-40 pointer-events-none" />

      <div className="absolute w-[380px] h-[380px] rounded-full bg-[#b7c8b3]/25 blur-3xl -bottom-40 -right-32 pointer-events-none" />


      {/* ================================================= */}
      {/* MAIN CARD */}
      {/* ================================================= */}

      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(32,32,29,0.10)] grid lg:grid-cols-[0.88fr_1.12fr]">


        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <div className="hidden lg:block relative overflow-hidden bg-[#dfe6dc] px-10 py-9 min-h-[610px]">

          {/* Decorative Circle */}
          <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full border-[45px] border-white/40" />

          <div className="absolute -left-20 bottom-5 w-52 h-52 rounded-full bg-[#c8b37d]/15 blur-3xl" />


          {/* LOGO */}
          <div className="relative z-10 flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-[#20201d] text-white flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105">

              <Home size={18} />

            </div>

            <div>

              <h1 className="font-semibold text-[#20201d] text-lg">
                MyHome
              </h1>

              <p className="text-[8px] uppercase tracking-[0.25em] text-[#687064]">
                Home Management
              </p>

            </div>

          </div>


          {/* INTRO */}
          <div className="relative z-10 mt-20">

            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur px-3 py-1.5 rounded-full text-[10px] text-[#5d6759] mb-5 shadow-sm">

              <Sparkles size={12} />

              Welcome to MyHome

            </div>


            <h2 className="text-4xl xl:text-5xl font-light leading-[1.06] tracking-tight text-[#20201d]">

              Make your
              <br />

              <span className="italic font-serif text-[#8c7445]">
                home life
              </span>

              <br />

              simpler.

            </h2>


            <p className="mt-6 text-[12px] leading-6 text-[#657064] max-w-xs">

              Create your account and bring your home's
              important information, documents, expenses
              and maintenance into one peaceful space.

            </p>

          </div>


          {/* FLOATING CARD */}
          <div className="absolute bottom-8 left-10 bg-white/80 backdrop-blur-xl border border-white rounded-xl p-3.5 shadow-[0_12px_30px_rgba(50,55,45,0.10)] w-[205px] transition-all duration-300 hover:-translate-y-1">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-[#edf2ea] flex items-center justify-center text-[#687b64]">

                <ShieldCheck size={17} />

              </div>

              <div>

                <p className="text-[13px] font-semibold text-[#20201d]">
                  Your space
                </p>

                <p className="text-[10px] text-gray-500">
                  Safe & organized
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <div className="bg-white flex items-center px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-9">

          <div className="w-full max-w-[390px] mx-auto">


            {!showOtp ? (

              <>
                {/* ================================================= */}
                {/* REGISTER FORM */}
                {/* ================================================= */}

                <div className="mb-6">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a0844e] mb-2">

                    Create account

                  </p>


                  <h2 className="text-3xl sm:text-[32px] font-semibold text-[#20201d] tracking-tight leading-[1.08]">

                    Let's get
                    <br />

                    you settled in.

                  </h2>


                  <p className="text-[12px] text-gray-500 mt-2.5 leading-relaxed">

                    It only takes a minute to create your MyHome account.

                  </p>

                </div>


                {/* FORM */}

                <form
                  onSubmit={handleRegister}
                  className="space-y-3.5"
                >


                  {/* NAME */}

                  <div className="group">

                    <label className="text-[12px] font-medium text-[#30322e] block mb-1.5">

                      Your name

                    </label>


                    <div className="relative">

                      <User
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#a0844e]"
                      />

                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Kajal Sagar"
                        required
                        className="w-full h-10.5 pl-10 pr-4 rounded-xl bg-[#fafaf8] border border-gray-200 outline-none text-[12px] transition-all duration-300 hover:bg-white focus:bg-white focus:border-[#b39a68] focus:ring-4 focus:ring-[#b39a68]/10"
                      />

                    </div>

                  </div>
                  <div>
  <label className="block text-[13px] font-medium text-[#20201d] mb-2">
    Gender
  </label>

  <div className="grid grid-cols-2 gap-3">

    <button
      type="button"
      onClick={() => setGender("male")}
      className={`h-11 rounded-xl border text-[13px] font-medium transition ${
        gender === "male"
          ? "bg-[#20201d] text-white border-[#20201d]"
          : "bg-[#fafaf8] text-gray-600 border-gray-200 hover:border-[#a78b55]"
      }`}
    >
      Male
    </button>

    <button
      type="button"
      onClick={() => setGender("female")}
      className={`h-11 rounded-xl border text-[13px] font-medium transition ${
        gender === "female"
          ? "bg-[#20201d] text-white border-[#20201d]"
          : "bg-[#fafaf8] text-gray-600 border-gray-200 hover:border-[#a78b55]"
      }`}
    >
      Female
    </button>

  </div>
</div>


                  {/* EMAIL */}

                  <div className="group">

                    <label className="text-[12px] font-medium text-[#30322e] block mb-1.5">

                      Email address

                    </label>


                    <div className="relative">

                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#a0844e]"
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full h-10.5 pl-10 pr-4 rounded-xl bg-[#fafaf8] border border-gray-200 outline-none text-[12px] transition-all duration-300 hover:bg-white focus:bg-white focus:border-[#b39a68] focus:ring-4 focus:ring-[#b39a68]/10"
                      />

                    </div>

                  </div>


                  {/* PASSWORD */}

                  <div className="group">

                    <label className="text-[12px] font-medium text-[#30322e] block mb-1.5">

                      Create password

                    </label>


                    <div className="relative">

                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />


                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        className="w-full h-10.5 pl-10 pr-10 rounded-xl bg-[#fafaf8] border border-gray-200 outline-none text-[12px] transition-all duration-300 hover:bg-white focus:bg-white focus:border-[#b39a68] focus:ring-4 focus:ring-[#b39a68]/10"
                      />


                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#20201d]"
                      >

                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}

                      </button>

                    </div>

                  </div>


                  {/* CONFIRM PASSWORD */}

                  <div className="group">

                    <label className="text-[12px] font-medium text-[#30322e] block mb-1.5">

                      Confirm password

                    </label>


                    <div className="relative">

                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />


                      <input
                        type={
                          showConfirm
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        placeholder="Repeat your password"
                        required
                        className="w-full h-10.5 pl-10 pr-10 rounded-xl bg-[#fafaf8] border border-gray-200 outline-none text-[12px] transition-all duration-300 hover:bg-white focus:bg-white focus:border-[#b39a68] focus:ring-4 focus:ring-[#b39a68]/10"
                      />


                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirm(!showConfirm)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#20201d]"
                      >

                        {showConfirm ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}

                      </button>

                    </div>

                  </div>


                  {/* BENEFITS */}

                  <div className="flex items-center gap-4 py-1">

                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">

                      <CheckCircle2
                        size={13}
                        className="text-[#819279]"
                      />

                      Free account

                    </div>


                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">

                      <CheckCircle2
                        size={13}
                        className="text-[#819279]"
                      />

                      Private space

                    </div>

                  </div>


                  {/* MESSAGE */}

                  {message && (

                    <div className="text-[12px] text-center text-[#8c7445] bg-[#faf7ef] rounded-xl px-3 py-2.5">

                      {message}

                    </div>

                  )}


                  {/* BUTTON */}

                  <button
                    type="submit"
                    disabled={sendingOtp}
                    className="group w-full h-11 rounded-xl bg-[#20201d] text-white flex items-center justify-center gap-2.5 text-[12px] font-medium transition-all duration-300 hover:bg-[#35352f] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(32,32,29,0.18)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >

                    {sendingOtp
                      ? "Sending OTP..."
                      : "Continue with email"
                    }


                    {!sendingOtp && (

                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />

                    )}

                  </button>

                </form>


                {/* LOGIN LINK */}

                <div className="text-center mt-6">

                  <p className="text-[12px] text-gray-500">

                    Already part of MyHome?{" "}

                    <Link
                      to="/login"
                      className="font-semibold text-[#20201d] hover:text-[#a0844e]"
                    >

                      Sign in

                    </Link>

                  </p>

                </div>

              </>

            ) : (

              /* ================================================= */
              /* OTP SCREEN */
              /* ================================================= */

              <div className="text-center">

                {/* BACK */}

                <button
                  onClick={() => {
                    setShowOtp(false);
                    setMessage("");
                  }}
                  className="flex items-center gap-2 text-[12px] text-gray-500 hover:text-[#20201d] transition mb-6"
                >

                  <ArrowLeft size={15} />

                  Back to registration

                </button>


                {/* MAIL ICON */}

                <div className="mx-auto w-14 h-14 rounded-xl bg-[#edf2ea] flex items-center justify-center mb-5 shadow-sm">

                  <Mail
                    size={24}
                    className="text-[#71816d]"
                  />

                </div>


                {/* TITLE */}

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a0844e] mb-2">

                  Verify your email

                </p>


                <h2 className="text-2xl font-semibold text-[#20201d]">

                  Check your inbox

                </h2>


                <p className="text-[12px] text-gray-500 mt-2.5 leading-5">

                  We've sent a 6-digit verification code to
                  <br />

                  <span className="font-semibold text-[#20201d]">
                    {email}
                  </span>

                </p>


                {/* OTP BOXES */}

                <div className="flex justify-center gap-1.5 sm:gap-2.5 mt-6">

                  {otp.map((digit, index) => (

                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(
                          e.target.value,
                          index
                        )
                      }
                      onKeyDown={(e) =>
                        handleOtpKeyDown(e, index)
                      }
                      className="w-9 h-11 sm:w-10 sm:h-12 text-center text-lg font-semibold rounded-lg border border-gray-200 bg-[#fafaf8] outline-none transition-all duration-300 hover:border-gray-300 focus:bg-white focus:border-[#a0844e] focus:ring-4 focus:ring-[#a0844e]/10"
                    />

                  ))}

                </div>


                {/* MESSAGE */}

                {message && (

                  <div className="mt-4 text-[12px] text-[#8c7445] bg-[#faf7ef] rounded-xl px-3 py-2.5">

                    {message}

                  </div>

                )}


                {/* VERIFY BUTTON */}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp}
                  className="group w-full h-11 mt-6 rounded-xl bg-[#20201d] text-white text-[12px] font-medium flex items-center justify-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#35352f] hover:shadow-[0_14px_28px_rgba(32,32,29,0.18)] disabled:opacity-60"
                >

                  {verifyingOtp
                    ? "Verifying..."
                    : "Verify email"
                  }


                  {!verifyingOtp && (

                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />

                  )}

                </button>


                {/* RESEND */}

                <div className="mt-6">

                  <p className="text-[12px] text-gray-500">
                    Didn't receive the code?
                  </p>


                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="mt-1.5 inline-flex items-center gap-2 text-[12px] font-semibold text-[#a0844e] hover:underline disabled:opacity-50"
                  >

                    <RefreshCw
                      size={14}
                      className={
                        resending
                          ? "animate-spin"
                          : ""
                      }
                    />

                    {resending
                      ? "Sending..."
                      : "Resend OTP"
                    }

                  </button>

                </div>


                {/* SECURITY */}

                <p className="text-[10px] text-gray-400 mt-6 flex items-center justify-center gap-1.5">

                  <ShieldCheck size={13} />

                  Your email verification is secure

                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}
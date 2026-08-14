import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const isFromSettings = location?.state?.fromSettings ?? false;

  /* ✅ CHECK SESSION / RESET MODE */
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data?.session) {
        setStep(3);
      }
    };

    checkSession();
  }, []);

  /* ✅ COOLDOWN TIMER */
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  /* ✅ BODY LOCK */
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  /* ✅ SEND EMAIL */
  const handleSendEmail = async () => {
    if (cooldown > 0 || loading) return;

    if (!email || !email.includes("@")) {
      setStatus("invalidEmail");
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message?.toLowerCase().includes("rate")) {
          setStatus("rate");
        } else {
          setStatus("error");
        }

        return;
      }

      setStatus("emailSent");
      setCooldown(60);
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  /* ✅ UPDATE PASSWORD */
  const handleReset = async () => {
    if (loading) return;

    if (password.length < 6) {
      setStatus("short");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("mismatch");
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setStatus("error");
        return;
      }

      setStatus("done");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f7fb] px-4">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_30%)]" />

      {/* BACK BUTTON */}
      <button
        onClick={() => {
          if (isFromSettings) {
            navigate("/settings");
          } else if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate("/");
          }
        }}
        className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-black"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${step}-${status}`}
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.96,
            y: 18,
            transition: {
              duration: 0.2,
            },
          }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border border-white/40 bg-white/90 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
        >
          {/* TOP GLOW */}
          <div className="absolute right-[-60px] top-[-60px] h-[180px] w-[180px] rounded-full bg-orange-200/40 blur-3xl" />

          {/* SUCCESS */}
          {status === "done" ? (
            <div className="relative z-10 py-6 text-center">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-5 text-6xl"
              >
                🎉
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800">
                Password Updated
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              {/* ICON */}
              <div className="relative z-10 mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gradient-to-br from-white to-gray-100 shadow-inner">
                  <Lock className="text-gray-600" size={28} />
                </div>
              </div>

              {/* TITLE */}
              <div className="relative z-10 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-800">
                  {step === 1
                    ? isFromSettings
                      ? "Change Password"
                      : "Forgot Password"
                    : "Create New Password"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {step === 1 &&
                    "Enter your email and we’ll send you a reset link."}

                  {step === 3 &&
                    "Create a strong new password for your account."}
                </p>
              </div>

              {/* STEP 1 */}
              {step === 1 && (
                <div className="relative z-10 mt-8">
                  {status === "emailSent" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <div className="mb-4 text-5xl">📩</div>

                      <h3 className="text-xl font-semibold text-gray-800">
                        Check your email
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        We’ve sent a reset link to
                        <br />
                        <span className="font-semibold text-gray-700">
                          {email}
                        </span>
                      </p>

                      <button
                        onClick={handleSendEmail}
                        disabled={cooldown > 0 || loading}
                        className="mt-6 text-sm font-medium text-orange-600 transition hover:text-orange-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : "Resend Email"}
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      {/* EMAIL */}
                      <div className="relative">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />

                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="hello@example.com"
                          autoComplete="email"
                          className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-3.5 text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        />
                      </div>

                      {/* ERRORS */}
                      <AnimatePresence mode="wait">
                        {status === "invalidEmail" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 text-sm text-red-500"
                          >
                            Please enter a valid email address.
                          </motion.p>
                        )}

                        {status === "rate" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 text-sm text-red-500"
                          >
                            Too many requests. Please wait and try again.
                          </motion.p>
                        )}

                        {status === "error" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 text-sm text-red-500"
                          >
                            Something went wrong. Please try again.
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* BUTTON */}
                      <button
                        onClick={handleSendEmail}
                        disabled={loading}
                        className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gray-900 py-3.5 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          "Send Reset Link"
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="relative z-10 mt-8">
                  {/* PASSWORD */}
                  <div className="relative mb-4">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="New Password"
                      autoComplete="new-password"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-3.5 text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  {/* CONFIRM */}
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-3.5 text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  {/* ERRORS */}
                  <AnimatePresence mode="wait">
                    {status === "mismatch" && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-sm text-red-500"
                      >
                        Passwords do not match.
                      </motion.p>
                    )}

                    {status === "short" && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-sm text-red-500"
                      >
                        Password must be at least 6 characters.
                      </motion.p>
                    )}

                    {status === "error" && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-sm text-red-500"
                      >
                        Failed to update password.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* BUTTON */}
                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gray-900 py-3.5 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
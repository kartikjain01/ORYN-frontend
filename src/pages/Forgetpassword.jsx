import { Mail, Lock, Loader2, ArrowLeft, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // =========================================================
  // DETERMINE SOURCE
  // =========================================================

  const searchParams = new URLSearchParams(location.search);

  const isFromSettings =
    location?.state?.fromSettings === true ||
    searchParams.get('from') === 'settings';

  /*
   * Normal forgot-password flow:
   *
   * /forgot-password
   *       ↓
   * /reset-password
   *       ↓
   * /register?mode=login
   *
   * Settings change-password flow:
   *
   * /forgot-password?from=settings
   *       ↓
   * /reset-password?from=settings
   *       ↓
   * /settings
   */

  const returnPath = isFromSettings ? '/settings' : '/register?mode=login';

  // =========================================================
  // PASSWORD RECOVERY EVENT
  // =========================================================

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase Auth Event:', event);

      if (event === 'PASSWORD_RECOVERY' && session) {
        setStep(3);
        setStatus(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =========================================================
  // CHECK RECOVERY SESSION
  // =========================================================

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Recovery session error:', error);
          return;
        }

        if (data?.session) {
          setStep(3);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    checkSession();
  }, []);

  // =========================================================
  // EMAIL COOLDOWN
  // =========================================================

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  // =========================================================
  // LOCK BODY SCROLL
  // =========================================================

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // =========================================================
  // SEND RESET EMAIL
  // =========================================================

  const handleSendEmail = async () => {
    if (cooldown > 0 || loading) return;

    if (!email || !email.includes('@')) {
      setStatus('invalidEmail');
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      /*
       * Normal flow:
       * https://orynengine.com/reset-password
       *
       * Settings flow:
       * https://orynengine.com/reset-password?from=settings
       *
       * The query parameter survives the email redirect.
       */

      const redirectUrl = isFromSettings
        ? `${window.location.origin}/reset-password?from=settings`
        : `${window.location.origin}/reset-password`;

      console.log('Password reset redirect:', redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: redirectUrl,
        }
      );

      if (error) {
        console.error('Password reset error:', error);

        setStatus(
          error.message?.toLowerCase().includes('rate') ? 'rate' : 'error'
        );

        return;
      }

      setStatus('emailSent');
      setCooldown(60);
    } catch (error) {
      console.error('Password reset exception:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UPDATE PASSWORD
  // =========================================================

  const handleReset = async () => {
    if (loading) return;

    if (password.length < 6) {
      setStatus('short');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('mismatch');
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      // -------------------------------------------------------
      // UPDATE PASSWORD
      // -------------------------------------------------------

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error('Password update error:', error);
        setStatus('error');
        setLoading(false);
        return;
      }

      // -------------------------------------------------------
      // PASSWORD UPDATED
      // -------------------------------------------------------

      setStatus('done');

      if (isFromSettings) {
        setTimeout(() => {
          navigate('/settings');
        }, 1200);
      } else {
        supabase.auth.signOut().catch(error => {
          console.error('Sign out after password reset:', error);
        });

        setTimeout(() => {
          window.location.replace('/register?mode=login');
        }, 1200);
      }
    } catch (error) {
      console.error('Password update exception:', error);

      setStatus('error');
      setLoading(false);
    }
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    if (isFromSettings) {
      navigate('/settings');
      return;
    }

    navigate('/register?mode=login');
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{
        background:
          'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)',
      }}
    >
      {/* Decorative orbs */}

      <div className="pointer-events-none absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-300/20 blur-[80px] animate-breathe" />

      <div
        className="pointer-events-none absolute bottom-0 left-[10%] w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-200/25 to-indigo-200/15 blur-[70px] animate-breathe"
        style={{ animationDelay: '1.5s' }}
      />

      {/* Back */}

      <button
        onClick={handleBack}
        className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 backdrop-blur-xl px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition hover:shadow-[0_4px_12px_rgba(37,99,235,0.1)] hover:-translate-y-0.5"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${step}-${status}`}
          initial={{
            opacity: 0,
            scale: 0.96,
            y: 18,
          }}
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
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
        >
          {/* Accent */}

          <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />

          {/* =================================================
              SUCCESS
          ================================================== */}

          {status === 'done' ? (
            <div className="relative z-10 py-6 text-center">
              <motion.div
                initial={{
                  scale: 0.7,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                className="mx-auto mb-5 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center"
              >
                <svg
                  className="w-8 h-8 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>

              <h2 className="text-2xl font-bold text-slate-900">
                Password Updated
              </h2>

              <p className="mt-2 text-[13px] text-slate-500">
                Redirecting to {isFromSettings ? 'settings' : 'login'}...
              </p>
            </div>
          ) : (
            <>
              {/* Icon */}

              <div className="relative z-10 mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                  <Shield className="text-blue-600" size={26} />
                </div>
              </div>

              {/* Title */}

              <div className="relative z-10 text-center">
                <h2 className="text-[24px] font-bold tracking-tight text-slate-900">
                  {step === 1
                    ? isFromSettings
                      ? 'Change Password'
                      : 'Forgot Password'
                    : 'Create New Password'}
                </h2>

                <p className="mt-2 text-[13px] leading-6 text-slate-500">
                  {step === 1 &&
                    "Enter your email and we'll send you a reset link."}

                  {step === 3 &&
                    'Create a strong new password for your account.'}
                </p>
              </div>

              {/* =================================================
                  STEP 1
              ================================================== */}

              {step === 1 && (
                <div className="relative z-10 mt-7">
                  {status === 'emailSent' ? (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="text-center"
                    >
                      <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Mail size={24} className="text-blue-500" />
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900">
                        Check your email
                      </h3>

                      <p className="mt-2 text-[13px] leading-6 text-slate-500">
                        We've sent a reset link to
                        <br />
                        <span className="font-semibold text-slate-700">
                          {email}
                        </span>
                      </p>

                      <button
                        onClick={handleSendEmail}
                        disabled={cooldown > 0 || loading}
                        className="mt-5 text-[13px] font-medium text-blue-600 transition hover:text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : 'Resend Email'}
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="relative">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />

                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="hello@example.com"
                          autoComplete="email"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-[14px] text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                        />
                      </div>

                      <AnimatePresence mode="wait">
                        {status === 'invalidEmail' && (
                          <motion.p
                            initial={{
                              opacity: 0,
                              y: -4,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                            }}
                            className="mt-3 text-[12px] text-red-500"
                          >
                            Please enter a valid email address.
                          </motion.p>
                        )}

                        {status === 'rate' && (
                          <motion.p
                            initial={{
                              opacity: 0,
                              y: -4,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                            }}
                            className="mt-3 text-[12px] text-red-500"
                          >
                            Too many requests. Please wait and try again.
                          </motion.p>
                        )}

                        {status === 'error' && (
                          <motion.p
                            initial={{
                              opacity: 0,
                              y: -4,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                            }}
                            className="mt-3 text-[12px] text-red-500"
                          >
                            Something went wrong. Please try again.
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={handleSendEmail}
                        disabled={loading}
                        className="mt-5 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* =================================================
                  STEP 3
              ================================================== */}

              {step === 3 && (
                <div className="relative z-10 mt-7">
                  <div className="relative mb-3.5">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="New Password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-[14px] text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                    />
                  </div>

                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-[14px] text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {status === 'mismatch' && (
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: -4,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="mt-3 text-[12px] text-red-500"
                      >
                        Passwords do not match.
                      </motion.p>
                    )}

                    {status === 'short' && (
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: -4,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="mt-3 text-[12px] text-red-500"
                      >
                        Password must be at least 6 characters.
                      </motion.p>
                    )}

                    {status === 'error' && (
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: -4,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="mt-3 text-[12px] text-red-500"
                      >
                        Failed to update password.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="mt-5 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      'Update Password'
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

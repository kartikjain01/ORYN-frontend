import { Mail, Lock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from '../supabaseClient';

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

  const isFromSettings = location?.state?.fromSettings ?? false;

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setStep(3);
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendEmail = async () => {
    if (cooldown > 0) return; // ⛔ block spam

    if (!email || !email.includes('@')) {
      setStatus('invalidEmail');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password',
    });

    setLoading(false);

    if (error) {
      if (error.message?.includes('rate')) {
        setStatus('rate');
      } else {
        setStatus('error');
      }
    } else {
      setStatus('emailSent');
      setCooldown(60); // 🔥 freeze for 60 sec
    }
  };

  const handleReset = async () => {
    if (password.length < 6) return setStatus('short');
    if (password !== confirmPassword) return setStatus('mismatch');

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setStatus('error');
    } else {
      setStatus('done');
      setTimeout(() => navigate('/login'), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4 relative">
      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => {
          if (isFromSettings) {
            navigate('/settings');
          } else if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
        className="absolute top-6 left-6 text-sm text-gray-600 hover:text-black flex items-center gap-1"
      >
        ← Back
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step + status}
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white rounded-3xl p-8
          shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
        >
          {/* TITLE */}
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            {isFromSettings ? 'Change Password' : 'Forgot Password'}
          </h2>

          {/* SUCCESS SCREEN */}
          {status === 'done' ? (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold text-gray-800">
                Password Updated!
              </h2>
              <p className="text-gray-500 text-sm mt-2">Redirecting...</p>
            </div>
          ) : (
            <>
              {/* ICON */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-16 h-16 flex items-center justify-center
                rounded-full bg-gray-100 shadow-inner"
                >
                  <Lock className="text-gray-500" size={22} />
                </div>
              </div>

              {/* TITLE */}
              <h2 className="text-2xl font-semibold text-center text-gray-800">
                {step === 1 && 'Reset Password'}
                {step === 3 && 'Create New Password'}
              </h2>

              <p className="text-center text-gray-500 text-sm mt-1 mb-7">
                {step === 1 && 'Enter your email to reset your password.'}
                {step === 3 && 'Enter and confirm your new password.'}
              </p>

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  {status === 'emailSent' ? (
                    <div className="text-center">
                      <div className="text-5xl mb-4">📩</div>

                      <h2 className="text-xl font-semibold text-gray-800">
                        Check your email
                      </h2>

                      <p className="text-gray-500 text-sm mt-2">
                        We’ve sent a password reset link to <b>{email}</b>
                      </p>

                      <button
                        onClick={handleSendEmail}
                        disabled={cooldown > 0 || loading}
                        className="mt-5 text-sm text-blue-600 hover:underline disabled:opacity-50"
                      >
                        {cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : 'Resend Email'}
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* ORIGINAL FORM */}
                      <div className="relative mb-3">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="hello@example.com"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300
            placeholder-gray-400
            focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />
                      </div>

                      {status === 'invalidEmail' && (
                        <p className="text-red-500 text-sm mb-4">
                          Enter valid email
                        </p>
                      )}

                      {status === 'rate' && (
                        <p className="text-red-500 text-sm mb-4">
                          Too many requests. Please wait.
                        </p>
                      )}

                      <button
                        onClick={handleSendEmail}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gray-800 text-white flex justify-center items-center disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </>
                  )}
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <input
                    type="password"
                    placeholder="New Password"
                    onChange={e => setPassword(e.target.value)}
                    className="w-full mb-3 px-4 py-3 rounded-xl
                        border border-gray-300
                        bg-white text-gray-800 placeholder-gray-400
                        focus:outline-none focus:border-orange-500
                        focus:ring-2 focus:ring-orange-100"
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl
                        border border-gray-300
                        bg-white text-gray-800 placeholder-gray-400
                        focus:outline-none focus:border-orange-500
                        focus:ring-2 focus:ring-orange-100"
                  />

                  <button
                    onClick={handleReset}
                    className="w-full mt-4 py-3 rounded-xl bg-gray-800 text-white flex justify-center"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      'Update Password'
                    )}
                  </button>

                  {status === 'mismatch' && (
                    <p className="text-red-500 text-sm mt-2">
                      Passwords do not match
                    </p>
                  )}

                  {status === 'short' && (
                    <p className="text-red-500 text-sm mt-2">
                      Password must be at least 6 characters
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

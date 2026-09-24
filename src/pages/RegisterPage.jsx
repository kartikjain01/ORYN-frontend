import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User } from 'lucide-react';
import LegalModal from '../components/LegalModal';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLogin, setIsLogin] = useState(searchParams.get('mode') === 'login');
  const [pendingVerification, setPendingVerification] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [legalModal, setLegalModal] = useState(null);
  const [formError, setFormError] = useState('');

  const switchMode = (login) => {
    setIsLogin(login);
    setEmail('');
    setPassword('');
    setFullName('');
    setShowPassword(false);
    setAgreedToTerms(false);
  };

  // 🔥 REGISTER
  const handleRegister = async () => {
    if (loading) return;

    const cleanEmail = email.trim();

    if (!fullName.trim() || !cleanEmail || !password) {
      setFormError('Please fill all fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (!agreedToTerms) {
      setFormError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    setFormError('');

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-success`,
          data: {
            full_name: fullName,
            avatar_url: '',
            terms_accepted_at: new Date().toISOString(),
            privacy_accepted_at: new Date().toISOString(),
          },
        },
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data?.user && data.user.identities?.length === 0) {
        setFormError('An account with this email already exists. Please sign in.');
        setIsLogin(true);
        return;
      }

      if (data?.session) {
        navigate('/dashboard');
      } else {
        setPendingVerification(cleanEmail);
      }
    } catch (err) {
      console.error(err);
      setFormError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOGIN
  const handleLogin = async () => {
    if (loading) return;

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setFormError('Please fill all fields');
      return;
    }
    setFormError('');

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setFormError('Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SOCIAL LOGIN
  const handleSocialLogin = async provider => {
    try {
      sessionStorage.setItem('oauth_redirect', 'true');
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setFormError(error.message);
      }
    } catch (err) {
      console.error(err);
      setFormError('Social login failed');
    }
  };

  useEffect(() => {
    if (!pendingVerification) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/dashboard', { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [pendingVerification, navigate]);

  const handleResendEmail = useCallback(async () => {
    if (resendCooldown > 0 || !pendingVerification) return;
    try {
      await supabase.auth.resend({ type: 'signup', email: pendingVerification });
      setResendCooldown(60);
    } catch { /* silent */ }
  }, [resendCooldown, pendingVerification]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (pendingVerification) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-3 sm:p-6 bg-gray-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-200/40 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-200/40 blur-[120px] rounded-full" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/80 bg-white/80 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-center"
        >
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Mail size={28} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
          <p className="mt-3 text-[14px] leading-6 text-slate-500">
            We've sent a verification email to
          </p>
          <p className="mt-1 text-[14px] font-semibold text-slate-800">{pendingVerification}</p>
          <p className="mt-5 text-[13px] text-slate-400 leading-5">
            Click the <span className="font-semibold text-slate-600">"Verify Email"</span> button in the email to confirm your account and get started.
          </p>
          <p className="mt-3 text-[12px] text-slate-400">
            Check your spam folder if you don't see it.
          </p>
          <p className="mt-4 text-[13px] text-slate-400">
            Didn't get the email?{' '}
            <button
              onClick={handleResendEmail}
              disabled={resendCooldown > 0}
              className="text-blue-600 font-medium hover:text-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
            </button>
          </p>
          <div className="mt-5 pt-5 border-t border-slate-100">
            <button
              onClick={() => { setPendingVerification(null); switchMode(true); }}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-blue-600 hover:text-blue-700 transition"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-3 sm:p-6 bg-gray-50 overflow-hidden">
      {/* PREMIUM BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-200/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-200/40 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full min-h-screen md:min-h-[95vh] max-w-7xl mx-auto grid md:grid-cols-2 bg-white border border-gray-200 rounded-[28px] shadow-xl overflow-hidden">
        {/* LEFT - LOGIN */}
        <div
          className={`
            px-6 py-10
            sm:px-8
            lg:px-10
            flex flex-col justify-center
            transition-all duration-500
            min-h-[100vh] md:min-h-0
            ${
              !isLogin
                ? 'md:opacity-30 md:pointer-events-none hidden md:flex'
                : 'opacity-100 flex'
            }`}
        >
          <div className="mb-8">
            <div className="text-blue-600 text-xl mb-4 relative top-[-80px]">
              ORYNEngine
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-black">
              Welcome back
            </h1>

            <p className="text-black/70 mt-2">
              Sign in to continue creating with AI voice tools.
            </p>
          </div>

          <div className="space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div
              onClick={() => navigate('/forgot-password')}
              className="text-right text-sm text-gray-500 hover:text-black cursor-pointer hover:underline transition"
            >
              Forgot password?
            </div>

            {formError && isLogin && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{formError}</p>
            )}

            {/* Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-black to-gray-900 text-white font-semibold shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign in'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex-1 h-px bg-gray-200" />

              <span className="whitespace-nowrap">or continue with</span>

              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social */}
            <div className="pt-1">
              <SocialButtons onSocialClick={handleSocialLogin} />
            </div>

            <p className="text-sm text-gray-600 text-center">
              Don&apos;t have an account?{' '}
              <span
                onClick={() => switchMode(false)}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Create new account →
              </span>
            </p>
          </div>
        </div>

        {/* RIGHT - REGISTER */}
        <div
          className={`
            px-6 py-10
            sm:px-8
            lg:px-10
            flex flex-col justify-center
            transition-all duration-500
            min-h-[100vh] md:min-h-0
            ${
              isLogin
                ? 'md:opacity-30 md:pointer-events-none hidden md:flex'
                : 'opacity-100 flex'
            }
          `}
        >
          <div className="mb-8">
            <div className="text-blue-600 text-xl mb-4 relative top-[-80px]">
              ORYNEngine
            </div>

            <h1 className="text-4xl sm:text-4xl lg:text-5xl font-bold text-black">
              Create an account
            </h1>

            <p className="text-black/70 mt-2">
              Clone voices, generate speech, and edit audio — all in one place.
            </p>
          </div>

          <div className="space-y-5">
            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-blue-600 rounded"
              />

              <span className="text-sm text-gray-600 leading-relaxed">
                I agree to the{' '}
                <span
                  onClick={e => {
                    e.preventDefault();
                    setLegalModal('terms');
                  }}
                  className="text-blue-600 hover:underline cursor-pointer font-medium"
                >
                  Terms of Service
                </span>{' '}
                and{' '}
                <span
                  onClick={e => {
                    e.preventDefault();
                    setLegalModal('privacy');
                  }}
                  className="text-blue-600 hover:underline cursor-pointer font-medium"
                >
                  Privacy Policy
                </span>
              </span>
            </label>

            {formError && !isLogin && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{formError}</p>
            )}

            {/* Button */}
            <button
              onClick={handleRegister}
              disabled={loading || !agreedToTerms}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-black to-gray-900 text-white font-semibold shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create account'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex-1 h-px bg-gray-200" />
              or continue with
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social */}
            <SocialButtons onSocialClick={handleSocialLogin} />

            <p className="text-sm text-gray-600 text-center">
              Already have an account?{' '}
              <span
                onClick={() => switchMode(true)}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Log in →
              </span>
            </p>
          </div>
        </div>

        {/* LEGAL MODAL */}
        <LegalModal
          open={legalModal !== null}
          type={legalModal}
          onClose={() => setLegalModal(null)}
          requireAccept
        />

        {/* FLOATING GLASS OVERLAY (FOR DESKTOP) */}
        <motion.div
          animate={{
            x: isLogin ? '100%' : '0%',
          }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 18,
          }}
          className="hidden md:flex absolute top-0 left-0 w-1/2 h-full backdrop-blur-2xl bg-white/30 border border-white/50 shadow-2xl items-center justify-center pointer-events-none z-10"
        >
          <div className="text-center p-10 pointer-events-auto">
            {isLogin ? (
              <>
                <h2 className="text-6xl font-bold mb-5 text-gray-900">
                  Welcome Back!
                </h2>

                <p className="mb-8 text-gray-900">
                  To keep connected with us please login with your personal info
                </p>

                <button
                  onClick={() => switchMode(false)}
                  className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl lg:text-6xl font-bold mb-5 text-gray-900">
                  Hello Friend!
                </h2>

                <p className="mb-8 text-gray-900">
                  Enter your personal details and start your journey with us
                </p>

                <button
                  onClick={() => switchMode(true)}
                  className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Reusable Social Buttons Sub-Component
function SocialButtons({ onSocialClick }) {
  const socialOptions = [
    {
      provider: 'google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.5 2.3 29.7 0 24 0 14.7 0 6.7 5.5 2.7 13.4l7.5 5.8C12.2 13.3 17.6 9.5 24 9.5z"
          />

          <path
            fill="#4285F4"
            d="M46.5 24.5c0-1.6-.1-2.7-.4-3.9H24v7.4h12.7c-.3 2.1-1.8 5.3-5.1 7.5l7.9 6.1c4.6-4.2 7-10.3 7-17.1z"
          />

          <path
            fill="#FBBC05"
            d="M10.2 28.2c-.6-1.7-.9-3.5-.9-5.2s.3-3.5.9-5.2l-7.5-5.8C1 15.7 0 19.7 0 24s1 8.3 2.7 11.9l7.5-5.7z"
          />

          <path
            fill="#34A853"
            d="M24 48c6.5 0 12-2.1 16-5.7l-7.9-6.1c-2.1 1.5-5 2.6-8.1 2.6-6.4 0-11.8-3.8-13.8-9.2l-7.5 5.7C6.7 42.5 14.7 48 24 48z"
          />
        </svg>
      ),
    },
    {
      provider: 'github',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 98 96" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
        </svg>
      ),
    },
    {
      provider: 'linkedin',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {socialOptions.map(item => (
        <button
          key={item.provider}
          onClick={() => onSocialClick(item.provider)}
          className="flex items-center justify-center gap-2 flex-1 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 active:scale-[0.97] transition cursor-pointer"
        >
          {item.icon}
          <span className="capitalize">{item.provider}</span>
        </button>
      ))}
    </div>
  );
}

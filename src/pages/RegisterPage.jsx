import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User } from 'lucide-react';
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // ✅ 🔥 EMAIL VERIFICATION HANDLER (ADDED - DO NOT TOUCH)
  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes('access_token')) {
      alert('Email verified successfully!');

      // clean URL
      window.history.replaceState({}, document.title, '/login');

      // force login view
      setIsLogin(true);

      navigate('/login');
    }
  }, []);

  // 🔥 REGISTER
  const handleRegister = async () => {
    if (loading) return;

    const cleanEmail = email.trim();

    if (!cleanEmail || !password || !confirmPassword) {
      return alert('Please fill all fields');
    }

    if (password !== confirmPassword) {
      return alert('Passwords do not match');
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName,
            avatar_url: '',
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data?.session) {
        navigate('/voice-clone');
      } else {
        alert('Check your email to verify account');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOGIN
  const handleLogin = async () => {
    if (loading) return;

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      return alert('Please fill all fields');
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      navigate('/voice-clone');
    } catch (err) {
      console.error(err);
      alert('Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SOCIAL LOGIN
  const handleSocialLogin = async provider => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
      alert('Social login failed');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-gray-50 overflow-hidden">
      {/* PREMIUM BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-200/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-200/40 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full h-[95vh] max-w-7xl mx-auto grid md:grid-cols-2 gap-6 bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
        {/* LEFT - LOGIN */}
        <div
          className={`p-10 flex flex-col justify-center transition-opacity duration-500 ${!isLogin ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
        >
          <div className="mb-8">
            <div className="text-orange-500 text-1xl mb-4 relative top-[-80px]">
              ORYNEngine
            </div>
            <h1 className="text-4xl font-bold text-black">Welcome back</h1>
            <p className="text-black/70 mt-2">
              Sign in to continue managing your tasks, notes, and projects.
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
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
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
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
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
              or continue with
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social */}
            <SocialButtons onSocialClick={handleSocialLogin} />

            <p className="text-sm text-gray-600 text-center">
              Don’t have an account?{' '}
              <span
                onClick={() => setIsLogin(false)}
                className="text-orange-500 cursor-pointer hover:underline"
              >
                Register →
              </span>
            </p>
          </div>
        </div>

        {/* RIGHT - REGISTER */}
        <div
          className={`p-10 flex flex-col justify-center transition-opacity duration-500 ${isLogin ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
        >
          <div className="mb-8">
            <div className="text-orange-500 text-1xl mb-4 relative top-[-80px]">
              ORYNEngine
            </div>
            <h1 className="text-4xl font-bold text-black">Create an account</h1>
            <p className="text-black/70 mt-2">
              Access your tasks, notes, and projects anytime, anywhere.
            </p>
          </div>

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
            />
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
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
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
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
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

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Button */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-black to-gray-900 text-white font-semibold shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
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

            <p className="text-sm text-gray-600 text-center ">
              Already have an account?{' '}
              <span
                onClick={() => setIsLogin(true)}
                className="text-orange-500 cursor-pointer hover:underline"
              >
                Log in →
              </span>
            </p>
          </div>
        </div>

        {/* FLOATING GLASS OVERLAY (FOR DESKTOP) */}
        <motion.div
          animate={{ x: isLogin ? '100%' : '0%' }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          className="hidden md:flex absolute top-0 left-0 w-1/2 h-full backdrop-blur-2xl bg-white/30 border border-white/50 shadow-2xl items-center justify-center pointer-events-none z-10"
        >
          <div className="text-center p-10 pointer-events-auto">
            {isLogin ? (
              <>
                <h2 className="text-6xl font-bold mb-5 text-gray-900">
                  Hello Friend!
                </h2>
                <p className="mb-8 text-gray-900">
                  Enter your personal details and start your journey with us
                </p>
                <button
                  onClick={() => setIsLogin(false)}
                  className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <h2 className="text-6xl font-bold mb-5 text-gray-900">
                  Welcome Back!
                </h2>
                <p className="mb-8 text-gray-900">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  onClick={() => setIsLogin(true)}
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

// Resuable Social Buttons Sub-Component
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
        <svg
          className="w-5 h-5 text-black"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 .5C5.7.5.9 5.3.9 11.6c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.6v-2.2c-3.1.7-3.8-1.5-3.8-1.5-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.8 1.7 2.6 1.2.1-.7.4-1.2.7-1.5-2.5-.3-5.2-1.3-5.2-5.7 0-1.2.4-2.1 1.2-2.9-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.7 1.2 2.9 0 4.4-2.7 5.4-5.2 5.7.4.3.8 1 .8 2.1v3.1c0 .4.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.1 5.3 18.3.5 12 .5z" />
        </svg>
      ),
    },
    {
      provider: 'apple',
      icon: (
        <svg
          className="w-5 h-5 text-black"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M16.7 13.2c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.9-1.8-3.5-1.8-1.5-.1-2.9.9-3.7.9s-2-.9-3.3-.9c-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.3.9 1.3 2 2.8 3.5 2.7 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.5.9c1.5 0 2.5-1.4 3.4-2.7 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-3.6zM14.9 5.6c.7-.9 1.2-2.1 1.1-3.3-1 .1-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-3">
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

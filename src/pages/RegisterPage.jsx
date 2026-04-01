import { useRef, useState } from "react";
import { EyeOff, MailCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient';

function SocialButton({ icon, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[52px] w-full items-center justify-center gap-4 rounded-[6px] border border-black/70 bg-white text-[18px] font-medium text-black transition hover:bg-black/[0.03]"
    >
      <span className="flex w-[22px] items-center justify-center text-[22px]">
        {icon}
      </span>
      <span>{text}</span>
    </button>
  );
}

export default function RegisterPage() {
  const emailRef = useRef();
  const passRef = useRef();
  const confirmRef = useRef();

  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const navigate = useNavigate();

  const handleNext = async () => {
    const email = emailRef.current.value;
    const password = passRef.current.value;
    const confirm = confirmRef.current.value;

    if (!email || !password) return alert('Please fill in all fields');
    if (password !== confirm) return alert('Passwords do not match!');

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // 🔥 If email confirmation OFF → user is already logged in
    if (data.session) {
      navigate('/voice-clone');
    } else {
      // Email confirmation ON
      setIsEmailSent(true);
    }

    setLoading(false);
  };

  const handleSocial = async provider => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin, // ✅ FIX
      },
    });

    if (error) alert(error.message);
  };

  // ✅ EMAIL VERIFICATION UI
  if (isEmailSent) {
    return (
      <div className="relative min-h-screen bg-[#efefef] px-6 py-10 text-black flex items-center justify-center">
        <div className="w-full max-w-[520px] text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#8b3dff]/10 text-[#8b3dff]">
            <MailCheck size={48} />
          </div>

          <h1 className="text-[48px] font-extrabold leading-tight tracking-tight text-black">
            Verify your <span className="text-[#8b3dff]">Email</span>
          </h1>

          <p className="mt-4 text-[22px] font-medium text-[#7c7c7c]">
            We've sent a link to{' '}
            <span className="text-black font-bold">
              {emailRef.current?.value}
            </span>
            . Please check your inbox and click the link to continue.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <button
              onClick={() => window.location.reload()}
              className="text-[18px] font-bold text-[#8b3dff] hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MAIN REGISTER UI
  return (
    <div className="relative min-h-screen bg-[#efefef] px-6 py-10 text-black">
      <div className="mx-auto flex min-h-[85vh] max-w-[520px] items-center justify-center">
        <div className="w-full">
          <h1 className="text-center text-[54px] font-extrabold leading-none tracking-[-0.03em] text-black">
            Create a free{' '}
            <span className="bg-gradient-to-r from-[#8b3dff] to-[#7cecff] bg-clip-text text-transparent">
              Account
            </span>
          </h1>

          <p className="mt-3 text-center text-[24px] font-medium text-[#7c7c7c]">
            Provide your Email and choose Password
          </p>

          <form className="mt-8 space-y-5" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="mb-2 block text-[18px] font-semibold">
                Email*
              </label>
              <input
                ref={emailRef}
                type="email"
                placeholder="Enter Your Email"
                className="h-[52px] w-full rounded-[6px] border border-black/75 bg-white px-4 text-[18px] outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[18px] font-semibold">
                Create Password*
              </label>
              <div className="relative">
                <input
                  ref={passRef}
                  type="password"
                  placeholder="Create a strong password"
                  className="h-[52px] w-full rounded-[6px] border border-black/75 bg-white px-4 pr-12 text-[18px] outline-none"
                />
                <EyeOff
                  size={22}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[18px] font-semibold">
                Confirm Password*
              </label>
              <div className="relative">
                <input
                  ref={confirmRef}
                  type="password"
                  placeholder="Re-try Password"
                  className="h-[52px] w-full rounded-[6px] border border-black/75 bg-white px-4 pr-12 text-[18px] outline-none"
                />
                <EyeOff
                  size={22}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-black/40" />
              <span className="text-[20px] font-semibold text-black/60">
                or
              </span>
              <div className="h-px flex-1 bg-black/40" />
            </div>

            <div className="space-y-4">
              <SocialButton
                icon="🅖"
                text="Sign up with Google"
                onClick={() => handleSocial('google')}
              />
              <SocialButton
                icon=""
                text="Sign up with Apple ID"
                onClick={() => handleSocial('apple')}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Sign In Button */}
      <Link
        to="/"
        className="absolute bottom-10 left-10 flex h-[50px] items-center justify-center rounded-[18px] bg-gradient-to-r from-[#8a5cff] to-[#56d8ef] px-8 text-[22px] font-bold text-white shadow-[0_10px_25px_rgba(120,140,255,0.45)] transition hover:scale-105"
      >
        Sign In
      </Link>

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={loading}
        className="absolute bottom-10 right-10 flex h-[50px] items-center justify-center rounded-[18px] bg-gradient-to-r from-[#8a5cff] to-[#56d8ef] px-8 text-[22px] font-bold text-white shadow-[0_10px_25px_rgba(120,140,255,0.45)] transition hover:scale-105"
      >
        {loading ? '...' : 'Next'}
        <span className="text-[26px] ml-2">→</span>
      </button>
    </div>
  );
}

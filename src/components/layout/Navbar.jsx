import { useEffect, useRef, useState } from "react";
import { Bell, Settings, UserCircle2, MessageCircleMore } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient"; // Added one extra '../'
const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/voice-clone" },
  { name: "Features", path: "/text-to-speech" },
  { name: "Contact", path: "/voice-editor" },
];

const notifications = [
  {
    id: 1,
    title: 'Voice clone is ready',
    message: 'Your latest voice clone has finished processing.',
    time: '2 min ago',
  },
  {
    id: 2,
    title: 'Text to speech completed',
    message: 'Your generated audio file is ready to download.',
    time: '10 min ago',
  },
  {
    id: 3,
    title: 'New feature available',
    message: 'Settings page has been added to your dashboard.',
    time: '1 hour ago',
  },
];

// 2. Accept 'user' prop from HomePage
export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Helper to get initial
  const getInitial = () => {
    if (!user?.email) return '';
    return user.email.charAt(0).toUpperCase();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative z-30">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-5 md:py-6 lg:px-6">
        <div className="w-[clamp(60px,6vw,96px)]">
          {/* Logo could go here if needed */}
          <span className="text-xl font-black tracking-tighter text-white">
            ORYN<span className="text-[#8b3dff]">Engine</span>
          </span>
        </div>

        <ul
          className="hidden items-center text-white md:flex"
          style={{
            gap: 'clamp(18px,3vw,40px)',
            fontSize: 'clamp(13px,1.2vw,20px)',
          }}
        >
          {navItems.map(item => (
            <li key={item.name}>
              <Link to={item.path} className="transition hover:text-white/70">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="relative flex items-center justify-end text-white"
          style={{
            width: 'clamp(120px,15vw,240px)',
            gap: 'clamp(14px,2vw,24px)',
          }}
        >
          <button className="transition hover:text-white/70" aria-label="Chat">
            <MessageCircleMore size={20} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="transition hover:text-white/70"
            aria-label="Settings"
          >
            <Settings size={20} strokeWidth={1.8} />
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              className="relative transition hover:text-white/70"
              aria-label="Notifications"
            >
              <Bell size={20} strokeWidth={1.8} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-pink-500" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0616]/95 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <h3 className="text-sm font-semibold text-white">
                    Notifications
                  </h3>
                  <button className="text-xs text-white/50 hover:text-white">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map(item => (
                    <button
                      key={item.id}
                      className="w-full border-b border-white/10 px-4 py-4 text-left transition hover:bg-white/5 last:border-b-0"
                    >
                      <p className="text-sm font-medium text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-white/55">
                        {item.message}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. CONDITIONAL PROFILE ICON */}
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8b3dff] to-[#7cecff] text-sm font-bold text-white shadow-[0_0_15px_rgba(139,61,255,0.3)] transition hover:scale-110"
              aria-label="User Profile"
            >
              {getInitial()}
            </button>
          ) : (
            <button
              onClick={() => navigate('/register')}
              className="transition hover:text-white/70"
              aria-label="Register"
            >
              <UserCircle2 size={24} strokeWidth={1.8} />
            </button>
          )}

          {/* Optional Logout Button for testing */}
          {user && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-[11px] uppercase tracking-widest text-white/30 hover:text-red-400 transition"
            >
              Out
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Settings,
  UserCircle2,
  X,
  Sparkles,
  Mic2,
  Waves,
  SlidersHorizontal,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ContactSupportSection from "../home/ContactSupportSection";
import { useProfile } from "../../context/ProfileContext";

const navItems = [
  { name: "Home", sectionId: "home", type: "scroll" },
  { name: "About", type: "about" },
  { name: "Features", sectionId: "features", type: "scroll" },
  { name: "Contact", type: "contact" },
];

const notifications = [
  {
    id: 1,
    title: "Voice clone is ready",
    message: "Your latest voice clone has finished processing.",
    time: "2 min ago",
  },
  {
    id: 2,
    title: "Text to speech completed",
    message: "Your generated audio file is ready to download.",
    time: "10 min ago",
  },
  {
    id: 3,
    title: "New feature available",
    message: "Settings page has been added to your dashboard.",
    time: "1 hour ago",
  },
];

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notificationRef = useRef(null);
  const { setShowProfile, profile } = useProfile();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSectionNavigation = (sectionId) => {
    setShowNotifications(false);
    setShowAbout(false);
    setShowContact(false);

    if (location.pathname !== "/") {
      sessionStorage.setItem("scrollTarget", sectionId);
      navigate("/");
    } else {
      scrollToSection(sectionId);
    }
  };

  // ✅ CLOSE NOTIFICATIONS ON OUTSIDE CLICK
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ ESC KEY CLOSE
  useEffect(() => {
    function handleEsc(event) {
      if (event.key === "Escape") {
        setShowAbout(false);
        setShowContact(false);
        setShowNotifications(false);
      }
    }

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // ✅ SCROLL EFFECT
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
      <header
        className={`fixed top--3 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#020817]/90 backdrop-blur-lg border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-5 md:py-6 lg:px-6 relative">
          {/* LOGO */}
          <div className="flex items-center justify-start min-w-[180px] pr-2 overflow-visible">
            <span
              onClick={() => navigate('/')}
              className="cursor-pointer whitespace-nowrap"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(22px,2.2vw,26px)',
                letterSpacing: '0px',
                color: '#ffffff',
                fontStyle: 'italic',
                paddingRight: '2px', // ✅ gives breathing space to 'e'
                display: 'inline-block',
              }}
            >
              <span style={{ fontWeight: 700 }}>ORYN</span>

              <span
                style={{
                  fontWeight: 900,
                  marginLeft: '6px',
                  background: 'linear-gradient(90deg, #8b3dff, #7cecff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  paddingRight: '2px',
                }}
              >
                Engine
              </span>
            </span>
          </div>

          {/* CENTER MENU */}
          <div className="w-[clamp(60px,6vw,96px)]" />

          <ul
            className="absolute left-1/2 -translate-x-1/2 hidden items-center md:flex"
            style={{
              gap: 'clamp(18px,3vw,40px)',
              fontSize: 'clamp(13px,1.2vw,20px)',
            }}
          >
            {navItems.map(item => (
              <li key={item.name}>
                {item.type === 'about' ? (
                  <button
                    onClick={() => {
                      setShowAbout(true);
                      setShowContact(false);
                    }}
                    className="text-white/70 hover:text-white transition"
                  >
                    {item.name}
                  </button>
                ) : item.type === 'contact' ? (
                  <button
                    onClick={() => {
                      setShowContact(true);
                      setShowAbout(false);
                      setShowNotifications(false);
                    }}
                    className="text-white/70 hover:text-white transition"
                  >
                    {item.name}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSectionNavigation(item.sectionId)}
                    className="text-white/70 hover:text-white transition"
                  >
                    {item.name}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-3 pr-0 text-white/80">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition"
            >
              <Settings size={22} strokeWidth={1.8} />
            </button>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition"
              >
                <Bell size={22} strokeWidth={1.8} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-pink-500" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-[320px] rounded-2xl border border-white/10 bg-[#0b0616]/95 shadow-xl backdrop-blur-xl">
                  <div className="flex justify-between px-4 py-3 border-b border-white/10">
                    <h3 className="text-sm text-white font-semibold">
                      Notifications
                    </h3>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.map(item => (
                      <button
                        key={item.id}
                        className="w-full px-4 py-4 text-left border-b border-white/10 hover:bg-white/5"
                      >
                        <p className="text-sm text-white font-medium">
                          {item.title}
                        </p>
                        <p className="text-xs text-white/55 mt-1">
                          {item.message}
                        </p>
                        <p className="text-[11px] text-white/35 mt-2">
                          {item.time}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ PROFILE BUTTON */}
            {user ? (
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowProfile(true);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full
    overflow-hidden
    bg-gradient-to-br from-[#8b3dff] to-[#7cecff]
    text-sm font-bold text-white
    shadow-[0_0_15px_rgba(139,61,255,0.3)]
    transition-all duration-300
    hover:scale-110 hover:shadow-[0_0_20px_rgba(139,61,255,0.6)]"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url + '?t=' + Date.now()} // 🔥 force refresh
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <span>
                    {profile?.full_name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      'U'}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition"
              >
                <UserCircle2 size={22} strokeWidth={1.8} />
              </button>
            )}

            {/* ✅ LOGOUT */}
            {user && (
              <button
                onClick={() => navigate('/settings')}
                className="text-[11px] uppercase tracking-widest text-white/30 hover:text-blue-400 transition"
              >
                {/* ✅ if you write anything where then it will come on the home */}
              </button>
            )}
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          showAbout
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          onClick={() => setShowAbout(false)}
          className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${
            showAbout ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-[720px] transform border-l border-white/10 bg-[#080311]/90 shadow-[-30px_0_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-500 ease-out ${
            showAbout ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(236,72,153,0.18),rgba(168,85,247,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]" />
          <div className="absolute right-[-40px] top-[-40px] h-[220px] w-[220px] rounded-full bg-fuchsia-500/15 blur-[90px]" />
          <div className="absolute right-[120px] top-[80px] h-[160px] w-[160px] rounded-full bg-violet-500/15 blur-[80px]" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5 sm:px-8">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  <Sparkles size={14} />
                  AI Voice Platform
                </div>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                  About Our Platform
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                  A premium voice AI workspace for creators to clone voices,
                  generate natural speech, and edit audio with a modern, fast,
                  and simple experience.
                </p>
              </div>

              <button
                onClick={() => setShowAbout(false)}
                className="ml-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close About panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:bg-white/[0.06]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
                    <Mic2 size={22} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    Voice Cloning
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Create high-quality voice replicas from source audio with a
                    premium creator workflow.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:bg-white/[0.06]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
                    <Waves size={22} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    Text to Speech
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Convert text into natural, expressive audio for content,
                    narration, and creative production.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:bg-white/[0.06]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
                    <SlidersHorizontal size={22} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    Voice Editor
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Refine generated speech and audio output with simple editing
                    controls in one place.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-white">
                  How it works
                </h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Step 01
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      Upload
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      Add source audio or text input.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Step 02
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      Process
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      Prepare voice and optimize quality.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Step 03
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      Generate
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      Create realistic audio output.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Step 04
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      Download
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      Export and use in your projects.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-sm font-medium text-white">
                    Why creators use it
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-white/55">
                    <li>Fast generation workflow</li>
                    <li>Premium dark UI and creator-friendly tools</li>
                    <li>Realistic voice output and editing flow</li>
                    <li>
                      Simple structure for scaling into a full SaaS product
                    </li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-sm font-medium text-white">
                    Platform details
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-white/55">
                    <p>Product: AI Voice Platform</p>
                    <p>Core Tools: Voice Clone, TTS, Voice Editor</p>
                    <p>Version: 1.0</p>
                    <p>Built for creators and modern audio workflows</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-4 sm:px-8">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/35">
                  Built with a premium creator-first UI.
                </p>
                <button
                  onClick={() => setShowAbout(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          showContact
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          onClick={() => setShowContact(false)}
          className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${
            showContact ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-[900px] transform border-l border-white/10 bg-[#080311]/90 shadow-[-30px_0_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-500 ease-out ${
            showContact ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                Support
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                Contact Support
              </h2>
            </div>

            <button
              onClick={() => setShowContact(false)}
              className="ml-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close Contact panel"
            >
              <X size={18} />
            </button>
          </div>

          <div className="h-[calc(100%-88px)] overflow-y-auto">
            <ContactSupportSection />
          </div>
        </div>
      </div>
    </>
  );
}

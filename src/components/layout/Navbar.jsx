import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Wordmark from './Wordmark';
import {
  Bell,
  Settings,
  UserCircle2,
  Menu,
  X,
} from 'lucide-react';
import { useProfile } from "../../context/ProfileContext";
import FeatureConsole from "../panels/FeatureConsole";
import ContactConsole from "../panels/ContactConsole";

const navItems = [
  { name: 'Home', sectionId: 'home', type: 'scroll' },
  { name: 'About', type: 'about' },
  { name: 'Features', sectionId: 'features', type: 'scroll' },
  { name: 'Contact', type: 'contact' },
];

/* Height of the strip the bar physically occupies (top offset + bar height +
   a little slack). The surface observer only samples this strip, so the bar
   re-tones off what is actually behind it rather than off page position. */
const NAV_BAND = 96;

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
  const [mobileMenu, setMobileMenu] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);

  /* What the bar is currently sitting on top of. `tone` picks the glass
     treatment, `section` drives the active pill — one source of truth for
     both, because both answer the same question: what is under the bar?

     `path` stamps the reading with the route it was taken on, so a reading
     from the home page can't leak onto a route that declares no surfaces at
     all (which would otherwise strand the bar in dark mode on a light page).
     Stamping is what lets the observer stay a pure subscription — no reset
     write on mount, no cascading render. */
  const [surface, setSurface] = useState(null);
  const [atTop, setAtTop] = useState(true);

  const reduceMotion = useReducedMotion();

  const notificationRef = useRef(null);
  const { setShowProfile, profile } = useProfile();

  const scrollToSection = (sectionId) => {
    /* Home is special-cased: #home carries the hero's parallax transform, so
       its measured rect is displaced by up to 70px from where it actually
       lays out, and scrollIntoView would land short. The hero is the top of
       the document, so scroll to the top of the document. */
    if (sectionId === 'home') {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
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
        setMobileMenu(false);
      }
    }

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  /* ✅ SURFACE TRACKING — tone + active section
     The bar is glass, so it has to answer to whatever is directly behind it.
     The old version derived that from one boolean ("has the hero left?"),
     which was fine when the page was dark-then-light. It is wrong now: the
     product stack alternates black and white six times underneath the bar,
     and a fixed light capsule punched over a black slide stops reading as
     glass entirely.

     So: shrink the observer root to just the strip the bar occupies, and
     watch every element that declares a surface. Whatever is in that strip
     is what the bar is on.

     Ratio thresholds are deliberately not used. Every previous attempt in
     this file failed on them — a zero-height anchor reports ratio 0 and a
     multi-viewport wrapper reports ~0.17, so neither ever crosses a
     threshold. Presence in the strip is the signal; ratio is meaningless
     here. */
  const path = location.pathname;

  useEffect(() => {
    /* Document order, which for these positioned siblings is also paint
       order — so the last visible one is the one actually on top. That is
       what makes this correct inside the sticky stack, where the outgoing
       slide is still in the strip underneath the incoming one. */
    const targets = Array.from(document.querySelectorAll('[data-nav-tone]'));

    /* Routes with no declared surfaces just fall through to the render-time
       default below. Nothing to observe, nothing to write. */
    if (!targets.length) return;

    const visible = new Set();
    let observer;

    const resolve = () => {
      let top = null;
      for (const el of targets) if (visible.has(el)) top = el;
      if (!top) return;

      setSurface(previous => ({
        path,
        tone: top.dataset.navTone === 'dark' ? 'dark' : 'light',
        /* Sections past the last nav target (Why Choose Us, the closing
           slide) declare a tone but no section. Holding the previous value
           keeps the pill parked on the last item you passed instead of
           having it vanish mid-page. */
        section: top.dataset.navSection ?? previous?.section ?? null,
      }));
    };

    /* The root strip is expressed in px, so it has to be rebuilt whenever
       the viewport height changes. */
    const connect = () => {
      observer?.disconnect();
      visible.clear();

      observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target);
            else visible.delete(entry.target);
          }
          resolve();
        },
        {
          rootMargin: `0px 0px -${Math.max(0, window.innerHeight - NAV_BAND)}px 0px`,
        }
      );

      targets.forEach(target => observer.observe(target));
    };

    connect();
    window.addEventListener('resize', connect);

    return () => {
      window.removeEventListener('resize', connect);
      observer?.disconnect();
    };
  }, [path]);

  /* Elevation is a separate signal from tone: at the very top of the page
     the bar should read as part of the hero, not as a chip sitting on it.
     It lifts off the surface only once there is content behind it. */
  useEffect(() => {
    const handleScroll = () => setAtTop(window.scrollY < 8);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);
  /* Scroll lock touches overflowY ONLY. The old version wrote the `overflow`
     shorthand, which also resets overflow-x — and HomePage sets
     `body.style.overflowX = 'hidden'` to contain the hero's blur bleed. So
     opening and closing any panel silently re-enabled horizontal scroll for
     the rest of the session. */
  useEffect(() => {
    if (!showAbout && !showContact && !mobileMenu) return;

    const previous = document.body.style.overflowY;
    document.body.style.overflowY = 'hidden';

    return () => {
      document.body.style.overflowY = previous;
    };
  }, [showAbout, showContact, mobileMenu]);


  /* A reading only counts on the route it was taken on. Until one lands,
     home starts on the dark hero and every other route is a light page. */
  const reading = surface?.path === path ? surface : null;
  const onLight = (reading?.tone ?? (path === '/' ? 'dark' : 'light')) === 'light';

  /* The pill follows hover when there is one, otherwise it rests on the
     section currently under the bar. */
  const activeNavName =
    navItems.find(item => item.sectionId === reading?.section)?.name ?? null;
  const pillTarget = hoveredNav ?? activeNavName;


  const navLinkClass = itemName => {
    const isLit = pillTarget === itemName;

    return `relative z-10 rounded-full px-4 py-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
      onLight
        ? isLit
          ? 'text-fg'
          : 'text-fg-muted hover:text-fg'
        : isLit
          ? 'text-white'
          : 'text-white/75 hover:text-white'
    }`;
  };

  /* 44px minimum touch target (Apple HIG / Material 48dp). */
  const iconBtnClass = `relative items-center justify-center h-11 w-11 rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
    onLight
      ? 'text-fg-muted hover:text-fg hover:bg-black/[0.05] active:scale-95'
      : 'text-white/85 hover:text-white hover:bg-white/15 active:scale-95'
  }`;

  /* Glass tint.
     Over light: 55% white on a near-white page gave the capsule almost no
     presence, and page content read straight through the nav labels. 72%
     still transmits what is sliding underneath but holds its own edge.
     Over dark: 8% white on pure black is below the threshold where the fill
     registers at all — only the hairline border was visible, so the bar read
     as an outline rather than as glass. 11% is the point where the frost
     shows without turning milky. */
  const tintClass = onLight
    ? 'bg-white/72 border-black/[0.07]'
    : 'bg-white/[0.11] border-white/20';

  /* Elevation, not tint: at the top of the hero the bar sheds its drop
     shadow and keeps only the inner highlight, so it sits in the hero
     instead of hovering over it. Gated on the dark surface — on a light
     page a shadowless 72%-white capsule has almost no edge to read. */
  const elevationClass = atTop && !onLight
    ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]'
    : onLight
      ? 'shadow-[0_8px_30px_-8px_rgba(16,24,40,0.18),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(16,24,40,0.04)]'
      : 'shadow-[0_8px_30px_-6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.15)]';

  const glassBarClass = `${tintClass} ${elevationClass}`;

  return (
    <>
      <header className="fixed top-3 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 sm:top-4 sm:w-[calc(100%-2.5rem)]">
        <nav
          className={`relative flex h-16 w-full items-center justify-between rounded-full border px-4 backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-500 ease-out sm:px-5 ${glassBarClass}`}
        >
          {/* top specular highlight — the "liquid glass" sheen */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-4 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-opacity duration-500 ${
              onLight ? 'opacity-90' : 'opacity-60'
            }`}
          />

          {/* LOGO */}
          <div className="flex items-center justify-start pr-2">
            <Link to="/" aria-label="ORYN Engine — home">
              <Wordmark tone={onLight ? 'light' : 'dark'} />
            </Link>
          </div>

          {/* CENTER MENU — liquid glass sliding pill */}
          <ul
            onMouseLeave={() => setHoveredNav(null)}
            className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex"
            style={{
              gap: 'clamp(6px,1vw,10px)',
              fontSize: 'clamp(13px,1.2vw,15px)',
            }}
          >
            {navItems.map(item => {
              const isCurrent = activeNavName === item.name;

              return (
                <li
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setHoveredNav(item.name)}
                >
                  {pillTarget === item.name && (
                    <motion.div
                      layoutId="navGlassPill"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 450, damping: 34 }
                      }
                      className={`absolute inset-0 -z-0 rounded-full border backdrop-blur-md ${
                        onLight
                          ? 'border-black/[0.06] bg-white/90 shadow-[0_2px_10px_rgba(16,24,40,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]'
                          : 'border-white/25 bg-white/20 shadow-[0_2px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]'
                      }`}
                    />
                  )}

                  {item.type === 'about' ? (
                    <button
                      onClick={() => {
                        setShowAbout(true);
                        setShowContact(false);
                      }}
                      className={navLinkClass(item.name)}
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
                      className={navLinkClass(item.name)}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSectionNavigation(item.sectionId)}
                      aria-current={isCurrent ? 'true' : undefined}
                      className={navLinkClass(item.name)}
                    >
                      {item.name}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-1.5 pr-0">
            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenu(prev => !prev)}
              aria-label={mobileMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenu}
              className={iconBtnClass + " flex md:hidden"}
            >
              {mobileMenu ? (
                <X size={24} strokeWidth={1.8} />
              ) : (
                <Menu size={24} strokeWidth={1.8} />
              )}
            </button>
            <button
              onClick={() => navigate('/settings')}
              aria-label="Settings"
              className={iconBtnClass + " flex"}
            >
              <Settings size={22} strokeWidth={1.8} />
            </button>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                aria-label="Notifications — unread"
                aria-expanded={showNotifications}
                className={iconBtnClass + " relative flex"}
              >
                <Bell size={22} strokeWidth={1.8} />
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-brand-500"
                />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-14 w-[92vw] max-w-[320px] overflow-hidden rounded-2xl border border-white/25 bg-white/70 shadow-[0_12px_40px_-8px_rgba(16,24,40,0.25),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-150">
                  <div className="flex justify-between px-4 py-3 border-b border-line">
                    <h3 className="text-sm text-fg font-semibold">
                      Notifications
                    </h3>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.map(item => (
                      <button
                        key={item.id}
                        className="w-full px-4 py-4 text-left border-b border-line hover:bg-page"
                      >
                        <p className="text-sm text-fg font-medium">
                          {item.title}
                        </p>
                        <p className="text-xs text-fg-muted mt-1">
                          {item.message}
                        </p>
                        <p className="text-[11px] text-fg-muted mt-2">
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
                aria-label="Your profile"
                className="flex items-center justify-center h-11 w-11 rounded-full
    overflow-hidden
    bg-brand-500
    text-sm font-bold text-white
    shadow-[0_4px_12px_rgba(102,154,247,0.45)]
    transition-all duration-300
    hover:scale-105 hover:bg-brand-600
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                {profile?.avatar_url ? (
                  <img
                    /* No ?t=Date.now() cache-buster. It was read during
                       render, so the src changed on every re-render and the
                       browser re-fetched the avatar on every hover, scroll
                       tick and nav tone flip. It was also redundant: uploads
                       are written to avatar_<timestamp>.<ext>, so a new
                       avatar is already a new URL. */
                    src={profile.avatar_url}
                    className="w-full h-full object-cover"
                    alt=""
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
                aria-label="Sign in or create an account"
                className={iconBtnClass + " flex"}
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
      {/* MOBILE MENU */}
      {/* inert while closed. opacity-0 + pointer-events-none hides a panel
          from the mouse but NOT from the keyboard — every button inside
          stayed in the tab order, so tabbing off the nav walked an
          invisible menu and, for the panels below, an entire invisible
          page of controls. */}
      <div
        inert={!mobileMenu}
        className={`fixed top-[84px] left-0 w-full z-40 md:hidden transition-all duration-300 ${
          mobileMenu
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-4 rounded-3xl border border-white/25 bg-white/70 shadow-[0_16px_50px_-10px_rgba(16,24,40,0.28),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl backdrop-saturate-150 overflow-hidden">
          <div className="flex flex-col p-4">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => {
                  setMobileMenu(false);

                  if (item.type === 'about') {
                    setShowAbout(true);
                    setShowContact(false);
                  } else if (item.type === 'contact') {
                    setShowContact(true);
                    setShowAbout(false);
                  } else {
                    handleSectionNavigation(item.sectionId);
                  }
                }}
                className="flex items-center justify-between rounded-2xl px-4 py-4 text-left text-fg-muted hover:bg-page hover:text-fg transition"
              >
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The About and Contact drawers used to live here as ~230 lines of
          light card markup. They are consoles now — see
          ../panels/FeatureConsole and ../panels/ContactConsole. The navbar
          keeps ownership of open/close state and nothing else. */}
      <FeatureConsole open={showAbout} onClose={() => setShowAbout(false)} />

      <ContactConsole
        open={showContact}
        onClose={() => setShowContact(false)}
      />

    </>
  );
}

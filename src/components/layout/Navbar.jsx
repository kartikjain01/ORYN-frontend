import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Wordmark from './Wordmark';
import {
  Menu,
  X,
  Sparkles,
  Mic2,
  Waves,
  SlidersHorizontal,
  Captions,
} from 'lucide-react';
import { useProfile } from "../../context/ProfileContext";
import ContactSupportSection from "../home/ContactSupportSection";

const navItems = [
  { name: 'About', type: 'about' },
  { name: 'Features', sectionId: 'features', type: 'scroll' },
  { name: 'Pricing', type: 'pricing' },
  { name: 'Contact', type: 'contact' },
];

/* Height of the strip the bar physically occupies (top offset + bar height +
   a little slack). The surface observer only samples this strip, so the bar
   re-tones off what is actually behind it rather than off page position. */
const NAV_BAND = 96;


export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

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
    setShowAbout(false);
    setShowContact(false);

    if (location.pathname !== "/") {
      sessionStorage.setItem("scrollTarget", sectionId);
      navigate("/");
    } else {
      scrollToSection(sectionId);
    }
  };

  useEffect(() => {
    function handleEsc(event) {
      if (event.key === "Escape") {
        setShowAbout(false);
        setShowContact(false);
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
  const pillTarget = activeNavName;


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
                          : { type: 'spring', stiffness: 500, damping: 40, mass: 0.8 }
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
                      }}
                      className={navLinkClass(item.name)}
                    >
                      {item.name}
                    </button>
                  ) : item.type === 'pricing' ? (
                    <button
                      onClick={() => navigate('/upgrade')}
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

            {/* PROFILE / SIGN UP */}
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
                className="h-10 px-5 rounded-full bg-white text-[14px] font-semibold text-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer"
              >
                Sign Up
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
                  } else if (item.type === 'pricing') {
                    navigate('/upgrade');
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

      {/* ABOUT PANEL — slides from right */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
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
          className={`absolute right-0 top-0 h-full w-full max-w-[720px] transform border-l border-white/10 bg-black/95 shadow-[-30px_0_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-500 ease-out ${
            showAbout ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(37,99,235,0.18),rgba(102,154,247,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]" />
          <div className="absolute right-[-40px] top-[-40px] h-[220px] w-[220px] rounded-full bg-blue-500/15 blur-[90px]" />
          <div className="absolute right-[120px] top-[80px] h-[160px] w-[160px] rounded-full bg-indigo-500/12 blur-[80px]" />

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

              {/* MISSION */}
              <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/10 to-transparent p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-brand-400">Our Mission</p>
                <p className="mt-3 text-[15px] leading-7 text-white/75">
                  ORYN Engine is built for the next generation of creators. We believe
                  every voice deserves to be heard — whether you're producing podcasts,
                  building characters for games, localizing content across languages, or
                  bringing stories to life. Our AI-powered tools give you studio-grade
                  voice production without the studio.
                </p>
              </div>

              {/* STATS */}
              <div className="mb-8 grid grid-cols-4 gap-3">
                {[
                  { value: '4', label: 'AI Tools' },
                  { value: '50+', label: 'Voice Models' },
                  { value: '99.9%', label: 'Uptime' },
                  { value: '<2s', label: 'Generation' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                    <p className="text-xl font-bold text-brand-400">{s.value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-white/45">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* CORE TOOLS — 4 cards including Captions */}
              <p className="mb-4 text-xs uppercase tracking-[0.18em] text-white/40">Core Tools</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:bg-white/[0.06]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15">
                    <Mic2 size={22} className="text-brand-500" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Voice Cloning</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Clone any voice from a short audio sample. Produce realistic replicas
                    for dubbing, narration, or character design — all from your browser.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:bg-white/[0.06]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15">
                    <Waves size={22} className="text-brand-500" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Text to Speech</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Turn any script into natural, expressive speech. Choose from dozens
                    of voices and fine-tune tone, pace, and emotion to match your content.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:bg-white/[0.06]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15">
                    <SlidersHorizontal size={22} className="text-brand-500" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Voice Editor</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Fine-tune pitch, speed, emphasis, and pauses. Polish any generated
                    audio until it sounds exactly the way you want — no external software needed.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:bg-white/[0.06]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15">
                    <Captions size={22} className="text-brand-500" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Caption Generation</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Auto-generate accurate, timed captions from any audio or video file.
                    Export in SRT, VTT, or plain text for social media, YouTube, or production.
                  </p>
                </div>
              </div>

              {/* HOW IT WORKS */}
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-white">How it works</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-4">
                  {[
                    { step: '01', title: 'Upload', desc: 'Drop in audio, video, or type your script directly.' },
                    { step: '02', title: 'Configure', desc: 'Pick a voice, set tone and style, adjust parameters.' },
                    { step: '03', title: 'Generate', desc: 'AI processes your input and produces studio-quality output.' },
                    { step: '04', title: 'Export', desc: 'Download, share, or send directly to your project.' },
                  ].map((s) => (
                    <div key={s.step} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-500/70">Step {s.step}</p>
                      <p className="mt-2 text-sm font-medium text-white">{s.title}</p>
                      <p className="mt-2 text-sm text-white/50">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* WHO IT'S FOR + WHAT'S NEXT */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-sm font-medium text-white">Built for</p>
                  <ul className="mt-4 space-y-3 text-sm text-white/55">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500/60" />
                      Content creators and YouTubers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500/60" />
                      Podcast producers and audio teams
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500/60" />
                      Game developers and storytellers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500/60" />
                      Agencies and localization teams
                    </li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-sm font-medium text-white">Coming soon</p>
                  <ul className="mt-4 space-y-3 text-sm text-white/55">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                      AI video generation from text prompts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                      Multi-language voice support
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                      Real-time voice emotion control
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                      Voice-to-voice style transfer
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-4 sm:px-8">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/35">
                  ORYN Engine v{__APP_VERSION__} — Creator-first AI voice studio
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

      {/* CONTACT PANEL — slides from right */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
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
          className={`absolute right-0 top-0 h-full w-full max-w-[900px] transform border-l border-white/10 bg-black/95 shadow-[-30px_0_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-500 ease-out ${
            showContact ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(37,99,235,0.12),rgba(102,154,247,0.06),transparent_42%)]" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-500/70">
                  Feedback
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  Suggestion Box
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

            <div className="flex-1 overflow-y-auto">
              <ContactSupportSection />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

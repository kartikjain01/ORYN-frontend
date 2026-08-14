// src/pages/HomePage.jsx
import LegalModal from '../components/LegalModal';

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { supabase } from "../supabaseClient";

// Layout & Sections
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import ProductShowcases from "../components/home/ProductShowcase";
import CtaBanner from "../components/home/CtaBanner";
import TrustedBy from "../components/home/TrustedBy";
import Footer from "../components/layout/Footer";

/* three.js is ~600 kB of the bundle and the hero renders perfectly without it.
   Code-splitting keeps it off the critical path; HeroCanvas additionally waits
   for an idle frame before creating the GL context. */
const HeroCanvas = lazy(() => import("../components/three/HeroCanvas"));

/* Entrance animation for each slide.
   IMPORTANT: this must never be applied to the element that carries
   `snap-start`. A transform shifts the element's snap box, the browser
   re-snaps to the new position, which re-fires the animation — a
   feedback loop that reads as jitter. The snap target stays a plain
   div; only the inner wrapper animates. `once: true` for the same
   reason: a viewport-height slide sits right on the intersection
   threshold and would otherwise re-trigger on every scroll nudge. */
const slideIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

/* min-h-screen so every section fills a slide; pt-24 clears the
   floating navbar; content is vertically centred within what's left. */
const slideClass =
  'relative flex min-h-screen snap-start items-center px-0 pt-24 pb-8';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [legalModal, setLegalModal] = useState(null);

  /* Hero parallax. Tracked from the band's own top edge to the point where it
     has fully left the viewport, so the handoff is tied to the seam rather than
     to absolute page position.

     These are motion values, not state — they drive the transform off the main
     render loop and never re-render the page. The transform goes on the inner
     <section>, never on the band itself: the band is the snap target, and
     moving a snap box makes the browser re-snap to the position it just
     created, which loops as jitter. */
  const heroBandRef = useRef(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroBandRef,
    offset: ['start start', 'end start'],
  });

  /* Lags the scroll slightly — the hero recedes as the next section rises. */
  const heroY = useTransform(heroProgress, [0, 1], [0, -70]);

  /* Holds full strength until the hero has largely scrolled past, then goes out
     before the seam so it never bleeds over the light section underneath.

     Callback form, not the (range, range) form, and that is deliberate: for the
     array form Motion compiles opacity into a native ScrollTimeline animation,
     whose range is measured differently from this hook's `offset` — the two
     disagree badly enough that opacity only reached 0.79 across the whole band.
     A callback can't be expressed as keyframes, so it stays on the JS path and
     tracks the same progress the transform does. */
  const heroOpacity = useTransform(() => {
    const p = heroProgress.get();
    return 1 - Math.min(1, Math.max(0, (p - 0.4) / 0.5));
  });

  /* ✅ FETCH USER SESSION */
  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted && session?.user) {
          setUser(session.user);

          console.log('Logged in as:', session.user.email);
        }
      } catch (err) {
        console.error('Error fetching session:', err.message);
      }
    };

    getSession();

    /* ✅ AUTH LISTENER */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
      }
    });

    /* ✅ CLEANUP */
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ✅ SCROLL TO SECTION AFTER NAVIGATION */
  useEffect(() => {
    const target = sessionStorage.getItem('scrollTarget');

    if (target) {
      setTimeout(() => {
        const element = document.getElementById(target);

        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }

        sessionStorage.removeItem('scrollTarget');
      }, 120);
    }
  }, []);

  /* ✅ PAGE SCROLL FIX */
  useEffect(() => {
    document.body.style.overflowX = 'hidden';

    return () => {
      document.body.style.overflowX = 'auto';
    };
  }, []);

  /* overflow-x-clip on the shell, NOT overflow-hidden: `hidden` makes the div
     a scroll container, and a scroll container is what `position: sticky`
     resolves against — every sticky child would pin to a box that never
     scrolls, i.e. never pin at all. `clip` still trims horizontal bleed but
     creates no scrollport, so the product stack keeps sticking to the
     viewport. */
  return (
    <div className="relative min-h-screen overflow-x-clip bg-page text-fg">
      {/* ✅ NAVBAR */}
      <Navbar user={user} />

      {/* ✅ MAIN CONTENT — each section is a full-viewport "slide" that
          snaps into place on scroll (scroll-snap on the outer shell below) */}
      <main className="relative z-10">
        {/* ================= DARK BAND — hero only =================
            pb-28 is load-bearing: the blend-out below is an opaque ramp to the
            page colour, and the hero copy is white. Without clearance the
            paragraph turns white-on-white and disappears into the seam. */}
        {/* data-nav-* is read by the Navbar's surface observer: it samples
            whatever is rendered directly beneath the bar and re-tones the
            glass to match, so the bar never sits light-on-light or
            dark-on-dark. `section` additionally drives the active pill. */}
        <div
          ref={heroBandRef}
          data-nav-tone="dark"
          data-nav-section="home"
          className="relative flex min-h-screen snap-start flex-col justify-center overflow-hidden bg-ink-950 pb-28 text-fg-invert"
        >
          {/* Depth wash */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0
              bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.30),transparent_38%),
              radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.08),transparent_24%)]
            "
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[-120px] top-[10%] h-[280px] w-[280px] rounded-full bg-blue-500/20 blur-[120px]"
          />

          {/* WebGL voice field — audio-reactive, self-disabling where WebGL,
              Data Saver or the GPU can't support it. Purely decorative, so it
              sits below every piece of hero content. */}
          <Suspense fallback={null}>
            <HeroCanvas className="z-0" />
          </Suspense>

          {/* HERO — drifts up and dissolves as the band scrolls away, so the
              hero hands off to the next section instead of being cut from it. */}
          <motion.section
            id="home"
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 scroll-mt-32"
          >
            <HeroSection />
          </motion.section>

          {/* Blend into the light body below.
              Hand-placed stops rather than `from-transparent to-page`: a plain
              two-stop ramp is linear in alpha, and linear alpha over black
              reads as a flat grey band sitting in the middle of the seam. These
              stops hold near-zero through the top half, then accelerate, which
              is what actually looks like one surface becoming another. */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-x-0 bottom-0 z-20 h-64
              bg-[linear-gradient(to_bottom,rgba(247,249,252,0)_0%,rgba(247,249,252,0.015)_28%,rgba(247,249,252,0.06)_46%,rgba(247,249,252,0.16)_60%,rgba(247,249,252,0.36)_72%,rgba(247,249,252,0.64)_83%,rgba(247,249,252,0.88)_92%,rgb(247,249,252)_100%)]
            "
          />
        </div>

        {/* ================= LIGHT BODY — one full-screen slide per section ================= */}
        {/* PRODUCT SHOWCASES — one slide per product, directly under the hero.
            Each brings its own snap target and tone, so it isn't wrapped in
            the shared slideClass. The first one carries the `features` anchor
            that the navbar and the closing CTA scroll to. */}
        <ProductShowcases />

        {/* WHY CHOOSE US */}
        <section data-nav-tone="light" className={slideClass}>
          <motion.div {...slideIn} className="w-full">
            <WhyChooseUs />
          </motion.div>
        </section>

        {/* CLOSING SLIDE — CTA + social proof + footer share one snap point
            so none of them sits alone in a mostly-empty screen, and the
            footer stays reachable past the last snap position. */}
        <section
          /* `impact` is the target for Why Choose Us' "See Our Impact" button
             — the social-proof and CTA block is the closest thing the page
             has to an impact section, and a button that scrolls nowhere is
             worse than no button. */
          id="impact"
          data-nav-tone="light"
          className="relative flex min-h-screen snap-start flex-col justify-between pt-24"
        >
          <motion.div {...slideIn} className="flex w-full flex-1 flex-col justify-center">
            <CtaBanner />
            <TrustedBy />
          </motion.div>

          <Footer
            onTerms={() => setLegalModal('terms')}
            onPrivacy={() => setLegalModal('privacy')}
          />
        </section>
      </main>
      <LegalModal
        open={legalModal !== null}
        type={legalModal}
        onClose={() => setLegalModal(null)}
      />
    </div>
  );
}

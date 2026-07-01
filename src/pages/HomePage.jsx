// src/pages/HomePage.jsx
import LegalModal from '../components/LegalModal';

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Layout & Sections
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import FeatureCards from "../components/home/FeatureCards";
import FeaturedProduction from "../components/home/FeaturedProduction";
import WhyChooseUs from "../components/home/WhyChooseUs";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [legalModal, setLegalModal] = useState(null);

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050014] text-white">
      {/* ✅ GLOBAL BACKGROUND */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0 -z-10
          bg-[radial-gradient(circle_at_top,rgba(88,28,135,0.35),transparent_30%),
          radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.10),transparent_20%),
          linear-gradient(to_bottom,#070014,#04000d_45%,#020007)]
        "
      />

      {/* ✅ EXTRA GLOW EFFECTS */}
      <div className="pointer-events-none absolute left-[-120px] top-[10%] h-[280px] w-[280px] rounded-full bg-fuchsia-500/20 blur-[120px]" />

      <div className="pointer-events-none absolute right-[-120px] top-[30%] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-[130px]" />

      {/* ✅ NOISE OVERLAY */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* ✅ NAVBAR */}
      <Navbar user={user} />

      {/* ✅ MAIN CONTENT */}
      <main className="relative z-10">
        {/* HERO */}
        <section id="home" className="scroll-mt-32">
          <HeroSection />
        </section>

        {/* FEATURE CARDS */}
        <section className="relative">
          <FeatureCards />
        </section>

        <section className="relative">
          <FeaturedProduction />
        </section>

        {/* WHY CHOOSE US */}
        <section className="relative">
          <WhyChooseUs
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
      {/* ✅ BOTTOM FADE */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-[#020007] to-transparent" />
    </div>
  );
}

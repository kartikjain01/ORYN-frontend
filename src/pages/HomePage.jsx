// src/pages/HomePage.jsx

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

  useEffect(() => {
    let isMounted = true;

    // Get current session
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted && session?.user) {
          setUser(session.user);
          console.log("Logged in as:", session.user.email);
        }
      } catch (err) {
        console.error("Error fetching session:", err.message);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
      }
    });

    // Cleanup
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050014] text-white overflow-hidden">
      
      {/* Background Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(88,28,135,0.35),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.10),transparent_20%),linear-gradient(to_bottom,#070014,#04000d_45%,#020007)]"
      />

      {/* Navbar */}
      <Navbar user={user} />

      {/* Main Content */}
      <main>
        <HeroSection user={user} />
        <FeatureCards />
        <FeaturedProduction />
        <WhyChooseUs />
      </main>

    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import FeatureCards from "../components/home/FeatureCards";
import FeaturedProduction from "../components/home/FeaturedProduction";
import WhyChooseUs from "../components/home/WhyChooseUs";

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for an active session immediately
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        console.log("Logged in as:", session.user.email);
      }
    };

    getSession();

    // Listen for changes (like if they sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050014] text-white">
      {/* Optimized Background Layer */}
      <div 
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(88,28,135,0.35),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.10),transparent_20%),linear-gradient(to_bottom,#070014,#04000d_45%,#020007)]" 
        aria-hidden="true"
      />

      {/* Navigation - Passing user info so Navbar can show "Profile" instead of "Login" */}
      <Navbar user={user} />
       
      {/* Main Content Sections */}
      <main>
        {/* You can pass the user to the HeroSection to say "Welcome back, Kartik!" */}
        <HeroSection user={user} />
        <FeatureCards />
        <FeaturedProduction />
        <WhyChooseUs />
      </main>
    </div>
  );
}
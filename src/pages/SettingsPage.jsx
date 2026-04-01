import { supabase } from "../supabaseClient";
import {
    ArrowLeft,
    CreditCard,
    Shield,
    User,
    Waves,
  } from "lucide-react";
  import { useNavigate } from "react-router-dom";

  function SectionCard({ title, children }) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
      </div>
    );
  }

  function SmallButton({ children, onClick, className = "" }) {
    return (
      <button
        onClick={onClick}
        className={`rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 ${className}`}
      >
        {children}
      </button>
    );
  }

  function ProgressRow({ label, current, total, width }) {
    return (
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span>
            {current} / {total}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
            style={{ width }}
          />
        </div>
      </div>
    );
  }

  export default function SettingsPage() {
    const navigate = useNavigate();

    return (
      <div className="min-h-screen text-white bg-[#020008] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(236,72,153,0.5),rgba(168,85,247,0.3),transparent_50%),linear-gradient(180deg,#010004,#050012,#020008)]" />

        <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-6">
          {/* Top Bar */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded-xl">
              Save Changes
            </button>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-semibold">Settings</h1>
            <p className="text-white/50 text-sm mt-1">
              Manage your account and preferences
            </p>
          </div>

          {/* Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile */}
              <SectionCard title="Profile">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Sumit Saini</h3>
                    <p className="text-white/50 text-sm">
                      techlearn3220@gmail.com
                    </p>
                  </div>

                  <SmallButton>Edit</SmallButton>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    className="bg-white/5 border border-white/10 rounded-xl p-3"
                    placeholder="Full Name"
                  />
                  <input
                    className="bg-white/5 border border-white/10 rounded-xl p-3"
                    placeholder="Email"
                  />
                </div>
              </SectionCard>

              {/* Voice Defaults */}
              <SectionCard title="Voice Defaults">
                <div className="grid md:grid-cols-2 gap-4">
                  <select className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <option>Default Voice</option>
                  </select>

                  <select className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <option>MP3</option>
                    <option>WAV</option>
                  </select>

                  <select className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <option>English</option>
                    <option>Hindi</option>
                  </select>

                  <input type="range" className="col-span-2" />
                </div>
              </SectionCard>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* Usage */}
              <SectionCard title="Usage & Plan">
                <div className="mb-4 flex justify-between items-center">
                  <span>Free Plan</span>
                  <SmallButton>Upgrade</SmallButton>
                </div>

                <div className="space-y-4">
                  <ProgressRow
                    label="Voice Clones"
                    current="2"
                    total="10"
                    width="20%"
                  />
                  <ProgressRow
                    label="Characters"
                    current="12k"
                    total="50k"
                    width="30%"
                  />
                </div>
              </SectionCard>

              {/* Security */}
              <SectionCard title="Security">
                <div className="space-y-3">
                  <SmallButton>Change Password</SmallButton>
                  <SmallButton
                  onClick={async () => {
                    await supabase.auth.signOut({ scope: "global" });
                    window.location.href = '/';
                  }}
                  >Logout All Devices</SmallButton>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

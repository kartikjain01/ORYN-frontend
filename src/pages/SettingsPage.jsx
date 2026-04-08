import { supabase } from "../supabaseClient";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  User,
  Waves,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useProfile } from "../context/ProfileContext";

/* ================= EXISTING COMPONENTS (UNCHANGED) ================= */

function SectionCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
    >
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}

function SmallButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition ${className}`}
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
        <span>{current} / {total}</span>
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

/* ================= MAIN COMPONENT ================= */

export default function SettingsPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState("");
  const { setProfile } = useProfile();
  /* ================= FETCH USER ================= */
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      const userData = {
        name: user?.user_metadata?.full_name || "",
        avatar: user?.user_metadata?.avatar_url || "",
        email: user?.email || "",
      };
      setName(user?.user_metadata?.full_name || "");
      setPreview(user?.user_metadata?.avatar_url || null);
          // 🔥 sync global
    setProfile(userData);
    };

    loadUser();
  }, []);

  /* ================= TOAST ================= */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* ================= AVATAR UPLOAD ================= */
  const handleAvatarUpload = async (file) => {
    if (!file) return;

    const filePath = `avatars/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (error) return showToast("Upload failed ❌");

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setPreview(data.publicUrl);
    showToast("Avatar uploaded ✅");
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        avatar_url: preview,
      },
    });

    if (error) return showToast("Error saving ❌");
    const updatedProfile = {
      name,
      avatar: preview,
      email: user?.email,
    };
  
    // 🔥 update global instantly
    setProfile(updatedProfile);

    showToast("Profile updated 🚀");

    // 🔥 AUTO REFRESH USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  return (
    <div className="min-h-screen relative bg-gray-50 text-black overflow-hidden p-6">
{/* PREMIUM BACKGROUND */}
<div className="absolute inset-0 pointer-events-none">
  <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-200/40 blur-[120px] rounded-full" />
  <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-200/40 blur-[120px] rounded-full" />
</div>
      
      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 bg-white/90 text-black px-4 py-2 rounded-xl border border-gray-200 backdrop-blur-md z-50">
          {toast}
        </div>
      )}


      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-gray/70 hover:text-gray"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            onClick={handleSave}
            className="bg-black text-white px-4 py-2 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-all duration-200"
          >
            Save Changes
          </button>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray/50 text-sm mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* PROFILE (ENHANCED — NOTHING REMOVED) */}
            <SectionCard title="Profile">
              
              {/* TOP INFO */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    {name || "Your Name"}
                  </h3>
                  <p className="text-gray/50 text-sm">
                    {user?.email}
                  </p>
                </div>

                <SmallButton>Edit</SmallButton>
              </div>

              {/* 🔥 AVATAR UPLOAD */}
              <div className="flex items-center gap-4 mb-6">
                <label className="cursor-pointer">
                  <div className="w-15 h-15 rounded-full bg-gradient-to-br from-[#8b3dff] to-[#7cecff] flex items-center justify-center text-xl font-bold overflow-hidden">
                    {preview ? (
                      <img
                        src={preview}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.email?.charAt(0).toUpperCase()
                    )}
                  </div>

                  <input
                    type="file"
                    hidden
                    onChange={(e) =>
                      handleAvatarUpload(e.target.files[0])
                    }
                  />
                </label>

                <p className="text-sm text-black/50">
                  Click to upload avatar
                </p>
              </div>

              {/* INPUTS (UNCHANGED + CONNECTED) */}
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border border-gray/10 rounded-xl p-3"
                  placeholder="Full Name"
                />
                <input
                  value={user?.email || ""}
                  disabled
                  className="bg-white/5 border border-gray/10 rounded-xl p-3 opacity-60"
                  placeholder="Email"
                />
              </div>
            </SectionCard>

            {/* Voice Defaults (UNCHANGED) */}
            <SectionCard title="Voice Defaults (coming soon)">
              <div className="grid md:grid-cols-2 gap-4">
                <select className="ml-[6px] bg-white/5 border border-gray/10 rounded-xl p-3">
                  <option>Default Voice </option>
                </select>

                <select className="ml-[6px] bg-white/5 border border-gray/10 rounded-xl p-3">
                  <option>MP3</option>
                  <option>WAV</option>
                </select>

                <select className="ml-[6px] bg-white/5 border border-gray/10 rounded-xl p-3">
                  <option>English</option>
                  <option>Hindi</option>
                </select>

                <input type="range" className="col-span-2" />
              </div>
            </SectionCard>
          </div>

          {/* RIGHT (UNCHANGED) */}
          <div className="space-y-6">

            <SectionCard title="Usage & Plan (coming soon)">
              <div className="mb-4 flex justify-between items-center">
                <span>Free Plan</span>
                <SmallButton>Upgrade</SmallButton>
              </div>

              <div className="space-y-4">
                <ProgressRow label="Voice Clones" current="2" total="10" width="20%" />
                <ProgressRow label="Characters" current="12k" total="50k" width="30%" />
              </div>
            </SectionCard>

            <SectionCard title="Security">
      <div className="space-y-3">
        
        <SmallButton
          onClick={() =>
            navigate("/forgot-password", {
              state: { fromSettings: true },
            })
          }
        >
          Change Password
        </SmallButton>

        <SmallButton
          onClick={async () => {
            await supabase.auth.signOut({ scope: "global" });
            window.location.href = "/";
          }}
        >
          Logout All Devices
        </SmallButton>

      </div>
    </SectionCard>

          </div>
        </div>
      </div>
    </div>
  );
}
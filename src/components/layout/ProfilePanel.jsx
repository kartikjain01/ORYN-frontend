import { useProfile } from "../../context/ProfileContext"; 
import {
  X,
  Settings,
  LogOut,
  User,
  Shield,
  CreditCard
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function ProfilePanel({ user }) {
  const { showProfile, setShowProfile, profile, setProfile } = useProfile();
  const navigate = useNavigate();

  /* 🔥 ESC KEY HANDLER */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowProfile(false);
      }
    };
  
    document.addEventListener("keydown", handleEsc);
  
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  /* 🔥 FETCH PROFILE */
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    };

    fetchProfile();
  }, [user]);

  if (!user) return null;

  const handleLogoutAll = async () => {
    await supabase.auth.signOut({ scope: "global" });
    navigate("/");
  };

  return (
    <AnimatePresence>
      {showProfile && (
        <>
          {/* OVERLAY */}
          <motion.div
          
            onClick={() => setShowProfile(false)}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* PANEL */}
          <motion.div
              key="panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            className="fixed top-5 right-6 w-[320px] bg-[#0b0616] p-5 z-50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-white/10 backdrop-blur-xl"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-lg font-semibold">Profile</h2>
              <X
                onClick={() => setShowProfile(false)}
                className="text-white/60 hover:text-white cursor-pointer"
              />
            </div>

            {/* USER INFO */}
            <div className="flex flex-col items-center text-center">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xl">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
              )}

              <p className="mt-4 text-white font-semibold">
                {profile?.name || "User"}
              </p>

              <p className="text-white/50 text-sm">{user?.email}</p>
            </div>

            {/* ACCOUNT INFO */}
            <div className="mt-6 bg-white/5 rounded-xl p-4 space-y-2 text-sm">
              <p className="text-white/70">
                <strong>User ID:</strong> {user?.id}
              </p>
              <p className="text-white/70">
                <strong>Plan:</strong> {profile?.plan || "Free"}
              </p>
              <p className="text-white/70">
                <strong>Joined:</strong>{" "}
                {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* MAIN ACTIONS */}
            <div className="mt-6 space-y-2">
              <PanelItem
                icon={<User size={18} />}
                label="Edit Profile"
                onClick={() => { 
                  navigate("/settings");
                  setShowProfile(false);
                }}
              />

              <PanelItem
                icon={<Settings size={18} />}
                label="App Settings"
                onClick={() => 
                  {
                    navigate("/settings")
                  setShowProfile(false);
                  }}
              />

              <PanelItem
                icon={<CreditCard size={18} />}
                label="Manage Subscription"
              />
            </div>

            {/* SECURITY */}
            <div className="mt-6 space-y-2">
              <PanelItem
                icon={<Shield size={18} />}
                label="Change Password"
                onClick={() => {
                  navigate("/forgot-password");
                  setShowProfile(false);
                }}
              />

            </div>

            {/* LOGOUT */}
            <div className="mt-6">
              <PanelItem
                icon={<LogOut size={18} />}
                label="Logout"
                danger
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/register");
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ===== ITEM COMPONENT ===== */
function PanelItem({ icon, label, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition
      ${danger ? "text-red-400 hover:bg-red-500/10" : "text-white hover:bg-white/5"}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}
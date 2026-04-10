import { supabase } from "../supabaseClient";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useProfile } from "../context/ProfileContext";

/* ================= UI COMPONENTS ================= */

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

function SmallButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-200 transition"
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
          {current}/{total}
        </span>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
          style={{ width: width }}
        />
      </div>
    </div>
  );
}

/* ================= MAIN ================= */

export default function SettingsPage() {
  const navigate = useNavigate();

  const { profile, setProfile, fetchProfile, user } = useProfile();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [birthday, setBirthday] = useState('');
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState('');

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setPreview(profile.avatar_url || null);

      // 🔥 NEW FIELDS
      setAge(profile.age || '');
      setGender(profile.gender || '');
      setMobile(profile.mobile || '');
      setBirthday(profile.birthday || '');
    }
  }, [profile]);

  /* ================= TOAST ================= */

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  /* ================= AVATAR UPLOAD ================= */

  const handleAvatarUpload = async file => {
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();

      // ✅ Unique filename (fix cache issue)
      const fileName = `avatar_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      /* ================= STEP 1: GET OLD FILES ================= */
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (listError) {
        console.error('LIST ERROR:', listError);
      }

      /* ================= STEP 2: DELETE OLD FILES ================= */
      if (existingFiles && existingFiles.length > 0) {
        const oldPaths = existingFiles.map(file => `${user.id}/${file.name}`);

        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(oldPaths);

        if (deleteError) {
          console.error('DELETE ERROR:', deleteError);
        }
      }

      /* ================= STEP 3: UPLOAD NEW FILE ================= */
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error('UPLOAD ERROR:', uploadError);
        showToast('Upload failed ❌');
        return;
      }

      /* ================= STEP 4: GET PUBLIC URL ================= */
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      /* ================= STEP 5: UPDATE UI ================= */
      setPreview(publicUrl);

      /* ================= STEP 6: SAVE IN DB ================= */
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      /* ================= STEP 7: REFRESH ================= */
      await fetchProfile(user.id);

      showToast('Avatar updated ✅');
    } catch (err) {
      console.error(err);
      showToast('Something went wrong ❌');
    }
  };

  /* ================= SAVE PROFILE ================= */

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        avatar_url: preview,

        // 🔥 NEW FIELDS
        age,
        gender,
        mobile,
        birthday,
      })
      .eq('id', user.id);

    if (error) return showToast('Error saving ❌');

    // 🔥 refresh global state
    await fetchProfile(user.id);

    showToast('Profile updated 🚀');
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
            onClick={() => navigate('/')}
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
                    onChange={e => handleAvatarUpload(e.target.files[0])}
                  />
                </label>

                <p className="text-sm text-black/50">Click to upload avatar</p>
              </div>

              {/* TOP INFO */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    {name || 'Your Name'}
                  </h3>
                  <p className="text-gray/50 text-sm">{user?.email}</p>
                </div>

                <SmallButton>Edit</SmallButton>
              </div>

              {/* INPUTS */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Name */}
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-white/5 border border-gray/10 rounded-xl p-3"
                  placeholder="Full Name"
                />

                {/* Email */}
                <input
                  value={user?.email || ''}
                  disabled
                  className="bg-white/5 border border-gray/10 rounded-xl p-3 opacity-60"
                  placeholder="Email"
                />

                {/* Age */}
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="bg-white/5 border border-gray/10 rounded-xl p-3"
                  placeholder="Age"
                />

                {/* Gender */}
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="bg-white/5 border border-gray/10 rounded-xl p-3"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                {/* 📅 Birthday (Calendar Picker) */}
                <input
                  type="date"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  className="bg-white/5 border border-gray/10 rounded-xl p-3"
                />

                {/* 📱 Mobile with +91 */}
                <div className="flex">
                  <span className="bg-white/10 border border-gray/10 rounded-l-xl px-3 flex items-center text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="bg-white/5 border border-gray/10 rounded-r-xl p-3 w-full"
                    placeholder="Mobile Number"
                  />
                </div>
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

            <SectionCard title="Security">
              <div className="space-y-3">
                <SmallButton
                  onClick={() =>
                    navigate('/forgot-password', {
                      state: { fromSettings: true },
                    })
                  }
                >
                  Change Password
                </SmallButton>

                <SmallButton
                  onClick={async () => {
                    await supabase.auth.signOut({ scope: 'global' });
                    window.location.href = '/';
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

import { supabase } from "../supabaseClient";
import { resetAccount, getUsageStats } from "../lib/db";
import { ArrowLeft, User, CreditCard, Shield, Bell, Link2, Trash2, Check, X, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { useProfile } from "../context/ProfileContext";

function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-[17px] font-bold text-slate-900">{title}</h2>
        {description && <p className="text-[13px] text-slate-400 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-[14px] font-medium text-slate-700">{label}</p>
        {description && <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

const COUNTRY_CODES = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'China', code: '+86', flag: '🇨🇳' },
  { name: 'Russia', code: '+7', flag: '🇷🇺' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'Spain', code: '+34', flag: '🇪🇸' },
  { name: 'Italy', code: '+39', flag: '🇮🇹' },
  { name: 'South Korea', code: '+82', flag: '🇰🇷' },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
  { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'UAE', code: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
  { name: 'Nepal', code: '+977', flag: '🇳🇵' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { name: 'Sweden', code: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
  { name: 'Turkey', code: '+90', flag: '🇹🇷' },
  { name: 'Thailand', code: '+66', flag: '🇹🇭' },
  { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
  { name: 'Philippines', code: '+63', flag: '🇵🇭' },
  { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
  { name: 'Ireland', code: '+353', flag: '🇮🇪' },
  { name: 'Portugal', code: '+351', flag: '🇵🇹' },
  { name: 'Poland', code: '+48', flag: '🇵🇱' },
];

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'plan', label: 'Usage & Plan', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'connected', label: 'Connected Accounts', icon: Link2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, setProfile, fetchProfile, user } = useProfile();

  const [activeSection, setActiveSection] = useState('profile');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [birthday, setBirthday] = useState('');
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryDropdownRef = useRef(null);
  const [initialValues, setInitialValues] = useState({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [usageStats, setUsageStats] = useState(null);

  useEffect(() => { getUsageStats().then(setUsageStats); }, []);

  useEffect(() => {
    const handleClickOutside = e => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (profile) {
      const vals = {
        name: profile.full_name || '',
        avatar: profile.avatar_url || null,
        age: profile.age || '',
        gender: profile.gender || '',
        mobile: profile.mobile || '',
        birthday: profile.birthday || '',
      };
      setName(vals.name);
      setPreview(vals.avatar);
      setAge(vals.age);
      setGender(vals.gender);
      setMobile(vals.mobile);
      setBirthday(vals.birthday);
      setInitialValues(vals);
    }
  }, [profile]);

  const hasChanges = useMemo(() => {
    if (!initialValues.name && !name) return false;
    return (
      name !== initialValues.name ||
      age !== initialValues.age ||
      gender !== initialValues.gender ||
      mobile !== initialValues.mobile ||
      birthday !== initialValues.birthday ||
      preview !== initialValues.avatar
    );
  }, [name, age, gender, mobile, birthday, preview, initialValues]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);

  const handleAvatarUpload = file => {
    if (!file) return;
    setPendingAvatarFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
  };

  const handleRemoveAvatar = () => {
    setPendingAvatarFile(null);
    setPreview(null);
  };

  const handleSave = async () => {
    if (!user) return;
    let avatarUrl = preview;

    if (pendingAvatarFile) {
      try {
        const fileExt = pendingAvatarFile.name.split('.').pop();
        const fileName = `avatar_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: existingFiles } = await supabase.storage.from('avatars').list(user.id);
        if (existingFiles && existingFiles.length > 0) {
          const oldPaths = existingFiles.map(f => `${user.id}/${f.name}`);
          await supabase.storage.from('avatars').remove(oldPaths);
        }

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, pendingAvatarFile, { contentType: pendingAvatarFile.type });
        if (uploadError) { showToast('Avatar upload failed', 'error'); return; }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
        setPendingAvatarFile(null);
      } catch {
        showToast('Avatar upload failed', 'error');
        return;
      }
    } else if (preview === null && initialValues.avatar) {
      const { data: existingFiles } = await supabase.storage.from('avatars').list(user.id);
      if (existingFiles && existingFiles.length > 0) {
        const oldPaths = existingFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(oldPaths);
      }
      avatarUrl = null;
    }

    const { error } = await supabase.from('profiles').update({
      full_name: name,
      avatar_url: avatarUrl,
      age,
      gender,
      mobile,
      birthday,
    }).eq('id', user.id);

    if (error) return showToast('Error saving', 'error');
    await fetchProfile(user.id);
    showToast('Profile updated');
  };

  const handleDiscard = () => {
    setName(initialValues.name);
    setAge(initialValues.age);
    setGender(initialValues.gender);
    setMobile(initialValues.mobile);
    setBirthday(initialValues.birthday);
    setPreview(initialValues.avatar);
    setPendingAvatarFile(null);
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await resetAccount();
      window.location.href = '/';
    } catch (err) {
      console.error('Account reset failed:', err);
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      showToast('Failed to delete account data. Please try again.', 'error');
    }
  };

  const authProvider = user?.app_metadata?.provider || 'email';
  const isOAuth = authProvider === 'google' || authProvider === 'github';

  return (
    <div className="flex h-full">
      {/* Toast */}
      {toast.message && (
        <div className={`fixed top-5 right-5 flex items-center gap-2.5 px-5 py-3 rounded-xl border shadow-lg text-[14px] font-medium z-50 animate-fadeSlide ${
          toast.type === 'error'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            toast.type === 'error' ? 'bg-red-100' : 'bg-emerald-100'
          }`}>
            {toast.type === 'error' ? <X size={11} className="text-red-600" /> : <Check size={11} className="text-emerald-600" />}
          </div>
          {toast.message}
        </div>
      )}

      {/* Settings Sidebar Navigation */}
      <aside className="w-[260px] shrink-0 border-r border-slate-200 bg-white p-6 overflow-y-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[13px] font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#4f46e5] px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 cursor-pointer mb-6"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </button>

        <h1 className="text-[22px] font-bold text-slate-900 mb-1">Settings</h1>
        <p className="text-[13px] text-slate-400 mb-6">Manage your account</p>

        <nav className="space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Sticky Save Bar — floating pill */}
        <div className={`sticky top-4 z-40 flex justify-center transition-all duration-300 mb-4 ${hasChanges ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'}`}>
          <div className="flex items-center justify-between w-full max-w-[520px] bg-slate-900/95 backdrop-blur-xl rounded-full px-6 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/[0.08]">
            <span className="text-[12px] text-slate-300 font-medium">Unsaved changes</span>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleDiscard}
                className="h-[30px] px-4 rounded-full border border-white/12 text-[12px] font-medium text-slate-300 hover:bg-white/10 transition cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="h-[30px] px-5 rounded-full bg-white text-[12px] font-semibold text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl space-y-6">
          {/* Profile Section */}
          <div id="section-profile">
            <SectionCard title="Profile" description="Your personal information and avatar">
              <div className="flex items-center gap-4 mb-6">
                <label className="cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden ring-2 ring-slate-100 group-hover:ring-blue-200 transition">
                    {preview ? (
                      <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.email?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <input type="file" hidden accept="image/*" onChange={e => handleAvatarUpload(e.target.files[0])} />
                </label>
                <div>
                  <p className="text-[14px] font-medium text-slate-700">{name || 'Your Name'}</p>
                  <p className="text-[12px] text-slate-400">{user?.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[11px] text-blue-500 cursor-pointer hover:text-blue-600">Click avatar to change</p>
                    {preview && (
                      <button onClick={handleRemoveAvatar} className="text-[11px] text-red-400 hover:text-red-500 cursor-pointer">Remove</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Full Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                    Email
                    {isOAuth && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        <Lock size={8} />
                        Managed by {authProvider === 'google' ? 'Google' : 'GitHub'}
                      </span>
                    )}
                  </label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-400 bg-slate-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition"
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Birthday</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={e => setBirthday(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Mobile</label>
                  <div className="flex relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => { setShowCountryDropdown(!showCountryDropdown); setCountrySearch(''); }}
                      className="bg-slate-100 border border-slate-200 border-r-0 rounded-l-xl px-3 py-3 flex items-center gap-1.5 text-[13px] text-slate-600 font-medium cursor-pointer hover:bg-slate-50 transition min-w-[90px]"
                    >
                      <span>{COUNTRY_CODES.find(c => c.code === countryCode)?.flag}</span>
                      <span>{countryCode}</span>
                      <svg className="w-3 h-3 text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-[260px] bg-white rounded-xl border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
                        <div className="p-2 border-b border-slate-100">
                          <input
                            type="text"
                            autoFocus
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            placeholder="Search country..."
                            className="w-full px-3 py-2 text-[13px] rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-blue-400 transition"
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {COUNTRY_CODES.filter(c =>
                            c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                            c.code.includes(countrySearch)
                          ).map(c => (
                            <button
                              key={c.code + c.name}
                              type="button"
                              onClick={() => { setCountryCode(c.code); setShowCountryDropdown(false); }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] hover:bg-blue-50 transition cursor-pointer ${countryCode === c.code ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
                            >
                              <span className="text-[16px]">{c.flag}</span>
                              <span className="flex-1 text-left truncate">{c.name}</span>
                              <span className="text-slate-400 text-[12px]">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <input
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      onFocus={() => setShowCountryDropdown(false)}
                      className="border border-slate-200 rounded-r-xl px-4 py-3 text-[14px] text-slate-700 bg-slate-50 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition"
                      placeholder="Mobile Number"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Usage & Plan */}
          <div id="section-plan">
            <SectionCard title="Usage & Plan" description="Monitor your usage and manage subscription">
              <div className="flex items-center justify-between mb-5 p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-[15px] font-semibold text-slate-800">Free Plan</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">Unlimited access during early access</p>
                </div>
                <span className="h-[36px] px-5 rounded-xl bg-slate-100 text-slate-400 text-[13px] font-semibold flex items-center">
                  Plans Coming Soon
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Voice Clones", value: usageStats?.voiceClone ?? 0, color: "bg-blue-500" },
                  { label: "TTS Generated", value: usageStats?.tts ?? 0, color: "bg-indigo-500" },
                  { label: "Voice Editor", value: usageStats?.voiceEditor ?? 0, color: "bg-cyan-500" },
                  { label: "Captions", value: usageStats?.captions ?? 0, color: "bg-amber-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-medium text-slate-800">{item.value} {item.value === 1 ? 'project' : 'projects'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${usageStats?.total ? Math.max((item.value / usageStats.total) * 100, item.value > 0 ? 5 : 0) : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Notifications */}
          <div id="section-notifications">
            <SectionCard title="Notifications" description="Choose what you want to be notified about">
              <div className="space-y-0">
                <SettingRow label="Email Notifications" description="Get notified about account activity via email">
                  <ToggleSwitch enabled={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
                </SettingRow>
                <SettingRow label="Push Notifications" description="Browser push notifications for real-time updates">
                  <ToggleSwitch enabled={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} />
                </SettingRow>
                <SettingRow label="Marketing Emails" description="Receive product updates and feature announcements">
                  <ToggleSwitch enabled={marketingEmails} onToggle={() => setMarketingEmails(!marketingEmails)} />
                </SettingRow>
                <SettingRow label="Weekly Digest" description="Summary of your activity sent every Monday">
                  <ToggleSwitch enabled={weeklyDigest} onToggle={() => setWeeklyDigest(!weeklyDigest)} />
                </SettingRow>
              </div>
            </SectionCard>
          </div>

          {/* Connected Accounts */}
          <div id="section-connected">
            <SectionCard title="Connected Accounts" description="Link external services for faster login and integrations">
              <div className="space-y-0">
                <SettingRow label="Google" description={authProvider === 'google' ? 'Signed in with Google' : 'Sign in with Google'}>
                  {authProvider === 'google' ? (
                    <span className="inline-flex items-center gap-1.5 h-[34px] px-4 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] font-medium text-emerald-700">
                      <Check size={13} /> Connected
                    </span>
                  ) : (
                    <button className="h-[34px] px-4 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition cursor-pointer">
                      Connect
                    </button>
                  )}
                </SettingRow>
                <SettingRow label="GitHub" description={authProvider === 'github' ? 'Signed in with GitHub' : 'Link your GitHub account'}>
                  {authProvider === 'github' ? (
                    <span className="inline-flex items-center gap-1.5 h-[34px] px-4 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] font-medium text-emerald-700">
                      <Check size={13} /> Connected
                    </span>
                  ) : (
                    <button className="h-[34px] px-4 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition cursor-pointer">
                      Connect
                    </button>
                  )}
                </SettingRow>
                <SettingRow label="Discord" description="Connect for community features">
                  <button className="h-[34px] px-4 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition cursor-pointer">
                    Connect
                  </button>
                </SettingRow>
              </div>
            </SectionCard>
          </div>

          {/* Security */}
          <div id="section-security">
            <SectionCard title="Security" description="Manage your password and session security">
              <div className="space-y-0">
                <SettingRow label="Change Password" description={isOAuth ? `Password managed by ${authProvider === 'google' ? 'Google' : 'GitHub'}` : 'Update your account password'}>
                  <button
                    onClick={() => navigate('/forgot-password', { state: { fromSettings: true } })}
                    disabled={isOAuth}
                    className={`h-[34px] px-4 rounded-lg border text-[13px] font-medium transition cursor-pointer ${
                      isOAuth
                        ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    {isOAuth ? 'Not Available' : 'Change'}
                  </button>
                </SettingRow>
                <SettingRow label="Logout" description="Sign out from this device">
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = '/';
                    }}
                    className="h-[34px] px-4 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition cursor-pointer"
                  >
                    Logout
                  </button>
                </SettingRow>
              </div>
              <div className="mt-5 p-4 bg-slate-50 rounded-xl">
                <p className="text-[13px] text-slate-500">
                  <span className="font-medium text-slate-700">Last login:</span>{' '}
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
                    : 'Unknown'}
                </p>
              </div>
            </SectionCard>
          </div>

          {/* Danger Zone */}
          <div id="section-danger">
            <div className="rounded-2xl border border-red-200 bg-red-50/30 p-6">
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-red-700">Danger Zone</h2>
                <p className="text-[13px] text-red-400 mt-1">Irreversible actions — proceed with caution</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                  <div>
                    <p className="text-[14px] font-medium text-red-700">Delete Account</p>
                    <p className="text-[12px] text-red-400 mt-0.5">Permanently delete your account and all data</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="h-[34px] px-4 rounded-lg border border-red-200 bg-red-50 text-[13px] font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Account Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!isDeleting) { setShowDeleteModal(false); setDeleteConfirmText(''); } }} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px] mx-4 p-6 animate-fadeSlide">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900">Delete Account</h3>
                    <p className="text-[12px] text-slate-400">This action cannot be undone</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
                  <p className="text-[13px] text-red-700 leading-relaxed">
                    This will permanently erase all your <span className="font-semibold">projects</span>, <span className="font-semibold">cloned voices</span>, <span className="font-semibold">files</span>, and <span className="font-semibold">profile info</span>. Your account will stay active with a fresh environment — but your data cannot be recovered.
                  </p>
                </div>

                <div className="mb-5">
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">
                    Type <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    disabled={isDeleting}
                    placeholder="DELETE"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 bg-slate-50 focus:border-red-400 focus:ring-2 focus:ring-red-400/10 outline-none transition placeholder:text-slate-300"
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                    disabled={isDeleting}
                    className="flex-1 h-[42px] rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    className="flex-1 h-[42px] rounded-xl bg-red-600 text-[13px] font-semibold text-white hover:bg-red-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Wiping Data...
                      </>
                    ) : (
                      'Erase All Data'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom spacer */}
          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}

import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../supabaseClient";
import {
  LayoutDashboard,
  Mic2,
  Headphones,
  SlidersHorizontal,
  Captions,
  Folder,
  AudioLines,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  LogOut,
} from "lucide-react";

const topMenu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Voice Clone", icon: Mic2, path: "/voice-clone" },
  { name: "Text to Speech", icon: Headphones, path: "/text-to-speech" },
  { name: "Voice Editor", icon: SlidersHorizontal, path: "/voice-editor" },
  { name: "Captions", icon: Captions, path: "/caption-generation" },
];

const bottomMenu = [
  { name: "Projects", icon: Folder, path: "/projects" },
  // { name: "My Voices", icon: AudioLines, path: "/my-voices" },
  { name: "Analytics", icon: BarChart3, path: "/analytics", badge: "Soon" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    if (showProfile) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showProfile]);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-[240px]'} h-full bg-white border-r border-slate-200 flex flex-col shrink-0 relative transition-all duration-300`}>
      {/* Toggle button on border — at header intersection line */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[69px] w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 shadow-sm transition cursor-pointer z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className={`${collapsed ? 'px-4 justify-center' : 'px-7'} pt-7 pb-6 flex items-center`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            O
          </div>
          {!collapsed && (
            <h1 className="text-[18px] font-bold tracking-tight text-slate-900 whitespace-nowrap">
              OrynEngine
            </h1>
          )}
        </div>
      </div>

      {/* Top Menu */}
      <div className={`${collapsed ? 'px-2' : 'px-4'} flex-1`}>
        <div className="space-y-1">
          {topMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} h-11 ${collapsed ? 'px-0' : 'px-3'} rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
                    {!collapsed && <span className="text-[14px] whitespace-nowrap">{item.name}</span>}
                    {!collapsed && item.badge && <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">{item.badge}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="my-6 border-t border-slate-100" />

        <div className="space-y-1">
          {bottomMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} h-11 ${collapsed ? 'px-0' : 'px-3'} rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="text-[14px] font-medium whitespace-nowrap">{item.name}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile */}
      <div className={`${collapsed ? 'p-2' : 'p-4'} relative`} ref={profileRef}>
        {/* Profile popup */}
        {showProfile && (
          <div className={`absolute ${collapsed ? 'left-16' : 'left-4 right-4'} bottom-full mb-2 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden z-50`}>
            {/* User info */}
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[14px] font-semibold text-slate-800">{userName}</p>
              <p className="text-[12px] text-slate-400 truncate">{userEmail}</p>
            </div>
            {/* Menu items */}
            <div className="py-1">
              <button
                onClick={() => { setShowProfile(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <User size={16} />
                My Profile
              </button>
              <button
                onClick={() => { setShowProfile(false); navigate('/upgrade'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <CreditCard size={16} />
                Billing & Plan
              </button>
              <button
                onClick={() => { setShowProfile(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <Settings size={16} />
                Settings
              </button>
            </div>
            {/* Logout */}
            <div className="border-t border-slate-100 py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        )}

        <div
          onClick={() => setShowProfile(!showProfile)}
          className={`border border-slate-200 rounded-2xl ${collapsed ? 'p-2 justify-center' : 'p-4 justify-between'} flex items-center cursor-pointer hover:bg-slate-50 transition-all duration-200`}
        >
          <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div>
                <h3 className="font-semibold text-slate-800 text-[14px]">{userName}</h3>
                <p className="text-[12px] font-medium text-blue-600">Free Plan</p>
              </div>
            )}
          </div>
          {!collapsed && <ChevronDown size={18} className={`text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />}
        </div>
      </div>
    </aside>
  );
}

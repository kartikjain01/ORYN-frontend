import { useState, useRef, useEffect } from "react";
import { Search, Bell, Plus, X, Mic2, Headphones, SlidersHorizontal, Captions, Sparkles, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

const PROJECT_TOOLS = [
  {
    id: 'voice-clone',
    name: 'Voice Clone',
    description: 'Clone any voice with AI precision',
    icon: Mic2,
    path: '/voice-clone',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'from-violet-50 to-purple-50',
    shadowColor: 'rgba(139,92,246,0.3)',
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text into natural speech',
    icon: Headphones,
    path: '/text-to-speech',
    gradient: 'from-blue-500 to-cyan-500',
    lightBg: 'from-blue-50 to-cyan-50',
    shadowColor: 'rgba(59,130,246,0.3)',
  },
  {
    id: 'voice-editor',
    name: 'Voice Editor',
    description: 'Enhance and polish your audio',
    icon: SlidersHorizontal,
    path: '/voice-editor',
    gradient: 'from-emerald-500 to-teal-500',
    lightBg: 'from-emerald-50 to-teal-50',
    shadowColor: 'rgba(16,185,129,0.3)',
  },
  {
    id: 'caption-generation',
    name: 'Caption Generation',
    description: 'Generate captions for any media',
    icon: Captions,
    path: '/caption-generation',
    gradient: 'from-amber-500 to-orange-500',
    lightBg: 'from-amber-50 to-orange-50',
    shadowColor: 'rgba(245,158,11,0.3)',
  },
];

const TYPE_DOT = {
  info: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  update: 'bg-violet-500',
};

export default function DashboardHeader() {
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const panelRef = useRef(null);

  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications();

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifs]);

  const handleToolSelect = (path) => {
    setShowNewProject(false);
    navigate(path);
  };

  const recentNotifs = notifications.slice(0, 5);

  return (
    <>
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center px-8 gap-4">
        {/* Search */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-[520px]">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full h-[44px] rounded-xl border border-slate-200 bg-slate-50 pl-14 pr-5 text-[15px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Notification Bell */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-[44px] h-[44px] rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition cursor-pointer"
            >
              <Bell size={18} className="text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 min-w-[18px] h-[18px] rounded-full bg-blue-600 flex items-center justify-center px-1">
                  <span className="text-[10px] font-bold text-white leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </button>

            {/* Floating notification panel */}
            {showNotifs && (
              <div className="absolute right-0 top-[54px] w-[380px] bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-slate-800">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <>
                        <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                        <button
                          onClick={markAllRead}
                          className="text-[11px] font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition"
                        >
                          <Check size={12} />
                          Read all
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="max-h-[340px] overflow-y-auto">
                  {recentNotifs.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <Bell size={24} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-slate-400 text-[14px]">No notifications yet</p>
                    </div>
                  ) : (
                    recentNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { if (!n.isRead) markRead(n.id); }}
                        className={`px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? (TYPE_DOT[n.type] || 'bg-blue-500') : 'bg-slate-200'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-medium ${!n.isRead ? 'text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                          {n.body && <p className="text-[12px] text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>}
                          <p className="text-[11px] text-slate-300 mt-1">{n.time}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className="px-5 py-3 border-t border-slate-100">
                    <button
                      onClick={() => { setShowNotifs(false); navigate('/notifications'); }}
                      className="w-full text-center text-[13px] font-medium text-blue-600 hover:text-blue-700 transition"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowNewProject(true)}
            className="h-[44px] px-6 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white text-[14px] font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>
      </header>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowNewProject(false)}>
          <div className="w-full max-w-[520px] rounded-2xl bg-white overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.15)] border border-slate-100" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="relative px-7 pt-7 pb-5">
              <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                  <Sparkles size={16} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-slate-900">Create New Project</h2>
                  <p className="text-[13px] text-slate-500">Choose a tool to get started</p>
                </div>
              </div>
              <button onClick={() => setShowNewProject(false)} className="absolute top-6 right-6 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                <X size={16} />
              </button>
            </div>

            {/* Tool Options */}
            <div className="px-7 pb-7 grid grid-cols-1 gap-2.5">
              {PROJECT_TOOLS.map(tool => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.path)}
                    className="group relative flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200/80 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-blue-50/30 hover:shadow-[0_4px_16px_rgba(37,99,235,0.08)] transition-all duration-200 text-left"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-200`} style={{ boxShadow: `0 4px 14px ${tool.shadowColor}` }}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold text-slate-800 group-hover:text-slate-900">{tool.name}</h3>
                      <p className="text-[12px] text-slate-400 group-hover:text-slate-500">{tool.description}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

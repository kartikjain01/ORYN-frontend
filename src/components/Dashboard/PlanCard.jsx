import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles } from "lucide-react";
import { getUsageStats } from "../../lib/db";

function formatMinutes(mins) {
  if (mins < 1) return '0m';
  return `${Math.round(mins)}m`;
}

function formatStorage(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}

export default function PlanCard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getUsageStats().then(setStats);
  }, []);

  const usage = stats ? [
    { name: "Voice Clone", value: formatMinutes(stats.voiceCloneMinutes), color: "bg-blue-600" },
    { name: "TTS Generated", value: formatMinutes(stats.ttsMinutes), color: "bg-indigo-500" },
    { name: "Voice Editor", value: formatMinutes(stats.voiceEditorMinutes), color: "bg-cyan-500" },
    { name: "Storage", value: formatStorage(stats.storageBytes), color: "bg-sky-500" },
  ] : [
    { name: "Voice Clone", value: "—", color: "bg-blue-600" },
    { name: "TTS Generated", value: "—", color: "bg-indigo-500" },
    { name: "Voice Editor", value: "—", color: "bg-cyan-500" },
    { name: "Storage", value: "—", color: "bg-sky-500" },
  ];

  const totalMinutes = stats ? stats.voiceCloneMinutes + stats.ttsMinutes + stats.voiceEditorMinutes : 0;
  const usagePercent = Math.min(Math.round(totalMinutes), 100);
  const circumference = 289;
  const dashOffset = circumference - (circumference * usagePercent) / 100;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-blue-50 flex items-center justify-center p-1.5">
            <Crown size={12} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-slate-900">Free Plan</h2>
            <p className="text-[10px] text-slate-400">Usage this month</p>
          </div>
        </div>
        <Sparkles size={18} className="text-slate-300" />
      </div>

      <div className="flex items-center justify-between mt-7">
        <div className="relative w-[120px] h-[120px]">
          <svg viewBox="1 1 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="46" stroke="#e2e8f0" strokeWidth="10" fill="none" />
            <circle
              cx="60" cy="60" r="46"
              stroke="url(#planGradientLight)"
              strokeWidth="10" strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
            />
            <defs>
              <linearGradient id="planGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[26px] font-bold text-slate-900">{usagePercent}%</span>
          </div>
        </div>

        <div className="space-y-4">
          {usage.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-[10px] text-slate-500">{item.name}</span>
              </div>
              <span className="text-[13px] font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100" />

      <button
        onClick={() => navigate('/upgrade')}
        className="w-full h-[42px] rounded-xl bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white text-[15px] font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 cursor-pointer"
      >
        Upgrade Plan
      </button>
    </div>
  );
}

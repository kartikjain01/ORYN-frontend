import { useEffect, useState } from "react";
import { Crown, Sparkles } from "lucide-react";
import { getUsageStats } from "../../lib/db";

export default function PlanCard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getUsageStats().then(setStats);
  }, []);

  const usage = stats ? [
    { name: "Voice Clone", value: stats.voiceClone, color: "bg-blue-600" },
    { name: "TTS Generated", value: stats.tts, color: "bg-indigo-500" },
    { name: "Voice Editor", value: stats.voiceEditor, color: "bg-cyan-500" },
    { name: "Captions", value: stats.captions, color: "bg-amber-500" },
  ] : [
    { name: "Voice Clone", value: "—", color: "bg-blue-600" },
    { name: "TTS Generated", value: "—", color: "bg-indigo-500" },
    { name: "Voice Editor", value: "—", color: "bg-cyan-500" },
    { name: "Captions", value: "—", color: "bg-amber-500" },
  ];

  const total = stats ? stats.total : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-blue-50 flex items-center justify-center p-1.5">
            <Crown size={12} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-slate-900">Free Plan</h2>
            <p className="text-[10px] text-slate-400">Your projects</p>
          </div>
        </div>
        <Sparkles size={18} className="text-slate-300" />
      </div>

      <div className="flex items-center justify-between mt-7">
        <div className="relative w-[120px] h-[120px]">
          <svg viewBox="1 1 120 120" className="w-full h-full">
            <circle cx="60" cy="60" r="46" stroke="#e2e8f0" strokeWidth="10" fill="none" />
            <circle
              cx="60" cy="60" r="46"
              stroke="url(#planGradientLight)"
              strokeWidth="10" strokeLinecap="round"
              fill="none"
              strokeDasharray="289" strokeDashoffset="0"
            />
            <defs>
              <linearGradient id="planGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-bold text-slate-900">{total}</span>
            <span className="text-[10px] text-slate-400 -mt-0.5">total</span>
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
        className="w-full h-[42px] rounded-xl bg-slate-100 text-slate-400 text-[15px] font-semibold transition-all duration-200 cursor-default"
        disabled
      >
        Plans Coming Soon
      </button>
    </div>
  );
}

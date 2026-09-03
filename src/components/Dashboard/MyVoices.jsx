import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, MoreVertical, AudioLines } from "lucide-react";
import { getRecentVoices } from "../../lib/db";

export default function MyVoices() {
  const navigate = useNavigate();
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentVoices(4).then(data => { setVoices(data); setLoading(false); });
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[20px] font-bold text-slate-900">My Voices</h2>
        <button
          onClick={() => navigate('/my-voices')}
          className="h-9 px-4 rounded-lg text-[13px] border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-600 hover:text-slate-800 shadow-sm transition cursor-pointer"
        >
          View All
        </button>
      </div>

      <div className="max-h-[249px] overflow-y-auto space-y-1">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                <div className="h-2.5 bg-slate-100 rounded w-1/3 mt-1.5" />
              </div>
            </div>
          ))
        ) : voices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AudioLines size={28} className="text-slate-200 mb-2" />
            <p className="text-[12px] text-slate-400">No voices yet</p>
            <p className="text-[10px] text-slate-300">Clone or generate a voice to get started</p>
          </div>
        ) : (
          voices.map((voice) => (
            <div key={voice.id} className="flex items-center gap-3 group hover:bg-slate-50 rounded-xl px-3 py-3 transition cursor-pointer">
              <button className={`w-10 h-10 rounded-full ${voice.playColor} flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shrink-0`}>
                <Play size={14} fill="currentColor" className={voice.iconColor} />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-slate-800">{voice.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{voice.date}</p>
              </div>
              <button className="text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0">
                <MoreVertical size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

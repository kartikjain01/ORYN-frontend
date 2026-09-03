import { useCallback, useEffect, useState } from "react";
import { Search, Play, Pause, MoreHorizontal, Pencil, Download, Trash2, AudioLines } from "lucide-react";
import { getVoices, deleteVoice, renameVoice } from "../lib/db";

const FILTERS = ['All', 'Voice Clone', 'TTS'];

export default function MyVoicesPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [audioRef] = useState(() => new Audio());

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getVoices({ type: activeFilter, search: searchQuery });
    setVoices(data);
    setLoading(false);
  }, [activeFilter, searchQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    return () => { audioRef.pause(); audioRef.src = ''; };
  }, [audioRef]);

  const togglePlay = (voice) => {
    if (playingId === voice.id) {
      audioRef.pause();
      setPlayingId(null);
    } else {
      if (voice.audioUrl) {
        audioRef.src = voice.audioUrl;
        audioRef.play().catch(() => {});
        audioRef.onended = () => setPlayingId(null);
      }
      setPlayingId(voice.id);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this voice?')) return;
    await deleteVoice(id);
    setVoices(prev => prev.filter(v => v.id !== id));
    setOpenMenu(null);
  };

  const handleRenameStart = (voice) => {
    setRenameId(voice.id);
    setRenameValue(voice.name);
    setOpenMenu(null);
  };

  const handleRenameSubmit = async () => {
    if (!renameValue.trim()) return;
    await renameVoice(renameId, renameValue.trim());
    setVoices(prev => prev.map(v => v.id === renameId ? { ...v, name: renameValue.trim() } : v));
    setRenameId(null);
  };

  const handleExport = (voice) => {
    if (voice.audioUrl) window.open(voice.audioUrl, '_blank');
    setOpenMenu(null);
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">My Voices</h1>
        <p className="text-[14px] text-slate-500 mt-1">{voices.length} voices</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                activeFilter === f
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search voices..."
            className="h-[36px] w-[200px] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 bg-slate-100 rounded w-1/3" />
                <div className="h-2.5 bg-slate-100 rounded w-1/4 mt-1.5" />
              </div>
            </div>
          ))}
        </div>
      ) : voices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-16">
          <AudioLines size={36} className="text-slate-200 mb-3" />
          <p className="text-[14px] text-slate-400 font-medium">No voices found</p>
          <p className="text-[12px] text-slate-300 mt-1">Try a different filter or clone a new voice</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {voices.map(voice => (
            <div key={voice.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition group">
              <button
                onClick={() => togglePlay(voice)}
                className={`w-11 h-11 rounded-full ${voice.playColor} flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shrink-0`}
              >
                {playingId === voice.id ? (
                  <Pause size={14} fill="currentColor" className={voice.iconColor} />
                ) : (
                  <Play size={14} fill="currentColor" className={`${voice.iconColor} ml-0.5`} />
                )}
              </button>

              <div className="flex-1 min-w-0">
                {renameId === voice.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setRenameId(null); }}
                    className="text-[14px] font-semibold text-slate-800 w-full border border-blue-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                ) : (
                  <h3 className="text-[14px] font-semibold text-slate-800">{voice.name}</h3>
                )}
                <p className="text-[11px] text-slate-400 mt-0.5">{voice.date}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold shrink-0 ${
                voice.type === 'Voice Clone' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {voice.type}
              </span>

              <span className="text-[12px] text-slate-500 font-medium shrink-0 w-12 text-right">{voice.duration}</span>

              <div className="relative shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === voice.id ? null : voice.id); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <MoreHorizontal size={16} />
                </button>
                {openMenu === voice.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                    <div className="absolute right-0 bottom-full mb-1 z-50 w-36 bg-white rounded-xl border border-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden">
                      <button onClick={() => handleRenameStart(voice)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition">
                        <Pencil size={12} /> Rename
                      </button>
                      <button onClick={() => handleExport(voice)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition">
                        <Download size={12} /> Export
                      </button>
                      <button onClick={() => handleDelete(voice.id)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

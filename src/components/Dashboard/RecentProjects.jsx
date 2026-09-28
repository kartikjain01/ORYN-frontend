import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MoreHorizontal,
  Play,
  Pause,
  Download,
  Mic,
  AudioWaveform,
  MessageSquare,
  Type,
} from "lucide-react";
import { getRecentProjects, formatDuration } from "../../lib/db";
import { supabase } from "../../supabaseClient";

const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3ENo Preview%3C/text%3E%3C/svg%3E';

const QUICK_START = [
  { label: 'Voice Clone', desc: 'Clone any voice with AI', path: '/voice-clone', icon: Mic, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Text to Speech', desc: 'Convert text into natural speech', path: '/text-to-speech', icon: AudioWaveform, gradient: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { label: 'Voice Editor', desc: 'Edit and enhance audio', path: '/voice-editor', icon: MessageSquare, gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
  { label: 'Captions', desc: 'Generate captions for video', path: '/caption-generation', icon: Type, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
];

const TYPE_IMAGE_MAP = {
  'Voice Clone': 'voiceclone.webp',
  'TTS': 'tts.webp',
  'Voice Editor': 'video.webp',
  'Captions': 'caption.webp',
  'Video': 'video.webp',
};

export default function RecentProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const mediaRef = useRef(null);
  const rafRef = useRef(null);
  const menuRef = useRef(null);

  const stopPlayback = useCallback(() => {
    if (mediaRef.current) {
      mediaRef.current.pause();
      mediaRef.current.src = '';
      mediaRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPlayingId(null);
    setProgress(0);
  }, []);

  const togglePlay = useCallback((project) => {
    if (!project.outputUrl) return;
    if (playingId === project.id) { stopPlayback(); return; }
    stopPlayback();
    const isVideo = project.type === 'captions' || project.type === 'video';
    const el = isVideo ? document.createElement('video') : new Audio();
    el.src = project.outputUrl;
    mediaRef.current = el;
    setPlayingId(project.id);
    setProgress(0);
    const tick = () => {
      if (el.duration && isFinite(el.duration)) setProgress(el.currentTime / el.duration);
      if (!el.paused) rafRef.current = requestAnimationFrame(tick);
    };
    el.addEventListener('play', tick);
    el.addEventListener('ended', () => {
      setProgress(1);
      setTimeout(() => { setPlayingId(null); setProgress(0); }, 600);
    });
    el.play().catch(() => { setPlayingId(null); });
  }, [playingId, stopPlayback]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const detectDurations = useCallback((data) => {
    data.slice(0, 4).forEach((p, idx) => {
      if (!p.durationSeconds && p.outputUrl) {
        const isVideo = p.type === 'captions' || p.type === 'video';
        const el = isVideo ? document.createElement('video') : new Audio();
        if (isVideo) el.preload = 'metadata';
        el.src = p.outputUrl;
        el.addEventListener('loadedmetadata', () => {
          if (isFinite(el.duration) && el.duration > 0) {
            setProjects(prev => prev.map((proj, i) => i === idx ? { ...proj, duration: formatDuration(el.duration), durationSeconds: el.duration } : proj));
            supabase.from('projects').update({ duration_seconds: el.duration }).eq('id', p.id).catch(console.error);
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    getRecentProjects(6, (freshData) => {
      setProjects(freshData);
      detectDurations(freshData);
    }).then(data => {
      setProjects(data);
      detectDurations(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [detectDurations]);

  useEffect(() => {
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    if (menuOpen) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  const handleOpen = (project) => {
    navigate(`/projects?highlight=${project.id}`);
    setMenuOpen(null);
  };

  const handleDownload = async (project) => {
    if (!project.outputUrl) return;
    try {
      const res = await fetch(project.outputUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title || 'output'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    setMenuOpen(null);
  };

  return (
    <section className="bg-white rounded-[28px] border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[24px] font-bold text-slate-900">Recent Projects</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="h-10 px-5 rounded-xl text-[12px] border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            View All Projects
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="rounded-2xl aspect-square bg-slate-100" />
              <div className="mt-3 h-4 bg-slate-100 rounded w-3/4" />
              <div className="mt-2 h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {(() => {
            const TYPE_KEY_MAP = { 'Voice Clone': 'voice_clone', 'Text to Speech': 'tts', 'Voice Editor': 'voice_editor', 'Captions': 'captions' };
            const usedTypes = new Set();
            const filled = projects.slice(0, 4).map(p => { usedTypes.add(p.type); return { project: p, tool: QUICK_START.find(t => TYPE_KEY_MAP[t.label] === p.type) }; }).filter(x => x.tool);
            const empty = QUICK_START.filter(t => !usedTypes.has(TYPE_KEY_MAP[t.label])).slice(0, 4 - filled.length);
            const slots = [...filled.map(x => ({ type: 'project', project: x.project, tool: x.tool })), ...empty.map(t => ({ type: 'empty', tool: t }))];
            return slots.map(slot => {
              const tool = slot.tool;
              const project = slot.project;

            if (slot.type === 'project') {
              const imgFile = TYPE_IMAGE_MAP[project.tag] || 'video.webp';
              let image;
              try { image = project.thumbnailUrl || new URL(`../../assets/images/${imgFile}`, import.meta.url).href; } catch { image = placeholder; }

              return (
                <div key={project.id} onClick={() => navigate(`/projects?highlight=${project.id}`)} className="group cursor-pointer rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 aspect-square flex flex-col overflow-hidden">
                  <div className="relative overflow-hidden rounded-t-2xl flex-1 min-h-0">
                    <img src={image} alt={project.title} onError={(e) => { e.currentTarget.src = placeholder; }} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <span className={`absolute left-3 top-3 px-2.5 py-0.5 rounded-lg text-white text-[10px] font-semibold backdrop-blur-sm ${project.tagColor}/90`}>{project.tag}</span>
                    {project.outputUrl && (
                      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${playingId === project.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePlay(project); }}
                          className="pointer-events-auto w-10 h-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg hover:scale-110 transition-transform cursor-pointer"
                        >
                          {playingId === project.id
                            ? <Pause fill="white" size={14} className="text-white" />
                            : <Play fill="white" size={14} className="text-white ml-0.5" />}
                        </button>
                      </div>
                    )}
                    {playingId === project.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                        <div className="h-full bg-white/90 transition-[width] duration-100 ease-linear rounded-r-full" style={{ width: `${progress * 100}%` }} />
                      </div>
                    )}
                    {playingId !== project.id && project.duration && <div className="absolute right-3 bottom-3 bg-black/50 text-white rounded-md px-1.5 py-0.5 text-[10px] backdrop-blur-sm">{project.duration}</div>}
                  </div>
                  <div className="px-3 py-2.5 flex justify-between items-center shrink-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-semibold leading-4 text-slate-800 group-hover:text-slate-950 transition truncate">{project.title}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">{(() => {
                        const diff = (Date.now() - new Date(project.rawDate).getTime()) / 1000;
                        if (diff < 60) return 'Just now';
                        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                        return project.time;
                      })()}</p>
                    </div>
                    <div className="relative ml-2" ref={menuOpen === project.id ? menuRef : null}>
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === project.id ? null : project.id); }} className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all cursor-pointer">
                        <MoreHorizontal size={14} />
                      </button>
                      {menuOpen === project.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 bottom-8 w-36 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 py-1.5 z-50">
                            <button onClick={() => handleOpen(project)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-slate-600 hover:bg-slate-50 transition">
                              <Play size={14} /> Open
                            </button>
                            {project.outputUrl && (
                              <button onClick={() => handleDownload(project)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-slate-600 hover:bg-slate-50 transition">
                                <Download size={14} /> Download
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={`empty-${tool.label}`} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50" />
            );
          });
          })()}
        </div>
      )}
    </section>
  );
}

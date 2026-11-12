import { useCallback, useEffect, useRef, useState } from "react";
import { Folder, Search, Grid3X3, List, Play, Pause, MoreHorizontal, Download, Pencil, Trash2, Loader2, X, SkipBack, SkipForward, Volume2, Maximize2, CheckSquare, Square, ChevronDown, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProjects, deleteProject, renameProject, formatDuration } from "../lib/db";
import { supabase } from "../supabaseClient";

const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3ENo Preview%3C/text%3E%3C/svg%3E';

const FILTERS = ['All', 'Voice Clone', 'TTS', 'Voice Editor', 'Captions'];
const SORT_OPTIONS = ['Recent', 'Oldest', 'A-Z', 'Z-A'];

const TYPE_IMAGE_MAP = {
  'Voice Clone': 'voiceclone.webp',
  'TTS': 'tts.webp',
  'Voice Editor': 'video.webp',
  'Captions': 'caption.webp',
  'Video': 'video.webp',
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('Recent');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [highlightId, setHighlightId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [videoModal, setVideoModal] = useState(null);
  const mediaRef = useRef(null);
  const rafRef = useRef(null);
  const videoModalRef = useRef(null);
  const highlightRef = useRef(null);
  const activePlaybackRef = useRef(null);
  const playbackPendingRef = useRef(false);
  const playbackTokenRef = useRef(0);

  const stopPlayback = useCallback(() => {
    playbackTokenRef.current++;
    activePlaybackRef.current = null;
    playbackPendingRef.current = false;
    if (mediaRef.current) {
      const media = mediaRef.current;
      mediaRef.current = null;
      media.pause();
      media.removeAttribute('src');
      media.load();
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setPlayingId(null);
    setProgress(0);
  }, []);

  const closeVideoModal = useCallback(() => {
    if (videoModalRef.current) {
      videoModalRef.current.pause();
      videoModalRef.current = null;
    }
    setVideoModal(null);
    setPlayingId(null);
    setProgress(0);
  }, []);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [toast, setToast] = useState('');
  const [toastLoading, setToastLoading] = useState(false);
  const showToast = (msg, loading = false) => { setToast(msg); setToastLoading(loading); if (!loading) setTimeout(() => setToast(''), 4000); };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === projects.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(projects.map(p => p.id)));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Delete ${count} project${count > 1 ? 's' : ''}? This cannot be undone.`)) return;
    const idsToDelete = new Set(selectedIds);
    setDeletingIds(prev => new Set([...prev, ...idsToDelete]));
    setSelectedIds(new Set());
    showToast(`Deleting ${count} project${count > 1 ? 's' : ''}...`, true);
    const results = await Promise.allSettled(
      [...idsToDelete].map(id => deleteProject(id))
    );
    setDeletingIds(prev => { const next = new Set(prev); idsToDelete.forEach(id => next.delete(id)); return next; });
    setProjects(prev => prev.filter(p => !idsToDelete.has(p.id)));
    const failed = results.filter(r => r.status === 'rejected').length;
    showToast(failed ? `Deleted ${count - failed}/${count} projects` : `Deleted ${count} project${count > 1 ? 's' : ''}`);
  };

  const togglePlay = useCallback((project) => {
    if (!project.outputUrl) { showToast('No output file available for this project'); return; }
    const isVideo = project.type === 'captions' || project.type === 'video';

    if (isVideo) {
      if (videoModal?.id === project.id) { closeVideoModal(); return; }
      stopPlayback();
      setVideoModal(project);
      activePlaybackRef.current = project.id;
      setPlayingId(project.id);
      setProgress(0);
      return;
    }

    if (activePlaybackRef.current === project.id) {
      if (!playbackPendingRef.current) stopPlayback();
      return;
    }
    stopPlayback();
    activePlaybackRef.current = project.id;
    playbackPendingRef.current = true;
    const playbackToken = playbackTokenRef.current;
    const el = new Audio();
    el.crossOrigin = 'anonymous';
    el.preload = 'auto';
    el.src = project.outputUrl;
    mediaRef.current = el;
    setPlayingId(project.id);
    setProgress(0);
    const tick = () => {
      if (mediaRef.current !== el) return;
      if (el.duration && isFinite(el.duration)) setProgress(el.currentTime / el.duration);
      if (!el.paused) rafRef.current = requestAnimationFrame(tick);
    };
    el.addEventListener('play', () => {
      if (playbackToken !== playbackTokenRef.current) return;
      playbackPendingRef.current = false;
      tick();
    });
    el.addEventListener('ended', () => {
      if (playbackToken !== playbackTokenRef.current) return;
      setProgress(1);
      setTimeout(() => {
        if (playbackToken === playbackTokenRef.current) stopPlayback();
      }, 600);
    });
    el.addEventListener('error', () => {
      if (playbackToken !== playbackTokenRef.current || mediaRef.current !== el) return;
      stopPlayback();
      showToast('Could not play this file — the URL may have expired');
    });
    el.play().catch(() => {
      if (playbackToken !== playbackTokenRef.current || mediaRef.current !== el) return;
      stopPlayback();
      showToast('Playback failed — file may no longer be available');
    });
  }, [stopPlayback, videoModal, closeVideoModal]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const detectDurations = useCallback((data) => {
    data.slice(0, 8).forEach((p, idx) => {
      if (!p.durationSeconds && p.outputUrl) {
        const isVideo = p.type === 'captions' || p.type === 'video';
        const el = isVideo ? document.createElement('video') : new Audio();
        if (isVideo) el.preload = 'metadata';
        el.src = p.outputUrl;
        el.addEventListener('loadedmetadata', () => {
          if (isFinite(el.duration) && el.duration > 0) {
            setProjects(prev => prev.map((proj, i) => i === idx ? { ...proj, duration: formatDuration(el.duration), durationSeconds: el.duration } : proj));
            supabase.from('projects').update({ duration_seconds: el.duration }).eq('id', p.id)
              .then(({ error }) => { if (error) console.error('Failed to update project duration:', error); })
              .catch(console.error);
          }
        });
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (projects.length > 0) setRefreshing(true); else setLoading(true);
    try {
      const data = await getProjects({
        type: activeFilter,
        search: debouncedSearch,
        sort: sortBy,
        onRefresh: (freshData) => {
          setProjects(freshData);
          setRefreshing(false);
          detectDurations(freshData);
        },
      });
      setProjects(data);
      detectDurations(data);
    } catch { /* silent */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, debouncedSearch, sortBy, detectDurations]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (openMenu === null) return;
    const handle = () => setOpenMenu(null);
    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, [openMenu]);

  useEffect(() => {
    if (!sortOpen) return;
    const handle = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [sortOpen]);

  useEffect(() => {
    const id = searchParams.get('highlight');
    if (id && !loading && projects.length > 0) {
      setHighlightId(id);
      setSearchParams({}, { replace: true });
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      setTimeout(() => setHighlightId(null), 3000);
    }
  }, [searchParams, loading, projects]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    setOpenMenu(null);
    setDeletingIds(prev => new Set([...prev, id]));
    showToast('Deleting project...', true);
    try {
      await deleteProject(id);
    } catch (err) {
      console.error('Failed to delete project:', id, err);
    }
    setDeletingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    setProjects(prev => prev.filter(p => p.id !== id));
    showToast('Project deleted');
  };

  const handleRenameStart = (project) => {
    setRenameId(project.id);
    setRenameValue(project.title);
    setOpenMenu(null);
  };

  const handleRenameSubmit = async () => {
    if (!renameValue.trim()) return;
    await renameProject(renameId, renameValue.trim());
    setProjects(prev => prev.map(p => p.id === renameId ? { ...p, title: renameValue.trim() } : p));
    setRenameId(null);
  };

  const handleExport = (project) => {
    if (project.outputUrl) window.open(project.outputUrl, '_blank');
    setOpenMenu(null);
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">All Projects</h1>
          <p className="text-[14px] text-slate-500 mt-1 flex items-center gap-2">
            {projects.length} projects
            {refreshing && <Loader2 size={14} className="animate-spin text-blue-500" />}
          </p>
        </div>
        <div />
      </div>

      <div className="bg-gradient-to-b from-white to-slate-50/80 rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Row 1 on mobile: Search bar full width */}
        <div className="relative sm:order-2 sm:flex-none">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="h-[38px] w-full sm:w-[180px] rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition"
          />
        </div>

        {/* Mobile filter chips */}
        <div className="flex overflow-x-auto gap-2 scrollbar-hide sm:hidden -mx-1 px-1 py-0.5">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                activeFilter === f
                  ? 'bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-[0_3px_0_0_#3730a3,0_4px_8px_rgba(37,99,235,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_0_#3730a3,0_2px_4px_rgba(37,99,235,0.2)]'
                  : 'bg-gradient-to-b from-white to-slate-50 text-slate-600 border border-slate-200 shadow-[0_2px_0_0_#e2e8f0,0_3px_6px_rgba(0,0,0,0.04)] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_#e2e8f0] active:translate-y-[2px] active:shadow-none'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Row 2 on desktop: Filters + view/sort controls */}
        <div className="flex items-center justify-between gap-2 sm:flex-1 sm:order-1">
          <div className="hidden sm:flex items-center gap-2 flex-wrap flex-1">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                  activeFilter === f
                    ? 'bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-[0_3px_0_0_#3730a3,0_4px_10px_rgba(37,99,235,0.3)] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#3730a3,0_3px_6px_rgba(37,99,235,0.2)] active:translate-y-[3px] active:shadow-[0_0px_0_0_#3730a3]'
                    : 'bg-gradient-to-b from-white to-slate-50 text-slate-600 border border-slate-200 shadow-[0_2px_0_0_#e2e8f0,0_3px_6px_rgba(0,0,0,0.04)] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_#e2e8f0] active:translate-y-[2px] active:shadow-none'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto sm:shrink-0">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shadow-[0_2px_0_0_#e2e8f0,0_3px_6px_rgba(0,0,0,0.04)]">
              <button onClick={() => setViewMode('grid')} className={`w-9 h-9 flex items-center justify-center transition-all duration-200 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 shadow-[inset_0_2px_4px_rgba(37,99,235,0.1)]' : 'bg-gradient-to-b from-white to-slate-50 text-slate-400 hover:text-slate-600 active:bg-slate-100'}`}>
                <Grid3X3 size={14} />
              </button>
              <button onClick={() => setViewMode('list')} className={`w-9 h-9 flex items-center justify-center transition-all duration-200 border-l border-slate-200 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 shadow-[inset_0_2px_4px_rgba(37,99,235,0.1)]' : 'bg-gradient-to-b from-white to-slate-50 text-slate-400 hover:text-slate-600 active:bg-slate-100'}`}>
                <List size={14} />
              </button>
            </div>
            <div className="relative flex-1 sm:flex-none" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="h-[38px] w-full sm:w-auto px-3 pr-7 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 text-[12px] text-slate-600 font-medium outline-none shadow-[0_2px_0_0_#e2e8f0,0_3px_6px_rgba(0,0,0,0.04)] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_#e2e8f0] active:translate-y-[2px] active:shadow-none transition-all duration-200 cursor-pointer text-left flex items-center gap-1.5"
              >
                {sortBy}
                <ChevronDown size={12} className={`absolute right-2.5 text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute top-[40px] right-0 left-0 sm:left-auto sm:w-[120px] bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 py-1 z-50">
                  {SORT_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSortBy(s); setSortOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] transition ${sortBy === s ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {sortBy === s && <Check size={12} />}
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 animate-[fadeIn_0.2s_ease]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={selectAll} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-semibold text-blue-700 hover:text-blue-900 transition whitespace-nowrap">
              {selectedIds.size === projects.length ? <CheckSquare size={14} /> : <Square size={14} />}
              {selectedIds.size === projects.length ? 'Deselect' : 'Select All'}
            </button>
            <span className="text-[11px] sm:text-[12px] text-blue-600 font-medium whitespace-nowrap">{selectedIds.size} selected</span>
          </div>
          <button
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] font-semibold text-white bg-red-500 hover:bg-red-600 shadow-sm hover:shadow-md transition-all duration-200 shrink-0"
          >
            <Trash2 size={11} />
            Delete
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 animate-pulse">
              <div className="h-[110px] sm:h-[160px] bg-slate-100 rounded-t-xl sm:rounded-t-2xl" />
              <div className="p-3 sm:p-4">
                <div className="h-3 sm:h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-2.5 sm:h-3 bg-slate-100 rounded w-1/2 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-16">
          <Folder size={36} className="text-slate-200 mb-3" />
          <p className="text-[14px] text-slate-400 font-medium">No projects found</p>
          <p className="text-[12px] text-slate-300 mt-1">Try a different filter or create a new project</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {projects.map(project => {
            const imgFile = TYPE_IMAGE_MAP[project.tag] || 'video.webp';
            let image;
            try {
              image = project.thumbnailUrl || new URL(`../assets/images/${imgFile}`, import.meta.url).href;
            } catch {
              image = placeholder;
            }
            return (
              <div key={project.id} ref={highlightId === project.id ? highlightRef : null} className={`group cursor-pointer bg-white rounded-xl sm:rounded-2xl border hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 relative ${deletingIds.has(project.id) ? 'opacity-50 pointer-events-none' : ''} ${selectedIds.has(project.id) ? 'border-blue-400 ring-2 ring-blue-200' : highlightId === project.id ? 'border-blue-400 ring-2 ring-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.25)]' : 'border-slate-200'}`}>
                {deletingIds.has(project.id) && <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/60"><Loader2 size={24} className="animate-spin text-slate-400" /></div>}
                <div className="relative h-[110px] sm:h-[160px] overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                  <img
                    src={image}
                    alt={project.title}
                    onError={(e) => { e.currentTarget.src = placeholder; }}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(project.id); }}
                    className={`absolute right-2 top-2 sm:right-3 sm:top-3 w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center transition-all duration-200 z-10 ${selectedIds.has(project.id) ? 'bg-blue-500 text-white' : 'bg-black/30 text-white opacity-0 group-hover:opacity-100 hover:bg-black/50'}`}
                  >
                    {selectedIds.has(project.id) ? <CheckSquare size={12} className="sm:w-[14px] sm:h-[14px]" /> : <Square size={12} className="sm:w-[14px] sm:h-[14px]" />}
                  </button>
                  <span className={`absolute left-2 top-2 sm:left-3 sm:top-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-white text-[9px] sm:text-[10px] font-semibold ${project.tagColor}`}>
                    {project.tag}
                  </span>
                  {project.outputUrl && (
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${playingId === project.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePlay(project); }}
                        disabled={activePlaybackRef.current === project.id && playbackPendingRef.current}
                        aria-label={activePlaybackRef.current === project.id && playbackPendingRef.current ? 'Loading audio' : playingId === project.id ? 'Pause audio' : 'Play audio'}
                        className="pointer-events-auto w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40 hover:scale-110 transition-transform cursor-pointer"
                      >
                        {activePlaybackRef.current === project.id && playbackPendingRef.current
                          ? <Loader2 size={14} className="text-white animate-spin sm:w-4 sm:h-4" />
                          : playingId === project.id
                          ? <Pause fill="white" size={14} className="text-white sm:w-4 sm:h-4" />
                          : <Play fill="white" size={14} className="text-white ml-0.5 sm:w-4 sm:h-4" />}
                      </button>
                    </div>
                  )}
                  {playingId === project.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div className="h-full bg-white/90 transition-[width] duration-100 ease-linear rounded-r-full" style={{ width: `${progress * 100}%` }} />
                    </div>
                  )}
                  {playingId !== project.id && project.duration && (
                    <div className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 bg-black/50 text-white rounded-md px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[11px] backdrop-blur-sm">
                      {project.duration}
                    </div>
                  )}
                </div>
                <div className="p-2.5 sm:p-4 flex justify-between items-start gap-1">
                  <div className="flex-1 min-w-0">
                    {renameId === project.id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setRenameId(null); }}
                        className="text-[11px] sm:text-[13px] font-semibold text-slate-800 w-full border border-blue-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    ) : (
                      <h3 className="text-[11px] sm:text-[13px] font-semibold text-slate-800 group-hover:text-slate-950 transition truncate">{project.title}</h3>
                    )}
                    <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400">{project.time}</p>
                  </div>
                  <div className="relative shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === project.id ? null : project.id); }} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200/60 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all">
                      <MoreHorizontal size={12} className="sm:w-[14px] sm:h-[14px]" />
                    </button>
                    {openMenu === project.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                        <div className="absolute right-0 bottom-full mb-1 z-50 w-36 bg-white rounded-xl border border-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden">
                          <button onClick={() => handleRenameStart(project)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition">
                            <Pencil size={12} /> Rename
                          </button>
                          <button onClick={() => handleExport(project)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition">
                            <Download size={12} /> Export
                          </button>
                          <button onClick={() => handleDelete(project.id)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-red-500 hover:bg-red-50 transition">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {projects.map(project => {
            const imgFile = TYPE_IMAGE_MAP[project.tag] || 'video.webp';
            let image;
            try {
              image = project.thumbnailUrl || new URL(`../assets/images/${imgFile}`, import.meta.url).href;
            } catch {
              image = placeholder;
            }
            return (
              <div key={project.id} ref={highlightId === project.id ? highlightRef : null} className={`flex items-center gap-2.5 sm:gap-4 px-3 sm:px-5 py-3.5 sm:py-4 hover:bg-slate-50/50 transition-all duration-500 cursor-pointer group relative ${deletingIds.has(project.id) ? 'opacity-50 pointer-events-none' : ''} ${selectedIds.has(project.id) ? 'bg-blue-50/60' : highlightId === project.id ? 'bg-blue-50/60 ring-1 ring-blue-200' : ''}`}>
                {deletingIds.has(project.id) && <div className="absolute right-5 top-1/2 -translate-y-1/2 z-10"><Loader2 size={18} className="animate-spin text-slate-400" /></div>}
                <button onClick={(e) => { e.stopPropagation(); toggleSelect(project.id); }} className={`shrink-0 w-5 h-5 rounded flex items-center justify-center transition ${selectedIds.has(project.id) ? 'text-blue-500' : 'text-slate-300 hover:text-slate-500'}`}>
                  {selectedIds.has(project.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <div className="w-14 h-14 sm:w-16 sm:h-12 rounded-lg overflow-hidden shrink-0 relative">
                  <img src={image} alt={project.title} onError={(e) => { e.currentTarget.src = placeholder; }} className="w-full h-full object-cover" />
                  {project.outputUrl && (
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all ${playingId === project.id ? 'bg-black/30 opacity-100' : 'bg-black/0 group-hover:bg-black/20 opacity-0 group-hover:opacity-100'}`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePlay(project); }}
                        disabled={activePlaybackRef.current === project.id && playbackPendingRef.current}
                        aria-label={activePlaybackRef.current === project.id && playbackPendingRef.current ? 'Loading audio' : playingId === project.id ? 'Pause audio' : 'Play audio'}
                        className="pointer-events-auto cursor-pointer"
                      >
                        {activePlaybackRef.current === project.id && playbackPendingRef.current
                          ? <Loader2 size={12} className="text-white animate-spin" />
                          : playingId === project.id
                          ? <Pause fill="white" size={12} className="text-white" />
                          : <Play fill="white" size={12} className="text-white" />}
                      </button>
                    </div>
                  )}
                  {playingId === project.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
                      <div className="h-full bg-blue-500 transition-[width] duration-100 ease-linear" style={{ width: `${progress * 100}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {renameId === project.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setRenameId(null); }}
                      className="text-[12px] sm:text-[13px] font-semibold text-slate-800 w-full border border-blue-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  ) : (
                    <h3 className="text-[12px] sm:text-[13px] font-semibold text-slate-800 truncate">{project.title}</h3>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-white text-[8px] sm:text-[10px] font-semibold ${project.tagColor} shrink-0 sm:hidden`}>{project.tag}</span>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{project.time}</p>
                    {project.duration && <span className="text-[10px] text-slate-400 shrink-0 sm:hidden">· {project.duration}</span>}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-white text-[10px] font-semibold ${project.tagColor} shrink-0 hidden sm:inline`}>{project.tag}</span>
                <span className="text-[12px] text-slate-500 font-medium shrink-0 w-12 text-right hidden sm:block">{project.duration || ''}</span>
                <div className="relative shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === project.id ? null : project.id); }} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200/60 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all">
                    <MoreHorizontal size={12} className="sm:w-[14px] sm:h-[14px]" />
                  </button>
                  {openMenu === project.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                      <div className="absolute right-0 bottom-full mb-1 z-50 w-36 bg-white rounded-xl border border-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden">
                        <button onClick={() => handleRenameStart(project)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition">
                          <Pencil size={12} /> Rename
                        </button>
                        <button onClick={() => handleExport(project)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition">
                          <Download size={12} /> Export
                        </button>
                        <button onClick={() => handleDelete(project.id)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-red-500 hover:bg-red-50 transition">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 bg-slate-900 text-white text-[13px] font-medium rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] animate-[fadeIn_0.2s_ease-out] flex items-center gap-2">
          {toastLoading && <Loader2 size={14} className="animate-spin" />}
          {toast}
        </div>
      )}

      {videoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={closeVideoModal}>
          <div className="relative w-full max-w-3xl mx-4 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-white truncate">{videoModal.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{videoModal.tag} &middot; {videoModal.time}</p>
              </div>
              <button onClick={closeVideoModal} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="relative bg-black">
              <video
                ref={el => { videoModalRef.current = el; }}
                src={videoModal.outputUrl}
                className="w-full max-h-[70vh] object-contain"
                preload="auto"
                autoPlay
                controls
                onEnded={closeVideoModal}
                onError={() => { closeVideoModal(); showToast('Could not load video — the URL may have expired'); }}
              />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
              <span className="text-[11px] text-slate-400">{videoModal.duration || ''}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { if (videoModalRef.current) videoModalRef.current.requestFullscreen?.(); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <Maximize2 size={14} />
                </button>
                <a
                  href={videoModal.outputUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <Download size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

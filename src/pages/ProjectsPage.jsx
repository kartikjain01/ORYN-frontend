import { useCallback, useEffect, useState } from "react";
import { Folder, Search, Grid3X3, List, Play, Eye, MoreHorizontal, Download, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProjects, deleteProject, renameProject } from "../lib/db";

const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3ENo Preview%3C/text%3E%3C/svg%3E';

const FILTERS = ['All', 'Voice Clone', 'TTS', 'Voice Editor', 'Captions'];
const SORT_OPTIONS = ['Recent', 'Oldest', 'A-Z', 'Z-A'];

const TYPE_IMAGE_MAP = {
  'Voice Clone': 'voiceclone.png',
  'TTS': 'tts.png',
  'Voice Editor': 'video.png',
  'Captions': 'caption.png',
  'Video': 'video.png',
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('Recent');
  const [openMenu, setOpenMenu] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getProjects({ type: activeFilter, search: searchQuery, sort: sortBy });
    setProjects(data);
    setLoading(false);
  }, [activeFilter, searchQuery, sortBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setOpenMenu(null);
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
    <main className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">All Projects</h1>
          <p className="text-[14px] text-slate-500 mt-1">{projects.length} projects</p>
        </div>
        <div />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap flex-1">
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

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="h-[36px] w-[180px] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 transition"
            />
          </div>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`w-8 h-8 flex items-center justify-center transition ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <Grid3X3 size={14} />
            </button>
            <button onClick={() => setViewMode('list')} className={`w-8 h-8 flex items-center justify-center transition ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <List size={14} />
            </button>
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-[36px] px-3 rounded-lg border border-slate-200 bg-slate-50 text-[12px] text-slate-600 font-medium outline-none focus:border-blue-400 transition appearance-none cursor-pointer pr-7"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 animate-pulse">
              <div className="h-[160px] bg-slate-100 rounded-t-2xl" />
              <div className="p-4">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mt-2" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {projects.map(project => {
            const imgFile = TYPE_IMAGE_MAP[project.tag] || 'video.png';
            let image;
            try {
              image = project.thumbnailUrl || new URL(`../assets/images/${imgFile}`, import.meta.url).href;
            } catch {
              image = placeholder;
            }
            return (
              <div key={project.id} className="group cursor-pointer bg-white rounded-2xl border border-slate-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative">
                <div className="relative h-[160px] overflow-hidden rounded-t-2xl">
                  <img
                    src={image}
                    alt={project.title}
                    onError={(e) => { e.currentTarget.src = placeholder; }}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                  <span className={`absolute left-3 top-3 px-2.5 py-1 rounded-lg text-white text-[10px] font-semibold ${project.tagColor}`}>
                    {project.tag}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40 hover:scale-110 transition-transform">
                      <Play fill="white" size={16} className="text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute left-3 bottom-3 flex items-center gap-1.5 text-white/80 text-[11px]">
                    <Eye size={12} />
                    {project.views}
                  </div>
                  {project.duration && (
                    <div className="absolute right-3 bottom-3 bg-black/50 text-white rounded-md px-1.5 py-0.5 text-[11px] backdrop-blur-sm">
                      {project.duration}
                    </div>
                  )}
                </div>
                <div className="p-4 flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    {renameId === project.id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setRenameId(null); }}
                        className="text-[13px] font-semibold text-slate-800 w-full border border-blue-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    ) : (
                      <h3 className="text-[13px] font-semibold text-slate-800 group-hover:text-slate-950 transition truncate">{project.title}</h3>
                    )}
                    <p className="mt-1 text-[11px] text-slate-400">{project.time}</p>
                  </div>
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === project.id ? null : project.id); }} className="ml-2 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition">
                      <MoreHorizontal size={16} />
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
            const imgFile = TYPE_IMAGE_MAP[project.tag] || 'video.png';
            let image;
            try {
              image = project.thumbnailUrl || new URL(`../assets/images/${imgFile}`, import.meta.url).href;
            } catch {
              image = placeholder;
            }
            return (
              <div key={project.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition cursor-pointer group">
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 relative">
                  <img src={image} alt={project.title} onError={(e) => { e.currentTarget.src = placeholder; }} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Play fill="white" size={12} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {renameId === project.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setRenameId(null); }}
                      className="text-[13px] font-semibold text-slate-800 w-full border border-blue-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  ) : (
                    <h3 className="text-[13px] font-semibold text-slate-800 truncate">{project.title}</h3>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">{project.time}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-white text-[10px] font-semibold ${project.tagColor} shrink-0`}>{project.tag}</span>
                <span className="text-[12px] text-slate-500 font-medium shrink-0 w-12 text-right">{project.duration}</span>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0 w-10">
                  <Eye size={12} />
                  {project.views}
                </div>
                <div className="relative shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === project.id ? null : project.id); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition">
                    <MoreHorizontal size={16} />
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
    </main>
  );
}

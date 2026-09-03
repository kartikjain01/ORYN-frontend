import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Play,
  Eye,
  Folder,
} from "lucide-react";
import { getRecentProjects } from "../../lib/db";

const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3ENo Preview%3C/text%3E%3C/svg%3E';

const TYPE_IMAGE_MAP = {
  'Voice Clone': 'voiceclone.png',
  'TTS': 'tts.png',
  'Voice Editor': 'video.png',
  'Captions': 'caption.png',
  'Video': 'video.png',
};

export default function RecentProjects() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentProjects(6).then(data => { setProjects(data); setLoading(false); });
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-white rounded-[28px] border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[24px] font-bold text-slate-900">
          Recent Projects
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="h-10 px-5 rounded-xl text-[12px] border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            View All Projects
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[230px] flex-1 animate-pulse">
              <div className="rounded-2xl h-[185px] bg-slate-100" />
              <div className="mt-4 h-4 bg-slate-100 rounded w-3/4" />
              <div className="mt-2 h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Folder size={36} className="text-slate-200 mb-3" />
          <p className="text-[14px] text-slate-400 font-medium">No projects yet</p>
          <p className="text-[12px] text-slate-300 mt-1">Create your first project using any tool</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {projects.map((project) => {
            const imgFile = TYPE_IMAGE_MAP[project.tag] || 'video.png';
            let image;
            try {
              image = project.thumbnailUrl || new URL(`../../assets/images/${imgFile}`, import.meta.url).href;
            } catch {
              image = placeholder;
            }

            return (
              <div key={project.id} className="group cursor-pointer min-w-[230px] flex-1">
                <div className="relative overflow-hidden rounded-2xl h-[185px]">
                  <img
                    src={image}
                    alt={project.title}
                    onError={(e) => { e.currentTarget.src = placeholder; }}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  <span className={`absolute left-4 top-4 px-3 py-1 rounded-xl text-white text-[11px] font-semibold ${project.tagColor}`}>
                    {project.tag}
                  </span>
                  {project.outputUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40">
                        <Play fill="white" size={18} className="text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute left-4 bottom-4 flex items-center gap-2 text-white/80 text-sm">
                    <Eye size={15} />
                    {project.views}
                  </div>
                  <div className="absolute right-4 bottom-4 bg-black/50 text-white rounded-lg px-2 py-0.5 text-sm backdrop-blur-sm">
                    {project.duration}
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-[15px] font-semibold leading-6 text-slate-800 group-hover:text-slate-950 transition">
                      {project.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] text-slate-400">{project.time}</p>
                  </div>
                  <button className="ml-3 mt-1 text-slate-300 hover:text-slate-600 transition cursor-pointer">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

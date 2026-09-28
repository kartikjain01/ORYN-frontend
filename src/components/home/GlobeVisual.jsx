import { Globe, Shield, Users, AudioLines } from 'lucide-react';
import swirlImg from '../../assets/images/why-choose-swirl.webp';

const stats = [
  { icon: Shield, value: '99.9%', label: 'Reliability', position: 'top-[8%] right-[4%]' },
  { icon: Globe, value: '120+', label: 'Countries', position: 'top-[44%] left-[12%]' },
  { icon: Users, value: '10K+', label: 'Creators', position: 'top-[42%] right-[0%]' },
  { icon: AudioLines, value: '90M+', label: 'Voices Generated', position: 'bottom-[12%] right-[8%]' },
];

export default function GlobeVisual() {
  return (
    <div className="relative flex items-center justify-center min-h-[500px] lg:min-h-[600px]">
      <img
        src={swirlImg}
        alt="Abstract blue light swirl representing speed and innovation"
        loading="lazy"
        decoding="async"
        className="w-[130%] max-w-none h-auto object-contain -mr-[15%]"
      />

      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`absolute ${stat.position} z-10`}
        >
          <div className="flex items-stretch rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="w-[4px] bg-brand-600 shrink-0" />
            <div className="flex items-center gap-3 px-4 py-3">
              <stat.icon size={22} className="text-brand-600 shrink-0" strokeWidth={2} />
              <div>
                <p contentEditable suppressContentEditableWarning className="text-[18px] font-bold text-brand-600 leading-tight outline-none">{stat.value}</p>
                <p contentEditable suppressContentEditableWarning className="text-[12px] text-slate-500 font-medium outline-none">{stat.label}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

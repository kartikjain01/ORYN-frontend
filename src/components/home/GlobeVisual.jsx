import { Globe, Shield, Users, AudioLines } from 'lucide-react';
import swirlImg from '../../assets/images/why-choose-swirl.webp';

const stats = [
  { icon: Shield, value: '99.9%', label: 'Reliability', position: 'top-[8%] right-[4%]' },
  { icon: Globe, value: '120+', label: 'Countries', position: 'top-[44%] left-[2%] sm:left-[12%]' },
  { icon: Users, value: '10K+', label: 'Creators', position: 'top-[42%] right-[2%] sm:right-[0%]' },
  { icon: AudioLines, value: '90M+', label: 'Voices Generated', position: 'bottom-[12%] right-[8%]' },
];

export default function GlobeVisual() {
  return (
    <div className="relative flex items-center justify-center min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
      <img
        src={swirlImg}
        alt="Abstract blue light swirl representing speed and innovation"
        width={1536}
        height={1024}
        loading="lazy"
        decoding="async"
        className="w-full sm:w-[130%] max-w-none h-auto object-contain sm:-mr-[15%]"
      />

      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`absolute ${stat.position} z-10`}
        >
          <div className="flex items-stretch rounded-xl sm:rounded-2xl bg-white border border-slate-200/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="w-[3px] sm:w-[4px] bg-brand-600 shrink-0" />
            <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-3">
              <stat.icon size={18} className="text-brand-600 shrink-0 sm:hidden" strokeWidth={2} />
              <stat.icon size={22} className="text-brand-600 shrink-0 hidden sm:block" strokeWidth={2} />
              <div>
                <p className="text-[14px] sm:text-[18px] font-bold text-brand-600 leading-tight outline-none">{stat.value}</p>
                <p className="text-[10px] sm:text-[12px] text-slate-500 font-medium outline-none">{stat.label}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

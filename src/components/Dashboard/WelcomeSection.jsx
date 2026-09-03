import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Voice Clone",
    description: "Clone any voice with high accuracy and realism.",
    path: "/voice-clone",
    icon: "voice-clone",
    cardBg: "bg-gradient-to-br from-purple-100/70 via-purple-50/40 to-indigo-100/50",
    btnColor: "border-purple-200 text-purple-600 hover:bg-purple-50",
  },
  {
    title: "Text to Speech",
    description: "Convert text into natural, human-like speech.",
    path: "/text-to-speech",
    icon: "tts",
    cardBg: "bg-gradient-to-br from-blue-100/70 via-blue-50/40 to-sky-100/50",
    btnColor: "border-blue-200 text-blue-600 hover:bg-blue-50",
  },
  {
    title: "Voice Editor",
    description: "Edit voice parameters like pitch, tone, speed, emotion.",
    path: "/voice-editor",
    icon: "voice-editor",
    cardBg: "bg-gradient-to-br from-teal-100/70 via-teal-50/40 to-emerald-100/50",
    btnColor: "border-teal-200 text-teal-600 hover:bg-teal-50",
  },
  {
    title: "Caption Generation",
    description: "Generate accurate captions for audio and video content.",
    path: "/caption-generation",
    icon: "captions",
    cardBg: "bg-gradient-to-br from-indigo-100/70 via-violet-50/40 to-purple-100/50",
    btnColor: "border-indigo-200 text-indigo-600 hover:bg-indigo-50",
  },
];

function Icon3D({ type }) {
  if (type === "voice-clone") {
    return (
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 48c0-14 10-24 22-24s22 10 22 24" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <rect x="23" y="45" width="10" height="18" rx="5" fill="#c4b5fd"/>
        <rect x="67" y="45" width="10" height="18" rx="5" fill="#c4b5fd"/>
        <rect x="38" y="34" width="24" height="34" rx="12" fill="#a78bfa"/>
        <rect x="41" y="37" width="6" height="16" rx="3" fill="white" opacity="0.3"/>
        <circle cx="50" cy="48" r="1.5" fill="white" opacity="0.5"/>
        <circle cx="50" cy="53" r="1.5" fill="white" opacity="0.4"/>
        <circle cx="50" cy="58" r="1.5" fill="white" opacity="0.3"/>
        <path d="M40 66a10 10 0 0020 0" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <line x1="50" y1="76" x2="50" y2="82" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round"/>
        <path d="M65 42c3 4 3 14 0 18" stroke="#ddd6fe" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <path d="M70 38c5 5 5 20 0 24" stroke="#ede9fe" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      </svg>
    );
  }

  if (type === "tts") {
    return (
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="20" width="48" height="36" rx="18" fill="#93c5fd"/>
        <rect x="18" y="24" width="16" height="8" rx="4" fill="white" opacity="0.25"/>
        <circle cx="30" cy="38" r="4" fill="white" opacity="0.85"/>
        <circle cx="42" cy="38" r="4" fill="white" opacity="0.75"/>
        <circle cx="54" cy="38" r="4" fill="white" opacity="0.65"/>
        <path d="M20 56l-6 10 12-6Z" fill="#93c5fd"/>
        <rect x="52" y="52" width="34" height="24" rx="12" fill="#60a5fa"/>
        <rect x="56" y="55" width="10" height="5" rx="2.5" fill="white" opacity="0.25"/>
        <line x1="58" y1="64" x2="78" y2="64" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
        <line x1="58" y1="70" x2="72" y2="70" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.45"/>
        <path d="M78 76l5 6-8-2Z" fill="#60a5fa"/>
      </svg>
    );
  }

  if (type === "voice-editor") {
    return (
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="60" height="60" rx="16" fill="#5eead4"/>
        <rect x="24" y="23" width="20" height="10" rx="5" fill="white" opacity="0.2"/>
        <rect x="33" y="34" width="5" height="36" rx="2.5" fill="#0f766e" opacity="0.25"/>
        <rect x="33" y="48" width="5" height="22" rx="2.5" fill="white" opacity="0.4"/>
        <circle cx="35.5" cy="48" r="6" fill="white" opacity="0.9"/>
        <rect x="47.5" y="34" width="5" height="36" rx="2.5" fill="#0f766e" opacity="0.25"/>
        <rect x="47.5" y="40" width="5" height="30" rx="2.5" fill="white" opacity="0.4"/>
        <circle cx="50" cy="40" r="6" fill="white" opacity="0.9"/>
        <rect x="62" y="34" width="5" height="36" rx="2.5" fill="#0f766e" opacity="0.25"/>
        <rect x="62" y="54" width="5" height="16" rx="2.5" fill="white" opacity="0.4"/>
        <circle cx="64.5" cy="54" r="6" fill="white" opacity="0.9"/>
      </svg>
    );
  }

  if (type === "captions") {
    return (
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="22" width="72" height="48" rx="10" fill="#a5b4fc"/>
        <rect x="18" y="25" width="20" height="8" rx="4" fill="white" opacity="0.2"/>
        <path d="M44 40l14 8-14 8z" fill="white" opacity="0.75"/>
        <rect x="22" y="58" width="56" height="8" rx="4" fill="#4338ca" opacity="0.2"/>
        <rect x="26" y="60" width="28" height="2.5" rx="1.25" fill="white" opacity="0.85"/>
        <rect x="26" y="63.5" width="18" height="2" rx="1" fill="white" opacity="0.55"/>
        <rect x="32" y="74" width="36" height="12" rx="6" fill="#818cf8"/>
        <rect x="37" y="77.5" width="16" height="2" rx="1" fill="white" opacity="0.75"/>
        <rect x="37" y="81" width="10" height="2" rx="1" fill="white" opacity="0.45"/>
        <rect x="68" y="74" width="16" height="12" rx="4" fill="#6366f1"/>
        <text x="70.5" y="83.5" fontSize="8" fontWeight="bold" fill="white" opacity="0.85">CC</text>
      </svg>
    );
  }

  return null;
}

export default function WelcomeSection() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const name = session.user.user_metadata?.full_name?.split(' ')[0]
          || session.user.email?.split('@')[0]
          || 'there';
        setUserName(name);
      }
    };
    getUser();
  }, []);

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          Welcome back, {userName}
          <span className="ml-2">👋</span>
        </h1>
        <p className="mt-2 text-[16px] text-slate-500">
          Create, edit and scale your content with AI magic.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pt-2 pb-2 scrollbar-hide snap-x snap-mandatory">
        {features.map((item) => (
          <div
            key={item.title}
            onClick={() => navigate(item.path)}
            className={`group ${item.cardBg} rounded-2xl border border-slate-100 px-5 pt-4 pb-4 shadow-[0_4px_24px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.09),0_2px_4px_rgba(0,0,0,0.04)] transition-all duration-300 cursor-pointer snap-start shrink-0 w-[calc(25%-12px)] min-w-[200px]`}
          >
            <div className="h-[80px] flex items-center">
              <Icon3D type={item.icon} />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">
              {item.title}
            </h3>
            <p className="mt-1 text-[12px] leading-[18px] text-slate-500 line-clamp-2">
              {item.description}
            </p>
            <button className={`mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12px] font-semibold transition ${item.btnColor}`}>
              Get Started
              <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

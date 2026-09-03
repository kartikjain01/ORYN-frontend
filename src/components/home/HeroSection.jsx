import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import welcomeAudio from '../../assets/audio/welcome.mp3';
import { attach, resume, getLevel } from '../../lib/audioAnalyser';
import robotImg from '../../assets/images/hero-robot.png';

export default function HeroSection() {
  const audioRef = useRef(null);
  if (audioRef.current === null) {
    audioRef.current = new Audio(welcomeAudio);
  }

  const [speaking, setSpeaking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    attach(audioRef.current);
  }, []);

  const handleSpeak = useCallback(() => {
    const audio = audioRef.current;
    resume();
    audio.pause();
    audio.currentTime = 0;
    setSpeaking(true);
    audio.onended = () => setSpeaking(false);
    audio.play().catch(() => setSpeaking(false));
  }, []);

  return (
    <section className="relative overflow-hidden px-6 md:px-12 lg:px-20 pt-24 sm:pt-28 md:pt-32 pb-16">
      <div className="relative mx-auto flex min-h-[500px] sm:min-h-[560px] md:min-h-[600px] w-full max-w-[1360px] flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">

        {/* Left — Content */}
        <div className="relative z-10 flex-1 text-center md:text-left max-w-[650px]">
          {/* Heading */}
          <h1>
            <span
              className="block font-bold leading-[1.05] tracking-[-0.03em] text-[38px] sm:text-[48px] md:text-[56px] lg:text-[66px] text-white"
            >
              The complete studio
            </span>
            <span className="block font-bold leading-[1.05] tracking-[-0.03em] text-[38px] sm:text-[48px] md:text-[56px] lg:text-[66px]">
              <span className="text-white">for the </span>
              <span
                style={{
                  backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 50%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                future of
              </span>
            </span>
            <span
              className="block font-bold leading-[1.05] tracking-[-0.03em] text-[38px] sm:text-[48px] md:text-[56px] lg:text-[66px]"
              style={{
                backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 50%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              voice
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-[15px] sm:text-[16px] leading-[1.8] text-white/50 font-light max-w-[480px] mx-auto md:mx-0">
            Clone voices in seconds. Generate natural speech.
            Edit audio with precision — all in one powerful studio.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="
                inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-[13px] tracking-[0.05em] uppercase
                text-white cursor-pointer
                bg-[#2563eb]
                shadow-[0_0_0_1px_rgba(37,99,235,0.5),0_4px_20px_rgba(37,99,235,0.35)]
                hover:shadow-[0_0_0_1px_rgba(37,99,235,0.7),0_8px_30px_rgba(37,99,235,0.45)]
                hover:bg-[#3b82f6]
                active:scale-[0.97]
                transition-all duration-200
              "
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3" />
              </svg>
              Start Creating
            </button>

            <button
              onClick={handleSpeak}
              className="
                inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-[13px] tracking-[0.05em] uppercase
                text-white/70 cursor-pointer
                border border-white/25 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
                hover:text-white hover:border-white/40 hover:bg-white/[0.1]
                active:scale-[0.97]
                transition-all duration-200
              "
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Demo
            </button>
          </div>

          {/* Feature Cards Row */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3" />
                  </svg>
                ),
                title: 'Voice Cloning',
                desc: 'Ultra-realistic voice replication',
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                ),
                title: 'Text to Speech',
                desc: 'Natural & expressive AI voices',
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h4l3-9 6 18 3-9h4" />
                  </svg>
                ),
                title: 'Audio Editing',
                desc: 'Precision tools for perfect sound',
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                ),
                title: 'Lightning Fast',
                desc: 'Generate high-quality audio in seconds',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                  {item.icon}
                </div>
                <h3 className="text-[13px] font-semibold text-white">{item.title}</h3>
                <p className="text-[11px] text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-bounce">
          <span className="text-[10px] tracking-[0.15em] uppercase text-white/25">Scroll</span>
          <svg className="w-4 h-4 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>

        {/* Right — Robot Image */}
        <div className="absolute right-[-5%] top-0 bottom-0 w-[62%] md:w-[55%] lg:w-[58%] z-0 flex items-center">
          <img
            src={robotImg}
            alt="AI Voice Robot"
            fetchpriority="high"
            loading="eager"
            className="w-full h-full object-cover object-left scale-[1.4] origin-center"
            style={{
              maskImage: 'radial-gradient(ellipse 70% 70% at 58% 45%, black 35%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 58% 45%, black 35%, transparent 70%)',
            }}
          />

        </div>
      </div>
    </section>
  );
}

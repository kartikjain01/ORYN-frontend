import { useEffect, useRef, useState } from 'react';
import robotHero from '../../assets/images/robot-hero.png';
import welcomeAudio from '../../assets/audio/welcome.mp3';
import { attach, resume } from '../../lib/audioAnalyser';

export default function HeroSection() {
  /* Lazily constructed: passing `new Audio(...)` straight to useRef would
     allocate a fresh element (and kick off a fetch) on every single render,
     even though only the first one is ever kept. */
  const audioRef = useRef(null);
  if (audioRef.current === null) {
    audioRef.current = new Audio(welcomeAudio);
  }

  const [speaking, setSpeaking] = useState(false);

  /* Route playback through the shared analyser so the hero's WebGL field
     ripples at the actual amplitude of ORYN's voice. */
  useEffect(() => {
    attach(audioRef.current);
  }, []);

  const handleRobotClick = () => {
    const audio = audioRef.current;

    /* An AudioContext starts suspended; this click is the gesture that
       unlocks it, and it must happen before play() to avoid a silent start. */
    resume();

    audio.pause();
    audio.currentTime = 0;

    setSpeaking(true);

    audio.onended = () => {
      setSpeaking(false);
    };

    audio.play().catch(() => setSpeaking(false));
  };

  return (
    <section className="relative overflow-hidden px-6 pt-10 sm:pt-16 md:px-10 lg:px-14">
      <div className="relative mx-auto flex min-h-[560px] sm:min-h-[700px] md:min-h-[820px] lg:min-h-[920px] w-full max-w-[1512px] flex-col items-center text-center">
        {/* Big back text */}
        {/* Left OR */}
        {/* Decorative only — hidden below sm. These sit at fixed top offsets
            that don't reflow, so on a phone "YN" lands on top of the body copy
            and "OR" disappears behind the robot. */}
        <h1
          className="pointer-events-none absolute left-[-1px] top-[120px] z-[1] hidden select-none text-white/95 sm:block"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(80px, 25vw, 380px)',
            lineHeight: '0.9',
            letterSpacing: '0.05em',
          }}
        >
          OR
        </h1>

        {/* Right YN */}
        <h1
          className="pointer-events-none absolute right-[-1px] top-[360px] z-[1] hidden select-none text-white/95 sm:block"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(80px, 20vw, 380px)',
            lineHeight: '0.9',
            letterSpacing: '0.05em',
          }}
        >
          YN
        </h1>

        {/* Robot image */}
        <div className="relative z-10 mt-[-10px] flex justify-center">
          <img
            src={robotHero}
            alt="AI robot"
            className={`
    w-full
    max-w-full
    object-contain
    cursor-pointer
    transition-all
    duration-500
    active:scale-[0.98]
    ${
      speaking
        ? 'scale-[1.02] drop-shadow-[0_0_50px_rgba(168,85,247,0.6)]'
        : 'drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]'
    }
  `}
            style={{
              width: 'clamp(260px, 82vw, 1266px)',
              height: 'auto',
            }}
          />

          {/* Invisible headphone button */}
          <button
            onClick={handleRobotClick}
            aria-label="Talk to ORYN Engine"
            className="
    absolute
    rounded-full
    cursor-pointer
    bg-transparent
    transition-all
    duration-200
  "
            style={{
              width: '90px',
              height: '90px',

              // Adjust these two values
              top: '32%',
              left: '42%',

              transform: 'translate(-50%, -50%)',
            }}
          />

          <div
            className="absolute z-[12] pointer-events-none"
            style={{
              width: 'clamp(320px, 100vw, 2086px)',
              height: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              top: '90%',
              backgroundColor: '#000000',
              filter: 'blur(10px)',
              opacity: 1,
            }}
          />
        </div>

        {/* Main heading */}

        <div className="relative z-10 mt-0 sm:mt-[10px] md:-mt-[50px] lg:-mt-[40px] max-w-[1200px]">
          <h2
            className="font-bold leading-[1.08] tracking-[-0.03em] text-transparent bg-clip-text text-[28px] sm:text-[44px] md:text-[64px] lg:text-[82px]"
            style={{
              background: 'linear-gradient(90deg, #9C34FF 0%, #4FFFFF 100%)',
              WebkitBackgroundClip: 'text',
              textShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            }}
          >
            The complete studio for the
            <br />
            future of voice.
          </h2>
        </div>

        {/* Description text */}

        <p
          className="mt-[20px] text-center px-4"
          style={{
            fontFamily: 'Inter, regular',
            fontWeight: 400,
            fontSize: 'clamp(16px, 1.6vw, 18px)',
            color: '#FFFFFF',
            lineHeight: '1.6',
            maxWidth: '760px',
            margin: '20px auto 0',
          }}
        >
          Revolutionize your workflow with a unified ecosystem for high-fidelity
          cloning, instant text-to-speech generation, and surgical audio
          refinement. From a 60-second sample to a masterpiece, control every
          syllable.
        </p>
      </div>
    </section>
  );
}

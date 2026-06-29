import { useEffect, useState } from 'react';

const messages = ['Initializing Voice Intelligence...', 'Almost Ready...'];

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let value = 0;

    const timer = setInterval(() => {
      value += 25;

      if (value >= 100) {
        value = 100;
        clearInterval(timer);
      }

      setProgress(value);
    }, 40);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex(prev => (prev === messages.length - 1 ? prev : prev + 1));
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#04000F]">
      {/* Background Glow */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-violet-700/12 blur-[190px]" />

      <div className="relative flex flex-col items-center -translate-y-10">
        {/* Logo */}
        <h1
          className="
            text-[58px]
            font-black
            tracking-[0.08em]
            text-white
            animate-pulse
          "
          style={{
            animationDuration: '2.8s',
          }}
        >
          ORYN ENGINE
        </h1>

        <p
          className="
            mt-3
            uppercase
            tracking-[0.45em]
            text-white/50
            text-[13px]
          "
        >
          AI Voice Intelligence Platform
        </p>

        {/* Progress */}
        <div
          className="
            mt-12
            relative
            w-[430px]
            h-[10px]
            rounded-full
            overflow-hidden
            border
            border-white/10
            bg-white/[0.04]
            backdrop-blur-xl
          "
        >
          {/* Fill */}
          <div
            className="
              absolute
              left-0
              top-0
              h-full
              rounded-full
              bg-gradient-to-r
              from-[#6420D8]
              via-[#8B5CF6]
              to-[#B388FF]
              transition-all
              duration-100
            "
            style={{
              width: `${progress}%`,
            }}
          />

          {/* Percentage */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-100"
            style={{
              left: `calc(${progress}% - 18px)`,
            }}
          >
            <span className="text-[10px] font-semibold text-white whitespace-nowrap">
              {progress}%
            </span>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-8 h-6 flex items-center justify-center">
          <p
            key={messageIndex}
            className="
              text-white/65
              text-[15px]
              tracking-wide
              animate-fadeIn
            "
          >
            {messages[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

export default function WaveContainer({ playing = null }) {
  const baseWhite = [22, 20, 20, 20, 22, 26, 32, 38, 46, 54];
  const basePurple = [54, 48, 40, 34, 28, 24, 20, 18, 16];

  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!playing) {
      setFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setFrame(f => f + 1);
    }, 90);

    return () => clearInterval(interval);
  }, [playing]);

  const whiteHeights = baseWhite.map((h, i) => {
    if (playing !== 'real') return h;

    return Math.max(16, h + Math.sin(frame * 0.55 + i * 0.8) * 8);
  });

  const purpleHeights = basePurple.map((h, i) => {
    if (playing !== 'ai') return h;

    return Math.max(16, h + Math.sin(frame * 0.55 + i * 0.8) * 8);
  });

  return (
    <div
      className="
        relative
        overflow-hidden

        w-[245px]
        h-[74px]

        rounded-[22px]

        border
        border-[#D7D0FF]/70

        bg-[linear-gradient(135deg,#31205F_0%,#24184E_45%,#1A123D_100%)]

        backdrop-blur-xl
        backdrop-saturate-150

        shadow-[0_12px_35px_rgba(0,0,0,.45)]

        flex
        items-center
        justify-center

        gap-[4px]

        px-[16px]
      "
    >
      {/* Glass Background */}
      <div
        className="
          absolute
          inset-0
          rounded-[22px]
          bg-gradient-to-b
          from-white/10
          via-transparent
          to-transparent
          pointer-events-none
        "
      />

      {/* Top Gloss */}
      <div
        className="
          absolute
          inset-0
          rounded-[22px]
          bg-gradient-to-b
          from-violet-300/8
          via-violet-200/3
          to-transparent
          pointer-events-none
        "
      />

      {/* White Bars */}
      {whiteHeights.map((h, i) => (
        <div
          key={`w-${i}`}
          className="relative z-10 rounded-full transition-[height] duration-100"
          style={{
            width: 12,
            height: h,
            background: '#FAFAFC',
          }}
        />
      ))}

      {/* Purple Bars */}
      {purpleHeights.map((h, i) => (
        <div
          key={`p-${i}`}
          className="relative z-10 rounded-full transition-[height] duration-100"
          style={{
            width: 12,
            height: h,
            background: '#6B21A8',
          }}
        />
      ))}
    </div>
  );
}

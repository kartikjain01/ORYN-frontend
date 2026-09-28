import React from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import WaveContainer from './WaveContainer';

export default function VoiceCards({
  // Card Scale
  scale = 0.1,

  // Gap Between Cards
  cardGap = 0,

  // Images
  image,
  imageWidth = 500,
  imageScale = 1,
  imageBottom = -5,
  imageLeft = '50%',
  isTTS = false,
  // Badge Text
  leftBadge = 'REAL VOICE',
  rightBadge = 'AI VOICE',
  isHovered,
  transitioning,
  // Animation / Audio
  progress,
  playing,

  realPop,
  aiPop,

  currentSlide,
  slideCount,

  onPlayReal,
  onPlayAI,
  onDotClick,
  onMouseEnter,
  onMouseLeave,
}) {
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`
    relative
    transition-all
    duration-700
    ease-[cubic-bezier(.22,1,.36,1)]
    ${transitioning ? '-translate-x-10 opacity-0' : 'translate-x-0 opacity-100'}
  `}
        style={{
          transform: `scale(${isHovered ? scale * 1.05 : scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="relative flex items-start">
          {/* ========================= */}
          {/* LEFT CARD */}
          {/* ========================= */}

          <div
            className="origin-top"
            style={{
              marginRight: `${cardGap}px`,
            }}
          >
            <div className="relative w-[500px] h-[590px] rounded-[44px] overflow-hidden isolate">
              {/* Base */}
              <div className="absolute inset-0 bg-[#202024]" />
              <div className="absolute inset-0 bg-[#232326]" />

              {/* Ambient glow — single radial gradient instead of multiple blur layers */}
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(255,255,255,0.07),transparent_65%)]"
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-[radial-gradient(circle_at_60%_40%,rgba(255,255,255,.10),transparent_55%)]
                "
              />

              <div
                className="
                  absolute
                  top-0
                  left-0
                  w-full
                  h-[70%]
                  bg-gradient-to-b
                  from-black/45
                  via-black/18
                  to-transparent
                "
              />

              {/* Badge */}
              <div className="absolute top-5 left-6 z-20">
                <div
                  className="
                    h-[58px]
                    px-8
                    rounded-full
                    border
                    border-white/10
                    bg-white/5
                    bg-white/8
                    flex
                    items-center
                  "
                >
                  <span className="text-white text-[26px] font-semibold tracking-wide">
                    {leftBadge}
                  </span>
                </div>
              </div>

              {/* REAL BUTTON */}
              {!isTTS && (
                <button
                  onClick={onPlayReal}
                  className={`
      absolute
      top-5
      left-110
      w-10
      h-10
      rounded-full
      border
      border-white/30
      bg-white/10
      bg-white/8
      flex
      items-center
      justify-center
      transition-all
      duration-300
      ease-out
      active:scale-95
      ${realPop ? 'scale-150' : 'scale-100'}
    `}
                >
                  {playing === 'real' ? (
                    <PauseIcon className="w-7 h-7 text-white" />
                  ) : (
                    <PlayIcon className="w-7 h-7 text-white" />
                  )}
                </button>
              )}

              {/* Image */}
              {isTTS ? (
                <div
                  className="
    absolute
    top-[120px]
    left-12
    right-12
    z-10
  "
                >
                  <p
                    className="
      text-[30px]
      leading-[1.9]
      text-white/85
      font-medium
      whitespace-pre-wrap
      tracking-[0.01em]
    "
                  >
                    Welcome to ORYN Engine.
                    {'\n'}
                    Experience intelligent voice generation instantly.
                    {'\n'}
                    Transform text into natural, human-like speech with
                    expressive delivery.
                  </p>
                </div>
              ) : (
                <img
                  src={image}
                  alt="Voice Card"
                  className="
      absolute
      -translate-x-1/2
      object-contain
      pointer-events-none
      select-none
    "
                  style={{
                    width: `${imageWidth}px`,
                    bottom: `${imageBottom}px`,
                    left: imageLeft,
                    transform: `translateX(-50%) scale(${imageScale})`,
                    transformOrigin: 'bottom center',
                  }}
                />
              )}
            </div>
          </div>
          {/* ========================= */}
          {/* RIGHT CARD */}
          {/* ========================= */}

          <div
            className="origin-top"
            style={{
              marginLeft: `${cardGap}px`,
            }}
          >
            <div className="relative w-[500px] h-[590px] rounded-[44px] overflow-hidden isolate">
              {/* Background */}
              <div className="absolute inset-0 bg-[#8227FF]" />

              <div
                className="
                  absolute
                  inset-0
                  bg-[linear-gradient(135deg,#C84CFF_0%,#A125FF_28%,#831DFF_55%,#6B11F8_100%)]
                "
              />

              {/* Purple Dark Overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-[linear-gradient(135deg,rgba(60,0,120,.10)_0%,rgba(40,0,90,.14)_50%,rgba(25,0,60,.28)_100%)]
                "
              />

              {/* Bottom glow — radial gradient instead of blur layer */}
              <div
                className="absolute bottom-0 inset-x-0 h-[40%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(74,0,168,0.3),transparent_70%)]"
              />

              {/* Top Overlay */}
              <div
                className="
                  absolute
                  top-0
                  left-0
                  w-full
                  h-[180px]
                  bg-gradient-to-b
                  from-black/12
                  via-transparent
                  to-transparent
                "
              />

              {/* Overall Overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-[linear-gradient(to_bottom,rgba(0,0,0,.08),transparent_35%,rgba(0,0,0,.08))]
                "
              />

              {/* Top glow — radial gradient */}
              <div
                className="absolute -top-24 right-0 w-full h-[60%] bg-[radial-gradient(ellipse_at_80%_0%,rgba(255,255,255,0.06),transparent_60%)]"
              />

              {/* Badge */}
              <div className="absolute top-5 left-6 z-20">
                <div
                  className="
                    h-[58px]
                    px-8
                    rounded-full
                    border
                    border-white/15
                    bg-white/8
                    bg-white/8
                    flex
                    items-center
                  "
                >
                  <span className="text-white text-[26px] font-semibold tracking-wide">
                    {rightBadge}
                  </span>
                </div>
              </div>

              {/* AI BUTTON */}
              <button
                onClick={onPlayAI}
                className={`
absolute
top-5
right-5
w-10
h-10
rounded-full
border
border-white/30
bg-white/10
bg-white/8
flex
items-center
justify-center
transition-all
duration-300
ease-out
active:scale-95
${aiPop ? 'scale-150' : 'scale-100'}
`}
              >
                {playing === 'ai' || playing === 'both' ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
              </button>

              {/* Image */}
              <img
                src={image}
                alt="Voice Card"
                className="
    absolute
    -translate-x-1/2
    object-contain
    pointer-events-none
    select-none
  "
                style={{
                  width: `${imageWidth}px`,
                  bottom: `${imageBottom}px`,
                  left: imageLeft,
                  transform: `translateX(-50%) scale(${imageScale})`,
                  transformOrigin: 'bottom center',
                }}
              />
            </div>
          </div>
        </div>
        {/* Wave Wrapper */}

        <div
          className="
    absolute
    left-[525px]
    bottom-[-40px]
    -translate-x-1/2
    z-20
  "
        >
          <div
            style={{
              transform: 'scale(2)',
              transformOrigin: 'center bottom',
            }}
          >
            <WaveContainer
              progress={progress}
              playing={isTTS ? (playing ? 'both' : null) : playing}
            />
          </div>
        </div>
      </div>
      {/* DOTS */}

      <div
        className="
    absolute
    left-[220px]
    -translate-x-1/2
    bottom-[300px]
    flex
    justify-center
    gap-3
  "
      >
        {' '}
        {Array.from({ length: slideCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => onDotClick(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-3 h-3 bg-violet-500'
                : 'w-3 h-3 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

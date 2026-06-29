import { useEffect, useRef, useState } from 'react';
import VoiceCards from './VoiceCards';
// ===============================
// Voice Card Images
// ===============================

import vcDemo1 from '../../assets/images/voice-cloning-demo/demo1.png';
import vcDemo2 from '../../assets/images/voice-cloning-demo/demo2.png';
import vcDemo3 from '../../assets/images/voice-cloning-demo/demo3.png';

import ttsDemo1 from '../../assets/images/tts-demo/demo1.png';
import ttsDemo2 from '../../assets/images/tts-demo/demo2.png';
import ttsDemo3 from '../../assets/images/tts-demo/demo3.png';

import editorDemo1 from '../../assets/images/voice-editor-demo/demo1.png';
import editorDemo2 from '../../assets/images/voice-editor-demo/demo2.png';
import editorDemo3 from '../../assets/images/voice-editor-demo/demo3.png';

// ===============================
// Voice Cloning Audio
// ===============================

import vcReal1 from '../../assets/audio/voice-cloning-demo/real1.wav';
import vcAi1 from '../../assets/audio/voice-cloning-demo/ai1.wav';

// ===============================
// Text To Speech Audio
// ===============================

import ttsReal1 from '../../assets/audio/tts-demo/real1.wav';
import ttsAi1 from '../../assets/audio/tts-demo/ai1.wav';

// ===============================
// Voice Editor Audio
// ===============================

import editorReal1 from '../../assets/audio/voice-editor-demo/real1.wav';
import editorAi1 from '../../assets/audio/voice-editor-demo/ai1.wav';

// ======================================================
// Shared Slide Arrays
// ======================================================

const cloningSlides = [
  {
    image: vcDemo1,
    imageWidth: 500,
    imageScale: 1,
    imageBottom: -5,
    imageLeft: '99.5%',
    realAudio: vcReal1,
    aiAudio: vcAi1,
  },
  {
    image: vcDemo2,
    imageWidth: 500, // bigger
    imageScale: 1.7,
    imageBottom: 0, // move down
    imageLeft: '99.5%',
    realAudio: vcReal1,
    aiAudio: vcAi1,
  },
  {
    image: vcDemo3,
    imageWidth: 500,
    imageScale: 1.7,
    imageBottom: -5,
    imageLeft: '99.5%',
    realAudio: vcReal1,
    aiAudio: vcAi1,
  },
];

const ttsSlides = [
  {
    image: ttsDemo1,
    imageWidth: 500,
    imageScale: 1,
    imageBottom: -5,
    imageLeft: '99.5%',
    realAudio: ttsReal1,
    aiAudio: ttsAi1,
  },
  {
    image: ttsDemo2,
    imageWidth: 500, // bigger
    imageScale: 1.7,
    imageBottom: 0, // move down
    imageLeft: '99.5%',
    realAudio: ttsReal1,
    aiAudio: ttsAi1,
  },
  {
    image: ttsDemo3,
    imageWidth: 500, // bigger
    imageScale: 1.7,
    imageBottom: 0, // move down
    imageLeft: '99.5%',
    realAudio: ttsReal1,
    aiAudio: ttsAi1,
  },
];

const editorSlides = [
  {
    image: editorDemo1,
    imageWidth: 500,
    imageScale: 1,
    imageBottom: -5,
    imageLeft: '99.5%',
    realAudio: editorReal1,
    aiAudio: editorAi1,
  },
  {
    image: editorDemo2,
    imageWidth: 500, // bigger
    imageScale: 1.7,
    imageBottom: 0, // move down
    imageLeft: '99.5%',
    realAudio: editorReal1,
    aiAudio: editorAi1,
  },
  {
    image: editorDemo3,
    imageWidth: 500, // bigger
    imageScale: 1.7,
    imageBottom: 0, // move down
    imageLeft: '99.5%',
    realAudio: editorReal1,
    aiAudio: editorAi1,
  },
];

// ======================================================
// Component Configs
// ======================================================

const configs = {
  cloning: {
    slides: cloningSlides,

    position: {
      left: 190,
      top: 130,
    },

    preview: {
      scale: 0.4,
      cardGap: 30,
    },

    content: {
      leftBadge: 'REAL VOICE',
      rightBadge: 'CLONED VOICE',
    },
  },

  tts: {
    slides: ttsSlides,

    position: {
      left: 0,
      top: 130,
    },

    preview: {
      scale: 0.4,
      cardGap: 30,
    },

    content: {
      leftBadge: 'TEXT INPUT',
      rightBadge: 'GENERATED VOICE',
    },
  },

  editor: {
    slides: editorSlides,

    position: {
      left: 190,
      top: 130,
    },

    preview: {
      scale: 0.4,
      cardGap: 30,
    },

    content: {
      leftBadge: 'REAL VOICE',
      rightBadge: 'ENHANCED VOICE',
    },
  },
};

let globalPlayer = {
  audio: null,
  stop: null,
};

export default function VoiceComparisonSlider({ type, pulse }) {
  const config = configs[type] ?? configs.cloning;

  const realAudioRef = useRef(null);
  const aiAudioRef = useRef(null);
  const slideTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [realPop, setRealPop] = useState(false);
  const [aiPop, setAiPop] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { slides, position, preview, content } = config;
  const slide = slides[currentSlide];

  // -----------------------------
  // Stop all audio
  // -----------------------------
  const stopAllAudio = () => {
    if (!globalPlayer.audio) return;

    globalPlayer.audio.pause();
    globalPlayer.audio.currentTime = 0;

    globalPlayer.stop?.();

    globalPlayer.audio = null;
    globalPlayer.stop = null;
    setProgress(0);
  };

  // -----------------------------
  // Auto Slider
  // -----------------------------
  useEffect(() => {
    if (isHovered || playing) return;

    const timer = setTimeout(() => {
      setTransitioning(true);

      const transition = setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitioning(false);
          });
        });
      }, 350);

      return () => clearTimeout(transition);
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentSlide, isHovered, playing, slides.length]);

  // -----------------------------
  // Global Pulse Animation
  // -----------------------------
  useEffect(() => {
    if (isHovered || playing) return;

    setRealPop(true);

    const t1 = setTimeout(() => {
      setRealPop(false);

      setAiPop(true);
    }, 180);

    const t2 = setTimeout(() => {
      setAiPop(false);
    }, 380);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pulse, isHovered, playing]);

  // -----------------------------
  // Audio Finished
  // -----------------------------
  useEffect(() => {
    const finished = () => {
      globalPlayer.audio = null;
      globalPlayer.stop = null;

      setPlaying(null);
      setProgress(0);
    };

    const real = realAudioRef.current;
    const ai = aiAudioRef.current;

    real?.addEventListener('ended', finished);
    ai?.addEventListener('ended', finished);

    return () => {
      real?.removeEventListener('ended', finished);
      ai?.removeEventListener('ended', finished);
    };
  }, []);

  // -----------------------------
  // Play Real
  // -----------------------------
  const playReal = async () => {
    clearTimeout(slideTimerRef.current);
    clearTimeout(transitionTimerRef.current);
    if (!realAudioRef.current) return;

    if (playing === 'real') {
      stopAllAudio();
      setPlaying(null);
      return;
    }

    stopAllAudio();

    try {
      realAudioRef.current.currentTime = 0;

      await realAudioRef.current.play();

      globalPlayer.audio = realAudioRef.current;
      globalPlayer.stop = () => setPlaying(null);

      setPlaying('real');
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------
  // Play AI
  // -----------------------------
  const playAI = async () => {
    clearTimeout(slideTimerRef.current);
    clearTimeout(transitionTimerRef.current);
    if (!aiAudioRef.current) return;

    if (playing === 'ai') {
      stopAllAudio();
      setPlaying(null);
      return;
    }

    stopAllAudio();

    try {
      aiAudioRef.current.currentTime = 0;

      await aiAudioRef.current.play();

      globalPlayer.audio = aiAudioRef.current;
      globalPlayer.stop = () => setPlaying(null);

      setPlaying('ai');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const audio =
      playing === 'real'
        ? realAudioRef.current
        : playing === 'ai'
          ? aiAudioRef.current
          : null;

    if (!audio) {
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      if (!audio.duration) return;

      setProgress(audio.currentTime / audio.duration);
    };

    audio.addEventListener('timeupdate', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [playing]);

  // -----------------------------
  // Change Slide
  // -----------------------------
  const changeSlide = index => {
    clearTimeout(slideTimerRef.current);
    clearTimeout(transitionTimerRef.current);
    stopAllAudio();
    setTransitioning(true);

    setTimeout(() => {
      setCurrentSlide(index);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitioning(false);
        });
      });
    }, 350);
  };

  return (
    <div className="relative flex justify-center w-full overflow-visible">
      <div
        className="
    relative
    w-[1400px]
    h-[500px]
  "
      >
        {/* Position Wrapper */}
        <div
          className="absolute overflow-visible"
          style={{
            left: position.left,
            top: position.top,
          }}
        >
          <VoiceCards
            {...preview}
            {...content}
            image={slide.image}
            imageWidth={slide.imageWidth}
            imageScale={slide.imageScale}
            imageBottom={slide.imageBottom}
            imageLeft={slide.imageLeft}
            isTTS={type === 'tts'}
            isHovered={isHovered}
            transitioning={transitioning}
            progress={progress}
            playing={playing}
            realPop={realPop}
            aiPop={aiPop}
            currentSlide={currentSlide}
            slideCount={slides.length}
            onPlayReal={playReal}
            onPlayAI={playAI}
            onDotClick={changeSlide}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
        </div>
      </div>

      <audio ref={realAudioRef} src={slide.realAudio} preload="auto" />
      <audio ref={aiAudioRef} src={slide.aiAudio} preload="auto" />
    </div>
  );
}

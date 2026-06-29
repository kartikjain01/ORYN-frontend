import { useState, useRef, useEffect } from 'react';
import VoiceComparisonSlider from './VoiceComparisonSlider';

const featureRows = [
  {
    id: '01 / Feature',
    title: 'Voice Cloning',
    description:
      'Clone any voice with just 30 seconds of audio. Our advanced neural network captures unique voice characteristics including pitch, tone, and speaking style.',
    bullets: [
      'High-fidelity voice replication',
      'Emotional expression preservation',
      'Secure and private processing',
    ],
    cardType: 'upload',
  },
  {
    id: '02 / Feature',
    title: 'Text to Speech',
    description:
      'Transform any text into lifelike speech in milliseconds. Our advanced AI models create natural-sounding voices with perfect intonation and emotion.',
    bullets: [
      'Multiple voice personalities and accents',
      'Real-time generation with low latency',
      'High-quality audio output formats',
    ],
    cardType: 'tts',
  },
  {
    id: '03 / Feature',
    title: 'Voice Editing',
    description:
      'Professional-grade audio editing tools to clean up your recordings. Remove background noise, trim silence, and enhance audio quality with AI-powered processing.',
    bullets: [
      'AI-powered noise removal',
      'Precision trimming and cutting',
      'Audio enhancement filters',
    ],
    cardType: 'uploadEdit',
  },
];

function TTSCard() {
  const [text, setText] = useState(
    'Welcome to ORYN Engine. Experience AI-powered voice generation instantly.'
  );
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const audioRef = useRef(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);

      setTimeout(() => {
        audioRef.current?.play();
      }, 200);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleStop = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-violet-400/20 bg-white/[0.04] p-6 shadow-lg backdrop-blur-md">
      <div className="bg-white/[0.02] rounded-xl px-3 py-1">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          className="w-full h-[140px] sm:h-[160px] rounded-lg border border-violet-400/25 bg-white/[0.02] px-3 py-3 text-sm text-white outline-none resize-none"
          placeholder="Type or paste the text you want to convert to speech..."
        />

        {/* TOP SECTION */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h4 className="text-xl sm:text-1xl font-medium text-white">
              Voice Generation
            </h4>
            <p className="mt-0.5 text-sm text-white/35">
              Transform text into lifelike speech instantly
            </p>
          </div>

          {/* ✅ BUTTON ALWAYS VISIBLE */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-full border border-violet-400/25 bg-white/[0.04] px-6 py-2.5 text-sm font-medium text-white shadow-md sm:w-auto"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* ✅ AUDIO PLAYER BELOW */}
        {audioUrl && (
          <div className="mt-4 flex items-center gap-3 rounded-full bg-white/[0.05] px-4 py-2 animate-fadeIn">
            <button
              onClick={() => {
                if (audioRef.current.paused) {
                  audioRef.current.play();
                } else {
                  audioRef.current.pause();
                }
              }}
              className="text-white/80 hover:text-white text-sm"
            >
              ▶
            </button>

            <div className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-white/70"></div>
            </div>

            <audio ref={audioRef} src={audioUrl} />
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureText({ id, title, description, bullets }) {
  return (
    <div className="text-left">
      <p className="text-lg text-white/70">{id}</p>

      <h3 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/80">
        {description}
      </p>

      <ul className="mt-4 space-y-2 text-sm sm:text-base text-white/90">
        {bullets.map(item => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function FeaturedProduction() {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative mt-14 sm:mt-20 px-6 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-white">
            Voice Showcase
          </h2>

          <p className="mt-3 text-base sm:text-lg text-white/80">
            Try Our Samples
          </p>
        </div>

        <div className="mt-5 space-y-0 sm:space-y-0">
          <div className="grid items-center gap-10 lg:gap-12 lg:grid-cols-2">
            <FeatureText {...featureRows[0]} />
            <div className="relative flex justify-center lg:justify-end">
              <VoiceComparisonSlider type="cloning" pulse={pulse} />
            </div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2 -mt-10">
            <div className="order-2 lg:order-1 relative flex justify-center lg:justify-start">
              <VoiceComparisonSlider type="tts" pulse={pulse} />
            </div>
            <div className="order-1 lg:order-2">
              <FeatureText {...featureRows[1]} />
            </div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2 -mt-10">
            <FeatureText {...featureRows[2]} />
            <div className="relative flex justify-center lg:justify-end">
              <VoiceComparisonSlider type="editor" pulse={pulse} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

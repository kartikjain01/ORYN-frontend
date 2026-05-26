import { useRef, useState, useEffect } from 'react';
import { Plus, Mic, Paperclip } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_VOICE_GENERATION;

export default function GlowBackgroundPlayground() {
  const [showAudio, setShowAudio] = useState(false);

  const [text, setText] = useState('');

  const [audioUrl, setAudioUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);

  const [showExportSettings, setShowExportSettings] = useState(false);

  const [selectedFormat, setSelectedFormat] = useState('MP3');

  const [selectedQuality, setSelectedQuality] = useState('High');

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [feedbackText, setFeedbackText] = useState('');

  const [feedbackRating, setFeedbackRating] = useState(5);

  const [showHelpModal, setShowHelpModal] = useState(false);

  // ✅ STATIC VOICES (SAFE VERSION)
  const [selectedVoice, setSelectedVoice] = useState('michael');

  const voices = [
    {
      id: 'bella',
      label: 'Bella (English Female)',
    },

    {
      id: 'sarah',
      label: 'Sarah (English Female)',
    },

    {
      id: 'nova',
      label: 'Nova (English Female)',
    },

    {
      id: 'nicole',
      label: 'Nicole (English Female)',
    },

    {
      id: 'sky',
      label: 'Sky (English Female)',
    },

    {
      id: 'michael',
      label: 'Michael (English Male)',
    },

    {
      id: 'adam',
      label: 'Adam (English Male)',
    },

    {
      id: 'echo',
      label: 'Echo (English Male)',
    },

    {
      id: 'eric',
      label: 'Eric (English Male)',
    },

    {
      id: 'liam',
      label: 'Liam (English Male)',
    },

    {
      id: 'omega',
      label: 'Omega (Hindi Male)',
    },

    {
      id: 'psi',
      label: 'Psi (Hindi Male)',
    },

    {
      id: 'alpha_female_hindi',
      label: 'Alpha (Hindi Female)',
    },

    {
      id: 'beta_female_hindi',
      label: 'Beta (Hindi Female)',
    },
  ];

  const exportBoxRef = useRef(null);

  // ==========================================
  // FILE UPLOAD
  // ==========================================

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = e => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type === 'text/plain') {
      const reader = new FileReader();

      reader.onload = event => {
        setText(event.target.result);
      };

      reader.readAsText(file);
    } else {
      alert('Only .txt files supported');
    }
  };

  // ==========================================
  // OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const handleOutsideClick = event => {
      if (
        showExportSettings &&
        exportBoxRef.current &&
        !exportBoxRef.current.contains(event.target)
      ) {
        setShowExportSettings(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showExportSettings]);

  // ==========================================
  // AUDIO FUNCTIONS
  // ==========================================

  const togglePlay = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio?.duration) return;

    const percent = (audio.currentTime / audio.duration) * 100;

    setProgress(percent);
  };

  // ==========================================
  // EXPORT
  // ==========================================

  const handleConfirmExport = async () => {
    if (!audioUrl) {
      alert('No audio to export');

      return;
    }

    try {
      const response = await fetch(audioUrl);

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = blobUrl;

      link.download = `speech.${selectedFormat.toLowerCase()}`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);

      setShowExportSettings(false);
    } catch (err) {
      console.error('Download failed:', err);

      alert('Failed to download audio');
    }
  };

  // ==========================================
  // GENERATE AUDIO
  // ==========================================

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const fullName =
        user?.user_metadata?.full_name || user?.email || 'unknown_user';

      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          text: text.replace(/\n/g, ' '),

          speed: 1,

          voice: selectedVoice,

          user_id: fullName,
        }),
      });

      if (!response.ok) {
        throw new Error('Backend Error');
      }

      const data = await response.json();

      setAudioUrl(data.audio_url);

      setShowAudio(true);
    } catch (error) {
      console.error('Connection failed:', error);

      alert('Backend connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // FEEDBACK
  // ==========================================

  const handleSubmitFeedback = () => {
    console.log({
      rating: feedbackRating,
      feedback: feedbackText,
    });

    alert('Thanks for your feedback!');

    setShowFeedbackModal(false);

    setFeedbackText('');

    setFeedbackRating(5);
  };

  return (
    <div
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        overflow-y-auto
        isolate
        text-white
      "
      style={{ background: '#050010' }}
    >
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(circle at 85% 15%, rgba(235,0,225,0.25), rgba(120,0,150,0.15), rgba(10,0,20,0.95))',
        }}
      />

      {/* GLOW */}
      <div
        className="
          absolute
          -z-10
          pointer-events-none
          rounded-full
        "
        style={{
          top: '-150px',
          right: '-150px',
          width: 500,
          height: 500,
          filter: 'blur(80px)',
          background:
            'radial-gradient(circle at 60% 40%, #EB00E1 0%, rgba(255,255,255,0.6) 100%)',
        }}
      />

      {/* HEADER BUTTONS */}
      <div
        className="
          relative z-20
          flex flex-wrap justify-end
          gap-2 sm:gap-3 md:gap-4
          px-3 sm:px-5 md:px-8
          pt-4 sm:pt-5 md:pt-6
        "
      >
        <button
          onClick={() => setShowHelpModal(true)}
          className="
            px-3 py-1.5
            sm:px-4 sm:py-2
            md:px-5 md:py-2
            rounded-xl
            text-xs sm:text-sm
            font-medium
            bg-white/10
            text-white
            border border-white/20
            backdrop-blur-md
            hover:bg-white/20
            transition-all duration-300
          "
        >
          Help
        </button>

        <button
          onClick={() => setShowFeedbackModal(true)}
          className="
            px-3 py-1.5
            sm:px-4 sm:py-2
            md:px-5 md:py-2
            rounded-xl
            text-xs sm:text-sm
            font-medium
            bg-white/10
            text-white
            border border-white/20
            backdrop-blur-md
            hover:bg-white/20
            transition-all duration-300
          "
        >
          Feedback
        </button>

        <button
          onClick={() => setShowExportSettings(!showExportSettings)}
          className="
            px-5 py-2
            rounded-xl
            bg-white
            text-black
            border border-white/70
            shadow-sm
            hover:shadow-md
            hover:scale-[1.02]
            transition-all
            duration-300
            text-sm
            font-medium
            flex items-center
            gap-2.5
          "
        >
          <span className="text-base -ml-1">↓</span>

          <span>Export</span>
        </button>
      </div>

      {/* TITLE */}
      <div
        className="
          relative z-10
          pt-8 sm:pt-10 md:pt-14
          text-center
        "
      >
        <h1
          className="
            text-3xl
            sm:text-5xl
            md:text-6xl
            font-semibold
            px-4
          "
        >
          Text to Speech
        </h1>

        <p
          className="
            mt-4
            text-sm sm:text-base md:text-lg
            text-gray-300
            px-6
          "
        >
          Your voice-powered automation hub plan, create and execute smarter
          with AI.
        </p>
      </div>

      {/* MAIN */}
      <div
        className="
          relative z-10
          mt-10
          px-4 sm:px-6 md:px-10 lg:px-20
          xl:pr-[380px]
          pb-10
        "
      >
        {/* INPUT BOX */}
        <div
          className="
            flex
            min-h-[420px]
            md:h-[470px]
            w-full
            max-w-4xl
            overflow-hidden
            flex-col
            justify-between
            rounded-2xl
            bg-white/90
            p-4 sm:p-6
            text-black
          "
        >
          <input
            type="file"
            accept=".txt"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="
              h-full
              min-h-[260px]
              w-full
              resize-none
              bg-transparent
              text-sm sm:text-base
              text-gray-700
              outline-none
            "
            placeholder="
              Start typing here or paste any text
              you want to turn into life like speech...
            "
          />

          {/* AUDIO PLAYER */}
          {showAudio && (
            <div
              className="
                mt-4
                rounded-xl
                bg-white/40
                backdrop-blur-md
                p-3
                border border-white/30
              "
            >
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />

              <div
                className="
                  flex
                  items-center
                  gap-2 sm:gap-3
                "
              >
                <button
                  onClick={togglePlay}
                  className="
                    w-9 h-9
                    sm:w-8 sm:h-8
                    flex items-center
                    justify-center
                    rounded-full
                    bg-purple-600
                    text-white
                  "
                >
                  {isPlaying ? '❚❚' : '▶️'}
                </button>

                <div
                  className="
                    flex-1
                    h-2
                    bg-gray-300
                    rounded-full
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      h-full
                      bg-purple-600
                      transition-all
                      duration-200
                    "
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <span
                  className="
                    text-xs
                    text-gray-700
                    w-10
                    text-right
                  "
                >
                  {Math.floor(progress)}%
                </span>
              </div>
            </div>
          )}

          {/* BOTTOM */}
          <div
            className="
              mt-4
              flex flex-col
              sm:flex-row
              gap-4
              sm:items-center
              sm:justify-between
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                text-gray-500
              "
            >
              <div
                onClick={handleFileUploadClick}
                className="
                  w-8 h-8
                  flex items-center
                  justify-center
                  rounded-full
                  border border-gray-400
                  cursor-pointer
                  hover:bg-gray-200
                "
              >
                <Paperclip size={16} />
              </div>

              <div
                className="
                  w-8 h-8
                  flex items-center
                  justify-center
                  rounded-full
                  border border-gray-400
                "
              >
                <Mic size={16} />
              </div>

              <span>Data source</span>
            </div>

            <button
              onClick={handleGenerate}
              className="
                w-full sm:w-auto
                rounded-full
                bg-gray-400
                px-5 py-2.5
                text-sm sm:text-base
                text-white
              "
            >
              {isLoading ? 'Processing...' : 'Generate Speech'}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="
            relative xl:absolute
            xl:top-1/2
            xl:right-4
            xl:-translate-y-1/2
            z-10
            w-full
            xl:w-[340px]
            mt-6 xl:mt-0
            h-auto xl:h-[470px]
            rounded-2xl
            bg-white/90
            p-5
            text-black
            overflow-x-hidden
            overflow-y-auto
          "
        >
          <h2 className="mb-4 font-semibold">Tool</h2>

          <div className="space-y-4">
            {/* VOICE SELECT */}
            <div>
              <p
                className="
                  mb-2
                  text-sm
                  font-medium
                "
              >
                Voice
              </p>

              <select
                value={selectedVoice}
                onChange={e => setSelectedVoice(e.target.value)}
                className="
                  w-full
                  rounded-lg
                  bg-gray-100
                  p-3
                  text-sm
                  outline-none
                  border
                  border-gray-200
                "
              >
                {voices.map(voice => (
                  <option key={voice.id} value={voice.id}>
                    {voice.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-1 text-sm">Language</p>

              <div
                className="
                  rounded-lg
                  bg-gray-100
                  p-2
                "
              >
                Auto
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm">Speed</p>

              <input type="range" className="w-full" />
            </div>

            <div>
              <p className="mb-1 text-sm">Stability</p>

              <input type="range" className="w-full" />
            </div>

            <div>
              <p className="mb-1 text-sm">Similarity</p>

              <input type="range" className="w-full" />
            </div>

            <div>
              <p className="mb-1 text-sm">Style Exaggeration</p>

              <input type="range" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

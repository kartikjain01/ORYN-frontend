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
  const exportBoxRef = useRef(null);

  // ✅ FILE UPLOAD FUNCTIONS (UNCHANGED)
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

  // ✅ OUTSIDE CLICK EFFECT (UNCHANGED)
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

  // ✅ AUDIO FUNCTIONS (UNCHANGED)
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

  // ✅ 🔥 MOVED OUT (THIS WAS YOUR BUG)
  const handleConfirmExport = () => {
    if (!audioUrl) {
      alert('No audio to export');
      return;
    }

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `speech.${selectedFormat.toLowerCase()}`;
    link.click();

    setShowExportSettings(false);
  };

  // ✅ GENERATE FUNCTION (ONLY CLEANED STRUCTURE, LOGIC SAME)
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
          voice: 'af_bella',
          user_id: fullName,
        }),
      });

      if (!response.ok) throw new Error('Backend Error');

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
  // ✅ TOP LEVEL (same level as other handlers)
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
      className="relative h-screen w-full overflow-hidden isolate text-white"
      style={{ background: '#050010' }}
    >
      {/* Background Gradient */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(circle at 85% 15%, rgba(235,0,225,0.25), rgba(120,0,150,0.15), rgba(10,0,20,0.95))',
        }}
      />

      {/* Glow Ellipse */}
      <div
        className="absolute -z-10 pointer-events-none rounded-full"
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

      <div className="absolute top-6 right-8 z-20 flex items-center gap-4">
        <button
          onClick={() => setShowHelpModal(true)}
          className="px-5 py-2 rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300 text-sm font-medium"
        >
          Help
        </button>

        <button
          onClick={() => setShowFeedbackModal(true)}
          className="px-5 py-2 rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300 text-sm font-medium"
        >
          Feedback
        </button>

        <button
          onClick={() => setShowExportSettings(!showExportSettings)}
          className="px-5 py-2 rounded-xl bg-white text-black border border-white/70 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 text-sm font-medium flex items-center gap-2.5"
        >
          <span className="text-base -ml-1">↓</span>
          <span>Export</span>
        </button>
      </div>

      {showExportSettings && (
        <div className="absolute top-20 right-8 z-50" ref={exportBoxRef}>
          <div className="w-[300px] rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-5 text-white">
              Output Settings
            </h2>

            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-white/90">Format</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedFormat('MP3')}
                  className={`py-3 rounded-2xl border transition-all ${
                    selectedFormat === 'MP3'
                      ? 'bg-white text-black border-white'
                      : 'bg-white/10 text-white border-white/20'
                  }`}
                >
                  MP3
                </button>

                <button
                  onClick={() => setSelectedFormat('WAV')}
                  className={`py-3 rounded-2xl border transition-all ${
                    selectedFormat === 'WAV'
                      ? 'bg-white text-black border-white'
                      : 'bg-white/10 text-white border-white/20'
                  }`}
                >
                  WAV
                </button>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-medium mb-2 text-white/90">Quality</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedQuality('Low')}
                  className={`py-3 rounded-2xl border transition-all ${
                    selectedQuality === 'Low'
                      ? 'bg-white text-black border-white'
                      : 'bg-white/10 text-white border-white/20'
                  }`}
                >
                  <span className="font-bold">Low</span>
                </button>

                <button
                  onClick={() => setSelectedQuality('High')}
                  className={`py-3 rounded-2xl border transition-all ${
                    selectedQuality === 'High'
                      ? 'bg-white text-black border-white'
                      : 'bg-white/10 text-white border-white/20'
                  }`}
                >
                  <span className="font-bold">High</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleConfirmExport}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
            >
              Confirm Export
            </button>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="w-[520px] rounded-3xl border border-gray-200 bg-white p-7 shadow-2xl text-black"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-2">
              🎙️ Text to Speech — How It Works
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Follow these simple steps to convert your text into natural,
              high-quality speech.
            </p>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>1.</strong> Enter your text or upload a text file that
                you want to convert into speech.
              </p>
              <p>
                <strong>2.</strong> Choose your preferred voice and language for
                the output.
              </p>
              <p>
                <strong>3.</strong> Adjust settings like speed, tone, or style
                to match your desired sound.
              </p>
              <p>
                <strong>4.</strong> Enable enhancements if available, such as
                clarity or voice polishing.
              </p>
              <p>
                <strong>5.</strong> Click “Generate Speech” and wait for the
                system to process your text.
              </p>
              <p>
                <strong>6.</strong> Preview the generated audio and download or
                export it in your preferred format.
              </p>
            </div>

            <div className="mt-6 border-t pt-5">
              <p className="font-semibold mb-2">Need More Help?</p>
              <p className="text-sm text-gray-600">
                Email: support@aivoiceediting.com
              </p>
              <p className="text-sm text-gray-600">
                Toll Free: +1 800 123 4567
              </p>
              <p className="text-sm text-gray-600">
                Working Hours: Mon – Sat | 9 AM – 7 PM
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
            >
              Close Help
            </button>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowFeedbackModal(false)} // ✅ close on outside click
        >
          <div
            className="w-[420px] rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl text-black"
            onClick={e => e.stopPropagation()} // ✅ prevent modal close when clicking inside
          >
            <h2 className="text-xl font-semibold mb-2">Share Your Feedback</h2>

            <p className="text-sm text-gray-500 mb-5">
              Tell us about your experience using AI Voice Editing
            </p>

            {/* ⭐ Rating */}
            <div className="mb-4">
              <p className="text-sm mb-2">Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button" // ✅ prevents form submit issues
                    onClick={() => setFeedbackRating(star)}
                    className={`text-3xl transition-all duration-200 ${
                      feedbackRating >= star
                        ? 'text-yellow-500 scale-110'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* ✍️ Feedback */}
            <div className="mb-5">
              <p className="text-sm mb-2">Your Feedback</p>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Tell us what you liked or what we can improve..."
                className="w-full h-32 rounded-2xl border border-gray-200 p-4 outline-none resize-none"
              />
            </div>

            {/* 🚀 Submit */}
            <button
              onClick={handleSubmitFeedback}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:opacity-90 transition"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="relative z-10 pt-16 text-center">
        <h1 className="text-6xl font-semibold">Text to Speech</h1>
        <p className="mt-4 text-lg text-gray-300">
          Your voice-powered automation hub plan, create and execute smarter
          with AI.
        </p>
      </div>

      {/* Main Section */}
      <div className="relative z-10 mt-12 px-32 pr-[380px]">
        {/* Input Box */}
        <div className="flex h-[470px] max-w-4xl overflow-hidden flex-col justify-between rounded-2xl bg-white/90 p-6 text-black">
          {/* ✅ Hidden File Input */}
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
            className="h-full w-full resize-none bg-transparent text-gray-700 outline-none"
            placeholder="Start typing here or paste any text you want to turn into life like speech..."
          />

          {/* Audio Player */}
          {showAudio && (
            <div className="mt-4 rounded-xl bg-white/40 backdrop-blur-md p-3 border border-white/30">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 text-white"
                >
                  {isPlaying ? '❚❚' : '▶️'}
                </button>

                <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span className="text-xs text-gray-700 w-10 text-right">
                  {Math.floor(progress)}%
                </span>
              </div>

              <button
                className="mt-3 w-full rounded-lg bg-purple-600 text-white py-1.5 text-sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = audioUrl;
                  link.download = 'speech.mp3';
                  link.click();
                }}
              >
                Download Audio
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-500">
              <div
                onClick={handleFileUploadClick}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer hover:bg-gray-200"
              >
                <Paperclip size={16} />
              </div>

              <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400">
                <Mic size={16} />
              </div>

              <span>Data source</span>
            </div>

            <button
              onClick={handleGenerate}
              className="rounded-full bg-gray-400 px-4 py-2 text-white"
            >
              {isLoading ? 'Processing...' : 'Generate Speech'}
            </button>
          </div>
        </div>

        {/* Right Tool Panel */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 w-[340px] h-[470px] rounded-2xl bg-white/90 p-5 text-black overflow-auto">
          <h2 className="mb-4 font-semibold">Tool (coming soon)</h2>

          <div className="space-y-4">
            <div>
              <p className="mb-1 text-sm">Voice</p>
              <div className="rounded-lg bg-gray-100 p-2">Model Voice</div>
            </div>

            <div>
              <p className="mb-1 text-sm">Language</p>
              <div className="rounded-lg bg-gray-100 p-2">English</div>
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

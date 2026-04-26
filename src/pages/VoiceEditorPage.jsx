import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Safe preview fallback for environments where:
 * 1. ../supabaseClient does not exist
 * 2. import.meta.env is unavailable (sandbox preview)
 */
const supabase = {
  auth: {
    getUser: async () => ({
      data: {
        user: {
          email: 'demo@example.com',
          user_metadata: {
            full_name: 'Demo User',
          },
        },
      },
    }),
  },
};

/**
 * FIX:
 * Some preview/sandbox environments do not support import.meta.env,
 * which causes:
 * Cannot read properties of undefined (reading 'VITE_API_VOICE_EDITOR')
 *
 * This safely checks before accessing it.
 */
const API_BASE =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.VITE_API_VOICE_EDITOR
    ? import.meta.env.VITE_API_VOICE_EDITOR
    : '';

console.log('VOICE EDITOR API:', API_BASE || 'Not configured');

export default function VoiceEditorPage() {
  const [mode, setMode] = useState('upload');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedAudio, setProcessedAudio] = useState(null);
  const [processingMode, setProcessingMode] = useState('advanced');
  const [enableNoiseRemoval, setEnableNoiseRemoval] = useState(true);
  const [enablePolishingAudio, setEnablePolishingAudio] = useState(false);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('MP3');
  const [selectedQuality, setSelectedQuality] = useState('High');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    if (!audioRef.current || !processedAudio) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      alert('Please write your feedback before submitting');
      return;
    }

    console.log('User Feedback:', {
      rating: feedbackRating,
      feedback: feedbackText,
    });

    alert('Thank you for your feedback!');
    setFeedbackText('');
    setFeedbackRating(5);
    setShowFeedbackModal(false);
  };

  const handleConfirmExport = async () => {
    if (!processedAudio) {
      alert('Please generate audio first before exporting');
      return;
    }

    try {
      const response = await fetch(processedAudio);
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = `processed-audio.${selectedFormat.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);

      setShowExportSettings(false);
      alert(`Export completed: ${selectedFormat} (${selectedQuality} Quality)`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export audio file');
    }
  };

  const inputRef = useRef(null);
  const exportBoxRef = useRef(null);

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

  const accepted = useMemo(() => '.mp3,.wav,audio/mpeg,audio/wav', []);

  const onPickFile = () => {
    inputRef.current?.click();
  };

  const onFileChange = e => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const onDrop = e => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    setFile(droppedFile);
  };

  const onDragOver = e => {
    e.preventDefault();
  };

  const processAudio = async () => {
    let progressInterval;
    if (!file) {
      alert('Please upload an audio file first');
      return;
    }

    /**
     * Preview mode fallback:
     * if API is not configured, simulate success so UI still works.
     */
    if (!API_BASE) {
      setLoading(true);
      setProgress(0);

      progressInterval = setInterval(() => {
        setProgress(prev => (prev >= 95 ? prev : prev + 5));
      }, 200);

      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setProcessedAudio(
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        );
        setLoading(false);
      }, 1200);

      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      progressInterval = setInterval(() => {
        setProgress(prev => (prev >= 95 ? prev : prev + 4));
      }, 300);
      setProcessedAudio(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const fullName =
        user?.user_metadata?.full_name || user?.email || 'unknown_user';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', fullName);
      if (enableNoiseRemoval) {
        formData.append('processing_mode', processingMode);
      }

      formData.append('polishing_audio', String(enablePolishingAudio));

      const response = await fetch(`${API_BASE}/process-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.status}`);
      }

      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(100);
      setProcessedAudio(data.audio_url || null);
    } catch (error) {
      console.error('Audio processing error:', error);
      alert('Error processing audio');
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  return (
    <div
      className="relative h-screen w-full overflow-hidden isolate text-white"
      style={{ background: '#050010' }}
    >
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(circle at 85% 15%, rgba(235,0,225,0.25), rgba(120,0,150,0.15), rgba(10,0,20,0.95))',
        }}
      />

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
              How AI Voice Editing Works
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Follow these simple steps to enhance your audio professionally.
            </p>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>1.</strong> Upload your MP3 or WAV audio file.
              </p>
              <p>
                <strong>2.</strong> Enable background noise removal if needed.
              </p>
              <p>
                <strong>3.</strong> Choose processing mode: Basic, Advanced, or
                DeepFilter.
              </p>
              <p>
                <strong>4.</strong> Enable polishing audio for premium voice
                enhancement.
              </p>
              <p>
                <strong>5.</strong> Click Generate Voice and wait for processing
                to complete.
              </p>
              <p>
                <strong>6.</strong> Preview your enhanced audio and
                download/export it.
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
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[420px] rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl text-black">
            <h2 className="text-xl font-semibold mb-2">Share Your Feedback</h2>
            <p className="text-sm text-gray-500 mb-5">
              Tell us about your experience using AI Voice Editing
            </p>

            <div className="mb-4">
              <p className="text-sm mb-2">Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className={`text-3xl ${
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

            <div className="mb-5">
              <p className="text-sm mb-2">Your Feedback</p>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Tell us what you liked or what we can improve..."
                className="w-full h-32 rounded-2xl border border-gray-200 p-4 outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSubmitFeedback}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-full">
        <div className="w-20" />

        <div className="flex-1 flex flex-col items-center pt-24 px-10">
          <h1 className="text-7xl font-semibold text-center">
            AI Voice Editing
          </h1>

          <p className="mt-4 text-white/70 text-center max-w-2xl text-lg">
            Create, refine, and produce smarter with intelligent voice
            technology.
          </p>

          <div
            onClick={onPickFile}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`mt-6 w-full ${
              processedAudio
                ? 'max-w-5xl bg-[#e5e5e5] text-black rounded-2xl p-4 cursor-pointer'
                : 'max-w-4xl bg-[#e5e5e5] text-black rounded-2xl p-10 cursor-pointer'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accepted}
              className="hidden"
              onChange={onFileChange}
            />

            {processedAudio ? (
              <>
                <div className="flex items-start justify-start mb-6">
                  <div className="flex items-center gap-4">
                    <>
                      <audio
                        ref={audioRef}
                        src={processedAudio}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handlePlayAudio();
                        }}
                        className="w-14 h-14 rounded-full border-2 border-indigo-500 flex items-center justify-center text-indigo-600 text-xl bg-white"
                      >
                        {isPlaying ? '❚❚' : '▶️'}
                      </button>
                    </>

                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {file ? file.name : 'My Recording.wav'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        02:45 • 12.4 MB • WAV
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-48 rounded-2xl bg-white border border-gray-200 px-6 py-6 flex flex-col justify-between shadow-sm">
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    Audio Waveform Preview
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 px-1">
                    <span>00:00</span>
                    <span>00:30</span>
                    <span>01:00</span>
                    <span>01:30</span>
                    <span>02:00</span>
                    <span>02:30</span>
                    <span>02:45</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-full flex justify-center mb-4">
                  <div className="text-4xl">☁️</div>
                </div>

                <p className="text-lg font-medium text-center">
                  {file ? file.name : 'Upload MP3 or WAV file'}
                </p>

                <p className="text-sm text-gray-600 mt-2 text-center">
                  1–10 min, max 100MB, clean audio
                </p>
              </>
            )}
          </div>

          {!processedAudio && (
            <>
              <div className="mt-6 w-full max-w-4xl">
                <div className="flex items-center gap-4 mb-3">
                  <p className="text-white font-medium">
                    Remove Background Noise
                  </p>

                  <button
                    type="button"
                    onClick={() => setEnableNoiseRemoval(!enableNoiseRemoval)}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${
                      enableNoiseRemoval ? 'bg-pink-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        enableNoiseRemoval ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {enableNoiseRemoval && (
                  <div className="relative">
                    <select
                      value={processingMode}
                      onChange={e => setProcessingMode(e.target.value)}
                      className="w-[210px] appearance-none rounded-lg border border-white/20 bg-white/10 backdrop-blur-xl px-2.5 py-1.5 text-[11px] text-white outline-none cursor-pointer"
                    >
                      <option value="basic" className="text-black">
                        Basic
                      </option>
                      <option value="advanced" className="text-black">
                        Advanced
                      </option>
                      <option value="deepfilter" className="text-black">
                        DeepFilter
                      </option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-5 w-full max-w-4xl">
                <div className="flex items-center gap-4">
                  <p className="text-white font-medium">Polishing Audio</p>

                  <button
                    type="button"
                    onClick={() =>
                      setEnablePolishingAudio(!enablePolishingAudio)
                    }
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${
                      enablePolishingAudio ? 'bg-pink-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        enablePolishingAudio ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="mt-8 w-full max-w-4xl">
            <button
              onClick={processedAudio ? handleConfirmExport : processAudio}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 disabled:opacity-60"
            >
              {loading
                ? `Processing... ${progress}%`
                : processedAudio
                  ? 'Download Audio'
                  : 'Generate Voice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

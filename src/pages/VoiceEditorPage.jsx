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

const WS_EDITOR =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.VITE_WS_EDITOR
    ? import.meta.env.VITE_WS_EDITOR
    : '';

console.log('VOICE EDITOR API:', API_BASE || 'Not configured');

export default function VoiceEditorPage() {
  const [mode, setMode] = useState('upload');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
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
  const [fileName, setFileName] = useState('');

  const [audioDuration, setAudioDuration] = useState('0:00');

  const [durationSec, setDurationSec] = useState(0);

  const [currentTime, setCurrentTime] = useState(0);
  const generatedAudioRef = useRef(null);

  const [duration, setDuration] = useState(0);

  const generatedAudioReady = !!processedAudio;

  const audioUrl = processedAudio || '';

  const uploadAudioRef = useRef(null);

  const [waveHeights] = useState(() =>
    Array.from({ length: 60 }, () => Math.random() * 20 + 6)
  );

  const formatTime = secs => {
    if (!secs || isNaN(secs)) return '0:00';

    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60)
      .toString()
      .padStart(2, '0');

    return `${min}:${sec}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        setRecordedBlob(blob);

        const url = URL.createObjectURL(blob);

        setAudioPreviewUrl(url);
        setFileName('recording.webm');

        const audio = new Audio(url);

        audio.onloadedmetadata = () => {
          const dur = audio.duration;

          setDurationSec(dur);

          const min = Math.floor(dur / 60);

          const sec = Math.floor(dur % 60)
            .toString()
            .padStart(2, '0');

          setAudioDuration(`${min}:${sec}`);
        };
      };

      mediaRecorderRef.current = recorder;

      recorder.start();

      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

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

  const toggleGeneratedPlay = () => {
    if (!generatedAudioRef.current) return;

    if (generatedAudioRef.current.paused) {
      generatedAudioRef.current.play();
      setIsPlaying(true);
    } else {
      generatedAudioRef.current.pause();
      setIsPlaying(false);
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

    setFileName(selectedFile.name);

    const url = URL.createObjectURL(selectedFile);

    setAudioPreviewUrl(url);

    const audio = new Audio(url);

    audio.onloadedmetadata = () => {
      const dur = audio.duration;

      setDurationSec(dur);

      const min = Math.floor(dur / 60);

      const sec = Math.floor(dur % 60)
        .toString()
        .padStart(2, '0');

      setAudioDuration(`${min}:${sec}`);
    };
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
    if (mode === 'upload' && !file) {
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

      if (mode === 'record' && !recordedBlob) {
        alert('Please record audio first');
        return;
      }

      const formData = new FormData();
      if (mode === 'upload') {
        formData.append('file', file);
      } else {
        formData.append(
          'file',
          new File([recordedBlob], 'recording.webm', {
            type: 'audio/webm',
          })
        );
      }
      formData.append('user_id', fullName);
      if (enableNoiseRemoval) {
        formData.append('mode', processingMode);
      }

formData.append('youtube_polish', String(enablePolishingAudio));

      const response = await fetch(
        `${API_BASE}/api/upload-audio/full-enhance`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.status}`);
      }

      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(100);
      setProcessedAudio(data.supabase_url || `${API_BASE}${data.download_url}`);
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
      className="relative min-h-screen w-full overflow-x-hidden isolate text-white pb-10"
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

      <div className="absolute z-20 flex items-center gap-2 top-4 right-4 md:top-6 md:right-8 md:gap-4">
        <button
          onClick={() => setShowHelpModal(true)}
          className="
    px-3 py-1.5 md:px-5 md:py-2
    rounded-lg md:rounded-xl
    bg-white/10 text-white
    border border-white/20
    backdrop-blur-md
    hover:bg-white/20
    transition-all duration-300
    text-[11px] md:text-sm
    font-medium
  "
        >
          Help
        </button>

        <button
          onClick={() => setShowFeedbackModal(true)}
          className="
    px-3 py-1.5 md:px-5 md:py-2
    rounded-lg md:rounded-xl
    bg-white/10 text-white
    border border-white/20
    backdrop-blur-md
    hover:bg-white/20
    transition-all duration-300
    text-[11px] md:text-sm
    font-medium
  "
        >
          Feedback
        </button>

        <button
          onClick={() => setShowExportSettings(!showExportSettings)}
          className="
    px-3 py-1.5 md:px-5 md:py-2
    rounded-lg md:rounded-xl
    bg-white text-black
    border border-white/70
    shadow-sm
    hover:shadow-md
    hover:scale-[1.02]
    transition-all duration-300
    text-[11px] md:text-sm
    font-medium
    flex items-center gap-1.5 md:gap-2.5
  "
        >
          <span className="text-xs md:text-base">↓</span>
          <span>Export</span>
        </button>
      </div>

      {showExportSettings && (
        <div
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex flex-wrap justify-end gap-2 sm:gap-4 max-w-[220px] sm:max-w-none"
          ref={exportBoxRef}
        >
          <div className="w-[92vw] max-w-[300px] rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl p-6 text-white">
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
            className="w-[92vw] max-w-[520px] max-h-[85vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-7 shadow-2xl text-black"
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
          <div className="w-[92vw] max-w-[420px] rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl text-black">
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
        <div className="hidden lg:block w-20" />

        <div className="flex-1 flex flex-col items-center pt-28 sm:pt-24 px-4 sm:px-6 md:px-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center leading-tight">
            AI Voice Editing
          </h1>

          <p className="mt-4 text-white/70 text-center max-w-2xl text-lg">
            Create, refine, and produce smarter with intelligent voice
            technology.
          </p>

          {/* TOGGLE */}

          <div
            className="
  mt-10
  w-full
  max-w-4xl
  flex
  flex-col
  sm:flex-row
  sm:items-center
  gap-4
  sm:gap-6
"
          >
            <button
              onClick={() => setMode('upload')}
              className="flex items-center gap-2 text-sm text-white"
            >
              <span
                className={`w-3 h-3 rounded-full ${
                  mode === 'upload' ? 'bg-pink-400' : 'border border-white/40'
                }`}
              ></span>
              Upload to Clone
            </button>

            <button
              onClick={() => setMode('record')}
              className="flex items-center gap-2 text-sm text-white"
            >
              <span
                className={`w-3 h-3 rounded-full ${
                  mode === 'record' ? 'bg-pink-400' : 'border border-white/40'
                }`}
              ></span>
              Record to Clone
            </button>
          </div>

          {/* UPLOAD BOX */}

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => mode === 'upload' && inputRef.current?.click()}
            className={`
              mt-10
              w-full
              max-w-4xl
              rounded-2xl
              overflow-hidden
              ${mode === 'upload' ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <input
              type="file"
              accept={accepted}
              ref={inputRef}
              onChange={onFileChange}
              className="hidden"
            />

            {/* TOP */}

            <div
              className="
  bg-[#e5e5e5]
  text-black
  px-5
  sm:px-8
  md:px-10
  py-8
  sm:py-10
  flex
  flex-col
  items-center
  justify-center
"
            >
              <div className="text-4xl mb-4">
                {mode === 'upload' ? '☁️' : '🎤'}
              </div>

              <div className="text-lg font-medium text-center">
                {mode === 'upload' ? (
                  <>
                    <p>
                      {fileName ? fileName : 'Upload Mp3 or WAV audio file.'}
                    </p>

                    {!fileName && (
                      <p className="text-sm text-gray-600 mt-2">
                        must be 1 min - 10 mins, max 100 MB, one voice only,
                        clear audio minimal noise.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-semibold">
                      Record your voice to clone (coming soon)
                    </p>

                    <p className="text-sm text-gray-700 mt-2">
                      1–5 min recording works best. Keep it clear & natural 🎤
                    </p>
                    <div className="mt-5 flex gap-4">
                      {!isRecording ? (
                        <button
                          onClick={startRecording}
                          className="
        px-5
        py-3
        rounded-xl
        bg-gradient-to-r
        from-pink-500
        to-purple-500
        text-white
      "
                        >
                          Start Recording
                        </button>
                      ) : (
                        <button
                          onClick={stopRecording}
                          className="
        px-5
        py-3
        rounded-xl
        bg-red-500
        text-white
      "
                        >
                          Stop Recording
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* PLAYER SWITCH */}

            {!generatedAudioReady ? (
              // =========================================
              // UPLOAD PLAYER
              // =========================================

              <div
                className="
  bg-white
  px-3
  sm:px-5
  py-4
  flex
  items-center
  gap-3
  sm:gap-4
  border-t
  border-gray-200
  rounded-b-2xl
"
              >
                {/* PLAY */}

                <button
                  onClick={e => {
                    e.stopPropagation();

                    if (!uploadAudioRef.current) return;

                    if (uploadAudioRef.current.paused) {
                      uploadAudioRef.current.play();

                      setIsPlaying(true);
                    } else {
                      uploadAudioRef.current.pause();

                      setIsPlaying(false);
                    }
                  }}
                  disabled={!audioPreviewUrl}
                  className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 ${
                    file
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md hover:scale-105'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isPlaying ? '❚❚' : '▶️'}
                </button>

                {/* WAVE */}

                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileName || 'No audio selected'}
                  </p>

                  <div className="flex items-center gap-[2px] mt-1 h-9 overflow-hidden">
                    {waveHeights.map((h, i) => {
                      const progress = durationSec
                        ? Math.min(currentTime / durationSec, 1)
                        : 0;

                      const active = i / 60 < progress;

                      return (
                        <div
                          key={i}
                          onClick={e => {
                            e.stopPropagation();

                            if (!uploadAudioRef.current) return;

                            const newTime = (i / 60) * durationSec;

                            uploadAudioRef.current.currentTime = newTime;

                            setCurrentTime(newTime);
                          }}
                          className={`w-[2px] rounded-full cursor-pointer transition-all duration-150 ${
                            active ? 'bg-pink-500' : 'bg-gray-300'
                          }`}
                          style={{
                            width: '2px',
                            height: `${h}px`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* DURATION */}

                <span className="text-xs text-gray-500 min-w-[50px] text-right">
                  {audioDuration || '0:00'}
                </span>

                {/* AUDIO */}

                <audio
                  ref={uploadAudioRef}
                  src={audioPreviewUrl || undefined}
                  preload="metadata"
                  onLoadedMetadata={e => {
                    let dur = e.target.duration;

                    // FIX FOR WEBM RECORDINGS
                    if (!isFinite(dur)) {
                      e.target.currentTime = 1e101;

                      e.target.ontimeupdate = () => {
                        e.target.ontimeupdate = null;

                        e.target.currentTime = 0;

                        dur = e.target.duration;

                        if (isFinite(dur) && !isNaN(dur)) {
                          setDurationSec(dur);

                          const min = Math.floor(dur / 60);

                          const sec = Math.floor(dur % 60)
                            .toString()
                            .padStart(2, '0');

                          setAudioDuration(`${min}:${sec}`);
                        }
                      };
                    } else {
                      setDurationSec(dur);

                      const min = Math.floor(dur / 60);

                      const sec = Math.floor(dur % 60)
                        .toString()
                        .padStart(2, '0');

                      setAudioDuration(`${min}:${sec}`);
                    }
                  }}
                  onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                />
              </div>
            ) : (
              // =========================================
              // GENERATED PLAYER
              // =========================================

              <div className="bg-white px-5 py-4 flex items-center gap-4 border-t border-gray-200">
                {/* PLAY */}

                <button
                  onClick={e => {
                    e.stopPropagation();

                    toggleGeneratedPlay();
                  }}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md hover:scale-105 transition-all duration-200"
                >
                  {isPlaying ? '❚❚' : '▶️'}
                </button>

                {/* GENERATED WAVE */}

                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Generated Audio Preview
                  </p>

                  <div className="flex items-center gap-[2px] mt-1 h-9 overflow-hidden">
                    {waveHeights.map((h, i) => {
                      const progress = duration
                        ? Math.min(currentTime / duration, 1)
                        : 0;

                      const active = i / 60 < progress;

                      return (
                        <div
                          key={i}
                          className={`w-[2px] rounded-full transition-all duration-150 ${
                            active ? 'bg-pink-500' : 'bg-gray-300'
                          }`}
                          style={{
                            width: '2px',
                            height: `${h}px`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* TIME */}

                <span className="text-xs text-gray-500 min-w-[50px] text-right">
                  {formatTime(duration)}
                </span>

                {/* DOWNLOAD */}

                <a
                  href={audioUrl}
                  download="generated.wav"
                  className="text-xs px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Download
                </a>

                {/* AUDIO */}

                <audio
                  ref={generatedAudioRef}
                  src={audioUrl || undefined}
                  onLoadedMetadata={e => setDuration(e.target.duration)}
                  onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>

          {!processedAudio && (
            <>
              <div className="mt-6 w-full max-w-4xl">
                <div className="flex flex-wrap items-center gap-4 mb-3">
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
              className="w-full py-3 sm:py-4 rounded-xl text-sm sm:text-base bg-gradient-to-r from-pink-500 to-purple-500 disabled:opacity-60"
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

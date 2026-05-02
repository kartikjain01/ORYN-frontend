import React, { useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = 'http://127.0.0.1:5000';

export default function VoiceCloningPage() {
  const [mode, setMode] = useState('upload');

  // upload options
  const [removeNoise, setRemoveNoise] = useState(true);

  // upload file
  const [file, setFile] = useState(null);

  // voice cloning
  const [voiceId, setVoiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cloneCompleted, setCloneCompleted] = useState(false);

  // generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioReady, setGeneratedAudioReady] = useState(false);

  // generated output
  const [audioUrl, setAudioUrl] = useState(null);

  // text
  const [previewText, setPreviewText] = useState('');

  // UI
  const [statusMsg, setStatusMsg] = useState('');

  // player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // export settings
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('MP3');
  const [selectedQuality, setSelectedQuality] = useState('High');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // refs
  const inputRef = useRef(null);
  const uploadAudioRef = useRef(null);
  const generatedAudioRef = useRef(null);
  const exportBoxRef = useRef(null);

  const accepted = useMemo(() => '.mp3,.wav,audio/mpeg,audio/wav', []);

  // text modal
  const [fileName, setFileName] = useState('');
  const [showTextBox, setShowTextBox] = useState(false);
  const [textValue, setTextValue] = useState('');

  // upload duration
  const [audioDuration, setAudioDuration] = useState('0:00');
  const [durationSec, setDurationSec] = useState(0);

  // waveform
  const [waveHeights] = useState(() =>
    Array.from({ length: 60 }, () => Math.random() * 20 + 6)
  );

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
  // =========================================
  // GET FILE DURATION
  // =========================================

  useEffect(() => {
    if (!file) {
      setAudioDuration('0:00');
      return;
    }

    const audio = new Audio(URL.createObjectURL(file));

    audio.addEventListener('loadedmetadata', () => {
      const dur = audio.duration;

      setDurationSec(dur);

      const min = Math.floor(dur / 60);
      const sec = Math.floor(dur % 60)
        .toString()
        .padStart(2, '0');

      setAudioDuration(`${min}:${sec}`);
    });

    return () => {
      audio.remove();
    };
  }, [file]);

  // =========================================
  // FILE CHANGE
  // =========================================

  const resetAllStates = () => {
    setVoiceId(null);
    setCloneCompleted(false);

    setGeneratedAudioReady(false);
    setAudioUrl(null);

    setIsGenerating(false);

    setStatusMsg('');

    setCurrentTime(0);
    setDuration(0);

    setIsPlaying(false);
  };

  const onFileChange = e => {
    const f = e.target.files?.[0];

    if (!f) return;

    setFile(f);
    setFileName(f.name);

    resetAllStates();
  };

  const onDrop = e => {
    e.preventDefault();

    const f = e.dataTransfer.files?.[0];

    if (!f) return;

    setFile(f);
    setFileName(f.name);

    resetAllStates();
  };

  const onDragOver = e => e.preventDefault();

  // =========================================
  // TIME FORMAT
  // =========================================

  const formatTime = t => {
    if (!t) return '0:00';

    const m = Math.floor(t / 60);

    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, '0');

    return `${m}:${s}`;
  };

  // =========================================
  // GENERATED PLAYER PLAY
  // =========================================

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

  // =========================================
  // CLONE VOICE
  // =========================================

  const uploadVoice = async () => {
    if (!file) {
      alert('Please upload an audio file first');
      return;
    }

    try {
      setLoading(true);

      setStatusMsg('Uploading voice...');

      const formData = new FormData();

      formData.append('file', file);

      const response = await fetch(`${API_BASE}/v1/voices`, {
        method: 'POST',
        body: formData,
      });
      // ✅ fetch failed
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.voice_id) {
        throw new Error('voice_id missing from backend');
      }

      const id = data.voice_id;

      setVoiceId(id);

      setStatusMsg('Building voice profile...');
      const buildResponse = await fetch(`${API_BASE}/v1/voices/${id}/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remove_noise: removeNoise,
        }),
      });
      if (!buildResponse.ok) {
        throw new Error(`Build Failed: ${buildResponse.status}`);
      }

      // ✅ CLONE COMPLETE

      setCloneCompleted(true);

      setStatusMsg('Voice cloned successfully!');
    } catch (err) {
      console.error('UPLOAD ERROR:', err);
      setStatusMsg(err.message || 'Failed to connect to backend');
      setStatusMsg('Error cloning voice');
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // GENERATE PREVIEW
  // =========================================

  const generatePreview = async () => {
    if (!voiceId) {
      alert('Please clone voice first');
      return;
    }

    if (!previewText) {
      alert('Enter preview text');
      return;
    }

    try {
      setIsGenerating(true);

      setStatusMsg('Generating preview...');

      const response = await fetch(`${API_BASE}/v1/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voice_id: voiceId,
          text: previewText,
          language: 'en',
          output_format: 'wav',
          user_id: 'kartik_jain',
        }),
      });
      if (!response.ok) {
        throw new Error(`TTS Error: ${response.status}`);
      }
      const data = await response.json();

      if (!data.job_id) {
        throw new Error('No job_id returned');
      }

      checkJobStatus(data.job_id);
    } catch (err) {
      console.error('TTS ERROR:', err);

      setStatusMsg(err.message || 'TTS generation failed');

      setIsGenerating(false);
    }
  };

  // =========================================
  // CHECK STATUS
  // =========================================

  const checkJobStatus = async jobId => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/tts/${jobId}`);

        const data = await res.json();

        if (data.status === 'done') {
          clearInterval(interval);

          if (!data.audio_url) {
            setStatusMsg('No audio URL returned');

            setIsGenerating(false);

            return;
          }

          // ✅ GENERATED AUDIO READY

          setAudioUrl(data.audio_url);

          setGeneratedAudioReady(true);

          setIsGenerating(false);

          setStatusMsg('Preview ready!');
        }

        if (data.status === 'failed') {
          clearInterval(interval);

          setStatusMsg('Generation failed');

          setIsGenerating(false);
        }
      } catch (err) {
        console.error(err);

        clearInterval(interval);

        setStatusMsg('Error checking status');

        setIsGenerating(false);
      }
    }, 2000);
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
  // ✅ download handler
  const handleConfirmExport = () => {
    if (!audioUrl) {
      alert('No generated audio available');
      return;
    }

    const link = document.createElement('a');

    link.href = audioUrl;

    link.download = `generated-audio.${selectedFormat.toLowerCase()}`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setShowExportSettings(false);
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden isolate text-white"
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
              How AI Voice Cloning Works
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Follow these simple steps to create realistic AI-generated speech
              from your voice.
            </p>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>1.</strong> Upload or record a clear voice sample to
                create your custom AI voice.
              </p>
              <p>
                <strong>2.</strong> Our AI analyzes tone, pitch, accent, and
                speaking style to build the voice model.
              </p>
              <p>
                <strong>3.</strong> Enter the text you want the cloned voice to
                speak.
              </p>
              <p>
                <strong>4.</strong> Customize speech settings like emotion,
                pacing, pauses, and delivery style.
              </p>
              <p>
                <strong>5.</strong> Click Generate Preview to synthesize
                realistic AI speech instantly.
              </p>
              <p>
                <strong>6.</strong> Preview the generated voice, refine if
                needed, and download/export the final audio.
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

      {/* AVATAR */}

      {/* CONTENT */}

      <div className="relative z-10 flex min-h-screen">
        <div className="w-20"></div>

        <div className="flex-1 flex flex-col items-center pt-24 px-10 pb-32">
          {/* HEADING */}

          <h1 className="text-7xl font-semibold text-center">Voice Cloning</h1>

          <p className="mt-4 text-white/70 text-center max-w-2xl text-lg">
            Try AI voice cloning online. Instantly clone any voice from a short
            sample and turn text into custom speech.
          </p>

          {/* TOGGLE */}

          <div className="mt-10 w-full max-w-4xl flex items-center gap-6">
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
            className={`mt-10 w-full max-w-4xl rounded-2xl overflow-hidden ${
              mode === 'upload' ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <input
              type="file"
              accept={accepted}
              ref={inputRef}
              onChange={onFileChange}
              className="hidden"
            />

            {/* TOP */}

            <div className="bg-[#e5e5e5] text-black px-10 py-10 flex flex-col items-center justify-center">
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
                  </>
                )}
              </div>
            </div>

            {/* PLAYER SWITCH */}

            {!generatedAudioReady ? (
              // =========================================
              // UPLOAD PLAYER
              // =========================================

              <div className="bg-white px-5 py-4 flex items-center gap-4 border-t border-gray-200">
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
                  disabled={!file}
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
                  src={file ? URL.createObjectURL(file) : ''}
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
                  src={audioUrl || ''}
                  onLoadedMetadata={e => setDuration(e.target.duration)}
                  onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}

            {/* STATUS */}

            {statusMsg && (
              <div className="bg-black/40 text-white text-sm px-5 py-3 border-t border-white/10">
                {statusMsg}
              </div>
            )}
          </div>

          {/* TEXT BUTTON */}

          <div className="mt-8 w-full max-w-4xl">
            <button
              onClick={() => {
                if (!cloneCompleted) return;

                setShowTextBox(true);
              }}
              disabled={!cloneCompleted}
              className={`w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl transition ${
                cloneCompleted
                  ? 'bg-[#e5e5e5] text-black'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <span>📄</span>

              <span className="text-sm font-medium">
                {textValue ? textValue.split('\n')[0] : 'Enter your text'}
              </span>
            </button>
          </div>

          {/* MODAL */}

          {showTextBox && (
            <div
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-30"
              onClick={() => setShowTextBox(false)}
            >
              <div
                className="w-full max-w-4xl bg-white rounded-2xl p-6 shadow-2xl text-black"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Enter the text to clone
                  </h2>

                  <button
                    onClick={() => setTextValue('')}
                    className="text-sm text-gray-500 hover:text-black"
                  >
                    Clear
                  </button>
                </div>

                <div className="w-full h-px bg-gray-200 mb-4"></div>

                <textarea
                  value={textValue}
                  onChange={e => setTextValue(e.target.value)}
                  placeholder="Enter the text you want the cloned voice to say..."
                  className="w-full h-64 bg-transparent outline-none resize-none text-black placeholder-gray-400"
                />

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setPreviewText(textValue);

                      setShowTextBox(false);
                    }}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIONS */}

          <div className="mt-8 w-full max-w-4xl flex gap-4">
            <button
              onClick={uploadVoice}
              disabled={loading || !file}
              className={`flex-1 py-3 text-base rounded-xl transition ${
                file
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {loading ? 'Processing...' : 'Clone Voice'}
            </button>

            <button
              onClick={generatePreview}
              disabled={!cloneCompleted || isGenerating}
              className={`flex-1 py-3 text-base rounded-xl transition ${
                cloneCompleted && !isGenerating
                  ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Preview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

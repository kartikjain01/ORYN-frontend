import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Download, HelpCircle, MessageSquare, Upload, Mic, Settings2, AudioWaveform, Volume2, FolderOpen, MoreVertical, RotateCcw, Share, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { createProject } from '../lib/db';

const API_BASE = import.meta.env.VITE_API_VOICE_EDITOR || '';
const WS_EDITOR = import.meta.env.VITE_WS_EDITOR || '';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSourcePlaying, setIsSourcePlaying] = useState(false);
  const [fileName, setFileName] = useState('');
  const [audioDuration, setAudioDuration] = useState('0:00');
  const [durationSec, setDurationSec] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [genCurrentTime, setGenCurrentTime] = useState(0);
  const [genDuration, setGenDuration] = useState(0);
  const [sessionFiles, setSessionFiles] = useState([]);

  const inputRef = useRef(null);
  const uploadAudioRef = useRef(null);
  const generatedAudioRef = useRef(null);
  const exportBoxRef = useRef(null);

  const accepted = useMemo(() => '.mp3,.wav,audio/mpeg,audio/wav', []);
  const [waveHeights] = useState(() => Array.from({ length: 120 }, () => Math.random() * 20 + 6));

  const generatedAudioReady = !!processedAudio;

  useEffect(() => {
    const handleOutsideClick = event => {
      if (showExportSettings && exportBoxRef.current && !exportBoxRef.current.contains(event.target)) {
        setShowExportSettings(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showExportSettings]);

  const formatTime = secs => {
    if (!secs || isNaN(secs)) return '0:00';
    return `${Math.floor(secs / 60)}:${Math.floor(secs % 60).toString().padStart(2, '0')}`;
  };

  const timeAgo = ts => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);
        setFileName('recording.webm');
        setFile(new File([blob], 'recording.webm', { type: 'audio/webm' }));
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const onFileChange = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    const url = URL.createObjectURL(f);
    setAudioPreviewUrl(url);
    setProcessedAudio(null);
  };

  const onDrop = e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (!f) return; setFile(f); setFileName(f.name); setAudioPreviewUrl(URL.createObjectURL(f)); setProcessedAudio(null); };
  const onDragOver = e => e.preventDefault();

  const toggleSourcePlay = () => {
    if (!uploadAudioRef.current) return;
    if (uploadAudioRef.current.paused) { uploadAudioRef.current.play(); setIsSourcePlaying(true); }
    else { uploadAudioRef.current.pause(); setIsSourcePlaying(false); }
  };

  const toggleGeneratedPlay = () => {
    if (!generatedAudioRef.current) return;
    if (generatedAudioRef.current.paused) { generatedAudioRef.current.play(); setIsPlaying(true); }
    else { generatedAudioRef.current.pause(); setIsPlaying(false); }
  };

  const handleConfirmExport = async () => {
    if (!processedAudio) { alert('Please generate audio first'); return; }
    try {
      const response = await fetch(processedAudio);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `editor_output.${selectedFormat.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setShowExportSettings(false);
    } catch (err) { console.error(err); alert('Export failed'); }
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) { alert('Please write feedback'); return; }
    console.log({ rating: feedbackRating, feedback: feedbackText });
    alert('Thanks for your feedback!');
    setFeedbackText(''); setFeedbackRating(5); setShowFeedbackModal(false);
  };

  const processAudio = async () => {
    if (mode === 'upload' && !file) { alert('Please upload an audio file first'); return; }
    if (mode === 'record' && !recordedBlob) { alert('Please record audio first'); return; }

    let progressInterval;
    try {
      setLoading(true); setProgress(0);
      progressInterval = setInterval(() => { setProgress(prev => prev >= 95 ? prev : prev + 4); }, 300);
      setProcessedAudio(null);

      const { data: { user } } = await supabase.auth.getUser();
      const fullName = user?.user_metadata?.full_name || user?.email || 'unknown_user';

      const formData = new FormData();
      if (mode === 'upload') { formData.append('file', file); }
      else { formData.append('file', new File([recordedBlob], 'recording.webm', { type: 'audio/webm' })); }
      formData.append('user_id', fullName);
      if (enableNoiseRemoval) { formData.append('mode', processingMode); }
      formData.append('youtube_polish', String(enablePolishingAudio));

      const response = await fetch(`${API_BASE}/api/upload-audio/full-enhance`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Processing failed: ${response.status}`);
      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(100);
      const url = data.supabase_url || `${API_BASE}${data.download_url}`;
      setProcessedAudio(url);
      setSessionFiles(prev => [{ url, format: selectedFormat, quality: selectedQuality, name: fileName, timestamp: Date.now() }, ...prev]);
      createProject({ title: fileName || 'Voice Editor Output', type: 'voice_editor', outputUrl: url, metadata: { mode: processingMode, noiseRemoval: enableNoiseRemoval, polish: enablePolishingAudio } }).catch(console.error);
    } catch (error) {
      console.error(error); alert('Error processing audio');
    } finally { clearInterval(progressInterval); setLoading(false); }
  };

  const currentStep = !file && !recordedBlob ? 1 : !processedAudio ? (loading ? 3 : 2) : 4;

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="relative min-h-full p-6 lg:p-8 space-y-5 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)' }}>
        {/* Decorative floating orbs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-300/20 blur-[80px] animate-breathe" />
        <div className="pointer-events-none absolute top-[60%] -left-32 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-200/25 to-indigo-200/15 blur-[70px] animate-breathe" style={{ animationDelay: '1.2s' }} />
        <div className="pointer-events-none absolute bottom-0 right-[20%] w-[250px] h-[250px] rounded-full bg-gradient-to-t from-blue-100/20 to-indigo-100/10 blur-[60px] animate-breathe" style={{ animationDelay: '2.5s' }} />

        {/* Page heading */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">Voice Editor</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHelpModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-blue-600 bg-white/80 backdrop-blur-sm border border-white/90 shadow-[0_2px_8px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              <HelpCircle size={14} />
              Help
            </button>
            <button onClick={() => setShowFeedbackModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-blue-600 bg-white/80 backdrop-blur-sm border border-white/90 shadow-[0_2px_8px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              <MessageSquare size={14} />
              Feedback
            </button>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.6)_inset] px-6 py-4 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 0.5px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="flex items-center justify-between flex-1">
            {[
              { n: 1, label: 'Upload audio' },
              { n: 2, label: 'Configure' },
              { n: 3, label: 'Process' },
              { n: 4, label: 'Download' },
            ].map((step, idx) => {
              const isCurrent = currentStep === step.n;
              const isDone = currentStep > step.n;
              return (
                <div key={step.n} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : isCurrent
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)]'
                        : 'bg-slate-100/80 text-slate-400'
                    }`}>
                      {isDone ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step.n}
                    </div>
                    <span className={`text-[13px] font-medium whitespace-nowrap transition-colors ${
                      isDone ? 'text-emerald-700' : isCurrent ? 'text-slate-900' : 'text-slate-400'
                    }`}>{step.label}</span>
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-[2px] rounded-full mx-3 transition-colors duration-500 ${
                      isDone ? 'bg-emerald-300' : 'bg-slate-200/60'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Left: Audio Source */}
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 ${!generatedAudioReady ? 'h-[380px]' : ''}`}>
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className="px-5 pt-5 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                    <AudioWaveform size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Audio Source</h2>
                    {file && <p className="text-[11px] text-blue-500 font-medium">{fileName} · {audioDuration}</p>}
                  </div>
                </div>
                {generatedAudioReady && (
                  <button onClick={() => { setFile(null); setFileName(''); setAudioPreviewUrl(''); setProcessedAudio(null); setProgress(0); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold text-blue-600 bg-white/80 backdrop-blur-sm border border-white/90 shadow-[0_2px_8px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                    <RotateCcw size={12} />
                    New Edit
                  </button>
                )}
              </div>

              {!generatedAudioReady && (
                <div className="flex gap-1 bg-slate-100/60 backdrop-blur-sm rounded-xl p-1 mb-4">
                  <button onClick={() => setMode('upload')} className={`flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 ${mode === 'upload' ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Upload size={13} /> Upload Audio
                  </button>
                  <button onClick={() => setMode('record')} className={`flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 ${mode === 'record' ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Mic size={13} /> Record
                  </button>
                </div>
              )}
            </div>

            {!generatedAudioReady && (
              <div className="px-5 pb-5">
                {mode === 'upload' ? (
                  <div onDrop={onDrop} onDragOver={onDragOver} onClick={() => inputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${file ? 'border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-4' : 'border-slate-200/80 hover:border-blue-300/80 hover:bg-gradient-to-br hover:from-blue-50/40 hover:to-violet-50/20 p-6'}`}
                  >
                    <input type="file" accept={accepted} ref={inputRef} onChange={onFileChange} className="hidden" />
                    {fileName ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
                          <AudioWaveform size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-900">{fileName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{audioDuration} · Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
                          <Upload size={20} className="text-blue-500" />
                        </div>
                        <p className="text-[13px] font-semibold text-slate-700">Drop audio here or <span className="text-blue-600">browse</span></p>
                        <p className="text-[11px] text-slate-400 mt-1">MP3 or WAV, 1-10 min, max 100 MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-200 ${isRecording ? 'bg-red-100 animate-pulse shadow-[0_0_24px_rgba(239,68,68,0.2)]' : 'bg-slate-100/80'}`}>
                      <Mic size={20} className={isRecording ? 'text-red-500' : 'text-slate-400'} />
                    </div>
                    <p className="text-[13px] font-semibold text-slate-700 mb-1">{isRecording ? 'Recording...' : 'Record your voice'}</p>
                    <p className="text-[11px] text-slate-400 mb-4">Speak clearly for 1-5 minutes</p>
                    {!isRecording ? (
                      <button onClick={startRecording} className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[12px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200">Start Recording</button>
                    ) : (
                      <button onClick={stopRecording} className="px-5 py-2 rounded-xl bg-red-500 text-white text-[12px] font-semibold shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:bg-red-600 transition-all duration-200">Stop Recording</button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Source Audio Player - only show for the active mode's audio */}
            {((mode === 'upload' && file) || (mode === 'record' && recordedBlob)) && audioPreviewUrl && (
              <div className="mx-5 mb-4 bg-gradient-to-r from-slate-50/80 to-blue-50/40 backdrop-blur-sm rounded-xl px-3 py-2.5 flex items-center gap-2.5 border border-slate-100/60">
                <button onClick={toggleSourcePlay} className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)] hover:scale-105 transition-all duration-200 shrink-0">
                  {isSourcePlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[2px] h-6 overflow-hidden">
                    {waveHeights.map((h, i) => {
                      const prog = durationSec ? Math.min(currentTime / durationSec, 1) : 0;
                      const active = i / waveHeights.length < prog;
                      const hue = 210 + (i / waveHeights.length) * 50;
                      return (
                        <div key={i} onClick={e => { e.stopPropagation(); if (!uploadAudioRef.current) return; uploadAudioRef.current.currentTime = (i / waveHeights.length) * durationSec; setCurrentTime((i / waveHeights.length) * durationSec); }}
                          className={`rounded-full cursor-pointer transition-all duration-150 ${active ? '' : 'bg-slate-300/60'}`}
                          style={{ width: '2px', height: `${h * 0.85}px`, ...(active ? { background: `hsl(${hue}, 65%, 52%)`, boxShadow: `0 0 4px hsla(${hue}, 65%, 52%, 0.3)` } : {}) }}
                        />
                      );
                    })}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tabular-nums shrink-0">{formatTime(currentTime)}/{audioDuration}</span>
                <audio ref={uploadAudioRef} src={audioPreviewUrl || undefined} preload="metadata"
                  onLoadedMetadata={e => { let dur = e.target.duration; if (!isFinite(dur)) { e.target.currentTime = 1e101; e.target.ontimeupdate = () => { e.target.ontimeupdate = null; e.target.currentTime = 0; dur = e.target.duration; if (isFinite(dur) && !isNaN(dur)) { setDurationSec(dur); setAudioDuration(`${Math.floor(dur / 60)}:${Math.floor(dur % 60).toString().padStart(2, '0')}`); } }; } else { setDurationSec(dur); setAudioDuration(`${Math.floor(dur / 60)}:${Math.floor(dur % 60).toString().padStart(2, '0')}`); } }}
                  onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
                  onPause={() => setIsSourcePlaying(false)} onPlay={() => setIsSourcePlaying(true)}
                />
              </div>
            )}
          </div>

          {/* Top Right: Processing Settings */}
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 ${!generatedAudioReady ? 'h-[380px]' : ''}`}>
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                <Settings2 size={14} className="text-blue-600" />
              </div>
              <h2 className="text-[15px] font-bold text-slate-900">Processing Settings</h2>
            </div>

            <div className="p-5 space-y-5">
              {/* Noise Removal */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Remove Background Noise</p>
                  <p className="text-[11px] text-slate-400">Clean up audio artifacts</p>
                </div>
                <button onClick={() => setEnableNoiseRemoval(!enableNoiseRemoval)}
                  className={`relative w-10 h-[22px] rounded-full transition-all duration-200 ${enableNoiseRemoval ? 'bg-blue-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${enableNoiseRemoval ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Processing Mode */}
              {enableNoiseRemoval && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Processing Mode</label>
                  <select
                    value={processingMode}
                    onChange={e => setProcessingMode(e.target.value)}
                    className="w-full bg-slate-50/60 backdrop-blur-sm border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-[12px] text-slate-700 font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50 transition-all duration-200 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                  >
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                    <option value="deepfilter">DeepFilter</option>
                  </select>
                </div>
              )}

              {/* Polishing Audio */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Audio Polishing</p>
                  <p className="text-[11px] text-slate-400">Premium voice enhancement</p>
                </div>
                <button onClick={() => setEnablePolishingAudio(!enablePolishingAudio)}
                  className={`relative w-10 h-[22px] rounded-full transition-all duration-200 ${enablePolishingAudio ? 'bg-blue-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${enablePolishingAudio ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Process Button */}
              <button
                onClick={processAudio}
                disabled={loading || (!file && !recordedBlob)}
                className="w-full mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[13px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Processing... {progress}%
                  </span>
                ) : 'Process Audio'}
              </button>

              {/* Progress bar during loading */}
              {loading && (
                <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Left: Session Files */}
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 ${!generatedAudioReady ? 'lg:col-span-2' : ''}`}>
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                <FolderOpen size={14} className="text-blue-600" />
              </div>
              <h2 className="text-[15px] font-bold text-slate-900">Session Files</h2>
            </div>
            <div className="p-5">
              {sessionFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FolderOpen size={28} className="text-slate-200 mb-2" />
                  <p className="text-[12px] text-slate-400">No files yet</p>
                  <p className="text-[10px] text-slate-300">Processed audio will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionFiles.map((sf, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50/60 border border-slate-100/60 hover:bg-blue-50/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <Volume2 size={13} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-slate-700">{sf.name}</p>
                          <p className="text-[10px] text-slate-400">{timeAgo(sf.timestamp)}</p>
                        </div>
                      </div>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50/60 transition-all">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Right: Generated Output */}
          {generatedAudioReady && (
            <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300">
              <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
              <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                    <Volume2 size={14} className="text-blue-600" />
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-900">Enhanced Audio</h2>
                </div>
                <div className="relative flex items-center gap-3">
                  <button
                    onClick={() => setShowExportSettings(!showExportSettings)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-blue-600 bg-white/80 backdrop-blur-sm border border-white/90 shadow-[0_2px_8px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <Download size={12} />
                    Export
                  </button>
                </div>
              </div>
              <div className="p-5">
                <audio ref={generatedAudioRef} src={processedAudio || undefined}
                  onLoadedMetadata={e => { if (isFinite(e.target.duration)) setGenDuration(e.target.duration); }}
                  onDurationChange={e => { if (isFinite(e.target.duration) && e.target.duration > 0) setGenDuration(e.target.duration); }}
                  onCanPlay={e => { if (isFinite(e.target.duration) && e.target.duration > 0) setGenDuration(e.target.duration); }}
                  onTimeUpdate={e => { setGenCurrentTime(e.target.currentTime); if (isFinite(e.target.duration) && e.target.duration > 0 && genDuration === 0) setGenDuration(e.target.duration); }}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)}
                />
                <div className="flex items-center gap-3">
                  <button onClick={toggleGeneratedPlay} className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:scale-105 transition-all duration-200 shrink-0">
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <div className="flex-1 flex items-center gap-[2px] h-8 overflow-hidden">
                    {waveHeights.map((h, i) => {
                      const prog = genDuration ? Math.min(genCurrentTime / genDuration, 1) : 0;
                      const active = i / waveHeights.length < prog;
                      const hue = 210 + (i / waveHeights.length) * 50;
                      return (
                        <div key={i} onClick={() => { if (!generatedAudioRef.current || !genDuration) return; const t = (i / waveHeights.length) * genDuration; generatedAudioRef.current.currentTime = t; setGenCurrentTime(t); }}
                          className={`rounded-full cursor-pointer transition-all duration-150 ${active ? '' : 'bg-slate-300/60'}`}
                          style={{ width: '2.5px', height: `${h}px`, ...(active ? { background: `hsl(${hue}, 65%, 52%)`, boxShadow: `0 0 4px hsla(${hue}, 65%, 52%, 0.3)` } : {}) }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium tabular-nums shrink-0">{formatTime(genCurrentTime)}/{formatTime(genDuration)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Settings Modal */}
        {showExportSettings && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowExportSettings(false)}>
            <div className="relative w-full max-w-[320px] bg-white rounded-2xl border border-slate-200/80 shadow-[0_32px_80px_rgba(0,0,0,0.12)] p-6" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowExportSettings(false)} className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
              <h3 className="text-[16px] font-bold text-slate-900 mb-5">Export Settings</h3>
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Format</p>
                <div className="grid grid-cols-2 gap-2">
                  {['MP3', 'WAV'].map(fmt => (
                    <button key={fmt} onClick={() => setSelectedFormat(fmt)}
                      className={`py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-200 ${selectedFormat === fmt ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                    >{fmt}</button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Quality</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Low', 'High'].map(q => (
                    <button key={q} onClick={() => setSelectedQuality(q)}
                      className={`py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-200 ${selectedQuality === q ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                    >{q}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => { handleConfirmExport(); setShowExportSettings(false); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[13px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200"
              >Download {selectedFormat}</button>
            </div>
          </div>
        )}

        {/* Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowHelpModal(false)}>
            <div onClick={e => e.stopPropagation()} className="w-[92%] sm:w-[520px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.15)] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Help & Guide</h2>
                <button onClick={() => setShowHelpModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/60">
                  <p className="font-semibold text-slate-800 mb-1">1. Upload Audio</p>
                  <p>Upload your MP3 or WAV audio file that you want to enhance.</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/60">
                  <p className="font-semibold text-slate-800 mb-1">2. Configure Processing</p>
                  <p>Enable noise removal and choose a processing mode. Enable audio polishing for premium enhancement.</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/60">
                  <p className="font-semibold text-slate-800 mb-1">3. Process & Export</p>
                  <p>Click "Process Audio" and wait for completion. Preview and export your enhanced audio.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-semibold text-slate-800 mb-1">Need More Help?</p>
                  <p>Email: support@orynengine.com</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)}>
            <div onClick={e => e.stopPropagation()} className="w-[92%] sm:w-[420px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.15)] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900">Share Your Feedback</h2>
                <button onClick={() => setShowFeedbackModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <p className="text-[13px] text-slate-400 mb-5">Tell us about your experience with Voice Editor</p>
              <div className="mb-5">
                <p className="text-[13px] font-medium text-slate-600 mb-2">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setFeedbackRating(star)} className={`text-2xl transition-all duration-200 ${feedbackRating >= star ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <p className="text-[13px] font-medium text-slate-600 mb-2">Your Feedback</p>
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you liked or what we can improve..."
                  className="w-full h-28 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-[14px] text-slate-700 placeholder-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50 resize-none transition-all"
                />
              </div>
              <button onClick={handleSubmitFeedback} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[14px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition-all duration-200">
                Submit Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

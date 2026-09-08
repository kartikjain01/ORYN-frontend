import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Download, HelpCircle, MessageSquare, Globe, Sparkles, Upload, Settings2, X, Maximize2, Minimize2, Volume2, Mic, FolderOpen, MoreVertical, RotateCcw, Share } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { createProject, getProjectsByType } from '../lib/db';
import { authFetch, authJsonFetch, downloadName } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_VOICE_GENERATION;

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef(null);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('MP3');
  const [selectedQuality, setSelectedQuality] = useState('High');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionFiles, setSessionFiles] = useState([]);
  const [activeExportIdx, setActiveExportIdx] = useState(null);
  const [sfMenuIdx, setSfMenuIdx] = useState(null);
  const [loadingSf, setLoadingSf] = useState(true);
  const [lastProjectUrl, setLastProjectUrl] = useState(null);
  const exportBoxRef = useRef(null);
  const sfMenuRef = useRef(null);

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState('michael');
  const [speed, setSpeed] = useState(1);
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.5);
  const [styleExaggeration, setStyleExaggeration] = useState(0.5);

  const [waveHeights] = useState(() => Array.from({ length: 120 }, () => Math.random() * 20 + 6));

  const voices = {
    en: [
      { id: 'bella', label: 'Bella', gender: 'Female' },
      { id: 'sarah', label: 'Sarah', gender: 'Female' },
      { id: 'nova', label: 'Nova', gender: 'Female' },
      { id: 'sky', label: 'Sky', gender: 'Female' },
      { id: 'michael', label: 'Michael', gender: 'Male' },
      { id: 'echo', label: 'Echo', gender: 'Male' },
      { id: 'adam', label: 'Adam', gender: 'Male' },
      { id: 'eric', label: 'Eric', gender: 'Male' },
      { id: 'liam', label: 'Liam', gender: 'Male' },
    ],
    hi: [
      { id: 'omega', label: 'Omega', gender: 'Male' },
      { id: 'psi', label: 'Psi', gender: 'Male' },
      { id: 'alpha', label: 'Alpha', gender: 'Female' },
      { id: 'beta', label: 'Beta', gender: 'Female' },
    ],
  };

  useEffect(() => {
    getProjectsByType('tts').then(rows => {
      const files = rows.map(r => ({
        id: r.id,
        url: r.output_url,
        text: r.title?.slice(0, 40) || 'TTS Output',
        voice: r.metadata?.voice || 'unknown',
        duration: r.duration_seconds || 0,
        timestamp: new Date(r.created_at).getTime(),
        fromDb: true,
      }));
      setSessionFiles(files);
      setLoadingSf(false);
      files.forEach((f, idx) => {
        if (!f.duration && f.url) {
          const a = new Audio(f.url);
          a.addEventListener('loadedmetadata', () => {
            if (isFinite(a.duration) && a.duration > 0) {
              setSessionFiles(prev => prev.map((sf, i) => i === idx && sf.id === f.id ? { ...sf, duration: a.duration } : sf));
              supabase.from('projects').update({ duration_seconds: a.duration }).eq('id', f.id).catch(console.error);
            }
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    const handleOutsideClick = event => {
      if (showExportSettings && exportBoxRef.current && !exportBoxRef.current.contains(event.target)) {
        setShowExportSettings(false);
      }
      if (activeExportIdx !== null) setActiveExportIdx(null);
      if (sfMenuIdx !== null && sfMenuRef.current && !sfMenuRef.current.contains(event.target)) setSfMenuIdx(null);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showExportSettings, activeExportIdx]);

  useEffect(() => {
    if (selectedLanguage === 'hi') {
      setSelectedVoice('omega');
    } else {
      setSelectedVoice('michael');
    }
  }, [selectedLanguage]);

  const handleFileUploadClick = () => fileInputRef.current.click();

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = event => setText(event.target.result);
      reader.readAsText(file);
    } else {
      alert('Only .txt files supported');
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isFinite(audio.duration) && audio.duration > 0) {
      if (duration === 0) setDuration(audio.duration);
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(percent);
    }
    setCurrentTime(audio.currentTime);
  };

  const formatTime = t => {
    if (!t) return '0:00';
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
  };

  const timeAgo = ts => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };


  const handleSfPlay = (sf) => { if (sf.url) { setAudioUrl(sf.url); setShowAudio(true); } setSfMenuIdx(null); };

  const handleSfDownload = async (sf) => {
    if (!sf.url) return;
    try {
      const res = await fetch(sf.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName('tts', sf.text, 'mp3');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    setSfMenuIdx(null);
  };


  const handleConfirmExport = async () => {
    if (!audioUrl) { alert('No audio to export'); return; }
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadName('tts', text, selectedFormat.toLowerCase());
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

  const handleGenerate = async () => {
    if (!text.trim()) { alert('Please enter text first'); return; }
    setIsLoading(true);
    try {
      const response = await authJsonFetch(`${API_BASE}/generate`, {
          text: text.replace(/\n/g, ' '),
          speed,
          voice: selectedVoice,
          language: selectedLanguage,
      });
      if (!response.ok) throw new Error('Backend Error');
      const data = await response.json();

      if (data.job_id) {
        const poll = async () => {
          while (true) {
            await new Promise(r => setTimeout(r, 2000));
            const statusRes = await authFetch(`${API_BASE}/generate/status/${data.job_id}`);
            if (!statusRes.ok) throw new Error('Status check failed');
            const status = await statusRes.json();
            if (status.status === 'done') return status.audio_url;
            if (status.status === 'failed') throw new Error(status.error || 'Generation failed');
          }
        };
        const audioUrl = await poll();
        setAudioUrl(audioUrl);
        setShowAudio(true);
        setLastProjectUrl(audioUrl);
        setSessionFiles(prev => [{ url: audioUrl, format: selectedFormat, quality: selectedQuality, text: text.slice(0, 40), voice: selectedVoice, duration: 0, timestamp: Date.now() }, ...prev]);
        createProject({ title: text.slice(0, 60) || 'TTS Output', type: 'tts', outputUrl: audioUrl, metadata: { voice: selectedVoice, language: selectedLanguage, speed } }).catch(err => console.error('createProject failed:', err));
      } else {
        setAudioUrl(data.audio_url);
        setShowAudio(true);
        setLastProjectUrl(data.audio_url);
        setSessionFiles(prev => [{ url: data.audio_url, format: selectedFormat, quality: selectedQuality, text: text.slice(0, 40), voice: selectedVoice, duration: 0, timestamp: Date.now() }, ...prev]);
        createProject({ title: text.slice(0, 60) || 'TTS Output', type: 'tts', outputUrl: data.audio_url, metadata: { voice: selectedVoice, language: selectedLanguage, speed } }).catch(err => console.error('createProject failed:', err));
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Backend connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = () => {
    alert('Thanks for your feedback!');
    setShowFeedbackModal(false);
    setFeedbackText('');
    setFeedbackRating(5);
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="relative min-h-full p-6 lg:p-8 space-y-5 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)' }}>
        {/* Decorative floating orbs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-300/20 blur-[80px] animate-breathe" />
        <div className="pointer-events-none absolute top-[60%] -left-32 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-200/25 to-indigo-200/15 blur-[70px] animate-breathe" style={{ animationDelay: '1.2s' }} />
        <div className="pointer-events-none absolute bottom-0 right-[20%] w-[250px] h-[250px] rounded-full bg-gradient-to-t from-blue-100/20 to-indigo-100/10 blur-[60px] animate-breathe" style={{ animationDelay: '2.5s' }} />

        {/* Page heading */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">Text to Speech</h1>
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

        {/* Workflow Steps — Glass bar */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.6)_inset] px-6 py-4 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 0.5px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="flex items-center justify-between flex-1">
            {[
              { n: 1, label: 'Enter text' },
              { n: 2, label: 'Choose voice' },
              { n: 3, label: 'Generate speech' },
              { n: 4, label: 'Download' },
            ].map((step, idx) => {
              const currentStep = !text.trim() ? 1 : !selectedVoice ? 2 : !showAudio ? 3 : 4;
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Text Input */}
          <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 flex flex-col">
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                  <Sparkles size={14} className="text-blue-600" />
                </div>
                <h2 className="text-[15px] font-bold text-slate-900">Script</h2>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {showAudio && (
                  <button onClick={() => { setText(''); setShowAudio(false); setAudioUrl(''); setProgress(0); setCurrentTime(0); setDuration(0); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold text-blue-600 bg-white/80 backdrop-blur-sm border border-white/90 shadow-[0_2px_8px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                    <RotateCcw size={12} />
                    New TTS
                  </button>
                )}
                <div className="flex items-center gap-2">
                  {text && (
                    <span className="text-[10px] text-slate-400 font-medium tabular-nums bg-slate-100/60 px-2 py-0.5 rounded">{text.length}/500</span>
                  )}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50/60 transition-all"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col min-h-[320px]">
              <input type="file" accept=".txt" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={selectedLanguage === 'hi' ? 'हिंदी में लिखें...' : 'Type or paste your text here...'}
                className="flex-1 w-full resize-none bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-300 leading-relaxed"
              />

              {/* Bottom bar */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100/60">
                <div className="flex items-center gap-2">
                  <button onClick={handleFileUploadClick} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 bg-white/80 backdrop-blur-sm border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,1)] hover:text-blue-600 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                    <Upload size={12} />
                    Upload .txt
                  </button>
                  <button onClick={() => setText('')} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 bg-white/80 backdrop-blur-sm border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.1),inset_0_1px_0_rgba(255,255,255,1)] hover:text-red-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                    <X size={12} />
                    Clear
                  </button>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !text.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[12px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Generating...
                    </span>
                  ) : 'Generate Speech'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Voice Settings */}
          <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300">
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                <Settings2 size={14} className="text-blue-600" />
              </div>
              <h2 className="text-[15px] font-bold text-slate-900">Voice Settings</h2>
            </div>

            <div className="p-5 space-y-4">
              {/* Language */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  <Globe size={11} />
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="w-full bg-slate-50/60 backdrop-blur-sm border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-[12px] text-slate-700 font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50 transition-all duration-200 appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>

              {/* Voice */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  <Mic size={11} />
                  Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={e => setSelectedVoice(e.target.value)}
                  className="w-full bg-slate-50/60 backdrop-blur-sm border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-[12px] text-slate-700 font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50 transition-all duration-200 appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                >
                  {voices[selectedLanguage].map(voice => (
                    <option key={voice.id} value={voice.id}>{voice.label} ({voice.gender})</option>
                  ))}
                </select>
              </div>

              {/* Sliders with value in thumb */}
              {[
                { label: 'Speed', value: speed, setValue: setSpeed, min: 0.5, max: 2, step: 0.1, display: `${speed.toFixed(1)}x` },
                { label: 'Stability', value: stability, setValue: setStability, min: 0, max: 1, step: 0.01, display: Math.round(stability * 100) },
                { label: 'Similarity', value: similarity, setValue: setSimilarity, min: 0, max: 1, step: 0.01, display: Math.round(similarity * 100) },
                { label: 'Style Exaggeration', value: styleExaggeration, setValue: setStyleExaggeration, min: 0, max: 1, step: 0.01, display: Math.round(styleExaggeration * 100) },
              ].map(slider => {
                const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
                return (
                  <div key={slider.label}>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3 block">{slider.label}</label>
                    <div className="relative h-6 flex items-center">
                      <div className="absolute inset-x-0 h-[5px] rounded-full bg-slate-200/80" />
                      <div className="absolute left-0 h-[5px] rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${percent}%` }} />
                      <div className="absolute w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_2px_8px_rgba(37,99,235,0.4)] flex items-center justify-center -translate-x-1/2" style={{ left: `${percent}%` }}>
                        <span className="text-[8px] font-bold text-white">{slider.display}</span>
                      </div>
                      <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        value={slider.value}
                        onChange={e => slider.setValue(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Files */}
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 ${!showAudio ? 'lg:col-span-2' : ''}`}>
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                  <FolderOpen size={14} className="text-blue-600" />
                </div>
                <h2 className="text-[15px] font-bold text-slate-900">Recent Files</h2>
              </div>
            </div>
            <div className="p-5">
              {loadingSf ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50/30 border border-blue-100/20 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-blue-100/50 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-blue-100/50 rounded w-3/4" />
                        <div className="h-2.5 bg-blue-100/30 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sessionFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FolderOpen size={28} className="text-slate-200 mb-2" />
                  <p className="text-[12px] text-slate-400">No files yet</p>
                  <p className="text-[10px] text-slate-300">Generated audio will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionFiles.map((sf, idx) => (
                    <div key={sf.id || idx} className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-blue-50/60 border-blue-100/40 transition-all duration-200">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-100">
                          <Volume2 size={13} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-slate-700 truncate">{sf.text}...</p>
                          <p className="text-[10px] text-slate-400">{sf.voice ? `${sf.voice} · ` : ''}{timeAgo(sf.timestamp)}</p>
                        </div>
                      </div>
                      {sf.duration ? <span className="text-[10px] font-medium text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5 shrink-0">{Math.floor(sf.duration / 60)}:{Math.max(1, Math.round(sf.duration % 60)).toString().padStart(2, '0')}</span> : null}
                      <div className="relative shrink-0" ref={sfMenuIdx === idx ? sfMenuRef : null}>
                        <button onClick={() => setSfMenuIdx(sfMenuIdx === idx ? null : idx)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50/60 transition-all">
                          <MoreVertical size={14} />
                        </button>
                        {sfMenuIdx === idx && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setSfMenuIdx(null)} />
                            <div className="absolute right-0 bottom-8 w-36 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 py-1.5 z-50">
                              <button onClick={() => handleSfPlay(sf)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-slate-600 hover:bg-slate-50 transition">
                                <Play size={13} /> Open
                              </button>
                              <button onClick={() => handleSfDownload(sf)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-slate-600 hover:bg-slate-50 transition">
                                <Download size={13} /> Download
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generated Output */}
          {showAudio && (
            <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300">
              <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
              <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                    <Volume2 size={14} className="text-blue-600" />
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-900">Generated Audio</h2>
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
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  onLoadedMetadata={e => {
                    const dur = e.target.duration;
                    if (isFinite(dur) && dur > 0) {
                      setDuration(dur);
                      if (lastProjectUrl === audioUrl) {
                        setSessionFiles(prev => prev.map((sf, i) => i === 0 && sf.url === audioUrl && !sf.duration ? { ...sf, duration: dur } : sf));
                        supabase.from('projects').update({ duration_seconds: dur }).eq('output_url', audioUrl).then(() => {}).catch(console.error);
                        setLastProjectUrl(null);
                      }
                    }
                  }}
                  onDurationChange={e => { if (isFinite(e.target.duration) && e.target.duration > 0) setDuration(e.target.duration); }}
                  onCanPlay={e => { if (isFinite(e.target.duration) && e.target.duration > 0) setDuration(e.target.duration); }}
                  onPlay={e => { if (isFinite(e.target.duration) && e.target.duration > 0) setDuration(e.target.duration); }}
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:scale-105 transition-all duration-200 shrink-0"
                  >
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                  </button>

                  {/* Waveform */}
                  <div className="flex-1 flex items-center gap-[2px] h-8 overflow-hidden">
                    {waveHeights.map((h, i) => {
                      const active = i / waveHeights.length < progress / 100;
                      const hue = 210 + (i / waveHeights.length) * 50;
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            if (!audioRef.current) return;
                            const newTime = (i / waveHeights.length) * duration;
                            audioRef.current.currentTime = newTime;
                            setCurrentTime(newTime);
                          }}
                          className={`rounded-full cursor-pointer transition-all duration-150 ${active ? '' : 'bg-slate-300/60'}`}
                          style={{ width: '2.5px', height: `${h}px`, ...(active ? { background: `hsl(${hue}, 65%, 52%)`, boxShadow: `0 0 4px hsla(${hue}, 65%, 52%, 0.3)` } : {}) }}
                        />
                      );
                    })}
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium tabular-nums shrink-0">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm" onClick={() => setIsFullscreen(false)}>
            <div className="relative w-full h-full max-w-[900px] max-h-[85vh] bg-white rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.6)_inset] border border-white/80 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                    <Sparkles size={14} className="text-blue-600" />
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-900">Script Editor</h2>
                </div>
                <button onClick={() => setIsFullscreen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50/60 transition-all">
                  <Minimize2 size={16} />
                </button>
              </div>
              <div className="flex-1 min-h-0 p-6">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={selectedLanguage === 'hi' ? 'हिंदी में लिखें...' : 'Type or paste your text here...'}
                  className="w-full h-full resize-none bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-300 leading-relaxed"
                />
              </div>
              <div className="px-6 py-4 border-t border-slate-100/60 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-400 font-medium">{text.length} characters</span>
                <button
                  onClick={() => { setIsFullscreen(false); handleGenerate(); }}
                  disabled={isLoading || !text.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[12px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Generate Speech
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <p className="font-semibold text-slate-800 mb-1">1. Enter Text</p>
                  <p>Type your text or upload a .txt file. Choose your preferred language and voice.</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/60">
                  <p className="font-semibold text-slate-800 mb-1">2. Configure Settings</p>
                  <p>Adjust speed to match your desired output. Select output format (MP3 or WAV) and quality.</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/60">
                  <p className="font-semibold text-slate-800 mb-1">3. Generate & Export</p>
                  <p>Click "Generate Speech" and wait for processing. Preview and download the generated audio.</p>
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
              <p className="text-[13px] text-slate-400 mb-5">Tell us about your experience using Text to Speech</p>
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

import { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Upload, Play, Pause, Download, Settings2, CheckCircle2, AudioWaveform, Sparkles, Globe, HelpCircle, MessageSquare, X, RotateCcw, MoreVertical, FolderOpen, Maximize2, Minimize2 } from 'lucide-react';
import { createProject, createVoice, getProjectsByType } from '../lib/db';
import { supabase } from '../supabaseClient';
import { authFetch, authJsonFetch, authUploadFetch, downloadName } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_VOICE_CLONE;

export default function VoiceCloningPage() {
  const [mode, setMode] = useState('upload');
  const [removeNoise, setRemoveNoise] = useState(true);
  const [file, setFile] = useState(null);
  const [voiceId, setVoiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cloneCompleted, setCloneCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioReady, setGeneratedAudioReady] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [previewText, setPreviewText] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSourcePlaying, setIsSourcePlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sourceCurrentTime, setSourceCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('MP3');
  const [selectedQuality, setSelectedQuality] = useState('High');
  const [fileName, setFileName] = useState('');
  const [audioDuration, setAudioDuration] = useState('0:00');
  const [durationSec, setDurationSec] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [sessionFiles, setSessionFiles] = useState([]);
  const [sfMenuIdx, setSfMenuIdx] = useState(null);
  const [loadingSf, setLoadingSf] = useState(true);
  const [lastProjectUrl, setLastProjectUrl] = useState(null);
  const sfMenuRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    getProjectsByType('voice_clone').then(rows => {
      const files = rows.map(r => ({
        id: r.id,
        url: r.output_url,
        text: r.title?.slice(0, 30) || 'Voice Clone Output',
        format: r.metadata?.format || 'MP3',
        quality: r.metadata?.quality || 'Standard',
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

  const inputRef = useRef(null);
  const uploadAudioRef = useRef(null);
  const generatedAudioRef = useRef(null);
  const exportBoxRef = useRef(null);

  const accepted = useMemo(() => '.mp3,.wav,audio/mpeg,audio/wav', []);
  const [waveHeights] = useState(() => Array.from({ length: 120 }, () => Math.random() * 20 + 6));

  useEffect(() => {
    const handleOutsideClick = event => {
      if (showExportSettings && exportBoxRef.current && !exportBoxRef.current.contains(event.target)) {
        setShowExportSettings(false);
      }
      if (sfMenuIdx !== null && sfMenuRef.current && !sfMenuRef.current.contains(event.target)) setSfMenuIdx(null);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showExportSettings, sfMenuIdx]);

  useEffect(() => {
    if (!file) { setAudioDuration('0:00'); return; }
    const audio = new Audio(URL.createObjectURL(file));
    audio.addEventListener('loadedmetadata', () => {
      const dur = audio.duration;
      setDurationSec(dur);
      const min = Math.floor(dur / 60);
      const sec = Math.floor(dur % 60).toString().padStart(2, '0');
      setAudioDuration(`${min}:${sec}`);
    });
    return () => audio.remove();
  }, [file]);

  const resetAllStates = () => {
    setVoiceId(null); setCloneCompleted(false); setGeneratedAudioReady(false);
    setAudioUrl(null); setIsGenerating(false); setStatusMsg('');
    setCurrentTime(0); setDuration(0); setIsPlaying(false);
  };

  const onFileChange = e => { const f = e.target.files?.[0]; if (!f) return; setFile(f); setAudioPreviewUrl(URL.createObjectURL(f)); setFileName(f.name); resetAllStates(); };
  const onDrop = e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (!f) return; setFile(f); setAudioPreviewUrl(URL.createObjectURL(f)); setFileName(f.name); resetAllStates(); };
  const onDragOver = e => e.preventDefault();

  const startRecording = async () => {
    try {
      setStatusMsg('Starting recorder...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob); setAudioPreviewUrl(URL.createObjectURL(blob));
        setFile(new File([blob], 'recording.webm', { type: 'audio/webm' }));
        setFileName('recording.webm'); setStatusMsg('Recording completed');
      };
      mediaRecorder.start(); setIsRecording(true); setStatusMsg('Recording...');
    } catch (err) { console.error(err); setStatusMsg('Microphone access denied'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
    setIsRecording(false);
  };

  const timeAgo = ts => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleSfPlay = (sf) => { if (sf.url) window.open(sf.url, '_blank'); setSfMenuIdx(null); };

  const handleSfDownload = async (sf) => {
    if (!sf.url) return;
    try { const res = await fetch(sf.url); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = downloadName('clone', sf.text, 'mp3'); document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); } catch { /* silent */ }
    setSfMenuIdx(null);
  };

  const formatTime = t => { if (!t) return '0:00'; return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`; };
  const toggleSourcePlay = () => { if (!uploadAudioRef.current) return; uploadAudioRef.current.paused ? (uploadAudioRef.current.play(), setIsSourcePlaying(true)) : (uploadAudioRef.current.pause(), setIsSourcePlaying(false)); };
  const toggleGeneratedPlay = () => { if (!generatedAudioRef.current) return; generatedAudioRef.current.paused ? (generatedAudioRef.current.play(), setIsPlaying(true)) : (generatedAudioRef.current.pause(), setIsPlaying(false)); };

  const uploadVoice = async () => {
    if (!file) { alert('Please upload an audio file first'); return; }
    try {
      setLoading(true); setStatusMsg('Uploading voice...');
      const formData = new FormData(); formData.append('file', file);
      const response = await authUploadFetch(`${API_BASE}/v1/voices`, formData);
      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      const data = await response.json();
      if (!data.voice_id) throw new Error('voice_id missing');
      setVoiceId(data.voice_id); setStatusMsg('Building voice profile...');
      const buildResponse = await authJsonFetch(`${API_BASE}/v1/voices/${data.voice_id}/build`, { remove_noise: removeNoise });
      if (!buildResponse.ok) throw new Error(`Build Failed: ${buildResponse.status}`);
      setCloneCompleted(true); setStatusMsg('Voice cloned successfully!');
      createVoice({ name: fileName || 'Cloned Voice', type: 'voice_clone', voiceId: data.voice_id, durationSeconds: durationSec, metadata: { removeNoise } }).catch(console.error);
    } catch (err) { console.error(err); setStatusMsg('Error cloning voice'); }
    finally { setLoading(false); }
  };

  const generatePreview = async () => {
    if (!voiceId) {
      alert('Clone voice first');
      return;
    }

    if (!previewText) {
      alert('Enter text');
      return;
    }

    try {
      setIsGenerating(true);
      setStatusMsg('Generating preview...');

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('You must be logged in');
      }

      const response = await authJsonFetch(`${API_BASE}/v1/tts`, {
        voice_id: voiceId,
        text: previewText,
        language: selectedLanguage,
        output_format: 'wav',
        user_id: user.id,
      });

      if (!response.ok) {
        throw new Error(`TTS Error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.job_id) {
        throw new Error('No job_id');
      }

      checkJobStatus(data.job_id);
    } catch (err) {
      console.error(err);
      setStatusMsg(err.message || 'TTS failed');
      setIsGenerating(false);
    }
  };

  const checkJobStatus = async jobId => {
    const interval = setInterval(async () => {
      try {
        const res = await authFetch(`${API_BASE}/v1/tts/${jobId}`);
        const data = await res.json();
        if (data.status === 'done') { clearInterval(interval); if (!data.audio_url) { setStatusMsg('No audio URL'); setIsGenerating(false); return; } setAudioUrl(data.audio_url); setGeneratedAudioReady(true); setIsGenerating(false); setStatusMsg('Preview ready!'); setLastProjectUrl(data.audio_url); setSessionFiles(prev => [{ url: data.audio_url, format: selectedFormat, quality: selectedQuality, text: previewText.slice(0, 30), duration: 0, timestamp: Date.now() }, ...prev]); createProject({ title: previewText.slice(0, 60) || 'Voice Clone Output', type: 'voice_clone', outputUrl: data.audio_url, metadata: { voiceId, language: selectedLanguage } }).catch(console.error); }
        if (data.status === 'failed') { clearInterval(interval); setStatusMsg('Generation failed'); setIsGenerating(false); }
      } catch (err) { console.error(err); clearInterval(interval); setStatusMsg('Error checking status'); setIsGenerating(false); }
    }, 2000);
  };

  const handleDownload = async () => {
    if (!audioUrl) return;
    const response = await fetch(audioUrl); const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = blobUrl; link.download = downloadName('clone', previewText, selectedFormat.toLowerCase());
    document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(blobUrl);
  };

  const handleSubmitFeedback = () => {
    alert('Thanks for your feedback!');
    setShowFeedbackModal(false);
    setFeedbackText('');
    setFeedbackRating(5);
  };

  const currentStep = !file ? 1 : !cloneCompleted ? 2 : !previewText ? 3 : !generatedAudioReady ? 3 : 4;

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Gradient background with floating orbs */}
      <div className="relative min-h-full p-6 lg:p-8 space-y-5 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)' }}>
        {/* Decorative floating orbs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-300/20 blur-[80px] animate-breathe" />
        <div className="pointer-events-none absolute top-[60%] -left-32 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-200/25 to-indigo-200/15 blur-[70px] animate-breathe" style={{ animationDelay: '1.2s' }} />
        <div className="pointer-events-none absolute bottom-0 right-[20%] w-[250px] h-[250px] rounded-full bg-gradient-to-t from-blue-100/20 to-indigo-100/10 blur-[60px] animate-breathe" style={{ animationDelay: '2.5s' }} />

        {/* Page heading */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">Voice Clone</h1>
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
              { n: 1, label: 'Upload audio' },
              { n: 2, label: 'Clone voice' },
              { n: 3, label: 'Enter text' },
              { n: 4, label: 'Generate speech' },
            ].map((step, idx) => {
              const isFailed = (statusMsg.includes('Error') || statusMsg.includes('failed') || statusMsg.includes('denied')) && currentStep === step.n;
              return (
              <div key={step.n} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300 ${
                    isFailed
                      ? 'bg-red-100 text-red-600 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      : currentStep > step.n
                      ? 'bg-emerald-100 text-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : currentStep === step.n
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)]'
                      : 'bg-slate-100/80 text-slate-400'
                  }`}>
                    {isFailed ? (
                      <X size={14} />
                    ) : currentStep > step.n ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step.n}
                  </div>
                  <span className={`text-[13px] font-medium whitespace-nowrap transition-colors ${
                    isFailed ? 'text-red-600' : currentStep > step.n ? 'text-emerald-700' : currentStep === step.n ? 'text-slate-900' : 'text-slate-400'
                  }`}>{step.label}</span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-[2px] rounded-full mx-3 transition-colors duration-500 ${
                    currentStep > step.n ? 'bg-emerald-300' : 'bg-slate-200/60'
                  }`} />
                )}
              </div>
            )})}
          </div>
        </div>

        {/* Status Message — only show during processing, errors, or non-redundant states */}
        {statusMsg && !statusMsg.includes('ready') && !statusMsg.includes('success') && (
          <div className={`px-5 py-3 rounded-xl backdrop-blur-sm border text-[13px] font-medium transition-all ${
            statusMsg.includes('Error') || statusMsg.includes('failed') || statusMsg.includes('denied')
              ? 'text-red-700 bg-red-50/80 border-red-200/60'
              : 'text-blue-700 bg-blue-50/80 border-blue-200/60 shadow-[0_0_20px_rgba(37,99,235,0.06)]'
          }`}>
            {statusMsg}
          </div>
        )}

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Left: Voice Source */}
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 ${!generatedAudioReady ? 'min-h-[380px]' : ''}`}>
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className="px-5 pt-5 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                    <AudioWaveform size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Voice Source</h2>
                    {cloneCompleted && <p className="text-[11px] text-blue-500 font-medium">{fileName} · {audioDuration}</p>}
                  </div>
                </div>
                {cloneCompleted && (
                  <button onClick={() => { setFile(null); setFileName(''); setAudioPreviewUrl(null); setPreviewText(''); resetAllStates(); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold text-blue-600 bg-white/80 backdrop-blur-sm border border-white/90 shadow-[0_2px_8px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                    <RotateCcw size={12} />
                    New Clone
                  </button>
                )}
              </div>
              {!cloneCompleted && (
                <div className="flex gap-1 bg-slate-100/60 backdrop-blur-sm rounded-xl p-1">
                  <button onClick={() => setMode('upload')} className={`flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 ${mode === 'upload' ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Upload size={13} /> Upload Audio
                  </button>
                  <button onClick={() => setMode('record')} className={`flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 ${mode === 'record' ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Mic size={13} /> Record Voice
                  </button>
                </div>
              )}
            </div>

            {!cloneCompleted && (
              <div className="p-5 pt-4">
                {mode === 'upload' ? (
                  <div onDrop={onDrop} onDragOver={onDragOver} onClick={() => inputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${file ? 'border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-4' : 'border-slate-200/80 hover:border-blue-300/80 hover:bg-gradient-to-br hover:from-blue-50/40 hover:to-violet-50/20 p-8'}`}
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
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300 animate-float">
                          <Upload size={22} className="text-blue-500" />
                        </div>
                        <p className="text-[13px] font-semibold text-slate-700">Drop audio here or <span className="text-blue-600">browse</span></p>
                        <p className="text-[11px] text-slate-400 mt-1">MP3 or WAV, 1-10 min, max 100 MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200/80 rounded-2xl p-8 flex flex-col items-center justify-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-200 ${isRecording ? 'bg-red-100 animate-pulse shadow-[0_0_24px_rgba(239,68,68,0.2)]' : 'bg-slate-100/80'}`}>
                      <Mic size={22} className={isRecording ? 'text-red-500' : 'text-slate-400'} />
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

            {/* Audio Player */}
            {file && (
              <div className="mx-5 mb-3 bg-gradient-to-r from-slate-50/80 to-blue-50/40 backdrop-blur-sm rounded-xl px-3 py-2.5 flex items-center gap-2.5 border border-slate-100/60">
                <button onClick={toggleSourcePlay} className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)] hover:scale-105 transition-all duration-200 shrink-0">
                  {isSourcePlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[2px] h-6 overflow-hidden">
                    {waveHeights.map((h, i) => {
                      const progress = durationSec ? Math.min(sourceCurrentTime / durationSec, 1) : 0;
                      const active = i / waveHeights.length < progress;
                      const hue = 210 + (i / waveHeights.length) * 50;
                      return (
                        <div key={i} onClick={e => { e.stopPropagation(); if (!uploadAudioRef.current) return; uploadAudioRef.current.currentTime = (i / waveHeights.length) * durationSec; setSourceCurrentTime((i / waveHeights.length) * durationSec); }}
                          className={`rounded-full cursor-pointer transition-all duration-150 ${active ? '' : 'bg-slate-300/60'}`}
                          style={{ width: '2px', height: `${h * 0.85}px`, ...(active ? { background: `hsl(${hue}, 65%, 52%)`, boxShadow: `0 0 4px hsla(${hue}, 65%, 52%, 0.3)` } : {}) }}
                        />
                      );
                    })}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tabular-nums shrink-0">{formatTime(sourceCurrentTime)}/{audioDuration}</span>
                <audio ref={uploadAudioRef} src={audioPreviewUrl || undefined} preload="metadata"
                  onLoadedMetadata={e => { let dur = e.target.duration; if (!isFinite(dur)) { e.target.currentTime = 1e101; e.target.ontimeupdate = () => { e.target.ontimeupdate = null; e.target.currentTime = 0; dur = e.target.duration; if (isFinite(dur) && !isNaN(dur)) { setDurationSec(dur); setAudioDuration(`${Math.floor(dur / 60)}:${Math.floor(dur % 60).toString().padStart(2, '0')}`); } }; } else { setDurationSec(dur); setAudioDuration(`${Math.floor(dur / 60)}:${Math.floor(dur % 60).toString().padStart(2, '0')}`); } }}
                  onTimeUpdate={e => setSourceCurrentTime(e.target.currentTime)}
                  onPause={() => setIsSourcePlaying(false)} onPlay={() => setIsSourcePlaying(true)}
                />
              </div>
            )}

            {/* Clone Action */}
            {file && !cloneCompleted && (
              <div className="mx-5 mb-5 flex items-center justify-between gap-3 bg-slate-50/60 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-slate-100/60">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setRemoveNoise(!removeNoise)} className={`relative w-8 h-[18px] rounded-full transition-all duration-200 ${removeNoise ? 'bg-blue-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform duration-200 ${removeNoise ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-[12px] text-slate-600 font-medium">Noise removal</span>
                </label>
                <button onClick={uploadVoice} disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[12px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Processing...
                    </span>
                  ) : 'Clone Voice'}
                </button>
              </div>
            )}
          </div>

          {/* Top Right: Generate Speech */}
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 ${generatedAudioReady ? '' : 'min-h-[380px]'} ${
            !cloneCompleted ? 'opacity-50 border-slate-200/60' : 'border-white/80 hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)]'
          }`}>
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                  <Sparkles size={14} className="text-blue-600" />
                </div>
                <h2 className="text-[15px] font-bold text-slate-900">Generate Speech</h2>
              </div>
              <div className="flex items-center gap-2">
                {previewText && (
                  <span className="text-[10px] text-slate-400 font-medium tabular-nums bg-slate-100/60 px-2 py-0.5 rounded">{previewText.length}/500</span>
                )}
                <button
                  onClick={() => setIsFullscreen(true)}
                  disabled={!cloneCompleted}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${!cloneCompleted ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50/60'}`}
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-3">
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  <Globe size={11} />
                  Output Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  disabled={!cloneCompleted}
                  className="w-full bg-slate-50/60 backdrop-blur-sm border border-slate-200/60 rounded-xl px-3.5 py-2 text-[12px] text-slate-700 font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="gu">Gujarati</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                  <option value="pt">Portuguese</option>
                  <option value="ru">Russian</option>
                  <option value="it">Italian</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="bn">Bengali</option>
                  <option value="mr">Marathi</option>
                </select>
              </div>
              <textarea
                value={previewText}
                onChange={e => setPreviewText(e.target.value)}
                maxLength={500}
                placeholder={cloneCompleted ? "Type or paste the text you want spoken..." : "Clone a voice first..."}
                disabled={!cloneCompleted}
                className="w-full min-h-[130px] bg-slate-50/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-3.5 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50 focus:bg-white/60 resize-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mb-3"
              />
              <button
                onClick={generatePreview}
                disabled={isGenerating || !previewText || !cloneCompleted}
                className={`w-full py-3 rounded-xl text-white text-[13px] font-semibold transition-all duration-200 ${
                  isGenerating || !previewText || !cloneCompleted
                    ? 'bg-gradient-to-r from-slate-300 to-slate-400 opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_8px_28px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 active:scale-[0.98]'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={14} />
                    Generate Speech
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Fullscreen Generate Speech Modal */}
          {isFullscreen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm" onClick={() => setIsFullscreen(false)}>
              <div className="relative w-full h-full max-w-[900px] max-h-[85vh] bg-white rounded-2xl border border-slate-200/60 shadow-[0_32px_80px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
                <div className="px-6 pt-5 pb-3 border-b border-slate-100/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                      <Sparkles size={14} className="text-blue-600" />
                    </div>
                    <h2 className="text-[16px] font-bold text-slate-900">Generate Speech</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {previewText && (
                      <span className="text-[11px] text-slate-400 font-medium tabular-nums bg-slate-100/60 px-2.5 py-1 rounded">{previewText.length}/500</span>
                    )}
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50/60 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      <Globe size={11} />
                      Output Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={e => setSelectedLanguage(e.target.value)}
                      disabled={!cloneCompleted}
                      className="w-full max-w-[240px] bg-slate-50/60 backdrop-blur-sm border border-slate-200/60 rounded-xl px-3.5 py-2 text-[13px] text-slate-700 font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="gu">Gujarati</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="zh">Chinese</option>
                      <option value="ar">Arabic</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="it">Italian</option>
                      <option value="ta">Tamil</option>
                      <option value="te">Telugu</option>
                      <option value="bn">Bengali</option>
                      <option value="mr">Marathi</option>
                    </select>
                  </div>
                  <textarea
                    value={previewText}
                    onChange={e => setPreviewText(e.target.value)}
                    maxLength={500}
                    placeholder={cloneCompleted ? "Type or paste the text you want spoken..." : "Clone a voice first..."}
                    disabled={!cloneCompleted}
                    className="w-full flex-1 min-h-0 bg-slate-50/60 border border-slate-200/60 rounded-xl p-4 text-[14px] leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50 focus:bg-white/60 resize-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mb-4"
                  />
                  <button
                    onClick={generatePreview}
                    disabled={isGenerating || !previewText || !cloneCompleted}
                    className={`w-full max-w-[320px] mx-auto py-3.5 rounded-xl text-white text-[14px] font-semibold transition-all duration-200 shrink-0 ${
                      isGenerating || !previewText || !cloneCompleted
                        ? 'bg-gradient-to-r from-slate-300 to-slate-400 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_8px_28px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 active:scale-[0.98]'
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles size={14} />
                        Generate Speech
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Files — full width before output, left column after */}
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${!generatedAudioReady ? 'lg:col-span-2' : ''}`}>
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className="px-5 pt-5 pb-3 border-b border-slate-100/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                  <FolderOpen size={14} className="text-blue-600" />
                </div>
                <h2 className="text-[15px] font-bold text-slate-900">Recent Files</h2>
              </div>
            </div>
            <div className="p-5 space-y-2">
              {loadingSf ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/30 border border-blue-100/20 animate-pulse">
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
                sessionFiles.map((sf, idx) => (
                  <div key={sf.timestamp} className="flex items-center gap-3 p-3 rounded-xl border bg-blue-50/60 border-blue-100/40">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-100">
                      <AudioWaveform size={14} className="text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-slate-700 truncate">{sf.text || 'output'}...{(sf.format || 'mp3').toLowerCase()}</p>
                      <p className="text-[10px] text-slate-400">{sf.quality || 'Standard'} quality · {timeAgo(sf.timestamp)}</p>
                    </div>
                    {sf.duration ? <span className="text-[10px] font-medium text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5 shrink-0">{Math.floor(sf.duration / 60)}:{Math.max(1, Math.round(sf.duration % 60)).toString().padStart(2, '0')}</span> : null}
                    <div className="relative shrink-0" ref={sfMenuIdx === idx ? sfMenuRef : null}>
                      <button onClick={() => setSfMenuIdx(sfMenuIdx === idx ? null : idx)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shrink-0">
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
                ))
              )}
            </div>
          </div>

          {/* Generated Output — only after generation, bottom-right */}
          {generatedAudioReady && (
            <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
              <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
              <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                    <Sparkles size={14} className="text-blue-600" />
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-900">Generated Output</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative" ref={exportBoxRef}>
                  <button onClick={() => setShowExportSettings(!showExportSettings)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold text-blue-600 bg-white/80 backdrop-blur-sm border border-white/90 rounded-xl shadow-[0_2px_8px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <Settings2 size={12} />
                    Export
                  </button>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <button onClick={toggleGeneratedPlay}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:scale-105 transition-all duration-200 shrink-0"
                  >
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[2px] h-7 overflow-hidden">
                      {waveHeights.map((h, i) => {
                        const progress = duration ? Math.min(currentTime / duration, 1) : 0;
                        const active = i / waveHeights.length < progress;
                        return <div key={i} onClick={e => { e.stopPropagation(); if (!generatedAudioRef.current || !duration) return; generatedAudioRef.current.currentTime = (i / waveHeights.length) * duration; setCurrentTime((i / waveHeights.length) * duration); }} className={`rounded-full cursor-pointer transition-all duration-150 ${active ? 'bg-blue-500' : 'bg-slate-200/60'}`} style={{ width: '2px', height: `${h * 0.85}px` }} />;
                      })}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium tabular-nums shrink-0">{formatTime(currentTime)}/{formatTime(duration)}</span>
                  <audio ref={generatedAudioRef} src={audioUrl || undefined}
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
                    onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
                    onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} onEnded={() => setIsPlaying(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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
            <button onClick={() => { handleDownload(); setShowExportSettings(false); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[13px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200"
            >Download</button>
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
                <p>Upload a clear audio sample (1-10 min) of the voice you want to clone. MP3 or WAV format.</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/60">
                <p className="font-semibold text-slate-800 mb-1">2. Clone Voice</p>
                <p>Click "Clone Voice" to process and build a voice profile. Enable noise removal for cleaner results.</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/60">
                <p className="font-semibold text-slate-800 mb-1">3. Generate Speech</p>
                <p>Type any text and select your output language. Click Generate to create speech in the cloned voice.</p>
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
            <p className="text-[13px] text-slate-400 mb-5">Tell us about your experience using Voice Cloning</p>
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
    </main>
  );
}

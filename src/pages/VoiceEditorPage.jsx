import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Download, HelpCircle, MessageSquare, Upload, Mic, Settings2, AudioWaveform, Volume2, FolderOpen, MoreVertical, RotateCcw, Share, X, Scissors, ChevronDown, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { createProject, getProjectsByType } from '../lib/db';
import { authFetch, authUploadFetch, downloadName } from '../lib/api';
import WaveformTrimmer from '../components/WaveformTrimmer';

const API_BASE = import.meta.env.VITE_API_VOICE_EDITOR || '';
const WS_EDITOR = import.meta.env.VITE_WS_EDITOR || '';

export default function VoiceEditorPage() {
  const navigate = useNavigate();
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
  const [modeOpen, setModeOpen] = useState(false);
  useEffect(() => { const h = () => setModeOpen(false); document.addEventListener('click', h); return () => document.removeEventListener('click', h); }, []);
  const [enableNoiseRemoval, setEnableNoiseRemoval] = useState(true);
  const [enableSmartTrim, setEnableSmartTrim] = useState(false);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('MP3');
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
  const [sfMenuIdx, setSfMenuIdx] = useState(null);
  const [loadingSf, setLoadingSf] = useState(true);
  const [lastProjectUrl, setLastProjectUrl] = useState(null);
  const sfMenuRef = useRef(null);
  const [toast, setToast] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  useEffect(() => {
    getProjectsByType('voice_editor').then(rows => {
      const files = rows.map(r => ({
        id: r.id,
        url: r.output_url,
        name: r.title || 'Voice Editor Output',
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
    }).catch(() => setLoadingSf(false));
  }, []);

  const inputRef = useRef(null);
  const uploadAudioRef = useRef(null);
  const generatedAudioRef = useRef(null);
  const exportBoxRef = useRef(null);

  const accepted = useMemo(() => '.mp3,.wav,audio/mpeg,audio/wav', []);
  const [waveHeights] = useState(() => Array.from({ length: 120 }, () => Math.random() * 20 + 6));

  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const MAX_DURATION = 300;

  const generatedAudioReady = !!processedAudio;

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

  const formatTime = secs => {
    if (!secs || isNaN(secs)) return '0:00';
    return `${Math.floor(secs / 60)}:${Math.floor(secs % 60).toString().padStart(2, '0')}`;
  };

  const timeAgo = ts => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
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

  const validateAndSetFile = (f) => {
    if (f.size > MAX_FILE_SIZE) {
      showToast(`File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max 50 MB.`);
      return;
    }
    const url = URL.createObjectURL(f);
    const a = new Audio();
    a.preload = 'metadata';
    a.src = url;
    a.onloadedmetadata = () => {
      if (isFinite(a.duration) && a.duration > MAX_DURATION) {
        showToast(`Audio too long (${Math.floor(a.duration / 60)}m ${Math.round(a.duration % 60)}s). Max 5 minutes.`);
        URL.revokeObjectURL(url);
        return;
      }
      setFile(f);
      setFileName(f.name);
      setAudioPreviewUrl(url);
      setProcessedAudio(null);
    };
  };

  const onFileChange = e => { const f = e.target.files?.[0]; if (!f) return; validateAndSetFile(f); };
  const onDrop = e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (!f) return; validateAndSetFile(f); };
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
    if (!processedAudio) { showToast('Please generate audio first'); return; }
    try {
      const response = await fetch(processedAudio);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadName('editor', fileName, selectedFormat.toLowerCase());
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setShowExportSettings(false);
    } catch (err) { console.error(err); showToast('Export failed'); }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) { showToast('Please write your feedback'); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('feedbacks').insert({
        tool: 'voice_editor',
        rating: feedbackRating,
        message: feedbackText.trim(),
        user_id: session?.user?.id || null,
      });
      setFeedbackSent(true);
      setFeedbackText('');
      setFeedbackRating(5);
      setTimeout(() => { setShowFeedbackModal(false); setFeedbackSent(false); }, 1500);
    } catch {
      showToast('Failed to send feedback');
    }
  };

  const handleSfPlay = (sf) => { navigate(sf.id ? `/projects?highlight=${sf.id}` : '/projects'); setSfMenuIdx(null); };

  const handleSfDownload = async (sf) => {
    if (!sf.url) return;
    try { const res = await fetch(sf.url); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = downloadName('editor', sf.name, 'mp3'); document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); } catch { /* silent */ }
    setSfMenuIdx(null);
  };

  const processAudio = async () => {
    if (mode === 'upload' && !file) { showToast('Please upload an audio file first'); return; }
    if (mode === 'record' && !recordedBlob) { showToast('Please record audio first'); return; }

    let progressInterval;
    try {
      setLoading(true); setProgress(0);
      progressInterval = setInterval(() => { setProgress(prev => prev >= 95 ? prev : prev + 2); }, 500);
      setProcessedAudio(null);

      const formData = new FormData();
      if (mode === 'upload') { formData.append('file', file); }
      else { formData.append('file', new File([recordedBlob], 'recording.webm', { type: 'audio/webm' })); }
      if (enableNoiseRemoval) { formData.append('mode', processingMode); }
      if (enableSmartTrim) { formData.append('smart_trim', 'true'); }

      const response = await authUploadFetch(`${API_BASE}/api/upload-audio/full-enhance`, formData);
      if (!response.ok) throw new Error(`Processing failed: ${response.status}`);
      const data = await response.json();

      if (data.job_id) {
        const poll = async () => {
          while (true) {
            await new Promise(r => setTimeout(r, 2000));
            const statusRes = await authFetch(`${API_BASE}/api/upload-audio/status/${data.job_id}`);
            if (!statusRes.ok) throw new Error('Status check failed');
            const status = await statusRes.json();
            if (status.status === 'done') return status;
            if (status.status === 'failed') throw new Error(status.error || 'Processing failed');
          }
        };
        const result = await poll();
        clearInterval(progressInterval);
        setProgress(100);
        const url = result.supabase_url || `${API_BASE}${result.download_url}`;
        setProcessedAudio(url);
        setLastProjectUrl(url);
        setSessionFiles(prev => [{ url, name: fileName, duration: 0, timestamp: Date.now() }, ...prev]);
        createProject({ title: fileName || 'Voice Editor Output', type: 'voice_editor', outputUrl: url, metadata: { mode: processingMode, noiseRemoval: enableNoiseRemoval } }).catch(console.error);
      } else {
        clearInterval(progressInterval);
        setProgress(100);
        const url = data.supabase_url || `${API_BASE}${data.download_url}`;
        setProcessedAudio(url);
        setLastProjectUrl(url);
        setSessionFiles(prev => [{ url, name: fileName, duration: 0, timestamp: Date.now() }, ...prev]);
        createProject({ title: fileName || 'Voice Editor Output', type: 'voice_editor', outputUrl: url, metadata: { mode: processingMode, noiseRemoval: enableNoiseRemoval } }).catch(console.error);
      }
    } catch (error) {
      console.error(error); showToast('Error processing audio');
    } finally { clearInterval(progressInterval); setLoading(false); }
  };

  const currentStep = !file && !recordedBlob ? 1 : !processedAudio ? (loading ? 3 : 2) : 4;

  return (
    <main className="flex-1 overflow-y-auto">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg animate-[fadeIn_0.2s_ease]">
          {toast}
        </div>
      )}
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
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 ${!generatedAudioReady ? 'min-h-[380px]' : ''}`}>
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
                        <p className="text-[11px] text-slate-400 mt-1">MP3 or WAV, max 5 min, max 50 MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-200 ${isRecording ? 'bg-red-100 animate-pulse shadow-[0_0_24px_rgba(239,68,68,0.2)]' : 'bg-slate-100/80'}`}>
                      <Mic size={20} className={isRecording ? 'text-red-500' : 'text-slate-400'} />
                    </div>
                    <p className="text-[13px] font-semibold text-slate-700 mb-1">{isRecording ? 'Recording...' : 'Record your voice'}</p>
                    <p className="text-[11px] text-slate-400 mb-4">Speak clearly for up to 5 minutes</p>
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

            {/* Waveform Trim for source audio */}
            {((mode === 'upload' && file) || (mode === 'record' && recordedBlob)) && audioPreviewUrl && (
              <div className="mx-5 mb-4">
                <div className="border-t border-dashed border-slate-200/70 mb-3" />
                <WaveformTrimmer
                  audioUrl={audioPreviewUrl}
                  label="source"
                  onTrimApplied={(newUrl, blob) => {
                    if (uploadAudioRef.current) uploadAudioRef.current.pause();
                    setIsSourcePlaying(false);
                    setAudioPreviewUrl(newUrl);
                    setFile(new File([blob], fileName || 'trimmed.wav', { type: 'audio/wav' }));
                    setCurrentTime(0);
                  }}
                />
              </div>
            )}
          </div>

          {/* Top Right: Processing Settings */}
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 ${!generatedAudioReady ? 'min-h-[380px]' : ''}`}>
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
                <div className="relative">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Processing Mode</label>
                  <button
                    onClick={e => { e.stopPropagation(); setModeOpen(o => !o); }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-[13px] text-slate-800 font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm hover:border-slate-400"
                  >
                    <span>{{ basic: 'Basic', advanced: 'Advanced', deepfilter: 'DeepFilter' }[processingMode]}</span>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${modeOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {modeOpen && (
                    <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden">
                      {[{ id: 'basic', name: 'Basic' }, { id: 'advanced', name: 'Advanced' }, { id: 'deepfilter', name: 'DeepFilter' }].map(m => (
                        <button key={m.id} onClick={e => { e.stopPropagation(); setProcessingMode(m.id); setModeOpen(false); }}
                          className={`w-full px-4 py-3 text-left text-[13px] font-semibold transition-colors duration-150 flex items-center gap-2.5 ${processingMode === m.id ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                          {processingMode === m.id && <Check size={13} className="text-blue-500" strokeWidth={3} />}
                          <span className={processingMode !== m.id ? 'ml-[21px]' : ''}>{m.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Smart Trim */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Smart Trim</p>
                  <p className="text-[11px] text-slate-400">Auto-remove repeated takes</p>
                </div>
                <button onClick={() => setEnableSmartTrim(!enableSmartTrim)}
                  className={`relative w-10 h-[22px] rounded-full transition-all duration-200 ${enableSmartTrim ? 'bg-blue-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${enableSmartTrim ? 'translate-x-[18px]' : 'translate-x-0'}`} />
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

          {/* Bottom Left: Recent Files */}
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 ${!generatedAudioReady ? 'lg:col-span-2' : ''}`}>
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                <FolderOpen size={14} className="text-blue-600" />
              </div>
              <h2 className="text-[15px] font-bold text-slate-900">Recent Files</h2>
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
                  <p className="text-[10px] text-slate-300">Processed audio will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionFiles.map((sf, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-blue-50/60 border-blue-100/40 transition-all duration-200">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-100">
                          <Volume2 size={13} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-slate-700 truncate">{sf.name}</p>
                          <p className="text-[10px] text-slate-400">{timeAgo(sf.timestamp)}</p>
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
                <div ref={exportBoxRef} className="relative flex items-center gap-2">
                  <button
                    onClick={() => setShowExportSettings(!showExportSettings)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-blue-600 bg-white/80 backdrop-blur-sm border border-white/90 shadow-[0_2px_8px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <Download size={12} />
                    Export
                    <ChevronDown size={10} className={`transition-transform duration-200 ${showExportSettings ? 'rotate-180' : ''}`} />
                  </button>

                  {showExportSettings && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-20 p-3.5 space-y-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Format</label>
                        <div className="flex gap-1.5">
                          {['WAV', 'MP3'].map(f => (
                            <button key={f} onClick={() => setSelectedFormat(f)}
                              className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 ${selectedFormat === f ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'}`}
                            >{f}</button>
                          ))}
                        </div>
                      </div>
                      <button onClick={handleConfirmExport}
                        className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[12px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                      >
                        <Download size={11} className="inline mr-1.5 -mt-0.5" />
                        Download {selectedFormat}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5">
                <audio ref={generatedAudioRef} src={processedAudio || undefined}
                  onLoadedMetadata={e => {
                    const dur = e.target.duration;
                    if (isFinite(dur) && dur > 0) {
                      setGenDuration(dur);
                      if (lastProjectUrl === processedAudio) {
                        setSessionFiles(prev => prev.map((sf, i) => i === 0 && sf.url === processedAudio && !sf.duration ? { ...sf, duration: dur } : sf));
                        supabase.from('projects').update({ duration_seconds: dur }).eq('output_url', processedAudio).then(() => {}).catch(console.error);
                        setLastProjectUrl(null);
                      }
                    }
                  }}
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

                {/* Waveform Trim for enhanced audio */}
                <div className="border-t border-dashed border-slate-200/70 mt-1" />
                <WaveformTrimmer
                  audioUrl={processedAudio}
                  label="enhanced"
                  onTrimApplied={(newUrl) => {
                    if (generatedAudioRef.current) generatedAudioRef.current.pause();
                    setIsPlaying(false);
                    setProcessedAudio(newUrl);
                    setGenCurrentTime(0);
                    setGenDuration(0);
                  }}
                />
              </div>
            </div>
          )}
        </div>


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
                  <p>Upload your MP3 or WAV audio file (max 5 min, 50 MB) that you want to enhance.</p>
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
                  <p>Use the Suggestion Box on the landing page to reach us.</p>
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
              {feedbackSent ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">Thanks for your feedback!</p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

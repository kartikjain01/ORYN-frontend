import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Upload, AudioWaveform, FolderOpen, Download, MoreVertical, Check, Type, Palette, Languages, HelpCircle, MessageSquare, Plus, Share, ChevronDown, SkipBack, SkipForward, Volume2, Maximize2, X, RotateCw } from 'lucide-react';
import { createProject, getProjectsByType } from '../lib/db';
import { supabase } from '../supabaseClient';
import { downloadName } from '../lib/api';

const HF_SPACE = import.meta.env.VITE_HF_CAPTION_SPACE || 'https://kartikjain12345-oryn-caption-engine.hf.space';
const API_BASE = import.meta.env.VITE_API_CAPTIONS || '';

const CAPTION_STYLES = [
  { id: 'capcut', name: 'CapCut', preview: 'Clean white text, cinematic feel', color: '#ffffff', demoVideo: null },
  { id: 'hormozi', name: 'Hormozi', preview: 'Bold pop text with emphasis', color: '#3b82f6', demoVideo: null },
  { id: 'minimal', name: 'Minimal', preview: 'Small subtle text', color: '#64748b', demoVideo: null },
  { id: 'podcast', name: 'Podcast', preview: 'Podcast-style captions', color: '#8b5cf6', demoVideo: null },
  { id: 'cinematic_multilayer', name: 'Cinematic', preview: 'Layered cinematic captions', color: '#06b6d4', demoVideo: null },
  { id: 'glass', name: 'Glass', preview: 'Frosted glass with word highlight', color: '#f59e0b', demoVideo: null },
];

const LANGUAGES = [
  { id: 'auto', name: 'Auto Detect' },
  { id: 'english', name: 'English' },
  { id: 'hindi', name: 'Hindi' },
  { id: 'hinglish', name: 'Hinglish' },
];

function VideoPreview({ src, rotation = 0 }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [vidCurrentTime, setVidCurrentTime] = useState(0);
  const [vidDuration, setVidDuration] = useState(0);
  const [videoAspect, setVideoAspect] = useState(16 / 9);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setPlaying(true); }
    else { videoRef.current.pause(); setPlaying(false); }
  };

  const skipBack = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(vidDuration, videoRef.current.currentTime + 5);
  };

  const seekTo = (e) => {
    if (!videoRef.current || !vidDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pct * vidDuration;
  };

  const goFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
    else if (videoRef.current.webkitRequestFullscreen) videoRef.current.webkitRequestFullscreen();
  };

  const fmtTime = secs => {
    if (!secs || isNaN(secs)) return '00:00:00';
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const progress = vidDuration ? (vidCurrentTime / vidDuration) * 100 : 0;

  const handleLoadedMetadata = (e) => {
    const v = e.target;
    if (isFinite(v.duration)) setVidDuration(v.duration);
    if (v.videoWidth && v.videoHeight) {
      setVideoAspect(v.videoWidth / v.videoHeight);
    }
  };

  const isRotatedSideways = rotation === 90 || rotation === 270;
  const effectiveAspect = isRotatedSideways ? (1 / videoAspect) : videoAspect;

  return (
    <div className="flex flex-col">
      <div className="relative w-full rounded-xl overflow-hidden bg-black flex items-center justify-center" style={{ aspectRatio: effectiveAspect < 1 ? '9/16' : '16/9', maxHeight: '420px' }}>
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          style={{ transform: `rotate(${rotation}deg)`, maxWidth: isRotatedSideways ? '56.25%' : '100%', maxHeight: isRotatedSideways ? '177.78%' : '100%' }}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={e => setVidCurrentTime(e.target.currentTime)}
          onEnded={() => setPlaying(false)}
        />
      </div>

      <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200/80 bg-white/60">
        <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-colors">
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>
        <button onClick={skipBack} className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          <SkipBack size={14} />
        </button>
        <button onClick={skipForward} className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          <SkipForward size={14} />
        </button>

        <div className="flex-1 flex flex-col gap-0.5">
          <div onClick={seekTo} className="relative h-[6px] bg-slate-200 rounded-full cursor-pointer group">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${progress}%`, marginLeft: '-6px' }} />
          </div>
          <span className="text-[10px] text-slate-400 tabular-nums">{fmtTime(vidCurrentTime)} / {fmtTime(vidDuration)}</span>
        </div>

        <button className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          <Volume2 size={14} />
        </button>
        <button onClick={goFullscreen} className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function CaptionGenerationPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [captionStyle, setCaptionStyle] = useState('capcut');
  const [language, setLanguage] = useState('auto');
  const [fontSize, setFontSize] = useState(18);
  const [position, setPosition] = useState('bottom');
  const [maxWords, setMaxWords] = useState(6);
  const [rotation, setRotation] = useState(0);

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedCaptions, setGeneratedCaptions] = useState(null);
  const [sessionFiles, setSessionFiles] = useState([]);
  const [sfMenuIdx, setSfMenuIdx] = useState(null);
  const [loadingSf, setLoadingSf] = useState(true);
  const sfMenuRef = useRef(null);

  useEffect(() => {
    getProjectsByType('captions').then(rows => {
      const files = rows.map(r => ({
        id: r.id,
        url: r.output_url,
        name: r.title || 'Caption Output',
        format: r.metadata?.format || 'SRT',
        style: r.metadata?.style || 'Default',
        duration: r.duration_seconds || 0,
        timestamp: new Date(r.created_at).getTime(),
        fromDb: true,
      }));
      setSessionFiles(files);
      setLoadingSf(false);
      files.forEach((f, idx) => {
        if (!f.duration && f.url) {
          const v = document.createElement('video');
          v.preload = 'metadata';
          v.src = f.url;
          v.addEventListener('loadedmetadata', () => {
            if (isFinite(v.duration) && v.duration > 0) {
              setSessionFiles(prev => prev.map((sf, i) => i === idx && sf.id === f.id ? { ...sf, duration: v.duration } : sf));
              supabase.from('projects').update({ duration_seconds: v.duration }).eq('id', f.id).catch(console.error);
            }
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    const handle = (e) => {
      if (sfMenuIdx !== null && sfMenuRef.current && !sfMenuRef.current.contains(e.target)) setSfMenuIdx(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [sfMenuIdx]);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);

  const audioRef = useRef(null);
  const inputRef = useRef(null);

  const [waveHeights] = useState(() => Array.from({ length: 120 }, () => Math.random() * 20 + 6));

  const accepted = '.mp4,.webm,.mov,.mkv,video/mp4,video/webm,video/quicktime';

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

  const MAX_DURATION = 120;

  const validateAndSetFile = (f) => {
    const url = URL.createObjectURL(f);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.src = url;
    v.onloadedmetadata = () => {
      if (isFinite(v.duration) && v.duration > MAX_DURATION) {
        alert(`Video is too long (${Math.floor(v.duration / 60)}m ${Math.round(v.duration % 60)}s). Maximum allowed is 2 minutes.`);
        URL.revokeObjectURL(url);
        return;
      }
      setFile(f);
      setFileName(f.name);
      setAudioPreviewUrl(url);
      setGeneratedCaptions(null);
      setRotation(0);
    };
  };

  const onFileChange = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    validateAndSetFile(f);
  };

  const onDrop = e => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    validateAndSetFile(f);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) { audioRef.current.play(); setIsPlaying(true); }
    else { audioRef.current.pause(); setIsPlaying(false); }
  };

  const handleNewCaption = () => {
    setFile(null);
    setFileName('');
    setAudioPreviewUrl('');
    setGeneratedCaptions(null);
    setGenerating(false);
    setProgress(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleSfPlay = (sf) => { if (sf.url) window.open(sf.url, '_blank'); setSfMenuIdx(null); };

  const handleSfDownload = async (sf) => {
    if (!sf.url) return;
    try {
      const res = await fetch(sf.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName('captions', sf.name, 'mp4');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    setSfMenuIdx(null);
  };


  const generateCaptions = async () => {
    if (!file) return;
    setGenerating(true);
    setProgress(0);

    try {
      const spaceUrl = HF_SPACE.replace(/\/$/, '');

      // Step 1: Upload file to Gradio
      setProgress(5);
      console.log('Uploading to HF Space:', spaceUrl, 'file:', file?.name, file?.size);
      const uploadForm = new FormData();
      uploadForm.append('files', file);
      const uploadRes = await fetch(`${spaceUrl}/gradio_api/upload`, {
        method: 'POST',
        body: uploadForm,
      });
      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
      const uploadedFiles = await uploadRes.json();
      console.log('Uploaded:', uploadedFiles);

      // Step 2: Submit job
      setProgress(10);
      const submitRes = await fetch(`${spaceUrl}/gradio_api/call/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            { video: { path: uploadedFiles[0], meta: { _type: 'gradio.FileData' } } },
            captionStyle,
            language,
            position,
            fontSize,
            maxWords,
          ],
        }),
      });
      if (!submitRes.ok) {
        const errText = await submitRes.text();
        console.error('Submit error:', errText);
        throw new Error(`Submit failed: ${submitRes.status} - ${errText}`);
      }
      const { event_id } = await submitRes.json();
      console.log('Job submitted, event_id:', event_id);

      // Step 3: Stream results via SSE
      setProgress(15);
      const resultData = await new Promise((resolve, reject) => {
        const es = new EventSource(`${spaceUrl}/gradio_api/call/generate/${event_id}`);
        let settled = false;
        const done = (fn) => { if (!settled) { settled = true; es.close(); fn(); } };

        es.addEventListener('complete', (e) => {
          try {
            const data = JSON.parse(e.data);
            console.log('Complete:', data);
            done(() => resolve(data));
          } catch {
            done(() => reject(new Error('Invalid response from server')));
          }
        });
        es.addEventListener('error', (e) => {
          let msg = 'Server processing failed';
          try {
            const data = JSON.parse(e.data);
            console.error('Server error:', data);
            if (typeof data === 'string') msg = data;
          } catch { /* no parseable data */ }
          done(() => reject(new Error(msg)));
        });
        es.addEventListener('progress', () => {
          setProgress(prev => Math.min(prev + 5, 85));
        });
        es.addEventListener('heartbeat', () => {
          setProgress(prev => Math.min(prev + 1, 85));
        });
        es.onerror = () => {
          done(() => reject(new Error('Connection to caption server lost')));
        };
      });

      setProgress(95);
      console.log('Full result:', JSON.stringify(resultData));

      const [videoResult, metadata] = resultData;

      if (metadata?.error) {
        const errMsg = metadata.error === 'no_speech' ? 'No speech was detected in the video.'
          : metadata.error === 'no_captions' ? 'Could not generate captions from the audio.'
          : metadata.message || metadata.error;
        throw new Error(errMsg);
      }

      let videoUrl = metadata?.supabase_url || '';
      if (!videoUrl) {
        const rawUrl = videoResult?.video?.url || videoResult?.url || videoResult?.video?.path || videoResult?.path || (typeof videoResult === 'string' ? videoResult : '');
        if (rawUrl.startsWith('http')) videoUrl = rawUrl;
        else if (rawUrl.startsWith('/')) videoUrl = `${spaceUrl}${rawUrl}`;
        else if (rawUrl) videoUrl = `${spaceUrl}/gradio_api/file=${rawUrl}`;
      }

      if (!videoUrl) throw new Error('No output video was returned');

      setProgress(100);

      setGeneratedCaptions({
        videoUrl,
        language: metadata.language,
        words: metadata.total_words,
        captions: metadata.total_captions,
        duration: metadata.duration,
        processingTime: metadata.processing_time_seconds,
        template: captionStyle,
      });
      setSessionFiles(prev => [{
        name: fileName,
        format: 'MP4',
        style: captionStyle,
        duration: metadata.duration || 0,
        timestamp: Date.now(),
        videoUrl,
      }, ...prev]);
      createProject({ title: fileName || 'Caption Output', type: 'captions', outputUrl: videoUrl, durationSeconds: metadata.duration || 0, metadata: { style: captionStyle, language: metadata.language, words: metadata.total_words, captions: metadata.total_captions } }).catch(console.error);
    } catch (err) {
      console.error('Caption generation error:', err);
      const msg = err.message || '';
      if (msg.includes('No speech') || msg.includes('no_speech')) {
        alert('No speech was detected in the video. Please upload a video with audible speech.');
      } else if (msg.includes('401') || msg.includes('could not be accessed')) {
        alert('Caption server is temporarily unavailable. Please try again later.');
      } else if (msg.includes('GPU') || msg.includes('queue')) {
        alert('Server is busy. Please wait a moment and try again.');
      } else if (msg.includes('Connection') || msg.includes('lost')) {
        alert('Lost connection to the caption server. Please try again.');
      } else {
        alert(msg || 'Caption generation failed. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (format) => {
    if (!generatedCaptions) return;

    const videoUrl = generatedCaptions.videoUrl;
    if (!videoUrl) {
      alert('No output video available');
      setShowExportMenu(false);
      return;
    }

    try {
      const res = await fetch(videoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName('captions', fileName, format === 'MP4' ? 'mp4' : 'ass');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = downloadName('captions', fileName, 'mp4');
      a.click();
    }
    setShowExportMenu(false);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) { alert('Please write feedback'); return; }
    alert('Thanks for your feedback!');
    setFeedbackText(''); setFeedbackRating(5); setShowFeedbackModal(false);
  };

  const fontSizePercent = ((fontSize - 12) / (48 - 12)) * 100;
  const maxWordsPercent = ((maxWords - 1) / (10 - 1)) * 100;

  const currentStep = !file ? 1 : !generatedCaptions ? (generating ? 3 : 2) : 4;

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="relative min-h-full p-6 lg:p-8 space-y-5 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)' }}>
        {/* Floating orbs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-300/20 blur-[80px] animate-breathe" />
        <div className="pointer-events-none absolute top-[60%] -left-32 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-200/25 to-indigo-200/15 blur-[70px] animate-breathe" style={{ animationDelay: '1.2s' }} />
        <div className="pointer-events-none absolute bottom-0 right-[20%] w-[250px] h-[250px] rounded-full bg-gradient-to-t from-blue-100/20 to-indigo-100/10 blur-[60px] animate-breathe" style={{ animationDelay: '2.5s' }} />

        {/* Heading with Help & Feedback */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">Caption Generation</h1>
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

        {/* Progress Stepper */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.6)_inset] px-6 py-4 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 0.5px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="flex items-center justify-between flex-1">
            {[
              { n: 1, label: 'Upload audio' },
              { n: 2, label: 'Configure style' },
              { n: 3, label: 'Generate' },
              { n: 4, label: 'Export' },
            ].map((step, idx) => {
              const isCurrent = currentStep === step.n;
              const isDone = currentStep > step.n;
              return (
                <div key={step.n} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300 ${
                      isDone ? 'bg-emerald-100 text-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : isCurrent ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)]'
                        : 'bg-slate-100/80 text-slate-400'
                    }`}>
                      {isDone ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : step.n}
                    </div>
                    <span className={`text-[13px] font-medium whitespace-nowrap transition-colors ${isDone ? 'text-emerald-700' : isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</span>
                  </div>
                  {idx < 3 && <div className={`flex-1 h-[2px] rounded-full mx-3 transition-colors duration-500 ${isDone ? 'bg-emerald-300' : 'bg-slate-200/60'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Audio Source + Generated Captions stacked */}
          <div className="flex flex-col gap-5">
          <div className={`relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 ${!generatedCaptions ? 'flex-1 flex flex-col' : ''}`}>
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
            <div className={`px-5 pt-5 ${generatedCaptions ? 'pb-0' : 'pb-3'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                    <AudioWaveform size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Audio Source</h2>
                    {file && <p className="text-[11px] text-blue-500 font-medium">{fileName}</p>}
                  </div>
                </div>
                {generatedCaptions && (
                  <button onClick={handleNewCaption} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-blue-600 bg-blue-50/80 border border-blue-200/60 hover:bg-blue-100/80 hover:-translate-y-0.5 transition-all duration-200">
                    <Plus size={12} />
                    New Caption
                  </button>
                )}
              </div>
            </div>

            {!generatedCaptions && (
              <div className="px-5 pb-5 flex-1 flex flex-col">
                <div onDrop={onDrop} onDragOver={e => e.preventDefault()} onClick={() => inputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group flex-1 ${file ? 'border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-4' : 'border-slate-200/80 hover:border-blue-300/80 hover:bg-gradient-to-br hover:from-blue-50/40 hover:to-violet-50/20 p-8'}`}>
                  <input type="file" accept={accepted} ref={inputRef} onChange={onFileChange} className="hidden" />
                  {fileName ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
                        <AudioWaveform size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-900">{fileName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
                        <Upload size={22} className="text-blue-500" />
                      </div>
                      <p className="text-[13px] font-semibold text-slate-700">Drop audio/video here or <span className="text-blue-600">browse</span></p>
                      <p className="text-[11px] text-slate-400 mt-1">MP4, WebM, MOV supported (video only)</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Audio Player */}
            {file && audioPreviewUrl && (
              <div className="mx-5 mb-5 bg-gradient-to-r from-slate-50/80 to-blue-50/40 backdrop-blur-sm rounded-xl px-3 py-2.5 flex items-center gap-2.5 border border-slate-100/60">
                <button onClick={togglePlay} className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)] hover:scale-105 transition-all duration-200 shrink-0">
                  {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[2px] h-6 overflow-hidden">
                    {waveHeights.map((h, i) => {
                      const prog = duration ? Math.min(currentTime / duration, 1) : 0;
                      const active = i / waveHeights.length < prog;
                      const hue = 210 + (i / waveHeights.length) * 50;
                      return (
                        <div key={i} onClick={() => { if (!audioRef.current || !duration) return; audioRef.current.currentTime = (i / waveHeights.length) * duration; setCurrentTime((i / waveHeights.length) * duration); }}
                          className={`rounded-full cursor-pointer transition-all duration-150 ${active ? '' : 'bg-slate-300/60'}`}
                          style={{ width: '2px', height: `${h * 0.85}px`, ...(active ? { background: `hsl(${hue}, 65%, 52%)`, boxShadow: `0 0 4px hsla(${hue}, 65%, 52%, 0.3)` } : {}) }}
                        />
                      );
                    })}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tabular-nums shrink-0">{formatTime(currentTime)}/{formatTime(duration)}</span>
                <audio ref={audioRef} src={audioPreviewUrl}
                  onLoadedMetadata={e => { if (isFinite(e.target.duration)) setDuration(e.target.duration); }}
                  onTimeUpdate={e => { setCurrentTime(e.target.currentTime); if (isFinite(e.target.duration) && e.target.duration > 0 && duration === 0) setDuration(e.target.duration); }}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>

          {/* Preview - shows input video initially, swaps to output when generated */}
          {file && (
              <div className="relative flex-1 flex flex-col bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300">
                <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80" />
                <div className="px-5 pt-5 pb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-[17px] font-bold text-slate-900">Preview</h2>
                    <p className="text-[12px] text-slate-500 mt-0.5">{fileName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!generatedCaptions && (
                      <button onClick={() => setRotation(r => (r + 90) % 360)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50/60 border border-slate-200/60 transition-all" title="Rotate 90°">
                        <RotateCw size={14} />
                      </button>
                    )}
                  {generatedCaptions && (
                    <div className="relative">
                      <button onClick={() => setShowExportMenu(!showExportMenu)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all duration-200">
                        <Download size={12} />
                        Export
                      </button>
                      {showExportMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                          <div className="absolute right-0 top-full mt-1.5 z-50 w-36 bg-white rounded-xl border border-slate-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden">
                            {['MP4', 'ASS'].map(fmt => (
                              <button key={fmt} onClick={() => handleExport(fmt)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-slate-700 hover:bg-blue-50/60 hover:text-blue-700 transition-all">
                                <Download size={12} />
                                Download .{fmt.toLowerCase()}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  </div>
                </div>

                <div className="px-5 pb-5 flex-1 flex flex-col">
                  <VideoPreview src={generatedCaptions ? generatedCaptions.videoUrl : audioPreviewUrl} rotation={generatedCaptions ? 0 : rotation} />

                  {generatedCaptions && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      {[
                        { label: 'Language', value: generatedCaptions.language?.toUpperCase() },
                        { label: 'Words', value: generatedCaptions.words },
                        { label: 'Captions', value: generatedCaptions.captions },
                        { label: 'Duration', value: `${generatedCaptions.duration?.toFixed(1)}s` },
                      ].map(stat => (
                        <span key={stat.label} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-100/60 text-[11px] text-slate-500">
                          <span className="font-bold text-slate-700">{stat.value}</span> {stat.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
          )}
          </div>

          {/* Right Column: Settings + Recent Files stacked */}
          <div className="flex flex-col gap-5">
          <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300 max-h-[520px] flex flex-col overflow-hidden">
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 opacity-80 z-20" />
            <div className="px-5 pt-5 pb-3 border-b border-slate-100/60 flex items-center gap-3 bg-white/70 backdrop-blur-xl z-10 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40 flex items-center justify-center">
                <Palette size={14} className="text-blue-600" />
              </div>
              <h2 className="text-[15px] font-bold text-slate-900">Settings & Styles</h2>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Caption Style Grid */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2.5 block">Caption Style</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {CAPTION_STYLES.map(style => (
                    <button key={style.id} onClick={() => setCaptionStyle(style.id)}
                      className={`group/card relative flex flex-col rounded-xl text-left transition-all duration-200 ${captionStyle === style.id ? 'ring-[1.5px] ring-blue-400' : 'ring-1 ring-slate-200/60 bg-white/60 hover:ring-blue-200/60 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]'}`}>
                      <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-xl bg-slate-50/80">
                        {style.demoVideo ? (
                          <video src={style.demoVideo} muted loop autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                            <div className="w-8 h-8 rounded-full bg-white/90 border border-slate-200/60 flex items-center justify-center shadow-sm">
                              <Play size={12} className="text-slate-500 ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="px-2.5 py-2">
                        <span className="text-[11px] font-semibold text-slate-800">{style.name}</span>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{style.preview}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Languages size={11} /> Language
                </label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full bg-slate-50/60 backdrop-blur-sm border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-[12px] text-slate-700 font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50 transition-all duration-200 appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                  {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              {/* Font Size Slider */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Font Size</label>
                <div className="relative h-6 flex items-center">
                  <div className="absolute inset-x-0 h-[5px] rounded-full bg-slate-200/80" />
                  <div className="absolute left-0 h-[5px] rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${fontSizePercent}%` }} />
                  <div className="absolute w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_2px_8px_rgba(37,99,235,0.4)] flex items-center justify-center -translate-x-1/2" style={{ left: `${fontSizePercent}%` }}>
                    <span className="text-[8px] font-bold text-white">{fontSize}</span>
                  </div>
                  <input type="range" min={12} max={48} step={1} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              {/* Max Words Per Line */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Max Words Per Line</label>
                <div className="relative h-6 flex items-center">
                  <div className="absolute inset-x-0 h-[5px] rounded-full bg-slate-200/80" />
                  <div className="absolute left-0 h-[5px] rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${maxWordsPercent}%` }} />
                  <div className="absolute w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_2px_8px_rgba(37,99,235,0.4)] flex items-center justify-center -translate-x-1/2" style={{ left: `${maxWordsPercent}%` }}>
                    <span className="text-[8px] font-bold text-white">{maxWords}</span>
                  </div>
                  <input type="range" min={1} max={10} step={1} value={maxWords} onChange={e => setMaxWords(+e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {['top', 'center', 'bottom'].map(pos => (
                    <button key={pos} onClick={() => setPosition(pos)}
                      className={`py-2 rounded-lg text-[11px] font-semibold border capitalize transition-all ${position === pos ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200/60 text-blue-700' : 'border-slate-200/60 bg-white/60 text-slate-600 hover:border-blue-200/60'}`}>
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Generate Button */}
            <div className="px-5 py-4 border-t border-slate-100/60 bg-white/80 backdrop-blur-xl shrink-0">
              <button
                onClick={generateCaptions}
                disabled={generating || !file || !!generatedCaptions}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[13px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Generating... {Math.round(progress)}%
                  </span>
                ) : generatedCaptions ? 'Generated' : 'Generate Captions'}
              </button>

              {generating && (
                <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden mt-2.5">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Recent Files - below Settings (right column) when file is selected */}
          {file && (
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300">
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
                      <p className="text-[10px] text-slate-300">Generated captions will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessionFiles.map((sf, idx) => (
                        <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-blue-50/60 border-blue-100/40 transition-all duration-200">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                              <Type size={13} className="text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12px] font-semibold text-slate-700 truncate">{sf.name} <span className="text-slate-400 font-normal">· {sf.format || 'SRT'} · {sf.style || 'Default'}</span></p>
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
          )}
          </div>

          {/* No file selected: Recent Files full width */}
          {!file && (
            <div className="lg:col-span-2 relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(37,99,235,0.08)] transition-all duration-300">
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
                    <p className="text-[10px] text-slate-300">Generated captions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessionFiles.map((sf, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-blue-50/60 border-blue-100/40 transition-all duration-200">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                            <Type size={13} className="text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-slate-700 truncate">{sf.name} <span className="text-slate-400 font-normal">· {sf.format || 'SRT'} · {sf.style || 'Default'}</span></p>
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
                  <p className="font-semibold text-slate-800 mb-1">1. Upload Video</p>
                  <p>Upload your video file (MP4, WebM, MOV). The audio will be extracted for captioning.</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/60">
                  <p className="font-semibold text-slate-800 mb-1">2. Configure Style</p>
                  <p>Choose a caption style, set language, font size, max words per line, and position.</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/60">
                  <p className="font-semibold text-slate-800 mb-1">3. Generate & Export</p>
                  <p>Click "Generate Captions" and wait for processing. Export as MP4 with burned-in captions or ASS subtitle file.</p>
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
              <p className="text-[13px] text-slate-400 mb-5">Tell us about your experience with Caption Generation</p>
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

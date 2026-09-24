import { useCallback, useEffect, useRef, useState } from 'react';
import { Scissors, Play, Pause, Check, X, RotateCcw, Trash2 } from 'lucide-react';

export default function WaveformTrimmer({ audioUrl, onTrimApplied }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const bufferRef = useRef(null);
  const sourceRef = useRef(null);
  const animRef = useRef(null);
  const playStartRef = useRef(0);
  const seekOffsetRef = useRef(0);

  const [trimMode, setTrimMode] = useState(false);
  const [waveData, setWaveData] = useState(null);
  const [duration, setDuration] = useState(0);
  const [regions, setRegions] = useState([]);
  const [activeRegion, setActiveRegion] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [drawingNew, setDrawingNew] = useState(false);
  const [draggingPlayhead, setDraggingPlayhead] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playheadPos, setPlayheadPos] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  useEffect(() => {
    if (!audioUrl) return;
    setTrimMode(false);
    setRegions([]);
    setActiveRegion(null);
    setPlaying(false);
    setPlayheadPos(0);
    setCurrentTimeSec(0);

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    fetch(audioUrl)
      .then(r => r.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(decoded => {
        bufferRef.current = decoded;
        setDuration(decoded.duration);

        const raw = decoded.getChannelData(0);
        const buckets = 250;
        const perBucket = Math.floor(raw.length / buckets);
        const peaks = [];
        for (let i = 0; i < buckets; i++) {
          let max = 0;
          for (let j = 0; j < perBucket; j++) {
            const v = Math.abs(raw[i * perBucket + j]);
            if (v > max) max = v;
          }
          peaks.push(max);
        }
        const peakMax = Math.max(...peaks, 0.01);
        setWaveData(peaks.map(p => p / peakMax));
      })
      .catch(() => {});

    return () => { ctx.close().catch(() => {}); };
  }, [audioUrl]);

  const isInCutRegion = useCallback((pos) => {
    return regions.some(r => pos >= Math.min(r.start, r.end) && pos <= Math.max(r.start, r.end));
  }, [regions]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveData) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    const trackH = trimMode ? 14 : 0; // top zone for playhead bob
    const timeH = 16;  // bottom zone for time markers
    const waveH = h - trackH - timeH;

    ctx.clearRect(0, 0, w, h);

    // Playhead track background (top strip)
    if (trimMode) {
      ctx.fillStyle = 'rgba(241, 245, 249, 0.5)';
      ctx.fillRect(0, 0, w, trackH);
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, trackH);
      ctx.lineTo(w, trackH);
      ctx.stroke();
    }

    // Time markers background
    ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';
    ctx.fillRect(0, h - timeH, w, timeH);
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, h - timeH);
    ctx.lineTo(w, h - timeH);
    ctx.stroke();

    // Draw time markers
    const numMarkers = Math.min(Math.floor(duration / 5) + 1, 12);
    const interval = duration / numMarkers;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= numMarkers; i++) {
      const t = i * interval;
      const x = (t / duration) * w;
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      ctx.fillText(`${m}:${s.toString().padStart(2, '0')}`, x, h - 4);

      ctx.strokeStyle = 'rgba(203, 213, 225, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x, trackH);
      ctx.lineTo(x, h - timeH);
      ctx.stroke();
    }

    // Draw waveform bars
    const barW = Math.max(2, (w / waveData.length) - 1);
    const gap = (w - barW * waveData.length) / waveData.length;

    waveData.forEach((peak, i) => {
      const x = i * (barW + gap);
      const pos = i / waveData.length;
      const barH = Math.max(2, peak * (waveH - 8));
      const y = trackH + (waveH - barH) / 2;

      if (trimMode && isInCutRegion(pos)) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      } else {
        const isPlayed = playheadPos > 0 && pos <= playheadPos;
        const hue = 210 + pos * 50;
        if (isPlayed) {
          ctx.fillStyle = `hsl(${hue}, 70%, 48%)`;
        } else {
          ctx.fillStyle = trimMode ? `hsl(${hue}, 65%, 52%)` : `hsl(${hue}, 45%, 72%)`;
        }
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 1);
      ctx.fill();
    });

    // Draw cut regions
    if (trimMode) {
      regions.forEach((r, idx) => {
        const s = Math.min(r.start, r.end) * w;
        const e = Math.max(r.start, r.end) * w;

        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.fillRect(s, trackH, e - s, waveH);

        ctx.strokeStyle = idx === activeRegion ? '#dc2626' : '#ef4444';
        ctx.lineWidth = idx === activeRegion ? 2 : 1;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(s, trackH, e - s, waveH);
        ctx.setLineDash([]);

        [s, e].forEach(x => {
          ctx.fillStyle = idx === activeRegion ? '#dc2626' : '#ef4444';
          ctx.fillRect(x - 1, trackH, 2, waveH);

          const midY = trackH + waveH / 2;
          ctx.beginPath();
          ctx.roundRect(x - 5, midY - 8, 10, 16, 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillRect(x - 1.5, midY - 3, 1, 6);
          ctx.fillRect(x + 0.5, midY - 3, 1, 6);
        });
      });
    }

    // Draw playhead
    if (playheadPos >= 0 && playheadPos <= 1 && trimMode) {
      const px = playheadPos * w;
      ctx.fillStyle = '#2563eb';
      // Line through waveform zone only
      ctx.fillRect(px - 1, trackH, 2, waveH);
      // Circle bob in the top track zone (above waveform, no interference with trim)
      ctx.beginPath();
      ctx.arc(px, trackH / 2, 5, 0, Math.PI * 2);
      ctx.fill();
      // Small stem connecting bob to line
      ctx.fillRect(px - 0.5, trackH / 2 + 5, 1, trackH / 2 - 5);
    }
  }, [waveData, trimMode, regions, activeRegion, isInCutRegion, playheadPos, duration]);

  useEffect(() => { drawWaveform(); }, [drawWaveform]);

  const getPos = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const findHandle = useCallback((pos) => {
    const threshold = 0.015;
    for (let i = 0; i < regions.length; i++) {
      const r = regions[i];
      const s = Math.min(r.start, r.end);
      const e = Math.max(r.start, r.end);
      if (Math.abs(pos - s) < threshold) return { region: i, handle: 'start' };
      if (Math.abs(pos - e) < threshold) return { region: i, handle: 'end' };
      if (pos > s && pos < e) return { region: i, handle: 'move' };
    }
    return null;
  }, [regions]);

  const stopPlayback = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current = null;
    }
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setPlaying(false);
  }, []);

  const onPointerDown = useCallback((e) => {
    if (!trimMode) return;
    const pos = getPos(e);
    const rect = containerRef.current?.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const yInCanvas = rect ? clientY - rect.top : 999;

    // If clicking near the playhead bob in the top track, drag it (won't interfere with trim)
    if (yInCanvas < 14 && Math.abs(pos - playheadPos) < 0.025) {
      stopPlayback();
      setDraggingPlayhead(true);
      return;
    }

    const hit = findHandle(pos);

    if (hit) {
      setActiveRegion(hit.region);
      setDragging(hit);
    } else {
      const newIdx = regions.length;
      setRegions(prev => [...prev, { start: pos, end: pos }]);
      setActiveRegion(newIdx);
      setDragging({ region: newIdx, handle: 'end' });
      setDrawingNew(true);
    }
  }, [trimMode, getPos, findHandle, regions.length, playheadPos, stopPlayback]);

  const onPointerMove = useCallback((e) => {
    if (draggingPlayhead) {
      e.preventDefault();
      const pos = getPos(e);
      setPlayheadPos(pos);
      setCurrentTimeSec(pos * duration);
      return;
    }
    if (!dragging) return;
    e.preventDefault();
    const pos = getPos(e);
    const { region: idx, handle } = dragging;

    setRegions(prev => {
      const updated = [...prev];
      if (!updated[idx]) return prev;
      const r = { ...updated[idx] };

      if (handle === 'start') {
        r.start = Math.min(pos, Math.max(r.start, r.end) - 0.005);
      } else if (handle === 'end') {
        r.end = pos;
      } else if (handle === 'move') {
        const width = Math.abs(r.end - r.start);
        let newStart = pos - width / 2;
        let newEnd = pos + width / 2;
        if (newStart < 0) { newStart = 0; newEnd = width; }
        if (newEnd > 1) { newEnd = 1; newStart = 1 - width; }
        r.start = newStart;
        r.end = newEnd;
      }

      updated[idx] = r;
      return updated;
    });
  }, [dragging, draggingPlayhead, getPos, duration]);

  const onPointerUp = useCallback(() => {
    if (draggingPlayhead) {
      setDraggingPlayhead(false);
      return;
    }
    if (drawingNew && dragging) {
      setRegions(prev => {
        const updated = [...prev];
        const r = updated[dragging.region];
        if (r && Math.abs(r.end - r.start) < 0.005) {
          updated.splice(dragging.region, 1);
          setActiveRegion(null);
        } else if (r) {
          updated[dragging.region] = {
            start: Math.min(r.start, r.end),
            end: Math.max(r.start, r.end),
          };
        }
        return updated;
      });
    }
    setDragging(null);
    setDrawingNew(false);
  }, [drawingNew, dragging, draggingPlayhead]);

  useEffect(() => {
    if (!dragging && !draggingPlayhead) return;
    const move = (e) => onPointerMove(e);
    const up = () => onPointerUp();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, draggingPlayhead, onPointerMove, onPointerUp]);

  const playFrom = useCallback((startPos = 0) => {
    if (!bufferRef.current || !audioCtxRef.current) return;
    stopPlayback();

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const buf = bufferRef.current;

    if (regions.length === 0) {
      // No regions — play full audio from startPos
      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.connect(ctx.destination);

      const startSec = startPos * duration;
      source.start(0, startSec);
      sourceRef.current = source;
      playStartRef.current = ctx.currentTime;
      seekOffsetRef.current = startSec;
      setPlaying(true);

      const animate = () => {
        const elapsed = ctx.currentTime - playStartRef.current;
        const pos = (seekOffsetRef.current + elapsed) / duration;
        if (pos >= 1) { stopPlayback(); setPlayheadPos(1); setCurrentTimeSec(duration); return; }
        setPlayheadPos(pos);
        setCurrentTimeSec(seekOffsetRef.current + elapsed);
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
      source.onended = () => { stopPlayback(); };
    } else {
      // With regions — play skipping cut sections
      const sr = buf.sampleRate;
      const sorted = regions
        .map(r => ({ start: Math.min(r.start, r.end), end: Math.max(r.start, r.end) }))
        .sort((a, b) => a.start - b.start);

      const keepRanges = [];
      let cursor = 0;
      for (const r of sorted) {
        if (cursor < r.start) keepRanges.push({ start: cursor, end: r.start });
        cursor = Math.max(cursor, r.end);
      }
      if (cursor < 1) keepRanges.push({ start: cursor, end: 1 });

      if (keepRanges.length === 0) return;

      let totalSamples = 0;
      const sampleRanges = keepRanges.map(r => {
        const s = Math.floor(r.start * buf.length);
        const e = Math.floor(r.end * buf.length);
        const len = e - s;
        totalSamples += len;
        return { s, e, len, startNorm: r.start, endNorm: r.end };
      });

      if (totalSamples === 0) return;

      const newBuf = ctx.createBuffer(buf.numberOfChannels, totalSamples, sr);
      let offset = 0;
      const segments = [];
      for (const range of sampleRanges) {
        segments.push({ bufOffset: offset, normStart: range.startNorm, normEnd: range.endNorm, samples: range.len });
        for (let ch = 0; ch < buf.numberOfChannels; ch++) {
          const src = buf.getChannelData(ch);
          const dst = newBuf.getChannelData(ch);
          for (let i = 0; i < range.len; i++) dst[offset + i] = src[range.s + i];
        }
        offset += range.len;
      }

      // Find starting sample offset if startPos > 0
      let skipSamples = 0;
      if (startPos > 0) {
        for (const seg of segments) {
          if (startPos >= seg.normStart && startPos <= seg.normEnd) {
            const frac = (startPos - seg.normStart) / (seg.normEnd - seg.normStart);
            skipSamples += Math.floor(frac * seg.samples);
            break;
          } else if (startPos > seg.normEnd) {
            skipSamples += seg.samples;
          }
        }
      }

      const startTimeSec = skipSamples / sr;
      const source = ctx.createBufferSource();
      source.buffer = newBuf;
      source.connect(ctx.destination);
      source.start(0, startTimeSec);
      sourceRef.current = source;
      playStartRef.current = ctx.currentTime;
      seekOffsetRef.current = startTimeSec;
      setPlaying(true);

      const totalDur = totalSamples / sr;

      const animate = () => {
        const elapsed = ctx.currentTime - playStartRef.current + seekOffsetRef.current;
        if (elapsed >= totalDur) { stopPlayback(); return; }

        let samplePos = Math.floor(elapsed * sr);
        let normPos = 0;
        let accTime = 0;
        for (const seg of segments) {
          if (samplePos < seg.samples) {
            const frac = samplePos / seg.samples;
            normPos = seg.normStart + frac * (seg.normEnd - seg.normStart);
            accTime += samplePos / sr;
            break;
          }
          samplePos -= seg.samples;
          normPos = seg.normEnd;
          accTime += seg.samples / sr;
        }
        setPlayheadPos(normPos);
        setCurrentTimeSec(normPos * duration);
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
      source.onended = () => { stopPlayback(); };
    }
  }, [stopPlayback, regions, duration]);

  const togglePlay = useCallback(() => {
    if (playing) { stopPlayback(); return; }
    playFrom(playheadPos > 0 && playheadPos < 0.99 ? playheadPos : 0);
  }, [playing, stopPlayback, playFrom, playheadPos]);

  const onWaveformClick = useCallback((e) => {
    if (dragging || drawingNew) return;
    if (!trimMode) return;
    const pos = getPos(e);
    const hit = findHandle(pos);
    if (!hit) {
      stopPlayback();
      setPlayheadPos(pos);
      setCurrentTimeSec(pos * duration);
    }
  }, [trimMode, dragging, drawingNew, getPos, findHandle, stopPlayback, duration]);

  const applyTrim = useCallback(() => {
    if (!bufferRef.current || regions.length === 0) return;
    const buf = bufferRef.current;
    const sr = buf.sampleRate;

    const sorted = regions
      .map(r => ({ start: Math.min(r.start, r.end), end: Math.max(r.start, r.end) }))
      .sort((a, b) => a.start - b.start);

    const keepRanges = [];
    let cursor = 0;
    for (const r of sorted) {
      if (cursor < r.start) keepRanges.push({ start: cursor, end: r.start });
      cursor = Math.max(cursor, r.end);
    }
    if (cursor < 1) keepRanges.push({ start: cursor, end: 1 });

    let totalSamples = 0;
    const sampleRanges = keepRanges.map(r => {
      const s = Math.floor(r.start * buf.length);
      const e = Math.floor(r.end * buf.length);
      totalSamples += (e - s);
      return { s, e };
    });

    if (totalSamples === 0) return;

    const newBuf = audioCtxRef.current.createBuffer(buf.numberOfChannels, totalSamples, sr);
    let offset = 0;
    for (const range of sampleRanges) {
      const len = range.e - range.s;
      for (let ch = 0; ch < buf.numberOfChannels; ch++) {
        const src = buf.getChannelData(ch);
        const dst = newBuf.getChannelData(ch);
        for (let i = 0; i < len; i++) dst[offset + i] = src[range.s + i];
      }
      offset += len;
    }

    const wavBlob = bufferToWav(newBuf);
    const url = URL.createObjectURL(wavBlob);

    stopPlayback();
    setTrimMode(false);
    setRegions([]);
    setActiveRegion(null);
    setPlayheadPos(0);
    setCurrentTimeSec(0);

    if (onTrimApplied) onTrimApplied(url, wavBlob);
  }, [regions, stopPlayback, onTrimApplied]);

  const removeRegion = useCallback((idx) => {
    setRegions(prev => prev.filter((_, i) => i !== idx));
    if (activeRegion === idx) setActiveRegion(null);
    else if (activeRegion > idx) setActiveRegion(prev => prev - 1);
  }, [activeRegion]);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${m}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  if (!audioUrl || !waveData) return null;

  const totalCutDur = regions.reduce((sum, r) => {
    return sum + Math.abs(r.end - r.start) * duration;
  }, 0);

  return (
    <div className="mt-2">
      {!trimMode ? (
        <button
          onClick={() => setTrimMode(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-red-600 bg-gradient-to-b from-red-50 to-red-100/80 border border-red-200/70 shadow-[0_2px_6px_rgba(239,68,68,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(239,68,68,0.15)] transition-all duration-200"
        >
          <Scissors size={12} />
          Trim Audio
        </button>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors size={12} className="text-blue-600" />
              <span className="text-[11px] font-semibold text-blue-600">Trim Mode</span>
              <span className="text-[10px] text-slate-400">Play to find, then drag to mark sections to cut</span>
            </div>
            <button onClick={() => { stopPlayback(); setTrimMode(false); setRegions([]); setActiveRegion(null); setPlayheadPos(0); }} className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Exit trim">
              <X size={13} />
            </button>
          </div>

          {/* Waveform with time markers */}
          <div
            ref={containerRef}
            className="relative cursor-crosshair select-none rounded-lg overflow-hidden bg-slate-50/40 border border-slate-100/60"
            onMouseDown={onPointerDown}
            onTouchStart={onPointerDown}
            onMouseUp={onWaveformClick}
          >
            <canvas ref={canvasRef} className="w-full" style={{ height: trimMode ? '102px' : '88px' }} />
          </div>

          {/* Current time + play controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_3px_10px_rgba(37,99,235,0.3)] hover:scale-105 transition-all duration-200 shrink-0"
            >
              {playing ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
            </button>
            <div className="flex-1 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-600 tabular-nums">
                {fmt(currentTimeSec)} <span className="text-slate-300">/</span> {fmt(duration)}
              </span>
              {regions.length > 0 && (
                <span className="text-[10px] text-slate-400">
                  Cutting <span className="text-red-500 font-semibold">{fmt(totalCutDur)}</span> · Keeping <span className="text-emerald-600 font-semibold">{fmt(duration - totalCutDur)}</span>
                </span>
              )}
            </div>
          </div>

          {/* Cut region chips */}
          {regions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {regions.map((r, idx) => {
                const s = Math.min(r.start, r.end) * duration;
                const e = Math.max(r.start, r.end) * duration;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveRegion(idx)}
                    className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-[10px] font-medium cursor-pointer transition-all ${
                      activeRegion === idx
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-red-200'
                    }`}
                  >
                    <span className="font-mono">{fmt(s)} → {fmt(e)}</span>
                    <button
                      onClick={(ev) => { ev.stopPropagation(); removeRegion(idx); }}
                      className="p-0.5 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => { setRegions([]); setActiveRegion(null); }}
              disabled={regions.length === 0}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <RotateCcw size={10} />
              Clear All
            </button>
            <button
              onClick={applyTrim}
              disabled={regions.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Check size={11} />
              Apply Trim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function bufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const totalSize = 44 + dataSize;

  const buf = new ArrayBuffer(totalSize);
  const view = new DataView(buf);

  const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };

  writeStr(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([buf], { type: 'audio/wav' });
}

import React, { useMemo, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

const API_BASE = import.meta.env.VITE_API_VOICE_EDITOR;
console.log('VOICE EDITOR API:', API_BASE);

export default function VoiceEditorPage() {
  const [mode, setMode] = useState('upload');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedAudio, setProcessedAudio] = useState(null);
  const [removeNoise, setRemoveNoise] = useState(true);

  const inputRef = useRef(null);
  const accepted = useMemo(() => '.mp3,.wav,audio/mpeg,audio/wav', []);

  const onPickFile = () => inputRef.current?.click();

  const onFileChange = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const onDrop = e => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const onDragOver = e => e.preventDefault();

  // ✅ FIXED FUNCTION (SYNC API SUPPORT)
  const processAudio = async () => {
    if (!file) {
      alert('Please upload an audio file first');
      return;
    }

    try {
      setLoading(true);
      setProcessedAudio(null);

      // 🔥 GET USER FIRST
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const fullName =
        user?.user_metadata?.full_name || user?.email || 'unknown_user';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', fullName); // ✅ ADD BEFORE FETCH

      const response = await fetch(`${API_BASE}/process-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Processing failed');

      // ✅ GET JSON RESPONSE
      const data = await response.json();

      setProcessedAudio(data.audio_url);
    } catch (error) {
      console.error(error);
      alert('Error processing audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#140014] via-[#2b0030] to-[#ff6ad5]" />

      {/* Glow */}
      <div
        className="absolute w-[750px] h-[750px] rounded-full blur-[220px] opacity-40"
        style={{
          background:
            'radial-gradient(circle at 60% 40%, #EB00E1 0%, #FFFFFF 100%)',
          top: '-500px',
          right: '-450px',
        }}
      />

      {/* Avatar */}
      <div className="absolute top-6 right-8 z-20">
        <img
          src="https://i.pravatar.cc/100"
          alt="profile"
          className="w-12 h-12 rounded-full border border-white/30"
        />
      </div>

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

          {/* Mode */}
          <div className="mt-10 w-full max-w-4xl flex gap-6">
            <button
              onClick={() => setMode('upload')}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className={`w-3 h-3 rounded-full ${
                  mode === 'upload' ? 'bg-pink-400' : 'border border-white/40'
                }`}
              />
              Upload your Audio
            </button>
          </div>

          {/* Upload Box */}
          <div
            onClick={onPickFile}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="mt-6 w-full max-w-4xl bg-[#e5e5e5] text-black rounded-2xl p-10 flex flex-col items-center cursor-pointer"
          >
            <input
              ref={inputRef}
              type="file"
              accept={accepted}
              className="hidden"
              onChange={onFileChange}
            />

            <div className="text-4xl mb-4">☁️</div>

            <p className="text-lg font-medium">
              {file ? file.name : 'Upload MP3 or WAV file'}
            </p>

            <p className="text-sm text-gray-600 mt-2 text-center">
              1–10 min, max 100MB, clean audio
            </p>
          </div>

          {/* Noise Toggle */}
          <div className="mt-6 w-full max-w-4xl flex items-center gap-3">
            <span>Remove Background Noise</span>
            <button
              onClick={() => setRemoveNoise(!removeNoise)}
              className={`w-12 h-6 flex items-center rounded-full p-1 ${
                removeNoise ? 'bg-pink-500' : 'bg-white/30'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transform ${
                  removeNoise ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Generate Button */}
          <div className="mt-8 w-full max-w-4xl">
            <button
              onClick={processAudio}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500"
            >
              {loading ? 'Processing...' : 'Generate Voice'}
            </button>
          </div>

          {/* Output */}
          {processedAudio && (
            <div className="mt-6 w-full max-w-4xl text-center">
              <p className="mb-2">Processed Audio</p>
              <audio controls src={processedAudio} className="w-full" />
              <a
                href={processedAudio}
                download="processed.wav"
                className="block mt-3 text-pink-400"
              >
                Download Audio
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

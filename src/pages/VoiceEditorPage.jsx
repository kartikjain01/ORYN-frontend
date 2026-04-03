import React, { useMemo, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_VOICE_CLONE;

export default function VoiceCloningPage() {
  const [mode, setMode] = useState('upload');
  const [removeNoise, setRemoveNoise] = useState(true);
  const [file, setFile] = useState(null);

  const [voiceId, setVoiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [previewText, setPreviewText] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const inputRef = useRef(null);
  const accepted = useMemo(() => '.mp3,.wav,audio/mpeg,audio/wav', []);

  const onPickFile = () => inputRef.current?.click();
  const [fileName, setFileName] = useState('');
  const [showTextBox, setShowTextBox] = useState(false);
  const [textValue, setTextValue] = useState('');

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

      // ✅ FIXED (removed /v1)
      const response = await fetch(`${API_BASE}/voices`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      const id = data.voice_id;

      setVoiceId(id);
      setStatusMsg('Building voice profile...');

      await fetch(`${API_BASE}/voices/${id}/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remove_noise: removeNoise }),
      });

      setStatusMsg('Voice cloned successfully!');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error cloning voice');
    } finally {
      setLoading(false);
    }
    ```

};

const generatePreview = async () => {
if (!voiceId) {
alert("Please clone voice first");
return;
}

```;
    if (!previewText) {
      alert('Enter preview text');
      return;
    }

    try {
      // ✅ FIXED (removed /v1)
      const response = await fetch(`${API_BASE}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voice_id: voiceId,
          text: previewText,
          language: 'en',
          output_format: 'wav',
        }),
      });

      const data = await response.json();

      if (!data.job_id) {
        throw new Error('No job_id returned from server');
      }

      checkJobStatus(data.job_id);
    } catch (err) {
      console.error('TTS ERROR:', err);
      setStatusMsg('TTS generation failed');
    }
    ```

};

const checkJobStatus = async (jobId) => {
if (!jobId) return;

```;
    const interval = setInterval(async () => {
      const res = await fetch(`${API_BASE}/tts/${jobId}`);
      const data = await res.json();

      if (data.status === 'done') {
        clearInterval(interval);
        setAudioUrl(`${API_BASE}/tts/${jobId}/download`);
        setStatusMsg('Preview ready!');
      }
    }, 2000);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-[#140014] via-[#2b0030] to-[#ff6ad5]"></div>

      <div
        className="absolute w-[750px] h-[750px] rounded-full blur-[220px] opacity-40"
        style={{
          background:
            'radial-gradient(circle at 60% 40%, #EB00E1 0%, #FFFFFF 100%)',
          top: '-500px',
          right: '-450px',
        }}
      ></div>

      <div className="absolute top-6 right-8 z-20">
        <img
          src="https://i.pravatar.cc/100"
          alt="profile"
          className="w-12 h-12 rounded-full border border-white/30"
        />
      </div>

      <div className="relative z-10 flex h-full">
        <div className="w-20"></div>

        <div className="flex-1 flex flex-col items-center pt-24 px-10">
          <h1 className="text-7xl font-semibold text-center">Voice Cloning</h1>
          <p className="mt-4 text-white/70 text-center max-w-2xl text-lg">
            Try AI voice cloning online. Instantly clone any voice from a short
            sample and turn text into custom speech.
          </p>
          <div className="mt-10 w-full max-w-4xl flex items-center gap-6">
            <button
              onClick={() => setMode('upload')}
              className="flex items-center gap-2 text-sm text-white"
            >
              <span
                className={`w-3 h-3 rounded-full ${mode === 'upload' ? 'bg-pink-400' : 'border border-white/40'}`}
              ></span>
              Upload to Clone
            </button>

            <button
              onClick={() => setMode('record')}
              className="flex items-center gap-2 text-sm text-white"
            >
              <span
                className={`w-3 h-3 rounded-full ${mode === 'record' ? 'bg-pink-400' : 'border border-white/40'}`}
              ></span>
              Record to Clone
            </button>
          </div>
          <div
            onClick={() => mode === 'upload' && inputRef.current?.click()}
            className={`mt-10 w-full max-w-4xl bg-[#e5e5e5] text-black rounded-2xl p-10 flex flex-col items-center justify-center ${
              mode === 'upload' ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <input
              type="file"
              accept="audio/mp3,audio/wav"
              ref={inputRef}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setFile(file);
                  setFileName(file.name);
                }
              }}
              className="hidden"
            />

            <div className="text-4xl mb-4">
              {mode === 'upload' ? '☁️' : '🎤'}
            </div>

            <div className="text-lg font-medium text-center">
              <p>{fileName ? fileName : 'Upload Mp3 or WAV audio file.'}</p>
            </div>
          </div>
          <div className="mt-8 w-full max-w-4xl">
            <button
              onClick={() => setShowTextBox(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#e5e5e5] text-black px-5 py-4 rounded-xl"
            >
              📄 Enter your text
            </button>
          </div>
          <div className="mt-6 w-full max-w-4xl flex items-center gap-3">
            <span className="text-sm text-white">Remove Background Noise</span>

            <button
              onClick={() => setRemoveNoise(!removeNoise)}
              className={`w-12 h-6 flex items-center rounded-full p-1 ${
                removeNoise ? 'bg-pink-500' : 'bg-white/30'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full ${removeNoise ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
          <div className="mt-8 w-full max-w-4xl">
            <button
              onClick={uploadVoice}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500"
            >
              {loading ? 'Processing...' : 'Clone Voice'}
            </button>
          </div>
          <div className="mt-4 w-full max-w-4xl">
            <button
              onClick={generatePreview}
              className="w-full py-4 rounded-xl bg-white/10 border border-white/20"
            >
              Generate Preview
            </button>
          </div>
          {audioUrl && (
            <div className="mt-6 w-full max-w-4xl bg-white/10 border border-white/20 rounded-xl p-4">
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}
          <p className="mt-4">{statusMsg}</p>
          ```
        </div>
      </div>
    </div>
  );
}

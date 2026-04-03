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

  const inputRef = useRef(null);
  const accepted = useMemo(() => '.mp3,.wav,audio/mpeg,audio/wav', []);

  const [fileName, setFileName] = useState('');
  const [showTextBox, setShowTextBox] = useState(false);
  const [textValue, setTextValue] = useState('');

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
  };

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
  };

  const checkJobStatus = async jobId => {
    if (!jobId) return;

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
    <div className="relative w-full h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl mb-4">Voice Cloning</h1>

      <input
        type="file"
        accept={accepted}
        ref={inputRef}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) {
            setFile(f);
            setFileName(f.name);
          }
        }}
        className="mb-4"
      />

      <p className="mb-2">{fileName}</p>

      <button
        onClick={uploadVoice}
        className="bg-pink-500 px-4 py-2 rounded mb-4"
      >
        {loading ? 'Processing...' : 'Clone Voice'}
      </button>

      <textarea
        placeholder="Enter text"
        value={textValue}
        onChange={e => setTextValue(e.target.value)}
        className="text-black p-2 mb-4 w-full max-w-md"
      />

      <button
        onClick={() => {
          setPreviewText(textValue);
          generatePreview();
        }}
        className="bg-purple-500 px-4 py-2 rounded mb-4"
      >
        Generate Preview
      </button>

      {audioUrl && <audio controls src={audioUrl} className="mt-4" />}

      <p className="mt-4">{statusMsg}</p>
    </div>
  );
}

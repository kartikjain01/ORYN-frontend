import React, { useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_VOICE_CLONE;

export default function VoiceCloningPage() {
  const [mode, setMode] = useState("upload");
  const [removeNoise, setRemoveNoise] = useState(true);
  const [file, setFile] = useState(null);

  const [voiceId, setVoiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [previewText, setPreviewText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const inputRef = useRef(null);
  const accepted = useMemo(() => ".mp3,.wav,audio/mpeg,audio/wav", []);

  const onPickFile = () => inputRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const onDragOver = (e) => e.preventDefault();

  const uploadVoice = async () => {
    if (!file) {
      alert("Please upload an audio file first");
      return;
    }

    try {
      setLoading(true);
      setStatusMsg("Uploading voice...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/v1/voices`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const id = data.voice_id;

      setVoiceId(id);
      setStatusMsg("Building voice profile...");

      await fetch(`${API_BASE}/v1/voices/${id}/build`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remove_noise: removeNoise }),
      });

      setStatusMsg("Voice cloned successfully!");
    } catch (err) {
      console.error(err);
      setStatusMsg("Error cloning voice");
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!voiceId) {
      alert("Please clone voice first");
      return;
    }

    if (!previewText) {
      alert("Enter preview text");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/v1/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voice_id: voiceId,
          text: previewText,
          language: "en",
          output_format: "wav",
        }),
      });

      const data = await response.json();

      if (!data.job_id) {
        throw new Error("No job_id returned from server");
      }

      checkJobStatus(data.job_id);
    } catch (err) {
      console.error("TTS ERROR:", err);
      setStatusMsg("TTS generation failed");
    }
  };

  const checkJobStatus = async (jobId) => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`${API_BASE}/v1/tts/${jobId}`);
      const data = await res.json();

      if (data.status === "done") {
        clearInterval(interval);
        setAudioUrl(`${API_BASE}/v1/tts/${jobId}/download`);
        setStatusMsg("Preview ready!");
      }
    }, 2000);
  };

  return (
    <>
      <section className="hero-section">
        <h1 className="hero-title">Voice Cloning</h1>
        <p className="hero-subtitle">
          Try AI voice cloning online. Instantly clone any voice from a short sample and turn text into custom speech.
        </p>
      </section>

      <section className="editor-section">
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === "upload" ? "active" : ""}`}
            onClick={() => setMode("upload")}
            type="button"
          >
            Upload to Clone
          </button>
          <button
            className={`mode-tab ${mode === "record" ? "active" : ""}`}
            onClick={() => setMode("record")}
            type="button"
          >
            Record to Clone
          </button>
        </div>

        <div
          className="upload-card"
          role="button"
          tabIndex={0}
          onClick={onPickFile}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="upload-icon-large">⬆</div>
          <h3 className="upload-title">Upload MP3 or WAV audio file</h3>
          <p className="upload-text">
            must be 1 min - 10 mins, max 100 MB, one voice only, clear audio, minimal noise
          </p>

          {file && <p className="file-chip">{file.name}</p>}

          <input
            ref={inputRef}
            type="file"
            accept={accepted}
            className="hidden-input"
            onChange={onFileChange}
          />
        </div>

        <div className="toggle-row">
          <span>Remove Background Noise</span>
          <button
            type="button"
            className={`toggle-btn ${removeNoise ? "on" : ""}`}
            onClick={() => setRemoveNoise((v) => !v)}
          >
            <span />
          </button>
        </div>

        <div className="generate-btn-wrap">
          <button className="generate-btn secondary-btn" onClick={() => setShowPreview(true)} type="button">
            Text to Preview
          </button>
        </div>

        <div className="generate-btn-wrap">
          <button className="generate-btn" onClick={uploadVoice} disabled={loading} type="button">
            {loading ? "Cloning Voice..." : "Voice Clone"}
          </button>
        </div>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
        {voiceId && <p className="status-text">Voice ID: <span className="selected-tool-name">{voiceId}</span></p>}

        {showPreview && (
          <div className="modal-overlay">
            <div className="preview-modal">
              <h2>Preview Voice</h2>

              <textarea
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Enter preview text..."
                className="preview-textarea"
              />

              <div className="modal-actions">
                <button type="button" className="modal-btn ghost" onClick={() => setShowPreview(false)}>
                  Cancel
                </button>
                <button type="button" className="modal-btn primary" onClick={generatePreview}>
                  Generate
                </button>
              </div>

              {audioUrl && (
                <div className="audio-preview">
                  <audio controls src={audioUrl} className="audio-player" />
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
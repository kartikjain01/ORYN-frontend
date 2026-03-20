import React, { useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_VOICE_EDITOR;

export default function VoiceEditorPage() {
  const [mode, setMode] = useState("upload");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedAudio, setProcessedAudio] = useState(null);

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

  const processAudio = async () => {
    if (!file) {
      alert("Please upload an audio file first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/process-audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Processing failed");
      }

      const blob = await response.blob();
      const audioURL = URL.createObjectURL(blob);
      setProcessedAudio(audioURL);
    } catch (error) {
      console.error(error);
      alert("Error processing audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="hero-section">
        <h1 className="hero-title">AI Voice Editor</h1>
        <p className="hero-subtitle">
          Create, refine, and produce smarter with intelligent voice technology.
        </p>
      </section>

      <section className="editor-section">
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === "upload" ? "active" : ""}`}
            onClick={() => setMode("upload")}
            type="button"
          >
            Upload Audio File
          </button>
          <button
            className={`mode-tab ${mode === "record" ? "active" : ""}`}
            onClick={() => setMode("record")}
            type="button"
          >
            Record Audio
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
            must be 1 min - 10 mins, max 100 MB, one voice only, clear audio minimal noise
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

        <div className="generate-btn-wrap">
          <button className="generate-btn" onClick={processAudio} disabled={loading} type="button">
            {loading ? "Processing Audio..." : "Voice Editing"}
          </button>
        </div>

        {processedAudio && (
          <div className="audio-preview">
            <p className="status-text">Processed Audio</p>
            <audio controls src={processedAudio} className="audio-player" />
            <a href={processedAudio} download="processed.wav" className="download-link">
              Download Processed Audio
            </a>
          </div>
        )}
      </section>
    </>
  );
}
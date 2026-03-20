import React, { useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_VOICE_GENERATION;

export default function TextToSpeechPage() {
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(50);
  const [stability, setStability] = useState(50);
  const [similarity, setSimilarity] = useState(50);
  const [style, setStyle] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const canGenerate = useMemo(() => text.trim().length > 0, [text]);

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.replace(/\n/g, " "),
          speed: speed / 50,
          voice: "af_bella",
        }),
      });

      if (!response.ok) throw new Error("Backend Error");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Make sure your Python server is running on port 8000!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="hero-section">
        <h1 className="hero-title">Text to Speech</h1>
        <p className="hero-subtitle">
          Turn text into lifelike speech with adjustable voice controls and instant playback.
        </p>
      </section>

      <section className="editor-section">
        <div className="tts-grid">
          <div className="tts-card">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing here or paste any text you want to turn into life like speech..."
              className="tts-textarea"
            />

            <div className="generate-btn-wrap left">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || isLoading}
                className="generate-btn"
                type="button"
              >
                {isLoading ? "Processing..." : "Generate Speech"}
              </button>
            </div>

            {audioUrl && (
              <div className="audio-preview">
                <audio controls src={audioUrl} className="audio-player" />
                <a href={audioUrl} download="vevia_audio.wav" className="download-link">
                  Download File
                </a>
              </div>
            )}
          </div>

          <div className="tool-panel">
            <h3 className="tool-panel-title">Model Controls</h3>

            <SliderRow title="Speed" left="Slow" right="Fast" value={speed} onChange={setSpeed} />
            <SliderRow title="Stability" left="Variable" right="Stable" value={stability} onChange={setStability} />
            <SliderRow title="Similarity" left="Low" right="High" value={similarity} onChange={setSimilarity} />
            <SliderRow title="Style Exaggeration" left="None" right="Exaggerated" value={style} onChange={setStyle} />
          </div>
        </div>
      </section>
    </>
  );
}

function SliderRow({ title, left, right, value, onChange }) {
  return (
    <div className="slider-row">
      <div className="slider-head">
        <span>{title}</span>
      </div>
      <div className="slider-labels">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input"
      />
    </div>
  );
}

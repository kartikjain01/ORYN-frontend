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
  const [fileName, setFileName] = useState("");
  const [showTextBox, setShowTextBox] = useState(false);
  const [textValue, setTextValue] = useState("");

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
    <div className="relative w-full h-screen bg-black overflow-hidden text-white">
      
      {/* 🔮 Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#140014] via-[#2b0030] to-[#ff6ad5]"></div>

      {/* 🌟 Glow */}
      <div
        className="absolute w-[750px] h-[750px] rounded-full blur-[220px] opacity-40"
        style={{
          background: "radial-gradient(circle at 60% 40%, #EB00E1 0%, #FFFFFF 100%)",
          top: "-500px",
          right: "-450px",
          bottom: "-200px",
        }}
      ></div>

      {/* 👤 Avatar */}
      <div className="absolute top-6 right-8 z-20">
        <img
          src="https://i.pravatar.cc/100"
          alt="profile"
          className="w-12 h-12 rounded-full border border-white/30"
        />
      </div>

      {/* 🧱 Layout */}
      <div className="relative z-10 flex h-full">
        
        {/* 📌 Sidebar Placeholder */}
        <div className="w-20 flex items-center justify-center"></div>

        {/* 🧠 Main Content */}
        <div className="flex-1 flex flex-col items-center pt-24 px-10">
          
          {/* 🔥 Heading */}
          <h1 className="text-7xl font-semibold text-center">
            Voice Cloning
          </h1>

          {/* ✍️ Subtext */}
          <p className="mt-4 text-white/70 text-center max-w-2xl text-lg">
            Try AI voice cloning online. Instantly clone any voice from a short
            sample and turn text into custom speech.
          </p>

          {/* 🔘 Toggle Buttons */}
          <div className="mt-10 w-full max-w-4xl flex items-center gap-6">
            <button
              onClick={() => setMode("upload")}
              className={`flex items-center gap-2 text-sm text-white`}
            >
              <span className={`w-3 h-3 rounded-full ${mode === "upload" ? "bg-pink-400" : "border border-white/40"}`}></span>
              Upload to Clone
            </button>

            <button
              onClick={() => setMode("record")}
              className={`flex items-center gap-2 text-sm text-white`}
            >
              <span className={`w-3 h-3 rounded-full ${mode === "record" ? "bg-pink-400" : "border border-white/40"}`}></span>
              Record to Clone
            </button>
          </div>

          {/* 📦 Upload Box */}
          <div
            onClick={() => inputRef.current?.click()}
            className="mt-10 w-full max-w-4xl bg-[#e5e5e5] text-black rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer"
          >
            <input
              type="file"
              accept="audio/mp3,audio/wav"
              ref={inputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (f) 
                  setFile(f);
                  setFileName(file.name);
              }}
              className="hidden"
            />

            <div className="text-4xl mb-4">☁️</div>

            <p className="text-lg font-medium">
              {fileName ? fileName : "Upload Mp3 or WAV audio file."}
            </p>

            <p className="text-sm text-gray-600 mt-2 text-center">
              must be 1 min - 10 mins, max 100 MB, one voice only, clear audio minimal noise.
            </p>
          </div>

          {/* 📝 Controls Row */}
          <div className="mt-8 w-full max-w-4xl">
            <button
              onClick={() => setShowTextBox(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#e5e5e5] text-black px-5 py-4 rounded-xl"
            >
              <span>📄</span>
              <span className="text-sm font-medium">Enter your text</span>
            </button>
          </div>

          {/* 🧾 Text Input Modal */}
          {showTextBox && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-30">
              <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Enter your text here..."
                  className="w-full h-40 bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 outline-none resize-none backdrop-blur-md"
                />

                <div className="flex justify-end mt-4 gap-3">
                  <button
                    onClick={() => setShowTextBox(false)}
                    className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowTextBox(false)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 🔊 Remove Background Noise */}
          <div className="mt-6 w-full max-w-4xl flex items-center gap-3">
            <span className="text-sm text-white">Remove Background Noise</span>

            <button
              onClick={() => setRemoveNoise(!removeNoise)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition ${removeNoise ? "bg-pink-500" : "bg-white/30"}`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${removeNoise ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* ▶️ Generate Voice Button */}
          <div className="mt-8 w-full max-w-4xl">
            <button className="w-full py-4 rounded-xl font-medium bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition">
              Generate Voice
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

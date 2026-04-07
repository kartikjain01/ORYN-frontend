import { useState } from "react";
import { Plus, Mic, Paperclip } from "lucide-react";
import { supabase } from '../supabaseClient';

const API_BASE = import.meta.env.VITE_API_VOICE_GENERATION; // ✅ added

export default function GlowBackgroundPlayground() {
  const [showAudio, setShowAudio] = useState(false);
  const [text, setText] = useState(""); // ✅ added
  const [audioUrl, setAudioUrl] = useState(""); // ✅ updated
  const [isLoading, setIsLoading] = useState(false); // ✅ added

  const handleGenerate = async () => { // ✅ added
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const fullName =
        user?.user_metadata?.full_name || user?.email || 'unknown_user';

      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.replace(/\n/g, ' '),
          speed: 1,
          voice: 'af_bella',
          user_id: fullName, // ✅ ADD THIS
        }),
      });

      if (!response.ok) throw new Error('Backend Error');

      const data = await response.json();
      setAudioUrl(data.audio_url);
      setShowAudio(true);

      setAudioUrl(data.audio_url);
      setShowAudio(true); // ✅ show player after success
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Backend connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden isolate text-white" style={{ background: "#050010" }}>

      {/* Background Gradient */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, rgba(235,0,225,0.25), rgba(120,0,150,0.15), rgba(10,0,20,0.95))",
        }}
      />

      {/* Glow Ellipse */}
      <div
        className="absolute -z-10 pointer-events-none rounded-full"
        style={{
          top: "-150px",
          right: "-150px",
          width: 500,
          height: 500,
          filter: "blur(80px)",
          background:
            "radial-gradient(circle at 60% 40%, #EB00E1 0%, rgba(255,255,255,0.6) 100%)",
        }}
      />

      {/* Header */}
      <div className="relative z-10 pt-16 text-center">
        <h1 className="text-6xl font-semibold">Text to Speech</h1>
        <p className="mt-4 text-lg text-gray-300">
          Your voice-powered automation hub plan, create and execute smarter with AI.
        </p>
      </div>

      {/* Main Section */}
      <div className="relative z-10 mt-12 px-32 pr-[380px]">

        {/* Input Box */}
        <div className="flex h-[470px] max-w-4xl overflow-hidden flex-col justify-between rounded-2xl bg-white/90 p-6 text-black">
          <textarea
            value={text} // ✅ added
            onChange={(e) => setText(e.target.value)} // ✅ added
            className="h-full w-full resize-none bg-transparent text-gray-700 outline-none"
            placeholder="Start typing here or paste any text you want to turn into life like speech..."
          />

          {/* Audio Player (Appears after click) */}
          {showAudio && (
            <div className="mt-4">
              <div className="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-purple-500"></div>
              </div>
              <audio controls className="mt-2 w-full h-8">
                <source src={audioUrl} type="audio/mpeg" />
                <source src="" type="audio/mpeg" />
                Your browser does not support audio.
              </audio>

              {/* Download Button */}
              <button
                className="mt-2 w-full rounded-lg bg-purple-600 text-white py-1.5 text-sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = audioUrl;
                  link.download = 'speech.mp3';
                  link.click();
                }}
              >
                Download Audio
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400">
                <Plus size={16} />
              </div>
              <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400">
                <Mic size={16} />
              </div>
              <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400">
                <Paperclip size={16} />
              </div>
              <span>Data source</span>
            </div>
            <button
              onClick={handleGenerate} // ✅ replaced
              className="rounded-full bg-gray-400 px-4 py-2 text-white"
            >
              {isLoading ? "Processing..." : "Generate Speech"} {/* ✅ added */}
            </button>
          </div>
        </div>

        {/* Right Tool Panel */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 w-[340px] h-[470px] rounded-2xl bg-white/90 p-5 text-black overflow-auto">
          <h2 className="mb-4 font-semibold">Tool (coming soon)</h2>

          <div className="space-y-4">

            <div>
              <p className="mb-1 text-sm">Voice</p>
              <div className="rounded-lg bg-gray-100 p-2">Model Voice</div>
            </div>

            <div>
              <p className="mb-1 text-sm">Language</p>
              <div className="rounded-lg bg-gray-100 p-2">English</div>
            </div>

            <div>
              <p className="mb-1 text-sm">Speed</p>
              <input type="range" className="w-full" />
            </div>

            <div>
              <p className="mb-1 text-sm">Stability</p>
              <input type="range" className="w-full" />
            </div>

            <div>
              <p className="mb-1 text-sm">Similarity</p>
              <input type="range" className="w-full" />
            </div>

            <div>
              <p className="mb-1 text-sm">Style Exaggeration</p>
              <input type="range" className="w-full" />
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

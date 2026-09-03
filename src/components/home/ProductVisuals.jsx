/* ============================================================
   PRODUCT VISUALS — Image-based scenes for each product slide.
   ============================================================ */

/* ------------------------------------------------------------
   1 — VOICE CLONE
   ------------------------------------------------------------ */
import voiceCloneHeroImg from '../../assets/images/voice-clone-hero.png';

export function VoiceCloneVisual() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <img
        src={voiceCloneHeroImg}
        alt="AI neural network sphere with voice sample, AI analysis, and voice identity labels"
        className="w-[150%] max-w-none h-auto object-contain -ml-[45%] -mr-[5%]"
      />
    </div>
  );
}

/* ------------------------------------------------------------
   2 — TEXT TO SPEECH
   ------------------------------------------------------------ */
import ttsInterfaceImg from '../../assets/images/tts-interface.png';

export function TextToSpeechVisual() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <img
        src={ttsInterfaceImg}
        alt="Text-to-speech interface with voice, language and emotion selectors above an audio waveform player"
        className="w-full max-w-none h-auto object-contain lg:scale-110 origin-center"
      />
    </div>
  );
}

/* ------------------------------------------------------------
   3 — VOICE EDITOR
   Waveform image with floating UI overlay cards.
   ------------------------------------------------------------ */
import voiceEditorWavesImg from '../../assets/images/voice-editor-waves.png';

export function VoiceEditorVisual() {
  return (
    <div className="relative w-full mx-auto">
      {/* AI Enhancing card — top center */}
      <div className="flex justify-center mb-5 relative z-20">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-5 py-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200/60 text-[11px] font-bold text-slate-700">AI</span>
            <span contentEditable suppressContentEditableWarning className="text-[13px] font-semibold text-slate-800 outline-none">Enhancing Audio...</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-[5px] w-[120px] rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-[72%] rounded-full bg-brand-500" />
            </div>
            <span contentEditable suppressContentEditableWarning className="text-[11px] font-semibold text-slate-600 outline-none">72%</span>
          </div>
          <p contentEditable suppressContentEditableWarning className="mt-1.5 text-[10.5px] text-slate-400 outline-none">Removing noise and improving clarity</p>
        </div>
      </div>

      {/* Before / After labels row */}
      <div className="flex justify-between px-2 mb-3 relative z-20">
        <div className="rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.06)]">
          <p contentEditable suppressContentEditableWarning className="text-[12px] font-semibold text-slate-800 outline-none">Before</p>
          <p contentEditable suppressContentEditableWarning className="text-[10.5px] text-slate-400 mt-0.5 outline-none">Noisy Audio</p>
          <div className="mt-2 flex items-center gap-[1.5px]">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="w-[2px] rounded-full bg-slate-400"
                style={{ height: `${4 + Math.abs(Math.sin(i * 0.8)) * 12}px` }} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.06)]">
          <p contentEditable suppressContentEditableWarning className="text-[12px] font-semibold text-slate-800 outline-none">After</p>
          <p contentEditable suppressContentEditableWarning className="text-[10.5px] text-slate-400 mt-0.5 outline-none">Enhanced Audio</p>
          <div className="mt-2 flex items-center gap-[1.5px]">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="w-[2px] rounded-full bg-brand-500"
                style={{ height: `${3 + Math.sin(i * 0.4) * 6 + 6}px` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Main image — full width, large */}
      <div className="relative w-[130%] -ml-[15%] z-10">
        <img
          src={voiceEditorWavesImg}
          alt="Before and after audio visualization — jagged peaks transforming into smooth blue waves"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Metric pills — below image */}
      <div className="flex justify-center mt-5 relative z-20">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-5 py-3.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]">
          {[
            { label: 'Noise Reduction', value: 80 },
            { label: 'Voice Clarity', value: 75 },
            { label: 'Warmth', value: 60 },
            { label: 'Presence', value: 65 },
          ].map(metric => (
            <div key={metric.label} className="flex items-center gap-2 px-1">
              <div className="relative h-9 w-9">
                <svg className="h-9 w-9 -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="13" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                  <circle cx="16" cy="16" r="13" fill="none" stroke="#2563eb" strokeWidth="2.5"
                    strokeDasharray={`${metric.value * 0.817} 100`} strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p contentEditable suppressContentEditableWarning className="text-[10px] text-slate-400 leading-tight outline-none">{metric.label}</p>
                <p contentEditable suppressContentEditableWarning className="text-[12px] font-semibold text-brand-600 outline-none">{metric.value}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   4 — CAPTION GENERATOR
   ------------------------------------------------------------ */
import captionCarouselImg from '../../assets/images/caption-carousel.png';

export function CaptionGeneratorVisual() {
  return (
    <div className="relative w-full flex items-center justify-center -mt-6">
      {/* Ambient glow behind image */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-brand-500/15 blur-[80px]" />

      {/* Image with subtle tilt animation */}
      <div className="relative w-full" style={{ perspective: '1000px' }}>
        <img
          src={captionCarouselImg}
          alt="Multilingual caption cards orbiting around a central globe on a holographic platform"
          className="w-full max-w-none h-auto object-contain lg:scale-[1.15] origin-center"
          style={{ animation: 'carouselTilt 6s ease-in-out infinite' }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   5 — STORYBOARD
   Dark product frame on light page — standard SaaS showcase pattern.
   ------------------------------------------------------------ */
import storyboardImg from '../../assets/images/storyboard.png';

export function StoryboardVisual({ tone }) {
  return (
    <div className="relative w-full">
      {/* Ambient glow */}
      <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-brand-500/20 via-brand-400/10 to-transparent blur-[50px]" />

      {/* Dark product frame */}
      <div className="relative rounded-[20px] bg-gradient-to-br from-[#0f1219] to-[#1a1f2e] p-3 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
        {/* Top bar — window chrome hint */}
        <div className="mb-2.5 flex items-center gap-1.5 px-2">
          <div className="h-2 w-2 rounded-full bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-white/10" />
        </div>

        {/* Image */}
        <div className="overflow-hidden rounded-xl">
          <img
            src={storyboardImg}
            alt="A prompt card streaming light into a six-panel cinematic storyboard grid."
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Bottom reflection */}
      <div className="pointer-events-none absolute -bottom-3 left-[10%] right-[10%] h-12 rounded-full bg-brand-500/8 blur-[20px]" />
    </div>
  );
}

/* ------------------------------------------------------------
   6 — VIDEO EDITOR
   Full-bleed cinematic image — no frame, no glow, just the art.
   ------------------------------------------------------------ */
import videoEditorImg from '../../assets/images/videoeditor.png';

export function VideoEditorVisual() {
  return (
    <div className="relative -mt-14 -mb-16 overflow-visible">
      <img
        src={videoEditorImg}
        alt="A cinematic video editing interface with scene cards, timeline tracks, and blue neon glow effects."
        className="w-[140%] max-w-none h-auto -ml-[28%]"
      />
    </div>
  );
}

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import LandingLayout, { ServiceCrossLinks } from './LandingLayout';

const features = [
  {
    title: 'Background Noise Removal',
    desc: 'Choose from three AI processing modes — Basic for light cleanup, Advanced for stronger filtering, or DeepFilter for maximum noise suppression.',
  },
  {
    title: 'Smart Trim',
    desc: 'Automatically detect and remove repeated takes, false starts, and dead air so you keep only the best parts of your recording.',
  },
  {
    title: 'Waveform Trimmer',
    desc: 'Visually select and trim sections of your audio with a precise waveform editor. Cut intros, outros, or unwanted segments manually.',
  },
  {
    title: 'Flexible Export',
    desc: 'Download your enhanced audio as WAV for lossless quality or MP3 for smaller file sizes. All processed files are saved to your project library.',
  },
];

const steps = [
  { n: '1', title: 'Upload or Record', desc: 'Upload an MP3 or WAV file (up to 5 minutes, 50 MB) or record directly in the browser.' },
  { n: '2', title: 'Configure Settings', desc: 'Enable noise removal and pick a processing mode. Toggle Smart Trim to auto-clean repeated takes.' },
  { n: '3', title: 'Process Audio', desc: 'Click Process and let the AI enhance your recording. A progress bar tracks each stage.' },
  { n: '4', title: 'Preview and Download', desc: 'Listen to the enhanced result, trim further if needed, then export as WAV or MP3.' },
];

const useCases = [
  { title: 'Podcast Editing', desc: 'Remove background hum, mouth clicks, and ambient noise from podcast recordings before publishing.' },
  { title: 'Interview Cleanup', desc: 'Polish remote interview audio captured on laptops or phones with inconsistent microphone quality.' },
  { title: 'Voiceover Polishing', desc: 'Enhance narration tracks for videos, courses, or audiobooks with professional-level noise reduction.' },
  { title: 'Recording Enhancement', desc: 'Salvage field recordings, meeting audio, or voice memos that were captured in noisy environments.' },
];

const faqs = [
  {
    q: 'What audio formats are supported?',
    a: 'You can upload MP3 or WAV files. Recordings made in the browser are captured as WebM and converted automatically. Exports are available in WAV and MP3.',
  },
  {
    q: 'What are the file size and duration limits?',
    a: 'The maximum file size is 50 MB and the maximum duration is 5 minutes per upload.',
  },
  {
    q: 'What is the difference between the three processing modes?',
    a: 'Basic applies light noise reduction suitable for already-clean recordings. Advanced uses stronger AI filtering for moderate background noise. DeepFilter provides the most aggressive suppression for challenging audio environments.',
  },
  {
    q: 'Does Smart Trim delete parts of my audio permanently?',
    a: 'Smart Trim creates a new processed version of your audio. Your original upload is not modified, and you can always re-process from scratch.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'Yes. A free account is required so the tool can save your processed files and project history.',
  },
];

export default function VoiceEditorLanding() {
  return (
    <LandingLayout>
      <Helmet>
        <title>AI Voice Editor & Audio Enhancer | ORYN Engine</title>
        <meta name="description" content="Enhance voice recordings with ORYN Engine. Remove background noise, trim audio, and polish recordings with AI-powered processing modes including DeepFilter." />
        <link rel="canonical" href="https://www.orynengine.com/voice-editor" />
        <meta property="og:title" content="AI Voice Editor & Audio Enhancer | ORYN Engine" />
        <meta property="og:description" content="Enhance voice recordings with ORYN Engine. Explore audio cleanup, noise reduction, and voice editing tools." />
        <meta property="og:url" content="https://www.orynengine.com/voice-editor" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Voice Editor & Audio Enhancer | ORYN Engine" />
        <meta name="twitter:description" content="Enhance voice recordings with ORYN Engine." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            AI Voice Editor and Audio Enhancer
          </h1>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Upload a voice recording and let AI remove background noise, trim dead air, and enhance clarity. Choose from multiple processing modes for the right level of cleanup.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[15px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200">
              Get Started Free
            </Link>
            <a href="#how-it-works" className="px-7 py-3 rounded-xl border border-slate-300 text-slate-700 text-[15px] font-semibold hover:border-blue-300 hover:text-blue-600 transition-all duration-200">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/60">
                <h3 className="text-[15px] font-bold text-slate-900">{f.title}</h3>
                <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(s => (
              <div key={s.n} className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md">{s.n}</div>
                <h3 className="mt-3 text-[15px] font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Use Cases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {useCases.map(u => (
              <div key={u.title} className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/60">
                <h3 className="text-[15px] font-bold text-slate-900">{u.title}</h3>
                <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {faqs.map((f, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80">
                <h3 className="text-[15px] font-bold text-slate-900">{f.q}</h3>
                <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900">Ready to enhance your audio?</h2>
          <p className="mt-3 text-[15px] text-slate-600">Create a free account and start using the AI Voice Editor.</p>
          <Link to="/register" className="mt-6 inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[15px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200">
            Get Started Free
          </Link>
        </div>
      </section>

      <ServiceCrossLinks current="/voice-editor" />
    </LandingLayout>
  );
}

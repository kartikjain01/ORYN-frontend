import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import LandingLayout, { ServiceCrossLinks } from './LandingLayout';

const VOICES = {
  English: [
    { name: 'Bella', gender: 'Female' },
    { name: 'Sarah', gender: 'Female' },
    { name: 'Nova', gender: 'Female' },
    { name: 'Sky', gender: 'Female' },
    { name: 'Michael', gender: 'Male' },
    { name: 'Echo', gender: 'Male' },
    { name: 'Adam', gender: 'Male' },
    { name: 'Eric', gender: 'Male' },
    { name: 'Liam', gender: 'Male' },
  ],
  Hindi: [
    { name: 'Omega', gender: 'Male' },
    { name: 'Psi', gender: 'Male' },
    { name: 'Alpha', gender: 'Female' },
    { name: 'Beta', gender: 'Female' },
  ],
};

const STEPS = [
  { n: '1', title: 'Enter Text', desc: 'Type up to 2,000 characters or upload a .txt file.' },
  { n: '2', title: 'Choose a Voice', desc: 'Pick from 13 AI voices across English and Hindi.' },
  { n: '3', title: 'Adjust Settings', desc: 'Fine-tune speed (0.5x–2x) and pitch to match your needs.' },
  { n: '4', title: 'Generate & Download', desc: 'Generate speech and export as WAV or MP3.' },
];

const USE_CASES = [
  { title: 'Video Narration', desc: 'Generate voiceovers for YouTube videos, tutorials, and social media content.' },
  { title: 'Podcast Intros', desc: 'Create consistent intro and outro audio for your podcast episodes.' },
  { title: 'E-Learning', desc: 'Produce narrated lessons and training materials at scale.' },
  { title: 'Voiceovers', desc: 'Add professional-sounding voiceovers to presentations and demos.' },
  { title: 'Accessibility', desc: 'Convert written content to audio for visually impaired audiences.' },
];

const FAQS = [
  { q: 'What languages does the text-to-speech tool support?', a: 'ORYN Engine currently supports English with 9 voice options and Hindi with 4 voice options.' },
  { q: 'What is the maximum text length?', a: 'You can enter up to 2,000 characters per generation, or upload a .txt file up to 500 KB.' },
  { q: 'What audio formats can I export?', a: 'Generated speech can be downloaded as WAV or MP3.' },
  { q: 'Can I adjust the speed and pitch?', a: 'Yes. Speed ranges from 0.5x to 2x, and pitch can be adjusted to suit your needs.' },
  { q: 'Is there a cost to use the tool?', a: 'Sign up for an account to see the available plans and usage limits.' },
];

export default function TextToSpeechLanding() {
  return (
    <LandingLayout>
      <Helmet>
        <title>AI Text to Speech Generator | ORYN Engine</title>
        <meta name="description" content="Turn text into natural-sounding speech with ORYN Engine. Choose from 13 AI voices in English and Hindi, adjust speed and pitch, and export as WAV or MP3." />
        <link rel="canonical" href="https://www.orynengine.com/text-to-speech" />
        <meta property="og:title" content="AI Text to Speech Generator | ORYN Engine" />
        <meta property="og:description" content="Turn text into natural-sounding speech with ORYN Engine. Explore AI voice generation for narration, videos, and voiceovers." />
        <meta property="og:url" content="https://www.orynengine.com/text-to-speech" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Text to Speech Generator | ORYN Engine" />
        <meta name="twitter:description" content="Turn text into natural-sounding speech with ORYN Engine." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #f0f0ff 100%)' }}>
        <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-300/20 blur-[80px]" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            AI Text to Speech Generator
          </h1>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Convert any text into natural-sounding speech with ORYN Engine. Choose from 13 AI voices in English and Hindi, adjust speed and pitch, and download high-quality audio in seconds.
          </p>
          <Link to="/register" className="mt-8 inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[15px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="text-center p-5 rounded-2xl border border-slate-100 bg-slate-50/60">
                <div className="mx-auto w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold mb-3">{s.n}</div>
                <h3 className="text-[15px] font-bold text-slate-900">{s.title}</h3>
                <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Voices */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f0f4ff 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Available AI Voices</h2>
          {Object.entries(VOICES).map(([lang, voices]) => (
            <div key={lang} className="mb-8 last:mb-0">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{lang} ({voices.length} voices)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {voices.map(v => (
                  <div key={v.name} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[14px] font-semibold text-slate-800">{v.name}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">{v.gender}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Use Cases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map(uc => (
              <div key={uc.title} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/60">
                <h3 className="text-[15px] font-bold text-slate-900">{uc.title}</h3>
                <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f0f4ff 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <div key={faq.q} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <h3 className="text-[15px] font-semibold text-slate-900">{faq.q}</h3>
                <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900">Ready to Generate Speech?</h2>
          <p className="mt-3 text-[15px] text-slate-600">Create an account and start converting text to natural-sounding audio today.</p>
          <Link to="/register" className="mt-6 inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[15px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200">
            Sign Up Free
          </Link>
        </div>
      </section>

      <ServiceCrossLinks current="/text-to-speech" />
    </LandingLayout>
  );
}

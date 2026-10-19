import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import LandingLayout, { ServiceCrossLinks } from './LandingLayout';

const STEPS = [
  { num: '1', title: 'Upload Audio', desc: 'Upload an MP3 or WAV file (max 2 min, 25 MB) or record your voice directly in the browser.' },
  { num: '2', title: 'Clone Voice', desc: 'ORYN builds a voice profile from your sample. Enable noise removal for cleaner results.' },
  { num: '3', title: 'Enter Text', desc: 'Type or paste the text you want spoken and choose from 17 supported output languages.' },
  { num: '4', title: 'Generate Speech', desc: 'Generate speech in the cloned voice, preview it instantly, and export as WAV or MP3.' },
];

const USE_CASES = [
  { title: 'Video Narration', desc: 'Produce consistent voiceovers for YouTube, social media, or training videos without re-recording.' },
  { title: 'Multilingual Content', desc: 'Generate speech in Hindi, Spanish, Japanese, and 14 more languages from a single voice sample.' },
  { title: 'Podcast Production', desc: 'Clone a host voice to quickly produce intros, outros, or corrections without a live recording session.' },
  { title: 'Content Creation', desc: 'Scale audio content for courses, audiobooks, or marketing materials using a cloned voice.' },
];

const LANGUAGES = [
  'English', 'Hindi', 'Gujarati', 'Spanish', 'French', 'German',
  'Japanese', 'Korean', 'Chinese', 'Arabic', 'Portuguese', 'Russian',
  'Italian', 'Tamil', 'Telugu', 'Bengali', 'Marathi',
];

const FAQS = [
  {
    q: 'What audio formats are supported for voice cloning?',
    a: 'ORYN Engine accepts MP3 and WAV files. You can also record your voice directly in the browser using your microphone.',
  },
  {
    q: 'How long does the voice sample need to be?',
    a: 'Audio samples can be up to 2 minutes long and no larger than 25 MB. A clear 30-60 second sample usually produces good results.',
  },
  {
    q: 'Which languages can the cloned voice speak?',
    a: 'You can generate speech in 17 languages including English, Hindi, Gujarati, Spanish, French, German, Japanese, Korean, Chinese, Arabic, Portuguese, Russian, Italian, Tamil, Telugu, Bengali, and Marathi.',
  },
  {
    q: 'What export formats are available?',
    a: 'Generated audio can be downloaded as WAV or MP3 files.',
  },
  {
    q: 'Does ORYN Engine remove background noise?',
    a: 'Yes. There is an optional noise removal toggle you can enable before cloning to clean up your source audio.',
  },
];

export default function VoiceCloningLanding() {
  return (
    <LandingLayout>
      <Helmet>
        <title>AI Voice Cloning Online | ORYN Engine</title>
        <meta name="description" content="Create natural-sounding AI voice clones with ORYN Engine. Upload audio or record your voice, then generate speech in 17+ languages for voiceovers, videos, and content." />
        <link rel="canonical" href="https://www.orynengine.com/voice-clone" />
        <meta property="og:title" content="AI Voice Cloning Online | ORYN Engine" />
        <meta property="og:description" content="Create natural-sounding AI voice clones with ORYN Engine. Explore AI voice cloning for voiceovers, videos, and other content." />
        <meta property="og:url" content="https://www.orynengine.com/voice-clone" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Voice Cloning Online | ORYN Engine" />
        <meta name="twitter:description" content="Create natural-sounding AI voice clones with ORYN Engine." />
      </Helmet>

      {/* Hero */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            AI Voice Cloning Online
          </h1>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Upload a short audio sample or record your voice, and ORYN Engine builds a voice profile you can use to generate speech in 17 languages. Export as WAV or MP3 for voiceovers, videos, and more.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[15px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Clone a Voice — Free to Try
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How Voice Cloning Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(s => (
              <div key={s.num} className="relative p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[13px] font-bold mb-3">
                  {s.num}
                </div>
                <h3 className="text-[15px] font-bold text-slate-900">{s.title}</h3>
                <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Use Cases for AI Voice Cloning</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {USE_CASES.map(uc => (
              <div key={uc.title} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <h3 className="text-[15px] font-bold text-slate-900">{uc.title}</h3>
                <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">17 Supported Languages</h2>
          <p className="text-[15px] text-slate-600 mb-8">
            Clone a voice in one language and generate speech in any of these output languages.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {LANGUAGES.map(lang => (
              <span key={lang} className="px-4 py-2 rounded-xl bg-white border border-slate-200/80 text-[13px] font-medium text-slate-700 shadow-sm">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <details key={faq.q} className="group rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <summary className="cursor-pointer px-6 py-4 text-[15px] font-semibold text-slate-900 list-none flex items-center justify-between">
                  {faq.q}
                  <span className="ml-3 text-slate-400 group-open:rotate-45 transition-transform duration-200 text-lg leading-none">+</span>
                </summary>
                <p className="px-6 pb-4 text-[13px] text-slate-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Get Started with ORYN Engine</h2>
          <p className="text-[15px] text-slate-600 mb-8">
            Sign up and try AI voice cloning for your next project.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[15px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      <ServiceCrossLinks current="/voice-clone" />
    </LandingLayout>
  );
}
